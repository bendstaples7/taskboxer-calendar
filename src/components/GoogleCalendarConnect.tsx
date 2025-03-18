
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, LogOut, AlertCircle } from 'lucide-react';
import { useGoogleCalendarService } from '@/services/googleCalendarService';
import { useToast } from '@/hooks/use-toast';
import GoogleCalendarInstructions from './GoogleCalendarInstructions';

interface GoogleCalendarConnectProps {
  onEventsLoaded: (events: any[]) => void;
}

const GoogleCalendarConnect: React.FC<GoogleCalendarConnectProps> = ({
  onEventsLoaded
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const googleCalendarService = useGoogleCalendarService();
  
  // Check if we're in development mode
  const isDevelopment = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname.includes('lovable.app') ||
                        window.location.hostname.includes('lovable-project.com');
  
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
    setError(null);
    
    try {
      // Force a new initialization of the API to ensure we're trying with fresh settings
      try {
        await googleCalendarService.initializeGoogleApi();
      } catch (error) {
        console.warn("Error during re-initialization:", error);
        // Continue anyway, might still work
      }
      
      console.log("Starting Google sign-in process...");
      
      // Use popup mode for better compatibility
      const success = await googleCalendarService.signIn(true);
      setIsConnected(success);
      
      if (success) {
        console.log("Successfully signed in to Google");
        loadEvents();
        toast({
          title: "Connected successfully",
          description: "Your Google Calendar has been connected.",
        });
      } else {
        console.log("Failed to sign in to Google");
        setError("Authentication failed. Please try again.");
        toast({
          title: "Connection failed",
          description: "Could not authenticate with Google Calendar.",
          variant: "destructive",
        });
        
        // Show setup instructions since this is likely a domain issue
        setShowSetupDialog(true);
      }
    } catch (error: any) {
      console.error("Error connecting to Google Calendar:", error);
      
      // Show setup instructions for most errors since that's the common issue
      setShowSetupDialog(true);
      
      // Check for specific error types
      if (error?.error === "popup_closed_by_user") {
        setError("Sign-in popup was closed. Please try again.");
      } else if (error?.error === "idpiframe_initialization_failed") {
        setError("Domain not registered in Google Cloud Console. Please check console for details.");
      } else if (error?.error === "immediate_failed") {
        setError("Google sign-in failed. Please check your browser settings and domain configuration.");
      } else {
        setError(`Sign-in failed: ${error?.error || error?.message || "Could not connect to Google Calendar"}`);
      }
      
      toast({
        title: "Connection failed",
        description: error?.error || error?.message || "Could not connect to Google Calendar",
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
      setError(null);
      
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
          onClick={() => setShowSetupDialog(true)}
        >
          ?
        </Button>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-500 flex items-start gap-1">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Development mode notice */}
      {isDevelopment && !isConnected && (
        <div className="mt-2 text-xs text-amber-600 border border-amber-300 bg-amber-50 p-2 rounded">
          <strong>Development notice:</strong> When testing in development environments 
          (localhost or *.lovable.app), ensure you've added {window.location.origin} 
          to your Google Cloud Console authorized origins.
        </div>
      )}
      
      <GoogleCalendarInstructions 
        open={showSetupDialog} 
        onOpenChange={setShowSetupDialog} 
      />
    </div>
  );
};

export default GoogleCalendarConnect;
