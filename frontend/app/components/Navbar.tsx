"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
          setIsAdminUser(data.name === "admin");
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
        await fetch("http://localhost:8000/auth/logout", {
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

  const links = (
    <>
      <Link href="/" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <img src="/Home.svg" alt="Home" className="w-5 h-5" /> Home
      </Link>
      <Link href="/challenges" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <img src="/fire.png" alt="Challenges" className="w-5 h-5" /> Challenges
      </Link>
      <Link href="/scoreboard" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <img src="/Scoreboard.png" alt="Scoreboard" className="w-5 h-5" /> Scoreboard
      </Link>
      <Link href="/users" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <i className="codicon codicon-account !text-[20px]" /> Users
      </Link>
      <Link href="/teams" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <i className="codicon codicon-organization !text-[21px]" /> Teams
      </Link>
    </>
  );

  const rightLinks = (
    <>
      <Link href="/notifications" className="flex items-center gap-1 hover:text-[#29C48E]/80">
        <i className="codicon codicon-bell text-yellow-400 !text-[20px]" /> Notifications
      </Link>
      {loggedIn && (
        <Link href="/team" className="flex items-center gap-1 hover:text-[#29C48E]/80">
          <i className="codicon codicon-jersey !text-[20px]" /> Team
        </Link>
      )}
      {isAdminUser && (
        <Link href="/admin" className="flex items-center gap-1 hover:text-[#29C48E]/80">
          <i className="codicon codicon-shield !text-[20px]" /> Admin
        </Link>
      )}
      {loggedIn ? (
        <>
          <Link href="/profile" className="flex items-center gap-1 hover:text-[#29C48E]/80">
            <i className="codicon codicon-person !text-[20px]" /> Profile
          </Link>
          <Link href="/settings" className="flex items-center gap-1 hover:text-[#29C48E]/80">
            <i className="codicon codicon-gear !text-[20px]" /> Settings
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-1 hover:text-[#29C48E]/80">
            <i className="codicon codicon-sign-out !text-[20px]" /> Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="flex items-center gap-1 hover:text-[#29C48E]/80">
            <i className="codicon codicon-sign-in !text-[20px]" /> Login
          </Link>
          <Link href="/register" className="flex items-center gap-1 hover:text-[#29C48E]/80">
            <i className="codicon codicon-add !text-[20px]" /> Register
          </Link>
        </>
      )}
      <ThemeToggle />
    </>
  );

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#221633] shadow-lg z-50 backdrop-blur-md border border-gray-200/10 dark:border-gray-700/50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/Logo.png" alt="Logo" className="w-11" />
          <div className="hidden lg:flex items-center gap-x-6 text-[#29C48E] text-[20px] font-['Jaini_Purva']">
            {links}
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-x-4 text-[#29C48E] text-[20px] font-['Jaini_Purva']">
          {rightLinks}
        </div>

        <button
          className="lg:hidden text-[#29C48E]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden px-6 pb-4 flex flex-col gap-3 text-[#29C48E] text-[20px] font-['Jaini_Purva']">
          <div className="flex flex-col gap-2 border-b border-gray-400 pb-3">
            {links}
          </div>
          <div className="flex flex-col gap-2 pt-2">
            {rightLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
