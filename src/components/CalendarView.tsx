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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Task, CalendarEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

import CalendarHeader from "./calendar/CalendarHeader";
import CalendarDayHeader from "./calendar/CalendarDayHeader";
import CalendarTimeGrid from "./calendar/CalendarTimeGrid";
import CalendarItem from "./calendar/CalendarItem";
import CalendarTrashBin from "./calendar/CalendarTrashBin";
import CalendarPriorityDropZones from "./calendar/CalendarPriorityDropZones";
import AddTaskDialog from "./AddTaskDialog";

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
  onAddTask?: (task: Task) => void;
  availableLabels?: any[];
  onAddLabel?: (label: any) => void;
  onStartTask?: (taskId: string) => void;
}

const HOUR_HEIGHT = 60;
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
  onTaskResize,
  onAddTask,
  availableLabels = [],
  onAddLabel,
  onStartTask
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [currentTimePosition, setCurrentTimePosition] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [resizeStartY, setResizeStartY] = useState<number>(0);
  const [showTrashBin, setShowTrashBin] = useState<boolean>(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [creatingTask, setCreatingTask] = useState<boolean>(false);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragCurrentY, setDragCurrentY] = useState<number | null>(null);
  const [dragDay, setDragDay] = useState<Date | null>(null);
  const [newTaskDuration, setNewTaskDuration] = useState<number>(30);
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [createTaskStart, setCreateTaskStart] = useState<Date | null>(null);
  const [createTaskEnd, setCreateTaskEnd] = useState<Date | null>(null);
  const [mouseDownPosition, setMouseDownPosition] = useState<{x: number, y: number} | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  const start = singleDayMode ? currentDate : startOfWeek(currentDate, { weekStartsOn: 0 });
  const end = singleDayMode ? currentDate : endOfWeek(currentDate, { weekStartsOn: 0 });
  const days = minimized && !singleDayMode ? [currentDate] : singleDayMode ? [currentDate] : eachDayOfInterval({ start, end });

  useEffect(() => {
    const updateTimeIndicator = () => {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      setCurrentTimePosition(position);
    };

    updateTimeIndicator();
    const interval = setInterval(updateTimeIndicator, 60000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    // Always scroll to current time when component mounts
    if (scrollAreaRef.current) {
      handleScrollToCurrentTime();
    }
  }, []);

  useEffect(() => {
    const handleOrientationChange = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
    };

    window.addEventListener('resize', handleOrientationChange);
    handleOrientationChange();

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
    };
  }, []);

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
    handleScrollToCurrentTime();
  };

  const handleScrollToCurrentTime = () => {
    if (scrollAreaRef.current) {
      const now = new Date();
      const hours = getHours(now);
      const minutes = getMinutes(now);
      const position = hours * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT;
      const viewportHeight = scrollAreaRef.current.clientHeight;
      
      // Center the current time in the viewport
      const scrollPosition = Math.max(0, position - viewportHeight / 2);

      setIsScrolling(true);

      const startTime = performance.now();
      const startScrollTop = scrollAreaRef.current.scrollTop;
      const duration = 800;

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

  const handleCalendarDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!scrollAreaRef.current) return;

    const scrollArea = scrollAreaRef.current;
    const rect = scrollArea.getBoundingClientRect();
    const mouseY = e.clientY;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }

    if (mouseY > rect.bottom - 100) {
      scrollTimeoutRef.current = setTimeout(() => {
        scrollArea.scrollBy({
          top: 50,
          behavior: 'smooth'
        });
        handleCalendarDragOver(e);
      }, 100);
    } else if (mouseY < rect.top + 100) {
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

    const dragPreview = document.createElement("div");
    dragPreview.className = "task-card-preview";
    dragPreview.innerHTML = `<div class="p-2 bg-white border rounded shadow">${task.title}</div>`;
    document.body.appendChild(dragPreview);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";

    e.dataTransfer.setDragImage(dragPreview, 0, 0);

    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, day: Date, hour: number) => {
    e.preventDefault();
    e.currentTarget.classList.add('droppable-active');

    const calendarContainer = e.currentTarget.closest('.calendar-container');
    let dropIndicator = document.querySelector('.calendar-drop-indicator');

    if (!dropIndicator && calendarContainer) {
      dropIndicator = document.createElement('div');
      dropIndicator.className = 'calendar-drop-indicator';

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

      const minuteIncrement = 5;
      const segmentsPerHour = 60 / minuteIncrement;
      const segment = Math.floor((offsetY % HOUR_HEIGHT) / (HOUR_HEIGHT / segmentsPerHour));
      const minutes = segment * minuteIncrement;
      const segmentPosition = (segment / segmentsPerHour) * HOUR_HEIGHT;

      (dropIndicator as HTMLElement).style.top = `${Math.floor(hour * HOUR_HEIGHT + segmentPosition)}px`;
    }

    handleCalendarDragOver(e);
  };

  const handleResizeStart = (e: React.MouseEvent, taskId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    setResizingTaskId(taskId);
    setResizeStartY(e.clientY);

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (isResizing && resizingTaskId && onTaskResize) {
      const deltaY = e.clientY - resizeStartY;

      const minutesPerPixel = 1;
      const deltaMinutes = Math.round(deltaY * minutesPerPixel / 5) * 5;

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

    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('droppable-active');

    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      const dropIndicator = document.querySelector('.calendar-drop-indicator');
      if (dropIndicator) {
        dropIndicator.remove();
      }
    }
  };

  const handleDragEnd = () => {
    setShowTrashBin(false);
    setDraggedTaskId(null);

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

        const minuteIncrement = 5;
        const segmentsPerHour = 60 / minuteIncrement;
        const segment = Math.floor((offsetY % HOUR_HEIGHT) / (HOUR_HEIGHT / segmentsPerHour));
        const minutes = segment * minuteIncrement;

        const startTime = set(day, { hours: hour, minutes: minutes, seconds: 0 });
        onDropTask(task, startTime);
      }
    } catch (error) {
      console.error("Error parsing dropped task:", error);
    }

    setShowTrashBin(false);
  };

  const handleCalendarMouseDown = (e: React.MouseEvent, day: Date, hour: number) => {
    if (onAddTask) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const offsetY = e.clientY - rect.top;

      const minuteIncrement = 5;
      const segmentsPerHour = 60 / minuteIncrement;
      const segment = Math.floor((offsetY % HOUR_HEIGHT) / (HOUR_HEIGHT / segmentsPerHour));
      const minutes = segment * minuteIncrement;

      setDragStartY(hour * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT);
      setDragCurrentY(hour * HOUR_HEIGHT + (minutes / 60) * HOUR_HEIGHT);
      setDragDay(day);

      document.addEventListener('mousemove', handleCalendarMouseMove);
      document.addEventListener('mouseup', handleCalendarMouseUp);
    }
  };

  const handleCalendarMouseMove = (e: MouseEvent) => {
    if (dragStartY !== null && dragDay) {
      const calendarContainer = document.querySelector('.calendar-container');
      if (!calendarContainer) return;

      const rect = calendarContainer.getBoundingClientRect();
      const offsetY = e.clientY - rect.top + (calendarContainer as HTMLElement).scrollTop;

      setDragCurrentY(offsetY);

      let createTaskIndicator = document.querySelector('.create-task-indicator') as HTMLElement;

      if (!createTaskIndicator) {
        createTaskIndicator = document.createElement('div');
        createTaskIndicator.className = 'create-task-indicator';
        createTaskIndicator.style.position = 'absolute';
        createTaskIndicator.style.backgroundColor = 'rgba(155, 135, 245, 0.3)';
        createTaskIndicator.style.border = '2px dashed #9b87f5';
        createTaskIndicator.style.borderRadius = '4px';
        createTaskIndicator.style.zIndex = '50';
        createTaskIndicator.style.pointerEvents = 'none';
        createTaskIndicator.style.left = '5px';
        createTaskIndicator.style.width = 'calc(100% - 10px)';
        calendarContainer.appendChild(createTaskIndicator);
      }

      const top = Math.min(dragStartY, offsetY);
      const height = Math.abs(offsetY - dragStartY);

      createTaskIndicator.style.top = `${top}px`;
      createTaskIndicator.style.height = `${height}px`;

      const durationMinutes = Math.max(15, Math.round(height));
      setNewTaskDuration(durationMinutes);
    }
  };

  const handleCalendarMouseUp = () => {
    document.removeEventListener('mousemove', handleCalendarMouseMove);
    document.removeEventListener('mouseup', handleCalendarMouseUp);

    if (dragStartY !== null && dragCurrentY !== null && dragDay) {
      const height = Math.abs(dragCurrentY - dragStartY);
      const durationMinutes = Math.max(15, Math.round(height));

      const startY = Math.min(dragStartY, dragCurrentY);
      const hourStart = Math.floor(startY / HOUR_HEIGHT);
      const minuteStart = Math.round((startY % HOUR_HEIGHT) / HOUR_HEIGHT * 60 / 5) * 5;

      setNewTaskDuration(durationMinutes);
      setCreatingTask(true);

      const indicator = document.querySelector('.create-task-indicator');
      if (indicator) {
        indicator.remove();
      }
    }

    setDragStartY(null);
    setDragCurrentY(null);
  };

  const handleAddNewTask = (task: Task) => {
    if (onAddTask && dragDay) {
      const startY = Math.min(dragStartY || 0, dragCurrentY || 0);
      const hourStart = Math.floor(startY / HOUR_HEIGHT);
      const minuteStart = Math.round((startY % HOUR_HEIGHT) / HOUR_HEIGHT * 60 / 5) * 5;

      const startTime = set(dragDay, { hours: hourStart, minutes: minuteStart, seconds: 0 });
      const endTime = addMinutes(startTime, task.estimatedTime);

      const scheduledTask = {
        ...task,
        scheduled: {
          start: startTime,
          end: endTime
        }
      };

      onAddTask(scheduledTask);
    }

    setCreatingTask(false);
    setDragDay(null);
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

  const renderMinimizedCalendar = () => {
    return (
      <div className="flex flex-col h-full">
        <CalendarHeader
          currentDate={currentDate}
          start={start}
          end={end}
          singleDayMode={singleDayMode}
          goToPreviousDay={goToPreviousDay}
          goToNextDay={goToNextDay}
          goToPreviousWeek={goToPreviousWeek}
          goToNextWeek={goToNextWeek}
          goToToday={goToToday}
        />

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

            <div className="relative border rounded-md mt-2 h-[1440px]" 
                 onMouseDown={(e) => handleCalendarMouseDown(e, currentDate, Math.floor(e.nativeEvent.offsetY / HOUR_HEIGHT))}>
              {HOURS.map((hour) => (
                <CalendarTimeGrid 
                  key={hour} 
                  hour={hour}
                  onDragOver={(e) => handleDragOver(e, currentDate, hour)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, currentDate, hour)}
                />
              ))}

              {isSameDay(currentDate, new Date()) && (
                <div 
                  className="current-time-indicator"
                  style={{ top: `${currentTimePosition}px`, zIndex: 15 }}
                />
              )}

              {Object.entries(groupTasksByTime(getTasksForDay(currentDate))).map(([timeKey, tasksAtTime]) => 
                tasksAtTime.map((task, index) => (
                  <CalendarItem
                    key={task.id}
                    item={task}
                    isTask={true}
                    index={index}
                    totalItems={tasksAtTime.length}
                    resizingTaskId={resizingTaskId}
                    isResizing={isResizing}
                    onTaskClick={onTaskClick}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onResizeStart={handleResizeStart}
                    onStartTask={onStartTask}
                  />
                ))
              )}

              {getEventsForDay(currentDate).map((event, index) => (
                <CalendarItem
                  key={event.id}
                  item={event}
                  isTask={false}
                  index={index}
                  totalItems={1}
                  resizingTaskId={null}
                  isResizing={false}
                />
              ))}
            </div>
          </div>
        </div>

        <CalendarPriorityDropZones 
          visible={!!onTaskDragToBoard && !minimized}
          onDragOver={handleDragOverPriorityColumn}
          onDragLeave={handleDragLeavePriorityColumn}
          onDrop={handleDropOnPriorityColumn}
        />

        <CalendarTrashBin 
          showTrashBin={showTrashBin}
          onDragOver={handleDragOverTrash}
          onDragLeave={handleDragLeaveTrash}
          onDrop={handleDropOnTrash}
        />

        {creatingTask && (
          <AddTaskDialog
            open={creatingTask}
            onOpenChange={(open) => !open && setCreatingTask(false)}
            onAddTask={handleAddNewTask}
            availableLabels={availableLabels}
            onAddLabel={onAddLabel || (() => {})}
            initialPriority={newTaskPriority}
            initialDuration={newTaskDuration}
          />
        )}
      </div>
    );
  };

  const renderRegularCalendar = () => {
    return (
      <div className="flex flex-col h-full">
        <CalendarHeader
          currentDate={currentDate}
          start={start}
          end={end}
          singleDayMode={singleDayMode}
          goToPreviousDay={goToPreviousDay}
          goToNextDay={goToNextDay}
          goToPreviousWeek={goToPreviousWeek}
          goToNextWeek={goToNextWeek}
          goToToday={goToToday}
        />

        <CalendarDayHeader 
          days={days}
          singleDayMode={singleDayMode}
        />

        <ScrollArea className={`flex-1 calendar-container ${isScrolling ? 'smooth-scroll' : ''}`} ref={scrollAreaRef}>
          <div className="flex-1 h-[1440px]">
            <div className={cn(
              "grid gap-1 h-full",
              singleDayMode ? "grid-cols-1" : "grid-cols-7"
            )}>
              {days.map((day) => (
                <div 
                  key={day.toString()} 
                  className={cn(
                    "relative border rounded-md h-full",
                    singleDayMode && "w-full"
                  )}
                  onMouseDown={(e) => handleCalendarMouseDown(e, day, Math.floor(e.nativeEvent.offsetY / HOUR_HEIGHT))}
                >
                  {HOURS.map((hour) => (
                    <CalendarTimeGrid 
                      key={hour} 
                      hour={hour}
                      onDragOver={(e) => handleDragOver(e, day, hour)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, hour)}
                    />
                  ))}

                  {isSameDay(day, new Date()) && (
                    <div 
                      className="current-time-indicator"
                      style={{ top: `${currentTimePosition}px`, zIndex: 15 }}
                    />
                  )}

                  {Object.entries(groupTasksByTime(getTasksForDay(day))).map(([timeKey, tasksAtTime]) => 
                    tasksAtTime.map((task, index) => (
                      <CalendarItem
                        key={task.id}
                        item={task}
                        isTask={true}
                        index={index}
                        totalItems={tasksAtTime.length}
                        resizingTaskId={resizingTaskId}
                        isResizing={isResizing}
                        onTaskClick={onTaskClick}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onResizeStart={handleResizeStart}
                        onStartTask={onStartTask}
                      />
                    ))
                  )}

                  {getEventsForDay(day).map((event, index) => (
                    <CalendarItem
                      key={event.id}
                      item={event}
                      isTask={false}
                      index={index}
                      totalItems={1}
                      resizingTaskId={null}
                      isResizing={false}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>

        <CalendarPriorityDropZones 
          visible={!!onTaskDragToBoard && !minimized}
          onDragOver={handleDragOverPriorityColumn}
          onDragLeave={handleDragLeavePriorityColumn}
          onDrop={handleDropOnPriorityColumn}
        />

        <CalendarTrashBin 
          showTrashBin={showTrashBin}
          onDragOver={handleDragOverTrash}
          onDragLeave={handleDragLeaveTrash}
          onDrop={handleDropOnTrash}
        />

        {creatingTask && (
          <AddTaskDialog
            open={creatingTask}
            onOpenChange={(open) => !open && setCreatingTask(false)}
            onAddTask={handleAddNewTask}
            availableLabels={availableLabels}
            onAddLabel={onAddLabel || (() => {})}
            initialPriority={newTaskPriority}
            initialDuration={newTaskDuration}
          />
        )}
      </div>
    );
  };

  const handleMouseDown = (e: React.MouseEvent, hour: number) => {
    if (e.button !== 0) return;
    if (isResizing) return;

    const calendarRect = calendarRef.current?.getBoundingClientRect();
    if (!calendarRect) return;

    const offsetY = e.clientY - calendarRect.top;
    const minute = Math.floor(offsetY % HOUR_HEIGHT / (HOUR_HEIGHT / 60));
    const roundedMinute = Math.round(minute / 5) * 5;

    const startDateTime = new Date(currentDate);
    startDateTime.setHours(hour, roundedMinute, 0, 0);

    setCreateTaskStart(startDateTime);
    setIsCreatingTask(true);
    setMouseDownPosition({x: e.clientX, y: e.clientY});

    setCreateTaskEnd(new Date(startDateTime));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isCreatingTask || !createTaskStart || !mouseDownPosition || !calendarRef.current) return;

    const calendarRect = calendarRef.current.getBoundingClientRect();
    const offsetY = e.clientY - calendarRect.top;

    const hour = Math.floor(offsetY / HOUR_HEIGHT);
    const minute = Math.floor((offsetY % HOUR_HEIGHT) / (HOUR_HEIGHT / 60));
    const roundedMinute = Math.round(minute / 5) * 5;

    const endDateTime = new Date(currentDate);
    endDateTime.setHours(hour, roundedMinute, 0, 0);

    if (endDateTime < createTaskStart) {
      endDateTime.setTime(createTaskStart.getTime());
    }

    setCreateTaskEnd(endDateTime);
  };

  const handleMouseUp = () => {
    if (isCreatingTask && createTaskStart && createTaskEnd) {
      const durationMinutes = Math.max(
        5,
        Math.round((createTaskEnd.getTime() - createTaskStart.getTime()) / (1000 * 60))
      );

      const finalDuration = durationMinutes < 5 ? 30 : durationMinutes;

      const newTask: Partial<Task> = {
        title: "New Task",
        description: "",
        priority: "medium",
        estimatedTime: finalDuration,
        labels: [],
        scheduled: {
          start: createTaskStart,
          end: new Date(createTaskStart.getTime() + finalDuration * 60 * 1000)
        }
      };

      if (onAddTask) {
        onAddTask(newTask as Task);
      }
    }

    setIsCreatingTask(false);
    setCreateTaskStart(null);
    setCreateTaskEnd(null);
    setMouseDownPosition(null);
  };

  const timeGrids = HOURS.map((hour) => hour);

  return minimized ? renderMinimizedCalendar() : renderRegularCalendar();
};

export default CalendarView;
