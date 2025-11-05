"use client";

import Textarea from "react-textarea-autosize";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  value, 
  onChange, 
  onSubmit, 
  isLoading = false,
  placeholder = "Mensagem"
}: ChatInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!value.trim() || isLoading) return;
    
    // Feedback tátil iOS
    if (navigator.vibrate) {
      navigator.vibrate(30);
    }
    
    onSubmit();
    textareaRef.current?.focus();
  };

  // Auto-focus ao montar (experiência iOS)
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const hasContent = value.trim().length > 0;

  return (
    <form onSubmit={handleFormSubmit} className="relative">
      <motion.div
        animate={{
          scale: isFocused ? 1.01 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="relative"
      >
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full resize-none rounded-[22px] border border-white/10 bg-gray-900/50 pl-4 pr-14 py-3 text-[16px] text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30 transition-all duration-200"
          minRows={1}
          maxRows={6}
          disabled={isLoading}
        />
        
        <AnimatePresence mode="wait">
          {hasContent && !isLoading && (
            <motion.button
              key="send"
              type="submit"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 30
              }}
              whileTap={{ scale: 0.9 }}
              className="absolute right-1.5 bottom-[7px] flex h-9 w-9 items-center justify-center rounded-full bg-purple-600 text-white shadow-lg active:shadow-md transition-shadow"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          )}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute right-4 bottom-3.5"
          >
            <div className="h-5 w-5 rounded-full border-2 border-purple-600 border-t-transparent animate-spin" />
          </motion.div>
        )}
      </motion.div>
    </form>
  );
}
