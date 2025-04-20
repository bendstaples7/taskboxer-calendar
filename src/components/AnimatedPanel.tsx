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
        <h2 className="font-medium flex items-center">
          {side === 'left' && !expanded && (
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 mr-2"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
          {title}
          {side === 'right' && !expanded && (
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </h2>
        {expanded && (
          <button
            onClick={onToggle}
            className={cn(
              'p-1 rounded-full text-gray-500 hover:bg-gray-100 panel-handle'
            )}
          >
            {side === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default AnimatedPanel;
