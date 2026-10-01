import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { getClient } from "@/services/tempchat-client";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/connect/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `Chat with @${params.username} — TempChat` },
      { name: "description", content: `Start a temporary, private chat with @${params.username} on TempChat.` },
      { property: "og:title", content: `Chat with @${params.username} — TempChat` },
      { property: "og:description", content: "Messages burn away on a timer. No phone number needed." },
    ],
  }),
  component: ConnectPage,
});

function ConnectPage() {
  const { username } = Route.useParams();
  const { hydrated, profile, addConversation } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (!profile) {
      void navigate({ to: "/start" });
      return;
    }
    void getClient().openConversationWith(username).then((c) => {
      addConversation(c);
      void navigate({ to: "/chat/$id", params: { id: c.id }, replace: true });
    });
  }, [hydrated, profile, username, navigate, addConversation]);

  return (
    <div className="page-gradient grid min-h-screen place-items-center">
      <div className="text-center">
        <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-border border-t-ember" />
        <p className="mt-4 text-sm text-ink-soft">Opening chat with @{username}…</p>
      </div>
    </div>
  );
}
