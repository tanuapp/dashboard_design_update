import { createFileRoute } from "@tanstack/react-router";
import { ServicesPage } from "@/components/dashboard/pages/ServicesPage";

export const Route = createFileRoute("/business/dashboard/services")({
  head: () => ({ meta: [{ title: "Үйлчилгээнүүд — Tanu Business" }] }),
  component: ServicesPage,
});
