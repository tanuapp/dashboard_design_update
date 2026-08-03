import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "@/components/dashboard/pages/SchedulePage";

export const Route = createFileRoute("/business/dashboard/schedule")({
  head: () => ({ meta: [{ title: "Чөлөө, хуваарь — Tanu Business" }] }),
  component: SchedulePage,
});
