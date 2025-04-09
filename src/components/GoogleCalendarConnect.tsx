import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleCalendarConnectProps {
  onEventsLoaded?: (events: any[]) => void;
}

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
        const res = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&orderBy=startTime&singleEvents=true',
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

        if (onEventsLoaded) {
          onEventsLoaded(events);
        }

        toast({
          title: "Google Calendar Connected",
          description: `${events.length} events loaded from your calendar.`
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
