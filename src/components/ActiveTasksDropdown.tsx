
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Play, Pause, Plus, Check, Timer } from "lucide-react";
import { Task } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TaskProgressCircle from './TaskProgressCircle';

interface ActiveTasksDropdownProps {
  activeTasks: Task[];
  onCompleteTask: (taskId: string) => void;
  onAddTime: (taskId: string, minutes: number) => void;
  onOpenTask: (task: Task) => void;
}

const ActiveTasksDropdown: React.FC<ActiveTasksDropdownProps> = ({ activeTasks, onCompleteTask, onAddTime, onOpenTask }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTimes, setCurrentTimes] = useState<{ [key: string]: number }>({});
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Calculate initial elapsed times
    const times: { [key: string]: number } = {};
    activeTasks.forEach(task => {
      if (task.timerStarted) {
        const elapsedMs = Date.now() - new Date(task.timerStarted).getTime();
        const elapsedMinutes = elapsedMs / (1000 * 60);
        times[task.id] = Math.min(elapsedMinutes, task.estimatedTime);
      }
    });
    setCurrentTimes(times);

    // Start interval to update times
    intervalRef.current = setInterval(() => {
      setCurrentTimes(prev => {
        const updated = { ...prev };
        activeTasks.forEach(task => {
          if (task.timerStarted && !task.timerPaused) {
            const elapsedMs = Date.now() - new Date(task.timerStarted).getTime();
            const elapsedMinutes = elapsedMs / (1000 * 60);
            updated[task.id] = Math.min(elapsedMinutes, task.estimatedTime);
          }
        });
        return updated;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [activeTasks]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return `${hours > 0 ? `${hours}h ` : ''}${mins}m`;
  };

  const getElapsedPercentage = (task: Task) => {
    const elapsed = currentTimes[task.id] || 0;
    return Math.min(elapsed / task.estimatedTime, 1);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`relative ${activeTasks.length > 0 ? 'animate-pulse' : ''}`}
        >
          <Timer className="h-4 w-4 mr-1" />
          Active Tasks 
          {activeTasks.length > 0 && (
            <span className="ml-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {activeTasks.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-72 p-3"
        align="end"
        sideOffset={5}
        style={{ 
          maxHeight: 'calc(90vh - 100px)', 
          overflowY: 'auto', 
          maxWidth: '90vw',
          position: 'fixed',
          top: 'auto',
          bottom: 'auto'
        }}
      >
        <div className="flex flex-col space-y-3">
          <h3 className="text-sm font-medium">Active Tasks</h3>
          
          {activeTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tasks</p>
          ) : (
            activeTasks.map(task => (
              <div 
                key={task.id} 
                className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                onClick={() => {
                  setIsOpen(false);
                  onOpenTask(task);
                }}
              >
                <div className="font-medium text-sm">{task.title}</div>
                
                <div className="mt-2 relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${getElapsedPercentage(task) * 100}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-2">
                    <TaskProgressCircle progress={getElapsedPercentage(task)} size={16} />
                    <span className="text-xs">
                      {formatTime(currentTimes[task.id] || 0)} / {formatTime(task.estimatedTime)}
                    </span>
                  </div>
                  
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddTime(task.id, 15);
                      }}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="xs" 
                      className="h-6 w-6 p-0 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onCompleteTask(task.id);
                        setIsOpen(false);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ActiveTasksDropdown;
