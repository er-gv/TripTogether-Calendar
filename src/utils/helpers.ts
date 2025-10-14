
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const generateTripId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};

// Helper to get normalized first and last dates for a trip.
// Accepts a trip-like object (usually from `src/types`) and returns
// ISO date strings or undefined when not available.
import type { Trip } from '../types';

export const getTripBounds = (trip?: Partial<Trip> | null): { first?: string; last?: string } => {
  if (!trip) return {};

  const { startDate, endDate } = trip;

  // If both provided, normalize to ISO strings
  if (startDate && endDate) {
    const s = new Date(startDate);
    const e = new Date(endDate);
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      return { first: s.toISOString(), last: e.toISOString() };
    }
  }

  // If only one is provided, return it for both first and last
  if (startDate) {
    const s = new Date(startDate);
    if (!isNaN(s.getTime())) return { first: s.toISOString(), last: s.toISOString() };
  }

  if (endDate) {
    const e = new Date(endDate);
    if (!isNaN(e.getTime())) return { first: e.toISOString(), last: e.toISOString() };
  }

  return {};
};

// Return an array of dates between start and end (inclusive) in ascending order.
// Each entry is formatted as 'dd/mm' (e.g. '28/12').
export const getDatesBetween = (start?: string, end?: string): string[] => {
  if (!start || !end) return [];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) return [];

  // Ensure ascending order
  let startDate = new Date(s);
  let endDate = new Date(e);
  if (startDate.getTime() > endDate.getTime()) {
    const tmp = startDate;
    startDate = endDate;
    endDate = tmp;
  }

  const out: string[] = [];
  const cur = new Date(startDate);
  const includeYear = startDate.getFullYear() !== endDate.getFullYear();
  while (cur.getTime() <= endDate.getTime()) {
    const weekday = cur.toLocaleDateString('en-US', { weekday: 'long' });
    const dd = String(cur.getDate()).padStart(2, '0');
    const mm = String(cur.getMonth() + 1).padStart(2, '0');
    if (includeYear) {
      const yyyy = String(cur.getFullYear());
      out.push(`${weekday}, ${dd}/${mm}/${yyyy}`);
    } else {
      out.push(`${weekday}, ${dd}/${mm}`);
    }
    cur.setDate(cur.getDate() + 1);
  }

  return out;
};
