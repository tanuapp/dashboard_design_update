import { createFileRoute } from "@tanstack/react-router";
import { OwnerOnlyGuard } from "@/components/dashboard/OwnerOnlyGuard";
import { QrPromotionPage } from "@/components/dashboard/pages/QrPromotionPage";

export const Route = createFileRoute("/business/dashboard/qr-promotion")({
  head: () => ({ meta: [{ title: "QR сурталчилгаа — Tanu Business" }] }),
  component: () => (
    <OwnerOnlyGuard>
      <QrPromotionPage />
    </OwnerOnlyGuard>
  ),
});
