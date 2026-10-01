import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, Shuffle, X } from "lucide-react";
import { useEffect, useState } from "react";

import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClient } from "@/services/tempchat-client";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: "Claim your username — TempChat" },
      { name: "description", content: "Pick a unique TempChat username. No phone number or email needed." },
      { property: "og:title", content: "Claim your username — TempChat" },
      { property: "og:description", content: "Pick a unique username and start chatting in seconds." },
    ],
  }),
  component: StartPage,
});

const VALID = /^[a-z0-9_]{3,20}$/;

function StartPage() {
  const client = getClient();
  const navigate = useNavigate();
  const { profile, hydrated, setProfile } = useApp();
  const [name, setName] = useState("");
  const [state, setState] = useState<"idle" | "checking" | "ok" | "taken" | "invalid">("idle");
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (hydrated && profile) void navigate({ to: "/chats" });
  }, [hydrated, profile, navigate]);

  useEffect(() => {
    if (!name) return setState("idle");
    if (!VALID.test(name)) return setState("invalid");
    setState("checking");
    let live = true;
    const t = setTimeout(async () => {
      const { available } = await client.checkUsername(name);
      if (live) setState(available ? "ok" : "taken");
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [name, client]);

  const claim = async () => {
    if (state !== "ok") return;
    setClaiming(true);
    const p = await client.claimUsername(name);
    setProfile(p);
    void navigate({ to: "/qr" });
  };

  const hint = {
    idle: "3–20 characters: lowercase letters, numbers, underscores.",
    checking: "Checking availability…",
    ok: "Available — it's yours if you want it.",
    taken: "Already taken. Try another.",
    invalid: "Use 3–20 lowercase letters, numbers or underscores.",
  }[state];

  return (
    <div className="page-gradient flex min-h-screen flex-col">
      <header className="px-5 py-5 sm:px-8"><Brand /></header>
      <div className="flex flex-1 items-center justify-center px-5 pb-20">
        <div className="surface-glass w-full max-w-md rounded-3xl p-7 shadow-glass-lg animate-rise-in sm:p-9">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">Step 1 of 2</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight">Pick your handle</h1>
          <p className="mt-2 text-sm text-ink-soft">This is the only thing people need to find you.</p>

          <form className="mt-7" onSubmit={(e) => { e.preventDefault(); void claim(); }}>
            <label htmlFor="username" className="sr-only">Username</label>
            <div className="relative">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-display text-lg text-ink-soft">@</span>
              <Input
                id="username"
                autoFocus
                autoComplete="off"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s/g, ""))}
                className="h-14 rounded-2xl pl-9 pr-12 font-display text-lg"
                placeholder="your_name"
                aria-describedby="username-hint"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2">
                {state === "checking" && <Loader2 className="size-5 animate-spin text-ink-soft" />}
                {state === "ok" && <Check className="size-5 text-ember" />}
                {(state === "taken" || state === "invalid") && <X className="size-5 text-destructive" />}
              </span>
            </div>
            <p id="username-hint" aria-live="polite" className={`mt-2 text-xs ${state === "taken" || state === "invalid" ? "text-destructive" : "text-ink-soft"}`}>{hint}</p>

            <div className="mt-6 flex gap-2">
              <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={async () => setName(await client.suggestUsername())}>
                <Shuffle className="size-4" /> Suggest
              </Button>
              <Button type="submit" className="h-12 flex-1 rounded-xl" disabled={state !== "ok" || claiming}>
                {claiming ? <Loader2 className="size-4 animate-spin" /> : "Claim & get my QR"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
