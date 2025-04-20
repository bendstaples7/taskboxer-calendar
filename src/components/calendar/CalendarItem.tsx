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
  const isGoogleEvent = !isTask && "isGoogleEvent" in item && item.isGoogleEvent;
  const colorId = !isTask && "colorId" in item ? item.colorId : null;

  const itemClass = classNames(
    "h-full rounded px-2 py-1 text-xs overflow-hidden cursor-pointer border shadow-sm",
    {
      [`google-color-${colorId}`]: isGoogleEvent && colorId,
      "calendar-event": isGoogleEvent && !colorId,
      "calendar-task": isTask,
    }
  );

  const textColorClass = classNames({
    "text-white": !colorId || colorId !== "8", // Google color 8 is light gray, needs dark text
    "text-black": colorId === "8",
  });

  return (
    <div className={itemClass}>
      <div className={classNames("font-semibold truncate", textColorClass)}>
        {item.title}
      </div>
    </div>
  );
};

export default CalendarItem;
