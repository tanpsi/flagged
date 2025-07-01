"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Jaini_Purva } from 'next/font/google';

const jainiPurva = Jaini_Purva({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-jaini-purva',
});

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          username,
          password,
          grant_type: "password",
        }),
      });

      if (!response.ok) throw new Error("Login failed");

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      window.dispatchEvent(new Event("storage"));
      router.push("/");

    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#221633] text-white">
      <div className="bg-[#1e1e2f] p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-700">
        <div className={jainiPurva.variable}>
          <h1 className="text-3xl font-bold mb-6 text-center text-orange-400 font-jaini tracking-wider">
            Let the hunt begin!
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1 text-gray-200">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 rounded-lg 
                bg-gray-800 text-white 
                border border-gray-600 
                focus:outline-none 
                focus:bg-white focus:text-black 
                focus:ring-2 focus:ring-blue-400 
                focus:border-blue-500 
                transition-all duration-200"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-200">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg 
                bg-gray-800 text-white 
                border border-gray-600 
                focus:outline-none 
                focus:bg-white focus:text-black 
                focus:ring-2 focus:ring-blue-400 
                focus:border-blue-500 
                transition-all duration-200"
              required
            />
            <div className="flex justify-between items-center mt-2 text-sm text-gray-300">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="form-checkbox h-4 w-4 text-blue-500"
                />
                <span>Show Password</span>
              </label>
              <Link href="/forgot-password" className="text-blue-400 hover:underline hover:text-blue-600">
                Forgot password?
              </Link>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-300"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-300">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-400 hover:underline hover:text-blue-600">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
