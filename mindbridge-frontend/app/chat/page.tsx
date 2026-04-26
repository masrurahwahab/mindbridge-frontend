"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Brain, AlertTriangle, Loader2, Wind } from "lucide-react";
import { AppProvider, useApp } from "@/lib/app-state";
import { AppNav } from "@/components/app-nav";
import { BreathingExercise } from "@/components/breathing-exercise";
import { format } from "date-fns";

function ChatContent() {
  const { user, chatMessages, sendMessage, isLoading, initialized } = useApp();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [showBreathing, setShowBreathing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialized && !user) router.push("/login");
  }, [user, router, initialized]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // Auto-trigger breathing exercise on distress
    const lastMsg = chatMessages[chatMessages.length - 1];
    if (lastMsg?.role === "assistant" && lastMsg?.isDistress) {
      setTimeout(() => setShowBreathing(true), 1500);
    }
  }, [chatMessages]);

  const handleSend = async () => {
    const msg = input.trim();
    if (!msg || isLoading) return;
    setInput("");
    await sendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <BreathingExercise open={showBreathing} onClose={() => setShowBreathing(false)} />
      <AppNav />
      <main className="flex-1 flex flex-col h-screen md:h-screen">
        {/* Header */}
        <div className="border-b border-border/50 px-6 py-4 flex items-center gap-3 md:mt-0 mt-14">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif font-semibold text-foreground">MindBridge AI</h1>
            <p className="text-xs text-muted-foreground">Your emotional support companion</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6">
          {chatMessages.length === 0 && (
            <motion.div
              className="flex flex-col items-center justify-center h-full text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-breathe">
                <Brain className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground mb-3">
                Hi {user.name}! How are you feeling?
              </h2>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                I'm here to listen and support you. Share whatever's on your mind —
                there's no judgment here.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {["I'm feeling anxious today", "I need someone to talk to", "I'm having a good day!"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }}
                    className="px-4 py-2 rounded-full bg-muted/50 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-all border border-border/50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          <AnimatePresence initial={false}>
            {chatMessages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] md:max-w-[60%] ${msg.role === "user" ? "order-2" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                        <Brain className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">MindBridge AI</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-5 py-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : msg.isDistress
                        ? "bg-amber-500/10 border border-amber-500/30 text-foreground rounded-bl-md"
                        : "bg-muted/50 text-foreground rounded-bl-md neu-flat"
                    }`}
                  >
                    {msg.isDistress && (
                      <div className="flex items-center justify-between mb-3 pb-3 border-b border-amber-500/20">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium text-amber-400">Safety Resources</span>
                        </div>
                        <button
                          onClick={() => setShowBreathing(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-300 text-xs font-medium hover:bg-blue-500/25 transition-colors"
                        >
                          <Wind className="w-3 h-3" />
                          Take a breath
                        </button>
                      </div>
                    )}
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content.split("\n").map((line, i) => {
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={i} className="font-semibold mt-1">{line.replace(/\*\*/g, "")}</p>;
                        }
                        if (line.startsWith("•")) {
                          return <p key={i} className="ml-2">{line}</p>;
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </div>
                  <p className={`text-[10px] mt-1.5 text-muted-foreground ${msg.role === "user" ? "text-right" : ""}`}>
                    {format(new Date(msg.timestamp), "h:mm a")}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                <Brain className="w-3 h-3 text-primary" />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-muted/50">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Thinking...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border/50 px-4 md:px-8 py-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-3">
              <Textarea
                ref={textareaRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                className="flex-1 min-h-[48px] max-h-32 resize-none rounded-xl bg-muted/50 border-border/50 focus:border-primary px-4 py-3 text-sm"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              MindBridge is not a replacement for professional mental health care.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AppProvider>
      <ChatContent />
    </AppProvider>
  );
}








