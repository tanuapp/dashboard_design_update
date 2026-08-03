import { createFileRoute } from "@tanstack/react-router";
import { NotificationsPage } from "@/components/dashboard/pages/NotificationsPage";

export const Route = createFileRoute("/business/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Мэдэгдэл — Tanu Business" }] }),
  component: NotificationsPage,
});
