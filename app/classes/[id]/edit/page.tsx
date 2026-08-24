'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

interface ClassFormData {
  name: string
  schedule: string
  weeks_in_year: number
}

const SCHEDULE_OPTIONS = [
  { value: 'monday_wednesday_friday', label: 'Monday, Wednesday, Friday' },
  { value: 'tuesday_thursday', label: 'Tuesday, Thursday' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

export default function ClassFormPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const classId = params?.id as string | undefined

  const [formData, setFormData] = useState<ClassFormData>({
    name: '',
    schedule: 'monday_wednesday_friday',
    weeks_in_year: 36,
  })
  const [loading, setLoading] = useState(classId ? true : false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (classId && user) {
      fetchClass()
    }
  }, [classId, user])

  async function fetchClass() {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('classes')
        .select('*')
        .eq('id', classId)
        .eq('teacher_id', user?.id)
        .single()

      if (fetchError) throw fetchError
      if (!data) throw new Error('Class not found')

      setFormData({
        name: data.name,
        schedule: data.schedule,
        weeks_in_year: data.weeks_in_year,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load class')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Class name is required')
      return
    }

    try {
      setSubmitting(true)
      setError('')

      if (classId) {
        // Update existing class
        const { error: updateError } = await supabase
          .from('classes')
          .update(formData)
          .eq('id', classId)
          .eq('teacher_id', user?.id)

        if (updateError) throw updateError
      } else {
        // Create new class
        const { error: createError } = await supabase.from('classes').insert([
          {
            ...formData,
            teacher_id: user?.id,
          },
        ])

        if (createError) throw createError
      }

      router.push('/classes')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save class')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
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
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link href="/classes" className="text-indigo-600 hover:text-indigo-700">
            ← Back to Classes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            {classId ? 'Edit Class' : 'Create New Class'}
          </h1>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Class Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Class Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Grade 4 Morning Class"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                disabled={submitting}
              />
              <p className="mt-1 text-sm text-gray-600">
                Give your class a descriptive name
              </p>
            </div>

            {/* Schedule */}
            <div>
              <label htmlFor="schedule" className="block text-sm font-semibold text-gray-700 mb-2">
                Class Schedule *
              </label>
              <select
                id="schedule"
                value={formData.schedule}
                onChange={(e) =>
                  setFormData({ ...formData, schedule: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                disabled={submitting}
              >
                {SCHEDULE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-600">
                Select how often your class meets
              </p>
            </div>

            {/* Weeks Per Year */}
            <div>
              <label htmlFor="weeks" className="block text-sm font-semibold text-gray-700 mb-2">
                Weeks Per Year *
              </label>
              <input
                type="number"
                id="weeks"
                value={formData.weeks_in_year}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    weeks_in_year: parseInt(e.target.value) || 0,
                  })
                }
                min="1"
                max="52"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                disabled={submitting}
              />
              <p className="mt-1 text-sm text-gray-600">
                Number of weeks your class runs per year (1-52)
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? 'Saving...'
                  : classId
                    ? 'Update Class'
                    : 'Create Class'}
              </button>
              <Link
                href="/classes"
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
