import { NextRequest, NextResponse } from 'next/server'
import {
  createClass,
  getClasses,
  getClass,
  updateClass,
  deleteClass,
} from '@/lib/db'

/**
 * GET /api/classes
 * Fetch all classes for the authenticated teacher
 */
export async function GET() {
  try {
    const classes = await getClasses()
    return NextResponse.json(classes)
  } catch (error) {
    console.error('Error fetching classes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/classes
 * Create a new class
 * 
 * Body:
 * {
 *   "name": "Period 3",
 *   "schedule": "expanding_spacing" | "fixed_spacing" | "control",
 *   "weeksInYear": 36
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { name, schedule, weeksInYear } = await request.json()

    // Validation
    if (!name || !schedule || !weeksInYear) {
      return NextResponse.json(
        { error: 'Missing required fields: name, schedule, weeksInYear' },
        { status: 400 }
      )
    }

    if (!['expanding_spacing', 'fixed_spacing', 'control'].includes(schedule)) {
      return NextResponse.json(
        { error: 'Invalid schedule type' },
        { status: 400 }
      )
    }

    if (weeksInYear < 1 || weeksInYear > 52) {
      return NextResponse.json(
        { error: 'weeksInYear must be between 1 and 52' },
        { status: 400 }
      )
    }

    const newClass = await createClass(name, schedule, weeksInYear)
    return NextResponse.json(newClass, { status: 201 })
  } catch (error) {
    console.error('Error creating class:', error)
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    )
  }
}
