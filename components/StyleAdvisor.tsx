
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { getStyleAdvice } from '../services/geminiService';
import Spinner from './Spinner';
import { PhoenixIcon } from './icons/PhoenixIcon';

const StyleAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { text, sources } = await getStyleAdvice(userMessage.text);
      const aiMessage: ChatMessage = { sender: 'ai', text, sources };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col h-[70vh] bg-slate-800 rounded-lg shadow-2xl">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && <PhoenixIcon className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />}
            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-700'}`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">Sources:</h4>
                  <ul className="text-xs space-y-1">
                    {msg.sources.map((source, i) => (
                      <li key={i}>
                        <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline break-all">
                          {i + 1}. {source.web.title || source.web.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-start gap-3">
            <PhoenixIcon className="w-8 h-8 text-amber-500 flex-shrink-0 mt-1" />
            <div className="max-w-md p-3 rounded-lg bg-slate-700 flex items-center">
              <Spinner />
              <span className="ml-2 text-slate-400">Thinking...</span>
            </div>
          </div>
        )}
        {error && <div className="bg-red-900/50 text-red-300 p-3 rounded-lg text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex items-center bg-slate-700 rounded-lg p-1">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for fashion advice..."
            className="flex-1 bg-transparent px-3 py-2 text-white placeholder-slate-400 focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="bg-amber-600 text-white rounded-md p-2 hover:bg-amber-500 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StyleAdvisor;
