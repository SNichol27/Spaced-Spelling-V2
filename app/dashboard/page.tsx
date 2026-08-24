'use client'

import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { CardSkeleton } from '@/components/LoadingSkeleton'

interface TeacherStats {
  totalClasses: number
  totalStudents: number
  activeLists: number
  upcomingQuizzes: number
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<TeacherStats>({
    totalClasses: 0,
    totalStudents: 0,
    activeLists: 0,
    upcomingQuizzes: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user])

  async function fetchStats() {
    try {
      setLoading(true)

      // Fetch teacher's classes
      const { data: classes } = await supabase
        .from('classes')
        .select('id')
        .eq('teacher_id', user?.id)

      // Fetch total students
      const { data: students } = await supabase
        .from('class_students')
        .select('id')
        .in('class_id', classes?.map((c) => c.id) || [])

      // Fetch active word lists
      const { data: lists } = await supabase
        .from('word_lists')
        .select('id')
        .eq('teacher_id', user?.id)
        .eq('is_active', true)

      // Fetch upcoming quizzes
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('id')
        .in('class_id', classes?.map((c) => c.id) || [])
        .gte('scheduled_date', new Date().toISOString())

      setStats({
        totalClasses: classes?.length || 0,
        totalStudents: students?.length || 0,
        activeLists: lists?.length || 0,
        upcomingQuizzes: quizzes?.length || 0,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
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
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-600">
              Spaced Spelling
            </h1>
            <p className="text-gray-600">Teacher Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">{user?.email}</span>
            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h2>
          <p className="text-gray-600">
            Here's your teaching dashboard with all your classes and activities.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Classes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Classes
                </p>
                <p className="text-3xl font-bold text-indigo-600 mt-2">
                  {stats.totalClasses}
                </p>
              </div>
              <div className="text-4xl">📚</div>
            </div>
            <Link
              href="/classes"
              className="text-indigo-600 text-sm mt-4 hover:text-indigo-700 font-semibold inline-block"
            >
              View All Classes →
            </Link>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Total Students
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
            <Link
              href="/students"
              className="text-indigo-600 text-sm mt-4 hover:text-indigo-700 font-semibold inline-block"
            >
              Manage Students →
            </Link>
          </div>

          {/* Active Word Lists */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Active Word Lists
                </p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {stats.activeLists}
                </p>
              </div>
              <div className="text-4xl">📝</div>
            </div>
            <Link
              href="/word-lists"
              className="text-indigo-600 text-sm mt-4 hover:text-indigo-700 font-semibold inline-block"
            >
              Manage Lists →
            </Link>
          </div>

          {/* Upcoming Quizzes */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">
                  Upcoming Quizzes
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-2">
                  {stats.upcomingQuizzes}
                </p>
              </div>
              <div className="text-4xl">🎯</div>
            </div>
            <Link
              href="/quizzes"
              className="text-indigo-600 text-sm mt-4 hover:text-indigo-700 font-semibold inline-block"
            >
              View Quizzes →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/classes/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold"
            >
              ➕ Create New Class
            </Link>
            <Link
              href="/word-lists/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold"
            >
              ✍️ Create Word List
            </Link>
            <Link
              href="/quizzes/new"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              📋 Create Quiz
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
