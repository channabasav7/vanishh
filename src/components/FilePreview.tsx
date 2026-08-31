import { File, FileAudio, FileText, FileVideo, ImageIcon, X } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import { formatBytes } from "@/lib/format";
import type { Attachment, AttachmentKind } from "@/lib/types";
import { cn } from "@/lib/utils";

const ICONS: Record<AttachmentKind, typeof File> = {
  image: ImageIcon,
  video: FileVideo,
  audio: FileAudio,
  document: FileText,
  file: File,
};

export function AttachmentIcon({
  kind,
  className,
}: {
  kind: AttachmentKind;
  className?: string;
}) {
  const Icon = ICONS[kind];
  return <Icon className={cn("size-4", className)} aria-hidden="true" />;
}

/** Pre-send preview row inside the composer. */
export function FilePreview({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: (id: string) => void;
}) {
  const uploading =
    attachment.progress !== undefined && attachment.progress < 100;

  return (
    <div className="flex items-center gap-3 rounded-xl bg-mist px-3 py-2 ring-1 ring-border">
      <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-card ring-1 ring-border">
        {attachment.kind === "image" && attachment.url ? (
          <img
            src={attachment.url}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <AttachmentIcon kind={attachment.kind} className="text-ink-soft" />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium">{attachment.name}</p>
        <p className="text-[11px] text-ink-soft">
          {attachment.kind} · {formatBytes(attachment.size)}
        </p>
        {uploading ? (
          <Progress value={attachment.progress} className="mt-1.5 h-1" />
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        aria-label={`Remove ${attachment.name}`}
        className="grid size-7 shrink-0 place-items-center rounded-lg text-ink-soft transition-colors hover:bg-card hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  );
}

/** Rendered attachment inside a sent/received bubble. */
export function AttachmentBody({
  attachment,
  outgoing,
}: {
  attachment: Attachment;
  outgoing: boolean;
}) {
  if (attachment.kind === "image" && attachment.url) {
    return (
      <a href={attachment.url} target="_blank" rel="noreferrer" className="block">
        <img
          src={attachment.url}
          alt={attachment.name}
          loading="lazy"
          className="w-52 rounded-xl object-cover"
        />
      </a>
    );
  }

  if (attachment.kind === "video" && attachment.url) {
    return (
      <video
        src={attachment.url}
        controls
        className="w-52 rounded-xl"
        aria-label={attachment.name}
      />
    );
  }

  if (attachment.kind === "audio" && attachment.url) {
    return (
      <audio src={attachment.url} controls className="w-52" aria-label={attachment.name} />
    );
  }

  return (
    <a
      href={attachment.url ?? "#"}
      download={attachment.name}
      className={cn(
        "flex items-center gap-2.5 rounded-xl px-1 py-0.5",
        !attachment.url && "pointer-events-none",
      )}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-lg",
          outgoing ? "bg-ink-foreground/10" : "bg-mist",
        )}
      >
        <AttachmentIcon kind={attachment.kind} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium">
          {attachment.name}
        </span>
        <span
          className={cn(
            "block text-[10px]",
            outgoing ? "text-ink-foreground/50" : "text-ink-soft",
          )}
        >
          {formatBytes(attachment.size)}
        </span>
      </span>
    </a>
  );
}
