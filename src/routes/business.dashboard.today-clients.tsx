import { createFileRoute } from "@tanstack/react-router";
import { TodayClientsPage } from "@/components/dashboard/pages/TodayClientsPage";

export const Route = createFileRoute("/business/dashboard/today-clients")({
  head: () => ({ meta: [{ title: "Өнөөдрийн үйлчлүүлэгчид — Tanu Business" }] }),
  component: TodayClientsPage,
});
