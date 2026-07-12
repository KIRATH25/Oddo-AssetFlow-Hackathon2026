
interface BookingInterval {
  start: Date | string;
  end: Date | string;
}

/**
 * Pure function to check if a requested booking interval overlaps with any existing records.
 * Returns true if an overlap is detected, false otherwise.
 * Overlap condition: newStart < existingEnd && newEnd > existingStart
 */
export function checkBookingOverlap(
  newStart: Date | string,
  newEnd: Date | string,
  existingBookings: BookingInterval[]
): boolean {
  const nStart = new Date(newStart).getTime()
  const nEnd = new Date(newEnd).getTime()

  // Standard overlap math: newStart < existingEnd && newEnd > existingStart
  return existingBookings.some((existing) => {
    const eStart = new Date(existing.start).getTime()
    const eEnd = new Date(existing.end).getTime()
    return nStart < eEnd && nEnd > eStart
  })
}
