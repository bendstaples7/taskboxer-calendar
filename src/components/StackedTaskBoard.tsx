
import React from "react";
import { Task, Priority } from "@/lib/types";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StackedTaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (priority: Priority) => void;
  onDragStart: (task: Task) => void;
  minimized?: boolean;
}

const StackedTaskBoard: React.FC<StackedTaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  minimized = false,
}) => {
  const priorities: Priority[] = ["critical", "high", "medium", "low"];
  
  const getPriorityTasks = (priority: Priority) => {
    return tasks.filter(task => task.priority === priority && !task.scheduled);
  };

  const getScheduledTasks = () => {
    return tasks.filter(task => task.scheduled && !task.completed);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    onDragStart(task);
  };

  const renderPrioritySection = (priority: Priority) => {
    const priorityTasks = getPriorityTasks(priority);
    if (priorityTasks.length === 0) return null;
    
    const capitalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    const colorClass = 
      priority === 'low' ? 'bg-blue-100' : 
      priority === 'medium' ? 'bg-yellow-100' : 
      priority === 'high' ? 'bg-orange-100' : 
      'bg-red-100';

    return (
      <div key={priority} className="mb-4">
        <div className={`p-2 ${colorClass} rounded-t-md font-medium flex justify-between items-center`}>
          <h2>{capitalizedPriority}</h2>
          <span className="bg-gray-100 px-2 rounded-full text-sm">{priorityTasks.length}</span>
        </div>
        <div className="p-2 bg-gray-50 rounded-b-md">
          {priorityTasks.map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
            >
              <TaskCard 
                task={task} 
                onClick={() => onTaskClick(task)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderScheduledSection = () => {
    const scheduledTasks = getScheduledTasks();
    if (scheduledTasks.length === 0) return null;

    return (
      <div key="scheduled" className="mb-4">
        <div className="p-2 bg-purple-100 rounded-t-md font-medium flex justify-between items-center">
          <h2>Scheduled</h2>
          <span className="bg-gray-100 px-2 rounded-full text-sm">{scheduledTasks.length}</span>
        </div>
        <div className="p-2 bg-gray-50 rounded-b-md">
          {scheduledTasks.map(task => (
            <div 
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
            >
              <TaskCard 
                task={task} 
                onClick={() => onTaskClick(task)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderAddTaskButtons = () => {
    return (
      <div className={cn(
        "flex gap-2 mt-4",
        minimized ? "flex-col" : "flex-wrap"
      )}>
        {priorities.map(priority => (
          <Button 
            key={priority}
            variant="outline" 
            size="sm" 
            onClick={() => onAddTask(priority)}
            className={cn(
              priority === 'low' ? 'border-blue-500' : 
              priority === 'medium' ? 'border-yellow-500' : 
              priority === 'high' ? 'border-orange-500' : 
              'border-red-500',
              "border-l-4"
            )}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add {priority.charAt(0).toUpperCase() + priority.slice(1)}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {renderScheduledSection()}
        {priorities.map(priority => renderPrioritySection(priority))}
        {renderAddTaskButtons()}
      </div>
    </ScrollArea>
  );
};

export default StackedTaskBoard;
