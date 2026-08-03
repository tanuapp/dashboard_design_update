import { createFileRoute } from "@tanstack/react-router";
import { BranchDetailPage } from "@/components/dashboard/pages/BranchDetailPage";

export const Route = createFileRoute("/business/dashboard/branches/$branchId")({
  head: () => ({ meta: [{ title: "Салбарын мэдээлэл — Tanu Business" }] }),
  component: RouteComponent,
});

function RouteComponent() {
  const { branchId } = Route.useParams();
  return <BranchDetailPage branchId={branchId} />;
}
