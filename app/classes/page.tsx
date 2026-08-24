'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { CardSkeleton } from '@/components/LoadingSkeleton'

interface Class {
  id: string
  name: string
  schedule: string
  weeks_in_year: number
  student_count: number
  created_at: string
}

export default function ClassesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchClasses()
    }
  }, [user])

  async function fetchClasses() {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('classes')
        .select(
          `
          id,
          name,
          schedule,
          weeks_in_year,
          created_at,
          class_students(id)
        `
        )
        .eq('teacher_id', user?.id)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const formattedClasses = (data || []).map((cls: any) => ({
        id: cls.id,
        name: cls.name,
        schedule: cls.schedule,
        weeks_in_year: cls.weeks_in_year,
        student_count: cls.class_students?.length || 0,
        created_at: cls.created_at,
      }))

      setClasses(formattedClasses)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load classes')
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteClass(classId: string) {
    if (!confirm('Are you sure you want to delete this class?')) return

    try {
      const { error: deleteError } = await supabase
        .from('classes')
        .delete()
        .eq('id', classId)

      if (deleteError) throw deleteError

      setClasses(classes.filter((c) => c.id !== classId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete class')
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
              <h1 className="text-3xl font-bold text-gray-900 mt-2">My Classes</h1>
            </div>
            <Link
              href="/classes/new"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              + Create New Class
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

        {classes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              No Classes Yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first class to get started with Spaced Spelling
            </p>
            <Link
              href="/classes/new"
              className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              Create Your First Class
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6"
              >
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {cls.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(cls.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="space-y-2 mb-6 text-gray-700">
                  <div className="flex justify-between">
                    <span className="font-semibold">Schedule:</span>
                    <span>{cls.schedule.replace(/_/g, ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Weeks/Year:</span>
                    <span>{cls.weeks_in_year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold">Students:</span>
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                      {cls.student_count}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/classes/${cls.id}`}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-center font-semibold"
                  >
                    View
                  </Link>
                  <Link
                    href={`/classes/${cls.id}/edit`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center font-semibold"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
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
