"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { IconRail } from "@/components/chat-ui/icon-rail";
import { ConversationList } from "@/components/chat-ui/conversation-list";
import { ChatHeader } from "@/components/chat-ui/chat-header";
import { MessageBubble } from "@/components/chat-ui/message-bubble";
import { ChatComposer } from "@/components/chat-ui/chat-composer";
import {
  mentors,
  conversations as seedConversations,
  type Conversation,
  type Message,
} from "@/data/mock-data";

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

/**
 * Top-level layout controller.
 *
 * Desktop / tablet (md+): icon rail + conversation list + chat panel,
 * all visible side by side.
 *
 * Mobile (<md): one panel at a time. The icon rail stays visible as a
 * constant home base; tapping a conversation slides the chat panel in,
 * and the header's back button returns to the list.
 */

export function ChatApp() {
  const [conversationsByMentor, setConversationsByMentor] = useState<
    Record<string, Conversation[]>
  >(() => ({ hitesh: seedConversations, piyush: [], akshay: [] }));
  const [activeMentorId, setActiveMentorId] = useState(mentors[0].id);
  const [activeConversationId, setActiveConversationId] = useState(
    seedConversations[0].id,
  );
  const [mobileView, setMobileView] = useState<"list" | "chat">("chat");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeMentor =
    mentors.find((m) => m.id === activeMentorId) ?? mentors[0];
  const mentorConversations = conversationsByMentor[activeMentorId] ?? [];
  const activeConversation = useMemo(
    () =>
      mentorConversations.find((c) => c.id === activeConversationId) ??
      mentorConversations[0],
    [mentorConversations, activeConversationId],
  );

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages.length]);

  function handleSelectMentor(mentorId: string) {
    setActiveMentorId(mentorId);
    const first = conversationsByMentor[mentorId]?.[0];
    setActiveConversationId(first?.id ?? "");
    setMobileView(first ? "chat" : "list");
  }

  function handleSelectConversation(conversationId: string) {
    setActiveConversationId(conversationId);
    setMobileView("chat");
  }

  function handleNewChat() {
    // If there's already an untouched draft (empty "New chat"), reuse it
    // instead of stacking duplicates when the button is clicked repeatedly.
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
              preview: text,
              title: c.title === "New chat" ? text.slice(0, 40) : c.title,
            }
          : c,
      ),
    }));
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      <IconRail
        mentors={mentors}
        activeMentorId={activeMentorId}
        onSelectAction={handleSelectMentor}
      />

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

      <div
        className={[
          "min-w-0 flex-1 flex-col md:flex",
          mobileView === "chat" ? "flex" : "hidden md:flex",
        ].join(" ")}
      >
        {activeConversation ? (
          <>
            <ChatHeader
              mentor={activeMentor}
              conversation={activeConversation}
              onBackAction={() => setMobileView("list")}
            />
            <div
              ref={scrollRef}
              className="scroll-thin flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
            >
              {activeConversation.messages.length === 0 ? (
                <p className="mt-10 text-center text-sm text-muted-foreground">
                  No messages yet — say hi to {activeMentor.name.split(" ")[0]}.
                </p>
              ) : (
                activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}
            </div>
            <ChatComposer mentorName={activeMentor.name} onSendAction={handleSend} />
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
            <p className="font-heading text-lg font-semibold">
              No conversation selected
            </p>
            <p className="text-sm text-muted-foreground">
              Start a new chat with {activeMentor.name.split(" ")[0]}.
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
