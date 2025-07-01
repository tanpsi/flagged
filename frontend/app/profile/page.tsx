"use client";

import React from "react";

export default function ProfilePage() {
  const solves = [
    ["Web", "Seeds", "14 minutes ago", "373"],
    ["Forensics", "Encrypted File", "25 minutes ago", "1027"],
    ["Web", "XSS Blast", "35 minutes ago", "580"],
    ["OSINT", "User Hunt", "50 minutes ago", "800"],
    ["Misc", "Fun Puzzle", "1 hour ago", "542"],
    ["Forensics", "Image Leak", "2 hours ago", "680"],
    ["Web", "Cookie Monster", "2 hours ago", "770"],
  ];

  return (
    <div className="min-h-screen bg-[#221633] text-white px-4 py-10">
      {/* Team Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#F34927] tracking-wide font-['Jaini_Purva']">
          BYTEBANDITS
        </h1>
        <p className="text-2xl mt-2 text-[#F34927]">250th Place</p>
        <p className="text-2xl mt-1 text-[#F34927]">2000 Points</p>
      </div>

      {/* Solves Table */}
      <div className="max-w-5xl mx-auto bg-[#DDE6ED] rounded-xl shadow-md p-6">
        <h2 className="text-3xl font-semibold text-center text-[#221633] font-['Jaini_Purva'] mb-6">
          Solves
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-y-2">
            <thead>
              <tr className="text-[#221633] text-lg font-bold bg-[#c5d6e5]">
                <th className="py-2">Category</th>
                <th className="py-2">Challenge</th>
                <th className="py-2">Score Time</th>
                <th className="py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {solves.map((row, i) => (
                <tr
                  key={i}
                  className="bg-white text-black hover:bg-[#f2f2f2] transition rounded"
                >
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="text-center px-4 py-2 text-[17px] font-medium"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
