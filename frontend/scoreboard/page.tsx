"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle } from "lucide-react";
//import Navbar from "@/components/Navbar"; // ✅ Make sure this path is correct

// ===== Types ===== //
type FilterType = "All" | "Solo" | "Teams";

type Player = {
  name: string;
  totalPoints: number;
  challenges: boolean[];
};

// ===== Main Component ===== //
const Scoreboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const handleSearch = (query: string, selectedFilter: FilterType) => {
    setSearchQuery(query);
    setFilter(selectedFilter);
    console.log("Search:", query, "Filter:", selectedFilter);
  };

  // Dummy data
  const players: Player[] = [
    { name: "Alpha", totalPoints: 500, challenges: [true, true, false, true] },
    { name: "Beta", totalPoints: 400, challenges: [true, false, false, true] },
    { name: "Gamma", totalPoints: 300, challenges: [false, false, true, true] },
    { name: "Delta", totalPoints: 200, challenges: [false, true, false, false] },
    { name: "Gamma", totalPoints: 100, challenges: [true, false, false, false] },
  ];

  const filteredPlayers = players.filter((player) => {
    const nameMatch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch =
      filter === "All" ||
      (filter === "Solo" && player.name.toLowerCase().includes("solo")) ||
      (filter === "Teams" && !player.name.toLowerCase().includes("solo"));
    return nameMatch && filterMatch;
  });

  return (
    <div className='bg-[#221633] min-h-screen text-white'>
     

      {/* Title */}
      <div className='flex justify-center mt-10'>
        <h1 className="text-[52px] font-['jaini_purva'] text-[#29C48E]">🏆 Scoreboard</h1>
      </div>

      {/* Search and Filter */}
      <div className="max-w-4xl mx-auto mt-10 px-4">
        <SearchFilterBar onSearch={handleSearch} />
      </div>

      {/* Filter Info */}
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <p className="text-lg text-center text-gray-400">
          Showing results for "<span className="text-white font-bold">{searchQuery}</span>" with filter "<span className="text-white font-bold">{filter}</span>"
        </p>
      </div>

      {/* Scoreboard Table */}
      <ScoreboardTable players={filteredPlayers} challengeCount={4} />
    </div>
  );
};

// ===== Subcomponent: Search Filter Bar ===== //
interface SearchFilterBarProps {
  onSearch: (searchQuery: string, filter: FilterType) => void;
}

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query, filter);
  };

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    onSearch(searchQuery, newFilter);
  };

  return (
    <div className="w-full flex flex-col md:flex-row items-center gap-2 p-2 bg-[#43499A] rounded-xl shadow-lg">
      <input
      suppressHydrationWarning
        type="text"
        placeholder="Search users"
        className="flex-1 px-4 py-2 rounded-lg bg-[#FFF7CF] text-black focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <div className="flex gap-2">
        {["All", "Solo", "Teams"].map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === type
                ? "bg-purple-600 text-white"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
            onClick={() => handleFilterChange(type as FilterType)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

// ===== Subcomponent: Scoreboard Table ===== //
interface ScoreboardTableProps {
  players: Player[];
  challengeCount: number;
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({ players, challengeCount }) => {
  return (
    <div className="overflow-x-auto mt-10 px-4 max-w-6xl mx-auto">
      <table className="w-full text-sm text-left text-white border border-[#3a2d4e]">
        <thead className="bg-[#2c1b4a] text-purple-300">
          <tr>
            <th className="px-4 py-3 border border-[#3a2d4e]">Name</th>
            <th className="px-4 py-3 border border-[#3a2d4e]">Total Points</th>
            {Array.from({ length: challengeCount }, (_, i) => (
              <th key={i} className="px-4 py-3 border border-[#3a2d4e]">Challenge {i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={index} className={index % 2 === 0 ? "bg-[#221633]" : "bg-[#2b1d3f]"}>
              <td className="px-4 py-3 border border-[#3a2d4e]">{player.name}</td>
              <td className="px-4 py-3 border border-[#3a2d4e]">{player.totalPoints}</td>
              {player.challenges.map((solved, idx) => (
                <td key={idx} className="px-4 py-3 border border-[#3a2d4e] text-center">
                  {solved ? (
                    <CheckCircle className="text-green-400 w-5 h-5 inline" />
                  ) : (
                    <XCircle className="text-red-400 w-5 h-5 inline" />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
