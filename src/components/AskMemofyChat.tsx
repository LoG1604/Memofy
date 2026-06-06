"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Sparkles, CornerDownLeft } from "lucide-react";
import { MeetingData } from "../lib/firebase-mock";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

interface AskMemofyChatProps {
  meeting: MeetingData;
}

export default function AskMemofyChat({ meeting }: AskMemofyChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `Hi! I've analyzed "${meeting.title}". You can ask me any questions about this meeting, like: \n- "What were the main conclusions?"\n- "Summarize the action items."\n- "What did Sarah discuss?"`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsgId = Math.random().toString(36).substring(2, 9);
    const userMessage: Message = {
      id: userMsgId,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call chat API endpoint
      const response = await fetch("/api/chat-meeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting,
          question: textToSend,
          chatHistory: messages.map((m) => ({
            role: m.sender === "user" ? "user" : "model",
            parts: [{ text: m.text }],
          })),
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to generate AI response");

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "ai",
          text: result.response,
          timestamp: new Date(),
        },
      ]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          sender: "ai",
          text: "Sorry, I encountered an issue processing your query. Please try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const suggestions = [
    "List key decisions.",
    "Show action items.",
    "Summarize this meeting.",
  ];

  return (
    <div className="flex flex-col h-full border border-zinc-800/80 bg-zinc-950/60 rounded-2xl overflow-hidden backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-zinc-900 bg-zinc-950/90">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
          <Sparkles className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Ask Memofy</h3>
          <p className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">AI Meeting Co-Pilot</p>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-4 min-h-[300px] max-h-[500px]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar */}
            <div
              className={`flex-shrink-0 h-7 w-7 rounded-lg border flex items-center justify-center ${
                msg.sender === "user"
                  ? "bg-violet-600 border-violet-500 text-white"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400"
              }`}
            >
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-violet-400" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-violet-600/10 border border-violet-500/20 text-violet-100 rounded-tr-none"
                  : "bg-zinc-900/50 border border-zinc-900 text-zinc-300 rounded-tl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 h-7 w-7 rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-450 flex items-center justify-center">
              <Bot className="w-4 h-4 text-violet-400" />
            </div>
            <div className="bg-zinc-900/30 border border-zinc-900 text-zinc-450 rounded-xl rounded-tl-none px-4 py-3 text-sm flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
              <span className="text-zinc-500">Memofy is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !loading && (
        <div className="px-4 pb-2 pt-2 border-t border-zinc-900 bg-zinc-950/20 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-zinc-900 bg-zinc-950/40">
        <div className="relative flex items-center border border-zinc-800 rounded-xl bg-zinc-900/30 focus-within:border-violet-500 transition-colors px-3 py-1.5">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Ask a question about the meeting..."
            className="flex-1 max-h-24 bg-transparent outline-none border-none text-sm text-zinc-100 placeholder-zinc-550 resize-none pr-12 focus:ring-0"
            style={{ height: "auto" }}
          />
          <button
            onClick={() => handleSend(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 bottom-1.5 p-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex justify-between items-center px-1 mt-1.5 text-[10px] text-zinc-650 font-medium">
          <span>AI response may take a few seconds</span>
          <span className="flex items-center gap-1">
            <span>Press Enter</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
