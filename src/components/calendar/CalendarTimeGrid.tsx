
import React from 'react';
import { format } from 'date-fns';

interface CalendarTimeGridProps {
  dayCount?: number;
  hourStart?: number;
  hourEnd?: number;
  columnWidth?: number;
  hourHeight?: number;
  isMinimized?: boolean;
  hour?: number; // Added hour prop
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const CalendarTimeGrid: React.FC<CalendarTimeGridProps> = ({
  dayCount = 7,
  hourStart = 0,
  hourEnd = 24,
  columnWidth = 100,
  hourHeight = 60,
  isMinimized = false,
  hour,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  const hours = Array.from({ length: hourEnd - hourStart }, (_, i) => i + hourStart);
  const days = Array.from({ length: dayCount }, (_, i) => i);
  
  // If specific hour is provided, render just that hour's grid
  if (hour !== undefined) {
    return (
      <div 
        className="calendar-hour-grid h-full border-t border-gray-200"
        style={{ height: `${hourHeight}px` }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* 5-minute grid lines - only visible when dragging */}
        {Array.from({ length: 12 }, (_, i) => i).map(i => (
          <div 
            key={i} 
            className="h-[5px] border-t border-gray-100 opacity-0"
          ></div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="calendar-time-grid relative">
      {/* Time labels */}
      <div className="calendar-time-labels absolute left-0 top-0 w-14 bg-white z-10">
        {hours.map(hour => (
          <div 
            key={hour} 
            className="font-medium text-xs text-gray-500 flex items-start border-t" 
            style={{ height: `${hourHeight}px` }}
          >
            <span className="mt-[-8px] ml-1">{format(new Date().setHours(hour, 0, 0, 0), 'h a')}</span>
          </div>
        ))}
      </div>
      
      {/* Hour grid lines - only show full hour lines */}
      <div className="calendar-hour-grid absolute left-14 right-0">
        {hours.map(hour => (
          <div 
            key={hour} 
            className={`border-t ${hour % 1 === 0 ? 'border-gray-300' : 'border-gray-100'}`} 
            style={{ height: `${hourHeight}px` }}
          >
            {/* 5-minute grid lines - hidden by default */}
            {Array.from({ length: 12 }, (_, i) => i).map(i => (
              <div 
                key={i} 
                className="h-[5px] border-t border-gray-100 opacity-0"
              ></div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Day columns */}
      <div 
        className="calendar-day-columns absolute left-14 right-0 grid" 
        style={{ gridTemplateColumns: `repeat(${dayCount}, 1fr)` }}
      >
        {days.map(day => (
          <div key={day} className="calendar-day-column h-full border-r"></div>
        ))}
      </div>
    </div>
  );
};

export default CalendarTimeGrid;
