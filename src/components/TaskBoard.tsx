
import React, { useState } from "react";
import { Task, Priority } from "@/lib/types";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask: (priority: Priority) => void;
  onDragStart: (task: Task) => void;
  onTaskMove?: (taskId: string, newPriority: Priority, newPosition?: number) => void;
  onTaskDragToCalendar?: (task: Task, startTime: Date) => void;
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
  collapsedSections = [],
  onToggleSection = () => {},
}) => {
  const priorities: Priority[] = ["critical", "high", "medium", "low"];
  const [dragOverPriority, setDragOverPriority] = useState<Priority | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
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
  };

  const renderColumn = (priority: Priority) => {
    const priorityTasks = getPriorityTasks(priority);
    const capitalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    const isCollapsed = collapsedSections.includes(priority);

    const priorityBackgroundColor = 
      priority === 'low' ? 'bg-blue-100' : 
      priority === 'medium' ? 'bg-green-100' : 
      priority === 'high' ? 'bg-orange-100' : 
      'bg-red-100';

    return (
      <div className="flex flex-col h-full">
        <Collapsible
          open={!isCollapsed}
          onOpenChange={() => onToggleSection(priority)}
        >
          <CollapsibleTrigger className="w-full">
            <div className={`p-2 ${priorityBackgroundColor} rounded-t-md font-medium flex justify-between items-center`}>
              <h2>{capitalizedPriority}</h2>
              <div className="flex items-center">
                <span className="bg-gray-100 px-2 rounded-full text-sm mr-2">{priorityTasks.length}</span>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div 
              className="flex-1 p-2 bg-gray-50 rounded-b-md overflow-y-auto min-h-[200px]"
              onDragOver={(e) => handleDragOver(e, priority)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, priority)}
            >
              {priorityTasks.map((task, index) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task)}
                  onDragOver={(e) => handleDragOver(e, priority, index)}
                  onDrop={(e) => handleDrop(e, priority, index)}
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
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2" 
                onClick={() => onAddTask(priority)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  const renderScheduledColumn = () => {
    const scheduledTasks = getScheduledTasks();
    const isCollapsed = collapsedSections.includes('scheduled');

    return (
      <div className="flex flex-col h-full">
        <Collapsible
          open={!isCollapsed}
          onOpenChange={() => onToggleSection('scheduled')}
        >
          <CollapsibleTrigger className="w-full">
            <div className="p-2 bg-purple-100 rounded-t-md font-medium flex justify-between items-center">
              <h2>Scheduled</h2>
              <div className="flex items-center">
                <span className="bg-gray-100 px-2 rounded-full text-sm mr-2">{scheduledTasks.length}</span>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex-1 p-2 bg-gray-50 rounded-b-md overflow-y-auto min-h-[200px]">
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
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-5 gap-4 h-full">
      {priorities.map(priority => (
        <div key={priority} className="col-span-1">
          {renderColumn(priority)}
        </div>
      ))}
      <div className="col-span-1">
        {renderScheduledColumn()}
      </div>
    </div>
  );
};

export default TaskBoard;
