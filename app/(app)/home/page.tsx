"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Header, HeaderSpacer } from "@/components/Header";

export default function WelcomePage() {
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
