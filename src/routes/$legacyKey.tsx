import { createFileRoute, notFound, redirect } from "@tanstack/react-router";

// Older QR codes carry the company as the whole path: /<id> or /<id>-<name>
// (first printed for deeplink.tanu.mn). They continue on the company page,
// which opens the app or the store. Anything else here is a normal 404.
const LEGACY_COMPANY = /^([a-f\d]{24})(?:-.*)?$/i;

export const Route = createFileRoute("/$legacyKey")({
  beforeLoad: ({ params }) => {
    const id = params.legacyKey.match(LEGACY_COMPANY)?.[1];
    if (!id) throw notFound();
    throw redirect({
      to: "/company/$companyId",
      params: { companyId: id.toLowerCase() },
      statusCode: 301,
    });
  },
});
