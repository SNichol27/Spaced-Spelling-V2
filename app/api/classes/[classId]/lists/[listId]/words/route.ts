import { NextRequest, NextResponse } from 'next/server'
import { getSpellingWords } from '@/lib/db'

interface RouteParams {
  params: {
    classId: string
    listId: string
  }
}

/**
 * GET /api/classes/[classId]/lists/[listId]/words
 * Fetch all words for a spelling list
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { listId } = params
    const words = await getSpellingWords(listId)
    return NextResponse.json(words)
  } catch (error) {
    console.error('Error fetching spelling words:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spelling words' },
      { status: 500 }
    )
  }
}
