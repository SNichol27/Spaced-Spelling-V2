'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface SpellingList {
  id: string
  name: string
  week_taught: number
  created_at: string
}

interface Class {
  id: string
  name: string
  schedule: string
  weeks_in_year: number
}

export default function ClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [classData, setClassData] = useState<Class | null>(null)
  const [lists, setLists] = useState<SpellingList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (classId) {
      fetchClassData()
      fetchSpellingLists()
    }
  }, [classId])

  async function fetchClassData() {
    try {
      const response = await fetch(`/api/classes/${classId}`)
      if (!response.ok) throw new Error('Failed to fetch class')
      const data = await response.json()
      setClassData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  async function fetchSpellingLists() {
    try {
      const response = await fetch(`/api/classes/${classId}/lists`)
      if (!response.ok) throw new Error('Failed to fetch lists')
      const data = await response.json()
      setLists(data || [])
    } catch (err) {
      console.error('Error fetching lists:', err)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteClass() {
    if (!confirm('Are you sure you want to delete this class? This cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete class')
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">Class not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-indigo-600 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Class Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {classData.name}
              </h1>
              <div className="space-y-2 text-gray-600">
                <p>
                  <span className="font-semibold">Schedule:</span>{' '}
                  {classData.schedule.replace(/_/g, ' ')}
                </p>
                <p>
                  <span className="font-semibold">Academic Weeks:</span>{' '}
                  {classData.weeks_in_year}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/classes/${classId}/edit`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Edit
              </Link>
              <button
                onClick={handleDeleteClass}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Spelling Lists Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Spelling Lists</h2>
            <Link
              href={`/classes/${classId}/lists/new`}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              + New List
            </Link>
          </div>

          {lists.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">
                No spelling lists created yet.
              </p>
              <Link
                href={`/classes/${classId}/lists/new`}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                Create Your First List
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      List Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Week Taught
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {lists.map((list) => (
                    <tr key={list.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {list.name}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        Week {list.week_taught}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(list.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/classes/${classId}/lists/${list.id}`}
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
