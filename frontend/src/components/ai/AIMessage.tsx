import { Sparkles, User } from "lucide-react";

export interface AIMessageData {
  role: "user" | "assistant";
  content: string;
}

interface AIMessageProps extends AIMessageData {}

export function AIMessage({ role, content }: AIMessageProps) {
  const isAssistant = role === "assistant";

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
          isAssistant ? "bg-insight/10 text-insight" : "bg-primary/10 text-primary"
        }`}
      >
        {isAssistant ? (
          <Sparkles className="size-4" aria-hidden="true" />
        ) : (
          <User className="size-4" aria-hidden="true" />
        )}
      </div>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
          isAssistant ? "bg-insight/10 text-foreground" : "bg-primary text-primary-foreground"
        }`}
      >
        <p className="whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}
