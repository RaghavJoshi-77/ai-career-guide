
"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Header, HeaderSpacer } from "@/components/Header";
import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

interface UserProfile {
    [key: string]: string;
}

export default function OnboardingPage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState("start");
    const [userProfile, setUserProfile] = useState<UserProfile>({});
    const [initialized, setInitialized] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Initial call to start the conversation
    useEffect(() => {
        if (status === "authenticated" && !initialized) {
            setInitialized(true);
            handleSend("", true); // Empty message triggers the start
        } else if (status === "unauthenticated") {
            router.push("/sign-in");
        }
    }, [status, initialized]);

    const handleSend = async (msgText: string, isInit = false) => {
        if (!session?.user?.email) return;
        if (!msgText.trim() && !isInit) return;

        setLoading(true);

        // Update UI immediately for user message
        let newHistory = [...messages];
        if (msgText) {
            const userMsg: Message = { role: "user", content: msgText };
            newHistory.push(userMsg);
            setMessages(newHistory);
        }

        setInput("");

        try {
            const res = await axios.post("/api/onboarding", {
                message: msgText,
                history: messages, // Send PREVIOUS history (before this new message)
                currentStep: currentStep,
                userProfile: userProfile,
                email: session.user.email
            });

            const data = res.data;

            // Update state with response
            if (data.messages) {
                setMessages(data.messages);
            }
            if (data.currentStep) {
                setCurrentStep(data.currentStep);
            }
            if (data.userProfile) {
                setUserProfile(data.userProfile);
            }

            // If complete, redirect after a short delay
            if (data.currentStep === "complete") {
                setTimeout(() => {
                    router.push("/guide"); // Or dashboard
                }, 3000);
            }

        } catch (err) {
            console.error("Onboarding Error", err);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend(input);
        }
    };

    if (status === "loading") return <div className="h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <>
            <Header />
            <HeaderSpacer />
            <div className="min-h-screen bg-black text-white flex flex-col items-center pt-10 px-4">

                <div className="max-w-2xl w-full bg-gray-900/50 border border-gray-800 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-sm">
                    <h1 className="text-3xl font-black text-red-600 mb-2 tracking-tighter uppercase text-center">
                        INITIATE PROTOCOL
                    </h1>
                    <p className="text-gray-400 text-center mb-8 font-medium">
                        Answer the following to calibrate your training profile.
                    </p>

                    {/* Chat Area */}
                    <div className="space-y-6 h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div className={`px-5 py-3 rounded-2xl max-w-[85%] ${msg.role === "user"
                                        ? "bg-red-600 text-white rounded-br-none font-medium"
                                        : "bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700"
                                    }`}>
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-gray-800 px-4 py-3 rounded-2xl rounded-bl-none border border-gray-700 flex gap-2 items-center">
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></span>
                                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="mt-8 flex gap-2">
                        <input
                            className="flex-1 bg-black border border-gray-700 rounded-xl px-4 py-4 text-white placeholder-gray-500 focus:outline-none focus:border-red-600 transition-colors"
                            placeholder="Type your answer..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading || currentStep === "complete"}
                            autoFocus
                        />
                        <button
                            onClick={() => handleSend(input)}
                            disabled={loading || !input.trim() || currentStep === "complete"}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 rounded-xl font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            SEND
                        </button>
                    </div>

                    {currentStep === "complete" && (
                        <div className="mt-4 text-center">
                            <p className="text-green-500 font-bold animate-pulse">✓ PROFILE LOCKED. REDIRECTING...</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
