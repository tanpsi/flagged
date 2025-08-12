"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Key } from "lucide-react";
import { Jaini_Purva } from "next/font/google";

const jainiPurva = Jaini_Purva({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jaini-purva",
});

const API_URL = "http://localhost:8000";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load username and email from localStorage (saved in ForgotPasswordPage)
    const savedUsername = localStorage.getItem("reset_username");
    const savedEmail = localStorage.getItem("reset_email");

    if (!savedUsername || !savedEmail) {
      setError("Missing username or email for password reset.");
    } else {
      setUsername(savedUsername);
      setEmail(savedEmail);
    }
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);
    setError(null);

    if (!password) {
      setError("❌ Please enter a new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    if (!username || !email) {
      setError("❌ Missing username or email.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/user/reset-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          new_password: password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "❌ Failed to update password.");
        return;
      }

      setMessage("✅ Your password has been updated successfully! You can now log in.");
      setPassword("");
      setConfirmPassword("");

      // Clean up localStorage after success
      localStorage.removeItem("reset_username");
      localStorage.removeItem("reset_email");

      setTimeout(() => {
        router.push("/login");
      }, 3500);
    } catch {
      setError("❌ Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#221633] text-black">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className={jainiPurva.variable}>
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-500 font-jaini tracking-wider">
            <Key className="inline-block mr-2" />
            Update Password
          </h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded">
            {message}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          {/* You can optionally show username/email read-only fields */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-700 border border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              disabled
              className="w-full px-4 py-2 rounded-lg bg-gray-200 text-gray-700 border border-gray-300"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError(null);
                if (message) setMessage(null);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              suppressHydrationWarning
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
                if (message) setMessage(null);
              }}
              className="w-full px-4 py-2 rounded-lg bg-gray-100 text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              suppressHydrationWarning
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 px-6 py-3 rounded-lg font-semibold text-green-300 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            suppressHydrationWarning
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
