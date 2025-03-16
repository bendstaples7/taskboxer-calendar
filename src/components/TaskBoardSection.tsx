
import React from "react";
import { Task, Priority } from "@/lib/types";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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
  onDrop: (e: React.DragEvent, priority: Priority, index?: number) => void;
  dragOverPriority: Priority | null;
  dragOverIndex: number | null;
  minimized?: boolean;
}

const TaskBoardSection: React.FC<TaskBoardSectionProps> = ({
  title,
  priority,
  tasks,
  isCollapsed,
  onToggle,
  onTaskClick,
  onAddTask,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverPriority,
  dragOverIndex,
  minimized = false
}) => {
  const priorityBackgroundColor = 
    priority === 'low' ? 'bg-blue-100' : 
    priority === 'medium' ? 'bg-green-100' : 
    priority === 'high' ? 'bg-orange-100' : 
    'bg-red-100';

  return (
    <Collapsible
      open={!isCollapsed}
      onOpenChange={onToggle}
    >
      <CollapsibleTrigger className="w-full">
        <div className={`p-2 ${priorityBackgroundColor} rounded-t-md font-medium flex justify-between items-center`}>
          <h2>{title}</h2>
          <div className="flex items-center">
            <span className="bg-gray-100 px-2 rounded-full text-sm mr-2">{tasks.length}</span>
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div 
          className={`p-2 bg-gray-50 rounded-b-md overflow-y-auto min-h-[50px] ${minimized ? '' : 'flex-1'}`}
          onDragOver={(e) => onDragOver(e, priority)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, priority)}
        >
          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <div 
                key={task.id}
                draggable
                onDragStart={(e) => onDragStart(e, task)}
                onDragOver={(e) => onDragOver(e, priority, index)}
                onDrop={(e) => onDrop(e, priority, index)}
                className={`relative ${dragOverPriority === priority && dragOverIndex === index ? 'border-t-2 border-purple-500' : ''}`}
              >
                <TaskCard 
                  task={task} 
                  onClick={() => onTaskClick(task)}
                />
                {dragOverPriority === priority && dragOverIndex === index && (
                  <div className="absolute w-full h-0.5 top-0 bg-purple-500 rounded"></div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">No tasks</div>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full mt-2" 
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add {title}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default TaskBoardSection;
