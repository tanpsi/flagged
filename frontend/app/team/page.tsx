"use client";

import React, { useEffect, useState } from "react";
import { Jersey_10, Jaini_Purva, Outfit } from "next/font/google";
import { useRouter } from "next/navigation";

const API_BASE = "http://localhost:8000";

const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
const jaini = Jaini_Purva({ subsets: ["latin"], weight: "400", variable: "--font-jaini-purva" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

interface Member {
  id: number;
  username: string;
  score: number;
  // isCaptain: boolean; // Removed: No longer needed for frontend display/logic
}

interface Solve {
  challenge: string;
  category: string;
  points: number;
}

export default function TeamPage() {
  const [teamName, setTeamName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [solves, setSolves] = useState<Solve[]>([]);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [formTeamName, setFormTeamName] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [error, setError] = useState("");
  const [currentUsername, setCurrentUsername] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState<true | false | null>(null);

  // States for Edit Team functionality (now for all team members)
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamPassword, setEditTeamPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Removed: Captain-specific states
  // const [showCaptainModal, setShowCaptainModal] = useState(false);
  // const [newCaptainId, setNewCaptainId] = useState<number | null>(null);
  // const [changingCaptain, setChangingCaptain] = useState(false);

  const router = useRouter();

  const totalPoints = members.reduce((acc, m) => acc + m.score, 0);

  const loadUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const res = await fetch(`${API_BASE}/user/`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const userData = await res.json();
        setCurrentUsername(userData.username || userData.name || "");
        return userData;
      }
      return null;
    } catch (err) {
      console.error("Error loading user data:", err);
      return null;
    }
  };

  const loadTeamData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return false;
    try {
      const res = await fetch(`${API_BASE}/team/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 404 || res.status === 403) {
          setTeamId(null);
          setTeamName("");
          setMembers([]);
          setSolves([]);
          return false;
        }
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setTeamId(data.id);
      setTeamName(data.name);
      setMembers(
        data.users?.map((u: any) => ({
          id: u.id,
          username: u.username,
          score: u.points || 0,
          // isCaptain: u.is_captain ?? false, // Removed: Not needed for display
        })) || []
      );
      setSolves(
        data.solves?.map((s: any) => {
          const[Category,challenge]=s.name.split("/");
          return{
          challenge: challenge||s.name,
          category: Category || "N/A",
          points: s.points || 0,
          };
        }) || []
      );
      return true;
    } catch (err) {
      console.error("Error loading team info:", err);
      return false;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      try {
        const userData = await loadUserData();
        if (!userData) {
          throw new Error("Failed to load user data");
        }
        setIsAuthenticated(true);
        await loadTeamData();
      } catch (err) {
        console.error("Error during initialization:", err);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      alert("Please log in first.");
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsCreating(true);
    const token = localStorage.getItem("token");
    try {
      const createRes = await fetch(`${API_BASE}/team/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formTeamName, password: formPassword }),
      });
      if (!createRes.ok) {
        const errorText = await createRes.text();
        throw new Error(errorText || "Failed to create team");
      }
      await loadTeamData();
      resetStates();
    } catch (err: any) {
      console.error("Create team error:", err);
      setError(err.message || "Error creating team");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsJoining(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/team/join`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: formTeamName, password: formPassword }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to join team");
      }
      await loadTeamData();
      resetStates();
    } catch (err: any) {
      console.error("Join team error:", err);
      setError(err.message || "Error joining team");
    } finally {
      setIsJoining(false);
    }
  };

  const resetStates = () => {
    setShowCreateForm(false);
    setShowJoinForm(false);
    setIsCreating(false);
    setIsJoining(false);
    setFormTeamName("");
    setFormPassword("");
    setError("");
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/team/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editTeamName, password: editTeamPassword }),
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to update team");
      await loadTeamData();
      setShowEditForm(false);
      alert("Team updated successfully!"); // Added success message
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const leaveTeam = async () => {
    if (!confirm("Are you sure you want to leave the team?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/team/leave`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to leave team");
      alert("You have left the team.");
      setTeamId(null); // Reset state to show join/create view
      setTeamName("");
      setMembers([]);
      setSolves([]);
    } catch (err: any) {
      alert(`Error leaving team: ${err.message}`);
    }
  };

  const deleteTeam = async () => {
    if (!confirm("Are you sure you want to delete the team? This action cannot be undone.")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE}/team/delete`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(await res.text() || "Failed to delete team");
      alert("Team has been deleted.");
      setTeamId(null); // Reset state to show join/create view
      setTeamName("");
      setMembers([]);
      setSolves([]);
    } catch (err: any) {
      alert(`Error deleting team: ${err.message}`);
    }
  };

  if (loading || isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#221633] text-white flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // View for users NOT in a team
  if (!teamId) {
    return (
      <div className="min-h-screen bg-[#221633] text-white flex flex-col items-center justify-center px-6 py-10">
        <h1 className={`${jaini.variable} text-4xl font-jaini mb-6 text-[#29C48E]`}>
          Create or Join a Team
        </h1>
        {currentUsername && <p className="text-gray-300 mb-6">Welcome, {currentUsername}!</p>}
        {!showCreateForm && !showJoinForm && (
          <div className="flex gap-4">
            <button onClick={() => { resetStates(); setShowCreateForm(true); }} className="bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">Create Team</button>
            <button onClick={() => { resetStates(); setShowJoinForm(true); }} className="bg-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">Join Team</button>
          </div>
        )}
        {showCreateForm && (
          <form onSubmit={handleCreateTeam} className="mt-6 flex flex-col gap-4 w-full max-w-md">
            <input type="text" placeholder="Team Name" value={formTeamName} onChange={(e) => setFormTeamName(e.target.value)} required className="p-3 bg-[#34204f] rounded border border-transparent focus:border-[#29C48E] outline-none"/>
            <input type="password" placeholder="Password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required className="p-3 bg-[#34204f] rounded border border-transparent focus:border-[#29C48E] outline-none"/>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-4 justify-center">
              <button type="submit" disabled={isCreating} className="bg-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"> {isCreating ? "Creating..." : "Create"} </button>
              <button type="button" onClick={resetStates} className="bg-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700">Back</button>
            </div>
          </form>
        )}
        {showJoinForm && (
          <form onSubmit={handleJoinTeam} className="mt-6 flex flex-col gap-4 w-full max-w-md">
            <input type="text" placeholder="Team Name" value={formTeamName} onChange={(e) => setFormTeamName(e.target.value)} required className="p-3 bg-[#34204f] rounded border border-transparent focus:border-[#29C48E] outline-none"/>
            <input type="password" placeholder="Password" value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required className="p-3 bg-[#34204f] rounded border border-transparent focus:border-[#29C48E] outline-none"/>
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex gap-4 justify-center">
              <button type="submit" disabled={isJoining} className="bg-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50"> {isJoining ? "Joining..." : "Join"} </button>
              <button type="button" onClick={resetStates} className="bg-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-700">Back</button>
            </div>
          </form>
        )}
      </div>
    );
  }

  // View for users who ARE in a team
  return (
    <div className="min-h-screen bg-[#221633] text-white px-6 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl font-jersey text-[#23D237] mb-6">{teamName}</h1>
      </div>
      <div className="text-center text-xl text-gray-300 mb-6">
        Total Points: <span className="text-[#FFD700] font-bold">{totalPoints}</span>
      </div>

      {/* Team management buttons visible to all team members */}
      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        <button
          onClick={() => {
            setEditTeamName(teamName);
            setEditTeamPassword("");
            setShowEditForm(true);
          }}
          className="bg-[#D4AF37] text-black px-5 py-2 rounded-lg font-bold hover:scale-105 transition-all"
        >
          Edit Team Details
        </button>
        <button onClick={leaveTeam} className="bg-orange-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-orange-700">
          Leave Team
        </button>
        <button onClick={deleteTeam} className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-700">
          Delete Team
        </button>
      </div>

      {/* Edit Team Form Modal */}
      {showEditForm && (
        <form onSubmit={handleEditSubmit} className="max-w-md mx-auto bg-[#34204f] p-6 rounded-lg shadow-lg mb-10">
          <h2 className="text-2xl mb-4 text-[#29C48E] font-bold">Edit Team Details</h2>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">New Team Name</label>
            <input
              type="text"
              value={editTeamName}
              onChange={(e) => setEditTeamName(e.target.value)}
              required
              className="w-full p-2 rounded text-black"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">New Password (optional)</label>
            <input
              type="password"
              value={editTeamPassword}
              onChange={(e) => setEditTeamPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className="w-full p-2 rounded text-black"
            />
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowEditForm(false)}
              className="bg-gray-500 px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isUpdating ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}

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
            {members.length > 0 ? (
              members.map((m) => (
                <tr key={m.id} className="bg-[#34204f] hover:bg-[#3e2560] text-xl text-white font-['Jaini_Purva']">
                  <td className="px-4 py-2">
                    {m.username}
                    {/* Removed captain indicator for simplicity */}
                    {m.username === currentUsername && <span className="ml-2 px-2 py-1 bg-green-600 rounded text-sm">You</span>}
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
            {solves.length > 0 ? (
              solves.map((s, idx) => (
                <tr key={idx} className="bg-[#34204f] hover:bg-[#3e2560] text-xl text-white font-['Jaini_Purva']">
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
