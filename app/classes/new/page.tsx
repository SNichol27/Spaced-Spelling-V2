'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type ScheduleType = 'expanding_spacing' | 'fixed_spacing' | 'control'

export default function NewClassPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    schedule: 'expanding_spacing' as ScheduleType,
    weeksInYear: 36,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create class')
      }

      const newClass = await response.json()
      router.push(`/classes/${newClass.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create New Class
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Period 3, 5th Grade A"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Schedule Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Review Schedule Strategy *
              </label>
              <div className="space-y-3">
                <div>
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition"
                    style={{
                      borderColor:
                        formData.schedule === 'expanding_spacing'
                          ? '#4f46e5'
                          : '#d1d5db',
                    }}
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value="expanding_spacing"
                      checked={formData.schedule === 'expanding_spacing'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: e.target.value as ScheduleType,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Expanding Spacing (Recommended)
                      </div>
                      <div className="text-sm text-gray-600">
                        Reviews at 1, 2, 4, 8, 16 weeks - mimics spaced repetition
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition"
                    style={{
                      borderColor:
                        formData.schedule === 'fixed_spacing'
                          ? '#4f46e5'
                          : '#d1d5db',
                    }}
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value="fixed_spacing"
                      checked={formData.schedule === 'fixed_spacing'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: e.target.value as ScheduleType,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Fixed Spacing
                      </div>
                      <div className="text-sm text-gray-600">
                        Reviews every 2 weeks - consistent intervals
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="flex items-center p-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 transition"
                    style={{
                      borderColor:
                        formData.schedule === 'control' ? '#4f46e5' : '#d1d5db',
                    }}
                  >
                    <input
                      type="radio"
                      name="schedule"
                      value="control"
                      checked={formData.schedule === 'control'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          schedule: e.target.value as ScheduleType,
                        })
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-semibold text-gray-900">
                        Control (No Reviews)
                      </div>
                      <div className="text-sm text-gray-600">
                        No automatic reviews - baseline for research
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Weeks in Year */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Academic Weeks per Year *
              </label>
              <input
                type="number"
                required
                min="1"
                max="52"
                value={formData.weeksInYear}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weeksInYear: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Typically 36-40 weeks for a full school year
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Class'}
              </button>
              <Link
                href="/dashboard"
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
