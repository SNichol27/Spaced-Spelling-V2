/**
 * Review Scheduling Engine
 * 
 * Generates review schedules based on three different spacing strategies:
 * 1. Expanding Spacing: Increasingly longer intervals (week gaps grow)
 * 2. Fixed Spacing: Consistent intervals (same gap between reviews)
 * 3. Control: No reviews (baseline for research)
 */

export type ScheduleType = 'expanding_spacing' | 'fixed_spacing' | 'control'

export interface ReviewSchedule {
  reviewNumber: number
  scheduledWeek: number
}

/**
 * Expanding Spacing Strategy
 * Reviews follow: 1 week, 2 weeks, 4 weeks, 8 weeks, 16 weeks
 * This mimics the classic spaced repetition curve
 * 
 * Example: List taught in week 3
 * - Review 1: week 4 (3 + 1)
 * - Review 2: week 6 (4 + 2)
 * - Review 3: week 10 (6 + 4)
 * - Review 4: week 18 (10 + 8)
 * - Review 5: week 34 (18 + 16)
 */
export function generateExpandingSpacingSchedule(
  weekTaught: number,
  weeksInYear: number
): ReviewSchedule[] {
  const intervals = [1, 2, 4, 8, 16] // weeks between reviews
  const schedule: ReviewSchedule[] = []

  let currentWeek = weekTaught

  for (let i = 0; i < intervals.length; i++) {
    currentWeek += intervals[i]

    // Only create review if it falls within academic year
    if (currentWeek <= weeksInYear) {
      schedule.push({
        reviewNumber: i + 1,
        scheduledWeek: currentWeek,
      })
    }
  }

  return schedule
}

/**
 * Fixed Spacing Strategy
 * Reviews follow: 2 weeks, 4 weeks, 6 weeks, 8 weeks, 10 weeks
 * Consistent interval of 2 weeks between each review
 * 
 * Example: List taught in week 3
 * - Review 1: week 5 (3 + 2)
 * - Review 2: week 7 (5 + 2)
 * - Review 3: week 9 (7 + 2)
 * - Review 4: week 11 (9 + 2)
 * - Review 5: week 13 (11 + 2)
 */
export function generateFixedSpacingSchedule(
  weekTaught: number,
  weeksInYear: number
): ReviewSchedule[] {
  const interval = 2 // weeks between each review
  const maxReviews = 5
  const schedule: ReviewSchedule[] = []

  for (let i = 1; i <= maxReviews; i++) {
    const scheduledWeek = weekTaught + interval * i

    // Only create review if it falls within academic year
    if (scheduledWeek <= weeksInYear) {
      schedule.push({
        reviewNumber: i,
        scheduledWeek,
      })
    }
  }

  return schedule
}

/**
 * Control Strategy
 * No reviews are generated - used as baseline for research
 */
export function generateControlSchedule(): ReviewSchedule[] {
  return []
}

/**
 * Main function: Generate schedule based on strategy type
 * 
 * @param scheduleType - Type of spacing strategy
 * @param weekTaught - Week the list was taught (1-52)
 * @param weeksInYear - Total academic weeks for the class (1-52)
 * @returns Array of scheduled reviews
 */
export function generateReviewSchedule(
  scheduleType: ScheduleType,
  weekTaught: number,
  weeksInYear: number
): ReviewSchedule[] {
  // Validate inputs
  if (weekTaught < 1 || weekTaught > weeksInYear) {
    throw new Error(
      `Invalid week_taught: ${weekTaught}. Must be between 1 and ${weeksInYear}`
    )
  }

  if (weeksInYear < 1 || weeksInYear > 52) {
    throw new Error(
      `Invalid weeksInYear: ${weeksInYear}. Must be between 1 and 52`
    )
  }

  switch (scheduleType) {
    case 'expanding_spacing':
      return generateExpandingSpacingSchedule(weekTaught, weeksInYear)
    case 'fixed_spacing':
      return generateFixedSpacingSchedule(weekTaught, weeksInYear)
    case 'control':
      return generateControlSchedule()
    default:
      throw new Error(`Unknown schedule type: ${scheduleType}`)
  }
}
