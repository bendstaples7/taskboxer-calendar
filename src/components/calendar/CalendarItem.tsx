import React from "react";
import { useDrag } from "react-dnd";
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

  const [{ isDragging }, drag] = useDrag({
    type: "TASK",
    item: { task: item },
    canDrag: isTask,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const wrapperClass = classNames(
    "bg-white rounded-xl border border-gray-200 shadow-sm px-3 py-2 text-sm leading-tight w-full h-full overflow-hidden cursor-pointer",
    {
      "google-color": isGoogleEvent,
      "calendar-task": isTask,
      "opacity-50": isDragging,
    }
  );

  const getColorFromId = (colorId?: string) => {
    const colorMap: { [key: string]: string } = {
      "1": "#a4bdf2", // Blue
      "2": "#7ae7bf", // Green
      "3": "#dbadff", // Purple
      "4": "#ff887c", // Red
      "5": "#fbd75b", // Yellow
      "6": "#ffb878", // Orange
      "7": "#46d6db", // Turquoise
      "8": "#e1e1e1", // Gray
      "9": "#5484ed", // Bold Blue
      "10": "#51b749", // Bold Green
      "11": "#dc2127", // Bold Red
    };
    return colorMap[colorId || "1"] || "#a4bdf2"; // Default to blue if colorId is not found
  };

  const itemStyle = {
    backgroundColor: isGoogleEvent ? getColorFromId(item.colorId) : undefined,
  };

  return (
    <div ref={isTask ? drag : null} className={wrapperClass} style={itemStyle}>
      <div className="font-semibold truncate text-gray-900">{item.title}</div>

      {"start" in item && "end" in item && item.start && item.end && (
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
        <p className="text-gray-600 text-xs mt-1 line-clamp-2">{item.description}</p>
      )}
    </div>
  );
};

export default CalendarItem;
