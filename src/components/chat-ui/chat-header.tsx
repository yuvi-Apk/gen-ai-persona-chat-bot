"use client";

import { Mentor } from "@/data/mentors";
import { Conversation } from "@/hooks/use-chat-store";
import Image from "next/image";

type ChatHeaderProps = {
  mentor: Mentor;
  conversation: Conversation;
  onBackAction?: () => void;
};

export function ChatHeader({
  mentor,
  conversation,
  onBackAction,
}: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
      {onBackAction && (
        <button
          type="button"
          onClick={onBackAction}
          aria-label="Back to conversations"
          className="-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2 md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M15 18l-6-6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}

      <div className="relative h-10 w-10 shrink-0">
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

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-heading text-sm font-semibold">
            {mentor?.profile?.name}
          </p>
          {mentor?.profile?.online && (
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-online" />
          )}
        </div>
        <p className="truncate text-xs text-muted-foreground">
          {conversation.title}
        </p>
      </div>

      <div className="hidden shrink-0 items-center gap-1.5 sm:flex">
        {mentor?.expertise?.primary.slice(0, 2).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
