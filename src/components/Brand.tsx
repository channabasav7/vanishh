import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label="TempChat home"
    >
      <span className="grid size-7 place-items-center rounded-[10px] bg-ink">
        <span className="size-2.5 rounded-[3px] bg-ember-soft" />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight">
        TempChat
      </span>
    </Link>
  );
}
