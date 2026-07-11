"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { mentors } from "@/data/mentors";

export type MessageBlock =
  | { type: "text"; content: string }
  | { type: "code"; language: string; content: string };

export type Message = {
  id: string;
  sender: "mentor" | "user";
  time: string;
  blocks: MessageBlock[];
};

export type Conversation = {
  id: string;
  title: string;
  preview: string;
  timestamp: string;
  unread?: number;
  mentorKey: string;
  messages: Message[];
};

const STORAGE_KEY = "chat-conversations-by-mentor";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${Date.now()}-${idCounter}`;
}

function timeNow() {
  return new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

// No seed/mock data anymore — every mentor starts with an empty
// conversation list. The very first conversation a user has with any
// mentor is created live, by handleNewChat/handleSend, and from that
// point on everything lives in localStorage.
function getEmptyConversations(): Record<string, Conversation[]> {
  const empty: Record<string, Conversation[]> = {};
  for (const mentor of mentors) {
    empty[mentor.id] = [];
  }
  return empty;
}

function loadFromStorage(): Record<string, Conversation[]> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Record<string, Conversation[]>;
  } catch (error) {
    console.error("Failed to read chat history from localStorage:", error);
    return null;
  }
}

function saveToStorage(data: Record<string, Conversation[]>) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save chat history to localStorage:", error);
  }
}

// Flattens a conversation's messages into the { role, content } shape
// the chat API expects, so the mentor remembers the conversation so far.
function toApiHistory(messages: Message[]) {
  return messages.map((message) => ({
    role: message.sender === "mentor" ? ("assistant" as const) : ("user" as const),
    content: message.blocks
      .filter((block) => block.type === "text")
      .map((block) => block.content)
      .join("\n"),
  }));
}

export function useChatStore() {
  // Starts empty for every mentor — server render and first client
  // render match exactly (no hydration mismatch). Whatever's actually
  // in localStorage gets loaded right after mount, in the effect below.
  const [conversationsByMentor, setConversationsByMentor] = useState<
    Record<string, Conversation[]>
  >(getEmptyConversations);

  const [activeMentorId, setActiveMentorId] = useState(mentors[0].id);

  // No seed conversation to default to anymore, so this starts empty —
  // the UI naturally falls into the "No conversation selected" state
  // (already handled by ChatApp) until the user creates one.
  const [activeConversationId, setActiveConversationId] = useState("");

  const [mobileView, setMobileView] = useState<"list" | "chat">("list");

  // Which mentor (if any) currently has a reply in flight. Storing the
  // id — not a plain boolean — means switching mentors mid-request
  // doesn't make the wrong chat show a "typing" indicator.
  const [typingMentorId, setTypingMentorId] = useState<string | null>(null);

  // Guards against the save-effect firing (and overwriting real saved
  // data with empty defaults) before the load-effect has had a chance
  // to run.
  const hasLoadedFromStorage = useRef(false);

  // Load any previously saved chats once, on mount, and jump straight
  // into whichever conversation the user last had open, if any.
  useEffect(() => {
    const stored = loadFromStorage();
    if (stored) {
      setConversationsByMentor(stored);
      const firstMentorWithChats = mentors.find(
        (m) => (stored[m.id]?.length ?? 0) > 0,
      );
      if (firstMentorWithChats) {
        setActiveMentorId(firstMentorWithChats.id);
        setActiveConversationId(stored[firstMentorWithChats.id][0].id);
        setMobileView("chat");
      }
    }
    hasLoadedFromStorage.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist to localStorage every time conversations change, but only
  // after the initial load above has completed.
  useEffect(() => {
    if (!hasLoadedFromStorage.current) return;
    saveToStorage(conversationsByMentor);
  }, [conversationsByMentor]);

  const activeMentor = mentors.find((m) => m.id === activeMentorId) ?? mentors[0];
  const mentorConversations = conversationsByMentor[activeMentorId] ?? [];

  const activeConversation = useMemo(
    () =>
      mentorConversations.find((c) => c.id === activeConversationId) ??
      mentorConversations[0],
    [mentorConversations, activeConversationId],
  );

  // True only when the currently *viewed* mentor is the one waiting on
  // a reply — not when some other mentor's request is still pending.
  const isSending = typingMentorId === activeMentorId;

  const appendMessage = useCallback(
    (mentorId: string, conversationId: string, message: Message) => {
      setConversationsByMentor((prev) => ({
        ...prev,
        [mentorId]: (prev[mentorId] ?? []).map((c) =>
          c.id === conversationId
            ? { ...c, messages: [...c.messages, message] }
            : c,
        ),
      }));
    },
    [],
  );

  const updateConversationMeta = useCallback(
    (
      mentorId: string,
      conversationId: string,
      patch: Partial<Pick<Conversation, "preview" | "title">>,
    ) => {
      setConversationsByMentor((prev) => ({
        ...prev,
        [mentorId]: (prev[mentorId] ?? []).map((c) =>
          c.id === conversationId ? { ...c, ...patch } : c,
        ),
      }));
    },
    [],
  );

  const handleSelectMentor = useCallback(
    (mentorId: string) => {
      setActiveMentorId(mentorId);
      const first = conversationsByMentor[mentorId]?.[0];
      setActiveConversationId(first?.id ?? "");
      setMobileView(first ? "chat" : "list");
    },
    [conversationsByMentor],
  );

  const handleSelectConversation = useCallback((conversationId: string) => {
    setActiveConversationId(conversationId);
    setMobileView("chat");
  }, []);

  const handleNewChat = useCallback(() => {
    const existingDraft = mentorConversations.find(
      (c) => c.title === "New chat" && c.messages.length === 0,
    );
    if (existingDraft) {
      setActiveConversationId(existingDraft.id);
      setMobileView("chat");
      return;
    }

    const newConversation: Conversation = {
      id: `new-${Date.now()}`,
      title: "New chat",
      preview: "Say hi to get started",
      mentorKey: activeMentorId,
      timestamp: "Now",
      messages: [],
    };

    setConversationsByMentor((prev) => ({
      ...prev,
      [activeMentorId]: [newConversation, ...(prev[activeMentorId] ?? [])],
    }));
    setActiveConversationId(newConversation.id);
    setMobileView("chat");
  }, [activeMentorId, mentorConversations]);

  // Fires when the user submits a message with no conversation open yet
  // (e.g. very first message to a mentor). Creates the conversation on
  // the fly instead of forcing an explicit "+ New Chat" click first.
  const ensureConversation = useCallback((): Conversation => {
    if (activeConversation) return activeConversation;

    const newConversation: Conversation = {
      id: `new-${Date.now()}`,
      title: "New chat",
      preview: "Say hi to get started",
      mentorKey: activeMentorId,
      timestamp: "Now",
      messages: [],
    };

    setConversationsByMentor((prev) => ({
      ...prev,
      [activeMentorId]: [newConversation, ...(prev[activeMentorId] ?? [])],
    }));
    setActiveConversationId(newConversation.id);
    return newConversation;
  }, [activeConversation, activeMentorId]);

  const handleSend = useCallback(
    async (text: string) => {
      // Block sending while ANY mentor request is in flight — simplest
      // safe behavior; relax this later if you want concurrent chats
      // across different mentors.
      if (typingMentorId) return;

      const mentorId = activeMentorId;
      const conversation = ensureConversation();
      const conversationId = conversation.id;

      const userMessage: Message = {
        id: nextId(),
        sender: "user",
        time: timeNow(),
        blocks: [{ type: "text", content: text }],
      };

      appendMessage(mentorId, conversationId, userMessage);
      updateConversationMeta(mentorId, conversationId, {
        preview: text,
        title:
          conversation.title === "New chat"
            ? text.slice(0, 40)
            : conversation.title,
      });

      setMobileView("chat");
      setTypingMentorId(mentorId);

      try {
        const history = toApiHistory(conversation.messages);

        const response = await fetch("/api/teacher", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mentorId, message: text, history }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(
            errorBody?.error ?? `Request failed (${response.status})`,
          );
        }

        const data: { reply: MessageBlock } = await response.json();

        const mentorReply: Message = {
          id: nextId(),
          sender: "mentor",
          time: timeNow(),
          blocks: [data.reply],
        };

        appendMessage(mentorId, conversationId, mentorReply);
        updateConversationMeta(mentorId, conversationId, {
          preview: data.reply.content,
        });
      } catch (error) {
        console.error("Failed to get mentor reply:", error);

        const errorMessage: Message = {
          id: nextId(),
          sender: "mentor",
          time: timeNow(),
          blocks: [
            {
              type: "text",
              content:
                "Sorry, something went wrong reaching the server. Please try again.",
            },
          ],
        };
        appendMessage(mentorId, conversationId, errorMessage);
      } finally {
        setTypingMentorId(null);
      }
    },
    [
      activeMentorId,
      typingMentorId,
      ensureConversation,
      appendMessage,
      updateConversationMeta,
    ],
  );

  // Escape hatch for a "clear my chat history" button, if you want one.
  const clearHistory = useCallback(() => {
    setConversationsByMentor(getEmptyConversations());
    setActiveConversationId("");
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  return {
    mentors,
    activeMentor,
    activeMentorId,
    mentorConversations,
    activeConversation,
    mobileView,
    isSending,
    setMobileView,
    handleSelectMentor,
    handleSelectConversation,
    handleNewChat,
    handleSend,
    clearHistory,
  };
}