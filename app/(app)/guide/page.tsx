"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Header, HeaderSpacer } from "@/components/Header";
import Link from "next/link";
import axios from "axios";
import ReactMarkdown from "react-markdown"; // CHANGED: Added for bold/list formatting
import remarkGfm from "remark-gfm";         // CHANGED: Added for tables support

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuidePage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session, status } = useSession(); // CHANGED: Added 'status' to check loading state
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // CHANGED: Define chatId safely using the user's email
  const chatId = session?.user?.email;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]); // CHANGED: Auto-scroll when loading starts too

  // CHANGED: Show a loading screen while NextAuth checks if user is logged in
  if (status === "loading") {
    return (
      <div className="h-screen bg-slate-900 text-white flex items-center justify-center">
        Loading Coach...
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
        <h1 className="text-4xl font-bold mb-4">Please sign in to access the app.</h1>
        <Link href="/sign-in">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 transition font-semibold">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    // CHANGED: Strict validation before sending
    if (prompt.trim() === "" || loading || !chatId) {
        if(!chatId) console.error("Critical Error: ChatId (User Email) is missing!");
        return;
    }

    const currentPrompt = prompt;
    setPrompt(""); // Clear input immediately
    
    // CHANGED: Optimistic Update (Show user message instantly)
    setMessages((prev) => [...prev, { role: "user", content: currentPrompt }]);
    setLoading(true);

    try {
      // CHANGED: Now sending BOTH 'prompt' AND 'chatId'
      // This fixes the 400 Bad Request error
      const res = await axios.post("/api/groq-ai", { 
        prompt: currentPrompt,
        chatId: chatId 
      });

      if (res.status === 200 && res.data.ok) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.data.content },
        ]);
      } else {
        throw new Error("API responded with error");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Connection Error: Coach is offline. Please check your internet or try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // CHANGED: Handle "Enter" key to submit, "Shift+Enter" for new line
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
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center mt-20 opacity-80">
                <div className="text-6xl mb-4">💪</div>
                <h2 className="text-2xl font-bold text-orange-400 mb-2">
                  Mentzer Protocol Active
                </h2>
                <p className="text-slate-400 max-w-md">
                  I am ready to critique your training. Ask me about High Intensity Training, recovery, or nutrition.
                </p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`px-5 py-3 rounded-lg max-w-[85%] md:max-w-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-br-none shadow-lg"
                        : "bg-slate-700 text-slate-100 rounded-bl-none shadow-md border border-slate-600"
                    }`}
                  >
                    {/* CHANGED: Using ReactMarkdown to render bolding, lists, and headers properly */}
                    <div className="prose prose-invert prose-sm md:prose-base leading-relaxed">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                        </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* CHANGED: improved loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 px-5 py-3 rounded-lg rounded-bl-none border border-slate-600">
                  <div className="flex space-x-2 items-center">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-widest mr-2">Thinking</span>
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse delay-100" />
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-slate-700 bg-slate-900 p-4 md:p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3 items-end">
              {/* CHANGED: Switched from <input> to <textarea> for better multi-line typing */}
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message here..."
                disabled={loading}
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-xl px-5 py-4 border border-slate-600 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition disabled:opacity-50 resize-none min-h-[56px] max-h-32 scrollbar-hide"
                style={{ height: "auto" }} // Simple auto-height hack (or keep fixed)
                rows={1}
              />
              <button
                type="submit"
                disabled={loading || prompt.trim() === ""}
                className="bg-orange-600 text-white rounded-xl px-6 h-[56px] font-semibold hover:bg-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center min-w-[80px]"
              >
                {loading ? (
                   <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    // CHANGED: Improved Send Icon
                    <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                )}
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-xs text-slate-500">
                    AI can make mistakes. Check important info.
                </span>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}