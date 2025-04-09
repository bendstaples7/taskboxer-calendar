
import { useState, useEffect, useCallback } from 'react';
import { Task, CalendarEvent } from '@/lib/types';
import { useGoogleCalendarService } from '@/services/googleCalendarService';
import { addDays, startOfWeek, endOfWeek } from 'date-fns';

export const useGoogleCalendarSync = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const googleCalendarService = useGoogleCalendarService();

  // Initialize Google API
  useEffect(() => {
    const initApi = async () => {
      const initialized = await googleCalendarService.initializeGoogleApi();
      setIsInitialized(initialized);
      
      if (initialized && googleCalendarService.isAuthenticated()) {
        loadEvents(new Date());
      }
    };

    // Load Google API script if not already loaded
    if (!window.gapi) {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => initApi();
      document.body.appendChild(script);
    } else {
      initApi();
    }
  }, []);

  // Load events for a specific date range
  const loadEvents = useCallback(async (date: Date) => {
    if (!isInitialized || !googleCalendarService.isAuthenticated()) {
      return [];
    }

    setIsSyncing(true);
    try {
      const start = startOfWeek(date, { weekStartsOn: 0 });
      const end = endOfWeek(date, { weekStartsOn: 0 });
      
      // Extend the range to show more events
      const extendedStart = addDays(start, -7);
      const extendedEnd = addDays(end, 7);
      
      const events = await googleCalendarService.fetchEvents(extendedStart, extendedEnd);
      setCalendarEvents(events);
      return events;
    } catch (error) {
      console.error("Error loading events:", error);
      return [];
    } finally {
      setIsSyncing(false);
    }
  }, [isInitialized, googleCalendarService]);

  // Add a task to Google Calendar
  const addTaskToCalendar = useCallback(async (task: Task): Promise<Task> => {
    if (!task.scheduled || task.googleEventId) {
      return task;
    }

    const googleEventId = await googleCalendarService.addTaskToCalendar(task);
    if (googleEventId) {
      return { ...task, googleEventId };
    }
    return task;
  }, [googleCalendarService]);

  // Update a task in Google Calendar
  const updateTaskInCalendar = useCallback(async (task: Task): Promise<boolean> => {
    if (!task.scheduled || !task.googleEventId) {
      return false;
    }

    return await googleCalendarService.updateTaskInCalendar(task);
  }, [googleCalendarService]);

  // Remove a task from Google Calendar
  const removeTaskFromCalendar = useCallback(async (task: Task): Promise<boolean> => {
    if (!task.googleEventId) {
      return false;
    }

    return await googleCalendarService.removeTaskFromCalendar(task.googleEventId);
  }, [googleCalendarService]);

  // Sync a list of tasks with Google Calendar
  const syncTasksWithCalendar = useCallback(async (tasks: Task[]): Promise<Task[]> => {
    if (!isInitialized || !googleCalendarService.isAuthenticated()) {
      return tasks;
    }

    const updatedTasks: Task[] = [];
    
    for (const task of tasks) {
      if (task.scheduled && !task.googleEventId) {
        // Add new task to calendar
        const updatedTask = await addTaskToCalendar(task);
        updatedTasks.push(updatedTask);
      } else if (task.scheduled && task.googleEventId) {
        // Update existing task in calendar
        await updateTaskInCalendar(task);
        updatedTasks.push(task);
      } else if (!task.scheduled && task.googleEventId) {
        // Remove task from calendar if unscheduled
        await removeTaskFromCalendar(task);
        updatedTasks.push({ ...task, googleEventId: undefined });
      } else {
        // No change needed
        updatedTasks.push(task);
      }
    }
    
    return updatedTasks;
  }, [isInitialized, googleCalendarService, addTaskToCalendar, updateTaskInCalendar, removeTaskFromCalendar]);

  return {
    isInitialized,
    isSyncing,
    calendarEvents,
    loadEvents,
    addTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar,
    syncTasksWithCalendar,
  };
};
