import astro from "../dist/_worker.js/index.js";
import { proxyPostHogRequest } from "./lib/posthog-proxy";

interface Env {
  ASSETS: Fetcher;
  [key: string]: unknown;
}

type AstroWorker = {
  fetch: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>;
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/ingest" || pathname.startsWith("/ingest/")) {
      return proxyPostHogRequest(request, ctx);
    }

    const handler = astro as unknown as AstroWorker;
    return handler.fetch(request, env, ctx);
  },
};
