"use client";

import React, { useState } from "react";
import { Jersey_10 } from "next/font/google";
import { Jaini_Purva } from "next/font/google";
import { Outfit } from "next/font/google";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jersey-10",
});

const jainiPurva = Jaini_Purva({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jaini-purva",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

interface Team {
  name: string;
  team: string;
  affiliation: string;
  country: string;
}

const initialTeams: Team[] = [
  { name: "HackGroup", team: "", affiliation: "CyberLabs", country: "India" },
  { name: "0sintLobby", team: "", affiliation: "Null", country: "Germany" },
  { name: "Pawners", team: "", affiliation: "Independent", country: "Canada" },
  { name: "@R3vers", team: "", affiliation: "-", country: "India" },
  { name: "Tr4ckTrac3rs5", team: "", affiliation: "TraceSec", country: "Brazil" },
  { name: "WebKni8Fleet", team: "", affiliation: "HackHub", country: "Japan" },
];

export default function TeamsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"name" | "affiliation" | "country">("name");

  const filteredTeams = initialTeams.filter((Team) => {
    const field =
      filterBy === "name"
        ? Team.name
        : filterBy === "affiliation"
        ? Team.affiliation
        : Team.country;
    return field.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#221633] text-white px-4 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl text-[#23D237] font-jersey mb-10 tracking-wider">
          Teams
        </h1>
      </div>

      {/* Search bar + filter */}
      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        <div className={outfit.variable}>
          <select
            suppressHydrationWarning
            className="px-5 py-2 rounded-md bg-white text-black font-semibold text-lg font-outfit tracking-wider"
            value={filterBy}
            onChange={(e) =>
              setFilterBy(e.target.value as "name" | "affiliation" | "country")
            }
          >
            <option value="name">Name</option>
            <option value="affiliation">Affiliation</option>
            <option value="country">Country</option>
          </select>
        </div>

        <input
          suppressHydrationWarning
          type="text"
          placeholder={`Search by ${filterBy}`}
          className="px-5 py-2 rounded-md bg-[#eaffd0] text-black w-60 md:w-96 font-['Outfit'] tracking-wider ml-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <button
          className="bg-blue-600 hover:bg-blue-800 text-white px-8 py-1.5 rounded-sm text-xl ml-5"
          suppressHydrationWarning
        >
          🔍
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto max-w-5xl mx-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="bg-[#d9d9d9] text-[#5A504F] text-xl font-['Jaini_Purva'] tracking-widest">
              <th className="py-2 pl-4">User</th>
              <th className="py-2">Affiliation</th>
              <th className="py-2">Country</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((Team, index) => (
              <tr key={index} className="hover:bg-[#272727] rounded-xl transition-all">
                <td className="pl-4 py-2 text-[#23D237] font-['Jaini_Purva'] tracking-widest">
                  {Team.name}
                </td>
                <td className="py-2 text-[#ffffffb0] tracking-widest">
                  {Team.affiliation || "-"}
                </td>
                <td className="py-2 text-[#ffffffb0] tracking-widest">
                  {Team.country || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
