"use client";

import { Virtuoso } from "react-virtuoso";
import { ChatMessage } from "./chat-message";
import { TypingIndicator } from "./typing-indicator";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatMessagesProps {
  className?: string;
  messages: Message[];
  isLoading?: boolean;
}

export function ChatMessages({ className, messages, isLoading }: ChatMessagesProps) {
  return (
    <div className={className}>
      <Virtuoso
        data={messages}
        initialTopMostItemIndex={messages.length > 0 ? messages.length - 1 : 0}
        followOutput="smooth"
        alignToBottom
        itemContent={(index, message) => (
          <ChatMessage key={message.id} message={message} />
        )}
        components={{
          Footer: () => isLoading ? <TypingIndicator /> : null,
        }}
      />
    </div>
  );
}
