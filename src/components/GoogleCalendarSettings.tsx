
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter
} from '@/components/ui/dialog';
import { Settings } from 'lucide-react';
import { useGoogleCalendarService } from '@/services/googleCalendarService';

const GoogleCalendarSettings: React.FC = () => {
  const googleCalendarService = useGoogleCalendarService();
  const [newApiKey, setNewApiKey] = useState(googleCalendarService.apiKey || '');
  const [newClientId, setNewClientId] = useState(googleCalendarService.clientId || '');
  const [open, setOpen] = useState(false);

  const handleSave = () => {
    googleCalendarService.setCredentials(newApiKey, newClientId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-4 w-4" />
          <span className="sr-only">Google Calendar Settings</span>
        </Button>
      </DialogTrigger>
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
