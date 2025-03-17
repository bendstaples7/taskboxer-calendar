
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Task, Label } from "@/lib/types";
import { format } from 'date-fns';
import TaskProgressCircle from './TaskProgressCircle';
import TaskControls from './TaskControls';
import { getElapsedMinutes } from '@/lib/timeUtils';

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
  const [editingField, setEditingField] = useState<string | null>(null);
  const [localTask, setLocalTask] = useState(task);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;
  
  // Reset local task when the dialog opens or the task changes
  useEffect(() => {
    setLocalTask(task);
    setEditingField(null);
  }, [task, open]);

  // Handle running task animation
  useEffect(() => {
    let animationFrame: number;
    
    if (isRunning && open) {
      const animate = (timestamp: number) => {
        // Create a subtle pulsing effect
        const progress = (timestamp % 2000) / 2000;
        const pulse = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;
        setAnimationProgress(pulse);
        
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
  
  const handleUpdateField = (field: string, value: any) => {
    const updatedTask = { ...localTask, [field]: value };
    setLocalTask(updatedTask);
    onUpdate(updatedTask);
    setEditingField(null);
  };
  
  // Calculate progress percentage
  const progress = (() => {
    if (task.completed) return 1;
    if (!task.timerStarted) return 0;
    
    const elapsedMinutes = task.timerElapsed || 0;
    return Math.min(elapsedMinutes / task.estimatedTime, 1);
  })();

  // Animation styles for running tasks
  const glowStrength = isRunning ? 5 + Math.sin(animationProgress * Math.PI) * 3 : 0;
  const borderWidth = isRunning ? 1 + Math.sin(animationProgress * Math.PI) * 1 : 0;
  const glowColor = `rgba(100, 100, 100, ${isRunning ? 0.5 + Math.sin(animationProgress * Math.PI) * 0.5 : 0})`;
  
  const fieldClassName = "p-3 rounded-md border relative group";
  const editableFieldClassName = "cursor-pointer hover:bg-gray-50 transition-colors";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden"
        style={{
          boxShadow: isRunning ? `0 0 ${glowStrength}px ${glowColor}` : undefined,
          border: isRunning ? `${borderWidth}px solid ${glowColor}` : undefined,
          transition: 'box-shadow 0.3s ease-in-out, border 0.3s ease-in-out'
        }}
      >
        <DialogHeader>
          <DialogTitle 
            className={`group cursor-pointer ${isRunning ? "text-gray-700" : ""}`}
            onClick={() => setEditingField('title')}
          >
            {editingField === 'title' ? (
              <input 
                type="text"
                className="w-full p-2 border rounded"
                value={localTask.title}
                onChange={(e) => setLocalTask({...localTask, title: e.target.value})}
                onBlur={() => handleUpdateField('title', localTask.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUpdateField('title', localTask.title);
                  }
                }}
                autoFocus
              />
            ) : (
              <span className="relative">
                {localTask.title}
                <span className="absolute inset-0 bg-gray-100 opacity-0 group-hover:opacity-10 transition-opacity rounded"></span>
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Description */}
          <div 
            className={`${fieldClassName} ${editingField !== 'description' ? editableFieldClassName : ''}`}
            onClick={() => setEditingField('description')}
          >
            <label className="text-xs font-medium text-gray-500">Description</label>
            {editingField === 'description' ? (
              <textarea
                className="w-full p-2 border rounded mt-1"
                value={localTask.description || ''}
                onChange={(e) => setLocalTask({...localTask, description: e.target.value})}
                onBlur={() => handleUpdateField('description', localTask.description)}
                rows={3}
                autoFocus
              />
            ) : (
              <div className="mt-1">
                {localTask.description || 'No description'}
              </div>
            )}
          </div>
          
          {/* Priority */}
          <div 
            className={`${fieldClassName} ${editingField !== 'priority' ? editableFieldClassName : ''}`}
            onClick={() => setEditingField('priority')}
          >
            <label className="text-xs font-medium text-gray-500">Priority</label>
            {editingField === 'priority' ? (
              <select
                className="w-full p-2 border rounded mt-1"
                value={localTask.priority}
                onChange={(e) => setLocalTask({...localTask, priority: e.target.value as any})}
                onBlur={() => handleUpdateField('priority', localTask.priority)}
                autoFocus
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            ) : (
              <div className="mt-1 capitalize">
                {localTask.priority}
              </div>
            )}
          </div>
          
          {/* Estimated Time */}
          <div 
            className={`${fieldClassName} ${editingField !== 'estimatedTime' ? editableFieldClassName : ''}`}
            onClick={() => setEditingField('estimatedTime')}
          >
            <label className="text-xs font-medium text-gray-500">Estimated Time</label>
            {editingField === 'estimatedTime' ? (
              <div className="flex gap-2 mt-1">
                <input
                  type="number"
                  className="w-full p-2 border rounded"
                  value={localTask.estimatedTime}
                  onChange={(e) => setLocalTask({...localTask, estimatedTime: parseInt(e.target.value)})}
                  onBlur={() => handleUpdateField('estimatedTime', localTask.estimatedTime)}
                  min={1}
                  autoFocus
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleUpdateField('estimatedTime', localTask.estimatedTime)}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="mt-1 flex items-center gap-2">
                <TaskProgressCircle 
                  progress={progress} 
                  size={20} 
                  strokeWidth={3}
                />
                <span>
                  {Math.floor(localTask.estimatedTime / 60) > 0 
                    ? `${Math.floor(localTask.estimatedTime / 60)}h ${localTask.estimatedTime % 60}m` 
                    : `${localTask.estimatedTime}m`}
                </span>
              </div>
            )}
          </div>
          
          {/* Labels */}
          <div 
            className={`${fieldClassName} ${editingField !== 'labels' ? editableFieldClassName : ''}`}
            onClick={() => setEditingField('labels')}
          >
            <label className="text-xs font-medium text-gray-500">Labels</label>
            {editingField === 'labels' ? (
              <div className="mt-1 p-2 border rounded">
                {availableLabels.map(label => (
                  <div key={label.id} className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      id={`label-${label.id}`}
                      checked={localTask.labels.some(l => l.id === label.id)}
                      onChange={(e) => {
                        const newLabels = e.target.checked 
                          ? [...localTask.labels, label] 
                          : localTask.labels.filter(l => l.id !== label.id);
                        setLocalTask({...localTask, labels: newLabels});
                      }}
                    />
                    <label 
                      htmlFor={`label-${label.id}`}
                      className="flex items-center gap-1"
                      style={{ color: label.color }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: label.color }}
                      ></div>
                      {label.name}
                    </label>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => handleUpdateField('labels', localTask.labels)}
                >
                  Save
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 mt-1">
                {localTask.labels.length > 0 ? (
                  localTask.labels.map(label => (
                    <span 
                      key={label.id} 
                      className="px-2 py-1 rounded-full text-xs text-white"
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No labels</span>
                )}
              </div>
            )}
          </div>
          
          {/* Scheduled Time */}
          {task.scheduled && (
            <div className="p-3 rounded-md border">
              <label className="text-xs font-medium text-gray-500">Scheduled</label>
              <div className="mt-1">
                {format(new Date(task.scheduled.start), 'PPp')} - 
                {format(new Date(task.scheduled.end), 'PPp')}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="pt-2">
          <TaskControls 
            task={task}
            onStartTimer={onStartTimer}
            onStopTimer={onStopTimer}
            onComplete={onComplete}
            onUnschedule={onUnschedule}
            onDelete={onDelete}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetails;
