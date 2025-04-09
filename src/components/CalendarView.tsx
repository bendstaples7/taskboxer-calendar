import React, { useMemo, useRef, useEffect } from "react";
import { format, startOfWeek, addDays, getHours, getMinutes, differenceInMinutes } from "date-fns";
import { Task, CalendarEvent } from "@/lib/types";
import CalendarItem from "./calendar/CalendarItem";
import { isSameDay } from "date-fns";

interface CalendarViewProps {
  events: CalendarEvent[];
  tasks: Task[];
  onDateChange?: (date: Date) => void;
  scrollToCurrentTime?: boolean;
  minimized?: boolean;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const HOUR_HEIGHT = 60; // 1 hour = 60px

const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  tasks,
  onDateChange,
  scrollToCurrentTime,
  minimized,
}) => {
  const startOfThisWeek = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 0 }), []);
  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(startOfThisWeek, i)), [startOfThisWeek]);

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => event.start && isSameDay(new Date(event.start), day));
  };

  const getTasksForDay = (day: Date) => {
    return tasks.filter((task) => task.scheduled && task.scheduled.start && isSameDay(new Date(task.scheduled.start), day));
  };

  const getTopOffset = (date: Date) => {
    const hour = getHours(date);
    const minute = getMinutes(date);
    return hour * HOUR_HEIGHT + (minute / 60) * HOUR_HEIGHT;
  };

  const getHeight = (start: Date, end: Date) => {
    return Math.max(differenceInMinutes(end, start), 15) * (HOUR_HEIGHT / 60);
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToCurrentTime && scrollRef.current) {
      scrollRef.current.scrollTop = 6 * HOUR_HEIGHT; // Scroll to 6 AM
    }
  }, [scrollToCurrentTime]);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current && timeRef.current) {
        timeRef.current.scrollTop = scrollRef.current.scrollTop;
      }
    };

    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="sticky left-0 top-0 z-10 bg-white text-xs text-gray-500 border-r">
        <div
          className="flex flex-col"
          style={{ height: HOURS.length * HOUR_HEIGHT }}
        >
          <div className="overflow-hidden" style={{ height: "100%" }}>
            <div ref={timeRef} className="flex flex-col">
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
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-auto" ref={scrollRef}>
        <div className="grid grid-cols-7 w-full relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-gray-200">
              <div className="sticky top-0 z-10 bg-white border-b px-2 py-1 text-sm font-medium">
                {format(day, "EEE, MMM d")}
              </div>

              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="h-[60px] border-b border-gray-100"
                ></div>
              ))}

              {getEventsForDay(day).map((event, index) => (
                <div
                  key={event.id}
                  className="absolute left-1 right-1 px-1"
                  style={{
                    top: getTopOffset(new Date(event.start)),
                    height: getHeight(new Date(event.start), new Date(event.end)),
                  }}
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
              ))}

              {getTasksForDay(day).map((task, index) => (
                <div
                  key={task.id}
                  className="absolute left-1 right-1 px-1"
                  style={{
                    top: getTopOffset(new Date(task.scheduled!.start)),
                    height: getHeight(new Date(task.scheduled!.start), new Date(task.scheduled!.end)),
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
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
