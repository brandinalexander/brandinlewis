import {
  isAllowedOrigin,
  isHoneypotResponse,
  validateContactPayload,
} from "./contact-form-validation";
import { sanitizeContactFields } from "./contact-form-sanitize";

export interface ContactFormEnv {
  TURNSTILE_SECRET?: string;
  N8N_WEBHOOK_URL?: string;
  N8N_SHARED_SECRET?: string;
}

interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
}

function jsonResponse(body: Record<string, unknown>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const body = new URLSearchParams({
    secret,
    response: token,
    remoteip: ip,
  });

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    return false;
  }

  const result = (await response.json()) as TurnstileVerifyResponse;
  return result.success === true;
}

function clientIp(request: Request): string {
  return (
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    ""
  );
}

export async function handleContactFormPost(
  request: Request,
  env: ContactFormEnv,
): Promise<Response> {
  if (!isAllowedOrigin(request)) {
    return jsonResponse({ ok: false, error: "Forbidden." }, 403);
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request body." }, 400);
  }

  const validation = validateContactPayload(payload);
  if (!validation.ok) {
    if (isHoneypotResponse(validation)) {
      return jsonResponse({ ok: true }, 200);
    }
    return jsonResponse({ ok: false, error: validation.error }, validation.status);
  }

  const { name, email, company, phone, message, turnstileToken } = validation.fields;

  if (!env.TURNSTILE_SECRET) {
    return jsonResponse({ ok: false, error: "Form is not configured yet. Please try again later." }, 503);
  }

  if (!turnstileToken) {
    return jsonResponse({ ok: false, error: "Please complete the verification check." }, 400);
  }

  const verified = await verifyTurnstile(env.TURNSTILE_SECRET, turnstileToken, clientIp(request));
  if (!verified) {
    return jsonResponse({ ok: false, error: "Verification failed. Please try again." }, 403);
  }

  if (!env.N8N_WEBHOOK_URL || !env.N8N_SHARED_SECRET) {
    return jsonResponse({ ok: false, error: "Form is not configured yet. Please try again later." }, 503);
  }

  const safe = sanitizeContactFields({ name, email, company, phone, message });

  const n8nBody = {
    timestamp: new Date().toISOString(),
    name: safe.name,
    email: safe.email,
    company: safe.company,
    phone: safe.phone,
    message: safe.message,
    source: "brandinlewis.com",
  };

  const n8nResponse = await fetch(env.N8N_WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-contact-secret": env.N8N_SHARED_SECRET,
    },
    body: JSON.stringify(n8nBody),
  });

  if (!n8nResponse.ok) {
    return jsonResponse({ ok: false, error: "Something went wrong while submitting the form." }, 502);
  }

  return jsonResponse({ ok: true }, 200);
}
