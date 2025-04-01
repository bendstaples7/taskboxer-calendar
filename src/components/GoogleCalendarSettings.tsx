
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { useGoogleCalendarService } from '@/services/googleCalendarService';

interface GoogleCalendarSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const GoogleCalendarSettings: React.FC<GoogleCalendarSettingsProps> = ({
  open,
  onOpenChange
}) => {
  const googleCalendarService = useGoogleCalendarService();
  const [newApiKey, setNewApiKey] = useState('');
  const [newClientId, setNewClientId] = useState('');

  useEffect(() => {
    // Initialize state from service when component mounts
    setNewApiKey(googleCalendarService.apiKey || '');
    setNewClientId(googleCalendarService.clientId || '');
  }, [googleCalendarService.apiKey, googleCalendarService.clientId]);

  const handleSave = () => {
    googleCalendarService.setCredentials(newApiKey, newClientId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Google Calendar Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              placeholder="Enter your Google Calendar API Key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Your API key is stored locally and never sent to our servers
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientId">Client ID (Optional)</Label>
            <Input
              id="clientId"
              placeholder="Enter your Google Client ID"
              value={newClientId}
              onChange={(e) => setNewClientId(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoogleCalendarSettings;
