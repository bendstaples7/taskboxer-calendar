
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
  const dragPositionIndicatorRef = useRef<HTMLDivElement>(null);

  const criticalTasks = tasks
    .filter(task => task.priority === 'critical' && !task.completed && !task.scheduled)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const highTasks = tasks
    .filter(task => task.priority === 'high' && !task.completed && !task.scheduled)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const mediumTasks = tasks
    .filter(task => task.priority === 'medium' && !task.completed && !task.scheduled)
    .sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const lowTasks = tasks
    .filter(task => task.priority === 'low' && !task.completed && !task.scheduled)
    .sort((a, b) => (a.position || 0) - (b.position || 0));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('taskPriority', task.priority);
    e.dataTransfer.setData('from', 'taskboard');
    e.dataTransfer.effectAllowed = 'move';
    
    setDraggedTaskId(task.id);
    
    if (onDragStart) {
      onDragStart(task);
    }
    
    // Create a drag preview
    const preview = document.createElement('div');
    preview.classList.add('task-drag-preview');
    preview.textContent = task.title;
    preview.style.position = 'absolute';
    preview.style.top = '-1000px';
    document.body.appendChild(preview);
    e.dataTransfer.setDragImage(preview, 0, 0);
    
    // Cleanup the preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(preview);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, priority: Priority, index: number = -1, taskId: string | null = null) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
    
    setDragOverPriority(priority);
    setDragOverPosition(index);
    setDragOverTaskId(taskId);
    
    // Get the position of the drag indicator
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = container.offsetHeight;
    
    // Create or update drop indicator
    if (!dragPositionIndicatorRef.current) {
      const indicator = document.createElement('div');
      indicator.className = 'task-drag-indicator';
      indicator.style.position = 'absolute';
      indicator.style.left = '0';
      indicator.style.right = '0';
      indicator.style.height = '3px';
      indicator.style.backgroundColor = '#3b82f6'; // Blue
      indicator.style.zIndex = '50';
      indicator.style.pointerEvents = 'none';
      container.appendChild(indicator);
      dragPositionIndicatorRef.current = indicator;
    }
    
    // Position the indicator at the mouse position
    if (dragPositionIndicatorRef.current) {
      // Check if cursor is in the top half or bottom half of the item
      const isTopHalf = y < height / 2;
      dragPositionIndicatorRef.current.style.top = isTopHalf ? '0' : `${height}px`;
      dragPositionIndicatorRef.current.style.transform = 'translateY(-50%)';
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Remove the drag indicator when leaving a column or item
    const relatedTarget = e.relatedTarget as Node;
    if (!e.currentTarget.contains(relatedTarget)) {
      if (dragPositionIndicatorRef.current && dragPositionIndicatorRef.current.parentNode) {
        dragPositionIndicatorRef.current.parentNode.removeChild(dragPositionIndicatorRef.current);
        dragPositionIndicatorRef.current = null;
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, priority: Priority, index: number = -1) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    // Remove the drag indicator
    if (dragPositionIndicatorRef.current && dragPositionIndicatorRef.current.parentNode) {
      dragPositionIndicatorRef.current.parentNode.removeChild(dragPositionIndicatorRef.current);
      dragPositionIndicatorRef.current = null;
    }
    
    const taskId = e.dataTransfer.getData('taskId');
    const fromSource = e.dataTransfer.getData('from');
    const originalPriority = e.dataTransfer.getData('taskPriority') as Priority;
    
    // Check if we're dropping on a different priority column or within the same column
    if (fromSource === 'taskboard' && taskId && onTaskMove) {
      // Get the position where to insert the task
      let newPosition = index;
      
      // If we're dropping at the end of the list
      if (index === -1) {
        const tasksInColumn = tasks.filter(t => 
          t.priority === priority && !t.completed && !t.scheduled
        ).length;
        newPosition = tasksInColumn;
      }
      
      // If dropping on a task, get the right position based on cursor position
      if (dragOverTaskId) {
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const height = e.currentTarget.offsetHeight;
        const isTopHalf = y < height / 2;
        
        // If dropping in bottom half, insert after the task
        if (!isTopHalf) {
          newPosition += 1;
        }
      }
      
      // Only call onTaskMove if we're actually moving the task
      if (priority !== originalPriority || newPosition !== -1) {
        onTaskMove(taskId, priority, newPosition);
      }
    }
    
    setDraggedTaskId(null);
    setDragOverPriority(null);
    setDragOverPosition(null);
    setDragOverTaskId(null);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverPriority(null);
    setDragOverPosition(null);
    setDragOverTaskId(null);
    
    // Ensure the drag indicator is removed
    if (dragPositionIndicatorRef.current && dragPositionIndicatorRef.current.parentNode) {
      dragPositionIndicatorRef.current.parentNode.removeChild(dragPositionIndicatorRef.current);
      dragPositionIndicatorRef.current = null;
    }
  };

  const renderTaskColumn = (title: string, priority: Priority, tasks: Task[]) => (
    <div 
      className="task-column h-full flex flex-col min-w-64"
      onDragOver={(e) => handleDragOver(e, priority)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, priority)}
    >
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-sm">{title} ({tasks.length})</h3>
        {onAddTask && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2"
            onClick={() => onAddTask(priority)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-auto pr-2">
        {tasks.map((task, index) => (
          <div 
            key={task.id}
            className={`task-item ${draggedTaskId === task.id ? 'opacity-50' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, task)}
            onDragOver={(e) => handleDragOver(e, priority, index, task.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, priority, index)}
            onDragEnd={handleDragEnd}
          >
            <TaskCard 
              task={task} 
              onClick={() => onTaskClick(task)} 
              isDragging={draggedTaskId === task.id}
              showStartButton={true}
              onStartTask={onTaskMove ? () => {} : undefined}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full flex gap-4 overflow-auto pr-3 pb-3">
      {renderTaskColumn('Critical', 'critical', criticalTasks)}
      {renderTaskColumn('High', 'high', highTasks)}
      {renderTaskColumn('Medium', 'medium', mediumTasks)}
      {renderTaskColumn('Low', 'low', lowTasks)}
    </div>
  );
};

export default TaskBoard;
