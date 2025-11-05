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
        followOutput="smooth" // Scroll suave para novas mensagens
        alignToBottom
        itemContent={(index, message) => (
          <ChatMessage key={message.id} message={message} />
        )}
        components={{
          // Mostra o indicador "a escrever" no rodapé
          Footer: () => (isLoading && messages.length > 0) ? <TypingIndicator /> : null,
        }}
      />
    </div>
  );
}
