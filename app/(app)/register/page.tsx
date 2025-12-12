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
    <div className="bg-black flex items-center justify-center py-10 px-6 min-h-screen">
      <div className="w-full max-w-lg bg-gray-900 rounded-2xl purple-shadow border border-purple-500/20 p-6 relative overflow-hidden">
        <div className="relative z-10 mb-6 text-center">
          <h1 className="text-4xl font-bold mb-3 highlight-text font-poppins">Create Account</h1>
          <p className="text-purple-300 text-lg font-medium">Join us today and get started</p>
        </div>

        <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wider"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl border-2 border-purple-500/30 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-400 font-medium purple-glow"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wider"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl border-2 border-purple-500/30 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-400 font-medium purple-glow"
              placeholder="Create a password"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-semibold text-purple-300 mb-2 uppercase tracking-wider"
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 text-white bg-gray-800 rounded-xl border-2 border-purple-500/30 focus:border-purple-400 focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-300 placeholder-gray-400 font-medium purple-glow"
              placeholder="Confirm your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white text-lg font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-purple-500/25 hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-wide purple-shadow"
          >
            Create Account
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-purple-300 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              type="button"
              onClick={() => signIn("google", { callback: "/home" })}
              className="hover:scale-105 ease-in-out duration-300 shadow-lg p-3 rounded-xl bg-gray-800 border border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/25"
            >
              <img
                className="max-w-[25px]"
                src="https://ucarecdn.com/8f25a2ba-bdcf-4ff1-b596-088f330416ef/"
                alt="Google"
              />
            </button>

            <button
              type="button"
              onClick={() => signIn("github", { callback: "/home" })}
              className="hover:scale-105 ease-in-out duration-300 shadow-lg p-3 rounded-xl bg-gray-800 border border-purple-500/30 hover:border-purple-400 hover:shadow-purple-500/25"
            >
              <img className="max-w-[25px]" src="https://ucarecdn.com/be5b0ffd-85e8-4639-83a6-5162dfa15a16/" alt="GitHub" />
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-gray-400 mb-3 font-medium">Already have an account?</p>
            <Link
              href="/sign-in"
              className="inline-block bg-transparent border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white text-lg font-semibold py-3 px-8 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-wide"
            >
              Sign In
            </Link>
          </div>
        </form>

        <div className="absolute top-6 right-6 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
        <div className="absolute bottom-6 left-6 w-2 h-2 bg-purple-400 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-4 w-1 h-8 bg-gradient-to-b from-purple-500 to-transparent rounded-full"></div>
      </div>
    </div>
  )
}
