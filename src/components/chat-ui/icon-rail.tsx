"use client";

import { Mentor } from "@/data/mentors";



type IconRailProps = {
  mentors: Mentor[];
  activeMentorId: string;
  onSelectAction: (mentorId: string) => void;
};

/**
 * Slim always-visible rail for switching between mentors.
 * Stays visible at every breakpoint; it's the app's home base.
 */
export function IconRail({ mentors, activeMentorId, onSelectAction }: IconRailProps) {
  return (
    <nav
      aria-label="Mentors"
      className="flex h-full w-16 shrink-0 flex-col items-center gap-2 border-r border-sidebar-border bg-sidebar py-3"
    >
      {mentors.map((mentor) => {
        const isActive = mentor.id === activeMentorId;
        return (
          <button
            key={mentor.id}
            type="button"
            onClick={() => onSelectAction(mentor.id)}
            aria-label={mentor?.profile?.name}
            aria-current={isActive}
            className={[
              "relative flex h-11 w-11 items-center justify-center rounded-xl text-sm font-heading font-semibold transition-colors",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              isActive
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-sidebar"
                : "bg-surface-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            ].join(" ")}
          >
            {mentor?.profile?.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
            {mentor?.profile?.online && (
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-sidebar bg-online" />
            )}
          </button>
        );
      })}
    </nav>
  );
}