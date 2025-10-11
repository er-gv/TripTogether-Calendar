export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
};

/**
 * Short datetime: e.g. "Oct 13, 10:30 AM"
 */
export const formatDateTimeShort = (dateString: string): string => {
  const d = new Date(dateString);
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date/time using an explicit IANA time zone (if provided).
 * Example: formatDateTimeWithTZ('2025-10-13T10:30:00Z', 'America/Toronto')
 */
export const formatDateTimeWithTZ = (dateString: string, timeZone?: string): string => {
  const d = new Date(dateString);
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: timeZone ? 'short' : undefined,
  };

  return new Intl.DateTimeFormat(undefined, timeZone ? { ...opts, timeZone } : opts).format(d as any);
};

/**
 * Relative date/time helper for human-friendly labels.
 * Examples: "in 3 days", "3 hours ago", "Today at 10:30 AM"
 */
export const formatRelativeDateTime = (dateString: string): string => {
  const target = new Date(dateString).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);

  // If within the same day, return 'Today at HH:MM' or 'Tomorrow at HH:MM'
  const targetDate = new Date(dateString);
  const today = new Date();
  const isSameDay = targetDate.toDateString() === today.toDateString();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const isTomorrow = targetDate.toDateString() === tomorrow.toDateString();

  if (isSameDay) return `Today at ${formatTime(dateString)}`;
  if (isTomorrow) return `Tomorrow at ${formatTime(dateString)}`;

  // Use Intl.RelativeTimeFormat for days/hours/minutes when appropriate
  const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

  if (Math.abs(diffDay) < 7) {
    return rtf.format(diffDay, 'day');
  }

  if (Math.abs(diffHour) < 24) {
    return rtf.format(diffHour, 'hour');
  }

  if (Math.abs(diffMin) < 60) {
    return rtf.format(diffMin, 'minute');
  }

  // Fallback to short date time
  return formatDateTimeShort(dateString);
};


// Convert a date or datetime string into a value suitable for <input type="datetime-local">.
// If `dateString` is date-only (YYYY-MM-DD), attach `defaultTime` (e.g. '09:00').
export const toDateTimeLocal = (dateString: string, defaultTime = '09:00') => {
  if (!dateString) return '';

  // If already contains a 'T', assume it's an ISO datetime
  if (dateString.includes('T')) {
    const d = new Date(dateString);
    // return local ISO without seconds and timezone
    const iso = d.toISOString();
    return iso.substring(0, 16);
  }

  // If it's a date-only string like YYYY-MM-DD, append default time
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return `${dateString}T${defaultTime}`;
  }

  // Fallback: try parse and format
  try {
    const d = new Date(dateString);
    return d.toISOString().substring(0, 16);
  } catch {
    return '';
  }
};
