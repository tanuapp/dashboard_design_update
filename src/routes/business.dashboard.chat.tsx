import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/business/dashboard/chat")({
  head: () => ({ meta: [{ title: "Чат — Tanu Business" }] }),
  component: LegacyChatRedirect,
});

function LegacyChatRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate({ to: "/business/chat", replace: true });
  }, [navigate]);

  return null;
}
