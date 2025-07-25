"use client";

import React, { useEffect, useState } from "react";
import { Jersey_10 } from "next/font/google";
import { Jaini_Purva } from "next/font/google";
import { Outfit } from "next/font/google";
import { useRouter } from "next/navigation";

const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
const jainiPurva = Jaini_Purva({ subsets: ["latin"], weight: "400", variable: "--font-jaini-purva" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

interface Team {
  id: number;
  name: string;
  points: number;
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTeams = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please log in.");
        router.push("/login");
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/teams", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Response is not JSON");
        }

        const data = await res.json();
        if (!data.teams || !Array.isArray(data.teams)) {
          throw new Error("Invalid response format: 'teams' array not found");
        }

        setTeams(data.teams);
      } catch (err: any) {
        console.error("Error fetching teams:", err.message);
        setError(`Failed to fetch teams: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [router]);

  const handleTeamClick = (teamId: number) => {
    router.push(`/teams/${teamId}`);
  };

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#221633] text-white px-4 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl text-[#23D237] font-jersey mb-10 tracking-wider">
          Teams
        </h1>
      </div>

      {/* Search bar */}
      <div className="flex justify-center items-center gap-2 mb-8 flex-wrap">
        <div className={outfit.variable}>
          <select
            suppressHydrationWarning
            className="px-5 py-2 rounded-md bg-white text-black font-semibold text-lg font-outfit tracking-wider"
            disabled
          >
            <option value="name">Name</option>
          </select>
        </div>

        <input
          suppressHydrationWarning
          type="text"
          placeholder="Search by name"
          className="px-5 py-2 rounded-md bg-[#eaffd0] text-black w-60 md:w-96 font-['Outfit'] tracking-wider ml-2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Error and Loading */}
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-x-auto max-w-3xl mx-auto">
          <table className="w-full text-left border-separate border-spacing{y-2">
            <thead>
              <tr className="bg-[#d9d9d9] text-[#5A504F] text-xl font-['Jaini_Purva'] tracking-widest">
                <th className="py-2 pl-4">Team</th>
                <th className="py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-[#272727] rounded-xl transition-all">
                  <td
                    className="pl-4 py-2 text-[#23D237] font-['Jaini_Purva'] tracking-widest cursor-pointer"
                    onClick={() => handleTeamClick(team.id)}
                  >
                    {team.name}
                  </td>
                  <td className="py-2 text-[#ffffffb0] tracking-widest">
                    {team.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
