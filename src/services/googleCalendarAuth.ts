
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
        window.gapi.load('client:auth2', () => {
          resolve();
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
      
      if (errorObj?.error === 'idpiframe_initialization_failed') {
        errorMessage = `Domain not registered in Google Cloud Console. Please add ${window.location.origin} to your allowed origins.`;
        console.error(`Google Calendar Setup Error: This domain (${window.location.origin}) has not been registered in the Google Cloud Console.`);
      } else if (errorObj?.error?.code === 400 && errorObj?.error?.message?.includes('API key not valid')) {
        errorMessage = "Invalid API key. Check your Google Cloud Console configuration.";
        console.error('Google Calendar Setup Error: Invalid API key.');
      } else if (errorObj?.details) {
        errorMessage = `Error: ${errorObj.details}`;
      }
      
      toast({
        title: "Google Calendar Connection Error",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  // Check if user is authenticated
  const isAuthenticated = (): boolean => {
    return window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get() || false;
  };
  
  // Login to Google
  const signIn = async (): Promise<boolean> => {
    try {
      if (!window.gapi?.auth2) {
        const initialized = await initializeGoogleApi();
        if (!initialized) return false;
      }
      
      if (!isAuthenticated()) {
        await window.gapi.auth2.getAuthInstance().signIn({
          prompt: 'select_account',
          ux_mode: 'popup'
        });
        
        toast({
          title: "Successfully connected to Google Calendar",
          description: "Your calendar events will now sync with Shinko",
        });
      }
      
      return isAuthenticated();
    } catch (error) {
      console.error("Error signing in to Google:", error);
      const errorObj = error as any;
      let errorMessage = "Could not sign in to Google Calendar";
      
      if (errorObj?.error === 'popup_blocked_by_browser') {
        errorMessage += ". Please allow popups for this site.";
      } else if (errorObj?.error === 'access_denied') {
        errorMessage += ". You denied access to your Google account.";
      } else if (errorObj?.error === 'immediate_failed') {
        errorMessage += `. Please ensure you've added ${window.location.origin} to your Google API allowed origins.`;
      } else if (errorObj?.details) {
        errorMessage += `. ${errorObj.details}`;
      }
      
      toast({
        title: "Sign in failed",
        description: errorMessage,
        variant: "destructive",
      });
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
