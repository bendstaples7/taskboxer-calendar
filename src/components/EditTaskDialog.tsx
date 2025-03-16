
import React, { useState, useEffect } from 'react';
import { Task, Label } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import TaskTimer from './TaskTimer';
import EditableField from './EditableField';
import EditablePriority from './EditablePriority';
import EditableTime from './EditableTime';
import EditableLabels from './EditableLabels';
import TaskControls from './TaskControls';

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onUpdate: (task: Task) => void;
  onComplete: () => void;
  onUnschedule: () => void;
  onStartTimer: (taskId: string) => void;
  onStopTimer: (taskId: string) => void;
  onTimerComplete: (taskId: string) => void;
  onAddTime: (taskId: string, minutes: number) => void;
  onDelete?: (taskId: string) => void;
  availableLabels: Label[];
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onUpdate,
  onComplete,
  onUnschedule,
  onStartTimer,
  onStopTimer,
  onTimerComplete,
  onAddTime,
  onDelete,
  availableLabels
}) => {
  // Track editing states for view/edit mode
  const [editMode, setEditMode] = useState(false);
  
  // Animation state
  const [animationProgress, setAnimationProgress] = useState(0);
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;

  useEffect(() => {
    // Reset editing state when dialog opens
    if (open) {
      setEditMode(false);
    }
  }, [open]);

  // Task running animation
  useEffect(() => {
    let animationFrame: number;
    let startTime: number;
    
    if (isRunning && open) {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        
        // Animation cycle of 2 seconds
        const progress = (elapsed % 2000) / 2000;
        setAnimationProgress(progress);
        
        animationFrame = requestAnimationFrame(animate);
      };
      
      animationFrame = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isRunning, open]);

  const handleUpdateTitle = (title: string) => {
    onUpdate({
      ...task,
      title
    });
  };

  const handleUpdateDescription = (description: string) => {
    onUpdate({
      ...task,
      description
    });
  };

  const handleUpdatePriority = (priority: any) => {
    onUpdate({
      ...task,
      priority
    });
  };

  const handleUpdateTime = (estimatedTime: number) => {
    onUpdate({
      ...task,
      estimatedTime
    });
  };

  const handleUpdateLabels = (labels: Label[]) => {
    onUpdate({
      ...task,
      labels
    });
  };

  const handleTimerStart = () => {
    onStartTimer(task.id);
    onOpenChange(false); // Close dialog when starting task
  };

  const handleTimerStop = () => {
    onStopTimer(task.id);
  };

  const handleTimerComplete = () => {
    onTimerComplete(task.id);
    onComplete();
  };

  const handleUnschedule = () => {
    onUnschedule();
    onOpenChange(false);
  };

  const handleComplete = () => {
    onComplete();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(task.id);
      onOpenChange(false);
    }
  };

  const handleAddTime = (minutes: number) => {
    onAddTime(task.id, minutes);
  };

  // Calculate animation properties
  const animationBorderWidth = isRunning ? 2 + Math.sin(animationProgress * Math.PI * 2) * 1 : 0;
  const animationGlow = isRunning ? 5 + Math.sin(animationProgress * Math.PI * 2) * 3 : 0;
  const animationColor = `rgba(155, 135, 245, ${isRunning ? 0.7 + Math.sin(animationProgress * Math.PI * 2) * 0.3 : 0})`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden"
        style={{
          boxShadow: isRunning ? `0 0 ${animationGlow}px ${animationColor}` : undefined,
          border: isRunning ? `${animationBorderWidth}px solid ${animationColor}` : undefined,
          transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out'
        }}
      >
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <EditableField 
            label="Title"
            value={task.title}
            onUpdate={handleUpdateTitle}
            disabled={task.completed}
          />
          
          <EditableField 
            label="Description"
            value={task.description}
            onUpdate={handleUpdateDescription}
            multiline={true}
            disabled={task.completed}
          />
          
          <EditablePriority 
            priority={task.priority}
            onUpdate={handleUpdatePriority}
            disabled={task.completed}
          />
          
          <EditableTime 
            minutes={task.estimatedTime}
            onUpdate={handleUpdateTime}
            disabled={task.completed}
          />
          
          <EditableLabels 
            selectedLabels={task.labels}
            availableLabels={availableLabels}
            onUpdate={handleUpdateLabels}
            disabled={task.completed}
          />
          
          {task.scheduled ? (
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Time</label>
              <div className="text-sm bg-gray-50 p-2 rounded border">
                {format(new Date(task.scheduled.start), 'PPp')} - 
                {format(new Date(task.scheduled.end), 'PPp')}
              </div>
              
              <TaskTimer
                duration={task.estimatedTime}
                onComplete={handleTimerComplete}
                onTimerStart={handleTimerStart}
                onTimerStop={handleTimerStop}
                onTimeAdjust={handleAddTime}
                initialTimeLeft={task.remainingTime ? task.remainingTime * 60 : task.estimatedTime * 60}
                expired={task.timerExpired}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <TaskControls
                task={task}
                onStartTimer={handleTimerStart}
                onStopTimer={handleTimerStop}
                onComplete={handleComplete}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <TaskControls
            task={task}
            onStartTimer={handleTimerStart}
            onStopTimer={handleTimerStop}
            onComplete={handleComplete}
            onUnschedule={task.scheduled ? handleUnschedule : undefined}
            onDelete={onDelete ? handleDelete : undefined}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
