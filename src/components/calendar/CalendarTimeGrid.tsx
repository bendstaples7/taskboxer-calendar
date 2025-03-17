
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
  // Create 12 five-minute segments for each hour (invisible for drag/drop only)
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
      {/* Five-minute segments - hidden but functional for drag precision */}
      <div className="absolute w-full h-full grid grid-rows-12">
        {segments.map((minute, index) => (
          <div 
            key={index}
            className={cn(
              "border-0",
              // Only make 15 and 30 minute segments visible with very light border
              (index === 3 || index === 6 || index === 9) && "border-t border-dashed border-gray-100 opacity-30"
            )}
            data-minute={minute}
          />
        ))}
      </div>
    </div>
  );
};

export default CalendarTimeGrid;
