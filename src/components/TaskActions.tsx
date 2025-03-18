
import React from 'react';
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { Play, Pause, Check, Trash, Calendar } from "lucide-react";

interface TaskActionsProps {
  task: Task;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onComplete: () => void;
  onUnschedule?: () => void;
  onDelete?: () => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({
  task,
  onStartTimer,
  onStopTimer,
  onComplete,
  onUnschedule,
  onDelete
}) => {
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;
  
  return (
    <div className="flex items-center justify-center gap-2 w-full">
      {task.completed ? (
        <div className="flex items-center justify-center p-2 bg-green-50 rounded-md w-full">
          <span className="text-green-600 font-medium flex items-center">
            <Check className="h-4 w-4 mr-1" />
            Completed
          </span>
        </div>
      ) : (
        <>
          {isRunning ? (
            <Button 
              variant="outline" 
              onClick={onStopTimer}
              className="flex-1"
            >
              <Pause className="h-4 w-4 mr-1" />
              Pause Task
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={onStartTimer}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Play className="h-4 w-4 mr-1" />
              {task.timerStarted && task.timerPaused ? 'Resume Task' : 'Start Task'}
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={onComplete}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Complete
          </Button>
          
          {task.scheduled && onUnschedule && (
            <Button 
              variant="outline" 
              onClick={onUnschedule}
              className="flex-1"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Unschedule
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="outline" 
              onClick={onDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </>
      )}
    </div>
  );
};

export default TaskActions;
