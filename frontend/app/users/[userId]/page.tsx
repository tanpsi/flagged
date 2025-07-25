// File: app/users/[userId]/page.tsx

"use client";

import React, { useEffect, useState } from "react";

export default function PublicUserProfilePage({ params }: { params: { userId: string } }) {
  const { userId } = params; 


  const [user, setUser] = useState<any>(null);
  const [team, setTeam] = useState<any>(null);
  const [teamRank, setTeamRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE = "http://127.0.0.1:8000";

  // ✅ UPDATED FUNCTION
  function getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
  
    const token = localStorage.getItem("token");
  
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    } else {
      console.warn("No auth token found. Continuing without authentication.");
    }
  
    return headers;
  }

  useEffect(() => {
    if (!userId) return;

    async function fetchPublicProfile() {
      try {
        setLoading(true);

        const userRes = await fetch(`${API_BASE}/users/${userId}`, {
          headers: getAuthHeaders(),
        });
        if (!userRes.ok) {
          throw new Error("User not found or failed to fetch data");
        }
        const userData = await userRes.json();
        setUser(userData);

        if (userData.team_id) {
          const teamRes = await fetch(`${API_BASE}/teams/${userData.team_id}`, {
            headers: getAuthHeaders(),
          });
          if (teamRes.ok) {
            setTeam(await teamRes.json());
          }

          const allTeamsRes = await fetch(`${API_BASE}/teams`, {
            headers: getAuthHeaders(),
          });
          if (allTeamsRes.ok) {
            const allTeamsData = await allTeamsRes.json();
            const teamsList = allTeamsData.teams || [];
            const sortedTeams = teamsList.sort((a: any, b: any) => b.points - a.points);
            const rank = sortedTeams.findIndex((t: any) => t.id === userData.team_id) + 1;
            setTeamRank(rank > 0 ? rank : null);
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPublicProfile();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-white">Loading profile...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }
  
  if (!user) {
    return <div className="flex justify-center items-center h-screen text-white">User not found.</div>;
  }

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
                    This user has not solved any challenges yet.
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
