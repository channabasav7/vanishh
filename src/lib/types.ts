export type ExpirySeconds = number;

export const EXPIRY_PRESETS: { label: string; value: ExpirySeconds }[] = [
  { label: "5 minutes", value: 5 * 60 },
  { label: "15 minutes", value: 15 * 60 },
  { label: "1 hour", value: 60 * 60 },
  { label: "6 hours", value: 6 * 60 * 60 },
  { label: "24 hours", value: 24 * 60 * 60 },
];

export type PresenceState = "online" | "offline" | "away";

export type RealtimeStatus =
  | "connecting"
  | "connected"
  | "reconnecting"
  | "offline";

export type MessageStatus =
  | "sending"
  | "sent"
  | "delivered"
  | "read"
  | "failed";

export type AttachmentKind = "image" | "video" | "audio" | "document" | "file";

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  size: number;
  mimeType: string;
  /** Object URL or remote URL. */
  url?: string;
  /** 0..100 while uploading. */
  progress?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  authorId: string;
  body?: string | undefined;
  attachments: Attachment[];
  createdAt: number;
  /** Epoch ms when this message burns. */
  expiresAt: number;
  status: MessageStatus;
}

export interface Participant {
  id: string;
  username: string;
  presence: PresenceState;
  accent?: string;
}

export interface Conversation {
  id: string;
  kind: "direct" | "group";
  title: string;
  participants: Participant[];
  expirySeconds: ExpirySeconds;
  lastActivityAt: number;
  unread: number;
}

export interface Profile {
  id: string;
  username: string;
  status: string;
  createdAt: number;
}

export interface Settings {
  theme: "light" | "dark" | "system";
  defaultExpiry: ExpirySeconds;
  allowNewChats: boolean;
  qrVisible: boolean;
  messageNotifications: boolean;
  sound: boolean;
  browserNotifications: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  theme: "system",
  defaultExpiry: 15 * 60,
  allowNewChats: true,
  qrVisible: true,
  messageNotifications: true,
  sound: true,
  browserNotifications: false,
};
