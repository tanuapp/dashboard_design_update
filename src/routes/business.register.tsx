import { createFileRoute } from "@tanstack/react-router";
import { BusinessSignupPage } from "@/components/onboarding/BusinessSignupPage";

export const Route = createFileRoute("/business/register")({
  head: () => ({
    meta: [{ title: "Байгууллага бүртгүүлэх — Tanu Business" }],
  }),
  component: BusinessSignupPage,
});
