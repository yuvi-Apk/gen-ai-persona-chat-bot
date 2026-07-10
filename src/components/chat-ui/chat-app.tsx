"use client";

import { useEffect, useRef } from "react";

import { IconRail } from "@/components/chat-ui/icon-rail";
import { ConversationList } from "@/components/chat-ui/conversation-list";
import { ChatHeader } from "@/components/chat-ui/chat-header";
import { MessageBubble } from "@/components/chat-ui/message-bubble";
import { ChatComposer } from "@/components/chat-ui/chat-composer";
import { useChatStore } from "@/hooks/use-chat-store";

export function ChatApp() {
  const {
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
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [activeConversation?.messages.length]);

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background text-foreground">
      {/* Column 1: always-visible mentor switcher (both mobile & desktop) */}
      <IconRail
        mentors={mentors}
        activeMentorId={activeMentorId}
        onSelectAction={handleSelectMentor}
      />

      {/* Column 2: conversation list. */}
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

      {/* Column 3: chat panel. */}
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
                  No messages yet — say hi to{" "}
                  {activeMentor?.profile?.name.split(" ")[0]}.
                </p>
              ) : (
                activeConversation.messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))
              )}

              {/* "Typing" indicator while a reply is in flight for the
                  mentor currently being viewed. */}
              {isSending && (
                <p className="text-xs italic text-muted-foreground">
                  {activeMentor?.profile?.name.split(" ")[0]} is typing...
                </p>
              )}
            </div>

            <ChatComposer
              mentorName={activeMentor?.profile?.name}
              onSendAction={handleSend}
              disabled={isSending}
            />
          </>
        ) : (
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