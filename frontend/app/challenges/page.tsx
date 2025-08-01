'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

import { Jersey_10 } from "next/font/google";

const jersey = Jersey_10({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-jersey-10",
});

interface Challenge {
  id: number
  name: string
  desc: string
  points: number
  solved_cnt: number
  files: { id: number; name: string }[]
}

export default function ChallengePage() {
  const [openChallenge, setOpenChallenge] = useState<Challenge | null>(null)
  const [flag, setFlag] = useState('')
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [loading, setLoading] = useState(false)
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null)
  const [authorized, setAuthorized] = useState(false)
  const [userTeam, setUserTeam] = useState<string | null>(null)
  
  const [submissionTimestamps, setSubmissionTimestamps] = useState<number[]>([]);
  const MAX_SUBMISSIONS_PER_WINDOW = 1;
  const TIME_WINDOW_MS = 1000;

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login');
      setLoading(false);
    } else {
      setAuthorized(true)
      fetchUserData(token)
      fetchChallenges(token)
    }
  }, [])

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/user/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const userData = await response.json()
        setUserTeam(userData.team_id ? 'has_team' : null)
      } else {
        console.error('Failed to fetch user data:', response.statusText);
        localStorage.removeItem('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      localStorage.removeItem('token');
      router.push('/login');
    }
  }

  const fetchChallenges = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/challs/', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        if (response.status === 401) {
            console.error('Unauthorized to fetch challenges. Token might be expired.');
            localStorage.removeItem('token');
            router.push('/login');
        }
        throw new Error('Failed to fetch challenges');
      }
      const data = await response.json()
      setChallenges(data.challs || [])
    } catch (error) {
      console.error('Error fetching challenges:', error)
      setChallenges([]);
    }
  }

  const handleOpen = async (id: number) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`http://localhost:8000/challs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
            console.error('Unauthorized to fetch challenge details. Token might be expired.');
            localStorage.removeItem('token');
            router.push('/login');
        }
        throw new Error('Failed to fetch challenge details');
      }
      const challengeData = await response.json()
      setOpenChallenge(challengeData)
      setFlag('')
      setSubmitResult(null)
    } catch (error) {
      console.error('Error fetching challenge details:', error)
      const challenge = challenges.find(c => c.id === id)
      if (challenge) {
        setOpenChallenge(challenge)
        setFlag('')
        setSubmitResult(null)
      } else {
        setSubmitResult({ success: false, message: 'Could not load challenge details.' });
      }
    }
  }

  const handleClose = () => {
    setOpenChallenge(null)
    setSubmitResult(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token || !openChallenge) {
      router.push('/login');
      setLoading(false);
      return;
    }

    if (!userTeam) {
      setSubmitResult({
        success: false,
        message: 'You must be part of a team to solve challenges. Please join a team first.',
      });
      setLoading(false);
      return;
    }

    // --- Client-Side Rate Limiting Check ---
    const now = Date.now();
    const recentTimestamps = submissionTimestamps.filter(
      (timestamp) => now - timestamp < TIME_WINDOW_MS
    );

    if (recentTimestamps.length >= MAX_SUBMISSIONS_PER_WINDOW) {
      setSubmitResult({
        success: false,
        message: `Too many submissions! Please wait before trying again. (${MAX_SUBMISSIONS_PER_WINDOW} per ${TIME_WINDOW_MS / 1000} seconds)`,
      });
      setLoading(false);
      return;
    }

    setSubmissionTimestamps([...recentTimestamps, now]);
    // --- End Client-Side Rate Limiting Check ---

    try {
      const response = await fetch(
        `http://localhost:8000/challs/${openChallenge.id}/solve`, // The URL no longer includes the flag
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json', // Specify content type for JSON body
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ flag: flag.trim() }), // Send the flag in the request body
        }
      );

      const result = await response.json();
      if (!response.ok) {
        const errorMessage = result.detail || result.message || 'Submission failed';
        throw new Error(errorMessage);
      }

      setSubmitResult({ success: true, message: result.message || 'Flag correct!' });
      await fetchChallenges(token);

      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (error: any) {
      console.error('Error submitting flag to server:', error);
      setSubmitResult({
        success: false,
        message: error.message || 'Failed to submit flag. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleFileDownload = async (challId: number, fileId: number, fileName: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
        router.push('/login');
        return;
    }

    try {
      const response = await fetch(`http://localhost:8000/challs/${challId}/file/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        if (response.status === 401) {
            console.error('Unauthorized to download file. Token might be expired.');
            localStorage.removeItem('token');
            router.push('/login');
        }
        console.error('Failed to download file:', response.statusText);
        setSubmitResult({ success: false, message: `Failed to download ${fileName}.` });
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      setSubmitResult({ success: false, message: `Error downloading ${fileName}.` });
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        Checking authentication...
      </div>
    )
  }

  const grouped = challenges.reduce((acc: Record<string, Challenge[]>, chall) => {
    const parts = chall.name.split('/');
    let category: string;
    let title: string;

    if (parts.length > 1) {
        category = parts[0].trim();
        title = parts.slice(1).join('/').trim();
    } else {
      category = 'Uncategorized';
      title = chall.name.trim();
    }
    
    const cleanChallenge = { ...chall, name: title || chall.name };

    if (!acc[category]) acc[category] = [];
    acc[category].push(cleanChallenge);
    return acc;
  }, {});


  return (
    <div className="flex flex-col min-h-screen bg-[#221633] text-white">
      <main className="flex-1 p-6">
        <header className="text-center mb-8">
          <h1 className="text-5xl text-[#00e676] font-['Jaini_Purva'] font-bold bg-[#f16022] px-7 py-4 pb-5 rounded-xl inline-block tracking-wider">
            Challenges
          </h1>
        </header>

        {!userTeam && (
          <div className="mb-6 p-4 bg-yellow-600 text-white rounded-lg text-center">
            <strong>⚠️ You must join a team to solve challenges!</strong>
          </div>
        )}

        {Object.entries(grouped).map(([category, challs]) => (
          <div key={category} className="ml-2 mb-12 font-['Jersey_10']">
            <div className={jersey.variable}>
              <h2 className="text-3xl font-bold ml-5 mb-4 uppercase font-jersey tracking-widest text-lime-400">{category}</h2>
            </div>
            <div className="grid grid-cols-2 font-['Outfit'] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {challs.map(challenge => (
                <button
                  key={challenge.id}
                  onClick={() => handleOpen(challenge.id)}
                  className="ml-4 w-full bg-[#e7d6d6] rounded-lg p-4 flex flex-col items-center hover:bg-[#ccc] transition relative"
                >
                  <span className="text-2xl font-semibold text-black">{challenge.name}</span>
                  <span className="text-lg font-bold mt-2 text-gray-800">{challenge.points} pts</span>
                  <span className="text-sm text-gray-600 mt-1">
                    {challenge.solved_cnt} solve{challenge.solved_cnt !== 1 ? 's' : ''}
                  </span>
                  {challenge.files && challenge.files.length > 0 && (
                    <span className="absolute top-2 right-2 text-blue-600 text-sm">
                      📁 {challenge.files.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </main>

      {openChallenge && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <div
            className="bg-[#d6ecd6] rounded-lg max-w-md w-full p-6 relative max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-600 text-xl hover:text-black"
              onClick={handleClose}
            >
              &times;
            </button>

            {(() => {
              const parts = openChallenge.name.includes('/')
                ? openChallenge.name.split('/')
                : ['General', openChallenge.name];

              const category = parts[0].trim();
              const title = parts.slice(1).join('/').trim();

              return (
                <>
                 <h4
                  className="text-xl text-[#289ac4] font-['Jaini_Purva'] font-extrabold uppercase tracking-widest mt-1 mb-2"
                 >
                   {category}
                 </h4>
                 <h3 className="text-xl font-bold mb-2 text-[#df9960]">{title}</h3>
                </>
              )
            })()}

            <div className="mb-2 text-gray-700 whitespace-pre-wrap">{openChallenge.desc}</div>

            <div className="mb-4 text-sm text-gray-600">
              <span className="font-semibold text-lg font-['Jaini_Purva'] tracking-wider text-[#1a9e23]">Points:</span> {openChallenge.points} |{' '}
              <span className="font-semibold text-lg font-['Jaini_Purva'] tracking-wider text-[#f06d3a]">Solves:</span> {openChallenge.solved_cnt}
            </div>

            {openChallenge.files && openChallenge.files.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Files:</h4>
                <div className="space-y-2">
                  {openChallenge.files.map(file => (
                    <button
                      key={file.id}
                      onClick={() => handleFileDownload(openChallenge.id, file.id, file.name)}
                      className="block w-full text-left p-2 bg-blue-100 hover:bg-blue-200 rounded text-blue-800 transition"
                    >
                      📁 {file.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="mb-5 text-gray-900">
              Flag format: <code className="bg-gray-200 px-1 rounded">FCTF&#123;your_flag_here&#125;</code>
            </p>

            {submitResult && (
              <div
                className={`mb-4 p-3 rounded ${
                  submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}
              >
                {submitResult.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="FCTF{...}"
                value={flag}
                onChange={e => setFlag(e.target.value)}
                required
                disabled={!userTeam || loading} 
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring text-black disabled:bg-gray-200"
              />

              <button
                type="submit"
                disabled={loading || !userTeam} 
                className={`w-full ${
                  loading || !userTeam ? 'bg-gray-400' : 'bg-[#ff4e00]'
                } text-white px-4 py-2 rounded hover:bg-orange-600 transition disabled:cursor-not-allowed`}
              >
                {loading ? 'Submitting...' : !userTeam ? 'Join a team first' : 'Submit Flag'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
