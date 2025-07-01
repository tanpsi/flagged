'use client'

import React, { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Jersey_10 } from "next/font/google";
const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
import { Jaini_Purva } from "next/font/google";
const jainiPurva = Jaini_Purva({ subsets: ["latin"], weight: "400", variable: "--font-jaini-purva" });

interface User {
  id: number
  name: string
  team_id: number
  team_name: string
  points: number
  email?: string
}

interface Team {
  name: string
  score: number
  country: string
}

interface Challenge {
  id: number
  name: string
  points: number
  category?: string
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newChallenge, setNewChallenge] = useState({ name: '', desc: '', flag: '', points: 0 })

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.replace('/')
      return
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch('http://localhost:8000/user/', {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) throw new Error('Not authorized')
        const user = await res.json()

        if (user.name !== 'admin') {
          router.replace('/')
        } else {
          await fetchData(token)
          setLoading(false)
        }
      } catch (err) {
        console.error('Admin check failed:', err)
        router.replace('/')
      }
    }

    checkAdmin()
  }, [])

  const fetchData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [userRes, teamRes, challRes] = await Promise.all([
        fetch('http://localhost:8000/users', { headers }),
        fetch('http://localhost:8000/teams', { headers }),
        fetch('http://localhost:8000/chall/s/', { headers })
      ])
      const userData = await userRes.json()
      const teamData = await teamRes.json()
      const challData = await challRes.json()

      setUsers(userData.users || [])
      setTeams(teamData.teams || [])
      setChallenges(challData.challs || challData || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  const handleCreateChallenge = async (e: FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/chall/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newChallenge),
      })

      if (!res.ok) throw new Error('Challenge creation failed')

      setShowModal(false)
      setNewChallenge({ name: '', desc: '', flag: '', points: 0 })
      await fetchData(token)
    } catch (error) {
      console.error('Error creating challenge:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Verifying admin access...
      </div>
    )
  }

  return (
    <div className="bg-[#1d1a29] text-white min-h-screen p-6">
      {/* Header with stats and logo */}
      <header className="flex justify-between items-center flex-wrap gap-4 mb-10">
        <div className="flex flex-wrap gap-4 font-['Outfit']">
          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px]">
            Total Users<br /><strong>{users.length}</strong>
          </div>
          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px]">
            Total Teams<br /><strong>{teams.length}</strong>
          </div>
          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px]">
            Total Chall<br /><strong>{challenges.length}</strong>
          </div>
          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px]">
            Flags Solved<br /><strong>1090</strong>
          </div>
        </div>

        <div className="relative shrink-0 w-fit">
          <img src="/logo.png" alt="Site Logo" className="h-[270px] w-auto mix-blend-lighten rounded-lg shadow-lg" />
          <div className="absolute top-[52%] left-[49%] transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#c5ffe5] text-green-800 rounded-md shadow-lg text-lg tracking-wider border border-green-500 font-['Jersey_10'] font-bold">
            ADMIN
          </div>
        </div>
      </header>

      {/* Users Table */}
      <section className="mb-10">
        <h2 className="text-2xl font-serif text-red-400 mb-4">Users</h2>
        <table className="w-full bg-[#e0f7fa] text-black rounded shadow-md">
          <thead className="bg-blue-800 text-white">
            <tr><th>Username</th><th>Points</th><th>Team</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={i} className="text-center border-b hover:bg-blue-100 transition text-lg font-['Jaini_Purva']">
                <td>{u.name}</td>
                <td>{u.points}</td>
                <td>{u.team_name}</td>
                <td className="text-lg text-red-600 cursor-pointer hover:underline hover:text-red-800 transition">Edit | Ban</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Teams Table */}
      <section className="mb-10">
        <h2 className="text-2xl mb-4">Teams</h2>
        <table className="w-full bg-[#e0f7fa] text-black rounded shadow-md">
          <thead className="bg-blue-800 text-white">
            <tr><th>Team</th><th>Score</th><th>Country</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {teams.map((t, i) => (
              <tr key={i} className="text-center text-lg border-b hover:bg-blue-100 font-['Jaini_Purva'] transition">
                <td>{t.name}</td>
                <td>{t.score}</td>
                <td>{t.country}</td>
                <td className="text-lg text-red-600 cursor-pointer hover:underline hover:text-red-800 transition">Edit | Ban</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Challenges Table */}
      <section>
        <h2 className="text-2xl mb-4 flex items-center justify-between">
          Challenges
          <button
            onClick={() => setShowModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:scale-105 transition-transform duration-200 px-4 py-1 rounded text-white text-sm shadow-md"
          >
            + ADD
          </button>
        </h2>
        <table className="w-full bg-[#e0f7fa] text-black rounded shadow-md">
          <thead className="bg-blue-800 text-white">
            <tr><th>Challenge</th><th>Points</th><th>Category</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {challenges.map((c, i) => (
              <tr key={i} className="text-center text-lg text-green-700 font-['Jaini_Purva'] border-b hover:bg-blue-100 transition">
                <td>{c.name}</td>
                <td>{c.points}</td>
                <td>{c.category || 'Uncategorized'}</td>
                <td className="text-sm text-red-600 cursor-pointer hover:underline hover:text-red-800 transition">Edit | Delete</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Add New Challenge</h2>
            <form onSubmit={handleCreateChallenge} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={newChallenge.name}
                onChange={e => setNewChallenge(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                placeholder="Description"
                required
                value={newChallenge.desc}
                onChange={e => setNewChallenge(prev => ({ ...prev, desc: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Flag (FCTF{...})"
                required
                value={newChallenge.flag}
                onChange={e => setNewChallenge(prev => ({ ...prev, flag: e.target.value }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Points"
                required
                value={newChallenge.points === 0 ? '' : newChallenge.points}
                onChange={e =>
                  setNewChallenge(prev => ({
                    ...prev,
                    points: isNaN(parseInt(e.target.value)) ? 0 : parseInt(e.target.value)
                  }))
                }
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex justify-between">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="text-red-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
