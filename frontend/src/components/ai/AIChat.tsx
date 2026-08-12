"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { authFetch } from "@/lib/auth-fetch";
import { ApiClientError } from "@/lib/api-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AIMessage, AIMessageData } from "./AIMessage";
import { Sparkles, Send } from "lucide-react";

interface ChatResponse {
  content: string;
  model: string;
  generatedAt: string;
}

interface AIChatProps {
  // Optional — if provided, the backend attaches this dataset's KPIs/trend
  // as context so the assistant can answer questions grounded in real data.
  datasetId?: string;
}

export function AIChat({ datasetId }: AIChatProps) {
  const [messages, setMessages] = useState<AIMessageData[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const userMessage: AIMessageData = { role: "user", content: trimmed };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);
    scrollToBottom();

    try {
      const result = await authFetch<ChatResponse>("/api/ai/chat", {
        method: "POST",
        body: {
          message: trimmed,
          history: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          ...(datasetId ? { datasetId } : {}),
        },
      });

      setMessages((prev) => [...prev, { role: "assistant", content: result.content }]);
    } catch (error) {
      toast.error(error instanceof ApiClientError ? error.message : "Failed to get a response");
      // Roll back the optimistic user message context isn't needed — keep it visible,
      // just surface the error so the user knows the assistant didn't reply.
    } finally {
      setIsSending(false);
      scrollToBottom();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Ask AGORYS
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 overflow-hidden">
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ask a question about your business data — e.g. &quot;Why did revenue decrease?&quot;
            </p>
          ) : (
            messages.map((m, i) => <AIMessage key={i} role={m.role} content={m.content} />)
          )}
          {isSending && (
            <AIMessage role="assistant" content="Thinking..." />
          )}
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Why did revenue decrease this month?"
            disabled={isSending}
          />
          <Button onClick={handleSend} disabled={isSending || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
