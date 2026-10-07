"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Phone,
  MessageCircle,
  Paperclip,
  Mic,
  Send,
  MapPin,
  Navigation,
  ShieldAlert,
  Star,
  CheckCircle2,
  Clock,
  MoreVertical,
  Camera,
  type LucideIcon,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   TYPES & MOCK DATA
   ══════════════════════════════════════════════════════════════════ */

interface ChatMessage {
  id: string;
  sender: "vendor" | "customer";
  text: string;
  time: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { id: "1", sender: "vendor", text: "Sir, I have reached the main gate.", time: "10:42 AM" },
  { id: "2", sender: "customer", text: "Come inside, flat number 402.", time: "10:43 AM" },
];

const VENDOR = {
  name: "Raju Mechanic",
  trade: "Appliance Expert",
  rating: 4.8,
  jobs: 120,
  phone: "+91 98765 43210",
  emoji: "⚡",
};

/* ══════════════════════════════════════════════════════════════════
   SECTION 1: HEADER & MAP
   ══════════════════════════════════════════════════════════════════ */

function LiveMap({ statusIndex }: { statusIndex: number }) {
  const statuses = ["Accepted", "On the Way", "Reached"];
  const currentStatus = statuses[statusIndex];

  return (
    <div className="relative w-full h-[45vh] bg-slate-200 overflow-hidden flex-shrink-0">
      {/* Mock Map Background Grid */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

      {/* Floating Header Buttons */}
      <div className="absolute top-0 inset-x-0 p-4 pt-safe flex justify-between items-start z-20">
        <Link
          href="/"
          className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-gray-800" />
        </Link>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 border border-red-200 shadow-sm active:scale-95 transition-transform">
          <ShieldAlert className="w-4 h-4 text-red-600" />
          <span className="text-xs font-bold text-red-600">SOS</span>
        </button>
      </div>

      {/* Mock Route & Pins */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center -mt-10">
        {/* Customer Location (Home) */}
        <div className="absolute top-1/4 left-1/4 flex flex-col items-center animate-fade-in-up">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md" />
          </div>
          <span className="mt-1 bg-white/90 px-2 py-0.5 rounded shadow-sm text-[10px] font-bold text-gray-800 backdrop-blur-sm">Home</span>
        </div>

        {/* Vendor Location (Moving) */}
        <div className={`absolute transition-all duration-1000 ease-in-out flex flex-col items-center
          ${statusIndex === 0 ? "top-[70%] left-[70%]" : statusIndex === 1 ? "top-1/2 left-1/2" : "top-[28%] left-[28%]"}`}>
          
          {/* Pulsing effect */}
          <div className="relative w-12 h-12 flex items-center justify-center">
            {statusIndex < 2 && (
              <div className="absolute inset-0 rounded-full bg-accent/30 animate-ping" />
            )}
            <div className="relative w-8 h-8 rounded-full bg-accent border-2 border-white shadow-lg flex items-center justify-center text-sm z-10">
              {VENDOR.emoji}
            </div>
          </div>
          <span className="mt-1 bg-white/90 px-2 py-0.5 rounded shadow-sm text-[10px] font-bold text-gray-800 backdrop-blur-sm truncate max-w-[80px]">
            {VENDOR.name}
          </span>
        </div>

        {/* Dashed Line SVG (Mock connection) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <path
            d="M 25% 25% Q 50% 70% 70% 70%"
            fill="none"
            stroke="#6366f1"
            strokeWidth="3"
            strokeDasharray="6,6"
            className="opacity-40"
          />
        </svg>

        {/* View Route Button */}
        <button className="absolute bottom-32 bg-gray-900/80 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 shadow-lg hover:bg-gray-800 active:scale-95 transition-all">
          <Navigation className="w-3.5 h-3.5" />
          View Route
        </button>
      </div>

      {/* Live Status Card Overlapping the Map */}
      <div className="absolute bottom-0 inset-x-0 z-30 px-4 pb-4">
        <div className="bg-white rounded-2xl p-4 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 leading-tight">
                {statusIndex === 0 && `${VENDOR.name} accepted job`}
                {statusIndex === 1 && `${VENDOR.name} is on the way`}
                {statusIndex === 2 && `${VENDOR.name} has arrived`}
              </h2>
              <p className="text-xs text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {statusIndex < 2 ? "Arriving in 10 mins" : "At your location"}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative flex justify-between items-center">
            {/* Connecting line */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-100 rounded-full" />
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent rounded-full transition-all duration-500 ease-in-out" 
              style={{ width: `${(statusIndex / 2) * 100}%` }}
            />
            
            {/* Dots */}
            {statuses.map((s, i) => {
              const isPast = i <= statusIndex;
              const isCurrent = i === statusIndex;
              return (
                <div key={s} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-300 bg-white
                    ${isPast ? "border-accent text-accent" : "border-gray-200 text-transparent"}`}>
                    {isPast && <CheckCircle2 className="w-3 h-3" />}
                  </div>
                  <span className={`absolute top-6 whitespace-nowrap text-[9px] font-bold transition-colors
                    ${isCurrent ? "text-gray-900" : isPast ? "text-gray-600" : "text-gray-400"}`}>
                    {s}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="h-4" /> {/* Spacer for labels */}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 2: VENDOR PROFILE & PIN
   ══════════════════════════════════════════════════════════════════ */

function TrustProfile() {
  return (
    <div className="bg-white px-4 py-4 flex-shrink-0 z-40 border-b border-gray-100 shadow-sm relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center text-2xl border border-accent/10 shadow-inner flex-shrink-0">
            {VENDOR.emoji}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              {VENDOR.name}
            </h3>
            <p className="text-[10px] text-gray-500">{VENDOR.trade}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-[10px] font-bold text-gray-700">{VENDOR.rating}</span>
              <span className="text-[10px] text-gray-400">({VENDOR.jobs} jobs)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a href={`tel:${VENDOR.phone.replace(/\s/g, "")}`} className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-100 active:scale-95 transition-all shadow-sm">
            <Phone className="w-4 h-4 fill-emerald-600" />
          </a>
          {/* Removed separate message button since chat is below */}
        </div>
      </div>

      {/* Secret PIN Box */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gray-900 flex items-center justify-center">
            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider leading-none">Secure PIN</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Give to expert to start</p>
          </div>
        </div>
        <div className="text-2xl font-black text-gray-900 tracking-widest bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
          8492
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   SECTION 3: IN-APP CHAT
   ══════════════════════════════════════════════════════════════════ */

function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: "customer",
      text: inputText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#efeae2] relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/az-subtle.png')]" />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
        {/* Date bubble */}
        <div className="flex justify-center mb-4">
          <span className="bg-white/80 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm backdrop-blur-sm">
            TODAY
          </span>
        </div>

        {messages.map((msg) => {
          const isCustomer = msg.sender === "customer";
          return (
            <div key={msg.id} className={`flex ${isCustomer ? "justify-end" : "justify-start"}`}>
              <div 
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm relative
                  ${isCustomer 
                    ? "bg-[#dcf8c6] rounded-tr-sm text-gray-900" 
                    : "bg-white rounded-tl-sm border border-gray-100 text-gray-800"}`}
              >
                <p className="text-[13px] leading-snug break-words">
                  {msg.text}
                </p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${isCustomer ? "text-emerald-700/70" : "text-gray-400"}`}>
                  <span className="text-[9px] font-medium">{msg.time}</span>
                  {isCustomer && <CheckCircle2 className="w-3 h-3" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-gray-100 px-2 py-2 flex items-end gap-2 z-20 pb-safe">
        <div className="flex-1 bg-white rounded-3xl flex items-end gap-2 px-3 py-1.5 border border-gray-200 shadow-sm min-h-[44px]">
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mb-0.5">
            <Paperclip className="w-5 h-5" />
          </button>
          
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none resize-none text-[13px] py-2 max-h-[80px] text-gray-800"
            style={{ minHeight: '32px' }}
          />

          {!inputText.trim() ? (
            <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 mb-0.5">
              <Camera className="w-5 h-5" />
            </button>
          ) : null}
        </div>

        <button 
          onClick={handleSend}
          className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-all
            ${inputText.trim() ? "bg-accent text-white" : "bg-emerald-500 text-white"}`}
        >
          {inputText.trim() ? (
            <Send className="w-5 h-5 ml-0.5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN PAGE LAYOUT
   ══════════════════════════════════════════════════════════════════ */

export default function TrackOrderPage() {
  const [statusIndex, setStatusIndex] = useState(0);

  // Simulate vendor moving
  useEffect(() => {
    if (statusIndex >= 2) return;
    const timer = setTimeout(() => {
      setStatusIndex(prev => prev + 1);
    }, 4000); // Progress every 4 seconds for demo
    return () => clearTimeout(timer);
  }, [statusIndex]);

  return (
    <div className="bg-black min-h-[100dvh]">
      {/* Mobile container - strictly using flex column for 50/50 split */}
      <div className="max-w-md mx-auto bg-white h-[100dvh] flex flex-col relative overflow-hidden shadow-2xl">
        
        {/* Section 1: Live Map (Fixed height top section) */}
        <LiveMap statusIndex={statusIndex} />

        {/* Section 2: Trust Profile (Divider) */}
        <TrustProfile />

        {/* Section 3: WhatsApp Style Chat (Fills remaining height) */}
        <ChatInterface />

      </div>
    </div>
  );
}
