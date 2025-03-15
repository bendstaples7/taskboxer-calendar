
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, LogOut } from 'lucide-react';
import { useGoogleCalendarService } from '@/services/googleCalendarService';

interface GoogleCalendarConnectProps {
  onEventsLoaded: (events: any[]) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ 
  onEventsLoaded 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleCalendarService = useGoogleCalendarService();

  // Load the Google API script
  useEffect(() => {
    const loadGoogleApi = () => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        googleCalendarService.initializeGoogleApi()
          .then(initialized => {
            if (initialized) {
              setIsConnected(googleCalendarService.isAuthenticated());
            }
          });
      };
      document.body.appendChild(script);
    };

    loadGoogleApi();
  }, []);

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.signIn();
      setIsConnected(success);
      
      if (success) {
        // Load events for the next month
        const now = new Date();
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
        
        const events = await googleCalendarService.fetchEvents(now, oneMonthLater);
        onEventsLoaded(events);
      }
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await googleCalendarService.signOut();
      setIsConnected(false);
      onEventsLoaded([]);
    } catch (error) {
      console.error("Error disconnecting from Google Calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isConnected ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          disabled={isLoading}
        >
          <LogOut className="h-4 w-4 mr-1" />
          Disconnect Calendar
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleConnect}
          disabled={isLoading}
        >
          <Calendar className="h-4 w-4 mr-1" />
          Connect Google Calendar
        </Button>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
