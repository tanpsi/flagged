"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = localStorage.getItem("token");
      setLoggedIn(!!token);

      if (token) {
        try {
          const res = await fetch("http://localhost:8000/user/", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          const data = await res.json();

          // ✅ Only show admin button if username is exactly 'admin'
          if (data.name === "admin") {
            setIsAdminUser(true);
          } else {
            setIsAdminUser(false);
          }
        } catch (err) {
          console.error("Failed to verify user:", err);
          setIsAdminUser(false);
        }
      } else {
        setIsAdminUser(false);
      }
    };

    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        await fetch("http://127.0.0.1:8000/auth/logout", {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
      } catch (err) {
        console.error("Logout request failed:", err);
      }
    }

    localStorage.removeItem("token");
    window.dispatchEvent(new Event("storage"));
    setLoggedIn(false);
    setIsAdminUser(false);
    router.push("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#221633] shadow-lg z-50 backdrop-blur-md border border-gray-200/10 dark:border-gray-700/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Left Side */}
        <div className="flex items-center space-x-8">
          <img src="/Logo.png" alt="Logo" className="w-11" />
          <div className="flex space-x-6 items-center text-[#29C48E] text-[20px] font-['Jaini_Purva']">
            <Link href="/" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <img src="Home.svg" alt="Home Icon" className="w-6 h-6" />
              Home
            </Link>
            <Link href="/challenges" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <img src="fire.png" alt="Challenges Icon" className="w-5 h-5" />
              Challenges
            </Link>
            <Link href="/scoreboard" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <img src="Scoreboard.png" alt="Scoreboard Icon" className="w-6 h-6" />
              Scoreboard
            </Link>
            <Link href="/users" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <i className="codicon codicon-account !text-[21px]" />
              Users
            </Link>
            <Link href="/teams" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <i className="codicon codicon-organization !text-[22px]" />
              Teams
            </Link>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-6 text-[#29C48E] text-[20px] font-['Jaini_Purva']">
          <Link href="/notifications" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
            <i className="codicon codicon-bell text-yellow-400 !text-[21px]" />
            Notifications
          </Link>

          {loggedIn && (
            <Link href="/team" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <i className="codicon codicon-jersey !text-[21px]" />
              Team
            </Link>
          )}

          {isAdminUser && (
            <Link href="/admin" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
              <i className="codicon codicon-shield !text-[21px]" />
              Admin
            </Link>
          )}

          {loggedIn ? (
            <>
              <Link href="/profile" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
                <i className="codicon codicon-person !text-[22px]" />
                Profile
              </Link>
              <Link href="/settings" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
                <i className="codicon codicon-gear !text-[21px]" />
                Settings
              </Link>
              <button onClick={handleLogout} className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
                <i className="codicon codicon-sign-out !text-[21px]" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
                <i className="codicon codicon-sign-in !text-[21px]" />
                Login
              </Link>
              <Link href="/register" className="hover:text-[#29C48E]/80 transition flex items-center gap-1">
                <i className="codicon codicon-add !text-[20px]" />
                Register
              </Link>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
