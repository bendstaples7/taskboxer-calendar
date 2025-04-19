import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarEvent } from "@/lib/types";
import { format } from "date-fns";

interface Props {
  event: CalendarEvent | null;
  open: boolean;
  onClose: () => void;
}

const EventDetailsDialog: React.FC<Props> = ({ event, open, onClose }) => {
  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 text-sm text-gray-600">
          <div><strong>Start:</strong> {format(new Date(event.start), "PPpp")}</div>
          <div><strong>End:</strong> {format(new Date(event.end), "PPpp")}</div>
          {event.googleEventId && (
            <div>
              <a
                href={`https://calendar.google.com/calendar/event?eid=${btoa(event.googleEventId)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                View in Google Calendar
              </a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
