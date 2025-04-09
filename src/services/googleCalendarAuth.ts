// Legacy Google API authentication has been deprecated.
// This module has been replaced by @react-oauth/google.

import { useToast } from "@/hooks/use-toast";

export const useGoogleCalendarAuth = () => {
  const { toast } = useToast();

  const initializeGoogleApi = async () => {
    toast({
      title: "Google Calendar Disabled",
      description: "Legacy Google API has been disabled. Use popup login instead.",
      variant: "default",
    });
    return false;
  };

  return {
    initializeGoogleApi,
    isAuthenticated: () => false,
    signIn: async () => false,
    signOut: async () => false,
    setCredentials: () => {},
    apiKey: null,
    clientId: null,
  };
};
