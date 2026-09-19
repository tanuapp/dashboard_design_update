import { useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { DashboardDataProvider } from "@/lib/dashboard/store";
import { ChatPage } from "@/components/dashboard/pages/ChatPage";

export const Route = createFileRoute("/business/chat")({
  head: () => ({
    meta: [
      { title: "Messenger — TANU Business" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    conversation: typeof search.conversation === "string" ? search.conversation : undefined,
  }),
  component: StandaloneBusinessChat,
});

function StandaloneBusinessChat() {
  const { session, ready } = useAuth();
  const { conversation } = Route.useSearch();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !session) navigate({ to: "/login" });
  }, [ready, session, navigate]);

  if (!ready || !session) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <DashboardDataProvider initialRole={session.role}>
      <ChatPage standalone initialConversationId={conversation} />
    </DashboardDataProvider>
  );
}
