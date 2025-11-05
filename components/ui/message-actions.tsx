"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  messageId: string;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

export function MessageActions({ content, messageId, onRegenerate, isRegenerating }: MessageActionsProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isCopied = copiedId === messageId;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(messageId);
      toast.success("Copiado!", {
        description: "Mensagem copiada para a área de transferência",
        duration: 2000,
      });
      
      // Reset após 2 segundos
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error("Erro ao copiar", {
        description: "Não foi possível copiar a mensagem",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.15 }}
      className="flex items-center gap-2"
    >
      {onRegenerate && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className={cn(
            "h-6 w-6 rounded-full transition-all duration-200",
            "bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-sm",
            "border border-white/10 shadow-lg",
            "active:scale-90 disabled:opacity-50"
          )}
        >
          <motion.div
            animate={isRegenerating ? { rotate: 360 } : { rotate: 0 }}
            transition={isRegenerating ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.2 }}
          >
            <RotateCw className="w-3 h-3 text-blue-400" />
          </motion.div>
        </Button>
      )}

      <Button
        size="icon"
        variant="ghost"
        onClick={handleCopy}
        className={cn(
          "h-6 w-6 rounded-full transition-all duration-200",
          "bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-sm",
          "border border-white/10 shadow-lg",
          "active:scale-90"
        )}
      >
        <AnimatePresence mode="wait">
          {isCopied ? (
            <motion.div
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Check className="w-3 h-3 text-green-400" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Copy className="w-3 h-3 text-neutral-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
