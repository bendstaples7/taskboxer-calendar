
import React from "react";
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
  collapsedSections?: string[];
  onToggleSection?: (section: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  collapsedSections = [],
  onToggleSection = () => {},
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

  const renderColumn = (priority: Priority) => {
    const priorityTasks = getPriorityTasks(priority);
    const capitalizedPriority = priority.charAt(0).toUpperCase() + priority.slice(1);
    const isCollapsed = collapsedSections.includes(priority);

    return (
      <div className="flex flex-col h-full">
        <Collapsible
          open={!isCollapsed}
          onOpenChange={() => onToggleSection(priority)}
        >
          <CollapsibleTrigger className="w-full">
            <div className={`p-2 bg-${priority === 'low' ? 'blue' : priority === 'medium' ? 'yellow' : priority === 'high' ? 'orange' : 'red'}-100 rounded-t-md font-medium flex justify-between items-center`}>
              <h2>{capitalizedPriority}</h2>
              <div className="flex items-center">
                <span className="bg-gray-100 px-2 rounded-full text-sm mr-2">{priorityTasks.length}</span>
                {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="flex-1 p-2 bg-gray-50 rounded-b-md overflow-y-auto min-h-[200px]">
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
