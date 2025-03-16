
import React from 'react';
import { Button } from "@/components/ui/button";
import { Task } from "@/lib/types";
import { CheckCircle, Play, Pause, Calendar, Trash } from "lucide-react";

interface TaskControlsProps {
  task: Task;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onComplete: () => void;
  onUnschedule?: () => void;
  onDelete?: () => void;
}

const TaskControls: React.FC<TaskControlsProps> = ({
  task,
  onStartTimer,
  onStopTimer,
  onComplete,
  onUnschedule,
  onDelete
}) => {
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;

  return (
    <div className="space-y-2">
      {isRunning ? (
        <Button 
          className="w-full bg-orange-500 hover:bg-orange-600"
          onClick={onStopTimer}
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause Timer
        </Button>
      ) : (
        <Button 
          className="w-full bg-purple-600 hover:bg-purple-700"
          onClick={onStartTimer}
          disabled={task.completed}
        >
          <Calendar className="h-4 w-4 mr-2" />
          <Play className="h-4 w-4 mr-1" />
          {task.scheduled ? 'Resume Task' : 'Start Task Now'}
        </Button>
      )}
      
      <div className="flex justify-between gap-2">
        {task.scheduled && onUnschedule && (
          <Button 
            variant="outline" 
            onClick={onUnschedule}
            className="flex-1"
          >
            Unschedule Task
          </Button>
        )}
        
        <Button 
          variant="destructive" 
          onClick={onComplete}
          className="flex-1 bg-green-600 hover:bg-green-700"
          disabled={task.completed}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Mark as Completed
        </Button>
        
        {onDelete && (
          <Button 
            variant="destructive" 
            onClick={onDelete}
            className="flex-1"
          >
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
        )}
      </div>
    </div>
  );
};

export default TaskControls;
