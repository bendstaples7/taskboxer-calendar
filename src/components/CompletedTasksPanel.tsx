
import React, { useState } from "react";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronDown, ChevronRight, Trash } from "lucide-react";
import TaskCard from "./TaskCard";

interface CompletedTasksPanelProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  className?: string;
}

const CompletedTasksPanel: React.FC<CompletedTasksPanelProps> = ({
  tasks,
  onTaskClick,
  onTaskDelete,
  className = "",
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  
  if (tasks.length === 0) {
    return null;
  }
  
  return (
    <div className={`board-section relative ${className}`}>
      <div className="flex items-center justify-between mb-2 bg-gray-100 p-2 rounded">
        <Button 
          variant="ghost" 
          size="sm"
          className="flex items-center p-0 h-auto"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 mr-1" />
          ) : (
            <ChevronDown className="h-4 w-4 mr-1" />
          )}
          <h3 className="font-medium">Completed ({tasks.length})</h3>
        </Button>
        
        {onTaskDelete && !isCollapsed && tasks.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => {
              // Ask for confirmation before deleting all completed tasks
              if (window.confirm("Delete all completed tasks?")) {
                tasks.forEach(task => onTaskDelete(task.id));
              }
            }}
            className="h-7 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <Trash className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>
      
      {!isCollapsed && (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="relative"
              onClick={() => onTaskClick(task)}
            >
              <TaskCard task={task} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CompletedTasksPanel;
