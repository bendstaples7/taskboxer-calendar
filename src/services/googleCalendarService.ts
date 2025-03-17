import { Task, CalendarEvent } from "@/lib/types";
import { addMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";

// Google API scopes required
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

// Updated with a proper API key and client ID
// Note: For production use, these would be stored securely
const CLIENT_ID = '267714022298-mm144g9hscrmbressjhj43c18pfb6vc6.apps.googleusercontent.com';
const API_KEY = 'AIzaSyCa0eVv_OZJJJjRBChRaT1KN86EQvMvD9U';

export const useGoogleCalendarService = () => {
  const { toast } = useToast();
  
  // Initialize the Google API client
  const initializeGoogleApi = async (): Promise<boolean> => {
    try {
      // Load the Google API client library
      await new Promise<void>((resolve, reject) => {
        // Fix: Use the correct way to load the Google API
        window.gapi.load('client:auth2', () => {
          resolve();
        });
      });

      // Initialize the Google API client with your API key and OAuth client ID
      await window.gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
      });

      return true;
    } catch (error) {
      console.error('Error initializing Google API:', error);
      
      // Provide specific error handling advice
      const errorObj = error as any;
      if (errorObj?.error === 'idpiframe_initialization_failed') {
        console.error('Google Calendar Setup Error: This domain has not been registered in the Google Cloud Console.');
        console.error('Please add this domain to your Google API allowed origins in the Google Cloud Console.');
      } else if (errorObj?.error?.code === 400 && errorObj?.error?.message?.includes('API key not valid')) {
        console.error('Google Calendar Setup Error: Invalid API key.');
        console.error('Please check your API key in the Google Cloud Console.');
      }
      
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
      toast({
        title: "Sign in failed",
        description: "Could not sign in to Google Calendar. Please ensure you have added this domain to your Google API allowed origins.",
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
  
  // Fetch events from Google Calendar
  const fetchEvents = async (startDate: Date, endDate: Date): Promise<CalendarEvent[]> => {
    try {
      if (!isAuthenticated()) {
        const authenticated = await signIn();
        if (!authenticated) return [];
      }
      
      const response = await window.gapi.client.calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
      });
      
      const events = response.result.items || [];
      
      return events.map(event => ({
        id: event.id,
        googleEventId: event.id,
        title: event.summary || 'Untitled Event',
        start: new Date(event.start.dateTime || event.start.date),
        end: new Date(event.end.dateTime || event.end.date),
        isGoogleEvent: true
      }));
    } catch (error) {
      console.error("Error fetching events from Google Calendar:", error);
      toast({
        title: "Failed to fetch calendar events",
        description: "Could not retrieve events from Google Calendar.",
        variant: "destructive",
      });
      return [];
    }
  };
  
  // Add a task to Google Calendar
  const addTaskToCalendar = async (task: Task): Promise<string | null> => {
    try {
      if (!isAuthenticated()) {
        const authenticated = await signIn();
        if (!authenticated) return null;
      }
      
      if (!task.scheduled) {
        console.error("Cannot add unscheduled task to calendar");
        return null;
      }
      
      const event = {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: task.scheduled.start.toISOString()
        },
        end: {
          dateTime: task.scheduled.end.toISOString()
        }
      };
      
      const response = await window.gapi.client.calendar.events.insert({
        calendarId: 'primary',
        resource: event
      });
      
      toast({
        title: "Task added to Google Calendar",
        description: `"${task.title}" has been synced to your calendar.`,
      });
      
      return response.result.id;
    } catch (error) {
      console.error("Error adding task to Google Calendar:", error);
      toast({
        title: "Failed to add task to calendar",
        description: "Could not add the task to Google Calendar.",
        variant: "destructive",
      });
      return null;
    }
  };
  
  // Update an event in Google Calendar
  const updateTaskInCalendar = async (task: Task): Promise<boolean> => {
    try {
      if (!isAuthenticated()) {
        const authenticated = await signIn();
        if (!authenticated) return false;
      }
      
      if (!task.scheduled || !task.googleEventId) {
        console.error("Cannot update task in calendar: missing scheduled time or Google event ID");
        return false;
      }
      
      const event = {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: task.scheduled.start.toISOString()
        },
        end: {
          dateTime: task.scheduled.end.toISOString()
        }
      };
      
      await window.gapi.client.calendar.events.update({
        calendarId: 'primary',
        eventId: task.googleEventId,
        resource: event
      });
      
      return true;
    } catch (error) {
      console.error("Error updating task in Google Calendar:", error);
      toast({
        title: "Failed to update calendar",
        description: "Could not update the task in Google Calendar.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  // Remove an event from Google Calendar
  const removeTaskFromCalendar = async (googleEventId: string): Promise<boolean> => {
    try {
      if (!isAuthenticated()) {
        const authenticated = await signIn();
        if (!authenticated) return false;
      }
      
      await window.gapi.client.calendar.events.delete({
        calendarId: 'primary',
        eventId: googleEventId
      });
      
      return true;
    } catch (error) {
      console.error("Error removing task from Google Calendar:", error);
      toast({
        title: "Failed to remove from calendar",
        description: "Could not remove the task from Google Calendar.",
        variant: "destructive",
      });
      return false;
    }
  };
  
  return {
    initializeGoogleApi,
    isAuthenticated,
    signIn,
    signOut,
    fetchEvents,
    addTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar
  };
};

// Add type definitions for the Google API
declare global {
  interface Window {
    gapi: {
      load: (libraries: string, callback: () => void) => void;
      client: {
        init: (config: any) => Promise<void>;
        calendar: {
          events: {
            list: (params: any) => Promise<{
              result: {
                items: Array<{
                  id: string;
                  summary: string;
                  description?: string;
                  start: {
                    dateTime: string;
                    date?: string;
                  };
                  end: {
                    dateTime: string;
                    date?: string;
                  };
                }>;
              };
            }>;
            insert: (params: any) => Promise<{
              result: {
                id: string;
              };
            }>;
            update: (params: any) => Promise<any>;
            delete: (params: any) => Promise<any>;
          };
        };
      };
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean;
          };
          signIn: (options?: any) => Promise<any>;
          signOut: () => Promise<any>;
        };
      };
    };
  }
}
