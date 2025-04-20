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
  const today = new Date();
  const startOfThisWeek = useMemo(() => startOfWeek(today, { weekStartsOn: 0 }), []);
  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i)), [startOfThisWeek]);
  const days = singleDayMode ? [today] : weekDays;

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToCurrentTime && scrollRef.current) {
      const now = new Date();
      const scrollHour = Math.max(now.getHours() - 1, 6);
      scrollRef.current.scrollTop = scrollHour * HOUR_HEIGHT;
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

  const getEventsForDay = (day: Date) =>
    events.filter((event) => {
      if (!event?.start || !event?.end) return false;
      const start = new Date(event.start);
      return isSameDay(start, day) && !isAllDayEvent(event);
    });

  const getAllDayEventsForDay = (day: Date) =>
    events.filter((event) => {
      if (!event?.start || !event?.end) return false;
      return isSameDay(new Date(event.start), day) && isAllDayEvent(event);
    });

  const getTasksForDay = (day: Date) =>
    tasks.filter((task) => {
      if (!task?.scheduled?.start) return false;
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

  const now = new Date();
  const currentDayIndex = days.findIndex((d) => isSameDay(d, now));
  const currentTopOffset = getTopOffset(now);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Date Header */}
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

      {/* All-day Row */}
      <div className="flex w-full sticky top-[40px] z-20 bg-white border-b pr-[16px]">
        <div className="w-[60px] flex-shrink-0 bg-gray-50 border-r text-xs text-center py-2 font-medium border-b border-gray-200">
          All-day
        </div>
        <div className={`flex-1 grid ${singleDayMode ? "grid-cols-1" : "grid-cols-7"}`}>
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

      {/* Time Grid */}
      <div className="flex w-full h-full overflow-auto relative" ref={scrollRef}>
        <div className="w-[60px] flex-shrink-0 text-xs text-gray-500 bg-white border-r border-gray-200">
          <div className="h-[40px] border-b border-gray-200" />
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

        {/* Vertical divider under date label */}
        <div className="absolute left-[60px] top-0 w-px bg-gray-200" style={{ height: HOURS.length * HOUR_HEIGHT + 40 }} />

        {/* Day Columns */}
        <div
          className={`grid ${singleDayMode ? "grid-cols-1" : "grid-cols-7"} w-full relative`}
          style={{ height: HOURS.length * HOUR_HEIGHT + 40 }}
        >
          {days.map((day, index) => (
            <div key={index} className="relative border-r border-gray-200">
              {HOURS.map((hour) => (
                <div key={hour} className="h-[60px] border-b border-gray-100" />
              ))}

              {getEventsForDay(day).map((event, i) => {
                if (!event?.start || !event?.end) return null;
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
                if (!task?.scheduled?.start || !task?.scheduled?.end) return null;
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

              {currentDayIndex === index && (
                <div
                  className="current-time-indicator"
                  style={{ top: currentTopOffset + 40 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
