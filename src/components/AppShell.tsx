import { Link, useNavigate } from "@tanstack/react-router";
import {
  FolderOpen,
  MessageSquare,
  QrCode,
  ScanLine,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";

import { Brand } from "@/components/Brand";
import { useApp } from "@/store/app-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/chats", label: "Chats", icon: MessageSquare },
  { to: "/qr", label: "My QR", icon: QrCode },
  { to: "/scan", label: "Scan", icon: ScanLine },
  { to: "/files", label: "Files", icon: FolderOpen },
  { to: "/connections", label: "Connections", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const MOBILE_NAV = [NAV[0], NAV[1], NAV[2], NAV[4], NAV[6]];

export function RealtimeDot() {
  const { realtime } = useApp();
  const label =
    realtime === "connected"
      ? "Live"
      : realtime === "offline"
        ? "Offline"
        : realtime === "reconnecting"
          ? "Reconnecting"
          : "Connecting";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink-soft">
      <span
        className={cn(
          "size-1.5 rounded-full",
          realtime === "connected" ? "bg-ember" : "animate-pulse bg-ink-soft",
        )}
      />
      {label}
    </span>
  );
}

export function useRequireProfile() {
  const { hydrated, profile } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    if (hydrated && !profile) void navigate({ to: "/start" });
  }, [hydrated, profile, navigate]);
  return hydrated && !!profile;
}

export function AppShell({
  children,
  fullBleed = false,
}: {
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const ready = useRequireProfile();
  const { profile } = useApp();

  return (
    <div className="page-gradient flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface px-4 py-6 backdrop-blur-xl md:flex">
        <div className="px-2">
          <Brand to="/chats" />
        </div>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-mist hover:text-foreground"
              activeProps={{ className: "bg-mist text-foreground font-medium" }}
            >
              <Icon className="size-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-mist p-3">
          <p className="truncate font-display text-sm font-semibold">
            @{profile?.username ?? "…"}
          </p>
          <RealtimeDot />
        </div>
      </aside>

      <main
        className={cn(
          "flex min-w-0 flex-1 flex-col pb-20 md:pb-0",
          !fullBleed && "mx-auto w-full max-w-5xl px-4 py-6 sm:px-8 sm:py-10",
        )}
      >
        {ready ? children : (
          <div className="grid flex-1 place-items-center">
            <span className="size-6 animate-spin rounded-full border-2 border-border border-t-ember" />
          </div>
        )}
      </main>

      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface px-2 py-2 backdrop-blur-xl md:hidden"
      >
        {MOBILE_NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-[11px] text-ink-soft"
            activeProps={{ className: "text-ember font-medium" }}
          >
            <Icon className="size-5" aria-hidden="true" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-rise-in">
      <div>
        {eyebrow ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ember">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-xl text-sm text-ink-soft">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
