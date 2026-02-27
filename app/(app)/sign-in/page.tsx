"use client";

import { signIn, signOut, useSession } from "next-auth/react";

import { useRouter } from "next/navigation";
import { useState } from "react";
export default function AuthDemo() {
  const { data: session } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      console.log("Login failed:", result.error);
    } else {
      console.log("Login successful!");
      router.push("/home");
    }
  };
  return (
    <div className="bg-black min-h-screen">
      {session ? (
        <div className="h-screen w-screen flex flex-col justify-center items-center text-white">
          <p className="text-2xl font-black tracking-tighter mb-4">Signed in as <span className="text-red-600">{session.user?.name || session.user?.email}</span></p>
          <button
            onClick={() => signOut()}
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors"
          >
            Sign out
          </button>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md md:max-w-4xl">
            <div className="bg-gray-900 shadow-2xl shadow-red-900/10 rounded-3xl overflow-hidden border border-gray-800 flex flex-col md:flex-row">

              {/* Left Panel: Branding */}
              <div className="hidden md:flex md:w-1/2 bg-black border-r border-gray-800 p-12 flex-col justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-900/10 to-transparent pointer-events-none"></div>

                <div className="relative z-10">
                  <div className="font-black text-5xl tracking-tighter mb-6">
                    <span className="text-red-600">HEAVY</span>
                    <span className="text-white">DUTY</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-4">Master Your Machine</h2>
                  <ul className="space-y-4 text-gray-400 font-medium">
                    <li className="flex items-center gap-3">
                      <span className="text-red-600 font-bold">✓</span> Personalized AI Coaching
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-red-600 font-bold">✓</span> Science-backed HIT Protocols
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-red-600 font-bold">✓</span> Optimized Nutrition Plans
                    </li>
                  </ul>
                </div>
                <div className="absolute bottom-6 left-6 w-24 h-24 border-b-4 border-l-4 border-red-600/30"></div>
              </div>

              {/* Right Panel: Form */}
              <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-center bg-gray-900">

                {/* Mobile Title */}
                <div className="md:hidden font-black text-4xl tracking-tighter mb-8 text-center">
                  <span className="text-red-600">HEAVY</span>
                  <span className="text-white">DUTY</span>
                </div>

                <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Sign In</h2>
                <p className="text-gray-400 mb-8 font-medium">Access your personalized training protocol.</p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="password">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                      placeholder="Enter your password"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-4"
                  >
                    Authenticate
                  </button>
                </form>

                <div className="mt-8">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-800"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-gray-900 text-gray-500 font-bold uppercase tracking-widest text-xs">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                      type="button"
                      onClick={() => signIn("google", { callbackUrl: "/home" })}
                      className="w-full flex justify-center items-center gap-2 bg-black border border-gray-800 hover:border-gray-600 text-white p-3 rounded-xl transition-colors font-medium"
                    >
                      <img src="https://ucarecdn.com/8f25a2ba-bdcf-4ff1-b596-088f330416ef/" alt="Google" className="w-5 h-5" />
                      Google
                    </button>
                    <button
                      type="button"
                      onClick={() => signIn("github", { callbackUrl: "/home" })}
                      className="w-full flex justify-center items-center gap-2 bg-black border border-gray-800 hover:border-gray-600 text-white p-3 rounded-xl transition-colors font-medium"
                    >
                      <img src="https://ucarecdn.com/be5b0ffd-85e8-4639-83a6-5162dfa15a16/" alt="GitHub" className="w-5 h-5 filter invert" />
                      GitHub
                    </button>
                  </div>
                </div>

                <div className="mt-8 text-center text-sm">
                  <p className="text-gray-400">
                    Don't have an account?{" "}
                    <a href="/register" className="text-red-500 hover:text-red-400 font-bold hover:underline transition-colors uppercase tracking-wider">
                      Join the Protocol
                    </a>
                  </p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

//                       onClick={() => signIn("github", { callback: "/home" })}  this is importnatn part rem that
