import { createFileRoute } from "@tanstack/react-router";
import { EmployeesPage } from "@/components/dashboard/pages/EmployeesPage";

export const Route = createFileRoute("/business/dashboard/employees/")({
  head: () => ({ meta: [{ title: "Ажилтнууд — Tanu Business" }] }),
  component: EmployeesPage,
});
