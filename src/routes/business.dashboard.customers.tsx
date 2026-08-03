import { createFileRoute } from "@tanstack/react-router";
import { CustomersPage } from "@/components/dashboard/pages/CustomersPage";

export const Route = createFileRoute("/business/dashboard/customers")({
  head: () => ({ meta: [{ title: "Хэрэглэгчид — Tanu Business" }] }),
  component: CustomersPage,
});
