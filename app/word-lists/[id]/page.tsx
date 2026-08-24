'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface Word {
  id: string
  word: string
  definition?: string
}

interface WordListFormData {
  name: string
  description: string
  words: Word[]
}

export default function WordListFormPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listId = params?.id as string | undefined

  const [formData, setFormData] = useState<WordListFormData>({
    name: '',
    description: '',
    words: [],
  })
  const [newWord, setNewWord] = useState('')
  const [newDefinition, setNewDefinition] = useState('')
  const [loading, setLoading] = useState(listId ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (listId && user) {
      fetchWordList()
    }
  }, [listId, user])

  async function fetchWordList() {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('word_lists')
        .select(
          `
          id,
          name,
          description,
          words (
            id,
            word,
            definition
          )
        `
        )
        .eq('id', listId)
        .eq('teacher_id', user?.id)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Word list not found')

      setFormData({
        name: data.name,
        description: data.description || '',
        words: data.words || [],
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load word list')
    } finally {
      setLoading(false)
    }
  }

  function handleAddWord() {
    if (!newWord.trim()) {
      setError('Word cannot be empty')
      return
    }

    const word: Word = {
      id: `temp-${Date.now()}`,
      word: newWord.trim(),
      definition: newDefinition.trim() || undefined,
    }

    setFormData({
      ...formData,
      words: [...formData.words, word],
    })

    setNewWord('')
    setNewDefinition('')
    setError('')
  }

  function handleRemoveWord(wordId: string) {
    setFormData({
      ...formData,
      words: formData.words.filter((w) => w.id !== wordId),
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('List name is required')
      return
    }

    if (formData.words.length === 0) {
      setError('Add at least one word to the list')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      if (listId) {
        // Update existing list
        const { error: updateError } = await supabase
          .from('word_lists')
          .update({
            name: formData.name,
            description: formData.description,
          })
          .eq('id', listId)

        if (updateError) throw updateError

        // Delete removed words and add new ones
        const existingIds = formData.words
          .filter((w) => !w.id.startsWith('temp-'))
          .map((w) => w.id)

        if (existingIds.length > 0) {
          await supabase
            .from('words')
            .delete()
            .eq('word_list_id', listId)
            .not('id', 'in', `(${existingIds.join(',')})`)
        } else {
          await supabase
            .from('words')
            .delete()
            .eq('word_list_id', listId)
        }

        // Insert new words
        const newWords = formData.words
          .filter((w) => w.id.startsWith('temp-'))
          .map((w) => ({
            word_list_id: listId,
            word: w.word,
            definition: w.definition || null,
          }))

        if (newWords.length > 0) {
          const { error: insertError } = await supabase
            .from('words')
            .insert(newWords)

          if (insertError) throw insertError
        }
      } else {
        // Create new list
        const { data: listData, error: createError } = await supabase
          .from('word_lists')
          .insert([
            {
              teacher_id: user?.id,
              name: formData.name,
              description: formData.description,
              is_active: true,
            },
          ])
          .select()
          .single()

        if (createError) throw createError

        // Insert words
        const wordsToInsert = formData.words.map((w) => ({
          word_list_id: listData.id,
          word: w.word,
          definition: w.definition || null,
        }))

        const { error: insertError } = await supabase
          .from('words')
          .insert(wordsToInsert)

        if (insertError) throw insertError
      }

      router.push('/word-lists')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save word list')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/word-lists" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Word Lists
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {listId ? 'Edit Word List' : 'Create New Word List'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* List Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                List Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Common Homophones"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                disabled={submitting}
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Optional: Add a description for this word list"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none resize-none"
                disabled={submitting}
              />
            </div>

            {/* Add Words Section */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Words ({formData.words.length})
              </h2>

              <div className="space-y-3 mb-4">
                <div>
                  <label htmlFor="word" className="block text-sm font-semibold text-gray-700 mb-2">
                    Add Word *
                  </label>
                  <input
                    type="text"
                    id="word"
                    value={newWord}
                    onChange={(e) => setNewWord(e.target.value)}
                    placeholder="Enter a word"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    disabled={submitting}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddWord()
                      }
                    }}
                  />
                </div>

                <div>
                  <label htmlFor="definition" className="block text-sm font-semibold text-gray-700 mb-2">
                    Definition (optional)
                  </label>
                  <input
                    type="text"
                    id="definition"
                    value={newDefinition}
                    onChange={(e) => setNewDefinition(e.target.value)}
                    placeholder="Enter a definition"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none"
                    disabled={submitting}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddWord()
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddWord}
                  disabled={submitting}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  + Add Word
                </button>
              </div>

              {/* Words List */}
              {formData.words.length > 0 && (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {formData.words.map((word, idx) => (
                    <div
                      key={word.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{idx + 1}. {word.word}</p>
                        {word.definition && (
                          <p className="text-sm text-gray-600">{word.definition}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveWord(word.id)}
                        disabled={submitting}
                        className="ml-4 px-3 py-1 text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : listId ? 'Update List' : 'Create List'}
              </button>
              <Link
                href="/word-lists"
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-900 rounded-lg hover:bg-gray-400 transition font-semibold text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
