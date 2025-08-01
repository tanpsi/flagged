// File: app/users/page.tsx

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
// --- FIX: Removed 'Jaini_Purva' as it was unused ---
import { Jersey_10, Outfit } from "next/font/google";

const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

interface User {
  id: number;
  name: string;
  team_name?: string;
  points?: number;
  affiliation?: string;
  country?: string;
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterBy, setFilterBy] = useState<"name" | "affiliation" | "country">("name");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API_BASE}/users`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        // --- FIX: Typed the error properly instead of using 'any' ---
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching users");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const field =
      filterBy === "name" ? user.name :
        filterBy === "affiliation" ? user?.affiliation ?? "" :
          user?.country ?? "";
    return field.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleRowClick = (userId: number) => {
    router.push(`/users/${userId}`);
  };

  return (
    <div className="min-h-screen bg-[#221633] text-white px-4 py-10">
      <div className={jersey.variable}>
        <h1 className="text-center text-5xl text-[#23D237] font-jersey mb-10 tracking-wider">
          Users
        </h1>
      </div>

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
      </div>

      {loading ? (
        <p className="text-center text-gray-400">Loading users...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
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
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#3a2c52] rounded-xl transition-all cursor-pointer"
                  onClick={() => handleRowClick(user.id)}
                >
                  <td className="pl-4 py-2 text-[#23D237] font-['Jaini_Purva'] tracking-widest">
                    {user.name}
                  </td>
                  <td className="py-2 text-[#ffffffb0] tracking-widest">
                    {user.affiliation || "-"}
                  </td>
                  <td className="py-2 text-[#ffffffb0] tracking-widest">
                    {user.country || "-"}
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