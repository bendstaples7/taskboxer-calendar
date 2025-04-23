import React from "react";
import { Trash2 } from "lucide-react";
import { useDrop } from "react-dnd";
import { Task } from "@/lib/types";

interface TrashCanOverlayProps {
  onDropTask: (task: Task) => void;
  visible: boolean;
}

const TrashCanOverlay: React.FC<TrashCanOverlayProps> = ({ onDropTask, visible }) => {
  const [{ isOver, canDrop }, dropRef] = useDrop(() => ({
    accept: "CALENDAR_TASK", // matches CalendarItem drag type
    drop: (item: { task: Task }) => {
      onDropTask(item.task);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [onDropTask]);

  if (!visible) return null;

  return (
    <div
      ref={dropRef}
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
        flex flex-col items-center justify-center
        w-20 h-20 rounded-full
        transition-all duration-200 ease-in-out
        shadow-lg border-2
        ${isOver && canDrop ? "bg-red-700 border-red-300 scale-110" : "bg-red-500 border-transparent opacity-90"}
      `}
    >
      <Trash2 className="w-7 h-7 text-white" />
      {isOver && canDrop && (
        <span className="text-white text-xs mt-1">Release to Archive</span>
      )}
    </div>
  );
};

export default TrashCanOverlay;
