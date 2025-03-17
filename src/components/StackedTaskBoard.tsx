
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
}

const StackedTaskBoard: React.FC<StackedTaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  minimized = true,
  collapsedSections,
  onToggleSection
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
  
  const handleTaskDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverTaskId(null);
    setDragOverIndex(null);
  };
  
  const renderTaskCard = (task: Task, index: number, tasksArray: Task[]) => {
    const isDragging = draggedTaskId === task.id;
    const showStartButton = !task.timerStarted || (task.timerStarted && task.timerPaused);
    
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
          showStartButton={showStartButton}
          isCalendarView={true}
        />
        {dragOverTaskId === task.id && dragOverIndex === index + 1 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 -mb-1.5 rounded-full z-10"></div>
        )}
      </div>
    );
  };
  
  return (
    <div className="stacked-task-board space-y-4">
      <TaskBoardSection 
        title="Critical" 
        count={criticalTasks.length}
        collapsed={collapsedSections.includes('critical')}
        onToggle={() => onToggleSection('critical')}
        onAddTask={() => onAddTask && onAddTask('critical')}
      >
        {!collapsedSections.includes('critical') && criticalTasks.map((task, index) => 
          renderTaskCard(task, index, criticalTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="High" 
        count={highTasks.length}
        collapsed={collapsedSections.includes('high')}
        onToggle={() => onToggleSection('high')}
        onAddTask={() => onAddTask && onAddTask('high')}
      >
        {!collapsedSections.includes('high') && highTasks.map((task, index) => 
          renderTaskCard(task, index, highTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="Medium" 
        count={mediumTasks.length}
        collapsed={collapsedSections.includes('medium')}
        onToggle={() => onToggleSection('medium')}
        onAddTask={() => onAddTask && onAddTask('medium')}
      >
        {!collapsedSections.includes('medium') && mediumTasks.map((task, index) => 
          renderTaskCard(task, index, mediumTasks)
        )}
      </TaskBoardSection>
      
      <TaskBoardSection 
        title="Low" 
        count={lowTasks.length}
        collapsed={collapsedSections.includes('low')}
        onToggle={() => onToggleSection('low')}
        onAddTask={() => onAddTask && onAddTask('low')}
      >
        {!collapsedSections.includes('low') && lowTasks.map((task, index) => 
          renderTaskCard(task, index, lowTasks)
        )}
      </TaskBoardSection>
    </div>
  );
};

export default StackedTaskBoard;
