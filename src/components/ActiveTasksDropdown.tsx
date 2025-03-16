
import React, { useState } from "react";
import { Task } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Loader, CheckCircle, Clock, Plus, Minus, Pause } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ActiveTasksDropdownProps {
  activeTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAddTime: (taskId: string, minutes: number) => void;
  onOpenTask: (task: Task) => void;
  onStopTimer?: (taskId: string) => void;
}

const ActiveTasksDropdown: React.FC<ActiveTasksDropdownProps> = ({
  activeTasks,
  onCompleteTask,
  onAddTime,
  onOpenTask,
  onStopTimer
}) => {
  const [openPopover, setOpenPopover] = useState(false);
  
  if (activeTasks.length === 0) {
    return null;
  }

  const currentTask = activeTasks[0];
  const progress = calculateProgress(currentTask);

  function calculateProgress(task: Task): number {
    if (!task.timerStarted) return 100;
    
    const elapsedMs = Date.now() - new Date(task.timerStarted).getTime();
    const elapsedMinutes = elapsedMs / (1000 * 60);
    const percentComplete = (elapsedMinutes / task.estimatedTime) * 100;
    
    return Math.min(100, Math.max(0, 100 - percentComplete));
  }

  const handleAddTime = (taskId: string, minutes: number) => {
    onAddTime(taskId, minutes);
    setOpenPopover(false);
  };

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={cn(
            "flex items-center gap-2 border-l-4",
            currentTask.priority === 'low' ? 'border-l-blue-500' : 
            currentTask.priority === 'medium' ? 'border-l-yellow-500' : 
            currentTask.priority === 'high' ? 'border-l-orange-500' : 
            'border-l-red-500'
          )}
        >
          <div className="relative h-5 w-5 flex items-center justify-center">
            <Loader className="h-5 w-5 animate-spin text-blue-500" />
            {activeTasks.length > 1 && (
              <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {activeTasks.length}
              </span>
            )}
          </div>
          <span className="truncate max-w-[150px]">{currentTask.title}</span>
          <Progress value={progress} className="w-20 h-2" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-3 border-b">
          <h3 className="font-medium">Active Tasks</h3>
        </div>
        <div className="max-h-80 overflow-auto">
          {activeTasks.map(task => (
            <div 
              key={task.id} 
              className="p-3 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
              onClick={() => onOpenTask(task)}
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{task.title}</h4>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {task.timerStarted && format(new Date(task.timerStarted), 'HH:mm')}
                </span>
              </div>
              
              <Progress value={calculateProgress(task)} className="mb-2 h-2" />
              
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{task.estimatedTime} min</span>
                </div>
                
                <div className="flex gap-1">
                  {/* Quick actions for active tasks */}
                  {onStopTimer && !task.timerExpired && (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-7 px-2 flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStopTimer(task.id);
                      }}
                    >
                      <Pause className="h-3 w-3" />
                      <span className="text-xs">Pause</span>
                    </Button>
                  )}
                  
                  {task.timerExpired && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-7 px-2 flex items-center gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddTime(task.id, 30);
                        }}
                      >
                        <Plus className="h-3 w-3" />
                        <span className="text-xs">30m</span>
                      </Button>
                    </>
                  )}
                  
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-7 px-2 flex items-center gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompleteTask(task.id);
                    }}
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span className="text-xs">Done</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ActiveTasksDropdown;
