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
  const isLeft = side === 'left';
  const ArrowIcon =
    (isLeft && expanded) || (!isLeft && !expanded)
      ? ChevronLeft
      : ChevronRight;

  return (
    <div
      className={cn(
        'flex flex-col border rounded-lg shadow-sm bg-white overflow-hidden transition-all ease-in-out duration-300 panel-slide-in',
        expanded ? 'w-full' : 'w-80',
        isLeft ? 'order-first' : 'order-last'
      )}
    >
      <div className="p-3 border-b flex items-center justify-between">
        {isLeft ? (
          <>
            <h2 className="font-medium text-sm">{title}</h2>
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 panel-handle"
            >
              <ArrowIcon className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100 panel-handle"
            >
              <ArrowIcon className="h-4 w-4" />
            </button>
            <h2 className="font-medium text-sm">{title}</h2>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default AnimatedPanel;
