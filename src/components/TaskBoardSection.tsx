import React from "react";
import { Task, Priority } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import TaskCard from "./TaskCard";

interface TaskBoardSectionProps {
  title: string;
  priority: Priority;
  tasks: Task[];
  isCollapsed: boolean;
  onToggle: () => void;
  onTaskClick: (task: Task) => void;
  onAddTask: () => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDragOver: (e: React.DragEvent, priority: Priority, index?: number) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, priority: Priority, dropIndex?: number) => void;
  dragOverPriority: Priority | null;
  dragOverIndex: number | null;
  minimized?: boolean;
  className?: string;
  children?: React.ReactNode;
  count?: number;
  collapsed?: boolean;
}

const TaskBoardSection: React.FC<TaskBoardSectionProps> = ({
  title,
  priority,
  tasks,
  isCollapsed: propIsCollapsed,
  collapsed: deprecatedCollapsed,
  onToggle,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverPriority,
  dragOverIndex,
  minimized = false,
  className = "",
  children,
  count
}) => {
  const isCollapsed = deprecatedCollapsed !== undefined ? deprecatedCollapsed : propIsCollapsed;
  
  const noTasks = tasks.length === 0;
  
  return (
    <div 
      className={`board-section relative ${className}`}
      onDragOver={(e) => onDragOver(e, priority)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, priority)}
    >
      <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center p-0 h-auto"
          onClick={onToggle}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          <h3 className="font-medium">
            {title}
            {count !== undefined && count > 0 && ` (${count})`}
          </h3>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onAddTask}
          className="h-7 bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add {title}
        </Button>
      </div>
      
      {!isCollapsed && (
        <div className="space-y-2">
          {children ? (
            children
          ) : (
            <>
              {noTasks && (
                <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                  No {title.toLowerCase()} tasks
                </div>
              )}
              
              {tasks.map((task, index) => (
                <div key={task.id} className="relative">
                  {dragOverPriority === priority && dragOverIndex === index && (
                    <div className="drop-indicator absolute -top-1 left-0 right-0" />
                  )}
                  <div 
                    draggable 
                    onDragStart={(e) => onDragStart(e, task)}
                    onClick={() => onTaskClick(task)}
                  >
                    <TaskCard task={task} />
                  </div>
                  {dragOverPriority === priority && dragOverIndex === index + 1 && (
                    <div className="drop-indicator absolute -bottom-1 left-0 right-0" />
                  )}
                </div>
              ))}
              
              {dragOverPriority === priority && dragOverIndex === tasks.length && (
                <div className="drop-indicator absolute bottom-0 left-0 right-0" />
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskBoardSection;
