import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval
} from 'date-fns'

/**
 * Returns the start and end of the day, alongside a single-day list.
 */
export function getDayRange(date: Date) {
  return {
    start: startOfDay(date),
    end: endOfDay(date),
    days: [startOfDay(date)]
  }
}

/**
 * Returns the start, end, and days lists covering a week (Monday-indexed).
 */
export function getWeekRange(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const end = endOfWeek(date, { weekStartsOn: 1 })
  return {
    start,
    end,
    days: eachDayOfInterval({ start, end })
  }
}

/**
 * Returns the start, end, and days lists covering a month.
 */
export function getMonthRange(date: Date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  return {
    start,
    end,
    days: eachDayOfInterval({ start, end })
  }
}

/**
 * Resolves visible boundaries based on Day, Week, or Month view choices.
 */
export function getRangeForView(view: 'day' | 'week' | 'month', date: Date) {
  switch (view) {
    case 'day':
      return getDayRange(date)
    case 'month':
      return getMonthRange(date)
    case 'week':
    default:
      return getWeekRange(date)
  }
}
