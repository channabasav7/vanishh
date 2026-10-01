import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, CameraOff, ImageUp, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClient } from "@/services/tempchat-client";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/scan")({
  head: () => ({
    meta: [
      { title: "Scan a QR — TempChat" },
      { name: "description", content: "Scan someone's TempChat QR code to open a chat instantly." },
      { property: "og:title", content: "Scan a QR — TempChat" },
      { property: "og:description", content: "Scan a QR code to open a temporary chat instantly." },
    ],
  }),
  component: () => (
    <AppShell>
      <ScanInner />
    </AppShell>
  ),
});

function usernameFrom(text: string): string | null {
  const m = text.match(/\/connect\/([a-z0-9_]{3,20})/i);
  if (m) return m[1];
  const h = text.trim().replace(/^@/, "");
  return /^[a-z0-9_]{3,20}$/i.test(h) ? h : null;
}

function ScanInner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cam, setCam] = useState<"idle" | "starting" | "on" | "denied">("idle");
  const [manual, setManual] = useState("");
  const [opening, setOpening] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);
  const { addConversation } = useApp();
  const navigate = useNavigate();

  const open = async (raw: string) => {
    const handle = usernameFrom(raw);
    if (!handle) return toast.error("That QR isn't a TempChat code.");
    stopRef.current?.();
    setOpening(true);
    const c = await getClient().openConversationWith(handle);
    addConversation(c);
    toast.success(`Connected with @${handle}`);
    void navigate({ to: "/chat/$id", params: { id: c.id } });
  };

  const start = async () => {
    setCam("starting");
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader();
      const controls = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (result) void open(result.getText());
      });
      stopRef.current = () => controls.stop();
      setCam("on");
    } catch {
      setCam("denied");
    }
  };

  useEffect(() => () => stopRef.current?.(), []);

  const fromImage = async (file: File) => {
    try {
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const url = URL.createObjectURL(file);
      const res = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      URL.revokeObjectURL(url);
      void open(res.getText());
    } catch {
      toast.error("No QR code found in that image.");
    }
  };

  return (
    <>
      <PageHeader eyebrow="Connect" title="Scan a QR" description="Point your camera at a TempChat QR code. The chat opens instantly." />
      <div className="mx-auto grid w-full max-w-md gap-5">
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-ink shadow-glass-lg">
          <video ref={videoRef} className="size-full object-cover" muted playsInline />
          {cam !== "on" && (
            <div className="absolute inset-0 grid place-items-center p-8 text-center text-ink-foreground">
              <div>
                {cam === "denied" ? <CameraOff className="mx-auto size-8 text-ember-soft" /> : <Camera className="mx-auto size-8 text-ember-soft" />}
                <p className="mt-3 text-sm opacity-80">
                  {cam === "denied" ? "Camera unavailable. Upload an image or type the username below." : "Camera access is needed to scan."}
                </p>
                {cam !== "denied" && (
                  <Button onClick={start} className="mt-5 rounded-full" disabled={cam === "starting"}>
                    {cam === "starting" ? <Loader2 className="size-4 animate-spin" /> : "Start camera"}
                  </Button>
                )}
              </div>
            </div>
          )}
          {cam === "on" && (
            <>
              <div className="pointer-events-none absolute inset-10 rounded-2xl ring-2 ring-ember/70" />
              <span className="animate-qr-scan pointer-events-none absolute inset-x-10 top-10 h-0.5 bg-ember" />
            </>
          )}
          {opening && <div className="absolute inset-0 grid place-items-center bg-ink/70"><Loader2 className="size-8 animate-spin text-ember-soft" /></div>}
        </div>

        <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card p-4 text-sm text-ink-soft hover:bg-mist">
          <ImageUp className="size-4" /> Upload a QR image
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => e.target.files?.[0] && fromImage(e.target.files[0])} />
        </label>

        <form onSubmit={(e) => { e.preventDefault(); void open(manual); }} className="flex gap-2">
          <Input value={manual} onChange={(e) => setManual(e.target.value)} placeholder="or type @username" className="h-11 rounded-xl" aria-label="Username" />
          <Button type="submit" className="h-11 rounded-xl" disabled={!manual.trim()}>Open</Button>
        </form>
      </div>
    </>
  );
}
