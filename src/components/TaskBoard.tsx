import React, { useState } from 'react';
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
  
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
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
  
  const handleDragLeave = () => {
    setDragOverPriority(null);
    setDragOverPosition(null);
  };
  
  const handleDrop = (e: React.DragEvent, priority: Priority) => {
    e.preventDefault();
    
    try {
      const task = JSON.parse(e.dataTransfer.getData('application/json')) as Task;
      
      if (task && onTaskMove && task.priority !== priority) {
        onTaskMove(task.id, priority, dragOverPosition || undefined);
      }
    } catch (error) {
      console.error("Error parsing dropped task:", error);
    }
    
    setDraggedTaskId(null);
    setDragOverPriority(null);
    setDragOverPosition(null);
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
    <div className={`task-board-container ${minimized ? 'flex-col' : 'flex-row'}`}>
      {priorities.map(priority => {
        const tasksInPriority = tasks.filter(t => 
          t.priority === priority && !t.completed && !t.scheduled
        ).sort((a, b) => (a.position || 0) - (b.position || 0));
        
        return (
          <div 
            key={priority} 
            className={`task-board-column ${dragOverPriority === priority ? 'bg-gray-200' : ''}`}
            onDragOver={(e) => handleDragOver(e, priority)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, priority)}
          >
            <div className="task-board-column-header capitalize">
              {priority} Priority ({tasksInPriority.length})
            </div>
            
            <div className="task-board-tasks">
              {tasksInPriority.map((task, index) => (
                <div 
                  key={task.id} 
                  className={`mb-2 ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
                >
                  <TaskCard 
                    task={task} 
                    onClick={() => onTaskClick(task)} 
                    onDragStart={(e) => handleDragStart(e, task)}
                  />
                </div>
              ))}
            </div>
            
            <div className="task-board-footer">
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
