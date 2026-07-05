export interface ContactFormEnv {
  TURNSTILE_SECRET?: string;
  N8N_WEBHOOK_URL?: string;
  N8N_SHARED_SECRET?: string;
}

export interface ContactFormPayload {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  turnstileToken?: string;
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

export async function handleContactFormPost(
  request: Request,
  env: ContactFormEnv,
): Promise<Response> {
  let payload: ContactFormPayload;

  try {
    payload = (await request.json()) as ContactFormPayload;
  } catch {
    return jsonResponse({ ok: false, error: "Invalid request body." }, 400);
  }

  const name = payload.name?.trim();
  const email = payload.email?.trim();
  const company = payload.company?.trim();
  const phone = payload.phone?.trim();
  const message = payload.message?.trim();

  if (!name || !email || !company || !phone || !message) {
    return jsonResponse({ ok: false, error: "All fields are required." }, 400);
  }

  if (env.TURNSTILE_SECRET) {
    const token = payload.turnstileToken?.trim();
    if (!token) {
      return jsonResponse({ ok: false, error: "Please complete the verification check." }, 400);
    }

    const clientIp =
      request.headers.get("CF-Connecting-IP") ??
      request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "";

    const verified = await verifyTurnstile(env.TURNSTILE_SECRET, token, clientIp);
    if (!verified) {
      return jsonResponse({ ok: false, error: "Verification failed. Please try again." }, 403);
    }
  }

  if (!env.N8N_WEBHOOK_URL || !env.N8N_SHARED_SECRET) {
    return jsonResponse({ ok: false, error: "Form is not configured yet. Please try again later." }, 503);
  }

  const n8nBody = {
    timestamp: new Date().toISOString(),
    name,
    email,
    company,
    phone,
    message,
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
