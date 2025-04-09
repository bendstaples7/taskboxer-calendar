import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

export const useGoogleCalendarAuth = () => {
  const { toast } = useToast();

  const [apiKey, setApiKey] = useState<string | null>(
    localStorage.getItem("googleCalendarApiKey") || ""
  );
  const [clientId, setClientId] = useState<string | null>(
    localStorage.getItem("googleCalendarClientId") ||
    "621440005003-b6mlk5er35n4brfcnrp573jn8o33vj7e.apps.googleusercontent.com"
  );

  // Watch for changes to API credentials in localStorage
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "googleCalendarApiKey") {
        setApiKey(event.newValue);
      } else if (event.key === "googleCalendarClientId") {
        setClientId(event.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const DISCOVERY_DOCS = [
    "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
  ];
  const SCOPES = "https://www.googleapis.com/auth/calendar";

  const setCredentials = (newApiKey: string, newClientId?: string) => {
    localStorage.setItem("googleCalendarApiKey", newApiKey);
    setApiKey(newApiKey);

    if (newClientId) {
      localStorage.setItem("googleCalendarClientId", newClientId);
      setClientId(newClientId);
    }

    if (window.gapi) {
      initializeGoogleApi().catch((err) =>
        console.error("Failed to reinitialize Google API:", err)
      );
    }
  };

  const initializeGoogleApi = async () => {
    return new Promise<boolean>((resolve, reject) => {
      if (!apiKey || !clientId) {
        toast({
          title: "Missing credentials",
          description: "Please add your Google API credentials in settings.",
          variant: "destructive",
        });
        return reject(new Error("Missing credentials"));
      }

      if (!window.gapi) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.onload = () => {
          initializeGoogleApi().then(resolve).catch(reject);
        };
        script.onerror = () => {
          reject(new Error("Failed to load Google API script"));
        };
        document.body.appendChild(script);
        return;
      }

      window.gapi.load("client:auth2", {
        callback: async () => {
          try {
            await window.gapi.client.init({
              apiKey,
              clientId,
              discoveryDocs: DISCOVERY_DOCS,
              scope: SCOPES,
              ux_mode: "popup",
            });
            resolve(true);
          } catch (err) {
            reject(err);
          }
        },
        onerror: (err) => reject(err),
      });
    });
  };

  const isAuthenticated = () => {
    try {
      return window.gapi?.auth2?.getAuthInstance()?.isSignedIn.get() || false;
    } catch (err) {
      console.error("Auth check error:", err);
      return false;
    }
  };

  const signIn = async (forcePopup = false) => {
    try {
      const authInstance = window.gapi?.auth2?.getAuthInstance();
      if (!authInstance) return false;

      if (authInstance.isSignedIn.get()) return true;

      const user = await authInstance.signIn(
        forcePopup
          ? { ux_mode: "popup", prompt: "select_account" }
          : undefined
      );

      return user != null;
    } catch (err) {
      console.error("Sign-in error:", err);
      return false;
    }
  };

  const signOut = async () => {
    try {
      const authInstance = window.gapi?.auth2?.getAuthInstance();
      await authInstance?.signOut();
      return true;
    } catch (err) {
      console.error("Sign-out error:", err);
      return false;
    }
  };

  return {
    initializeGoogleApi,
    isAuthenticated,
    signIn,
    signOut,
    setCredentials,
    apiKey,
    clientId,
  };
};
