/**
 * Transport abstraction for TempChat.
 *
 * The UI only talks to `TempChatClient`. The current implementation is an
 * in-memory mock so the frontend can be developed without a backend. Swap
 * `createClient()` for a REST + WebSocket implementation later — no component
 * changes required.
 */
import type {
  Attachment,
  Conversation,
  Message,
  Profile,
  RealtimeStatus,
} from "@/lib/types";

export interface SendMessageInput {
  conversationId: string;
  body?: string | undefined;
  attachments?: Attachment[];
  expirySeconds: number;
}

export type RealtimeEvent =
  | { type: "status"; status: RealtimeStatus }
  | { type: "message"; message: Message }
  | { type: "message:update"; id: string; patch: Partial<Message> }
  | { type: "message:expired"; id: string };

export interface TempChatClient {
  checkUsername(username: string): Promise<{ available: boolean }>;
  claimUsername(username: string): Promise<Profile>;
  suggestUsername(): Promise<string>;
  listConversations(): Promise<Conversation[]>;
  listMessages(conversationId: string): Promise<Message[]>;
  openConversationWith(username: string): Promise<Conversation>;
  sendMessage(input: SendMessageInput): Promise<Message>;
  setExpiry(conversationId: string, expirySeconds: number): Promise<void>;
  subscribe(handler: (event: RealtimeEvent) => void): () => void;
}

const ADJECTIVES = [
  "quiet",
  "amber",
  "swift",
  "ember",
  "north",
  "paper",
  "solar",
  "vivid",
];
const NOUNS = ["fox", "signal", "drift", "cedar", "atlas", "harbor", "nova", "kite"];

const uid = () => Math.random().toString(36).slice(2, 10);

const TAKEN = new Set(["admin", "tempchat", "support", "chann", "rahul_dev"]);

function seedConversations(): Conversation[] {
  const now = Date.now();
  return [
    {
      id: "c_rahul",
      kind: "direct",
      title: "@rahul_dev",
      participants: [
        { id: "u_rahul", username: "rahul_dev", presence: "online" },
      ],
      expirySeconds: 15 * 60,
      lastActivityAt: now - 40_000,
      unread: 0,
    },
    {
      id: "c_nova",
      kind: "direct",
      title: "@nova",
      participants: [{ id: "u_nova", username: "nova", presence: "offline" }],
      expirySeconds: 60 * 60,
      lastActivityAt: now - 2 * 3600_000,
      unread: 2,
    },
    {
      id: "c_studio",
      kind: "group",
      title: "Studio drop",
      participants: [
        { id: "u_mar", username: "mar_a", presence: "online" },
        { id: "u_kai", username: "kai", presence: "away" },
      ],
      expirySeconds: 6 * 3600,
      lastActivityAt: now - 26 * 3600_000,
      unread: 0,
    },
  ];
}

function seedMessages(): Message[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      conversationId: "c_rahul",
      authorId: "u_rahul",
      body: "Morning — you around?",
      attachments: [],
      createdAt: now - 300_000,
      expiresAt: now + 11 * 60_000,
      status: "read",
    },
    {
      id: uid(),
      conversationId: "c_rahul",
      authorId: "me",
      body: "Yeah, scanning your QR now",
      attachments: [],
      createdAt: now - 240_000,
      expiresAt: now + 12 * 60_000,
      status: "delivered",
    },
    {
      id: uid(),
      conversationId: "c_rahul",
      authorId: "me",
      body: undefined,
      attachments: [
        {
          id: uid(),
          kind: "document",
          name: "brand-specs.pdf",
          size: 2_517_000,
          mimeType: "application/pdf",
        },
      ],
      createdAt: now - 180_000,
      expiresAt: now + 8 * 60_000,
      status: "delivered",
    },
    {
      id: uid(),
      conversationId: "c_nova",
      authorId: "u_nova",
      body: "Sent you the deck — it burns in an hour.",
      attachments: [],
      createdAt: now - 2 * 3600_000,
      expiresAt: now + 40 * 60_000,
      status: "delivered",
    },
    {
      id: uid(),
      conversationId: "c_studio",
      authorId: "u_mar",
      body: "Thanks, got it",
      attachments: [],
      createdAt: now - 26 * 3600_000,
      expiresAt: now + 3 * 3600_000,
      status: "read",
    },
  ];
}

class MockTempChatClient implements TempChatClient {
  private conversations = seedConversations();
  private messages = seedMessages();
  private handlers = new Set<(event: RealtimeEvent) => void>();
  private status: RealtimeStatus = "connecting";

  private emit(event: RealtimeEvent) {
    this.handlers.forEach((h) => h(event));
  }

  async checkUsername(username: string) {
    await delay(320);
    return { available: !TAKEN.has(username.toLowerCase()) };
  }

  async claimUsername(username: string): Promise<Profile> {
    await delay(260);
    return {
      id: `u_${uid()}`,
      username,
      status: "Available",
      createdAt: Date.now(),
    };
  }

  async suggestUsername() {
    await delay(180);
    const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return `${a}_${n}${Math.floor(Math.random() * 90 + 10)}`;
  }

  async listConversations() {
    await delay(420);
    return [...this.conversations].sort(
      (a, b) => b.lastActivityAt - a.lastActivityAt,
    );
  }

  async listMessages(conversationId: string) {
    await delay(320);
    return this.messages
      .filter((m) => m.conversationId === conversationId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  async openConversationWith(username: string): Promise<Conversation> {
    await delay(500);
    const handle = username.replace(/^@/, "");
    const existing = this.conversations.find(
      (c) => c.title.replace(/^@/, "") === handle,
    );
    if (existing) return existing;
    const conversation: Conversation = {
      id: `c_${uid()}`,
      kind: "direct",
      title: `@${handle}`,
      participants: [{ id: `u_${uid()}`, username: handle, presence: "online" }],
      expirySeconds: 15 * 60,
      lastActivityAt: Date.now(),
      unread: 0,
    };
    this.conversations = [conversation, ...this.conversations];
    return conversation;
  }

  async sendMessage(input: SendMessageInput): Promise<Message> {
    const message: Message = {
      id: uid(),
      conversationId: input.conversationId,
      authorId: "me",
      body: input.body,
      attachments: input.attachments ?? [],
      createdAt: Date.now(),
      expiresAt: Date.now() + input.expirySeconds * 1000,
      status: "sending",
    };
    this.messages.push(message);
    const convo = this.conversations.find((c) => c.id === input.conversationId);
    if (convo) convo.lastActivityAt = Date.now();

    void (async () => {
      await delay(450);
      this.patch(message.id, { status: "sent" });
      await delay(500);
      this.patch(message.id, { status: "delivered" });
    })();

    return message;
  }

  private patch(id: string, patch: Partial<Message>) {
    const found = this.messages.find((m) => m.id === id);
    if (found) Object.assign(found, patch);
    this.emit({ type: "message:update", id, patch });
  }

  async setExpiry(conversationId: string, expirySeconds: number) {
    const convo = this.conversations.find((c) => c.id === conversationId);
    if (convo) convo.expirySeconds = expirySeconds;
  }

  subscribe(handler: (event: RealtimeEvent) => void) {
    this.handlers.add(handler);
    handler({ type: "status", status: this.status });
    const t = setTimeout(() => {
      this.status = "connected";
      this.emit({ type: "status", status: "connected" });
    }, 900);
    return () => {
      clearTimeout(t);
      this.handlers.delete(handler);
    };
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

let client: TempChatClient | null = null;

export function getClient(): TempChatClient {
  if (!client) client = new MockTempChatClient();
  return client;
}
