import React from "react";
import { Task, CalendarEvent } from "@/lib/types";

interface CalendarItemProps {
  item: CalendarEvent | Task;
  isTask: boolean;
  index: number;
  totalItems: number;
  resizingTaskId: string | null;
  isResizing: boolean;
  onClick?: () => void;
}

const CalendarItem: React.FC<CalendarItemProps> = ({
  item,
  isTask,
  index,
  totalItems,
  resizingTaskId,
  isResizing,
  onClick,
}) => {
  return (
    <div
      className={`rounded px-2 py-1 text-sm shadow-md cursor-pointer ${
        isTask ? "calendar-task" : "calendar-event"
      }`}
      onClick={onClick}
    >
      {item.title}
    </div>
  );
};

export default CalendarItem;
