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
} from "date-fns";
import { Task, CalendarEvent } from "@/lib/types";
import CalendarItem from "./calendar/CalendarItem";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onDateChange?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  scrollToCurrentTime?: boolean;
  minimized?: boolean;
  singleDayMode?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60;

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onDateChange,
  onEventClick,
  scrollToCurrentTime,
  minimized,
  singleDayMode = false,
}) => {
  const startOfThisWeek = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i)), [startOfThisWeek]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToCurrentTime && scrollRef.current) {
      const now = new Date();
      const scrollHour = Math.max(now.getHours() - 1, 6);
      scrollRef.current.scrollTop = scrollHour * HOUR_HEIGHT;
    }
  }, [scrollToCurrentTime]);

  const getEventsForDay = (day: Date) =>
    events.filter((event) => {
      if (!event.start || !event.end) return false;
      const start = new Date(event.start);
      const end = new Date(event.end);
      return isSameDay(start, day) && !isAllDayEvent(event);
    });

  const getAllDayEventsForDay = (day: Date) =>
    events.filter((event) => {
      if (!event.start || !event.end) return false;
      return isSameDay(new Date(event.start), day) && isAllDayEvent(event);
    });

  const isAllDayEvent = (event: CalendarEvent) => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    return (
      start.getHours() === 0 &&
      start.getMinutes() === 0 &&
      isSameMinute(end, new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59))
    );
  };

  const getTasksForDay = (day: Date) =>
    tasks.filter((task) => {
      if (!task.scheduled?.start) return false;
      return isSameDay(new Date(task.scheduled.start), day);
    });

  const getTopOffset = (date: Date) => {
    const hour = getHours(date);
    const minute = getMinutes(date);
    return hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  };

  const getHeight = (start: Date, end: Date) => {
    return Math.max(differenceInMinutes(end, start), 15) * (HOUR_HEIGHT / 60);
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Sticky all-day header */}
      <div className="flex w-full sticky top-0 z-30 bg-white border-b pr-[16px]">
        <div className="w-[60px] flex-shrink-0 bg-gray-50 border-r text-xs text-center py-2 font-medium">
          All-day
        </div>
        <div className="flex-1 grid grid-cols-7">
          {days.map((day, index) => (
            <div key={index} className="border-r px-1 h-[48px]">
              {getAllDayEventsForDay(day).map((event) => (
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

      {/* Scrollable calendar view */}
      <div className="flex w-full h-full overflow-auto" ref={scrollRef}>
        {/* Time column */}
        <div className="w-[60px] flex-shrink-0 text-xs text-gray-500 border-r bg-white">
          {/* Match spacing for date label */}
          <div className="h-[40px] border-b border-white" />
          <div className="flex flex-col">
            {HOURS.map((hour) => (
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

        {/* Calendar columns */}
        <div className="grid grid-cols-7 w-full relative" style={{ height: HOURS.length * HOUR_HEIGHT + 40 }}>
          {days.map((day, index) => (
            <div key={index} className="relative border-r border-gray-200">
              <div
                className="sticky top-0 z-20 bg-white border-b px-2 py-1 text-sm font-medium h-[40px]"
                onClick={() => onDateChange?.(day)}
              >
                {format(day, "EEE, MMM d")}
              </div>

              {HOURS.map((hour) => (
                <div key={hour} className="h-[60px] border-b border-gray-100" />
              ))}

              {getEventsForDay(day).map((event, i) => {
                const start = new Date(event.start);
                const end = new Date(event.end);
                return (
                  <div
                    key={`event-${event.id}`}
                    className="absolute left-1 right-1 px-1"
                    style={{
                      top: getTopOffset(start) + 40,
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
                      top: getTopOffset(start) + 40,
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
