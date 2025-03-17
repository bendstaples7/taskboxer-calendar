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
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();
  const googleCalendarService = useGoogleCalendarService();
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        await googleCalendarService.initializeGoogleApi();
        const authenticated = googleCalendarService.isAuthenticated();
        setIsConnected(authenticated);
        
        if (authenticated) {
          loadEvents();
        }
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
        setIsConnected(false);
      }
    };
    
    if (window.gapi) {
      checkConnection();
    } else {
      // Script will be loaded by useGoogleCalendarSync
      setIsConnected(false);
    }
  }, []);
  
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const success = await googleCalendarService.signIn();
      setIsConnected(success);
      
      if (success) {
        loadEvents();
      }
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      toast({
        title: "Connection failed",
        description: "Could not connect to Google Calendar. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await googleCalendarService.signOut();
      setIsConnected(false);
      
      toast({
        title: "Disconnected",
        description: "Successfully disconnected from Google Calendar.",
      });
    } catch (error) {
      console.error("Error disconnecting from Google Calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      const start = new Date();
      start.setDate(start.getDate() - 7); // One week ago
      
      const end = new Date();
      end.setDate(end.getDate() + 30); // 30 days from now
      
      const events = await googleCalendarService.fetchEvents(start, end);
      
      if (onEventsLoaded) {
        onEventsLoaded(events);
      }
      
      toast({
        title: "Calendar synced",
        description: `${events.length} events loaded from Google Calendar.`,
      });
    } catch (error) {
      console.error("Error loading events from Google Calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };
  
  return (
    <div>
      <div className="flex items-center gap-2">
        {isConnected ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                Loading...
              </span>
            ) : (
              <span className="flex items-center">
                <span className="bg-green-500 w-2 h-2 rounded-full mr-2"></span>
                Connected to Google Calendar
              </span>
            )}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleConnect}
            disabled={isLoading}
          >
            {isLoading ? (
              "Connecting..."
            ) : (
              "Connect Google Calendar"
            )}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleInstructions}
        >
          ?
        </Button>
      </div>
      
      {showInstructions && (
        <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm">
          <h3 className="font-medium mb-1">Troubleshooting Google Calendar Connection</h3>
          <p className="mb-2">
            If you encounter issues connecting to Google Calendar, please ensure:
          </p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>
              Your domain is registered in the Google Cloud Console.
              Add <strong>{window.location.origin}</strong> to your Google API authorized origins.
            </li>
            <li>
              Your API key is valid and properly configured.
            </li>
            <li>
              You have enabled the Google Calendar API in your Google Cloud Console.
            </li>
            <li>
              You have added <strong>{window.location.origin}</strong> to the authorized redirect URIs.
            </li>
          </ol>
          <Button
            variant="link"
            size="sm"
            className="mt-2 p-0 h-auto text-gray-600"
            asChild
          >
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              Open Google Cloud Console
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default GoogleCalendarConnect;
