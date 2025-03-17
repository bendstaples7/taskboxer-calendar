
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, LogOut, AlertCircle } from 'lucide-react';
import { useGoogleCalendarService } from '@/services/googleCalendarService';
import { useToast } from '@/hooks/use-toast';

interface GoogleCalendarConnectProps {
  onEventsLoaded: (events: any[]) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({ 
  onEventsLoaded 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const googleCalendarService = useGoogleCalendarService();
  const { toast } = useToast();

  // Load the Google API script
  useEffect(() => {
    const loadGoogleApi = () => {
      // Only load if not already loaded
      if (window.gapi) {
        googleCalendarService.initializeGoogleApi()
          .then(initialized => {
            if (initialized) {
              setIsConnected(googleCalendarService.isAuthenticated());
            }
          });
        return;
      }
      
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
      // Show instructions to the user
      toast({
        title: "Connecting to Google Calendar",
        description: "Please ensure this domain is added to your Google Cloud Console's allowed origins.",
      });
      
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

  const openHelpInstructions = () => {
    toast({
      title: "Google Calendar Setup Guide",
      description: "1. Go to Google Cloud Console\n2. Select your project\n3. Navigate to APIs & Services > Credentials\n4. Edit your OAuth Client\n5. Add this domain to Authorized JavaScript origins",
      duration: 10000,
    });
  };

  return (
    <div className="flex gap-2">
      {isConnected ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleDisconnect}
          disabled={isLoading}
          className="text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          <LogOut className="h-4 w-4 mr-1" />
          Disconnect Calendar
        </Button>
      ) : (
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleConnect}
            disabled={isLoading}
            className="text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Connect Google Calendar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={openHelpInstructions}
            title="Setup Help"
            className="h-9 w-9"
          >
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </Button>
        </>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
