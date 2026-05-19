import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Send, Bot, User, Loader2, Sparkles, Settings } from 'lucide-react';
import * as motion from 'motion/react-client';

type Message = {
  id: string;
  role: 'user' | 'model';
  content: string;
};

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      content: "Hello! I'm a fast and efficient AI model. What can I help you with today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyForApi = messages.map(m => ({ role: m.role, content: m.content })).concat({ role: 'user', content: userMessage.content });
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historyForApi }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const modelMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.text,
      };

      setMessages((prev) => [...prev, modelMessage]);
    } catch (error: any) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `**Error**: ${error.message || 'Something went wrong. Please try again.'}`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#Fdfdfc] text-[#1a1a1a] font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[#f4f3ef] border-r border-[#e8e6df] hidden md:flex flex-col">
        <div className="p-4 border-b border-[#e8e6df] flex items-center gap-2">
          <div className="bg-orange-500 rounded p-1.5 shadow-sm text-white flex-shrink-0">
            <Sparkles size={18} />
          </div>
          <span className="font-semibold text-sm tracking-tight">Efficient AI Chat</span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-xs font-semibold text-[#8a8a8a] uppercase tracking-wider mb-3">Model</div>
          <div className="bg-[#e8e6df] text-sm text-[#3b3a38] px-3 py-2 rounded-md font-medium border border-[#dddcd5]">
            Gemini Flash
          </div>
          <p className="mt-2 text-xs text-[#8a8a8a] leading-relaxed">
            Running on a high-speed, highly-efficient inference engine, similar in performance characteristics to light, fast open weights models (e.g., fast Mistral & Llama deployments).
          </p>
        </div>

        <div className="p-4 border-t border-[#e8e6df] flex items-center gap-2 text-xs text-[#8a8a8a] cursor-pointer hover:text-[#1a1a1a] transition-colors">
          <Settings size={14} />
          System Settings
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden p-3 border-b border-[#e8e6df] bg-white flex items-center gap-2 shadow-sm z-10">
          <div className="bg-orange-500 rounded p-1 shadow-sm text-white">
            <Sparkles size={16} />
          </div>
          <span className="font-semibold text-sm">Efficient AI Chat</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                key={message.id}
                className={`flex gap-4 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'model' && (
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border border-orange-200">
                    <Bot size={18} className="text-orange-600" />
                  </div>
                )}
                
                <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                  message.role === 'user' 
                    ? 'bg-zinc-800 text-white rounded-br-sm shadow-sm' 
                    : 'bg-white border border-[#e8e6df] shadow-sm rounded-tl-sm'
                }`}>
                  {message.role === 'user' ? (
                    <div className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</div>
                  ) : (
                    <div className="prose prose-sm prose-orange max-w-none text-[#1a1a1a]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center flex-shrink-0 border border-zinc-300">
                    <User size={18} className="text-zinc-600" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-4"
              >
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border border-orange-200">
                  <Bot size={18} className="text-orange-600" />
                </div>
                <div className="bg-white border border-[#e8e6df] shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                  <Loader2 size={16} className="text-orange-500 animate-spin" />
                  <span className="text-sm text-zinc-500 font-medium">Processing...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-[#e8e6df] shrink-0 z-10 w-full relative">
          <div className="max-w-3xl mx-auto w-full relative">
            <form onSubmit={handleSubmit} className="relative flex items-end shadow-sm border border-[#e8e6df] bg-[#f9f9f9] rounded-2xl focus-within:ring-2 focus-within:ring-orange-500/20 focus-within:border-orange-500/50 transition-all overflow-hidden gap-2 p-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Message the AI..."
                className="w-full bg-transparent border-0 focus:ring-0 resize-none py-3 pl-3 pr-2 text-sm leading-relaxed max-h-32 min-h-[44px]"
                rows={1}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="shrink-0 max-h-11 self-end p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors mb-0.5 mr-0.5 flex items-center justify-center shadow-sm"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="text-center mt-2.5">
              <p className="text-[11px] text-zinc-400">AI can make mistakes. Consider verifying important information.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
