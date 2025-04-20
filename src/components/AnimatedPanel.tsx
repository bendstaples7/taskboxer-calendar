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
  const isRight = side === 'right';

  const CollapsedChevron = isLeft ? ChevronRight : ChevronLeft;
  const ExpandedChevron = isLeft ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn(
        'flex flex-col border rounded-lg shadow-sm bg-white overflow-hidden transition-all ease-in-out duration-300 panel-slide-in',
        expanded ? 'w-full' : 'w-80',
        isLeft ? 'order-first' : 'order-last'
      )}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!expanded && (
            <button
              onClick={onToggle}
              className="p-1 rounded-full text-gray-500 hover:bg-gray-100"
            >
              <CollapsedChevron className="h-4 w-4" />
            </button>
          )}
          <h2 className="font-medium text-sm">{title}</h2>
        </div>

        {expanded && (
          <button
            onClick={onToggle}
            className="p-1 rounded-full text-gray-500 hover:bg-gray-100 panel-handle"
          >
            <ExpandedChevron className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  );
};

export default AnimatedPanel;
