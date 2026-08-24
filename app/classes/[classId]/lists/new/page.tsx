'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Word {
  word: string
  definition: string
}

export default function NewSpellingListPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.classId as string

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    weekTaught: 1,
    words: [
      { word: '', definition: '' },
      { word: '', definition: '' },
      { word: '', definition: '' },
    ] as Word[],
  })

  function handleWordChange(index: number, field: keyof Word, value: string) {
    const updatedWords = [...formData.words]
    updatedWords[index] = { ...updatedWords[index], [field]: value }
    setFormData({ ...formData, words: updatedWords })
  }

  function addWord() {
    if (formData.words.length < 10) {
      setFormData({
        ...formData,
        words: [...formData.words, { word: '', definition: '' }],
      })
    }
  }

  function removeWord(index: number) {
    if (formData.words.length > 1) {
      const updatedWords = formData.words.filter((_, i) => i !== index)
      setFormData({ ...formData, words: updatedWords })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate
      if (!formData.name.trim()) {
        throw new Error('List name is required')
      }

      const filledWords = formData.words.filter((w) => w.word.trim())
      if (filledWords.length === 0) {
        throw new Error('At least one word is required')
      }

      if (formData.weekTaught < 1 || formData.weekTaught > 52) {
        throw new Error('Week taught must be between 1 and 52')
      }

      const response = await fetch(`/api/classes/${classId}/lists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          weekTaught: formData.weekTaught,
          words: filledWords,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create spelling list')
      }

      const result = await response.json()
      router.push(`/classes/${classId}/lists/${result.list.id}`)
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
          <Link
            href={`/classes/${classId}`}
            className="text-indigo-600 font-semibold"
          >
            ← Back to Class
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Create Spelling List
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* List Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                List Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Week 5 Words, -tion Words"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Week Taught */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Week Taught *
              </label>
              <input
                type="number"
                required
                min="1"
                max="52"
                value={formData.weekTaught}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weekTaught: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                Review schedule will be auto-generated based on this week
              </p>
            </div>

            {/* Words */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Spelling Words *
              </label>
              <div className="space-y-3">
                {formData.words.map((word, index) => (
                  <div key={index} className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Word"
                      value={word.word}
                      onChange={(e) =>
                        handleWordChange(index, 'word', e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Definition (optional)"
                      value={word.definition}
                      onChange={(e) =>
                        handleWordChange(index, 'definition', e.target.value)
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {formData.words.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWord(index)}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition font-semibold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {formData.words.length < 10 && (
                <button
                  type="button"
                  onClick={addWord}
                  className="mt-4 px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition font-semibold"
                >
                  + Add Word
                </button>
              )}
              <p className="mt-2 text-sm text-gray-500">
                {formData.words.filter((w) => w.word.trim()).length} of{' '}
                {formData.words.length} words entered (1-10 required)
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Spelling List'}
              </button>
              <Link
                href={`/classes/${classId}`}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">
              📅 Review Schedule
            </h3>
            <p className="text-sm text-blue-800">
              When you create this list, a review schedule will be automatically
              generated based on your class's spacing strategy. Teachers will be
              able to view and track reviews by week.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
