"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, History } from "lucide-react";

// Define the types for the data we expect from the API
type ApiTeam = {
  id: number;
  name: string;
  points: number;
};

// Update this type to reflect that 'solves' is optional on the public endpoint
type ApiTeamDetails = {
  id: number;
  name: string;
  points: number;
  users: {
    id: number;
    username: string;
    points: number;
  }[];
  solves?: { // Mark solves as optional
    id: number;
    name: string;
    points: number;
  }[];
};

// The Player type for our internal state
type Player = {
  rank: number;
  name:string;
  totalPoints: number;
  totalFlagged: number;
  lastSolved: string;
};

type FilterType = "All" | "Solo" | "Teams";


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
        const teamsRes = await fetch("http://localhost:8000/teams");
        if (!teamsRes.ok) {
            throw new Error(`Failed to fetch teams list. Status: ${teamsRes.status}`);
        }
        const teamsData: { teams: ApiTeam[] } = await teamsRes.json();

        const playerPromises = (teamsData.teams || []).map(async (team: ApiTeam) => {
          // The public endpoint provides the essential data directly.
          // No need for a second fetch call per team if `/teams` gives us what we need.
          // We'll use the data from the initial list fetch.

          // Since the public endpoint doesn't give us solves, we set totalFlagged to 0.
          // The scoreboard will rank by points, which is the most important metric.
          const player = {
            name: team.name,
            totalPoints: team.points,
            // The public API doesn't provide solves, so we can't calculate this.
            // We can display 'N/A' or 0. Let's use 0 for consistency.
            totalFlagged: 0, // Or you could fetch details if solves are needed.
            lastSolved: "N/A",
            rank: 0,
          };
          return player;
        });

        // This simplifies the logic significantly by removing the second loop of fetches
        const resolvedPlayers = (await Promise.all(playerPromises))
            .filter((p): p is Player => p !== null)
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((player, index) => ({ ...player, rank: index + 1 }));

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
    const nameMatch = (player.name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const filterMatch =
      filter === "All" ||
      (filter === "Solo" && (player.name ?? "").toLowerCase().includes("solo")) ||
      (filter === "Teams" && !(player.name ?? "").toLowerCase().includes("solo"));
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

// The rest of the components (SearchFilterBar, ScoreboardTable) remain the same...

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
