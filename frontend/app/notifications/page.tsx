"use client";

import { Jersey_10 } from "next/font/google";
const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jersey-10",
});

import { Fira_Code } from "next/font/google";
const firaCode = Fira_Code({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fira-code",
});

import { useEffect, useState } from "react";

// ✨ UPDATE the interface to match the API response
interface Notification {
  id: number;
  title: string;
  content: string;
  timestamp: number; // API returns a UNIX timestamp (number)
}

// ✨ ADD a helper function to format the timestamp
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
  return date.toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ✨ FETCH data from your API endpoint
    const fetchNotifications = async () => {
      try {
        const res = await fetch("http://localhost:8000/notifications/");
        if (!res.ok) {
          throw new Error("Failed to fetch notifications");
        }
        const data = await res.json();
        setNotifications(data.notifications || []); // Ensure we handle cases where the array might be missing
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []); // Empty dependency array means this runs once on component mount

  if (loading) {
    return <div className="min-h-screen bg-[#221633] text-white text-center py-10">Loading notifications...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-[#221633] text-red-500 text-center py-10">Error: {error}</div>;
  }
  
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
          {notifications.length > 0 ? (
            notifications.map((note, index) => (
              <div
                key={note.id} // Use the unique ID from the API as the key
                className="rounded-xl p-4 bg-[#ab9d9d]"
              >
                {/* ✨ UPDATE to use properties from the new Notification interface */}
                <h2 className="text-3xl font-fira font-bold text-black">{note.title}</h2>
                <p className="text-black font-fira text-xl ml-5 mt-1">{note.content}</p>
                <p className={`${jersey.variable} text-[#565151] text-xl ml-5 mt-2 font-jersey tracking-wide`}>
                  {formatTimestamp(note.timestamp)}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-400">No notifications yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
