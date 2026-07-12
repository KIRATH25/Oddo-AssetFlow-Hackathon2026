/**
 * Client-side simulation helper to calculate what the next auto-generated Asset Tag will look like.
 * Note: The actual enforcement and generation of unique sequential tags (e.g. AF-0001) 
 * happens directly on the database level via a Postgres sequence sequence and insert trigger.
 */
export function simulateNextAssetTag(lastTag?: string | null): string {
  if (!lastTag) return 'AF-0001'
  const match = lastTag.trim().match(/AF-(\d+)/)
  if (match) {
    const nextNum = parseInt(match[1], 10) + 1
    return `AF-${String(nextNum).padStart(4, '0')}`
  }
  return 'AF-0001'
}
