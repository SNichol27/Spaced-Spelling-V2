import { supabase } from './supabase'
import { generateReviewSchedule, ScheduleType } from './reviewScheduler'

/**
 * Database utility functions for managing classes, spelling lists, and reviews
 */

// ============================================================
// CLASS FUNCTIONS
// ============================================================

export async function createClass(
  name: string,
  schedule: ScheduleType,
  weeksInYear: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('classes')
    .insert([
      {
        name,
        teacher_id: user.id,
        schedule,
        weeks_in_year: weeksInYear,
      },
    ])
    .select()

  if (error) throw error
  return data[0]
}

export async function getClasses() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getClass(classId: string) {
  const { data, error } = await supabase
    .from('classes')
    .select('*')
    .eq('id', classId)
    .single()

  if (error) throw error
  return data
}

export async function updateClass(
  classId: string,
  updates: { name?: string; weeks_in_year?: number }
) {
  const { data, error } = await supabase
    .from('classes')
    .update(updates)
    .eq('id', classId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteClass(classId: string) {
  const { error } = await supabase.from('classes').delete().eq('id', classId)

  if (error) throw error
}

// ============================================================
// SPELLING LIST FUNCTIONS
// ============================================================

export async function createSpellingList(
  classId: string,
  name: string,
  weekTaught: number,
  words: Array<{ word: string; definition?: string }>
) {
  // Get the class to access schedule type and weeks_in_year
  const classData = await getClass(classId)

  // Create the spelling list
  const { data: listData, error: listError } = await supabase
    .from('spelling_lists')
    .insert([
      {
        class_id: classId,
        name,
        week_taught: weekTaught,
      },
    ])
    .select()

  if (listError) throw listError

  const listId = listData[0].id

  // Insert words
  const wordsToInsert = words.map((w, index) => ({
    list_id: listId,
    word: w.word,
    word_order: index + 1,
    definition: w.definition || null,
  }))

  const { error: wordsError } = await supabase
    .from('spelling_words')
    .insert(wordsToInsert)

  if (wordsError) throw wordsError

  // Generate review schedule based on class strategy
  const schedule = generateReviewSchedule(
    classData.schedule,
    weekTaught,
    classData.weeks_in_year
  )

  // Insert scheduled reviews
  const reviewsToInsert = schedule.map((review) => ({
    list_id: listId,
    class_id: classId,
    review_number: review.reviewNumber,
    scheduled_week: review.scheduledWeek,
    status: 'pending',
  }))

  if (reviewsToInsert.length > 0) {
    const { error: reviewsError } = await supabase
      .from('scheduled_reviews')
      .insert(reviewsToInsert)

    if (reviewsError) throw reviewsError
  }

  return {
    list: listData[0],
    words: wordsToInsert,
    reviews: reviewsToInsert,
  }
}

export async function getSpellingLists(classId: string) {
  const { data, error } = await supabase
    .from('spelling_lists')
    .select('*')
    .eq('class_id', classId)
    .order('week_taught', { ascending: true })

  if (error) throw error
  return data
}

export async function getSpellingList(listId: string) {
  const { data, error } = await supabase
    .from('spelling_lists')
    .select('*')
    .eq('id', listId)
    .single()

  if (error) throw error
  return data
}

// ============================================================
// SPELLING WORDS FUNCTIONS
// ============================================================

export async function getSpellingWords(listId: string) {
  const { data, error } = await supabase
    .from('spelling_words')
    .select('*')
    .eq('list_id', listId)
    .order('word_order', { ascending: true })

  if (error) throw error
  return data
}

// ============================================================
// SCHEDULED REVIEWS FUNCTIONS
// ============================================================

export async function getScheduledReviews(classId: string) {
  const { data, error } = await supabase
    .from('scheduled_reviews')
    .select('*')
    .eq('class_id', classId)
    .order('scheduled_week', { ascending: true })

  if (error) throw error
  return data
}

export async function getReviewsByWeek(classId: string, week: number) {
  const { data, error } = await supabase
    .from('scheduled_reviews')
    .select(
      `
      *,
      spelling_lists (
        id,
        name,
        week_taught
      )
    `
    )
    .eq('class_id', classId)
    .eq('scheduled_week', week)
    .order('spelling_lists(week_taught)', { ascending: true })

  if (error) throw error
  return data
}

export async function markReviewComplete(reviewId: string) {
  const { data, error } = await supabase
    .from('scheduled_reviews')
    .update({ status: 'completed' })
    .eq('id', reviewId)
    .select()

  if (error) throw error
  return data[0]
}

export async function getPendingReviews(classId: string) {
  const { data, error } = await supabase
    .from('scheduled_reviews')
    .select(
      `
      *,
      spelling_lists (
        id,
        name,
        week_taught
      )
    `
    )
    .eq('class_id', classId)
    .eq('status', 'pending')
    .order('scheduled_week', { ascending: true })

  if (error) throw error
  return data
}
