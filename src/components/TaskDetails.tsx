
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Task } from "@/lib/types";
import { Trash, Calendar, Play, Pause, CheckCircle } from "lucide-react";
import EditableField from './EditableField';
import EditablePriority from './EditablePriority';
import EditableLabels from './EditableLabels';
import EditableTime from './EditableTime';
import TaskTimer from './TaskTimer';

interface TaskDetailsProps {
  task: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedTask: Task) => void;
  onComplete: () => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onUnschedule?: () => void;
  onDelete?: () => void;
  availableLabels: any[];
  onAddLabel?: (label: any) => void;
}

const TaskDetails: React.FC<TaskDetailsProps> = ({
  task,
  open,
  onOpenChange,
  onUpdate,
  onComplete,
  onStartTimer,
  onStopTimer,
  onUnschedule,
  onDelete,
  availableLabels,
  onAddLabel
}) => {
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className={isRunning ? "animate-pulse text-purple-600" : ""}>
            {task.title}
            {isRunning && (
              <span className="ml-2 inline-block animate-pulse">⚡</span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <EditableField
            label="Title"
            value={task.title}
            onUpdate={(value) => onUpdate({ ...task, title: value })}
          />
          
          <EditableField
            label="Description"
            value={task.description || ""}
            onUpdate={(value) => onUpdate({ ...task, description: value })}
            multiline
          />
          
          <EditablePriority
            priority={task.priority}
            onUpdate={(value) => onUpdate({ ...task, priority: value })}
          />
          
          <EditableTime
            minutes={task.estimatedTime}
            onUpdate={(minutes) => onUpdate({ ...task, estimatedTime: minutes })}
          />
          
          <EditableLabels
            selectedLabels={task.labels}
            availableLabels={availableLabels}
            onUpdate={(labels) => onUpdate({ ...task, labels })}
            onAddLabel={onAddLabel}
          />

          {task.timerStarted && !task.completed && (
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Time Remaining:</p>
              {/* Update TaskTimer props to match the component's interface */}
              <TaskTimer 
                duration={task.estimatedTime}
                onComplete={() => {}}
                initialTimeLeft={task.remainingTime ? task.remainingTime * 60 : task.estimatedTime * 60}
                className={isRunning ? "animate-pulse" : ""}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <div className="grid grid-cols-2 gap-2 w-full">
            {isRunning ? (
              <Button 
                variant="outline" 
                className="bg-orange-500 hover:bg-orange-600 text-white"
                onClick={onStopTimer}
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause Timer
              </Button>
            ) : (
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={onStartTimer}
                disabled={task.completed}
              >
                <Play className="h-4 w-4 mr-2" />
                {task.scheduled ? 'Resume Task' : 'Start Task Now'}
              </Button>
            )}
            
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={onComplete}
              disabled={task.completed}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Complete
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 w-full">
            {task.scheduled && onUnschedule && (
              <Button 
                variant="outline" 
                onClick={onUnschedule}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Unschedule
              </Button>
            )}
            
            {onDelete && (
              <Button 
                variant="destructive" 
                onClick={onDelete}
                className={!task.scheduled && !onUnschedule ? "col-span-2" : ""}
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete Task
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
