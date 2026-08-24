import { NextRequest, NextResponse } from 'next/server'
import {
  getClass,
  updateClass,
  deleteClass,
  getSpellingLists,
} from '@/lib/db'

interface RouteParams {
  params: {
    classId: string
  }
}

/**
 * GET /api/classes/[classId]
 * Fetch a specific class
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    const classData = await getClass(classId)

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    return NextResponse.json(classData)
  } catch (error) {
    console.error('Error fetching class:', error)
    return NextResponse.json(
      { error: 'Failed to fetch class' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/classes/[classId]
 * Update a class
 * 
 * Body:
 * {
 *   "name": "Updated class name",
 *   "weeks_in_year": 40
 * }
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    const updates = await request.json()

    // Validate updates
    if (updates.weeks_in_year) {
      if (updates.weeks_in_year < 1 || updates.weeks_in_year > 52) {
        return NextResponse.json(
          { error: 'weeksInYear must be between 1 and 52' },
          { status: 400 }
        )
      }
    }

    const updated = await updateClass(classId, updates)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error updating class:', error)
    return NextResponse.json(
      { error: 'Failed to update class' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/classes/[classId]
 * Delete a class (cascades to delete all spelling lists and reviews)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    await deleteClass(classId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting class:', error)
    return NextResponse.json(
      { error: 'Failed to delete class' },
      { status: 500 }
    )
  }
}
