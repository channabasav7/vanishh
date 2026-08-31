import { Hourglass } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCountdown } from "@/lib/format";
import { EXPIRY_PRESETS } from "@/lib/types";
import { cn } from "@/lib/utils";

export function useCountdown(target: number) {
  const [remaining, setRemaining] = useState(() => target - Date.now());
  useEffect(() => {
    setRemaining(target - Date.now());
    const id = setInterval(() => setRemaining(target - Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);
  return remaining;
}

export function Countdown({
  target,
  className,
}: {
  target: number;
  className?: string;
}) {
  const remaining = useCountdown(target);
  return (
    <span className={className} aria-live="off">
      {formatCountdown(remaining)}
    </span>
  );
}

/** The always-visible ephemerality strip at the top of a chat. */
export function TemporaryTimer({
  expirySeconds,
  onChange,
  className,
}: {
  expirySeconds: number;
  onChange: (seconds: number) => void;
  className?: string;
}) {
  const isCustom = !EXPIRY_PRESETS.some((p) => p.value === expirySeconds);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-ink px-4 py-2.5 text-ink-foreground sm:px-5",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-xs font-medium">
        <Hourglass className="size-3.5 text-ember-soft" aria-hidden="true" />
        <span className="hidden sm:inline">Messages disappear automatically</span>
        <span className="sm:hidden">Auto-expire</span>
      </div>
      <div className="flex items-center gap-2 text-[11px] font-medium">
        <span className="hidden text-ink-foreground/50 sm:inline">
          Disappear after
        </span>
        <Select
          value={isCustom ? "custom" : String(expirySeconds)}
          onValueChange={(v) => {
            if (v === "custom") {
              const minutes = window.prompt("Disappear after how many minutes?", "45");
              const parsed = Number(minutes);
              if (Number.isFinite(parsed) && parsed > 0) onChange(parsed * 60);
              return;
            }
            onChange(Number(v));
          }}
        >
          <SelectTrigger
            aria-label="Message expiry"
            className="h-7 rounded-full border-0 bg-ink-foreground/10 px-3 font-display text-[11px] text-ember-soft shadow-none focus-visible:ring-1 focus-visible:ring-ember-soft"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {EXPIRY_PRESETS.map((preset) => (
              <SelectItem key={preset.value} value={String(preset.value)}>
                {preset.label}
              </SelectItem>
            ))}
            <SelectItem value="custom">Custom…</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
