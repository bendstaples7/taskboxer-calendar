import React, { useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  getHours,
  getMinutes,
  differenceInMinutes,
  isSameDay,
  isSameMinute,
  isToday,
  setHours,
  setMinutes,
} from "date-fns";
import { Task, CalendarEvent } from "@/lib/types";
import CalendarItem from "./calendar/CalendarItem";
import { useDrop, useDragLayer } from "react-dnd";
import TrashCanOverlay from "./TrashCanOverlay";
import { archiveTask } from "@/services/taskService";
import { useToast } from "@/hooks/use-toast";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onTaskDrop?: (task: Task, newStart: Date) => void;
  scrollToCurrentTime?: boolean;
  minimized?: boolean;
  singleDayMode?: boolean;
}

const MINUTES = Array.from({ length: 1440 }, (_, i) => i);
const MINUTE_HEIGHT = 1;
const TOTAL_SCROLLABLE_HEIGHT = 1440;

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onDateChange,
  onEventClick,
  onTaskDrop,
  scrollToCurrentTime,
  minimized,
  singleDayMode = false,
}) => {
  const today = new Date();
  const startOfThisWeek = useMemo(() => startOfWeek(today, { weekStartsOn: 0 }), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i)), [startOfThisWeek]);
  const days = singleDayMode ? [today] : weekDays;

  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { isDragging } = useDragLayer((monitor) => ({
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    if (scrollToCurrentTime && scrollRef.current) {
      const now = new Date();
      const scrollMinute = Math.max(now.getHours() * 60 + now.getMinutes() - 60, 6 * 60);
      scrollRef.current.scrollTop = scrollMinute * MINUTE_HEIGHT;
    }
  }, [scrollToCurrentTime]);

  const isAllDayEvent = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      isSameMinute(end, new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59))
    );
  };

  const getTopOffset = (date: Date) => {
    return (date.getHours() * 60 + date.getMinutes()) * MINUTE_HEIGHT;
  };

  const getHeight = (start: Date, end: Date) => {
    return Math.max(differenceInMinutes(end, start), 1) * MINUTE_HEIGHT;
  };

  const getEventsForDay = (day: Date) =>
    events.filter(event => event.start && event.end && isSameDay(new Date(event.start), day) && !isAllDayEvent(event));

  const getAllDayEventsForDay = (day: Date) =>
    events.filter(event => event.start && event.end && isSameDay(new Date(event.start), day) && isAllDayEvent(event));

  const getTasksForDay = (day: Date) =>
    tasks.filter(task => task.scheduled?.start && isSameDay(new Date(task.scheduled.start), day));

  const now = new Date();
  const currentDayIndex = days.findIndex(d => isSameDay(d, now));
  const currentTopOffset = getTopOffset(now);

  const handleArchiveDrop = async (task: Task) => {
    const success = await archiveTask(task.id);
    if (success) {
      toast({
        title: "Task Archived",
        description: `"${task.title}" has been archived.`,
      });
    } else {
      toast({
        title: "Archive Failed",
        description: `There was a problem archiving "${task.title}".`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Header row */}
      <div className="flex w-full sticky top-0 z-30 bg-white border-b pr-[16px]">
        <div className="w-[60px] flex-shrink-0 bg-gray-50 border-r border-gray-200" />
        <div className={`flex-1 grid ${singleDayMode ? "grid-cols-1" : "grid-cols-7"}`}>
          {days.map((day, index) => (
            <div
              key={index}
              className={`h-[40px] border-r border-b px-2 py-1 text-sm font-medium cursor-pointer ${
                isToday(day) ? "bg-blue-100 text-blue-700" : "bg-white"
              }`}
              onClick={() => onDateChange?.(day)}
            >
              {format(day, "EEE, MMM d")}
            </div>
          ))}
        </div>
      </div>

      {/* All-day row */}
      <div className="flex w-full sticky top-[40px] z-20 bg-white border-b pr-[16px]">
        <div className="w-[60px] flex-shrink-0 bg-gray-50 border-r text-xs text-center py-2 font-medium border-b border-gray-200">
          All-day
        </div>
        <div className={`flex-1 grid ${singleDayMode ? "grid-cols-1" : "grid-cols-7"}`}>
          {days.map((day, index) => (
            <div key={index} className="border-r px-1 h-[48px]">
              {getAllDayEventsForDay(day).map(event => (
                <div
                  key={`allday-${event.id}`}
                  className="bg-green-300 text-xs text-black rounded px-1 py-0.5 border border-green-500 truncate cursor-pointer"
                  onClick={() => onEventClick?.(event)}
                >
                  {event.title}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable time grid */}
      <div className="flex w-full h-full overflow-auto relative" ref={scrollRef}>
        {/* Time column */}
        <div className="w-[60px] flex-shrink-0 text-xs text-gray-500 bg-white border-r border-gray-200">
          <div className="flex flex-col" style={{ height: TOTAL_SCROLLABLE_HEIGHT }}>
            {Array.from({ length: 24 }, (_, hour) => (
              <div
                key={hour}
                className="h-[60px] border-b border-gray-200 flex items-center justify-end pr-1"
              >
                {hour % 12 === 0 ? 12 : hour % 12}
                {hour < 12 ? "am" : "pm"}
              </div>
            ))}
          </div>
        </div>

        {/* Divider line inside scroll area */}
        <div className="absolute left-[60px] top-[88px] w-px bg-gray-300" style={{ height: TOTAL_SCROLLABLE_HEIGHT }} />

        {/* Main grid */}
        <div
          className={`grid ${singleDayMode ? "grid-cols-1" : "grid-cols-7"} w-full relative`}
          style={{ height: TOTAL_SCROLLABLE_HEIGHT }}
        >
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200">
              {MINUTES.map((minute) => {
                const hour = Math.floor(minute / 60);
                const minuteOfHour = minute % 60;
                const dropStart = setMinutes(setHours(day, hour), minuteOfHour);
                const isHourLine = minuteOfHour === 0;

                const [{ isOver, canDrop }, drop] = useDrop({
                  accept: ["TASK", "CALENDAR_TASK"],
                  drop: (item: any) => {
                    if (item?.task && onTaskDrop) {
                      onTaskDrop(item.task, dropStart);
                    }
                  },
                  collect: (monitor) => ({
                    isOver: monitor.isOver({ shallow: true }),
                    canDrop: monitor.canDrop(),
                  }),
                });

                return (
                  <div
                    ref={drop}
                    key={minute}
                    className={`h-[1px] ${isHourLine ? "border-b border-gray-200" : ""}`}
                  >
                    {isOver && canDrop && (
                      <div className="h-2 -mt-1 w-full bg-blue-500 shadow-md rounded transition-all duration-75 opacity-80" />
                    )}
                  </div>
                );
              })}

              {getEventsForDay(day).map((event, i) => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                return (
                  <div
                    key={`event-${event.id}`}
                    className="absolute left-1 right-1 px-1"
                    style={{
                      top: getTopOffset(start),
                      height: getHeight(start, end),
                    }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <CalendarItem
                      item={event}
                      isTask={false}
                      index={i}
                      totalItems={1}
                      resizingTaskId={null}
                      isResizing={false}
                    />
                  </div>
                );
              })}

              {getTasksForDay(day).map((task, i) => {
                const start = new Date(task.scheduled.start);
                const end = new Date(task.scheduled.end);
                return (
                  <div
                    key={`task-${task.id}`}
                    className="absolute left-1 right-1 px-1"
                    style={{
                      top: getTopOffset(start),
                      height: getHeight(start, end),
                    }}
                  >
                    <CalendarItem
                      item={task}
                      isTask={true}
                      index={i}
                      totalItems={1}
                      resizingTaskId={null}
                      isResizing={false}
                    />
                  </div>
                );
              })}

              {currentDayIndex === dayIndex && (
                <div
                  className="current-time-indicator"
                  style={{ top: currentTopOffset }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <TrashCanOverlay visible={isDragging} onDropTask={handleArchiveDrop} />
    </div>
  );
};

export default CalendarView;
