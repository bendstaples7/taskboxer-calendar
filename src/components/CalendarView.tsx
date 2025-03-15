
import React, { useEffect, useState } from "react";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  addDays, 
  getHours, 
  getMinutes, 
  set, 
  addMinutes,
  differenceInMinutes,
  parseISO
} from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, ArrowLeft, ArrowRight } from "lucide-react";
import { Task, CalendarEvent } from "@/lib/types";
import TaskTimer from "./TaskTimer";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onTaskUnschedule: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDropTask: (task: Task, startTime: Date) => void;
  onTaskClick?: (task: Task) => void;
  onDateChange?: (date: Date) => void;
  singleDayMode?: boolean;
}

const HOUR_HEIGHT = 60; // pixels per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onTaskUnschedule,
  onTaskComplete,
  onDropTask,
  onTaskClick,
  onDateChange,
  singleDayMode = false
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  
  // Calculate the start and end of the week/day based on the current mode
  const start = singleDayMode ? currentDate : startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = singleDayMode ? currentDate : endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = singleDayMode ? [currentDate] : eachDayOfInterval({ start, end });

  // Update the current time indicator
  useEffect(() => {
    const updateTimeIndicator = () => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      setCurrentTimePosition(hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT);
    };

    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000); // update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Notify parent component when date changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  const goToPreviousDay = () => {
    setCurrentDate(prev => addDays(prev, -1));
  };

  const goToNextDay = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const goToPreviousWeek = () => {
    setCurrentDate(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentDate(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    // Add visual indication for drop target
    e.currentTarget.classList.add('droppable-active');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('droppable-active');
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('droppable-active');
    
    try {
      const taskJson = e.dataTransfer.getData("application/json");
      if (taskJson) {
        const task = JSON.parse(taskJson) as Task;
        const startTime = set(day, { hours: hour, minutes: 0, seconds: 0 });
        onDropTask(task, startTime);
      }
    } catch (error) {
      console.error("Error parsing dropped task:", error);
    }
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter(task => 
      task.scheduled && 
      task.scheduled.start && 
      isSameDay(new Date(task.scheduled.start), day)
    );
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => 
      event.start && 
      isSameDay(new Date(event.start), day)
    );
  };

  const renderCalendarItem = (item: Task | CalendarEvent, isTask: boolean) => {
    const start = isTask 
      ? (item as Task).scheduled?.start as Date
      : (item as CalendarEvent).start;
    const end = isTask 
      ? (item as Task).scheduled?.end as Date
      : (item as CalendarEvent).end;

    if (!start || !end) return null;

    const startHour = getHours(new Date(start));
    const startMinute = getMinutes(new Date(start));
    const durationMinutes = differenceInMinutes(
      new Date(end),
      new Date(start)
    );
    
    const top = startHour * HOUR_HEIGHT + (startMinute / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return (
      <div
        key={isTask ? (item as Task).id : (item as CalendarEvent).id}
        className={cn(
          "absolute rounded-md px-2 py-1 overflow-hidden cursor-pointer text-xs",
          isTask ? "calendar-task" : "calendar-event",
          "left-1 right-1"
        )}
        style={{
          top: `${top}px`,
          height: `${height}px`,
        }}
        onClick={isTask && onTaskClick ? () => onTaskClick(item as Task) : undefined}
      >
        <div className="font-medium truncate">
          {isTask ? (item as Task).title : (item as CalendarEvent).title}
        </div>
        <div className="flex items-center text-xs opacity-75">
          <Clock className="h-3 w-3 mr-1" />
          <span>
            {format(new Date(start), 'HH:mm')} - {format(new Date(end), 'HH:mm')}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xl font-semibold">
          {singleDayMode 
            ? format(currentDate, 'MMMM d, yyyy') 
            : `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`
          }
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={singleDayMode ? goToPreviousDay : goToPreviousWeek}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            onClick={goToToday}
          >
            Today
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={singleDayMode ? goToNextDay : goToNextWeek}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className={cn(
        "grid gap-1",
        singleDayMode ? "grid-cols-1" : "grid-cols-7"
      )}>
        {days.map((day) => (
          <div 
            key={day.toString()} 
            className={cn(
              "p-2 text-center font-medium",
              isSameDay(day, new Date()) && "bg-blue-100 rounded-t-md"
            )}
          >
            <div>{format(day, 'EEE')}</div>
            <div>{format(day, 'd')}</div>
          </div>
        ))}
      </div>

      {/* Calendar body with a single scroll area */}
      <ScrollArea className="flex-1">
        <div className="flex-1 h-[1440px]"> {/* 24 hours × 60px = 1440px */}
          <div className={cn(
            "grid gap-1 h-full",
            singleDayMode ? "grid-cols-1" : "grid-cols-7"
          )}>
            {/* Day columns */}
            {days.map((day) => (
              <div 
                key={day.toString()} 
                className={cn(
                  "relative border rounded-md h-full",
                  singleDayMode && "w-full"
                )}
              >
                {HOURS.map((hour) => (
                  <div 
                    key={hour} 
                    className="border-t relative"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    onDragOver={(e) => handleDragOver(e, day, hour)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  >
                    <div className="absolute left-0 text-xs text-gray-400 -mt-2 ml-1">
                      {hour}:00
                    </div>
                  </div>
                ))}

                {/* Current time indicator */}
                {isSameDay(day, new Date()) && (
                  <div 
                    className="current-time-indicator"
                    style={{ top: `${currentTimePosition}px` }}
                  />
                )}

                {/* Tasks */}
                {getTasksForDay(day).map(task => (
                  renderCalendarItem(task, true)
                ))}

                {/* Events */}
                {getEventsForDay(day).map(event => (
                  renderCalendarItem(event, false)
                ))}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default CalendarView;
