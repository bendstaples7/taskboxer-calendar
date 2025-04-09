
import React from 'react';
import { Trash } from "lucide-react";

interface CalendarTrashBinProps {
  showTrashBin: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

const CalendarTrashBin: React.FC<CalendarTrashBinProps> = ({
  showTrashBin,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  if (!showTrashBin) return null;
  
  return (
    <div 
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300"
      style={{ 
        width: '60px', 
        height: '60px',
        opacity: showTrashBin ? 1 : 0,
        transform: showTrashBin ? 'translate(-50%, 0)' : 'translate(-50%, 100px)'
      }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <Trash className="h-6 w-6" />
    </div>
  );
};

export default CalendarTrashBin;
