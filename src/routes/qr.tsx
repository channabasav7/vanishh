import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanLine } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { QRCodeCard } from "@/components/QRCodeCard";
import { Button } from "@/components/ui/button";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "My QR code — TempChat" },
      { name: "description", content: "Share your TempChat QR code so others can start a chat with you." },
      { property: "og:title", content: "My QR code — TempChat" },
      { property: "og:description", content: "Share your QR so others can start a temporary chat." },
    ],
  }),
  component: () => (
    <AppShell>
      <QrInner />
    </AppShell>
  ),
});

function QrInner() {
  const { profile } = useApp();
  return (
    <>
      <PageHeader
        eyebrow="Step 2 — share"
        title="Your QR code"
        description="Anyone who scans this lands straight in a temporary chat with you."
        action={<Button asChild variant="outline" className="rounded-full"><Link to="/scan"><ScanLine className="size-4" /> Scan theirs</Link></Button>}
      />
      <div className="mx-auto w-full max-w-md">
        <QRCodeCard username={profile!.username} />
      </div>
    </>
  );
}
