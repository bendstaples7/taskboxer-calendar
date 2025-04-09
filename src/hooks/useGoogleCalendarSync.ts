// Legacy Google Calendar sync logic removed.
// Calendar integration now handled by @react-oauth/google directly via UI components.

import { useState } from 'react';

export const useGoogleCalendarSync = () => {
  const [isInitialized] = useState(false);
  const [isSyncing] = useState(false);

  return {
    isInitialized,
    isSyncing,
    calendarEvents: [],
    loadEvents: async () => [],
    addTaskToCalendar: async (task) => task,
    updateTaskInCalendar: async () => false,
    removeTaskFromCalendar: async () => false,
    syncTasksWithCalendar: async (tasks) => tasks,
  };
};
