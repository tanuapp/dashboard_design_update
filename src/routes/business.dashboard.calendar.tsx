import { createFileRoute } from "@tanstack/react-router";
import { CalendarPage } from "@/components/dashboard/pages/CalendarPage";

export const Route = createFileRoute("/business/dashboard/calendar")({
  head: () => ({ meta: [{ title: "Календарь — Tanu Business" }] }),
  component: CalendarPage,
});
