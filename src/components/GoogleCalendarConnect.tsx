import React from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useGoogleLogin } from '@react-oauth/google';

interface GoogleCalendarConnectProps {
  onEventsLoaded?: (events: any[]) => void; // Optional callback if you want to sync events
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ onEventsLoaded }) => {
  const { toast } = useToast();

  const login = useGoogleLogin({
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email'
    ].join(' '),
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      console.log("Google Calendar Access Token:", accessToken);
      
      toast({
        title: "Google Calendar connected",
        description: "Successfully authenticated with Google Calendar."
      });

      // Example placeholder: fetch events if needed
      if (onEventsLoaded) {
        try {
          const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          const data = await response.json();
          onEventsLoaded(data.items || []);
        } catch (err) {
          toast({
            title: "Error loading events",
            description: "Could not fetch events from Google Calendar.",
            variant: "destructive"
          });
        }
      }
    },
    onError: (errorResponse) => {
      console.error("OAuth Error:", errorResponse);
      toast({
        title: "Google Calendar connection failed",
        description: "Could not authenticate with Google.",
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
