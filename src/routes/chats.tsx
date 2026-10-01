import { createFileRoute, Link } from "@tanstack/react-router";
import { MessageSquarePlus, QrCode, ScanLine, Search, Users } from "lucide-react";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { NewChatDialog } from "@/components/NewChatDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatExpiryLabel, formatRelative, initialsFor } from "@/lib/format";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/chats")({
  head: () => ({
    meta: [
      { title: "Chats — TempChat" },
      { name: "description", content: "Your active temporary conversations." },
      { property: "og:title", content: "Chats — TempChat" },
      { property: "og:description", content: "Your active temporary conversations." },
    ],
  }),
  component: ChatsPage,
});

function ChatsPage() {
  return (
    <AppShell>
      <ChatsInner />
    </AppShell>
  );
}

function ChatsInner() {
  const { conversations, conversationsLoading, profile } = useApp();
  const [q, setQ] = useState("");
  const list = conversations.filter((c) => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <PageHeader
        eyebrow={`Hi, @${profile?.username}`}
        title="Chats"
        description="Everything here is temporary. Messages burn on each chat's timer."
        action={<NewChatDialog trigger={<Button className="rounded-full"><MessageSquarePlus className="size-4" /> New chat</Button>} />}
      />

      <div className="mb-6 grid grid-cols-3 gap-3">
        {[
          { to: "/qr", icon: QrCode, label: "Show my QR" },
          { to: "/scan", icon: ScanLine, label: "Scan a QR" },
          { to: "/connections", icon: Users, label: "Connections" },
        ].map(({ to, icon: Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-start gap-3 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border transition hover:-translate-y-0.5 hover:shadow-glass">
            <Icon className="size-5 text-ember" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-soft" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chats" className="h-11 rounded-xl pl-10" aria-label="Search chats" />
      </div>

      <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
        {conversationsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 border-b border-border p-4 last:border-0">
              <Skeleton className="size-11 rounded-full" />
              <div className="flex-1 space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-48" /></div>
            </div>
          ))
        ) : list.length === 0 ? (
          <EmptyState icon={MessageSquarePlus} title="No chats yet" description="Share your QR or scan someone's to start a temporary conversation." />
        ) : (
          list.map((c) => {
            const p = c.participants[0];
            return (
              <Link key={c.id} to="/chat/$id" params={{ id: c.id }} className="flex items-center gap-3 border-b border-border p-4 transition-colors last:border-0 hover:bg-mist">
                <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-ink font-display font-semibold text-ink-foreground">
                  {c.kind === "group" ? <Users className="size-4" /> : initialsFor(c.title)}
                  {c.kind === "direct" && p?.presence === "online" && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-ember ring-2 ring-card" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate font-medium">{c.title}</p>
                    <span className="shrink-0 text-xs text-ink-soft">{formatRelative(c.lastActivityAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-ink-soft">Burns after {formatExpiryLabel(c.expirySeconds)}</p>
                    {c.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-ember px-1.5 text-[11px] font-semibold text-primary-foreground">{c.unread}</span>}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </>
  );
}
