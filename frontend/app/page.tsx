"use client";

import Image from "next/image";
import Link from "next/link";
import ParticlesBackground from "./components/ParticlesBackground"; // your blend component
import logo from "../public/logo.png"; // use updated image if needed
import { Limelight } from 'next/font/google';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const limelight = Limelight({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-limelight',
});

import { Goldman } from 'next/font/google';

const goldman = Goldman({
  subsets: ['latin'],
  weight: ['400', '700'], // Use both weights if needed
  variable: '--font-goldman',
});



export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
 useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    
    // Optional: Listen to "storage" event when logout triggers it
    const handleStorage = () => {
      const t = localStorage.getItem("token");
      setIsLoggedIn(!!t);
    };
    window.addEventListener("storage", handleStorage);

    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <div className="min-h-screen bg-[#221633] text-white flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center text-center space-y-10`">
        <Image
          src="/logo.png"
          alt="Flagged Logo"
          width={390}
          height={390}
          className="w-150 md:w-150 mix-blend-lighten -mt-10"
          priority
        />


        <div className={limelight.variable}>
    <h1 className="text-2xl md:text-4xl font-limelight -mt-7 mb-10 tracking-wider">
      Welcome to <span className="text-white">Flagged 🚩</span>
    </h1>
  </div>
        <div className={goldman.variable}>
        <p className="text-xl md:text-2xl max-w-xl text-[#02F2EA] font-goldman mb-12">
          Hunting flags, breaking barriers !
        </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <Link
            href="/challenges"
            className="bg-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition-all"
          >
            Start Hacking
          </Link>
          {!isLoggedIn && (
  <Link
    href="/login"
    className="border-2 border-blue-400 text-blue-400 px-6 py-3 rounded-full font-semibold hover:bg-blue-400 hover:text-white transition-all"
  >
    Login
  </Link>
)}

        </div>
      </div>
    </div>
  );
}
