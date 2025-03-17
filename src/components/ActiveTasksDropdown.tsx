
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Task } from "@/lib/types";
import { Play, Clock, Plus, Check, AlarmClock } from "lucide-react";
import TaskProgressCircle from './TaskProgressCircle';

interface ActiveTasksDropdownProps {
  activeTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAddTime: (taskId: string, minutes: number) => void;
  onOpenTask: (task: Task) => void;
}

const ActiveTasksDropdown: React.FC<ActiveTasksDropdownProps> = ({
  activeTasks,
  onCompleteTask,
  onAddTime,
  onOpenTask
}) => {
  const [open, setOpen] = useState(false);
  
  if (activeTasks.length === 0) {
    return null;
  }
  
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };
  
  const getProgress = (task: Task) => {
    if (task.completed) return 1;
    if (!task.timerStarted) return 0;
    
    const elapsedMinutes = task.timerElapsed || 0;
    return Math.min(elapsedMinutes / task.estimatedTime, 1);
  };
  
  const handleAddTime = (taskId: string, minutes: number, e: React.MouseEvent) => {
    e.stopPropagation();
    onAddTime(taskId, minutes);
    setOpen(false);
  };
  
  const handleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onCompleteTask(taskId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="animate-pulse">
          <Play className="h-4 w-4 mr-1 text-green-600" />
          <span className="text-green-600">
            {activeTasks.length} Active {activeTasks.length === 1 ? 'Task' : 'Tasks'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Running Tasks</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {activeTasks.map(task => (
          <DropdownMenuItem
            key={task.id}
            className="flex flex-col items-stretch py-2 cursor-pointer"
            onClick={() => {
              onOpenTask(task);
              setOpen(false);
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{task.title}</span>
              <TaskProgressCircle progress={getProgress(task)} size={18} />
            </div>
            
            <div className="text-xs text-gray-500 flex justify-between items-center">
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {formatTime(task.estimatedTime)}
              </div>
              
              <div className="flex gap-1">
                <button
                  className="rounded-full bg-gray-200 hover:bg-gray-300 p-1"
                  onClick={(e) => handleAddTime(task.id, 15, e)}
                  title="Add 15 minutes"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <button
                  className="rounded-full bg-green-100 hover:bg-green-200 p-1"
                  onClick={(e) => handleComplete(task.id, e)}
                  title="Mark complete"
                >
                  <Check className="h-3 w-3 text-green-700" />
                </button>
              </div>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ActiveTasksDropdown;
