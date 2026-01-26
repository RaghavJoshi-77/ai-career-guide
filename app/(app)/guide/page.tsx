"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Header, HeaderSpacer } from "@/components/Header";
import Link from "next/link";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuidePage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  // Track if we have fetched history to prevent double-loading
  const [historyLoaded, setHistoryLoaded] = useState(false); 

  const { data: session, status } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatId = session?.user?.email;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // === NEW: FETCH HISTORY ON LOAD ===
  useEffect(() => {
    if (chatId && !historyLoaded) {
      setLoading(true);
      axios
        .get(`/api/groq-ai?chatId=${chatId}`)
        .then((res) => {
          const history = res.data.history || [];
          if (history.length > 0) {
            setMessages(history);
          }
        })
        .catch((err) => console.error("History fetch error:", err))
        .finally(() => {
            setLoading(false);
            setHistoryLoaded(true); // Mark as loaded so we don't re-fetch
        });
    }
  }, [chatId, historyLoaded]);

  // Loading Screen for Auth
  if (status === "loading") {
    return <div className="h-screen bg-black text-white flex items-center justify-center font-black text-xl tracking-wider">Loading Coach...</div>;
  }

  // Not Signed In
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-black text-white">
        <h1 className="text-5xl font-black mb-6 tracking-tighter">Please sign in to train.</h1>
        <Link href="/sign-in">
          <button className="bg-red-600 text-white px-10 py-4 rounded-full hover:bg-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-600/50 font-black uppercase tracking-wider">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (prompt.trim() === "" || loading || !chatId) return;

    const currentPrompt = prompt;
    setPrompt("");
    
    // Optimistic UI
    setMessages((prev) => [...prev, { role: "user", content: currentPrompt }]);
    setLoading(true);

    try {
      const res = await axios.post("/api/groq-ai", { 
        prompt: currentPrompt,
        chatId: chatId 
      });

      if (res.status === 200 && res.data.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.content }]);
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Error: Coach is offline." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <>
      <Header />
      <HeaderSpacer />
      <div className="flex flex-col h-[calc(100vh-120px)] bg-black">
        {/* Background gradient effect */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-red-900/10 to-transparent pointer-events-none"></div>
        
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-black relative z-10">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-20 opacity-90">
                <div className="text-7xl mb-6">💪</div>
                <h2 className="text-4xl font-black text-red-600 mb-3 tracking-tighter uppercase">Mentzer Protocol</h2>
                <p className="text-gray-400 text-lg font-semibold tracking-wide">Ready to critique your training</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-6 py-4 rounded-2xl max-w-[85%] md:max-w-2xl ${
                      msg.role === "user" 
                        ? "bg-red-600 text-white rounded-br-none shadow-lg shadow-red-600/30 font-semibold" 
                        : "bg-gray-900 text-gray-100 rounded-bl-none border border-gray-800 shadow-lg shadow-black/50"
                    }`}>
                    <div className="prose prose-invert prose-sm">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}
            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                 <div className="bg-gray-900 px-5 py-3 rounded-2xl rounded-bl-none border border-gray-800 flex items-center gap-2 shadow-lg shadow-black/50">
                    <span className="text-xs text-gray-400 uppercase tracking-[0.2em] font-black">Thinking</span>
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"/>
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse delay-100"/>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-900 bg-black p-4 relative z-10">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the coach..."
              disabled={loading}
              className="flex-1 bg-gray-900 text-white rounded-2xl px-6 py-4 border-2 border-gray-800 focus:border-red-600 focus:outline-none resize-none min-h-[56px] max-h-32 font-medium placeholder-gray-500"
              rows={1}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-red-600 text-white rounded-2xl px-7 h-[56px] hover:bg-red-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[60px] shadow-lg shadow-red-600/50 font-black text-lg"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>➤</span>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}