// app/teams/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Jersey_10, Jaini_Purva, Outfit } from "next/font/google";

const API_BASE = "http://localhost:8000";

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

export default function TeamDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const totalPoints = members.reduce((acc, m) => acc + m.score, 0);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          alert("Please login first.");
          router.push("/login");
          return;
        }

        const res = await fetch(`${API_BASE}/teams/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch team: ${res.status}`);
        }

        const data = await res.json();

        setTeamName(data.name || "Unnamed");
        setMembers(
          data.users?.map((u: any) => ({
            username: u.username,
            score: u.points || 0,
            isCaptain: u.isCaptain ?? false,
          })) || []
        );
        setSolves(
          data.solves?.map((s: any) => {
        const [category, challenge] = s.name.split("/");
        return {
          challenge: challenge || s.name,
          category: category || "N/A",
          points: s.points || 0,
        };
      }) || []
        );
      } catch (err: any) {
        setError(err.message || "Error loading team");
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#221633] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#221633] text-white flex items-center justify-center">
        <div className="text-xl text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#221633] text-white px-6 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl font-jersey text-[#23D237] mb-6">{teamName}</h1>
      </div>

      <div className="text-center text-xl text-gray-300 mb-6">
        Total Points: <span className="text-[#FFD700] font-bold">{totalPoints}</span>
      </div>

      {/* Members table */}
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
            {members.length > 0 ? (
              members.map((m, idx) => (
                <tr key={idx} className="bg-[#34204f] hover:bg-[#3e2560] text-lg text-white font-outfit">
                  <td className="px-4 py-2">
                    {m.username}
                    {m.isCaptain && <span className="ml-2 px-2 py-1 bg-blue-600 rounded text-sm">Captain</span>}
                  </td>
                  <td className="py-2">{m.score}</td>
                </tr>
              ))
            ) : (
              <tr className="bg-[#34204f] text-lg text-white font-outfit">
                <td colSpan={2} className="px-4 py-2 text-center text-gray-400">No members found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Solves table */}
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
            {solves.length > 0 ? (
              solves.map((s, idx) => (
                <tr key={idx} className="bg-[#34204f] hover:bg-[#3e2560] text-lg text-white font-outfit">
                  <td className="px-4 py-2">{s.challenge}</td>
                  <td>{s.category}</td>
                  <td>{s.points}</td>
                </tr>
              ))
            ) : (
              <tr className="bg-[#34204f] text-lg text-white font-outfit">
                <td colSpan={3} className="px-4 py-2 text-center text-gray-400">No solves yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
