
import { Task, CalendarEvent } from "@/lib/types";
import { addMinutes } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useGoogleCalendarAuth } from "./googleCalendarAuth";

export const useGoogleCalendarEvents = () => {
  const { toast } = useToast();
  const { isAuthenticated, signIn } = useGoogleCalendarAuth();
  
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
        isGoogleEvent: true,
        colorId: (event as any).colorId,
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
    fetchEvents,
    addTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar
  };
};
