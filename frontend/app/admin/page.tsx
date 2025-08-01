'use client'

import React, { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Jersey_10 } from "next/font/google";
const jersey = Jersey_10({ subsets: ["latin"], weight: "400", variable: "--font-jersey-10" });
import { Jaini_Purva } from "next/font/google";
const jainiPurva = Jaini_Purva({ subsets: ["latin"], weight: "400", variable: "--font-jaini-purva" });

// --- Interfaces ---
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
  desc: string
  points: number
  flag_hash: string
  solved_cnt: number
  files: { id: number; name: string }[]
}

interface FileUpload {
  chall_id: number
  file: File | null
}

interface Notification {
  id: number;
  title: string;
  content: string;
  timestamp: number;
}

interface NewNotification {
  title: string;
  content: string;
}

export default function AdminDashboard() {
  // --- State Management ---
  const [users, setUsers] = useState<User[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showFileModal, setShowFileModal] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [fileUpload, setFileUpload] = useState<FileUpload>({ chall_id: 0, file: null })
  const [newChallenge, setNewChallenge] = useState({ name: '', desc: '', flag: '', points: 0 })
  const [editingFlag, setEditingFlag] = useState('')

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showEditNotificationModal, setShowEditNotificationModal] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  const [newNotification, setNewNotification] = useState<NewNotification>({ title: '', content: '' });

  const router = useRouter()

  // --- Effects ---
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

  // --- Data Fetching ---
  const fetchData = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [userRes, teamRes, challRes, notificationRes] = await Promise.all([
        fetch('http://localhost:8000/users', { headers }),
        fetch('http://localhost:8000/teams', { headers }),
        fetch('http://localhost:8000/challs/', { headers }),
        fetch('http://localhost:8000/notifications/', { headers })
      ])
      
      const userData = await userRes.json()
      const teamData = await teamRes.json()
      const challData = await challRes.json()
      const notificationData = await notificationRes.json()

      setUsers(userData.users || [])
      setTeams(teamData.teams || [])
      setChallenges(challData.challs || [])
      setNotifications(notificationData.notifications || [])
    } catch (error) {
      console.error('Failed to fetch admin data:', error)
    }
  }

  // --- Event Handlers (Challenges & Files) ---
  const handleCreateChallenge = async (e: FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch('http://localhost:8000/challs/add', {
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

  const handleUpdateChallenge = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    if (!token || !editingChallenge) return;

    if (!editingFlag.trim()) {
      alert("A new flag is required to update a challenge.");
      return;
    }

    const payload = {
      name: editingChallenge.name,
      desc: editingChallenge.desc,
      points: editingChallenge.points,
      flag: editingFlag.trim(),
    };

    try {
      const res = await fetch(`http://localhost:8000/challs/${editingChallenge.id}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error('Challenge update failed');
      }

      setShowEditModal(false);
      setEditingChallenge(null);
      setEditingFlag('');
      await fetchData(token);
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const handleDeleteChallenge = async (challId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (!confirm('Are you sure you want to delete this challenge?')) return

    try {
      const res = await fetch(`http://localhost:8000/challs/${challId}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('Challenge deletion failed')
      await fetchData(token)
    } catch (error) {
      console.error('Error deleting challenge:', error)
    }
  }

  const handleFileUpload = async (e: FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token || !fileUpload.file) return

    try {
      const formData = new FormData()
      formData.append('file', fileUpload.file)

      const res = await fetch(`http://localhost:8000/challs/${fileUpload.chall_id}/file/add`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!res.ok) throw new Error('File upload failed')

      setShowFileModal(false)
      setFileUpload({ chall_id: 0, file: null })
      await fetchData(token)
    } catch (error) {
      console.error('Error uploading file:', error)
    }
  }

  const handleDeleteFile = async (challId: number, fileId: number) => {
    const token = localStorage.getItem('token')
    if (!token) return

    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const res = await fetch(`http://localhost:8000/challs/${challId}/file/${fileId}/delete`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) throw new Error('File deletion failed')
      await fetchData(token)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  // --- Event Handlers (Notifications) ---
  const handleCreateNotification = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = {
        title: newNotification.title,
        content: newNotification.content,
        timestamp: 0
    };

    try {
        const res = await fetch('http://localhost:8000/notifications/add', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.detail || 'Notification creation failed');
        }

        setShowNotificationModal(false);
        setNewNotification({ title: '', content: '' });
        await fetchData(token);
        alert('Notification sent successfully!');
    } catch (error) {
        console.error('Error creating notification:', error);
        alert(`Error: ${error}`);
    }
  };

  const handleUpdateNotification = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token || !editingNotification) return;

    const payload = {
      title: editingNotification.title,
      content: editingNotification.content,
    };

    try {
      const res = await fetch(`http://localhost:8000/notifications/${editingNotification.id}/update`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Notification update failed');
      }

      setShowEditNotificationModal(false);
      setEditingNotification(null);
      await fetchData(token);
      alert('Notification updated successfully!');
    } catch (error) {
      console.error('Error updating notification:', error);
      alert(`Error: ${error}`);
    }
  };

  const handleDeleteNotification = async (notificationId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    if (!confirm('Are you sure you want to delete this notification?')) return;

    try {
      const res = await fetch(`http://localhost:8000/notifications/${notificationId}/delete`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Notification deletion failed');
      }

      await fetchData(token);
      alert('Notification deleted successfully!');
    } catch (error) {
      console.error('Error deleting notification:', error);
      alert(`Error: ${error}`);
    }
  };

  // --- Render Logic ---
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
          {/* ✨ UPDATED stat cards to be page links */}
          <button
            onClick={() => router.push('/users')}
            className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px] transition-all duration-300 ease-in-out hover:bg-purple-600 hover:scale-105 cursor-pointer"
          >
            Total Users<br /><strong>{users.length}</strong>
          </button>
          
          <button
            onClick={() => router.push('/teams')}
            className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px] transition-all duration-300 ease-in-out hover:bg-purple-600 hover:scale-105 cursor-pointer"
          >
            Total Teams<br /><strong>{teams.length}</strong>
          </button>

          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px] transition-all duration-300 ease-in-out hover:bg-purple-600 hover:scale-105">
            Total Chall<br /><strong>{challenges.length}</strong>
          </div>

          <div className="bg-[#2e263e] p-4 rounded text-center shadow min-w-[150px] transition-all duration-300 ease-in-out hover:bg-purple-600 hover:scale-105">
            Total Solves<br /><strong>{challenges.reduce((sum, c) => sum + c.solved_cnt, 0)}</strong>
          </div>
        </div>

        <div className="relative shrink-0 w-fit">
          <img src="/logo.png" alt="Site Logo" className="h-[380px] w-auto mix-blend-lighten rounded-lg shadow-lg" />
          <div className="absolute top-[52%] left-[49%] transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#c5ffe5] text-green-800 rounded-md shadow-lg text-lg tracking-wider border border-green-500 font-['Jersey_10'] font-bold">
            ADMIN
          </div>
        </div>
      </header>

      {/* Users Table */}
      <section className="mb-10 -mt-16">
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

      {/* Notifications Table Section */}
      <section className="mb-10">
          <h2 className="text-2xl mb-4 flex items-center justify-between">
              Notifications
              <button
                  onClick={() => {
                    setNewNotification({ title: '', content: '' });
                    setShowNotificationModal(true);
                  }}
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:scale-105 transition-transform duration-200 px-4 py-1 rounded text-white text-sm shadow-md"
              >
                  + ADD NOTIFICATION
              </button>
          </h2>
          <table className="w-full bg-[#e0f7fa] text-black rounded shadow-md">
            <thead className="bg-purple-800 text-white">
              <tr>
                <th className="p-2">Title</th>
                <th className="p-2">Content Snippet</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((n) => (
                <tr key={n.id} className="text-center border-b hover:bg-purple-100 transition">
                  <td className="p-2">{n.title}</td>
                  <td className="p-2 text-left">{n.content.substring(0, 50)}{n.content.length > 50 ? '...' : ''}</td>
                  <td className="p-2">
                    <button
                      onClick={() => {
                        setEditingNotification(n);
                        setShowEditNotificationModal(true);
                      }}
                      className="text-sm text-blue-600 hover:underline mr-2"
                    >
                      Edit
                    </button>
                    |
                    <button
                      onClick={() => handleDeleteNotification(n.id)}
                      className="text-sm text-red-600 hover:underline ml-2"
                    >
                      Delete
                    </button>
                  </td>
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
            <tr><th>Challenge</th><th>Points</th><th>Solves</th><th>Files</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {challenges.map((c, i) => (
              <tr key={i} className="text-center text-lg text-green-700 font-['Jaini_Purva'] border-b hover:bg-blue-100 transition">
                <td>{c.name}</td>
                <td>{c.points}</td>
                <td>{c.solved_cnt}</td>
                <td>
                  <div className="flex flex-wrap gap-1 justify-center">
                    {c.files.map(file => (
                      <span key={file.id} className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {file.name}
                        <button
                          onClick={() => handleDeleteFile(c.id, file.id)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                    <button
                      onClick={() => {
                        setFileUpload({ chall_id: c.id, file: null })
                        setShowFileModal(true)
                      }}
                      className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      + Add File
                    </button>
                  </div>
                </td>
                <td className="text-sm text-red-600 cursor-pointer hover:underline hover:text-red-800 transition">
                  <button
                    onClick={() => {
                      setEditingChallenge(c)
                      setEditingFlag('') 
                      setShowEditModal(true)
                    }}
                    className="mr-2 hover:underline"
                  >
                    Edit
                  </button>
                  |
                  <button
                    onClick={() => handleDeleteChallenge(c.id)}
                    className="ml-2 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* --- Modals --- */}
      {/* (All modals remain the same as before) */}

      {/* Create Challenge Modal */}
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

      {/* Edit Challenge Modal */}
      {showEditModal && editingChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Edit Challenge</h2>
            <form onSubmit={handleUpdateChallenge} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                required
                value={editingChallenge.name}
                onChange={e => setEditingChallenge(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <textarea
                placeholder="Description"
                required
                value={editingChallenge.desc}
                onChange={e => setEditingChallenge(prev => prev ? ({ ...prev, desc: e.target.value }) : null)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                type="number"
                placeholder="Points"
                required
                value={editingChallenge.points}
                onChange={e => setEditingChallenge(prev => prev ? ({ ...prev, points: parseInt(e.target.value) || 0 }) : null)}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <input
                  type="text"
                  placeholder="New Flag (Required for update)"
                  value={editingFlag}
                  onChange={e => setEditingFlag(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                  required 
              />
              <div className="flex justify-between">
                <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Update</button>
                <button type="button" onClick={() => setShowEditModal(false)} className="text-red-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Upload Modal */}
      {showFileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded w-[400px] shadow-lg">
            <h2 className="text-xl font-bold mb-4">Upload File</h2>
            <form onSubmit={handleFileUpload} className="space-y-4">
              <input
                type="file"
                required
                onChange={e => setFileUpload(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="w-full p-2 border border-gray-300 rounded"
              />
              <div className="flex justify-between">
                <button type="submit" className="bg-green-600 text-white px-4 py-1 rounded">Upload</button>
                <button type="button" onClick={() => setShowFileModal(false)} className="text-red-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Notification Modal */}
      {showNotificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white text-black p-6 rounded w-[400px] shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Add New Notification</h2>
                  <form onSubmit={handleCreateNotification} className="space-y-4">
                      <input
                          type="text"
                          placeholder="Title"
                          required
                          value={newNotification.title}
                          onChange={e => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded"
                      />
                      <textarea
                          placeholder="Content / Message"
                          required
                          value={newNotification.content}
                          onChange={e => setNewNotification(prev => ({ ...prev, content: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded"
                          rows={4}
                      />
                      <div className="flex justify-between">
                          <button type="submit" className="bg-purple-600 text-white px-4 py-1 rounded">Send Notification</button>
                          <button type="button" onClick={() => setShowNotificationModal(false)} className="text-red-600">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Edit Notification Modal */}
      {showEditNotificationModal && editingNotification && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
              <div className="bg-white text-black p-6 rounded w-[400px] shadow-lg">
                  <h2 className="text-xl font-bold mb-4">Edit Notification</h2>
                  <form onSubmit={handleUpdateNotification} className="space-y-4">
                      <input
                          type="text"
                          placeholder="Title"
                          required
                          value={editingNotification.title}
                          onChange={e => setEditingNotification(prev => prev ? { ...prev, title: e.target.value } : null)}
                          className="w-full p-2 border border-gray-300 rounded"
                      />
                      <textarea
                          placeholder="Content / Message"
                          required
                          value={editingNotification.content}
                          onChange={e => setEditingNotification(prev => prev ? { ...prev, content: e.target.value } : null)}
                          className="w-full p-2 border border-gray-300 rounded"
                          rows={4}
                      />
                      <div className="flex justify-between">
                          <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">Update Notification</button>
                          <button type="button" onClick={() => setShowEditNotificationModal(false)} className="text-red-600">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  )
}
