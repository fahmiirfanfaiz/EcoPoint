/**
 * Date Utilities for EcoPoint
 * All date calculations for daily challenges, leaderboards, and tracking
 * should use Jakarta time (WIB, UTC+7) as the source of truth, regardless
 * of the server's local timezone.
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

/**
 * Returns a new Date object representing the start of the day (00:00:00) in WIB.
 * The returned Date is a UTC Date object that corresponds exactly to 00:00:00 WIB.
 */
export function getStartOfDayWIB(date: string | Date = new Date()): Date {
  const d = new Date(date);
  const wibTime = new Date(d.getTime() + WIB_OFFSET_MS);

  const y = wibTime.getUTCFullYear();
  const m = wibTime.getUTCMonth();
  const day = wibTime.getUTCDate();

  // Return the equivalent UTC Date for 00:00:00 WIB (which is -7 hours from 00:00 UTC)
  return new Date(Date.UTC(y, m, day, -7, 0, 0, 0));
}

/**
 * Returns a new Date object representing the start of the current day (00:00:00) in WIB.
 * (Alias for getStartOfDayWIB with no args)
 */
export function getTodayWIB(): Date {
  return getStartOfDayWIB();
}

/**
 * Returns a new Date object representing the start of the current week (Monday 00:00:00) in WIB.
 */
export function getStartOfWeekWIB(): Date {
  const now = new Date();
  const wibTime = new Date(now.getTime() + WIB_OFFSET_MS);

  const y = wibTime.getUTCFullYear();
  const m = wibTime.getUTCMonth();
  const d = wibTime.getUTCDate();
  
  const day = wibTime.getUTCDay(); // 0=Sun, 1=Mon ... 6=Sat
  const diff = day === 0 ? 6 : day - 1; // Days since Monday

  // Subtract the difference from the date
  return new Date(Date.UTC(y, m, d - diff, -7, 0, 0, 0));
}
