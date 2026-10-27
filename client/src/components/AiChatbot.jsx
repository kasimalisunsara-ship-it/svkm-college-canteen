import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Calendar, Utensils, MessageSquare, Flower2, Zap } from 'lucide-react';

export const AiChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "👋 Hi! I'm **BiteBot AI**, your SVKM Canteen assistant. Ask me for the **full week special menu**, **Jain food items**, 100% Pure Veg dishes, or recommendations!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend || !textToSend.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      setLoading(false);

      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: data.reply || "Sorry, I couldn't process that right now.",
        specials: data.specials || null,
        special: data.special || null
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'bot', text: 'Network error connecting to AI assistant.' }
      ]);
    }
  };

  const QUICK_PROMPTS = [
    { label: "Full Week Specials", query: "Show me the full week special menu", icon: Calendar },
    { label: "Jain Food Items 🪷", query: "Show me Jain food options", icon: Flower2 },
    { label: "Today's Special", query: "What is today's special menu?", icon: Utensils },
    { label: "Under ₹100 Meals", query: "Recommend food under 100", icon: Zap }
  ];

  return (
    <>
      {/* Floating Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-2xl shadow-orange-500/40 hover:scale-105 transition-all flex items-center gap-2.5 active:scale-95 group border border-white/20"
      >
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md group-hover:rotate-12 transition-transform">
          <Bot className="w-5 h-5 text-white" />
        </div>
        <span className="hidden sm:inline">Ask BiteBot AI</span>
        <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black uppercase">
          Veg & Jain Specials
        </span>
      </button>

      {/* Chat Drawer Popup */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 sm:right-6 sm:bottom-20 sm:inset-y-auto z-50 w-full sm:max-w-md bg-white sm:rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-slide-up sm:h-[620px]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                  BiteBot AI <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                </h3>
                <span className="text-[10px] text-orange-300 font-semibold block">
                  SVKM Canteen • Veg & Jain Food Assistant
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-slate-100/80 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {QUICK_PROMPTS.map((qp, idx) => {
              const Icon = qp.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSend(qp.query)}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 hover:text-orange-700 text-slate-700 text-[11px] font-bold border border-slate-200 shadow-2xs whitespace-nowrap flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <Icon className="w-3 h-3 text-orange-600" /> {qp.label}
                </button>
              );
            })}
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs leading-relaxed space-y-2 ${
                    msg.sender === 'user'
                      ? 'bg-orange-600 text-white font-medium rounded-tr-none shadow-md'
                      : 'bg-white text-slate-800 border border-slate-200/90 shadow-sm rounded-tl-none font-medium'
                  }`}
                >
                  <div className="whitespace-pre-line">{msg.text}</div>

                  {/* Render Special Cards if returned */}
                  {msg.specials && (
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {msg.specials.map((spec, i) => (
                        <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                          <img
                            src={spec.image}
                            alt={spec.day}
                            className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-black text-orange-600 uppercase block">{spec.day}</span>
                            <span className="font-bold text-slate-900 text-xs block truncate">{spec.specialItem}</span>
                            <span className="font-black text-slate-800 text-xs">₹{spec.price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 bg-white p-3 rounded-2xl border border-slate-200 w-fit shadow-sm">
                <div className="w-2 h-2 rounded-full bg-orange-600 animate-ping" />
                <span className="text-xs text-slate-500 font-semibold">BiteBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about Veg, Jain items or weekly specials..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-semibold"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
