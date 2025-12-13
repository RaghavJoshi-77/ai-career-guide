"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header, HeaderSpacer } from "@/components/Header";

export default function WelcomePage() {
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
    <>
      <Header />
      <HeaderSpacer />
      <main className="bg-black min-h-screen text-white p-6">
        {/* Page content goes here */}
      </main>
    </>
  );
}
