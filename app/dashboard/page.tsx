'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Class {
  id: string
  name: string
  schedule: string
  weeks_in_year: number
  created_at: string
}

export default function Dashboard() {
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setUser(user)
    fetchClasses()
  }

  async function fetchClasses() {
    try {
      const response = await fetch('/api/classes')
      const data = await response.json()
      setClasses(data)
    } catch (error) {
      console.error('Error fetching classes:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-600">
            Spaced Spelling
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              Welcome, {user?.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">My Classes</h2>
          <Link
            href="/classes/new"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
          >
            + New Class
          </Link>
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              You haven't created any classes yet.
            </p>
            <Link
              href="/classes/new"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Create Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <Link key={cls.id} href={`/classes/${cls.id}`}>
                <div className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {cls.name}
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    <p>
                      <span className="font-semibold">Schedule:</span>{' '}
                      {cls.schedule.replace(/_/g, ' ')}
                    </p>
                    <p>
                      <span className="font-semibold">Weeks/Year:</span>{' '}
                      {cls.weeks_in_year}
                    </p>
                    <p className="text-sm">
                      Created: {new Date(cls.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <button className="text-indigo-600 font-semibold hover:text-indigo-700">
                      View Class →
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
