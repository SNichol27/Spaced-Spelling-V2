import { NextRequest, NextResponse } from 'next/server'
import { createSpellingList, getSpellingLists } from '@/lib/db'

interface RouteParams {
  params: {
    classId: string
  }
}

/**
 * GET /api/classes/[classId]/lists
 * Fetch all spelling lists for a class
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    const lists = await getSpellingLists(classId)
    return NextResponse.json(lists)
  } catch (error) {
    console.error('Error fetching spelling lists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch spelling lists' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/classes/[classId]/lists
 * Create a new spelling list with words and auto-generate review schedule
 * 
 * Body:
 * {
 *   "name": "Week 5 Words",
 *   "weekTaught": 5,
 *   "words": [
 *     { "word": "beautiful", "definition": "pleasing to the eye" },
 *     { "word": "necessary", "definition": "required or needed" },
 *     ...
 *   ]
 * }
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { classId } = params
    const { name, weekTaught, words } = await request.json()

    // Validation
    if (!name || !weekTaught || !words || !Array.isArray(words)) {
      return NextResponse.json(
        {
          error:
            'Missing required fields: name, weekTaught, words (array of {word, definition?})',
        },
        { status: 400 }
      )
    }

    if (weekTaught < 1 || weekTaught > 52) {
      return NextResponse.json(
        { error: 'weekTaught must be between 1 and 52' },
        { status: 400 }
      )
    }

    if (words.length === 0 || words.length > 10) {
      return NextResponse.json(
        { error: 'words array must contain 1-10 words' },
        { status: 400 }
      )
    }

    // Validate each word
    for (const w of words) {
      if (!w.word || typeof w.word !== 'string') {
        return NextResponse.json(
          { error: 'Each word object must have a "word" property' },
          { status: 400 }
        )
      }
    }

    const result = await createSpellingList(classId, name, weekTaught, words)
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating spelling list:', error)
    return NextResponse.json(
      { error: 'Failed to create spelling list' },
      { status: 500 }
    )
  }
}
