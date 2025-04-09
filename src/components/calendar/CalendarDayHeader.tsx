
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { cn } from "@/lib/utils";

interface CalendarDayHeaderProps {
  days: Date[];
  singleDayMode: boolean;
}

const CalendarDayHeader: React.FC<CalendarDayHeaderProps> = ({ days, singleDayMode }) => {
  return (
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
  );
};

export default CalendarDayHeader;
