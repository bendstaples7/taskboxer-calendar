
import React, { useState } from "react";
import { Task, Priority } from "@/lib/types";
import { Trash } from "lucide-react";
import CompletedTasksPanel from "./CompletedTasksPanel";
import TaskBoardSection from "./TaskBoardSection";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (priority: Priority) => void;
  onDragStart: (task: Task) => void;
  onTaskMove?: (taskId: string, newPriority: Priority, newPosition?: number) => void;
  onTaskDragToCalendar?: (task: Task, startTime: Date) => void;
  onTaskDelete?: (taskId: string) => void;
  collapsedSections?: string[];
  onToggleSection?: (section: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  onTaskMove,
  onTaskDragToCalendar,
  onTaskDelete,
  collapsedSections = [],
  onToggleSection = () => {},
}) => {
  const priorities: Priority[] = ["critical", "high", "medium", "low"];
  const [dragOverPriority, setDragOverPriority] = useState<Priority | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showTrashBin, setShowTrashBin] = useState<boolean>(false);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  
  const getPriorityTasks = (priority: Priority) => {
    return tasks
      .filter(task => task.priority === priority && !task.scheduled && !task.completed)
      .sort((a, b) => (a.position || 0) - (b.position || 0));
  };

  const getScheduledTasks = () => {
    return tasks.filter(task => task.scheduled && !task.completed);
  };

  const getCompletedTasks = () => {
    return tasks.filter(task => task.completed);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    e.dataTransfer.setData("application/json", JSON.stringify(task));
    e.dataTransfer.setData("taskId", task.id);
    e.dataTransfer.setData("from", "taskboard");
    e.dataTransfer.effectAllowed = "move";
    
    setDraggedTaskId(task.id);
    setShowTrashBin(true);
    
    // Create a ghost image for drag preview
    const dragPreview = document.createElement("div");
    dragPreview.className = "task-card-preview";
    dragPreview.innerHTML = `<div class="p-2 bg-white border rounded shadow">${task.title}</div>`;
    document.body.appendChild(dragPreview);
    dragPreview.style.position = "absolute";
    dragPreview.style.top = "-1000px";
    dragPreview.style.opacity = "0.8";
    
    e.dataTransfer.setDragImage(dragPreview, 0, 0);
    
    // Remove the ghost element after a delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 0);
    
    // Call the parent component's onDragStart with just the task
    onDragStart(task);
  };

  const handleDragOver = (e: React.DragEvent, priority: Priority, index?: number) => {
    e.preventDefault();
    e.currentTarget.classList.add('droppable-active');
    setDragOverPriority(priority);
    setDragOverIndex(index !== undefined ? index : null);
    
    // Show a drop indicator
    const dropIndicator = document.createElement('div');
    dropIndicator.className = 'drop-indicator';
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('droppable-active');
    setDragOverPriority(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setShowTrashBin(false);
    setDraggedTaskId(null);
  };

  const handleDragOverTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('trash-active');
  };
  
  const handleDragLeaveTrash = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('trash-active');
  };
  
  const handleDropOnTrash = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('trash-active');
    setShowTrashBin(false);
    
    if (onTaskDelete) {
      try {
        const taskId = e.dataTransfer.getData("taskId");
        if (taskId) {
          onTaskDelete(taskId);
        }
      } catch (error) {
        console.error("Error handling task drop on trash:", error);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, priority: Priority, dropIndex?: number) => {
    e.preventDefault();
    e.currentTarget.classList.remove('droppable-active');
    setDragOverPriority(null);
    setDragOverIndex(null);
    
    try {
      const taskId = e.dataTransfer.getData("taskId");
      const fromSource = e.dataTransfer.getData("from");
      
      // If coming from calendar, handle differently
      if (fromSource === "calendar" && onTaskMove) {
        const taskData = e.dataTransfer.getData("application/json");
        if (taskData) {
          const task = JSON.parse(taskData) as Task;
          onTaskMove(task.id, priority, dropIndex);
        }
        return;
      }
      
      if (taskId && onTaskMove) {
        onTaskMove(taskId, priority, dropIndex);
      }
    } catch (error) {
      console.error("Error handling task drop:", error);
    }
    
    setShowTrashBin(false);
  };

  const renderTrashBin = () => {
    if (!showTrashBin || !onTaskDelete) return null;
    
    return (
      <div 
        className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 hover:bg-red-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center transition-all duration-300"
        style={{ 
          width: '60px', 
          height: '60px',
          opacity: showTrashBin ? 1 : 0,
          transform: showTrashBin ? 'translate(-50%, 0)' : 'translate(-50%, 100px)'
        }}
        onDragOver={handleDragOverTrash}
        onDragLeave={handleDragLeaveTrash}
        onDrop={handleDropOnTrash}
      >
        <Trash className="h-6 w-6" />
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full gap-4 overflow-auto">
      {priorities.map(priority => (
        <TaskBoardSection
          key={priority}
          title={priority.charAt(0).toUpperCase() + priority.slice(1)}
          priority={priority}
          tasks={getPriorityTasks(priority)}
          isCollapsed={collapsedSections.includes(priority)}
          onToggle={() => onToggleSection(priority)}
          onTaskClick={onTaskClick}
          onAddTask={() => onAddTask(priority)}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          dragOverPriority={dragOverPriority}
          dragOverIndex={dragOverIndex}
        />
      ))}
      
      <CompletedTasksPanel 
        tasks={getCompletedTasks()}
        onTaskClick={onTaskClick}
        onTaskDelete={onTaskDelete}
      />
      
      {renderTrashBin()}
    </div>
  );
};

export default TaskBoard;
