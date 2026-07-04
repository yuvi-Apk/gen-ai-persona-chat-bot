"use client";

import { useState, type FormEvent } from "react";

type ChatComposerProps = {
  mentorName: string;
  onSendAction: (text: string) => void;
  disabled?: boolean;
};

export function ChatComposer({
  mentorName,
  onSendAction,
  disabled,
}: ChatComposerProps) {
  const [value, setValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSendAction(trimmed);
    setValue("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-border bg-card p-3 sm:p-4"
    >
      {/* <button
        type="button"
        aria-label="Attach image"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-2"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path
            d="M21 15l-5-5L5 21"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button> */}

      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        rows={1}
        disabled={disabled}
        placeholder={`Ask ${mentorName.split(" ")[0]} anything...`}
        className="scroll-thin max-h-32 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 rotate-180"
          fill="currentColor"
        >
          <path d="M3 12l18-9-6 9 6 9-18-9z" />
        </svg>
      </button>
    </form>
  );
}
