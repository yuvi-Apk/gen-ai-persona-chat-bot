import type { Message } from "@/data/mock-data";

function CodeBlock({
  language,
  content,
}: {
  language: string;
  content: string;
}) {
  return (
    <div className="mt-2 overflow-hidden rounded-lg border border-border bg-background">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-online/70" />
        <span className="ml-2 text-[11px] text-muted-foreground">
          {language}
        </span>
      </div>
      <pre className="scroll-thin overflow-x-auto px-3 py-2.5 font-mono text-[13px] leading-relaxed text-foreground">
        <code>{content}</code>
      </pre>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isMentor = message.sender === "mentor";

  return (
    <div className={`flex ${isMentor ? "justify-start" : "justify-end"}`}>
      <div
        className={`flex max-w-[85%] gap-2 sm:max-w-[70%] ${isMentor ? "" : "flex-row-reverse"}`}
      >
        <div
          className={[
            "rounded-2xl px-4 py-2.5",
            isMentor
              ? "rounded-tl-sm bg-bubble-mentor text-foreground"
              : "rounded-tr-sm bg-bubble-user text-bubble-user-foreground",
          ].join(" ")}
        >
          {message.blocks.map((block, i) =>
            block.type === "text" ? (
              <p
                key={i}
                className="text-sm leading-relaxed [&:not(:first-child)]:mt-2"
              >
                {block.content}
              </p>
            ) : (
              <CodeBlock
                key={i}
                language={block.language}
                content={block.content}
              />
            ),
          )}
          <p
            className={[
              "mt-1.5 text-[11px]",
              isMentor
                ? "text-muted-foreground"
                : "text-bubble-user-foreground/70",
            ].join(" ")}
          >
            {message.time}
          </p>
        </div>
      </div>
    </div>
  );
}
