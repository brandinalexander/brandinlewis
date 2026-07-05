const API_HOST = "us.i.posthog.com";
const ASSET_HOST = "us-assets.i.posthog.com";

function stripIngestPrefix(pathname: string): string {
  const stripped = pathname.replace(/^\/ingest\/?/, "/");
  return stripped === "" ? "/" : stripped;
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

async function forwardRequest(request: Request, pathWithSearch: string): Promise<Response> {
  const ip = request.headers.get("CF-Connecting-IP") || "";
  const originHeaders = new Headers(request.headers);
  originHeaders.delete("cookie");
  originHeaders.set("X-Forwarded-For", ip);

  const originRequest = new Request(`https://${API_HOST}${pathWithSearch}`, {
    method: request.method,
    headers: originHeaders,
    body: request.method !== "GET" && request.method !== "HEAD" ? await request.arrayBuffer() : null,
    redirect: request.redirect,
  });

  return fetch(originRequest);
}

/** Proxy PostHog API + SDK assets via same-origin /ingest/* (adblocker evasion). */
export async function proxyPostHogRequest(
  request: Request,
  ctx: ExecutionContext,
): Promise<Response> {
  const url = new URL(request.url);
  const pathname = stripIngestPrefix(url.pathname);
  const pathWithParams = pathname + url.search;

  if (pathname.startsWith("/static/") || pathname.startsWith("/array/")) {
    return retrieveAsset(request, pathWithParams, ctx);
  }

  return forwardRequest(request, pathWithParams);
}
