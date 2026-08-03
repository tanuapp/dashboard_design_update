import { createFileRoute } from "@tanstack/react-router";
import { BookingsPage } from "@/components/dashboard/pages/BookingsPage";

export const Route = createFileRoute("/business/dashboard/bookings")({
  head: () => ({ meta: [{ title: "Захиалгууд — Tanu Business" }] }),
  component: BookingsPage,
});
