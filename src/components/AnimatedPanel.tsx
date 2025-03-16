
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface AnimatedPanelProps {
  title: string;
  children: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  side: 'left' | 'right';
}

const AnimatedPanel: React.FC<AnimatedPanelProps> = ({
  title,
  children,
  expanded,
  onToggle,
  side,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col border rounded-lg shadow-sm bg-white overflow-hidden transition-all ease-in-out duration-300 panel-slide-in',
        expanded ? 'w-full' : 'w-80',
        side === 'left' ? 'order-first' : 'order-last'
      )}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <h2 className="font-medium">{title}</h2>
        <button
          onClick={onToggle}
          className={cn(
            'p-1 rounded-full text-gray-500 hover:bg-gray-100 panel-handle',
            side === 'left' ? 'ml-auto' : 'mr-auto'
          )}
        >
          {expanded && side === 'left' && <ChevronRight className="h-4 w-4" />}
          {!expanded && side === 'left' && <ChevronLeft className="h-4 w-4" />}
          {expanded && side === 'right' && <ChevronLeft className="h-4 w-4" />}
          {!expanded && side === 'right' && <ChevronRight className="h-4 w-4" />}
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default AnimatedPanel;
