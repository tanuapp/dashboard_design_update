import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

const CUSTOMER_APP_ID = "X773389H5L.com.tanusoft.tanubooking";

/**
 * Authorizes only the TANU customer app for event and company Universal Links.
 *
 * www.tanu.mn is the deep-link domain: shared company and event links, QR
 * codes and the app all use it. Serving this in code guarantees the
 * extensionless response has Apple's required JSON content type and does not
 * redirect; listing only the customer app also revokes the old Business app's
 * link association when Apple's cache refreshes.
 */
function appleAppSiteAssociation(request: Request): Response | null {
  const { pathname } = new URL(request.url);
  if (
    pathname !== "/.well-known/apple-app-site-association" &&
    pathname !== "/apple-app-site-association"
  ) {
    return null;
  }

  return Response.json(
    {
      applinks: {
        apps: [],
        details: [
          {
            appID: CUSTOMER_APP_ID,
            paths: ["/event/*", "/company/*"],
          },
        ],
      },
    },
    {
      headers: {
        "cache-control": "public, max-age=3600",
        "content-type": "application/json; charset=utf-8",
      },
    },
  );
}

/**
 * tanu.mn -> www.tanu.mn, except the app-association files. Apple and Google
 * never follow a redirect when they fetch those, and the released iOS app
 * claims the bare tanu.mn, so they must be answered on the apex itself. Takes
 * effect once the Vercel domain for tanu.mn serves this project instead of
 * redirecting on its own.
 */
function apexRedirect(request: Request): Response | null {
  const url = new URL(request.url);
  if (url.hostname !== "tanu.mn") return null;
  if (url.pathname.startsWith("/.well-known/") || url.pathname === "/apple-app-site-association") {
    return null;
  }
  url.hostname = "www.tanu.mn";
  url.protocol = "https:";
  return Response.redirect(url.toString(), 308);
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const association = appleAppSiteAssociation(request);
      if (association) return association;
      const apex = apexRedirect(request);
      if (apex) return apex;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
