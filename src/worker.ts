type AssetFetcher = {
  fetch: (request: Request) => Promise<Response>;
};

type Env = {
  ASSETS: AssetFetcher;
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Try to serve a static asset first.
    const assetResponse = await env.ASSETS.fetch(request);

    // If it's found (or not a 404), return it as-is.
    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    // SPA fallback: for non-asset routes, return index.html
    const url = new URL(request.url);

    // If the request looks like it targets a file, keep the 404.
    // (e.g. /assets/app.js, /favicon.ico)
    const lastSegment = url.pathname.split("/").pop() ?? "";
    if (lastSegment.includes(".")) {
      return assetResponse;
    }

    url.pathname = "/index.html";
    const indexRequest = new Request(url.toString(), request);
    return env.ASSETS.fetch(indexRequest);
  },
};
