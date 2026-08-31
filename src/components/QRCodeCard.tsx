import { Copy, Download, QrCode, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function profileLinkFor(username: string) {
  const origin =
    typeof window === "undefined" ? "https://tempchat.app" : window.location.origin;
  return `${origin}/connect/${username.replace(/^@/, "")}`;
}

export function useQrDataUrl(value: string, size = 512) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const QRCode = (await import("qrcode")).default;
      const dark = document.documentElement.classList.contains("dark");
      const url = await QRCode.toDataURL(value, {
        width: size,
        margin: 1,
        color: {
          dark: dark ? "#F1F2F6" : "#15161C",
          light: "#00000000",
        },
        errorCorrectionLevel: "M",
      });
      if (!cancelled) setDataUrl(url);
    })();
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  return dataUrl;
}

export function QRVisual({
  value,
  className,
  scanning = true,
  label,
}: {
  value: string;
  className?: string;
  scanning?: boolean;
  label?: string;
}) {
  const dataUrl = useQrDataUrl(value);

  return (
    <div
      className={cn(
        "relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-card p-4 ring-1 ring-border",
        className,
      )}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={label ?? `QR code linking to ${value}`}
          className="size-full object-contain"
        />
      ) : (
        <div
          className="size-full animate-pulse rounded-xl bg-mist"
          aria-label="Generating QR code"
        />
      )}
      <span className="pointer-events-none absolute left-3 top-3 size-6 rounded-[4px] border-l-2 border-t-2 border-ember" />
      <span className="pointer-events-none absolute right-3 top-3 size-6 rounded-[4px] border-r-2 border-t-2 border-ember" />
      <span className="pointer-events-none absolute bottom-3 left-3 size-6 rounded-[4px] border-b-2 border-l-2 border-ember" />
      <span className="pointer-events-none absolute bottom-3 right-3 size-6 rounded-[4px] border-b-2 border-r-2 border-ember" />
      {scanning ? (
        <span
          aria-hidden="true"
          className="animate-qr-scan pointer-events-none absolute inset-x-4 h-[2px] bg-ember/70 shadow-[0_0_12px_2px_var(--ember)]"
        />
      ) : null}
    </div>
  );
}

export function QRActions({ username }: { username: string }) {
  const link = profileLinkFor(username);
  const dataUrl = useQrDataUrl(username ? link : "tempchat", 1024);

  const copy = async () => {
    await navigator.clipboard.writeText(link);
    toast.success("Profile link copied");
  };

  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Chat with @${username}`, url: link });
        return;
      } catch {
        /* user dismissed */
      }
    }
    await copy();
  };

  const download = () => {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `tempchat-${username}.png`;
    a.click();
    toast.success("QR code downloaded");
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={share} size="sm">
        <Share2 aria-hidden="true" /> Share QR
      </Button>
      <Button onClick={download} variant="outline" size="sm" disabled={!dataUrl}>
        <Download aria-hidden="true" /> Download
      </Button>
      <Button onClick={copy} variant="outline" size="sm">
        <Copy aria-hidden="true" /> Copy link
      </Button>
    </div>
  );
}

export function QRCodeCard({
  username,
  compact = false,
}: {
  username: string;
  compact?: boolean;
}) {
  const link = profileLinkFor(username);

  return (
    <section className="surface-glass rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">
          Your QR
        </p>
        <QrCode className="size-4 text-ember" aria-hidden="true" />
      </div>
      <div
        className={cn(
          "mt-4 grid gap-5",
          compact ? "grid-cols-[auto_1fr] items-center" : "justify-items-center",
        )}
      >
        <QRVisual value={link} className={compact ? "w-36" : "w-full max-w-64"} />
        <div className={compact ? "" : "text-center"}>
          <p className="font-display text-xl font-semibold">@{username}</p>
          <p className="mt-1 max-w-xs text-xs leading-relaxed text-ink-soft">
            Anyone who scans this code can instantly open a temporary chat with
            you.
          </p>
          <div className="mt-4">
            <QRActions username={username} />
          </div>
        </div>
      </div>
      <p className="mt-4 truncate text-center text-[11px] text-ink-soft">{link}</p>
    </section>
  );
}
