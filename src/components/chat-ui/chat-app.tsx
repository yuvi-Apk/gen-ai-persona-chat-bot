"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { IconRail } from "@/components/chat-ui/icon-rail";
import { ConversationList } from "@/components/chat-ui/conversation-list";
import { ChatHeader } from "@/components/chat-ui/chat-header";
import { MessageBubble } from "@/components/chat-ui/message-bubble";
import { ChatComposer } from "@/components/chat-ui/chat-composer";

import {
  conversations as seedConversations,
  type Conversation,
  type Message,
} from "@/data/mock-data";

// going to be the main
import { mentors } from "@/data/mentors";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

export function ChatApp() {

  const [conversationsByMentor, setConversationsByMentor] = useState<
    Record<string, Conversation[]>
  >(() => ({ hitesh: seedConversations, piyush: [], akshay: [] }));

  const [activeMentorId, setActiveMentorId] = useState(mentors[0].id);
  const [activeConversationId, setActiveConversationId] = useState(
    seedConversations[0].id,
  );
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");

  // Ref to the scrollable message container, used to auto-scroll to the
  // bottom whenever a new message is added.
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMentor = mentors.find((m) => m.id === activeMentorId) ?? mentors[0];

  console.log(`activeMentor=> `,activeMentor )

  // All conversations belonging to the currently selected mentor.
  const mentorConversations = conversationsByMentor[activeMentorId] ?? [];

  const activeConversation = useMemo(
    () =>
      mentorConversations.find((c) => c.id === activeConversationId) ??
      mentorConversations[0],
    [mentorConversations, activeConversationId],
  );

  // ── EFFECTS ──────────────────────────────────────────────────────────

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages.length]);

  // ── EVENT HANDLERS ───────────────────────────────────────────────────

  // Fired when the user clicks a mentor avatar in the icon rail.
  function handleSelectMentor(mentorId: string) {
    setActiveMentorId(mentorId);

    const first = conversationsByMentor[mentorId]?.[0];
    setActiveConversationId(first?.id ?? "");
    setMobileView(first ? "chat" : "list");
  }

  // Fired when the user taps a conversation in the middle list panel.
  function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    // On mobile, tapping a conversation should slide into the chat view.
    setMobileView("chat");
  }

  // Fired by the "+ New Chat" button (in the sidebar and in the empty state).
  function handleNewChat() {
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
      mentorKey:"hitesh",
      timestamp: "Now",
      messages: [],
    };
    setConversationsByMentor((prev) => ({
      ...prev,
      [activeMentorId]: [newConversation, ...(prev[activeMentorId] ?? [])],
    }));
    setActiveConversationId(newConversation.id);
    setMobileView("chat");
  }
  function handleSend(text: string) {
    if (!activeConversation) return;

    const userMessage: Message = {
      id: nextId(),
      sender: "user",
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      blocks: [{ type: "text", content: text }],
    };

    const mentorReply: Message = {
      id: nextId(),
      sender: "mentor",
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
      blocks: [
        {
          type: "text",
          content: `Hanji! Good question. Let's break "${text}" down step by step in the next message.`,
        },
      ],
    };

    setConversationsByMentor((prev) => ({
      ...prev,
      [activeMentorId]: prev[activeMentorId].map((c) =>
        c.id === activeConversation.id
          ? {
              ...c,
              messages: [...c.messages, userMessage, mentorReply],
              // Keep the list preview in sync with the latest message.
              preview: text,

              title: c.title === "New chat" ? text.slice(0, 40) : c.title,
            }
          : c,
      ),
    }));
  }

  // ── RENDER ───────────────────────────────────────────────────────────
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Column 1: always-visible mentor switcher (both mobile & desktop) */}
      <IconRail
        mentors={mentors}
        activeMentorId={activeMentorId}
        onSelectAction={handleSelectMentor}
      />

      {/* Column 2: conversation list.
          - Desktop (md+): always visible, fixed width, alongside the chat panel.
          - Mobile: only visible when mobileView === "list" (full width). */}
      <div
        className={[
          "w-full md:flex md:w-auto md:min-w-0",
          mobileView === "list" ? "block" : "hidden md:flex",
        ].join(" ")}
      >
        <ConversationList
          mentor={activeMentor}
          conversations={mentorConversations}
          activeConversationId={activeConversation?.id ?? ""}
          onSelectAction={handleSelectConversation}
          onNewChatAction={handleNewChat}
        />
      </div>

      {/* Column 3: chat panel.
          - Desktop (md+): always visible, takes remaining width.
          - Mobile: only visible when mobileView === "chat". */}
      <div
        className={[
          "min-w-0 flex-1 flex-col md:flex",
          mobileView === "chat" ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        {activeConversation ? (
          // Normal case: a conversation is selected, show its messages.
          <>
            <ChatHeader
              mentor={activeMentor}
              conversation={activeConversation}
              // Back button only does something meaningful on mobile
              // (desktop always shows the list, so there's nothing to
              // "go back" to — the button is simply hidden there via CSS).
              onBackAction={() => setMobileView("list")}
            />

            {/* Scrollable message history. scrollRef is used by the
                auto-scroll effect above. */}
            <div
              ref={scrollRef}
              className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {activeConversation.messages.length === 0 ? (
                // Freshly created ("New chat") conversation with nothing sent yet.
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  No messages yet — say hi to{" "}
                  {activeMentor?.profile?.name.split(" ")[0]}.
                </p>
              ) : (
                activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </div>

            <ChatComposer
              mentorName={activeMentor?.profile?.name}
              onSendAction={handleSend}
            />
          </>
        ) : (
          // Edge case: active mentor has zero conversations at all
          // (e.g. right after switching to a mentor you've never chatted with).
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-heading text-lg font-semibold">
              No conversation selected
            </p>
            <p className="text-sm text-muted-foreground">
              Start a new chat with {activeMentor?.profile.name.split(" ")[0]}.
            </p>
            <button
              type="button"
              onClick={handleNewChat}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              + New Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
