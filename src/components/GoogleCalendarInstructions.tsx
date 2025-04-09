
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Code, ExternalLink } from 'lucide-react';

interface GoogleCalendarInstructionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoogleCalendarInstructions: React.FC<GoogleCalendarInstructionsProps> = ({
  open,
  onOpenChange
}) => {
  const currentDomain = window.location.origin;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Google Calendar Setup</DialogTitle>
          <DialogDescription>
            Follow these steps to connect Google Calendar
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 my-4">
          <ol className="list-decimal pl-5 space-y-3">
            <li>
              Go to the <a 
                href="https://console.cloud.google.com/apis/credentials" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium flex items-center gap-1"
              >
                Google Cloud Console <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>Select your project containing the Shinko OAuth client</li>
            <li>Navigate to <strong>APIs & Services &gt; Credentials</strong></li>
            <li>Find the OAuth 2.0 Client ID for Shinko and click the edit button</li>
            <li>
              Under <strong>Authorized JavaScript origins</strong>, add your current domain:
              <div className="flex items-center mt-1 gap-2">
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono break-all">
                  {currentDomain}
                </code>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7"
                  onClick={() => navigator.clipboard.writeText(currentDomain)}
                >
                  <Code className="h-3 w-3" />
                </Button>
              </div>
            </li>
            <li className="text-red-500 font-medium">
              Make sure there are NO trailing slashes in the origin URL!
            </li>
            <li>
              For the error "invalid_client":
              <ul className="list-disc pl-5 mt-2 space-y-1 text-amber-700">
                <li>Double-check that there's no typo in the domain</li>
                <li>Ensure you're using the same Google account that owns the project</li>
                <li>Try clearing your browser cache and cookies</li>
                <li>Make sure you've created OAuth consent screen</li>
              </ul>
            </li>
            <li>Click <strong>Save</strong> to update your client configuration</li>
            <li>Return to Shinko and try connecting again</li>
          </ol>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleCalendarInstructions;
