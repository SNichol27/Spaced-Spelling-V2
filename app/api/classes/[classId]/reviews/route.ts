import { NextRequest, NextResponse } from 'next/server'
import {
  getScheduledReviews,
  getReviewsByWeek,
  getPendingReviews,
  markReviewComplete,
} from '@/lib/db'

interface RouteParams {
  params: {
    classId: string
  }
}

/**
 * GET /api/classes/[classId]/reviews
 * Fetch all scheduled reviews for a class
 * 
 * Query params:
 * - week: (optional) Filter by specific week
 * - status: (optional) 'pending' or 'completed'
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    const { searchParams } = new URL(request.url)
    const week = searchParams.get('week')
    const status = searchParams.get('status')

    let reviews

    if (week) {
      const weekNum = parseInt(week)
      if (isNaN(weekNum) || weekNum < 1 || weekNum > 52) {
        return NextResponse.json(
          { error: 'Invalid week parameter (1-52)' },
          { status: 400 }
        )
      }
      reviews = await getReviewsByWeek(classId, weekNum)
    } else if (status === 'pending') {
      reviews = await getPendingReviews(classId)
    } else {
      reviews = await getScheduledReviews(classId)
    }

    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/classes/[classId]/reviews/[reviewId]
 * Mark a review as complete
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const body = await request.json()
    const { reviewId } = body

    if (!reviewId) {
      return NextResponse.json(
        { error: 'reviewId is required' },
        { status: 400 }
      )
    }

    const updated = await markReviewComplete(reviewId)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error marking review complete:', error)
    return NextResponse.json(
      { error: 'Failed to mark review complete' },
      { status: 500 }
    )
  }
}
