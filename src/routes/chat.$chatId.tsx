import { createFileRoute, useParams } from "@tanstack/react-router";
import { ChatView } from "@/components/ChatView";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/chat/$chatId")({
  component: ChatPage,
});

function ChatPage() {
  const { chatId } = useParams({ from: "/chat/$chatId" });
  return (
    <AppShell>
      <ChatView chatId={chatId} key={chatId} />
    </AppShell>
  );
}
