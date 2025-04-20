import React from "react";
import { Task, CalendarEvent } from "@/lib/types";
import { CalendarIcon } from "lucide-react";
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
  const isGoogleEvent = !isTask && "isGoogleEvent" in item && item.isGoogleEvent;
  const colorId = !isTask && "colorId" in item ? item.colorId : null;

  const wrapperClass = classNames(
    "bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2 text-sm leading-tight w-full h-full overflow-hidden",
    {
      "google-color": isGoogleEvent,
      "calendar-task": isTask,
      "cursor-pointer": true,
    }
  );

  const textColor = classNames({
    "text-gray-900": true,
  });

  return (
    <div className={wrapperClass}>
      <div className="font-semibold truncate text-gray-900">
        {item.title}
      </div>

      {item.start && item.end && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
          <CalendarIcon className="w-4 h-4" />
          <span>
            {new Date(item.start).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {" - "}
            {new Date(item.end).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}

      {"description" in item && item.description && (
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">
          {item.description}
        </p>
      )}
    </div>
  );
};

export default CalendarItem;
