import { createFileRoute } from "@tanstack/react-router";
import { BranchesPage } from "@/components/dashboard/pages/BranchesPage";

export const Route = createFileRoute("/business/dashboard/branches/")({
  head: () => ({ meta: [{ title: "Салбарууд — Tanu Business" }] }),
  component: BranchesPage,
});
