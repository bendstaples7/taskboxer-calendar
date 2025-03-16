
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
import { Clock, ArrowLeft, ArrowRight, Trash } from "lucide-react";
import { Task, CalendarEvent } from "@/lib/types";
import TaskTimer from "./TaskTimer";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Set document title to match the app name
document.title = "shinkō";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onTaskUnschedule: (taskId: string) => void;
  onTaskComplete: (taskId: string) => void;
  onDropTask: (task: Task, startTime: Date) => void;
  onTaskClick?: (task: Task) => void;
  onDateChange?: (date: Date) => void;
  onTaskDelete?: (taskId: string) => void;
  singleDayMode?: boolean;
  minimized?: boolean;
  scrollToCurrentTime?: boolean;
  onTaskDragToBoard?: (taskId: string, newPriority: string) => void;
  onTaskResize?: (taskId: string, newDuration: number) => void;
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
  onTaskDelete,
  singleDayMode = false,
  minimized = false,
  scrollToCurrentTime = true,
  onTaskDragToBoard,
  onTaskResize
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [showTrashBin, setShowTrashBin] = useState<boolean>(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    };

    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000); // update every minute
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Auto scroll to current time on initial render with smooth animation
  useEffect(() => {
    if (scrollToCurrentTime && scrollAreaRef.current) {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      // Position current time in middle of viewport
      const viewportHeight = scrollAreaRef.current.clientHeight;
      const scrollPosition = Math.max(0, position - viewportHeight / 2);
      
      // Use smooth scrolling for a better UX
      setIsScrolling(true);
      
      // Animate the scroll using requestAnimationFrame for smoother effect
      const startTime = performance.now();
      const startScrollTop = scrollAreaRef.current.scrollTop;
      const duration = 800; // ms
      
      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = startScrollTop + (scrollPosition - startScrollTop) * easeInOutCubic;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setTimeout(() => setIsScrolling(false), 100);
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
  }, [scrollToCurrentTime]);

  // Detect device orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      // You can add logic here to change default view based on orientation
    };

    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange(); // Check on initial render

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
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
    // Force scroll to current time when going to today
    handleScrollToCurrentTime();
  };

  const handleScrollToCurrentTime = () => {
    if (scrollAreaRef.current) {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      // Position current time in middle of viewport
      const viewportHeight = scrollAreaRef.current.clientHeight;
      const scrollPosition = Math.max(0, position - viewportHeight / 2);
      
      // Use smooth scrolling
      setIsScrolling(true);
      
      const startTime = performance.now();
      const startScrollTop = scrollAreaRef.current.scrollTop;
      const duration = 800; // ms
      
      const animateScroll = (currentTime: number) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);
        const easeInOutCubic = progress < 0.5 
          ? 4 * progress * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
          
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = startScrollTop + (scrollPosition - startScrollTop) * easeInOutCubic;
        }
        
        if (progress < 1) {
          requestAnimationFrame(animateScroll);
        } else {
          setTimeout(() => setIsScrolling(false), 100);
        }
      };
      
      requestAnimationFrame(animateScroll);
    }
  };

  // Auto-scroll on drag near edges
  const handleCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!scrollAreaRef.current) return;
    
    const scrollArea = scrollAreaRef.current;
    const rect = scrollArea.getBoundingClientRect();
    const mouseY = e.clientY;
    
    // Clear any existing scrolling timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
    
    // Auto-scroll when near bottom edge
    if (mouseY > rect.bottom - 100) {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollArea.scrollBy({
          top: 50,
          behavior: 'smooth'
        });
        handleCalendarDragOver(e);
      }, 100);
    }
    // Auto-scroll when near top edge
    else if (mouseY < rect.top + 100) {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollArea.scrollBy({
          top: -50,
          behavior: 'smooth'
        });
        handleCalendarDragOver(e);
      }, 100);
    }
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("from", "calendar");
    e.dataTransfer.effectAllowed = "move";
    
    setDraggedTaskId(task.id);
    setShowTrashBin(true);
    
    // Create a ghost image for drag preview
    const dragPreview = document.createElement("div");
    dragPreview.className = "task-card-preview";
    dragPreview.innerHTML = `<div class="p-2 bg-white border rounded shadow">${task.title}</div>`;
    document.body.appendChild(dragPreview);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";
    
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    
    // Remove the ghost element after a delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.currentTarget.classList.add('droppable-active');
    
    // Create or update drop indicator
    const calendarContainer = e.currentTarget.closest('.calendar-container');
    let dropIndicator = document.querySelector('.calendar-drop-indicator');
    
    if (!dropIndicator && calendarContainer) {
      dropIndicator = document.createElement('div');
      dropIndicator.className = 'calendar-drop-indicator';
      
      // Type assertion for all style property accesses
      const dropIndicatorElement = dropIndicator as HTMLElement;
      dropIndicatorElement.style.position = 'absolute';
      dropIndicatorElement.style.height = '2px';
      dropIndicatorElement.style.backgroundColor = '#9b87f5';
      dropIndicatorElement.style.width = 'calc(100% - 10px)';
      dropIndicatorElement.style.zIndex = '100';
      dropIndicatorElement.style.pointerEvents = 'none';
      dropIndicatorElement.style.left = '5px';
      
      calendarContainer.appendChild(dropIndicator);
    }
    
    if (dropIndicator) {
      const rect = e.currentTarget.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      const hourOffset = Math.floor(offsetY / HOUR_HEIGHT);
      const minuteOffset = (offsetY % HOUR_HEIGHT) / HOUR_HEIGHT * 60;
      
      // Position indicator at the mouse position - Fix: Add HTMLElement type assertion
      (dropIndicator as HTMLElement).style.top = `${Math.floor(hour * HOUR_HEIGHT + (offsetY % HOUR_HEIGHT))}px`;
    }
    
    // Handle auto-scrolling
    handleCalendarDragOver(e);
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingTaskId(taskId);
    setResizeStartY(e.clientY);
    
    // Add global event listeners for mouse move and up
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };
  
  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && resizingTaskId && onTaskResize) {
      const deltaY = e.clientY - resizeStartY;
      const deltaMinutes = Math.round((deltaY / HOUR_HEIGHT) * 60);
      
      const task = tasks.find(t => t.id === resizingTaskId);
      if (task) {
        const newDuration = Math.max(15, task.estimatedTime + deltaMinutes);
        onTaskResize(resizingTaskId, newDuration);
        setResizeStartY(e.clientY);
      }
    }
  };
  
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizingTaskId(null);
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('droppable-active');
    
    // Check if we're leaving the calendar container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      // Remove drop indicator
      const dropIndicator = document.querySelector('.calendar-drop-indicator');
      if (dropIndicator) {
        dropIndicator.remove();
      }
    }
  };

  const handleDragEnd = () => {
    setShowTrashBin(false);
    setDraggedTaskId(null);
    
    // Clear any scrolling timeout
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

  const handleDragOverPriorityColumn = (e: React.DragEvent, priority: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('droppable-active');
  };

  const handleDragLeavePriorityColumn = (e: React.DragEvent) => {
    e.stopPropagation();
    e.currentTarget.classList.remove('droppable-active');
  };

  const handleDragOverTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('trash-active');
  };
  
  const handleDragLeaveTrash = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('trash-active');
  };
  
  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('trash-active');
    setShowTrashBin(false);
    
    if (onTaskDelete) {
      try {
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
          onTaskDelete(taskId);
        }
      } catch (error) {
        console.error("Error handling task drop on trash:", error);
      }
    }
  };

  const handleDropOnPriorityColumn = (e: React.DragEvent, priority: string) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('droppable-active');
    
    if (onTaskDragToBoard) {
      try {
        const taskId = e.dataTransfer.getData("taskId");
        const fromSource = e.dataTransfer.getData("from");
        
        if (fromSource === "calendar" && taskId) {
          onTaskDragToBoard(taskId, priority);
        }
      } catch (error) {
        console.error("Error handling task drop on priority column:", error);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('droppable-active');
    
    // Remove drop indicator
    const dropIndicator = document.querySelector('.calendar-drop-indicator');
    if (dropIndicator) {
      dropIndicator.remove();
    }
    
    try {
      const taskJson = e.dataTransfer.getData("application/json");
      if (taskJson) {
        const task = JSON.parse(taskJson) as Task;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const minuteOffset = Math.floor((offsetY % HOUR_HEIGHT) / HOUR_HEIGHT * 60);
        
        // Set the start time to the exact position where the task was dropped
        const startTime = set(day, { hours: hour, minutes: minuteOffset, seconds: 0 });
        onDropTask(task, startTime);
      }
    } catch (error) {
      console.error("Error parsing dropped task:", error);
    }
    
    setShowTrashBin(false);
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

  // Group tasks by time to handle multiple tasks at the same time
  const groupTasksByTime = (tasks: Task[]): Record<string, Task[]> => {
    const groupedTasks: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.scheduled) {
        const startHour = getHours(new Date(task.scheduled.start));
        const startMinute = getMinutes(new Date(task.scheduled.start));
        const timeKey = `${startHour}:${startMinute}`;
        
        if (!groupedTasks[timeKey]) {
          groupedTasks[timeKey] = [];
        }
        
        groupedTasks[timeKey].push(task);
      }
    });
    
    return groupedTasks;
  };

  const renderCalendarItem = (item: Task | CalendarEvent, isTask: boolean, index: number, totalItems: number) => {
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

    return (
      <div
        key={isTask ? (item as Task).id : (item as CalendarEvent).id}
        className={cn(
          "absolute rounded-md px-2 py-1 overflow-hidden cursor-pointer text-xs",
          isTask ? "calendar-task" : "calendar-event",
          isRunning && "animate-pulse bg-purple-500 border-purple-700",
          isCompleted && "bg-green-400 border-green-600 opacity-70",
          isTask && (item as Task).id === resizingTaskId && "resize-active"
        )}
        style={{
          top: `${top}px`,
          height: `${height}px`,
          zIndex: 5, // Ensure calendar items are above time labels
          width: itemWidth,
          left: leftOffset,
          cursor: isResizing && (item as Task).id === resizingTaskId ? 'ns-resize' : 'grab'
        }}
        onClick={isTask && onTaskClick ? () => onTaskClick(item as Task) : undefined}
        draggable={isTask && !isResizing}
        onDragStart={isTask && !isResizing ? (e) => handleDragStart(e, item as Task) : undefined}
        onDragEnd={handleDragEnd}
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
        
        {/* Resize handle for tasks */}
        {isTask && (
          <div 
            className="resize-handle"
            onMouseDown={(e) => handleResizeStart(e, (item as Task).id)}
            title="Resize task"
          />
        )}
      </div>
    );
  };

  const renderTrashBin = () => {
    if (!showTrashBin || !onTaskDelete) return null;
    
    return (
      <div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300"
        style={{ 
          width: '60px', 
          height: '60px',
          opacity: showTrashBin ? 1 : 0,
          transform: showTrashBin ? 'translate(-50%, 0)' : 'translate(-50%, 100px)'
        }}
        onDragOver={handleDragOverTrash}
        onDragLeave={handleDragLeaveTrash}
        onDrop={handleDropOnTrash}
      >
        <Trash className="h-6 w-6" />
      </div>
    );
  };

  const renderPriorityDropZones = () => {
    if (!onTaskDragToBoard || minimized) return null;
    
    const priorities = ['low', 'medium', 'high', 'critical'];
    
    return (
      <div className="fixed top-20 right-6 flex flex-col space-y-2 z-50 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
        {priorities.map(priority => (
          <div 
            key={priority}
            className={`w-24 h-12 rounded border-2 flex items-center justify-center text-xs font-medium ${
              priority === 'low' ? 'border-blue-500 bg-blue-100' : 
              priority === 'medium' ? 'border-green-500 bg-green-100' : 
              priority === 'high' ? 'border-orange-500 bg-orange-100' : 
              'border-red-500 bg-red-100'
            }`}
            onDragOver={(e) => handleDragOverPriorityColumn(e, priority)}
            onDragLeave={handleDragLeavePriorityColumn}
            onDrop={(e) => handleDropOnPriorityColumn(e, priority)}
          >
            {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </div>
        ))}
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
              className="bg-gray-200 text-gray-900 hover:bg-gray-300"
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
        
        <div className="overflow-y-auto flex-1 calendar-container" ref={scrollAreaRef}>
          <div className="pb-4 mb-4 border-b">
            <div 
              className={cn(
                "p-2 text-center font-medium",
                isSameDay(currentDate, new Date()) && "bg-gray-200 rounded-t-md"
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

              {/* Render tasks grouped by time */}
              {Object.entries(groupTasksByTime(getTasksForDay(currentDate))).map(([timeKey, tasksAtTime]) => 
                tasksAtTime.map((task, index) => renderCalendarItem(task, true, index, tasksAtTime.length))
              )}

              {/* Events */}
              {getEventsForDay(currentDate).map((event, index) => (
                renderCalendarItem(event, false, index, 1)
              ))}
            </div>
          </div>
        </div>
        
        {renderPriorityDropZones()}
        {renderTrashBin()}
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
              className="bg-gray-200 text-gray-900 hover:bg-gray-300"
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
                isSameDay(day, new Date()) && "bg-gray-200 rounded-t-md"
              )}
            >
              <div>{format(day, 'EEE')}</div>
              <div>{format(day, 'd')}</div>
            </div>
          ))}
        </div>

        {/* Calendar body with a single scroll area */}
        <ScrollArea className={`flex-1 calendar-container ${isScrolling ? 'smooth-scroll' : ''}`} ref={scrollAreaRef}>
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

                  {/* Render tasks grouped by time */}
                  {Object.entries(groupTasksByTime(getTasksForDay(day))).map(([timeKey, tasksAtTime]) => 
                    tasksAtTime.map((task, index) => renderCalendarItem(task, true, index, tasksAtTime.length))
                  )}

                  {/* Events */}
                  {getEventsForDay(day).map((event, index) => (
                    renderCalendarItem(event, false, index, 1)
                  )}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
        
        {renderPriorityDropZones()}
        {renderTrashBin()}
      </div>
    );
  };

  return minimized ? renderMinimizedCalendar() : renderRegularCalendar();
};

export default CalendarView;
