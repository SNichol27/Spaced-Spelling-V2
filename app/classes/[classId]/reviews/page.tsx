'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Review {
  id: string
  list_id: string
  list_name: string
  review_number: number
  scheduled_week: number
  status: 'pending' | 'completed'
  created_at: string
}

export default function ReviewsByWeekPage() {
  const params = useParams()
  const classId = params.classId as string

  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null)
  const [weeksInYear, setWeeksInYear] = useState(36)

  useEffect(() => {
    if (classId) {
      fetchClassInfo()
      fetchReviews()
    }
  }, [classId])

  async function fetchClassInfo() {
    try {
      const response = await fetch(`/api/classes/${classId}`)
      if (!response.ok) throw new Error('Failed to fetch class')
      const classData = await response.json()
      setWeeksInYear(classData.weeks_in_year)
    } catch (err) {
      console.error('Error fetching class info:', err)
    }
  }

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/classes/${classId}/reviews`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const data = await response.json()
      setReviews(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  async function markReviewComplete(reviewId: string) {
    try {
      const response = await fetch(`/api/classes/${classId}/reviews`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId }),
      })

      if (!response.ok) throw new Error('Failed to mark review complete')

      await fetchReviews()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update review')
    }
  }

  // Group reviews by week
  const reviewsByWeek: { [key: number]: Review[] } = {}
  reviews.forEach((review) => {
    const week = review.scheduled_week
    if (!reviewsByWeek[week]) {
      reviewsByWeek[week] = []
    }
    reviewsByWeek[week].push(review)
  })

  const sortedWeeks = Object.keys(reviewsByWeek)
    .map(Number)
    .sort((a, b) => a - b)

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/dashboard" className="text-indigo-600 font-semibold">
            ← Back to Dashboard
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Reviews by Week
        </h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              No reviews scheduled yet. Create spelling lists to generate review
              schedules.
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Week Navigation */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Select Week
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: weeksInYear }, (_, i) => i + 1).map(
                  (week) => {
                    const weekReviews = reviewsByWeek[week] || []
                    const completedCount = weekReviews.filter(
                      (r) => r.status === 'completed'
                    ).length
                    const hasReviews = weekReviews.length > 0
                    const isAllCompleted =
                      hasReviews && completedCount === weekReviews.length

                    return (
                      <button
                        key={week}
                        onClick={() => setSelectedWeek(week)}
                        className={`
                          p-3 rounded-lg font-semibold transition text-center
                          ${selectedWeek === week ? 'ring-2 ring-indigo-500' : ''}
                          ${
                            !hasReviews
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : isAllCompleted
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                          }
                        `}
                        disabled={!hasReviews}
                      >
                        <div className="text-sm">W{week}</div>
                        {hasReviews && (
                          <div className="text-xs mt-1">
                            {completedCount}/{weekReviews.length}
                          </div>
                        )}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* Week Details */}
            {selectedWeek && reviewsByWeek[selectedWeek] && (
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Week {selectedWeek} Reviews
                </h2>

                <div className="space-y-4">
                  {reviewsByWeek[selectedWeek].map((review) => (
                    <div
                      key={review.id}
                      className="p-6 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {review.list_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Review #{review.review_number}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Created:{' '}
                            {new Date(review.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {review.status === 'completed' ? (
                            <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                              ✓ Completed
                            </span>
                          ) : (
                            <button
                              onClick={() => markReviewComplete(review.id)}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Weeks Overview */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                All Weeks Overview
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Week
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Reviews
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Progress
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedWeeks.map((week) => {
                      const weekReviews = reviewsByWeek[week]
                      const completedCount = weekReviews.filter(
                        (r) => r.status === 'completed'
                      ).length
                      const progress = Math.round(
                        (completedCount / weekReviews.length) * 100
                      )

                      return (
                        <tr key={week} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-semibold text-gray-900">
                            Week {week}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {weekReviews.length}
                          </td>
                          <td className="px-6 py-4 text-gray-600">
                            {completedCount}
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full transition"
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-600 mt-1">
                              {progress}%
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
