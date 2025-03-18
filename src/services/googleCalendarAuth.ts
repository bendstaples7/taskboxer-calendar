
import { useToast } from "@/hooks/use-toast";

// Google API scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Updated with proper client ID
const CLIENT_ID = '267714022298-mm144g9hscrmbressjhj43c18pfb6vc6.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCa0eVv_OZJJJjRBChRaT1KN86EQvMvD9U';

export const useGoogleCalendarAuth = () => {
  const { toast } = useToast();
  
  // Initialize the Google API client
  const initializeGoogleApi = async (): Promise<boolean> => {
    try {
      // Load the Google API client library
      await new Promise<void>((resolve, reject) => {
        window.gapi.load('client:auth2', {
          callback: () => resolve(),
          onerror: (error: any) => reject(error)
        });
      });

      // Initialize the Google API client
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: SCOPES.join(' '),
      });

      return true;
    } catch (error) {
      console.error('Error initializing Google API:', error);
      
      // Parse error details for better user feedback
      const errorObj = error as any;
      let errorMessage = "Error initializing Google Calendar API";
      let errorDetails = "";
      
      if (errorObj?.error === 'idpiframe_initialization_failed') {
        const currentOrigin = window.location.origin;
        errorMessage = `Your domain (${currentOrigin}) is not registered with Google Cloud Console`;
        errorDetails = `Please add ${currentOrigin} to your Google Cloud Console authorized origins.`;
        console.error(`Google Calendar Setup Error: This domain (${currentOrigin}) has not been registered in the Google Cloud Console.`);
      } else if (errorObj?.error?.code === 400 && errorObj?.error?.message?.includes('API key not valid')) {
        errorMessage = "Invalid API key. Check your Google Cloud Console configuration.";
        console.error('Google Calendar Setup Error: Invalid API key.');
      } else if (errorObj?.details) {
        errorMessage = `Error: ${errorObj.details}`;
      }
      
      toast({
        title: "Google Calendar Connection Error",
        description: `${errorMessage}. ${errorDetails}`,
        variant: "destructive",
      });
      
      // Special handling for localhost development
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        toast({
          title: "Development Environment Detected",
          description: "For local development, make sure 'http://localhost:5173' and 'http://127.0.0.1:5173' are added to Authorized JavaScript origins in Google Cloud Console.",
        });
      }
      
      return false;
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    try {
      return window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get() || false;
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  };
  
  // Login to Google
  const signIn = async (): Promise<boolean> => {
    try {
      if (!window.gapi?.auth2) {
        const initialized = await initializeGoogleApi();
        if (!initialized) return false;
      }
      
      if (!isAuthenticated()) {
        const result = await window.gapi.auth2.getAuthInstance().signIn({
          prompt: 'select_account',
          ux_mode: 'popup'
        });
        
        if (result) {
          toast({
            title: "Successfully connected to Google Calendar",
            description: "Your calendar events will now sync with Shinko",
          });
          return true;
        }
      }
      
      return isAuthenticated();
    } catch (error) {
      console.error("Error signing in to Google:", error);
      const errorObj = error as any;
      let errorMessage = "Could not sign in to Google Calendar";
      let detailedError = "";
      
      if (errorObj?.error === 'popup_blocked_by_browser') {
        detailedError = "Please allow popups for this site and try again.";
      } else if (errorObj?.error === 'access_denied') {
        detailedError = "You denied access to your Google account.";
      } else if (errorObj?.error === 'immediate_failed') {
        const currentOrigin = window.location.origin;
        detailedError = `Please ensure you've added ${currentOrigin} to your Google API allowed origins in the Google Cloud Console.`;
      } else if (errorObj?.details) {
        detailedError = errorObj.details;
      } else if (typeof errorObj === 'string') {
        detailedError = errorObj;
      } else if (errorObj instanceof Error) {
        detailedError = errorObj.message;
      }
      
      toast({
        title: "Sign in failed",
        description: `${errorMessage}${detailedError ? `: ${detailedError}` : ''}`,
        variant: "destructive",
      });
      
      // Display helpful troubleshooting for developers
      console.log("Troubleshooting tips for Google Calendar:");
      console.log(`1. Make sure ${window.location.origin} is added to Authorized JavaScript origins`);
      console.log("2. Check that the correct Client ID and API Key are being used");
      console.log("3. Verify the necessary scopes are enabled in your Google Cloud project");
      
      return false;
    }
  };
  
  // Logout from Google
  const signOut = async (): Promise<void> => {
    try {
      if (window.gapi?.auth2) {
        await window.gapi.auth2.getAuthInstance().signOut();
        toast({
          title: "Signed out from Google Calendar",
          description: "Your calendar events will no longer sync with Shinko",
        });
      }
    } catch (error) {
      console.error("Error signing out from Google:", error);
    }
  };
  
  return {
    initializeGoogleApi,
    isAuthenticated,
    signIn,
    signOut
  };
};
