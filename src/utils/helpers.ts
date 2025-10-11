export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
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
