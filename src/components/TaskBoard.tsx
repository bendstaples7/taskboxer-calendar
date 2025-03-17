
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task, Priority } from "@/lib/types";
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (priority: Priority) => void;
  onDragStart?: (task: Task) => void;
  onTaskMove?: (taskId: string, newPriority: Priority, newPosition?: number) => void;
  onTaskDragToCalendar?: (task: Task, dropTime: Date) => void;
  minimized?: boolean;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  onTaskMove,
  onTaskDragToCalendar,
  minimized = false
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverPriority, setDragOverPriority] = useState<Priority | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const draggedTaskRef = useRef<Task | null>(null);
  
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    draggedTaskRef.current = task;
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    
    // Notify parent
    if (onDragStart) {
      onDragStart(task);
    }
  };

  const handleDragOver = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    setDragOverPriority(priority);
    
    // Calculate position within the priority list
    const tasksInPriority = tasks.filter(t => 
      t.priority === priority && !t.completed && !t.scheduled
    );
    
    const boardRect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - boardRect.top;
    const totalHeight = boardRect.height;
    const position = Math.min(
      Math.floor(offsetY / (totalHeight / (tasksInPriority.length + 1))),
      tasksInPriority.length
    );
    
    setDragOverPosition(position);
  };
  
  const handleTaskDragOver = (e: React.DragEvent, task: Task, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragOverTaskId(task.id);
    setDragOverPriority(task.priority);
    
    // Determine if we're in the top or bottom half of the task
    const rect = e.currentTarget.getBoundingClientRect();
    const isInTopHalf = e.clientY - rect.top < rect.height / 2;
    
    // Set the position before or after the current task
    setDragOverPosition(isInTopHalf ? index : index + 1);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the element we entered, not a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPriority(null);
      setDragOverPosition(null);
      setDragOverTaskId(null);
    }
  };
  
  const handleTaskDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTaskId(null);
    }
  };
  
  const handleDrop = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    
    try {
      const task = JSON.parse(e.dataTransfer.getData('application/json')) as Task;
      
      if (task && onTaskMove) {
        onTaskMove(task.id, priority, dragOverPosition || undefined);
      }
    } catch (error) {
      console.error("Error parsing dropped task:", error);
    }
    
    setDraggedTaskId(null);
    setDragOverPriority(null);
    setDragOverPosition(null);
    setDragOverTaskId(null);
    draggedTaskRef.current = null;
  };
  
  const handleCalendarDrop = (e: React.DragEvent) => {
    try {
      const task = JSON.parse(e.dataTransfer.getData('application/json')) as Task;
      const dropTime = new Date(e.dataTransfer.getData('text/plain'));
      
      if (task && dropTime && onTaskDragToCalendar) {
        onTaskDragToCalendar(task, dropTime);
      }
    } catch (error) {
      console.error("Error handling calendar drop:", error);
    }
  };
  
  const priorities: Priority[] = ['critical', 'high', 'medium', 'low'];
  
  return (
    <div className={`task-board-container ${minimized ? 'flex-col' : 'grid grid-cols-4 gap-4 h-full'}`}>
      {priorities.map(priority => {
        const tasksInPriority = tasks.filter(t => 
          t.priority === priority && !t.completed && !t.scheduled
        ).sort((a, b) => (a.position || 0) - (b.position || 0));
        
        return (
          <div 
            key={priority} 
            className={`task-board-column bg-gray-100 rounded-md p-3 flex flex-col ${dragOverPriority === priority ? 'bg-gray-200' : ''}`}
            onDragOver={(e) => handleDragOver(e, priority)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, priority)}
          >
            <div className="task-board-column-header capitalize font-medium mb-3 text-sm">
              {priority} Priority ({tasksInPriority.length})
            </div>
            
            <div className="task-board-tasks flex-1 overflow-y-auto">
              {tasksInPriority.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`mb-3 relative ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                  onDragOver={(e) => handleTaskDragOver(e, task, index)}
                  onDragLeave={handleTaskDragLeave}
                  onDrop={(e) => handleDrop(e, priority)}
                >
                  {dragOverTaskId === task.id && draggedTaskId !== task.id && dragOverPosition === index && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 -mt-1.5 rounded-full"></div>
                  )}
                  <TaskCard 
                    task={task} 
                    onClick={() => onTaskClick(task)} 
                    onDragStart={(e) => handleDragStart(e, task)}
                  />
                  {dragOverTaskId === task.id && draggedTaskId !== task.id && dragOverPosition === index + 1 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 -mb-1.5 rounded-full"></div>
                  )}
                </div>
              ))}
              {tasksInPriority.length === 0 && (
                <div className="bg-white border border-dashed border-gray-300 rounded-md p-4 text-center text-gray-500 text-sm mb-3">
                  No tasks
                </div>
              )}
            </div>
            
            <div className="task-board-footer mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                onClick={() => onAddTask && onAddTask(priority)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TaskBoard;
