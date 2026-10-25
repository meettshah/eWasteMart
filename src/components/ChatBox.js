"use client"
import axios from 'axios';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! I'm the eWasteMart AI assistant. Ask me anything about how the app works!", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endOfMessagesRef = useRef(null);

    const scrollToBottom = () => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const renderMessageText = (text) => {
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;

        while ((match = linkRegex.exec(text)) !== null) {
            if (match.index > lastIndex) {
                parts.push(text.substring(lastIndex, match.index));
            }
            parts.push(
                <Link 
                    key={match.index} 
                    href={match[2]} 
                    className="font-bold underline decoration-primary/50 underline-offset-2 hover:text-primary transition-colors"
                >
                    {match[1]}
                </Link>
            );
            lastIndex = linkRegex.lastIndex;
        }
        
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }

        return parts.length > 0 ? parts : text;
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSendMessage = async (e) => {
        if (e) e.preventDefault();
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const res = await axios.post('/api/openai', { content: input });
            const botMessage = { text: res.data.completion, sender: 'bot' };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            const botMessage = { text: error.response?.data?.message || 'Support assistant is unavailable right now.', sender: 'bot' };
            setMessages((prev) => [...prev, botMessage]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="glass-card mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden shadow-2xl dark:shadow-primary/10"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between bg-primary px-4 py-3 text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-5 w-5" />
                                <h3 className="font-semibold">eWasteMart Assistant</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/20 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message, index) => (
                                <div
                                    key={index}
                                    className={`flex items-end gap-2 ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${message.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300'}`}>
                                        {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                    </div>
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                                            message.sender === 'user'
                                                ? 'bg-primary text-white rounded-br-sm'
                                                : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 rounded-bl-sm border border-gray-200 dark:border-gray-700'
                                        }`}
                                    >
                                        {renderMessageText(message.text)}
                                    </div>
                                </div>
                            ))}
                            
                            {loading && (
                                <div className="flex items-end gap-2 flex-row">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                        <Bot className="h-4 w-4" />
                                    </div>
                                    <div className="flex max-w-[75%] items-center gap-1 rounded-2xl rounded-bl-sm bg-gray-100 px-4 py-3 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="h-1.5 w-1.5 rounded-full bg-gray-500"></motion.div>
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="h-1.5 w-1.5 rounded-full bg-gray-500"></motion.div>
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="h-1.5 w-1.5 rounded-full bg-gray-500"></motion.div>
                                    </div>
                                </div>
                            )}
                            <div ref={endOfMessagesRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="border-t border-gray-200 bg-gray-50/50 p-3 dark:border-gray-800 dark:bg-gray-900/50 backdrop-blur-sm">
                            <div className="flex items-center gap-2 rounded-full border border-gray-300 bg-white px-3 py-2 shadow-sm focus-within:border-primary focus-within:ring-1 focus-within:ring-primary dark:border-gray-700 dark:bg-gray-800">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask about e-waste..."
                                    className="flex-1 bg-transparent px-2 text-sm outline-none dark:text-white"
                                    disabled={loading}
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-primary-600 disabled:opacity-50"
                                >
                                    <Send className="h-4 w-4 shrink-0 -ml-0.5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-shadow hover:shadow-xl"
            >
                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500">
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
