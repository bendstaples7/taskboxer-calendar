
import React from 'react';
import { format, getHours, getMinutes, differenceInMinutes } from 'date-fns';
import { cn } from "@/lib/utils";
import { Clock, Flag, Flame, SignalLow, SignalMedium, SignalHigh } from "lucide-react";
import { Task, CalendarEvent, Priority } from "@/lib/types";

interface CalendarItemProps {
  item: Task | CalendarEvent;
  isTask: boolean;
  index: number;
  totalItems: number;
  resizingTaskId: string | null;
  isResizing: boolean;
  onTaskClick?: (task: Task) => void;
  onDragStart?: (e: React.DragEvent, task: Task) => void;
  onDragEnd?: () => void;
  onResizeStart?: (e: React.MouseEvent, taskId: string) => void;
}

const getPriorityIcon = (priority: Priority | undefined) => {
  if (!priority) return null;
  
  switch (priority) {
    case 'low':
      return <SignalLow className="h-3 w-3 text-blue-500" />;
    case 'medium':
      return <SignalMedium className="h-3 w-3 text-green-500" />;
    case 'high':
      return <SignalHigh className="h-3 w-3 text-orange-500" />;
    case 'critical':
      return <Flame className="h-3 w-3 text-red-500" />;
    default:
      return null;
  }
};

const CalendarItem: React.FC<CalendarItemProps> = ({
  item,
  isTask,
  index,
  totalItems,
  resizingTaskId,
  isResizing,
  onTaskClick,
  onDragStart,
  onDragEnd,
  onResizeStart
}) => {
  const start = isTask 
    ? (item as Task).scheduled?.start
    : (item as CalendarEvent).start;
  const end = isTask 
    ? (item as Task).scheduled?.end
    : (item as CalendarEvent).end;

  if (!start || !end) return null;

  const startHour = getHours(new Date(start));
  const startMinute = getMinutes(new Date(start));
  const durationMinutes = differenceInMinutes(
    new Date(end),
    new Date(start)
  );
  
  const top = startHour * 60 + startMinute;
  const height = durationMinutes;
  
  // Calculate width and left offset for multiple items at the same time
  const itemWidth = totalItems > 1 ? `calc(${100 / totalItems}% - 6px)` : "calc(100% - 4px)";
  const leftOffset = totalItems > 1 ? `calc(${(index / totalItems) * 100}% + 2px)` : "2px";

  // Determine special styling for running tasks
  const isRunning = isTask && 
    (item as Task).timerStarted && 
    !(item as Task).timerPaused && 
    !(item as Task).timerExpired && 
    !(item as Task).completed;
    
  const isCompleted = isTask && (item as Task).completed;
  
  const task = isTask ? item as Task : null;
  const taskPriority = task?.priority;

  const getBackgroundColor = () => {
    if (!isTask) return "bg-gray-300 border-gray-400"; // Events
    if (isRunning) return "bg-purple-500 border-purple-700";
    if (isCompleted) return "bg-green-400 border-green-600 opacity-70";
    
    // Default task background based on priority
    return "bg-gray-200 border-gray-300";
  };

  return (
    <div
      className={cn(
        "absolute rounded-md px-2 py-1 overflow-hidden cursor-pointer text-xs",
        isTask ? "calendar-task" : "calendar-event",
        getBackgroundColor(),
        isRunning && "animate-pulse",
        isTask && (item as Task).id === resizingTaskId && "resize-active"
      )}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        zIndex: 5,
        width: itemWidth,
        left: leftOffset,
        cursor: isResizing && isTask && (item as Task).id === resizingTaskId ? 'ns-resize' : 'grab'
      }}
      onClick={isTask && onTaskClick ? () => onTaskClick(item as Task) : undefined}
      draggable={isTask && !isResizing}
      onDragStart={isTask && !isResizing && onDragStart ? (e) => onDragStart(e, item as Task) : undefined}
      onDragEnd={onDragEnd}
    >
      <div className="font-medium truncate flex items-center gap-1">
        {isTask && taskPriority && getPriorityIcon(taskPriority)}
        <span>{isTask ? (item as Task).title : (item as CalendarEvent).title}</span>
      </div>
      <div className="flex items-center text-xs opacity-75">
        <Clock className="h-3 w-3 mr-1" />
        <span>
          {format(new Date(start), 'HH:mm')} - {format(new Date(end), 'HH:mm')}
        </span>
      </div>
      
      {/* Resize handle for tasks */}
      {isTask && onResizeStart && (
        <div 
          className="resize-handle absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize"
          onMouseDown={(e) => onResizeStart(e, (item as Task).id)}
          title="Resize task"
        />
      )}
    </div>
  );
};

export default CalendarItem;
