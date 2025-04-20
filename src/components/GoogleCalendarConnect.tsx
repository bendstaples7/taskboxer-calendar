import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from '@react-oauth/google';
import { CalendarEvent } from "@/lib/types";

interface GoogleCalendarConnectProps {
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

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onEventsLoaded }) => {
  const { toast } = useToast();

  const login = useGoogleLogin({
    scope: [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      console.log("✅ Google Calendar Access Token:", accessToken);

      try {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const res = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${startOfWeek.toISOString()}&timeMax=${endOfWeek.toISOString()}&singleEvents=true&orderBy=startTime`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          }
        );

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
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

        if (onEventsLoaded) {
          onEventsLoaded(calendarEvents);
        }

        toast({
          title: "Google Calendar Connected",
          description: `${calendarEvents.length} events loaded from your calendar.`
        });
      } catch (err) {
        console.error("❌ Failed to fetch Google Calendar events", err);
        toast({
          title: "Failed to load calendar",
          description: "There was a problem accessing your events.",
          variant: "destructive"
        });
      }
    },
    onError: (err) => {
      console.error("OAuth Error", err);
      toast({
        title: "Google Login Failed",
        description: "Could not connect your calendar.",
        variant: "destructive"
      });
    }
  });

  return (
    <Button variant="outline" onClick={() => login()}>
      Connect Google Calendar
    </Button>
  );
};

export default GoogleCalendarConnect;
