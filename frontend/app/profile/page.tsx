"use client";

import React, { useEffect, useState } from "react";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://127.0.0.1:8000";

  function getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No access token found. Please log in again.");
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch user
        const userRes = await fetch(`${API_BASE}/user/`, {
          headers: getAuthHeaders(),
        });
        if (!userRes.ok) throw new Error("Failed to fetch user data");
        const userData = await userRes.json();
        setUser(userData);

        // Fetch team and team rank
        if (userData.team_id) {
          const teamRes = await fetch(`${API_BASE}/team/`, {
            headers: getAuthHeaders(),
          });
          if (!teamRes.ok) throw new Error("Failed to fetch team data");
          const teamData = await teamRes.json();
          setTeam(teamData);

          const teamsRes = await fetch(`${API_BASE}/teams`, {
            headers: getAuthHeaders(),
          });
          if (!teamsRes.ok) throw new Error("Failed to fetch teams list");
          const teamsJson = await teamsRes.json();

          const teamsList = teamsJson.teams || []; // ✅ FIXED
          const sorted = teamsList.sort((a: any, b: any) => b.points - a.points);
          const rank = sorted.findIndex((t: any) => t.id === userData.team_id) + 1;
          setTeamRank(rank);
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    fetchProfile();
  }, []);

  if (loading) return <div className="text-white p-10">Loading...</div>;
  if (error)
    return (
      <div className="text-red-500 p-10">
        Error: {error} <br />
        Please try again later.
      </div>
    );

  return (
    <div className="min-h-screen bg-[#221633] text-white px-4 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-[#F34927] tracking-wide font-['Jaini_Purva']">
          {user.team_name || "No Team"}
        </h1>
        <p className="text-2xl mt-2 text-[#F34927]">
          Team Points: {team ? team.points : user.points}
        </p>
        {teamRank && (
          <p className="text-xl text-gray-300 mt-1">Team Rank: #{teamRank}</p>
        )}
      </div>

      {/* User Info */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold text-[#F34927] mb-2">
          Username: {user.name}
        </h2>
        <p className="text-xl">Individual Points: {user.points}</p>
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
                <th className="py-2">Challenge Name</th>
                <th className="py-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {user.solves && user.solves.length > 0 ? (
                user.solves.map((solve: any) => (
                  <tr
                    key={solve.id}
                    className="bg-white text-black hover:bg-[#f2f2f2] transition rounded"
                  >
                    <td className="text-center px-4 py-2 text-[17px] font-medium">
                      {solve.name}
                    </td>
                    <td className="text-center px-4 py-2 text-[17px] font-medium">
                      {solve.points}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center text-gray-600 py-4 font-medium"
                  >
                    No solves found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
