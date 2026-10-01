import { createFileRoute } from "@tanstack/react-router";
import { Monitor, Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { EXPIRY_PRESETS, type Settings } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useApp } from "@/store/app-store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — TempChat" },
      { name: "description", content: "Theme, privacy, default message timer and notifications." },
      { property: "og:title", content: "Settings — TempChat" },
      { property: "og:description", content: "Tune TempChat's theme, privacy and timers." },
    ],
  }),
  component: () => (
    <AppShell>
      <SettingsInner />
    </AppShell>
  ),
});

function Row({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4 last:border-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-ink-soft">{desc}</p>
      </div>
      {children}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft">{title}</h2>
      <div className="rounded-2xl bg-card shadow-soft ring-1 ring-border">{children}</div>
    </section>
  );
}

function SettingsInner() {
  const { settings, updateSettings } = useApp();
  const toggle = (k: keyof Settings) => (v: boolean) => updateSettings({ [k]: v } as Partial<Settings>);

  return (
    <>
      <PageHeader eyebrow="Preferences" title="Settings" />
      <div className="mx-auto grid w-full max-w-2xl gap-8">
        <Group title="Appearance">
          <div className="grid grid-cols-3 gap-2 p-4">
            {([["light", Sun], ["dark", Moon], ["system", Monitor]] as const).map(([t, Icon]) => (
              <button
                key={t}
                onClick={() => updateSettings({ theme: t })}
                className={cn("flex flex-col items-center gap-2 rounded-xl p-4 text-sm capitalize ring-1 transition", settings.theme === t ? "bg-mist ring-ember" : "ring-border hover:bg-mist")}
                aria-pressed={settings.theme === t}
              >
                <Icon className="size-5" /> {t}
              </button>
            ))}
          </div>
        </Group>

        <Group title="Messages">
          <Row title="Default timer" desc="New chats start with this burn time.">
            <Select value={String(settings.defaultExpiry)} onValueChange={(v) => updateSettings({ defaultExpiry: Number(v) })}>
              <SelectTrigger className="w-36 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {EXPIRY_PRESETS.map((p) => <SelectItem key={p.value} value={String(p.value)}>{p.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Row>
        </Group>

        <Group title="Privacy">
          <Row title="Allow new chats" desc="Let people who scan your QR start a chat."><Switch checked={settings.allowNewChats} onCheckedChange={toggle("allowNewChats")} /></Row>
          <Row title="QR visible" desc="Show your QR code on your profile."><Switch checked={settings.qrVisible} onCheckedChange={toggle("qrVisible")} /></Row>
        </Group>

        <Group title="Notifications">
          <Row title="Message alerts" desc="Show an alert for new messages."><Switch checked={settings.messageNotifications} onCheckedChange={toggle("messageNotifications")} /></Row>
          <Row title="Sound" desc="Play a soft chime."><Switch checked={settings.sound} onCheckedChange={toggle("sound")} /></Row>
          <Row title="Browser notifications" desc="Notify even when the tab is hidden.">
            <Switch
              checked={settings.browserNotifications}
              onCheckedChange={async (v) => {
                if (v && "Notification" in window) {
                  const r = await Notification.requestPermission();
                  updateSettings({ browserNotifications: r === "granted" });
                } else updateSettings({ browserNotifications: false });
              }}
            />
          </Row>
        </Group>
      </div>
    </>
  );
}
