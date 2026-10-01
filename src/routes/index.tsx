import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Flame, QrCode, ShieldCheck, Paperclip, AtSign } from "lucide-react";

import { Brand } from "@/components/Brand";
import { QRVisual } from "@/components/QRCodeCard";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TempChat — Private, temporary chat. No phone number." },
      { name: "description", content: "Pick a username, share a QR code, and chat with messages that burn away on your timer. No phone, no email." },
      { property: "og:title", content: "TempChat — Private, temporary chat" },
      { property: "og:description", content: "Usernames, QR codes and disappearing messages. No phone number or email required." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  { icon: AtSign, title: "Just a username", body: "No phone number, no email. Claim a handle and you're in." },
  { icon: QrCode, title: "Scan to connect", body: "Share your QR in person or as a link. One scan opens a chat." },
  { icon: Flame, title: "Messages burn", body: "Every chat runs on a timer — 5 minutes to 24 hours." },
  { icon: Paperclip, title: "Drop any file", body: "Images, video, audio and docs — and they expire too." },
];

function Landing() {
  return (
    <div className="page-gradient min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <Brand />
        <Button asChild variant="ghost" size="sm">
          <Link to="/start">Open app</Link>
        </Button>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <span className="inline-flex items-center gap-2 rounded-full bg-mist px-3 py-1 text-xs font-medium text-ink-soft ring-1 ring-border">
            <ShieldCheck className="size-3.5 text-ember" /> No phone. No email. No trace.
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Say it.<br />
            <span className="text-ember">Then let it go.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-soft">
            TempChat is private messaging for moments, not archives. Pick a username,
            share your QR, and every message quietly burns away on your timer.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-6">
              <Link to="/start">Get a username <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link to="/scan">Scan a QR</Link>
            </Button>
          </div>
          <ol className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
            {["Get username", "Get QR", "Scan", "Chat"].map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span className="grid size-5 place-items-center rounded-full bg-ink text-[10px] font-semibold text-ink-foreground">{i + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="surface-glass rounded-[2rem] p-6 shadow-glass-lg">
            <div className="flex items-center justify-between">
              <span className="font-display text-sm font-semibold">@quiet_fox42</span>
              <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] font-medium text-ink-foreground">burns in 15:00</span>
            </div>
            <QRVisual value="https://tempchat.app/connect/quiet_fox42" className="mt-5" />
            <p className="mt-4 text-center text-xs text-ink-soft">Scan to start a temporary chat</p>
          </div>
          <div className="absolute -bottom-6 -left-6 hidden rounded-2xl bg-card px-4 py-3 text-sm shadow-glass ring-1 ring-border sm:block">
            <p className="font-medium">Sent you the deck</p>
            <p className="text-xs text-ember">burns in 59:12</p>
          </div>
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl bg-card p-5 shadow-soft ring-1 ring-border"
            >
              <Icon className="size-5 text-ember" />
              <h3 className="mt-4 font-display font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-xs text-ink-soft">
        TempChat — conversations that don't outstay their welcome.
      </footer>
    </div>
  );
}
