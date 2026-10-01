import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { AttachmentIcon } from "@/components/FilePreview";
import { Countdown } from "@/components/TemporaryTimer";
import { formatBytes } from "@/lib/format";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Shared files — TempChat" },
      { name: "description", content: "Files shared in your temporary chats, with their burn timers." },
      { property: "og:title", content: "Shared files — TempChat" },
      { property: "og:description", content: "Every file you share on TempChat expires too." },
    ],
  }),
  component: () => (
    <AppShell>
      <FilesInner />
    </AppShell>
  ),
});

function FilesInner() {
  const { messages, conversations } = useApp();
  const files = Object.values(messages)
    .flat()
    .flatMap((m) => m.attachments.map((a) => ({ a, m })))
    .sort((x, y) => y.m.createdAt - x.m.createdAt);

  return (
    <>
      <PageHeader eyebrow="Library" title="Shared files" description="Drag files into any chat to share them. They burn when the message does." />
      {files.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border">
          <EmptyState icon={FolderOpen} title="No files right now" description="Open a chat and drop in images, video, audio or documents." />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {files.map(({ a, m }) => {
            const c = conversations.find((x) => x.id === m.conversationId);
            return (
              <Link key={a.id} to="/chat/$id" params={{ id: m.conversationId }} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border transition hover:shadow-glass">
                <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-mist">
                  {a.kind === "image" && a.url ? <img src={a.url} alt="" className="size-full object-cover" /> : <AttachmentIcon kind={a.kind} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{a.name}</p>
                  <p className="truncate text-xs text-ink-soft">{formatBytes(a.size)} · {c?.title ?? "chat"}</p>
                </div>
                <Countdown target={m.expiresAt} className="text-xs font-medium text-ember" />
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
