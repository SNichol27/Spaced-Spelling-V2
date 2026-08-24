'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Word {
  id: string
  word: string
  definition: string | null
  word_order: number
}

interface Review {
  id: string
  review_number: number
  scheduled_week: number
  status: 'pending' | 'completed'
}

interface SpellingList {
  id: string
  name: string
  week_taught: number
  class_id: string
  created_at: string
}

export default function SpellingListDetailPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string
  const listId = params.listId as string

  const [list, setList] = useState<SpellingList | null>(null)
  const [words, setWords] = useState<Word[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (classId && listId) {
      fetchListData()
      fetchWords()
      fetchReviews()
    }
  }, [classId, listId])

  async function fetchListData() {
    try {
      const response = await fetch(`/api/classes/${classId}/lists`)
      if (!response.ok) throw new Error('Failed to fetch lists')
      const data = await response.json()
      const currentList = data.find((l: SpellingList) => l.id === listId)
      setList(currentList || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    }
  }

  async function fetchWords() {
    try {
      const response = await fetch(
        `/api/classes/${classId}/lists/${listId}/words`
      )
      if (!response.ok) throw new Error('Failed to fetch words')
      const data = await response.json()
      setWords(data || [])
    } catch (err) {
      console.error('Error fetching words:', err)
    }
  }

  async function fetchReviews() {
    try {
      const response = await fetch(`/api/classes/${classId}/reviews`)
      if (!response.ok) throw new Error('Failed to fetch reviews')
      const allReviews = await response.json()
      // Filter reviews for this list
      const listReviews = allReviews.filter((r: any) => r.list_id === listId)
      setReviews(listReviews || [])
    } catch (err) {
      console.error('Error fetching reviews:', err)
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold">Loading...</div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-semibold text-red-600">
          Spelling list not found
        </div>
      </div>
    )
  }

  const completedCount = reviews.filter((r) => r.status === 'completed').length
  const pendingCount = reviews.filter((r) => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href={`/classes/${classId}`}
            className="text-indigo-600 font-semibold"
          >
            ← Back to Class
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* List Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{list.name}</h1>
          <p className="text-gray-600 mb-4">
            Week {list.week_taught} • {words.length} words
          </p>
          <p className="text-sm text-gray-500">
            Created: {new Date(list.created_at).toLocaleDateString()}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Words */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Spelling Words
              </h2>

              {words.length === 0 ? (
                <p className="text-gray-500">No words in this list.</p>
              ) : (
                <div className="space-y-4">
                  {words.map((word, index) => (
                    <div
                      key={word.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-900">
                            {word.word}
                          </p>
                          {word.definition && (
                            <p className="text-gray-600 mt-1">
                              {word.definition}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Review Status */}
          <div>
            <div className="bg-white rounded-lg shadow-lg p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Review Schedule
              </h2>

              <div className="space-y-4 mb-8">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Scheduled Reviews</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {reviews.length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {completedCount}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {pendingCount}
                  </p>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="space-y-2">
                  <h3 className="font-semibold text-gray-900 mb-3">Reviews</h3>
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-gray-900">
                            Review {review.review_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            Week {review.scheduled_week}
                          </p>
                        </div>
                        {review.status === 'pending' && (
                          <button
                            onClick={() => markReviewComplete(review.id)}
                            className="px-2 py-1 text-xs bg-indigo-100 text-indigo-600 rounded hover:bg-indigo-200 transition font-semibold whitespace-nowrap"
                          >
                            Mark Done
                          </button>
                        )}
                        {review.status === 'completed' && (
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded font-semibold">
                            ✓ Done
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">
                  No reviews scheduled for this list.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
