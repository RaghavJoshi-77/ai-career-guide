import React from "react";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export const Header: React.FC = () => {
  const { data: session } = useSession();

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
            {session && (
              <div className="text-sm">
                <p className="text-gray-300">Welcome,</p>
                <p className="font-semibold text-white">{session.user.name}</p>
              </div>
            )}
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
