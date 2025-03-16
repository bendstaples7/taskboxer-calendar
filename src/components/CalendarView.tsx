
import React, { useEffect, useState, useRef } from "react";
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
  minimized?: boolean;
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
  singleDayMode = false,
  minimized = false
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Calculate the start and end of the week/day based on the current mode
  const start = singleDayMode ? currentDate : startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = singleDayMode ? currentDate : endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = minimized && !singleDayMode ? [currentDate] : singleDayMode ? [currentDate] : eachDayOfInterval({ start, end });

  // Update the current time indicator and scroll position
  useEffect(() => {
    const updateTimeIndicator = () => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      setCurrentTimePosition(position);
      
      // Scroll to current time (offset by 200px to center it in viewport)
      if (scrollAreaRef.current) {
        const scrollPosition = Math.max(0, position - 200);
        scrollAreaRef.current.scrollTop = scrollPosition;
      }
    };

    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000); // update every minute
    
    // Force scroll to current time on initial render with a delay to ensure DOM is ready
    const scrollTimer = setTimeout(() => {
      updateTimeIndicator();
      if (scrollAreaRef.current) {
        const now = new Date();
        const hours = getHours(now);
        const minutes = getMinutes(now);
        const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
        const scrollPosition = Math.max(0, position - 200);
        scrollAreaRef.current.scrollTop = scrollPosition;
      }
    }, 300);
    
    return () => {
      clearInterval(interval);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Notify parent component when date changes
  useEffect(() => {
    if (onDateChange) {
      onDateChange(currentDate);
    }
  }, [currentDate, onDateChange]);

  // Add an additional useEffect to ensure scroll position is set after component is fully rendered
  useEffect(() => {
    const forceScrollToCurrentTime = () => {
      if (scrollAreaRef.current) {
        const now = new Date();
        const hours = getHours(now);
        const minutes = getMinutes(now);
        const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
        const scrollPosition = Math.max(0, position - 200);
        scrollAreaRef.current.scrollTop = scrollPosition;
      }
    };

    // Try multiple times to ensure it works
    forceScrollToCurrentTime();
    const timer1 = setTimeout(forceScrollToCurrentTime, 500);
    const timer2 = setTimeout(forceScrollToCurrentTime, 1000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [scrollAreaRef.current]);

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
    // Force scroll to current time when going to today
    setTimeout(() => {
      if (scrollAreaRef.current) {
        const now = new Date();
        const hours = getHours(now);
        const minutes = getMinutes(now);
        const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
        const scrollPosition = Math.max(0, position - 200);
        scrollAreaRef.current.scrollTop = scrollPosition;
      }
    }, 100);
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
          zIndex: 5, // Ensure calendar items are above time labels
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

  const renderMinimizedCalendar = () => {
    // For minimized view, we stack days vertically
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-semibold">
            {format(currentDate, 'MMMM d, yyyy')}
          </div>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={goToPreviousDay}
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
              onClick={goToNextDay}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1" ref={scrollAreaRef}>
          <div className="pb-4 mb-4 border-b">
            <div 
              className={cn(
                "p-2 text-center font-medium",
                isSameDay(currentDate, new Date()) && "bg-blue-100 rounded-t-md"
              )}
            >
              <div>{format(currentDate, 'EEE')}</div>
              <div>{format(currentDate, 'd')}</div>
            </div>
            
            <div className="relative border rounded-md mt-2 h-[1440px]">
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="border-t relative"
                  style={{ height: `${HOUR_HEIGHT}px` }}
                  onDragOver={(e) => handleDragOver(e, currentDate, hour)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, currentDate, hour)}
                >
                  <div className="absolute left-0 text-xs text-gray-400 -mt-2 ml-1" style={{ zIndex: 10 }}>
                    {hour}:00
                  </div>
                </div>
              ))}

              {/* Current time indicator */}
              {isSameDay(currentDate, new Date()) && (
                <div 
                  className="current-time-indicator"
                  style={{ top: `${currentTimePosition}px`, zIndex: 15 }}
                />
              )}

              {/* Tasks */}
              {getTasksForDay(currentDate).map(task => (
                renderCalendarItem(task, true)
              ))}

              {/* Events */}
              {getEventsForDay(currentDate).map(event => (
                renderCalendarItem(event, false)
              ))}
            </div>
          </div>
          
          {/* Additional days stacked vertically (only show if we want additional days) */}
          {minimized && false && [ // Disabled for now, can be enabled if showing more days in minimized mode is desired
            addDays(currentDate, 1),
            addDays(currentDate, 2),
          ].map((day) => (
            <div key={day.toString()} className="pb-4 mb-4 border-b">
              <div 
                className={cn(
                  "p-2 text-center font-medium",
                  isSameDay(day, new Date()) && "bg-blue-100 rounded-t-md"
                )}
              >
                <div>{format(day, 'EEE')}</div>
                <div>{format(day, 'd')}</div>
              </div>
              
              <div className="relative border rounded-md mt-2 h-[1440px]">
                {HOURS.map((hour) => (
                  <div 
                    key={hour} 
                    className="border-t relative"
                    style={{ height: `${HOUR_HEIGHT}px` }}
                    onDragOver={(e) => handleDragOver(e, day, hour)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, day, hour)}
                  >
                    <div className="absolute left-0 text-xs text-gray-400 -mt-2 ml-1" style={{ zIndex: 10 }}>
                      {hour}:00
                    </div>
                  </div>
                ))}

                {/* Current time indicator */}
                {isSameDay(day, new Date()) && (
                  <div 
                    className="current-time-indicator"
                    style={{ top: `${currentTimePosition}px`, zIndex: 15 }}
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
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRegularCalendar = () => {
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
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
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
                      <div className="absolute left-0 text-xs text-gray-400 -mt-2 ml-1" style={{ zIndex: 10 }}>
                        {hour}:00
                      </div>
                    </div>
                  ))}

                  {/* Current time indicator */}
                  {isSameDay(day, new Date()) && (
                    <div 
                      className="current-time-indicator"
                      style={{ top: `${currentTimePosition}px`, zIndex: 15 }}
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

  return minimized ? renderMinimizedCalendar() : renderRegularCalendar();
};

export default CalendarView;
