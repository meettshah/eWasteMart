"use client";

import axios from "axios";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Bot, User, Sparkles, Trash2 } from "lucide-react";
import MarkdownRenderer from "./MarkdownRenderer";

// Feature 1C: Multi-turn Chatbot (Generative AI & Expert Domain Engine)
// Maintains full conversation history and sends it to the server
// for stateful LLM interaction across multiple turns.
const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: "Hello! I am the eWasteMart AI Intelligence Assistant. Ask me about live marketplace offers, fuzzy bid evaluations, scrap commodity rates, or how to list your e-waste lot!", 
      sender: "bot" 
    }
  ]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (input.trim() === "" || loading) return;

    const userText = input.trim();
    const userMessage = { text: userText, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("/api/openai", {
        content: userText,
        history: conversationHistory,
      });
      const botText = res.data.completion;
      const botMessage = { text: botText, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);

      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: userText },
        { role: "assistant", content: botText },
      ]);
    } catch (error) {
      const botMessage = { 
        text: error.response?.data?.message || "eWasteMart AI is running. You can manage lots in [Marketplace](/marketplace) or view your [Orders](/orders).", 
        sender: "bot" 
      };
      setMessages((prev) => [...prev, botMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setConversationHistory([]);
    setMessages([{ text: "Conversation history cleared. How can I assist you with circular e-waste management today?", sender: "bot" }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex h-[540px] w-[390px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 shadow-2xl backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-900/95"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-4 py-3.5 text-white shadow-xs">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="font-heading text-xs font-bold leading-none text-white">eWasteMart Intelligence</h3>
                  <p className="text-[10px] text-emerald-100 mt-1">Multi-Turn GenAI · {Math.floor(conversationHistory.length / 2)} turns memory</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {conversationHistory.length > 0 && (
                  <button onClick={clearHistory} title="Clear conversation" className="rounded-lg p-1.5 hover:bg-white/20 transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="rounded-lg p-1.5 hover:bg-white/20 transition-colors" aria-label="Close chat">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-end gap-2 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs ${
                    message.sender === "user" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}>
                    {message.sender === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div
                    className={`max-w-[85%] break-words rounded-2xl px-4 py-2.5 leading-relaxed text-xs ${
                      message.sender === "user"
                        ? "bg-emerald-600 text-white rounded-br-none shadow-sm whitespace-pre-wrap"
                        : "bg-slate-100/90 text-slate-800 dark:bg-slate-800/80 dark:text-slate-200 rounded-bl-none border border-slate-200/80 dark:border-slate-700/60"
                    }`}
                  >
                    {message.sender === "bot" ? (
                      <MarkdownRenderer content={message.text} />
                    ) : (
                      message.text
                    )}
                  </div>
                </div>
              ))}
              
              {loading && (
                <div className="flex items-end gap-2 flex-row">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex max-w-[85%] items-center gap-1.5 rounded-2xl rounded-bl-none bg-slate-100 px-4 py-3 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-emerald-500"></motion.div>
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-emerald-500"></motion.div>
                    <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-emerald-500"></motion.div>
                  </div>
                </div>
              )}
              <div ref={endOfMessagesRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="border-t border-slate-200/80 bg-white/90 p-3.5 dark:border-slate-800 dark:bg-slate-900/90 backdrop-blur-md">
              <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-3.5 py-1.5 shadow-xs transition-all focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-3 focus-within:ring-emerald-500/15 dark:border-slate-700 dark:bg-slate-800/90 dark:focus-within:bg-slate-800">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about scrap value or fuzzy rating..."
                  className="flex-1 bg-transparent px-1 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 border-0 shadow-none outline-none focus:outline-none focus:ring-0 dark:text-white dark:placeholder:text-slate-500 leading-relaxed"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs transition-all hover:bg-emerald-500 active:scale-95 disabled:opacity-35 disabled:hover:bg-emerald-600 disabled:active:scale-100"
                  aria-label="Send message"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Launcher Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-600/30 ring-1 ring-white/20 transition-all"
        aria-label="Toggle AI Assistant"
      >
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-white shadow-sm ring-2 ring-white dark:ring-slate-900">
          <Sparkles className="h-2.5 w-2.5" />
        </div>
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}>
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default Chatbot;
