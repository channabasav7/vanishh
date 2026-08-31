import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_SETTINGS,
  type Conversation,
  type Message,
  type Profile,
  type RealtimeStatus,
  type Settings,
} from "@/lib/types";
import { getClient, type SendMessageInput } from "@/services/tempchat-client";

const PROFILE_KEY = "tempchat.profile";
const SETTINGS_KEY = "tempchat.settings";

interface AppState {
  hydrated: boolean;
  profile: Profile | null;
  settings: Settings;
  realtime: RealtimeStatus;
  conversations: Conversation[];
  conversationsLoading: boolean;
  messages: Record<string, Message[]>;
  expiring: Set<string>;
  setProfile: (profile: Profile | null) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  refreshConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (input: SendMessageInput) => Promise<void>;
  setConversationExpiry: (id: string, seconds: number) => Promise<void>;
  addConversation: (conversation: Conversation) => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const client = getClient();
  const [hydrated, setHydrated] = useState(false);
  const [profile, setProfileState] = useState<Profile | null>(null);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [realtime, setRealtime] = useState<RealtimeStatus>("connecting");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [expiring, setExpiring] = useState<Set<string>>(new Set());
  const loadedRef = useRef<Set<string>>(new Set());

  /* hydrate persisted session */
  useEffect(() => {
    try {
      const rawProfile = localStorage.getItem(PROFILE_KEY);
      if (rawProfile) setProfileState(JSON.parse(rawProfile));
      const rawSettings = localStorage.getItem(SETTINGS_KEY);
      if (rawSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) });
    } catch {
      /* ignore corrupt storage */
    }
    setHydrated(true);
  }, []);

  /* theme */
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark =
        settings.theme === "dark" ||
        (settings.theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [settings.theme, hydrated]);

  /* realtime */
  useEffect(() => {
    return client.subscribe((event) => {
      if (event.type === "status") setRealtime(event.status);
      if (event.type === "message") {
        setMessages((prev) => ({
          ...prev,
          [event.message.conversationId]: [
            ...(prev[event.message.conversationId] ?? []),
            event.message,
          ],
        }));
      }
      if (event.type === "message:update") {
        setMessages((prev) => {
          const next: Record<string, Message[]> = {};
          for (const [key, list] of Object.entries(prev)) {
            next[key] = list.map((m) =>
              m.id === event.id ? { ...m, ...event.patch } : m,
            );
          }
          return next;
        });
      }
    });
  }, [client]);

  /* expiry sweep: fade out, then remove */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const doomed: string[] = [];
      Object.values(messages).forEach((list) =>
        list.forEach((m) => {
          if (m.expiresAt <= now && !expiring.has(m.id)) doomed.push(m.id);
        }),
      );
      if (doomed.length === 0) return;
      setExpiring((prev) => new Set([...prev, ...doomed]));
      setTimeout(() => {
        setMessages((prev) => {
          const next: Record<string, Message[]> = {};
          for (const [key, list] of Object.entries(prev)) {
            next[key] = list.filter((m) => !doomed.includes(m.id));
          }
          return next;
        });
      }, 750);
    }, 1000);
    return () => clearInterval(interval);
  }, [messages, expiring]);

  const refreshConversations = useCallback(async () => {
    setConversationsLoading(true);
    const list = await client.listConversations();
    setConversations(list);
    setConversationsLoading(false);
  }, [client]);

  useEffect(() => {
    if (!hydrated) return;
    void refreshConversations();
  }, [hydrated, refreshConversations]);

  const loadMessages = useCallback(
    async (conversationId: string) => {
      if (loadedRef.current.has(conversationId)) return;
      loadedRef.current.add(conversationId);
      const list = await client.listMessages(conversationId);
      setMessages((prev) => ({ ...prev, [conversationId]: list }));
    },
    [client],
  );

  const setProfile = useCallback((next: Profile | null) => {
    setProfileState(next);
    if (next) localStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    else localStorage.removeItem(PROFILE_KEY);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    async (input: SendMessageInput) => {
      const message = await client.sendMessage(input);
      setMessages((prev) => ({
        ...prev,
        [input.conversationId]: [...(prev[input.conversationId] ?? []), message],
      }));
      setConversations((prev) =>
        [...prev]
          .map((c) =>
            c.id === input.conversationId
              ? { ...c, lastActivityAt: Date.now() }
              : c,
          )
          .sort((a, b) => b.lastActivityAt - a.lastActivityAt),
      );
    },
    [client],
  );

  const setConversationExpiry = useCallback(
    async (id: string, seconds: number) => {
      await client.setExpiry(id, seconds);
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, expirySeconds: seconds } : c)),
      );
    },
    [client],
  );

  const addConversation = useCallback((conversation: Conversation) => {
    setConversations((prev) =>
      prev.some((c) => c.id === conversation.id)
        ? prev
        : [conversation, ...prev],
    );
  }, []);

  const value = useMemo<AppState>(
    () => ({
      hydrated,
      profile,
      settings,
      realtime,
      conversations,
      conversationsLoading,
      messages,
      expiring,
      setProfile,
      updateSettings,
      refreshConversations,
      loadMessages,
      sendMessage,
      setConversationExpiry,
      addConversation,
    }),
    [
      hydrated,
      profile,
      settings,
      realtime,
      conversations,
      conversationsLoading,
      messages,
      expiring,
      setProfile,
      updateSettings,
      refreshConversations,
      loadMessages,
      sendMessage,
      setConversationExpiry,
      addConversation,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
