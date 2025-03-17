
/**
 * Calculates the elapsed minutes between a start time and now
 * @param startTime The start time as a Date or string
 * @returns Elapsed minutes as a number
 */
export const getElapsedMinutes = (startTime: Date | string): number => {
  if (!startTime) return 0;
  
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const now = new Date();
  const elapsedMs = now.getTime() - start.getTime();
  return Math.floor(elapsedMs / (1000 * 60));
};

/**
 * Formats minutes into a readable time string
 * @param minutes Total minutes
 * @returns Formatted time string (e.g., "2h 30m")
 */
export const formatMinutes = (minutes: number): string => {
  if (minutes <= 0) return '0m';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours > 0 && mins > 0) {
    return `${hours}h ${mins}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${mins}m`;
  }
};

/**
 * Parses a time string into minutes
 * @param timeStr Time string like "1h 30m" or "45m"
 * @returns Total minutes
 */
export const parseTimeString = (timeStr: string): number => {
  if (!timeStr) return 0;
  
  let minutes = 0;
  const hoursMatch = timeStr.match(/(\d+)\s*h/i);
  const minutesMatch = timeStr.match(/(\d+)\s*m/i);
  
  if (hoursMatch) {
    minutes += parseInt(hoursMatch[1]) * 60;
  }
  
  if (minutesMatch) {
    minutes += parseInt(minutesMatch[1]);
  }
  
  // If it's just a number, assume minutes
  if (!hoursMatch && !minutesMatch && /^\d+$/.test(timeStr)) {
    minutes = parseInt(timeStr);
  }
  
  return minutes;
};

/**
 * Standard time options for dropdown selection
 */
export const STANDARD_TIME_OPTIONS = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '1.5 hours', value: 90 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
  { label: '8 hours', value: 480 },
  { label: 'Custom...', value: 'custom' }
];
