import astro from "../dist/_worker.js/index.js";
import { handleContactFormPost } from "./lib/contact-form-handler";
import { proxyPostHogRequest } from "./lib/posthog-proxy";

interface Env {
  ASSETS: Fetcher;
  TURNSTILE_SECRET?: string;
  N8N_WEBHOOK_URL?: string;
  N8N_SHARED_SECRET?: string;
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

    if (pathname === "/api/contact" && request.method === "POST") {
      return handleContactFormPost(request, env);
    }

    const handler = astro as unknown as AstroWorker;
    return handler.fetch(request, env, ctx);
  },
};
