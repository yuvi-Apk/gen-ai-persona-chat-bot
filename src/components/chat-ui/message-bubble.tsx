import { Message } from "@/hooks/use-chat-store";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

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
  // This is from ai response
  const isMentor = message.sender === "mentor";

  return (
    <div className={`flex ${isMentor ? "justify-start" : "justify-end"}`}>
      <div
        className={`flex max-w-[85%] gap-2 sm:max-w-[70%] ${isMentor ? "" : "flex-row-reverse"}`}
      >
        <div
          className={[
            // WhatsApp-style bubble: soft rounding everywhere except the
            // corner nearest the sender, which is squared off to a point.
            "rounded-lg px-3 py-2",
            isMentor
              ? "rounded-tl-none bg-bubble-mentor text-foreground"
              : "rounded-tr-none bg-bubble-user text-bubble-user-foreground",
          ].join(" ")}
        >
          {message.blocks.map((block, i) =>
            block.type === "text" ? (
              <ReactMarkdown
                key={i}
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
              >
                {block.content}
              </ReactMarkdown>
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
                : "text-bubble-user-foreground/70 text-right",
            ].join(" ")}
          >
            {message.time}
          </p>
        </div>
      </div>
    </div>
  );
}
