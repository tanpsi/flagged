"use client";

import { useState } from "react";
import Link from "next/link";
import { Jaini_Purva } from 'next/font/google';

const jainiPurva = Jaini_Purva({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jaini-purva',
});

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      // Replace this with your actual FastAPI endpoint later
      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setMessage("If this email is registered, you’ll receive reset instructions.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#221633] text-black dark:text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className={jainiPurva.variable}>
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500 font-jaini tracking-wider">
            Forgot your password?
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Enter your email or username
            </label>
            <input
              suppressHydrationWarning
              type="text"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>
          {message && <p className="text-green-500 text-sm">{message}</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            suppressHydrationWarning
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-600 px-6 py-3 rounded-lg font-semibold text-green-300 hover:bg-blue-700 dark:hover:bg-blue-700 transition-all duration-300"
          >
            Send Reset Link
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Remembered your password?{" "}
          <Link href="/login" className="text-blue-400 hover:underline hover:text-blue-600">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
