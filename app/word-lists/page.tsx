'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CardSkeleton } from '@/components/LoadingSkeleton'

interface WordList {
  id: string
  name: string
  description: string
  word_count: number
  is_active: boolean
  created_at: string
}

export default function WordListsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [lists, setLists] = useState<WordList[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchLists()
    }
  }, [user])

  async function fetchLists() {
    try {
      setLoading(true)
      setError('')

      let query = supabase
        .from('word_lists')
        .select(
          `
          id,
          name,
          description,
          is_active,
          created_at,
          words(id)
        `
        )
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false })

      if (filter === 'active') {
        query = query.eq('is_active', true)
      } else if (filter === 'inactive') {
        query = query.eq('is_active', false)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const formattedLists = (data || []).map((list: any) => ({
        id: list.id,
        name: list.name,
        description: list.description || '',
        word_count: list.words?.length || 0,
        is_active: list.is_active,
        created_at: list.created_at,
      }))

      setLists(formattedLists)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load word lists')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(listId: string, currentStatus: boolean) {
    try {
      const { error: updateError } = await supabase
        .from('word_lists')
        .update({ is_active: !currentStatus })
        .eq('id', listId)

      if (updateError) throw updateError

      setLists(
        lists.map((list) =>
          list.id === listId ? { ...list, is_active: !currentStatus } : list
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update list status')
    }
  }

  async function handleDeleteList(listId: string) {
    if (!confirm('Are you sure you want to delete this word list?')) return

    try {
      const { error: deleteError } = await supabase
        .from('word_lists')
        .delete()
        .eq('id', listId)

      if (deleteError) throw deleteError

      setLists(lists.filter((l) => l.id !== listId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete word list')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700">
                ← Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">
                Word Lists
              </h1>
            </div>
            <Link
              href="/word-lists/new"
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              + Create New List
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {error}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2">
          {(['all', 'active', 'inactive'] as const).map((f) => (
            <button
              key={f}
              onClick={() => {
                setFilter(f)
                fetchLists()
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} Lists
            </button>
          ))}
        </div>

        {lists.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Word Lists Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first word list to start building spelling quizzes
            </p>
            <Link
              href="/word-lists/new"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              Create Your First Word List
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lists.map((list) => (
              <div
                key={list.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6"
              >
                <div className="mb-4 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {list.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {new Date(list.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      list.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {list.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {list.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {list.description}
                  </p>
                )}

                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold text-blue-600">
                      {list.word_count}
                    </span>{' '}
                    words
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Link
                    href={`/word-lists/${list.id}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-semibold"
                  >
                    View & Edit
                  </Link>
                  <button
                    onClick={() =>
                      handleToggleActive(list.id, list.is_active)
                    }
                    className={`px-4 py-2 rounded-lg transition font-semibold ${
                      list.is_active
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {list.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
