"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Jaini_Purva } from "next/font/google";

const jainiPurva = Jaini_Purva({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jaini-purva",
});

const API_URL = "http://localhost:8000/";

export default function ForgotPasswordPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      setMessage("❌ Please enter your username.");
      return;
    }

    if (!email.trim()) {
      setMessage("❌ Please enter your email address.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      // Request password reset email by email only
      const res = await fetch(`${API_URL}user/email/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 404) {
          setMessage(`❌ ${data.detail}`);
        } else {
          throw new Error(data.detail || "Failed to send email");
        }
      } else {
        setMessage(
          "📧 Email sent successfully! Please check your inbox for a reset link."
        );

        // Store username and email locally to be used on reset page
        localStorage.setItem("reset_username", username.trim());
        localStorage.setItem("reset_email", email.trim());

        setUsername("");
        setEmail("");
      }
    } catch (err: any) {
      setMessage(`❌ Failed to send email. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#221633] text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className={jainiPurva.variable}>
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500 font-jaini tracking-wider">
            <Mail className="inline-block mr-2" />
            Forgot your password?
          </h1>
        </div>
        <form onSubmit={handleSendEmail} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Enter your username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              suppressHydrationWarning
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Enter your email address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              suppressHydrationWarning
            />
          </div>
          {message && (
            <p
              className={`text-sm ${
                message.startsWith("❌") ? "text-red-500" : "text-green-500"
              }`}
            >
              {message}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 px-6 py-3 rounded-lg font-semibold text-green-300 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
}
