import { createFileRoute } from "@tanstack/react-router";
import { EmployeeDetailPage } from "@/components/dashboard/pages/EmployeeDetailPage";

export const Route = createFileRoute("/business/dashboard/employees/$employeeId")({
  head: () => ({ meta: [{ title: "Ажилтны мэдээлэл — Tanu Business" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { employeeId } = Route.useParams();
  return <EmployeeDetailPage employeeId={employeeId} />;
}
