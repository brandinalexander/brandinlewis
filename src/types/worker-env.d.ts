/// <reference types="@cloudflare/workers-types" />

/** Astro build output — exists only after `astro build`. */
declare module "../dist/_worker.js/index.js" {
  type AstroWorkerHandler = {
    fetch: (
      request: Request,
      env: { ASSETS: Fetcher; [key: string]: unknown },
      ctx: ExecutionContext,
    ) => Promise<Response>;
  };

  const handler: AstroWorkerHandler;
  export default handler;
}
