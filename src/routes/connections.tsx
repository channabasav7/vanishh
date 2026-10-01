import { createFileRoute, Link } from "@tanstack/react-router";
import { UserPlus, Users } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { EmptyState } from "@/components/EmptyState";
import { NewChatDialog } from "@/components/NewChatDialog";
import { Button } from "@/components/ui/button";
import { initialsFor } from "@/lib/format";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/connections")({
  head: () => ({
    meta: [
      { title: "Connections — TempChat" },
      { name: "description", content: "People you've connected with on TempChat." },
      { property: "og:title", content: "Connections — TempChat" },
      { property: "og:description", content: "People you've connected with on TempChat." },
    ],
  }),
  component: () => (
    <AppShell>
      <ConnectionsInner />
    </AppShell>
  ),
});

function ConnectionsInner() {
  const { conversations } = useApp();
  const people = conversations.flatMap((c) => c.participants.map((p) => ({ p, c })));

  return (
    <>
      <PageHeader
        eyebrow="People"
        title="Connections"
        description="Everyone you're currently chatting with. Connections fade when chats end."
        action={<NewChatDialog trigger={<Button className="rounded-full"><UserPlus className="size-4" /> Add</Button>} />}
      />
      {people.length === 0 ? (
        <div className="rounded-2xl bg-card ring-1 ring-border"><EmptyState icon={Users} title="No connections yet" description="Scan a QR code to connect." /></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {people.map(({ p, c }) => (
            <div key={p.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-soft ring-1 ring-border">
              <span className="relative grid size-11 place-items-center rounded-full bg-ink font-display font-semibold text-ink-foreground">
                {initialsFor(p.username)}
                <span className={`absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-card ${p.presence === "online" ? "bg-ember" : p.presence === "away" ? "bg-ember-soft" : "bg-border"}`} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">@{p.username}</p>
                <p className="text-xs capitalize text-ink-soft">{p.presence}{c.kind === "group" ? ` · ${c.title}` : ""}</p>
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-full">
                <Link to="/chat/$id" params={{ id: c.id }}>Chat</Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
