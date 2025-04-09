
import React from 'react';

interface CalendarPriorityDropZonesProps {
  visible: boolean;
  onDragOver: (e: React.DragEvent, priority: string) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, priority: string) => void;
}

const CalendarPriorityDropZones: React.FC<CalendarPriorityDropZonesProps> = ({
  visible,
  onDragOver,
  onDragLeave,
  onDrop
}) => {
  if (!visible) return null;
  
  const priorities = ['low', 'medium', 'high', 'critical'];
  
  return (
    <div className="fixed top-20 right-6 flex flex-col space-y-2 z-50 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity duration-300">
      {priorities.map(priority => (
        <div 
          key={priority}
          className={`w-24 h-12 rounded border-2 flex items-center justify-center text-xs font-medium ${
            priority === 'low' ? 'border-blue-500 bg-blue-100' : 
            priority === 'medium' ? 'border-green-500 bg-green-100' : 
            priority === 'high' ? 'border-orange-500 bg-orange-100' : 
            'border-red-500 bg-red-100'
          }`}
          onDragOver={(e) => onDragOver(e, priority)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, priority)}
        >
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </div>
      ))}
    </div>
  );
};

export default CalendarPriorityDropZones;
