"use client"
import axios from 'axios';
import React, { useState } from 'react';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    const handleSendMessage = async () => {
        if (input.trim() === '') return;

        const userMessage = { text: input, sender: 'user' };
        setMessages([...messages, userMessage]);

        const res = await axios.post('/api/openai', { content: input });

        const botMessage = { text: res.data.completion, sender: 'bot' };
        setMessages([...messages, userMessage, botMessage]);

        setInput('');
    };

    return (
        <div>
            <div
                className="fixed bottom-4 right-4 dark:bg-gray-900 bg-gray-900 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-green"
                onClick={() => setIsOpen(!isOpen)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d={isOpen ? "M6 18L18 6M6 6l12 12" : "M12 19l7-7-7-7M5 12h14"}
                    />
                </svg>
            </div>

            {/* Chatbox */}
            {isOpen && (
                <div className="fixed bottom-16 z-40 right-4 w-80 dark:bg-gray-900 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
                    <div className="flex-grow h-64 overflow-y-scroll p-3 border-b border-gray-300">
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={`my-2 p-2 rounded-lg ${
                                    message.sender === 'user'
                                        ? 'bg-blue-500 text-white self-end'
                                        : 'bg-gray-200 text-black self-start'
                                }`}
                            >
                                {message.text}
                            </div>
                        ))}
                    </div>
                    <div className="flex mt-4 p-3 border-t border-gray-300">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="ml-2 bg-rgb(40, 109, 21) text-white p-2 rounded-lg hover:bg-blue-600"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chatbot;
