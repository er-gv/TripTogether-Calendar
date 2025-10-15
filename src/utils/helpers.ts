
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
// 
// Helper to get normalized first and last dates for a trip.
// Accepts a trip-like object (usually from `src/types`) and returns
// ISO date strings or undefined when not available.
import type { Trip } from '../types';
import { readTagsCollection } from '@/services/firestore_api/tags';
import type { Tag } from '@/types';

// Synchronous getter for a trip's destination.
// Firestore lookups are async, so this function reads from a local cache
// (if available) and otherwise returns a sensible default. This keeps the
// API synchronous for callers that expect a string.
export const getTripDestination = (tripId: string): string => {
  try {
    // If some code persisted the trip in localStorage under `trip_<id>`, use it.
    const key = `trip_${tripId}`;
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Trip> | null;
      if (parsed && parsed.destination) return parsed.destination;
    }
  } catch (err) {
    // ignore parsing/localStorage errors and fall through to default
  }

  // Fallback when destination not available synchronously
  return 'unknown location';
};


// Synchronous getter for the app list of tags.
// Firestore lookups are async, so this function reads from a local cache
// (if available) and otherwise returns a sensible default. This keeps the
// API synchronous for callers that expect a string[].
export const getTagsList = (): Tag[] => {
  const key = 'tags_list';
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as Tag[] | null;
      if (parsed && parsed.length > 0) {
        // Refresh cache in background
        if (typeof window !== 'undefined') {
          readTagsCollection()
            .then((tags) => {
              if (Array.isArray(tags)) {
                try {
                  window.localStorage.setItem(key, JSON.stringify(tags));
                } catch (e) {
                  /* ignore */
                }
                // notify listeners if any
                try {
                  window.dispatchEvent(new CustomEvent('tags-updated', { detail: tags }));
                } catch (e) {
                  /* ignore */
                }
              }
            })
            .catch(() => {});
        }
        return parsed;
      }
    }
  } catch (err) {
    // ignore parsing/localStorage errors and fall through to default
  }

  // If not cached, trigger a background fetch to populate cache and return empty for now
  if (typeof window !== 'undefined') {
    readTagsCollection()
        .then((tags) => {
          if (Array.isArray(tags)) {
            try {
              window.localStorage.setItem(key, JSON.stringify(tags));
            } catch (e) {
              /* ignore */
            }
            try {
              window.dispatchEvent(new CustomEvent('tags-updated', { detail: tags }));
            } catch (e) {
              /* ignore */
            }
          }
        })
      .catch(() => {});
  }

  return [];
}

// Backwards-compatible alias: some code imports `getTags`.
export const getTags = getTagsList;

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
