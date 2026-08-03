import { createFileRoute } from "@tanstack/react-router";
import { PersonalProfilePage } from "@/components/dashboard/pages/PersonalProfilePage";

export const Route = createFileRoute("/business/dashboard/profile")({
  head: () => ({ meta: [{ title: "Миний профайл — Tanu Business" }] }),
  component: PersonalProfilePage,
});
