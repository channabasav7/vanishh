import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Check, CheckCheck, Clock, Paperclip, Send, Users, AlertCircle, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { AppShell, RealtimeDot } from "@/components/AppShell";
import { AttachmentBody, FilePreview } from "@/components/FilePreview";
import { Countdown, TemporaryTimer } from "@/components/TemporaryTimer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { attachmentKindFor, formatClock, initialsFor } from "@/lib/format";
import type { Attachment, MessageStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/chat/$id")({
  head: () => ({
    meta: [
      { title: "Chat — TempChat" },
      { name: "description", content: "A temporary conversation. Messages burn on a timer." },
      { property: "og:title", content: "Chat — TempChat" },
      { property: "og:description", content: "A temporary conversation on TempChat." },
    ],
  }),
  component: () => (
    <AppShell fullBleed>
      <ChatInner />
    </AppShell>
  ),
});

function StatusIcon({ status }: { status: MessageStatus }) {
  if (status === "sending") return <Clock className="size-3" aria-label="Sending" />;
  if (status === "sent") return <Check className="size-3" aria-label="Sent" />;
  if (status === "failed") return <AlertCircle className="size-3 text-destructive" aria-label="Failed" />;
  return <CheckCheck className={cn("size-3", status === "read" && "text-ember-soft")} aria-label={status} />;
}

function ChatInner() {
  const { id } = Route.useParams();
  const { conversations, messages, loadMessages, sendMessage, setConversationExpiry, expiring } = useApp();
  const convo = conversations.find((c) => c.id === id);
  const list = messages[id] ?? [];
  const [text, setText] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [dragging, setDragging] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { void loadMessages(id); }, [id, loadMessages]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [list.length]);

  const addFiles = (files: FileList | File[]) => {
    const items = Array.from(files).map<Attachment>((f) => ({
      id: Math.random().toString(36).slice(2),
      kind: attachmentKindFor(f.type, f.name),
      name: f.name,
      size: f.size,
      mimeType: f.type,
      url: URL.createObjectURL(f),
      progress: 0,
    }));
    setPending((p) => [...p, ...items]);
    items.forEach((it) => {
      let pct = 0;
      const t = setInterval(() => {
        pct = Math.min(100, pct + 20 + Math.random() * 25);
        setPending((p) => p.map((a) => (a.id === it.id ? { ...a, progress: pct } : a)));
        if (pct >= 100) clearInterval(t);
      }, 180);
    });
  };

  const uploading = pending.some((a) => (a.progress ?? 100) < 100);

  const send = async () => {
    if ((!text.trim() && pending.length === 0) || !convo || uploading) return;
    await sendMessage({
      conversationId: id,
      body: text.trim() || undefined,
      attachments: pending.map(({ progress: _p, ...a }) => a),
      expirySeconds: convo.expirySeconds,
    });
    setText("");
    setPending([]);
  };

  if (!convo) {
    return (
      <div className="grid flex-1 place-items-center p-8 text-center">
        <div>
          <p className="font-display text-lg font-semibold">Chat not found</p>
          <p className="mt-1 text-sm text-ink-soft">It may have already burned away.</p>
          <Button asChild className="mt-4 rounded-full"><Link to="/chats">Back to chats</Link></Button>
        </div>
      </div>
    );
  }

  const other = convo.participants[0];

  return (
    <div
      className="relative flex h-[calc(100vh-4.5rem)] flex-col md:h-screen"
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
    >
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 backdrop-blur-xl sm:px-5">
        <Button asChild variant="ghost" size="icon" className="md:hidden" aria-label="Back">
          <Link to="/chats"><ArrowLeft className="size-5" /></Link>
        </Button>
        <span className="grid size-10 place-items-center rounded-full bg-ink font-display font-semibold text-ink-foreground">
          {convo.kind === "group" ? <Users className="size-4" /> : initialsFor(convo.title)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-semibold">{convo.title}</p>
          <p className="text-xs text-ink-soft">
            {convo.kind === "group" ? `${convo.participants.length + 1} members` : other?.presence === "online" ? "online" : other?.presence === "away" ? "away" : "offline"}
          </p>
        </div>
        <RealtimeDot />
      </header>

      <TemporaryTimer expirySeconds={convo.expirySeconds} onChange={(s) => void setConversationExpiry(id, s)} />

      <div className="scrollbar-slim flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <p className="mx-auto rounded-full bg-mist px-3 py-1 text-[11px] text-ink-soft">Messages in this chat burn automatically. Nothing is kept.</p>
          <AnimatePresence initial={false}>
            {list.map((m) => {
              const mine = m.authorId === "me";
              return (
                <motion.div
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                  className={cn("flex", mine ? "justify-end" : "justify-start", expiring.has(m.id) && "animate-burn-away")}
                >
                  <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5 shadow-soft", mine ? "rounded-br-md bg-ink text-ink-foreground" : "rounded-bl-md bg-card ring-1 ring-border")}>
                    {m.attachments.length > 0 && (
                      <div className="mb-1.5 flex flex-col gap-2">
                        {m.attachments.map((a) => <AttachmentBody key={a.id} attachment={a} outgoing={mine} />)}
                      </div>
                    )}
                    {m.body && <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{m.body}</p>}
                    <div className={cn("mt-1 flex items-center justify-end gap-1.5 text-[10px]", mine ? "text-ink-foreground/60" : "text-ink-soft")}>
                      <Countdown target={m.expiresAt} className="text-ember-soft" />
                      <span>·</span>
                      <span>{formatClock(m.createdAt)}</span>
                      {mine && <StatusIcon status={m.status} />}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
          <div ref={endRef} />
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); void send(); }} className="border-t border-border bg-surface px-4 py-3 backdrop-blur-xl sm:px-5">
        <div className="mx-auto max-w-3xl">
          {pending.length > 0 && (
            <div className="mb-2 grid gap-2 sm:grid-cols-2">
              {pending.map((a) => <FilePreview key={a.id} attachment={a} onRemove={(rid) => setPending((p) => p.filter((x) => x.id !== rid))} />)}
            </div>
          )}
          <div className="flex items-end gap-2">
            <label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-xl text-ink-soft hover:bg-mist" aria-label="Attach files">
              <Paperclip className="size-5" />
              <input type="file" multiple className="sr-only" onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
              rows={1}
              placeholder="Write a message that won't last…"
              className="max-h-40 min-h-11 resize-none rounded-xl"
              aria-label="Message"
            />
            <Button type="submit" size="icon" className="size-11 shrink-0 rounded-xl" disabled={uploading || (!text.trim() && pending.length === 0)} aria-label="Send">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      </form>

      {dragging && (
        <div className="pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-3xl border-2 border-dashed border-ember bg-background/80 backdrop-blur-sm">
          <div className="text-center">
            <UploadCloud className="mx-auto size-10 text-ember" />
            <p className="mt-2 font-display font-semibold">Drop to attach</p>
            <p className="text-xs text-ink-soft">Files burn with the chat</p>
          </div>
        </div>
      )}
    </div>
  );
}
