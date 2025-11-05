"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.4,
        ease: [0.25, 1, 0.5, 1] // Curva de animação natural iOS
      }}
      className={cn(
        "flex items-end gap-2 px-4 py-1.5",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-[22px] px-4 py-3 shadow-md",
          isUser
            ? "bg-purple-600 text-white rounded-br-lg" // "Cauda" estilo iMessage
            : "bg-gray-800 text-gray-100 rounded-bl-lg"
        )}
      >
        <p className="text-[16px] leading-relaxed whitespace-pre-wrap break-words">
          {message.content}
        </p>
      </div>
    </motion.div>
  );
}
