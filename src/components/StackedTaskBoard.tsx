
import React, { useState } from 'react';
import { Task, Priority } from "@/lib/types";
import TaskBoardSection from "./TaskBoardSection";
import TaskCard from "./TaskCard";

interface StackedTaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (priority: Priority) => void;
  onDragStart?: (task: Task) => void;
  minimized?: boolean;
  collapsedSections: string[];
  onToggleSection: (section: string) => void;
  onTaskMove?: (taskId: string, newPriority: Priority, newPosition?: number) => void;
}

const StackedTaskBoard: React.FC<StackedTaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  minimized = true,
  collapsedSections,
  onToggleSection,
  onTaskMove
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverTaskId, setDragOverTaskId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
  const criticalTasks = tasks.filter(t => 
    t.priority === 'critical' && !t.completed && !t.scheduled
  ).sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const highTasks = tasks.filter(t => 
    t.priority === 'high' && !t.completed && !t.scheduled
  ).sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const mediumTasks = tasks.filter(t => 
    t.priority === 'medium' && !t.completed && !t.scheduled
  ).sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const lowTasks = tasks.filter(t => 
    t.priority === 'low' && !t.completed && !t.scheduled
  ).sort((a, b) => (a.position || 0) - (b.position || 0));
  
  const handleTaskDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('application/json', JSON.stringify(task));
    e.dataTransfer.effectAllowed = 'move';
    
    // Notify parent
    if (onDragStart) {
      onDragStart(task);
    }
  };
  
  const handleTaskDragOver = (e: React.DragEvent, task: Task, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (task.id !== draggedTaskId) {
      setDragOverTaskId(task.id);
      setDragOverIndex(index);
    }
  };
  
  const handleTaskDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverTaskId(null);
      setDragOverIndex(null);
    }
  };
  
  const handleTaskDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    
    // Only proceed if we have all the necessary data
    if (draggedTaskId && dragOverTaskId && dragOverIndex !== null && onTaskMove) {
      // Find the dragged task and its priority
      const draggedTask = tasks.find(t => t.id === draggedTaskId);
      
      if (draggedTask) {
        // Get the task where the dragged task was dropped
        const targetTask = tasks.find(t => t.id === dragOverTaskId);
        
        if (targetTask) {
          const targetPriority = targetTask.priority;
          
          // Only move if we're dropping on a different task or at a different position
          if (draggedTask.id !== targetTask.id) {
            // Call the onTaskMove function with the correct parameters
            onTaskMove(draggedTaskId, targetPriority, dragOverIndex);
          }
        }
      }
    }
    
    // Reset the drag state
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverIndex(null);
  };
  
  const renderTaskCard = (task: Task, index: number, tasksArray: Task[]) => {
    const isDragging = draggedTaskId === task.id;
    const showStartButton = task.timerStarted === undefined || 
                          (task.timerStarted !== undefined && task.timerPaused !== undefined);
    
    return (
      <div 
        key={task.id}
        className={`relative ${isDragging ? 'opacity-50' : ''}`}
        onDragOver={(e) => handleTaskDragOver(e, task, index)}
        onDragLeave={handleTaskDragLeave}
      >
        {dragOverTaskId === task.id && dragOverIndex === index && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 -mt-1.5 rounded-full z-10"></div>
        )}
        <TaskCard 
          task={task} 
          onClick={() => onTaskClick(task)} 
          onDragStart={(e) => handleTaskDragStart(e, task)}
          onDragEnd={handleTaskDragEnd}
          showStartButton={showStartButton}
          isCalendarView={true}
          draggable={true}
        />
        {dragOverTaskId === task.id && dragOverIndex === index + 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 -mb-1.5 rounded-full z-10"></div>
        )}
      </div>
    );
  };

  // Functions to pass to TaskBoardSection
  const handlePlaceholderDragOver = (e: React.DragEvent, priority: Priority, index?: number) => {
    e.preventDefault();
  };
  
  const handlePlaceholderDragLeave = (e: React.DragEvent) => {
    // No-op
  };
  
  const handlePlaceholderDrop = (e: React.DragEvent, priority: Priority, dropIndex?: number) => {
    e.preventDefault();
    
    // Move task to this priority, potentially at a specific index
    try {
      const taskData = e.dataTransfer.getData('application/json');
      if (taskData && onTaskMove) {
        const task = JSON.parse(taskData);
        onTaskMove(task.id, priority, dropIndex);
      }
    } catch (error) {
      console.error('Error handling task drop:', error);
    }
  };
  
  return (
    <div className="stacked-task-board space-y-4">
      <TaskBoardSection 
        title="Critical" 
        priority="critical"
        tasks={criticalTasks}
        onTaskClick={onTaskClick}
        isCollapsed={collapsedSections.includes('critical')}
        onToggle={() => onToggleSection('critical')}
        onAddTask={() => onAddTask && onAddTask('critical')}
        onDragStart={handleTaskDragStart}
        onDragOver={handlePlaceholderDragOver}
        onDragLeave={handlePlaceholderDragLeave}
        onDrop={handlePlaceholderDrop}
        dragOverPriority={null}
        dragOverIndex={null}
        count={criticalTasks.length}
      >
        {!collapsedSections.includes('critical') && criticalTasks.map((task, index) => 
          renderTaskCard(task, index, criticalTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="High" 
        priority="high"
        tasks={highTasks}
        onTaskClick={onTaskClick}
        isCollapsed={collapsedSections.includes('high')}
        onToggle={() => onToggleSection('high')}
        onAddTask={() => onAddTask && onAddTask('high')}
        onDragStart={handleTaskDragStart}
        onDragOver={handlePlaceholderDragOver}
        onDragLeave={handlePlaceholderDragLeave}
        onDrop={handlePlaceholderDrop}
        dragOverPriority={null}
        dragOverIndex={null}
        count={highTasks.length}
      >
        {!collapsedSections.includes('high') && highTasks.map((task, index) => 
          renderTaskCard(task, index, highTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="Medium" 
        priority="medium"
        tasks={mediumTasks}
        onTaskClick={onTaskClick}
        isCollapsed={collapsedSections.includes('medium')}
        onToggle={() => onToggleSection('medium')}
        onAddTask={() => onAddTask && onAddTask('medium')}
        onDragStart={handleTaskDragStart}
        onDragOver={handlePlaceholderDragOver}
        onDragLeave={handlePlaceholderDragLeave}
        onDrop={handlePlaceholderDrop}
        dragOverPriority={null}
        dragOverIndex={null}
        count={mediumTasks.length}
      >
        {!collapsedSections.includes('medium') && mediumTasks.map((task, index) => 
          renderTaskCard(task, index, mediumTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="Low" 
        priority="low"
        tasks={lowTasks}
        onTaskClick={onTaskClick}
        isCollapsed={collapsedSections.includes('low')}
        onToggle={() => onToggleSection('low')}
        onAddTask={() => onAddTask && onAddTask('low')}
        onDragStart={handleTaskDragStart}
        onDragOver={handlePlaceholderDragOver}
        onDragLeave={handlePlaceholderDragLeave}
        onDrop={handlePlaceholderDrop}
        dragOverPriority={null}
        dragOverIndex={null}
        count={lowTasks.length}
      >
        {!collapsedSections.includes('low') && lowTasks.map((task, index) => 
          renderTaskCard(task, index, lowTasks)
        )}
      </TaskBoardSection>
    </div>
  );
};

export default StackedTaskBoard;
