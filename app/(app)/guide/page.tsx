"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { Header, HeaderSpacer } from "@/components/Header";
import Link from "next/link";
import axios from "axios";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function GuidePage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white">
        <h1 className="text-4xl font-bold mb-4">
          Please sign in to access the app.
        </h1>
        <Link href="/sign-in">
          <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition font-semibold">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  if (!session.user) {
    return (
      <div className="bg-gradient-to-b from-slate-900 via-slate-800 to-black text-white p-4">
        User information is not available.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() === "") {
      return;
    }

    const userMessage: Message = { role: "user", content: prompt };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await axios.post("/api/groq-ai", { prompt: prompt });
      if (res.status === 200 && res.data.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: res.data.content,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        console.log("Response received:", res.data.content);
      } else {
        console.error("Error: Unexpected response status");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        role: "assistant",
        content:
          "Sorry, there was an error processing your request. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <HeaderSpacer />

      <div className="flex flex-col h-[calc(100vh-120px)] bg-gradient-to-b from-slate-900 via-slate-800 to-black">
        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-4">
                  <div className="text-6xl mb-4">💪</div>
                </div>
                <h2 className="text-2xl font-bold text-orange-400 mb-2">
                  Ready to Train?
                </h2>
                <p className="text-slate-400 max-w-md">
                  Ask me anything about fitness, training routines, nutrition, recovery, or your fitness goals. I'm here to give you unfiltered, science-backed advice.
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
                    className={`px-5 py-3 rounded-lg max-w-2xl ${
                      message.role === "user"
                        ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-br-none shadow-lg"
                        : "bg-slate-700 text-slate-100 rounded-bl-none shadow-md border border-slate-600"
                    }`}
                  >
                    <p className="text-sm md:text-base leading-relaxed">
                      {message.content}
                    </p>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-700 text-slate-100 px-5 py-3 rounded-lg rounded-bl-none shadow-md border border-slate-600">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <div className="border-t border-slate-700 bg-slate-900 p-6">
          <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type your message here..."
                disabled={loading}
                className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-lg px-5 py-3 border border-slate-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading || prompt.trim() === ""}
                className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-lg px-6 py-3 font-semibold hover:from-orange-700 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9-9m0 0l-9-9m9 9H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
