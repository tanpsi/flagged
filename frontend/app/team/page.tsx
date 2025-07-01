"use client";

import React, { useState } from "react";
import { Jersey_10 } from "next/font/google";
import { Jaini_Purva } from "next/font/google";
import { Outfit } from "next/font/google";

const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
const jaini = Jaini_Purva({ subsets: ["latin"], weight: "400", variable: "--font-jaini-purva" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

interface Member {
  username: string;
  score: number;
  isCaptain: boolean;
}

interface Solve {
  challenge: string;
  category: string;
  points: number;
}

export default function TeamPage() {
  const [teamName, setTeamName] = useState("CosmicIntruders");
  const [members, setMembers] = useState<Member[]>([
    { username: "Steller Akarsh", score: 100, isCaptain: true },
    { username: "subh494", score: 900, isCaptain: false },
  ]);
  const [solves, setSolves] = useState<Solve[]>([
    { challenge: "B-Prevent", category: "OSINT", points: 1000 },
  ]);
  const [existingUsers] = useState(["Steller Akarsh", "subh494", "user1", "user2"]);

  const totalPoints = members.reduce((acc, m) => acc + m.score, 0);

  const editTeam = () => {
    const username = prompt("Enter the username of the member to remove:");
    if (!username) return;
    const index = members.findIndex((m) => m.username === username);
    if (index === -1) return alert("Member not found.");
    if (members[index].isCaptain) return alert("Cannot remove the captain.");
    const updated = [...members];
    updated.splice(index, 1);
    setMembers(updated);
  };

  const changeCaptain = () => {
    const username = prompt("Enter new captain's username:");
    if (!username) return;
    if (!members.find((m) => m.username === username)) return alert("Member not found.");
    const updated = members.map((m) => ({
      ...m,
      isCaptain: m.username === username,
    }));
    setMembers(updated);
  };

  const inviteUser = () => {
    const username = prompt("Enter username to invite:");
    if (!username) return;
    if (!existingUsers.includes(username)) return alert("Username does not exist.");
    setMembers([...members, { username, score: 0, isCaptain: false }]);
  };

  const deleteTeam = () => {
    if (confirm("Are you sure you want to delete the team?")) {
      alert("Team deleted");
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-[#221633] text-white px-6 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl font-jersey text-[#23D237] mb-6">{teamName}</h1>
      </div>

      <div className="text-center text-xl text-gray-300 mb-6">
        Total Points: <span className="text-[#FFD700] font-bold">{totalPoints}</span>
      </div>

      {/* Control buttons */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        <button onClick={editTeam} className="bg-[#D4AF37] text-black px-5 py-2 rounded-lg font-bold hover:scale-105 transition-all">
          Edit Team
        </button>
        <button onClick={changeCaptain} className="bg-[#D4AF37] text-black px-5 py-2 rounded-lg font-bold hover:scale-105 transition-all">
          Captain
        </button>
        <button onClick={inviteUser} className="bg-[#D4AF37] text-black px-5 py-2 rounded-lg font-bold hover:scale-105 transition-all">
          Invite User
        </button>
        <button onClick={deleteTeam} className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700">
          Delete Team
        </button>
      </div>

      {/* Members Table */}
      <div className="max-w-4xl mx-auto mb-12">
        <h2 className={`${jaini.variable} text-4xl mb-4 font-jaini text-center text-[#29C48E]`}>Members</h2>
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-[#d9d9d9] text-[#5A504F] text-xl font-jaini">
              <th className="py-2 px-4">User</th>
              <th className="py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m, idx) => (
              <tr key={idx} className="bg-[#34204f] hover:bg-[#3e2560] text-lg text-white font-outfit">
                <td className="px-4 py-2">
                  {m.username}
                  {m.isCaptain && <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-sm">Captain</span>}
                </td>
                <td className="py-2">{m.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Solves Table */}
      <div className="max-w-4xl mx-auto">
        <h2 className={`${jaini.variable} text-4xl mb-4 font-jaini text-center text-[#29C48E]`}>Solves</h2>
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-[#d9d9d9] text-[#5A504F] text-xl font-jaini">
              <th className="py-2 px-4">Challenge</th>
              <th className="py-2">Category</th>
              <th className="py-2">Points</th>
            </tr>
          </thead>
          <tbody>
            {solves.map((s, idx) => (
              <tr key={idx} className="bg-[#34204f] hover:bg-[#3e2560] text-lg text-white font-outfit">
                <td className="px-4 py-2">{s.challenge}</td>
                <td>{s.category}</td>
                <td>{s.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
