import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { startOfWeek, endOfWeek } from 'date-fns';

interface UseGoogleCalendarSyncProps {
  onEventsLoaded?: (events: CalendarEvent[]) => void;
}

// Converts UTC ISO strings to local Date objects
const toLocalDate = (isoString: string) => {
  const utcDate = new Date(isoString);
  return new Date(
    utcDate.getUTCFullYear(),
    utcDate.getUTCMonth(),
    utcDate.getUTCDate(),
    utcDate.getUTCHours(),
    utcDate.getUTCMinutes(),
    utcDate.getUTCSeconds()
  );
};

export const useGoogleCalendarSync = (props?: UseGoogleCalendarSyncProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const setToken = useCallback((token: string) => {
    setAccessToken(token);
    setIsInitialized(true);
    localStorage.setItem('googleCalendarToken', token);
  }, []);

  const loadEvents = useCallback(async (date: Date) => {
    if (!accessToken) {
      console.log("No access token available");
      return [];
    }

    setIsLoading(true);
    try {
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });

      const timeMin = weekStart.toISOString();
      const timeMax = weekEnd.toISOString();

      console.log(`Fetching events from ${timeMin} to ${timeMax}`);

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.status}`);
      }

      const data = await response.json();
      console.log("Google Calendar API response:", data);

      const events = data.items || [];

      const calendarEvents: CalendarEvent[] = events
        .filter((event: any) => event.start?.dateTime || event.start?.date)
        .map((event: any) => {
          const start = event.start.dateTime
            ? toLocalDate(event.start.dateTime)
            : new Date(event.start.date);

          let end;
          if (event.end.dateTime) {
            end = toLocalDate(event.end.dateTime);
          } else if (event.end.date) {
            end = new Date(event.end.date);
            end.setDate(end.getDate() - 1);
            end.setHours(23, 59, 59);
          }

          return {
            id: event.id,
            title: event.summary || "(No title)",
            start,
            end,
            isGoogleEvent: true,
            googleEventId: event.id
          };
        });

      console.log("Formatted Calendar Events:", calendarEvents);

      if (props?.onEventsLoaded) {
        props.onEventsLoaded(calendarEvents);
      }

      setIsLoading(false);
      return calendarEvents;
    } catch (err) {
      console.error("Error loading Google Calendar events:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);

      toast({
        title: "Calendar Sync Failed",
        description: "Could not load events from Google Calendar",
        variant: "destructive",
      });

      return [];
    }
  }, [accessToken, props, toast]);

  const disconnect = useCallback(() => {
    setAccessToken(null);
    setIsInitialized(false);
    localStorage.removeItem('googleCalendarToken');

    toast({
      title: "Google Calendar Disconnected",
      description: "You've been disconnected from Google Calendar",
    });
  }, [toast]);

  return {
    isInitialized,
    setToken,
    loadEvents,
    disconnect,
    error,
    isLoading
  };
};

export default useGoogleCalendarSync;
