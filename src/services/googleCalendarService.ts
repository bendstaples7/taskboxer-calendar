
import { Task, CalendarEvent } from "@/lib/types";
import { useGoogleCalendarAuth } from "./googleCalendarAuth";
import { useGoogleCalendarEvents } from "./googleCalendarEvents";

export const useGoogleCalendarService = () => {
  const auth = useGoogleCalendarAuth();
  const events = useGoogleCalendarEvents();
  
  return {
    ...auth,
    ...events
  };
};

// Add type definitions for the Google API
declare global {
  interface Window {
    gapi: {
      load: (libraries: string, options?: { callback: () => void; onerror: (error: any) => void }) => void;
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
