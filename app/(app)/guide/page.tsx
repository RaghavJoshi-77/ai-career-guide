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
    return <div className="h-screen bg-slate-900 text-white flex items-center justify-center">Loading Coach...</div>;
  }

  // Not Signed In
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-slate-900 text-white">
        <h1 className="text-4xl font-bold mb-4">Please sign in to train.</h1>
        <Link href="/sign-in">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition">
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
      <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-b from-slate-900 via-slate-800 to-black">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-20 opacity-80">
                <div className="text-6xl mb-4">💪</div>
                <h2 className="text-2xl font-bold text-orange-400 mb-2">Mentzer Protocol Active</h2>
                <p className="text-slate-400">Ready to critique your training.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-5 py-3 rounded-lg max-w-[85%] md:max-w-2xl ${
                      msg.role === "user" ? "bg-orange-600 text-white rounded-br-none" : "bg-slate-700 text-slate-100 rounded-bl-none border border-slate-600"
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
                 <div className="bg-slate-700 px-4 py-2 rounded-lg rounded-bl-none border border-slate-600 flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-widest">Thinking</span>
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"/>
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse delay-100"/>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-slate-700 bg-slate-900 p-4">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-3 items-end">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the coach..."
              disabled={loading}
              className="flex-1 bg-slate-800 text-white rounded-xl px-5 py-4 border border-slate-600 focus:border-orange-500 focus:outline-none resize-none min-h-[56px] max-h-32"
              rows={1}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="bg-orange-600 text-white rounded-xl px-6 h-[56px] hover:bg-orange-500 transition disabled:opacity-50 flex items-center justify-center min-w-[60px]"
            >
              {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <span>➤</span>}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}