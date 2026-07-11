"use client";

import { Mentor } from "@/data/mentors";
import { Conversation } from "@/hooks/use-chat-store";
import Image from "next/image";

type ConversationListProps = {
  mentor: Mentor;
  conversations: Conversation[];
  activeConversationId: string;
  onSelectAction: (conversationId: string) => void;
  onNewChatAction: () => void;
};

/**
 * Middle panel: mentor summary card + conversation history.
 * On mobile this panel IS the screen (full width); on desktop it's
 * a fixed-width column next to the chat.
 */
export function ConversationList({
  mentor,
  conversations,
  activeConversationId,
  onSelectAction,
  onNewChatAction,
}: ConversationListProps) {
  return (
    <div className="flex h-full w-full flex-col bg-sidebar md:w-80 md:shrink-0 md:border-r md:border-sidebar-border">
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-heading font-semibold text-primary-foreground">
          {/* Image wrapper */}
          <div className="relative h-full w-full overflow-hidden rounded-xl">
            <Image
              src={mentor.profile.avatar}
              alt={mentor.profile.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Online indicator */}
          {mentor.profile.online && (
            <span className="absolute -bottom-0.5 -right-0.5 z-10 h-3 w-3 rounded-full border-2 border-card bg-online" />
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-heading text-sm font-semibold text-sidebar-foreground">
            {mentor?.profile?.name}
          </p>
          {/* <p className="truncate text-xs text-muted-foreground">
            {mentor.role}
          </p> */}
        </div>
      </div>

      <div className="space-y-3 border-b border-sidebar-border p-4">
        <p className="text-xs italic leading-snug text-muted-foreground">
          "{mentor?.profile.tagline}"
        </p>
        <div className="flex flex-wrap gap-1.5">
          {mentor?.expertise?.primary.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <button
          type="button"
          onClick={onNewChatAction}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          + New Chat
        </button>
      </div>

      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground">
          CONVERSATIONS
        </p>
      </div>

      <ul className="scroll-thin flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {conversations.map((conversation) => {
          const isActive = conversation.id === activeConversationId;
          return (
            <li key={conversation.id}>
              <button
                type="button"
                onClick={() => onSelectAction(conversation.id)}
                aria-current={isActive}
                className={[
                  "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  isActive
                    ? "border-primary/40 bg-accent"
                    : "border-transparent hover:bg-surface-2",
                ].join(" ")}
              >
                <p className="truncate text-sm font-semibold text-sidebar-foreground">
                  {conversation.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {conversation.preview}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {conversation.timestamp}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
