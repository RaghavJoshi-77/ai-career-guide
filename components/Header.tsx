import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import axios from "axios"; // ADDED: For the delete request

export const Header: React.FC = () => {
  const { data: session } = useSession();

  // ADDED: Logic to handle history deletion
  const handleClearHistory = async () => {
    if (!confirm("Are you sure you want to delete your entire chat history?")) return;
    
    const chatId = session?.user?.email;
    if (!chatId) return;

    try {
      await axios.delete(`/api/groq-ai?chatId=${chatId}`);
      window.location.reload(); // Refresh page to clear the chat window
    } catch (err) {
      alert("Failed to clear history");
      console.error(err);
    }
  };

  // PRESERVED: Your existing Sign-In Guard
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-[90vh] bg-black text-white">
        <h1 className="text-2xl mb-4">Please sign in to access the app.</h1>
        <Link href="/sign-in">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  // PRESERVED: User info check
  if (!session.user) {
    return (
      <div className="bg-black text-white p-4">
        User information is not available.
      </div>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gradient-to-r from-gray-900 via-black to-gray-900 text-white shadow-lg border-b border-gray-700 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
              💪 Fitness Coach AI
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* ADDED: Clear History Button */}
            <button 
              onClick={handleClearHistory}
              className="text-gray-400 hover:text-red-500 transition p-2 rounded-full hover:bg-gray-800"
              title="Clear Chat History"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>

            {/* PRESERVED: User Welcome Text */}
            {session && (
              <div className="text-sm hidden md:block">
                <p className="text-gray-300">Welcome,</p>
                <p className="font-semibold text-white">{session.user.name}</p>
              </div>
            )}
            
            {/* PRESERVED: Sign Out Button */}
            <button
              onClick={() => signOut()}
              className="bg-gradient-to-r from-red-600 to-red-500 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-600 transition duration-200 font-medium shadow-md"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Spacer component to account for fixed navbar
export const HeaderSpacer: React.FC = () => (
  <div className="h-20"></div>
);