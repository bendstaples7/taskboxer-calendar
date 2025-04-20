import React, { useMemo, useRef, useEffect } from "react";
import {
  format,
  startOfWeek,
  addDays,
  getHours,
  getMinutes,
  differenceInMinutes,
  isSameDay
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

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      if (!event.start) return false;
      return isSameDay(new Date(event.start), day);
    });
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => {
      if (!task.scheduled?.start) return false;
      return isSameDay(new Date(task.scheduled.start), day);
    });
  };

  const getTopOffset = (date: Date) => {
    const hour = getHours(date);
    const minute = getMinutes(date);
    return hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  };

  const getHeight = (start: Date, end: Date) => {
    return Math.max(differenceInMinutes(end, start), 15) * (HOUR_HEIGHT / 60);
  };

  return (
    <div ref={scrollRef} className="flex h-full overflow-auto">
      <div className="w-[60px] flex-shrink-0 text-xs text-gray-500 border-r bg-white">
        <div className="flex flex-col" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="h-[60px] px-1 text-right leading-[60px] border-b border-gray-200"
            >
              {hour % 12 === 0 ? 12 : hour % 12}
              {hour < 12 ? "am" : "pm"}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1">
        <div
          className="grid grid-cols-7 w-full relative"
          style={{ height: HOURS.length * HOUR_HEIGHT }}
        >
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200">
              <div
                className="sticky top-0 z-10 bg-white border-b px-2 py-1 text-sm font-medium"
                onClick={() => onDateChange?.(day)}
              >
                {format(day, "EEE, MMM d")}
              </div>

              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100"
                ></div>
              ))}

              {getEventsForDay(day).map((event, index) => {
                if (!event.start || !event.end) return null;
                return (
                  <div
                    key={`event-${event.id}`}
                    className="absolute left-1 right-1 px-1"
                    style={{
                      top: getTopOffset(new Date(event.start)),
                      height: getHeight(new Date(event.start), new Date(event.end)),
                    }}
                    onClick={() => onEventClick?.(event)}
                  >
                    <CalendarItem
                      item={event}
                      isTask={false}
                      index={index}
                      totalItems={1}
                      resizingTaskId={null}
                      isResizing={false}
                    />
                  </div>
                );
              })}

              {getTasksForDay(day).map((task, index) => {
                if (!task.scheduled?.start || !task.scheduled?.end) return null;
                return (
                  <div
                    key={`task-${task.id}`}
                    className="absolute left-1 right-1 px-1"
                    style={{
                      top: getTopOffset(new Date(task.scheduled.start)),
                      height: getHeight(new Date(task.scheduled.start), new Date(task.scheduled.end)),
                    }}
                  >
                    <CalendarItem
                      item={task}
                      isTask={true}
                      index={index}
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
