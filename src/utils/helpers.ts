import {getActivitiesByUser} from '@/services/firestore';

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

// Helper function to format date for ICS with timezone (YYYYMMDDTHHMMSS)
const formatDateForICS = (date: Date, useUTC: boolean = false): string => {
  if (useUTC) {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
};

// Helper function to generate VTIMEZONE component for ICS
const buildVTimezoneBlock = (timezone: string): string => {
  // For simplicity, we'll use a basic VTIMEZONE structure
  // In production, you might want to use a library like timezone-support or luxon
  return [
    'BEGIN:VTIMEZONE',
    `TZID:${timezone}`,
    'END:VTIMEZONE'
  ].join('\r\n');
};

// Helper function to build ICS VEVENT block for an activity
const buildVEventBlock = (activity: { id: string; name: string; description?: string; dateTime: string; location?: string }, timezone?: string): string | null => {
  
  const startDate = new Date(activity.dateTime);
  console.log("@buildVEventBlock: startDate is", startDate);
  if (isNaN(startDate.getTime())) {
    return null; // Skip invalid dates
  }

  // Default end time to 1 hour after start
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

  const uid = `${activity.id}@triptogether.app`;

  // Format dates based on whether timezone is provided
  const useTimezone = timezone? (timezone !== 'UTC') : false;
  console.log("@buildVEventBlock: useTimezone is", useTimezone);
  const startFormatted = formatDateForICS(startDate, useTimezone);
  const endFormatted = formatDateForICS(endDate, useTimezone);
  const dtstamp = formatDateForICS(new Date(), true); // DTSTAMP always in UTC
  
  console.log("@buildVEventBlock: startFormatted is", startFormatted, " endFormatted is", endFormatted, " dtstamp is", dtstamp);
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    useTimezone ? `DTSTART;TZID=${timezone}:${startFormatted}` : `DTSTART:${startFormatted}`,
    useTimezone ? `DTEND;TZID=${timezone}:${endFormatted}` : `DTEND:${endFormatted}`,
    `SUMMARY:${activity.name}`,
    activity.description ? `DESCRIPTION:${activity.description.replace(/\n/g, '\\n')}` : '',
    activity.location ? `LOCATION:${activity.location}` : '',
    'STATUS:CONFIRMED',
    'END:VEVENT'
  ];

  return lines.filter(line => line !== '').join('\r\n');
};

// Helper function to create ICS file content from VEVENT blocks
const createICSContent = (vevents: string[], timezone?: string): string => {
  const components = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TripTogether//Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH'
  ];

  // Add VTIMEZONE if timezone is specified
  if (timezone && timezone !== 'UTC') {
    components.push(buildVTimezoneBlock(timezone));
  }

  components.push(...vevents);
  components.push('END:VCALENDAR');

  return components.join('\r\n');
};

// Helper function to download ICS file
const downloadICSFile = (icsContent: string, filename: string): void => {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};


export const exportEventToICS = (activity: { id: string; name: string; description?: string; dateTime: string; location?: string }, timezone?: string): void => {
  try {
    // Build VEVENT block
    const veventBlock = buildVEventBlock(activity, timezone);
    console.log("veventBlock:", veventBlock);
    if (!veventBlock) {
      alert('Invalid activity date/time');
      return;
    }

    // Create ICS file content and download
    const icsContent = createICSContent([veventBlock]);
    const filename = `${activity.name.replace(/[^a-z0-9]/gi, '_')}.ics`;
    downloadICSFile(icsContent, filename);
  } catch (error) {
    console.error('Error exporting to ICS:', error);
    alert('Failed to export calendar event');
  }
}

export const exportUserItineraryToICS = async (userId: string, userName?: string, timezone?: string): Promise<void> => {
  // Show loading feedback immediately
  const originalAlert = window.alert;
  let alertShown = false;
  console.log("@exportUserItineraryToICS: starting export for userId", userId, " userName:", userName);
  window.alert = (msg: string) => {
    alertShown = true;
    originalAlert(msg);
  };
  try {
    // Fetch activities where user has opted in
    const userActivities = await getActivitiesByUser(userId);

    if (userActivities.length === 0) {
      alert('No activities found for this user');
      return;
    }

    // Build VEVENT blocks for each activity
    const vevents = userActivities
      .map(activity => buildVEventBlock(activity))
      .filter(event => event !== null);

    if (vevents.length === 0) {
      alert('No valid activities to export');
      return;
    }

    // Create ICS file content and download
    const icsContent = createICSContent(vevents);
    const filename = userName ? `${userName.replace(/[^a-z0-9]/gi, '_')}_activities.ics` : `my_activities.ics`;
    downloadICSFile(icsContent, filename);
  } catch (error) {
    console.error('Error exporting activities:', error);
    alert('Failed to export activities');
  }
}