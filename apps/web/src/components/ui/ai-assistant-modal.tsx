"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Bot, CheckCircle2, Send, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { registerAiAssistantTrigger } from "./ai-assistant-button";

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  orderSummary?: {
    items: string[];
    subtotal: string;
    fulfillment: string;
  };
}

export function AiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Selam! I am your AI Cafe assistant. You can tell me what you're craving, asking for dietary recommendations, or ordering your regular brew in natural language.",
      timestamp: "Just now",
    },
  ]);

  useEffect(() => {
    registerAiAssistantTrigger(() => setIsOpen(true));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");

    // Simulate intelligent cafe ordering assistant response
    setTimeout(() => {
      let reply: ChatMessage;
      if (
        text.toLowerCase().includes("cappuccino") ||
        text.toLowerCase().includes("croissant")
      ) {
        reply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "I've structured your order for 2 Cappuccinos and 1 Cardamom Croissant scheduled for pickup at 5:00 PM. Verified live pricing with kitchen inventory.",
          timestamp: "Just now",
          orderSummary: {
            items: [
              "2x Pistachio Highland Latte ($14.50)",
              "1x Cardamom Croissant ($5.50)",
            ],
            subtotal: "$20.00",
            fulfillment: "Pickup @ 5:00 PM",
          },
        };
      } else if (
        text.toLowerCase().includes("vegan") ||
        text.toLowerCase().includes("plant")
      ) {
        reply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: "For a plant-based feast, I highly recommend our Grand Vegan Beyaynetu Rainbow Platter ($18.00) served with 100% teff injera, paired with Nitro Cardamom Cold Brew ($6.75). Both are 100% vegan and kitchen verified.",
          timestamp: "Just now",
        };
      } else {
        reply = {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: `Great taste! I've noted: "${text}". Real-time extraction telemetry and price calculations are verified directly from our server menu.`,
          timestamp: "Just now",
          orderSummary: {
            items: ["1x Ceremonial Yirgacheffe Pour-Over ($6.50)"],
            subtotal: "$6.50",
            fulfillment: "Dine-In",
          },
        };
      }
      setMessages((prev) => [...prev, reply]);
    }, 600);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Order with AI assistant"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-xs"
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
          className="w-full sm:max-w-lg bg-white rounded-t-[32px] sm:rounded-[32px] shadow-2xl border border-stone-200/90 overflow-hidden flex flex-col h-[85vh] sm:h-[620px]"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-gradient-to-r from-forest to-forest-2 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-meadow">
                <Bot className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-wide">
                    Sable AI Concierge
                  </h3>
                  <span className="w-2 h-2 rounded-full bg-meadow" />
                </div>
                <p className="text-[11px] text-stone-300">
                  SRS FR-AI-001 Preview • Real-time menu intelligence
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-full text-stone-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick prompts */}
          <div className="p-3 bg-cream border-b border-border flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] font-bold text-sage uppercase tracking-wider shrink-0">
              Suggestions:
            </span>
            <button
              type="button"
              onClick={() =>
                handleSend("Two cappuccinos and a croissant, pickup at 5")
              }
              className="px-3 py-1.5 rounded-full bg-white border border-border hover:border-meadow hover:text-meadow-dark shrink-0 transition-colors font-medium text-[11px] cursor-pointer"
            >
              Cappuccinos &amp; croissant @ 5
            </button>
            <button
              type="button"
              onClick={() => handleSend("Show me vegan dishes")}
              className="px-3 py-1.5 rounded-full bg-white border border-border hover:border-meadow hover:text-meadow-dark shrink-0 transition-colors font-medium text-[11px] cursor-pointer"
            >
              Vegan dishes
            </button>
            <button
              type="button"
              onClick={() => handleSend("Ceremonial Jebena Buna with popcorn")}
              className="px-3 py-1.5 rounded-full bg-white border border-border hover:border-meadow hover:text-meadow-dark shrink-0 transition-colors font-medium text-[11px] cursor-pointer"
            >
              Jebena ritual
            </button>
          </div>

          {/* Messages container */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-cream/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-meadow-tint border border-meadow/30 flex items-center justify-center shrink-0 text-meadow-dark mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-meadow text-white rounded-tr-none shadow-sm font-medium"
                      : "bg-white text-forest border border-border rounded-tl-none shadow-forest"
                  }`}
                >
                  <p>{msg.text}</p>

                  {/* Render order preview summary if present */}
                  {msg.orderSummary && (
                    <div className="mt-3 pt-3 border-t border-border text-xs space-y-1.5 bg-cream-alt p-3 rounded-xl">
                      <p className="font-bold text-forest flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-meadow" />
                        Structured Cart Draft
                      </p>
                      <ul className="text-stone-600 space-y-0.5">
                        {msg.orderSummary.items.map((item) => (
                          <li key={item}>• {item}</li>
                        ))}
                      </ul>
                      <div className="flex justify-between font-bold pt-1 text-forest">
                        <span>Est. Subtotal:</span>
                        <span className="text-meadow-dark font-extrabold">
                          {msg.orderSummary.subtotal}
                        </span>
                      </div>
                      <p className="text-[10px] text-sage">
                        Fulfilment: {msg.orderSummary.fulfillment} • Final
                        prices validated at checkout
                      </p>
                    </div>
                  )}

                  <span className="block text-[10px] opacity-60 mt-1 text-right">
                    {msg.timestamp}
                  </span>
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center shrink-0 text-stone-700 mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 bg-white border-t border-border flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. 2 iced lattes with oat milk, to go..."
              className="flex-1 bg-cream border border-border rounded-full px-4 py-2.5 text-xs sm:text-sm text-forest placeholder-sage focus:outline-none focus:border-meadow focus:ring-2 focus:ring-meadow-tint"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-10 h-10 rounded-full bg-meadow hover:bg-meadow-alt active:bg-meadow-dark text-white flex items-center justify-center disabled:opacity-40 transition-all cursor-pointer shadow-forest shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
