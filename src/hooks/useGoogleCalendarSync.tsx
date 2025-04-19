import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

interface UseGoogleCalendarSyncProps {
  onEventsLoaded?: (events: CalendarEvent[]) => void;
}

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
      // Calculate the start and end of the week
      const weekStart = startOfWeek(date, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(date, { weekStartsOn: 0 });
      
      // Format dates for the API
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
      
      // Convert to CalendarEvent format
      const calendarEvents: CalendarEvent[] = events
        .filter((event: any) => event.start?.dateTime || event.start?.date)
        .map((event: any) => {
          const start = event.start.dateTime ? new Date(event.start.dateTime) : new Date(event.start.date);
          // For all-day events that use date instead of dateTime, set end to end of day
          let end;
          if (event.end.dateTime) {
            end = new Date(event.end.dateTime);
          } else if (event.end.date) {
            end = new Date(event.end.date);
            // For all-day events, Google sets end date to the day after
            // We'll adjust to show it ending at the end of the actual day
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