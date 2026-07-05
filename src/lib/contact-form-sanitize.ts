/** Escape user content before forwarding to n8n (email HTML + Google Sheets). */
export function htmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Prevent Google Sheets formula injection for values starting with = + - @ */
export function sheetsSafe(value: string): string {
  if (/^[=+\-@]/.test(value)) {
    return `'${value}`;
  }
  return value;
}

export function sanitizeContactField(value: string): string {
  return sheetsSafe(htmlEscape(value));
}

export interface SanitizedContactFields {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}

export function sanitizeContactFields(fields: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): SanitizedContactFields {
  return {
    name: sanitizeContactField(fields.name),
    email: sanitizeContactField(fields.email),
    company: sanitizeContactField(fields.company),
    phone: sanitizeContactField(fields.phone),
    message: sanitizeContactField(fields.message),
  };
}
