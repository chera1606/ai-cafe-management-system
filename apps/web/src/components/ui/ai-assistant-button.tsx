"use client";

import { motion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

let openAiAssistantHandler: (() => void) | null = null;

export function openAiAssistant() {
  if (openAiAssistantHandler) {
    openAiAssistantHandler();
  }
}

export function registerAiAssistantTrigger(fn: () => void) {
  openAiAssistantHandler = fn;
}

export function AiAssistantButton() {
  return (
    <motion.button
      type="button"
      onClick={() => openAiAssistant()}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-meadow hover:bg-meadow-alt active:bg-meadow-dark text-white shadow-forest border border-meadow-alt/30 transition-all cursor-pointer group"
      aria-label="Open AI Cafe Assistant"
    >
      <div className="relative">
        <Bot className="w-5 h-5 transition-transform group-hover:rotate-12" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber animate-ping" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber" />
      </div>

      <div className="text-left hidden sm:block">
        <p className="text-[11px] font-medium text-emerald-100 leading-none flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber" />
          AI Concierge
        </p>
        <p className="text-xs font-bold leading-tight mt-0.5">Order with AI</p>
      </div>
    </motion.button>
  );
}
