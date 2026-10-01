import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { QRCodeCard } from "@/components/QRCodeCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { initialsFor } from "@/lib/format";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile — TempChat" },
      { name: "description", content: "Your TempChat username, status and QR code." },
      { property: "og:title", content: "Profile — TempChat" },
      { property: "og:description", content: "Your TempChat username, status and QR code." },
    ],
  }),
  component: () => (
    <AppShell>
      <ProfileInner />
    </AppShell>
  ),
});

function ProfileInner() {
  const { profile, setProfile } = useApp();
  const navigate = useNavigate();
  const [status, setStatus] = useState(profile!.status);

  return (
    <>
      <PageHeader eyebrow="You" title="Profile" />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl bg-card p-6 shadow-soft ring-1 ring-border">
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-2xl bg-ink font-display text-2xl font-semibold text-ink-foreground">{initialsFor(profile!.username)}</span>
            <div>
              <p className="font-display text-2xl font-semibold">@{profile!.username}</p>
              <p className="text-xs text-ink-soft">Since {new Date(profile!.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <form className="mt-8 space-y-2" onSubmit={(e) => { e.preventDefault(); setProfile({ ...profile!, status }); toast.success("Status updated"); }}>
            <Label htmlFor="status">Status</Label>
            <div className="flex gap-2">
              <Input id="status" value={status} maxLength={60} onChange={(e) => setStatus(e.target.value)} className="h-11 rounded-xl" />
              <Button type="submit" className="h-11 rounded-xl">Save</Button>
            </div>
          </form>
          <div className="mt-10 border-t border-border pt-6">
            <p className="text-sm font-medium">Leave TempChat</p>
            <p className="mt-1 text-xs text-ink-soft">Releases your username from this device. Nothing else is stored.</p>
            <Button variant="outline" className="mt-4 rounded-xl text-destructive" onClick={() => { setProfile(null); void navigate({ to: "/" }); }}>
              <LogOut className="size-4" /> Release username
            </Button>
          </div>
        </section>
        <QRCodeCard username={profile!.username} compact />
      </div>
    </>
  );
}
