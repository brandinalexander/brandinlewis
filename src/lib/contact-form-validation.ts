const MAX_SHORT_FIELD = 256;
const MAX_MESSAGE = 5000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_ORIGINS = new Set([
  "https://brandinlewis.com",
  "http://localhost:4321",
  "http://localhost:8787",
  "http://127.0.0.1:4321",
  "http://127.0.0.1:8787",
]);

export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get("Origin");
  if (origin) {
    return ALLOWED_ORIGINS.has(origin);
  }

  const referer = request.headers.get("Referer");
  if (!referer) {
    return false;
  }

  try {
    return ALLOWED_ORIGINS.has(new URL(referer).origin);
  } catch {
    return false;
  }
}

function readBoundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength) {
    return null;
  }

  return trimmed;
}

export interface ValidatedContactFields {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
  turnstileToken: string;
}

export type ContactValidationResult =
  | { ok: true; fields: ValidatedContactFields }
  | { ok: false; error: string; status: number };

export function validateContactPayload(
  payload: Record<string, unknown>,
): ContactValidationResult {
  const website = readBoundedString(payload.website, 256);
  if (website) {
    return { ok: false, error: "honeypot", status: 200 };
  }

  const name = readBoundedString(payload.name, MAX_SHORT_FIELD);
  const email = readBoundedString(payload.email, MAX_SHORT_FIELD);
  const company = readBoundedString(payload.company, MAX_SHORT_FIELD);
  const phone = readBoundedString(payload.phone, MAX_SHORT_FIELD);
  const message = readBoundedString(payload.message, MAX_MESSAGE);
  const turnstileToken = readBoundedString(payload.turnstileToken, 2048) ?? "";

  if (!name || !email || !company || !phone || !message) {
    return { ok: false, error: "All fields are required.", status: 400 };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Please enter a valid email address.", status: 400 };
  }

  return {
    ok: true,
    fields: { name, email, company, phone, message, turnstileToken },
  };
}

export function isHoneypotResponse(result: ContactValidationResult): boolean {
  return !result.ok && result.error === "honeypot" && result.status === 200;
}
