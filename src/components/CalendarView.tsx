
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

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onTaskUnschedule: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDropTask: (task: Task, startTime: Date) => void;
}

const HOUR_HEIGHT = 60; // pixels per hour
const HOURS = Array.from({ length: 24 }, (_, i) => i);

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onTaskUnschedule,
  onTaskComplete,
  onDropTask
}) => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

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

  const goToPreviousWeek = () => {
    setCurrentWeek(prev => addDays(prev, -7));
  };

  const goToNextWeek = () => {
    setCurrentWeek(prev => addDays(prev, 7));
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
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
        onClick={isTask ? () => handleTaskClick(item as Task) : undefined}
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
          {format(start, 'MMM d')} - {format(end, 'MMM d, yyyy')}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={goToPreviousWeek}
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
            onClick={goToNextWeek}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
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

        {/* Day columns */}
        {days.map((day) => (
          <div 
            key={day.toString()} 
            className={cn(
              "relative border rounded-md overflow-hidden",
              "h-[600px] overflow-y-auto"
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

      {/* Task detail dialog */}
      <Dialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {selectedTask?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTask?.description && (
              <p className="text-sm text-muted-foreground">
                {selectedTask?.description}
              </p>
            )}
            
            {selectedTask?.scheduled && (
              <div className="text-sm">
                <div className="font-medium">Scheduled Time:</div>
                <div>
                  {selectedTask.scheduled.start && format(new Date(selectedTask.scheduled.start), 'PPp')} - 
                  {selectedTask.scheduled.end && format(new Date(selectedTask.scheduled.end), 'PPp')}
                </div>
              </div>
            )}
            
            <TaskTimer
              duration={selectedTask?.estimatedTime || 0}
              onComplete={() => {
                onTaskComplete(selectedTask?.id || '');
                setDialogOpen(false);
              }}
            />
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => {
                  onTaskUnschedule(selectedTask?.id || '');
                  setDialogOpen(false);
                }}
              >
                Return to Task Board
              </Button>
              <Button
                onClick={() => {
                  onTaskComplete(selectedTask?.id || '');
                  setDialogOpen(false);
                }}
              >
                Mark as Completed
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarView;
