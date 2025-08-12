"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, History } from "lucide-react";

// API response types
type ApiTeam = {
  id: number;
  name: string;
  points: number;
};

type ApiChall = {
  id: number;
  name: string;
  // ... other chall properties
};

type ApiChallSolve = {
  team: {
    id: number;
    name: string;
  };
  time: string; // ISO 8601 date string
};

// Internal state type for the scoreboard table
type Player = {
  rank: number;
  name: string;
  totalPoints: number;
  totalFlagged: number;
  lastSolved: string;
};

type FilterType = "All" | "Solo" | "Teams";

// A map to hold aggregated solve data for each team
type TeamSolveInfo = {
  solveCount: number;
  lastSolvedTime: string;
};


const Scoreboard: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchScoreboard = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // 1. Fetch all teams and all challenges concurrently
        const [teamsRes, challsRes] = await Promise.all([
          fetch("http://localhost:8000/teams"),
          fetch("http://localhost:8000/challs"),
        ]);

        if (!teamsRes.ok) throw new Error(`Failed to fetch teams list. Status: ${teamsRes.status}`);
        if (!challsRes.ok) throw new Error(`Failed to fetch challenges list. Status: ${challsRes.status}`);
        
        const teamsData: { teams: ApiTeam[] } = await teamsRes.json();
        const challsData: { challs: ApiChall[] } = await challsRes.json();

        // 2. Fetch all solves for every challenge
        const solvePromises = (challsData.challs || []).map(chall =>
          fetch(`http://localhost:8000/challs/${chall.id}/solves`).then(res => {
            if (!res.ok) {
                console.warn(`Could not fetch solves for chall ${chall.id}`);
                return { solves: [] }; // Return empty solves on failure
            }
            return res.json() as Promise<{ solves: ApiChallSolve[] }>;
          })
        );
        
        const allSolvesResponses = await Promise.all(solvePromises);
        const allSolves = allSolvesResponses.flatMap(response => response.solves);

        // 3. Process all solves to aggregate data per team
        const teamSolveInfo = new Map<number, TeamSolveInfo>();
        allSolves.forEach(solve => {
            const teamId = solve.team.id;
            const existingInfo = teamSolveInfo.get(teamId) || { solveCount: 0, lastSolvedTime: '' };
            
            const newInfo = {
                solveCount: existingInfo.solveCount + 1,
                // Update last solved time if the current solve is more recent
                lastSolvedTime: !existingInfo.lastSolvedTime || new Date(solve.time) > new Date(existingInfo.lastSolvedTime)
                    ? solve.time
                    : existingInfo.lastSolvedTime
            };

            teamSolveInfo.set(teamId, newInfo);
        });

        // 4. Construct the final player list with aggregated data
        const resolvedPlayers = (teamsData.teams || [])
          .map((team: ApiTeam) => {
            const info = teamSolveInfo.get(team.id);
            return {
              name: team.name,
              totalPoints: team.points,
              totalFlagged: info?.solveCount || 0,
              lastSolved: info?.lastSolvedTime 
                ? new Date(info.lastSolvedTime).toLocaleString() 
                : "N/A",
              rank: 0, // Rank will be assigned after sorting
            };
          })
.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
    }
    if (b.totalFlagged !== a.totalFlagged) {
        return b.totalFlagged - a.totalFlagged;
    }
    // Earlier lastSolved should rank higher
    const aTime = a.lastSolved === "N/A" ? Infinity : new Date(a.lastSolved).getTime();
    const bTime = b.lastSolved === "N/A" ? Infinity : new Date(b.lastSolved).getTime();
    return aTime - bTime;
})          .map((player, index) => ({ ...player, rank: index + 1 }));

        setPlayers(resolvedPlayers);
      } catch (err) {
        console.error("Failed to fetch scoreboard:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchScoreboard();
  }, []);

  const handleSearch = (query: string, selectedFilter: FilterType) => {
    setSearchQuery(query);
    setFilter(selectedFilter);
  };

  const filteredPlayers = players.filter((player) => {
    const nameMatch = player.name.toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch =
      filter === "All" ||
      (filter === "Solo" && player.name.toLowerCase().includes("solo")) ||
      (filter === "Teams" && !player.name.toLowerCase().includes("solo"));
    return nameMatch && filterMatch;
  });

  return (
    <div className="bg-[#221633] min-h-screen text-white font-sans">
      <div className="flex justify-center pt-10 pb-5">
        <h1 className="text-5xl md:text-6xl font-bold text-[#29C48E]" style={{ fontFamily: "'Jaini Purva', cursive" }}>
          🏆 Scoreboard
        </h1>
      </div>

      <div className="max-w-4xl mx-auto mt-5 px-4">
        <SearchFilterBar onSearch={handleSearch} />
      </div>

      <div className="max-w-6xl mx-auto mt-8 px-4">
        {isLoading ? (
            <p className="text-lg text-center text-gray-400">Loading scoreboard...</p>
        ) : error ? (
            <p className="text-lg text-center text-red-500">Error: {error.toString()}</p>
        ) : (
            <ScoreboardTable players={filteredPlayers} />
        )}
      </div>
    </div>
  );
};

// The SearchFilterBar

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
    <div className="w-full flex flex-col md:flex-row items-center gap-4 p-2 bg-[#43499A] rounded-xl shadow-lg">
      <input
        type="text"
        placeholder="Search teams or players..."
        className="flex-1 w-full md:w-auto px-4 py-2 rounded-lg bg-[#FFF7CF] text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        value={searchQuery}
        onChange={handleSearchChange}
      />
      <div className="flex gap-2">
        {(["All", "Solo", "Teams"] as FilterType[]).map((type) => (
          <button
            key={type}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${
              filter === type
                ? "bg-purple-600 text-white shadow-md"
                : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
            }`}
            onClick={() => handleFilterChange(type)}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

interface ScoreboardTableProps {
  players: Player[];
}

const ScoreboardTable: React.FC<ScoreboardTableProps> = ({ players }) => {
  if (players.length === 0) {
      return <p className="text-center text-gray-400 mt-10">No players found matching your criteria.</p>;
  }

  return (
    <div className="overflow-x-auto mt-6">
      <table className="w-full text-sm text-left text-white border-collapse">
        <thead className="bg-[#2c1b4a] text-purple-300 uppercase">
          <tr>
            <th className="px-4 py-3 text-center border-b-2 border-[#3a2d4e]">Rank</th>
            <th className="px-4 py-3 text-left border-b-2 border-[#3a2d4e]">Name</th>
            <th className="px-4 py-3 text-center border-b-2 border-[#3a2d4e]">Total Points</th>
            <th className="px-4 py-3 text-center border-b-2 border-[#3a2d4e]">
              Total Flagged <CheckCircle className="text-green-400 ml-2 w-4 h-4 inline" />
            </th>
            <th className="px-4 py-3 text-center border-b-2 border-[#3a2d4e]">
              Last Solved <History className="text-purple-400 ml-2 w-4 h-4 inline" />
            </th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr
              key={player.name + index}
              className="bg-[#221633] hover:bg-[#3d295c] transition duration-150"
            >
              <td className="px-4 py-3 font-bold text-center border-t border-[#3a2d4e]">{player.rank}</td>
              <td className="px-4 py-3 font-medium text-left border-t border-[#3a2d4e]">{player.name}</td>
              <td className="px-4 py-3 text-center border-t border-[#3a2d4e]">{player.totalPoints}</td>
              <td className="px-4 py-3 text-center border-t border-[#3a2d4e]">{player.totalFlagged}</td>
              <td className="px-4 py-3 text-center border-t border-[#3a2d4e]">{player.lastSolved}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Scoreboard;
