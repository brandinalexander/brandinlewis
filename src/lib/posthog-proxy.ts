const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

const ALLOWED_METHODS = new Set(["GET", "POST", "OPTIONS"]);

/** PostHog SDK API paths (after stripping /ingest prefix). */
const ALLOWED_API_PATHS = /^\/(?:e|batch|capture|decide|s)(?:\/|$)/;

function stripIngestPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/ingest\/?/, "/");
  return stripped === "" ? "/" : stripped;
}

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

function methodNotAllowed(): Response {
  return new Response("Method Not Allowed", { status: 405 });
}

function isAllowedApiPath(pathname: string): boolean {
  if (pathname.startsWith("/static/") || pathname.startsWith("/array/")) {
    return true;
  }
  return ALLOWED_API_PATHS.test(pathname);
}

async function retrieveAsset(
  request: Request,
  pathname: string,
  ctx: ExecutionContext,
): Promise<Response> {
  const cache = caches as unknown as { default: Cache };
  let response = await cache.default.match(request);
  if (!response) {
    response = await fetch(`https://${ASSET_HOST}${pathname}`);
    ctx.waitUntil(cache.default.put(request, response.clone()));
  }
  return response;
}

function buildForwardHeaders(request: Request, ip: string): Headers {
  const headers = new Headers();
  const contentType = request.headers.get("Content-Type");
  const userAgent = request.headers.get("User-Agent");

  if (contentType) {
    headers.set("Content-Type", contentType);
  }
  if (userAgent) {
    headers.set("User-Agent", userAgent);
  }
  if (ip) {
    headers.set("X-Forwarded-For", ip);
  }

  return headers;
}

async function forwardRequest(request: Request, pathWithSearch: string): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const originRequest = new Request(`https://${API_HOST}${pathWithSearch}`, {
    method: request.method,
    headers: buildForwardHeaders(request, ip),
    body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : null,
    redirect: "manual",
  });

  return fetch(originRequest);
}

/** Proxy PostHog API + SDK assets via same-origin /ingest/* (adblocker evasion). */
export async function proxyPostHogRequest(
  request: Request,
  ctx: ExecutionContext,
): Promise<Response> {
  if (!ALLOWED_METHODS.has(request.method)) {
    return methodNotAllowed();
  }

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const url = new URL(request.url);
  const pathname = stripIngestPrefix(url.pathname);
  const pathWithParams = pathname + url.search;

  if (!isAllowedApiPath(pathname)) {
    return notFound();
  }

  if (pathname.startsWith("/static/") || pathname.startsWith("/array/")) {
    return retrieveAsset(request, pathWithParams, ctx);
  }

  return forwardRequest(request, pathWithParams);
}
