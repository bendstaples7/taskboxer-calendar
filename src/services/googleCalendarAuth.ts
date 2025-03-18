
import { useToast } from "@/hooks/use-toast";

export const useGoogleCalendarAuth = () => {
  const { toast } = useToast();
  
  // Define your Google API credentials
  // Using placeholder values - user should replace with their own valid credentials
  // from their Google Cloud Console
  const API_KEY = '';  // Reset API key - was invalid
  const CLIENT_ID = '621440005003-b6mlk5er35n4brfcnrp573jn8o33vj7e.apps.googleusercontent.com';
  
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';
  
  const initializeGoogleApi = async () => {
    return new Promise<boolean>((resolve, reject) => {
      if (!window.gapi) {
        console.error("Google API not loaded");
        reject(new Error("Google API not loaded"));
        return;
      }
      
      // Load client & auth2 libraries
      window.gapi.load('client:auth2', {
        callback: async () => {
          try {
            console.log("Initializing Google API client...");
            await window.gapi.client.init({
              apiKey: API_KEY,
              clientId: CLIENT_ID,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES,
              ux_mode: 'popup',
            });
            
            console.log("Google API client initialized");
            resolve(true);
          } catch (error) {
            console.error("Error initializing Google API client:", error);
            reject(error);
          }
        },
        onerror: (error) => {
          console.error("Error loading Google API client libraries:", error);
          reject(error);
        }
      });
    });
  };
  
  const isAuthenticated = () => {
    if (!window.gapi || !window.gapi.auth2) {
      return false;
    }
    
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      return authInstance && authInstance.isSignedIn.get();
    } catch (error) {
      console.error("Error checking authentication status:", error);
      return false;
    }
  };
  
  const signIn = async (forcePopup = false) => {
    if (!window.gapi || !window.gapi.auth2) {
      console.error("Google API not initialized");
      return false;
    }
    
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      
      // If already signed in, return true
      if (authInstance.isSignedIn.get()) {
        return true;
      }
      
      console.log("Starting Google sign-in...");
      
      // Use a popup for sign-in for better compatibility
      if (forcePopup) {
        console.log("Using popup sign-in mode");
        const user = await authInstance.signIn({
          ux_mode: 'popup',
          prompt: 'select_account'
        });
        return user != null;
      } else {
        // Try the default sign-in method
        console.log("Using default sign-in mode");
        const user = await authInstance.signIn();
        return user != null;
      }
    } catch (error) {
      console.error("Error during sign-in:", error);
      throw error;
    }
  };
  
  const signOut = async () => {
    if (!window.gapi || !window.gapi.auth2) {
      console.error("Google API not initialized");
      return false;
    }
    
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
      return true;
    } catch (error) {
      console.error("Error during sign-out:", error);
      return false;
    }
  };
  
  return {
    initializeGoogleApi,
    isAuthenticated,
    signIn,
    signOut
  };
};
