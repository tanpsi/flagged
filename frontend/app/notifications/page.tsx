"use client";

import { Jersey_10 } from "next/font/google";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400", // Only one weight available
  variable: "--font-jersey-10",
});

import { Fira_Code } from "next/font/google";

const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400"], // or ["400", "500", "700"] if you need multiple
  variable: "--font-fira-code",
});



import { useEffect, useState } from "react";

interface Notification {
  title: string;
  message: string;
  time: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Replace this mock data with a fetch to your API endpoint
    setNotifications([
      {
        title: "AESome issue fixed",
        message: "Server is up again , files reuploaded.",
        time: "June 7th, 19:00:40 PM",
      },
      {
        title: "BugG3t",
        message: "Challenge is active now.",
        time: "June 7th, 17:09:00 PM",
      },
      {
        title: "OSINT/Parkour hint released",
        message: "Hint has been released to clear any misunderstanding.",
        time: "June 7th, 13:05:09 PM",
      },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[#221633] text-white py-10 px-4">
      <h1 className="text-center text-3xl font-jersey mb-8">
       <div className={jersey.variable}>
        <span className="bg-[#5B0F0F] font-jersey text-[#00FF00] px-8 py-2 rounded-xl text-4xl tracking-widest">
          Notifications
        </span>
        </div>
        </h1>
        

      <div className={firaCode.variable}>
        <div className="max-w-4xl mx-auto space-y-6">
        {notifications.map((note, index) => (
          <div
            key={index}
            className={`rounded-xl p-4 ${
              index === 1
                ? "bg-[#ab9d9d]"
                : "bg-[#ab9d9d]"
            }`}
          >
            <h2 className="text-3xl font-fira font-bold text-black">{note.title}</h2>
            <p className="text-black font-fira text-xl ml-5 mt-1">{note.message}</p>
            <p className={`${jersey.variable} text-[#565151] text-xl ml-5 mt-2 font-jersey tracking-wide`}>{note.time}</p>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
