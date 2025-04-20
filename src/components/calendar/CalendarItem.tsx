import React from "react";
import { Task, CalendarEvent } from "@/lib/types";
import classNames from "classnames";

interface CalendarItemProps {
  item: Task | CalendarEvent;
  isTask: boolean;
  index: number;
  totalItems: number;
  resizingTaskId: string | null;
  isResizing: boolean;
}

const CalendarItem: React.FC<CalendarItemProps> = ({
  item,
  isTask,
  index,
  totalItems,
  resizingTaskId,
  isResizing,
}) => {
  const isGoogle = !isTask && "isGoogleEvent" in item && item.isGoogleEvent;

  return (
    <div
      className={classNames(
        "h-full rounded px-2 py-1 text-xs overflow-hidden cursor-pointer border shadow-sm",
        {
          "google-calendar-blue": isGoogle,
          "calendar-event": !isTask && !isGoogle,
          "calendar-task": isTask,
        }
      )}
    >
      <div className="font-semibold truncate text-white">
        {item.title}
      </div>
    </div>
  );
};

export default CalendarItem;
