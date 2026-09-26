import { createFileRoute, redirect } from "@tanstack/react-router";

// Links an earlier dashboard printed as tanu.mn/book/<name>: the company page
// resolves the name (including the old Cyrillic form) to its slug.
export const Route = createFileRoute("/book/$slug")({
  beforeLoad: ({ params }) => {
    throw redirect({
      to: "/company/$companyId",
      params: { companyId: params.slug },
      statusCode: 301,
    });
  },
});
