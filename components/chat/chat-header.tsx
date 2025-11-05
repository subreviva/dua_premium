"use client";

import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export function ChatHeader() {
  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-center gap-2 px-4 py-4 bg-black/95 backdrop-blur-xl border-b border-white/5"
    >
      <motion.div
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3
        }}
      >
        <Sparkles className="h-5 w-5 text-purple-400" />
      </motion.div>
      <h1 className="text-lg font-semibold tracking-tight">DUA</h1>
    </motion.header>
  );
}
