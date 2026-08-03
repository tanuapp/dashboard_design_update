import { createFileRoute } from "@tanstack/react-router";
import { PerformancePage } from "@/components/dashboard/pages/PerformancePage";

export const Route = createFileRoute("/business/dashboard/performance")({
  head: () => ({ meta: [{ title: "Миний гүйцэтгэл — Tanu Business" }] }),
  component: PerformancePage,
});
