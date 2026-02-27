"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react";

export default function Register() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const router = useRouter()

  const showNotification = (message: string, type: "success" | "error") => {
    // Implement your notification logic here
    console.log(`${type.toUpperCase()}: ${message}`)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      showNotification("Passwords do not match", "error")
      return
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      showNotification("Registration successful! Please log in.", "success")
      router.push("/login")
    } catch (error) {
      showNotification(error instanceof Error ? error.message : "Registration failed", "error")
    }
  }





  return (
    <div className="bg-black min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
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
              <h2 className="text-2xl font-bold text-white mb-4">Start Your Journey</h2>
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

            <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2">Register</h2>
            <p className="text-gray-400 mb-8 font-medium">Create your Heavy Duty account.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="email">
                  Email Address
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
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-black border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-colors"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-red-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] mt-6"
              >
                Create Account
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
                  onClick={() => signIn("google", { callback: "/home" })}
                  className="w-full flex justify-center items-center gap-2 bg-black border border-gray-800 hover:border-gray-600 text-white p-3 rounded-xl transition-colors font-medium"
                >
                  <img src="https://ucarecdn.com/8f25a2ba-bdcf-4ff1-b596-088f330416ef/" alt="Google" className="w-5 h-5" />
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => signIn("github", { callback: "/home" })}
                  className="w-full flex justify-center items-center gap-2 bg-black border border-gray-800 hover:border-gray-600 text-white p-3 rounded-xl transition-colors font-medium"
                >
                  <img src="https://ucarecdn.com/be5b0ffd-85e8-4639-83a6-5162dfa15a16/" alt="GitHub" className="w-5 h-5 filter invert" />
                  GitHub
                </button>
              </div>
            </div>

            <div className="mt-8 text-center text-sm">
              <p className="text-gray-400">
                Already have an account?{" "}
                <Link href="/sign-in" className="text-red-500 hover:text-red-400 font-bold hover:underline transition-colors uppercase tracking-wider">
                  Sign In
                </Link>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
