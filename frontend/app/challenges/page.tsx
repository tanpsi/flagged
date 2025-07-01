'use client'

import React, { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import flagImage from './flag-example.jpg'

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
  const [submitResult, setSubmitResult] = useState<{ success: boolean, message: string } | null>(null)
  const [authorized, setAuthorized] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
    } else {
      setAuthorized(true)
      fetchChallenges(token)
    }
  }, [])

  const fetchChallenges = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8000/chall/s/', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })
      if (!response.ok) throw new Error('Failed to fetch challenges')
      const data = await response.json()
      setChallenges(data.challs)
    } catch (error) {
      console.error('Error fetching challenges:', error)
    }
  }

  const handleOpen = (id: number) => {
    const challenge = challenges.find(c => c.id === id)
    if (challenge) {
      setOpenChallenge(challenge)
      setFlag('')
      setSubmitResult(null)
    }
  }

  const handleClose = () => {
    setOpenChallenge(null)
    setSubmitResult(null)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')
    if (!token || !openChallenge) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(
        `http://localhost:8000/chall/s/${openChallenge.id}/solve?flag=${encodeURIComponent(flag.trim())}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.detail || result || 'Submission failed')
      }

      setSubmitResult({ success: true, message: result.message || 'Flag correct!' })
      await fetchChallenges(token)
    } catch (error: any) {
      console.error('Error submitting flag:', error)
      setSubmitResult({
        success: false,
        message: error.message || 'Failed to submit flag. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        Checking authentication...
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#221633] text-white">
      <main className="flex-1 p-6">
        <header className="text-center mb-8">
          <h1 className="text-5xl text-[#00e676] font-['Jaini_Purva'] font-bold bg-[#f16022] px-7 py-4 pb-5 rounded-xl inline-block tracking-wider">
            Challenges
          </h1>
        </header>

        <div className="grid gap-10">
          <section>
            <div className="grid grid-cols-2 font-['Outfit'] sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {challenges.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => handleOpen(challenge.id)}
                  className="ml-4 w-full bg-[#ddd] rounded-lg p-4  flex flex-col items-center hover:bg-[#ccc] transition"
                >
                  <span className="text-2xl font-semibold text-black">{challenge.name}</span>
                  <span className="text-lg font-bold mt-2 text-gray-800">{challenge.points}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>

      


      {openChallenge && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <div
            className="bg-[#f3e8ff] rounded-lg max-w-md w-full p-6 relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-3 text-gray-600 text-xl hover:text-black"
              onClick={handleClose}
            >
              &times;
            </button>
            <h3 className="text-2xl font-bold mb-2 text-black">{openChallenge.name}</h3>
            <div className="mb-2 text-gray-700">{openChallenge.desc}</div>
            <p className="mb-5 text-gray-900">
              Flag format:&nbsp;
              <code className="bg-gray-200 px-1 rounded">FCTF&#123;your_flag_here&#125;</code>
            </p>

            {submitResult && (
              <div className={`mb-4 p-3 rounded ${submitResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring text-black"
              />
              
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${loading ? 'bg-orange-400' : 'bg-[#ff4e00]'} text-white px-4 py-2 rounded hover:bg-orange-600 transition`}
              >
                {loading ? 'Submitting...' : 'Submit Flag'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
