
import React from 'react';
import { cn } from "@/lib/utils";

interface CalendarTimeGridProps {
  hour: number;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const CalendarTimeGrid: React.FC<CalendarTimeGridProps> = ({
  hour,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  // Create 12 five-minute segments for each hour
  const segments = Array.from({ length: 12 }, (_, i) => i * 5);
  
  return (
    <div 
      className="border-t relative"
      style={{ height: `60px` }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <div className="absolute left-0 -mt-2 ml-1 px-1 text-xs text-gray-400 bg-white z-10">
        {hour}:00
      </div>
      {/* Five-minute segments */}
      <div className="absolute w-full h-full grid grid-rows-12">
        {segments.map((minute, index) => (
          <div 
            key={index}
            className={cn(
              "border-0 border-dashed border-gray-100",
              index > 0 && "border-t"
            )}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarTimeGrid;
