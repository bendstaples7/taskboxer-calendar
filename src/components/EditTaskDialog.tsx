
import React, { useState, useEffect } from 'react';
import { Task, Priority, Label } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, CheckCircle, Calendar, Play, Pause, 
  SignalLow, SignalMedium, SignalHigh, Flame, Pencil 
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TaskTimer from './TaskTimer';
import { format } from 'date-fns';

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
  availableLabels
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(task.labels);
  
  // Track editing states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editingPriority, setEditingPriority] = useState(false);
  const [editingTime, setEditingTime] = useState(false);
  const [editingLabels, setEditingLabels] = useState(false);

  // Animation state
  const [animationProgress, setAnimationProgress] = useState(0);
  const isRunning = task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired;

  useEffect(() => {
    // Update local state when task prop changes
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEstimatedTime(task.estimatedTime);
    setSelectedLabels(task.labels);
    
    // Reset editing states when dialog opens
    setEditingTitle(false);
    setEditingDescription(false);
    setEditingPriority(false);
    setEditingTime(false);
    setEditingLabels(false);
  }, [task, open]);

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

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      priority,
      estimatedTime,
      labels: selectedLabels
    });
    
    // Reset all editing states
    setEditingTitle(false);
    setEditingDescription(false);
    setEditingPriority(false);
    setEditingTime(false);
    setEditingLabels(false);
  };

  const toggleLabel = (label: Label) => {
    if (selectedLabels.some(l => l.id === label.id)) {
      setSelectedLabels(selectedLabels.filter(l => l.id !== label.id));
    } else {
      setSelectedLabels([...selectedLabels, label]);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
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

  const handleAddTime = (minutes: number) => {
    onAddTime(task.id, minutes);
  };

  const getPriorityIcon = (priority: Priority) => {
    switch (priority) {
      case 'low':
        return <SignalLow className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <SignalMedium className="h-4 w-4 text-green-500" />;
      case 'high':
        return <SignalHigh className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
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
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Title</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setEditingTitle(!editingTitle)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {editingTitle ? (
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="Task title" 
                className="w-full"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">{title}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Description</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setEditingDescription(!editingDescription)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {editingDescription ? (
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Task description" 
                rows={3}
                className="w-full resize-none"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border min-h-[4rem]">{description || "No description"}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Priority</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setEditingPriority(!editingPriority)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {editingPriority ? (
              <Select 
                value={priority} 
                onValueChange={(value: Priority) => setPriority(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority">
                    {priority && (
                      <div className="flex items-center gap-2">
                        {getPriorityIcon(priority)}
                        <span className="capitalize">{priority}</span>
                      </div>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <SignalLow className="h-4 w-4 text-blue-500" />
                      <span>Low</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <SignalMedium className="h-4 w-4 text-green-500" />
                      <span>Medium</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <SignalHigh className="h-4 w-4 text-orange-500" />
                      <span>High</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-red-500" />
                      <span>Critical</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-gray-50 rounded border flex items-center gap-2">
                {getPriorityIcon(priority)}
                <span className="capitalize">{priority}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Estimated Time</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setEditingTime(!editingTime)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {editingTime ? (
              <Input 
                type="number" 
                value={estimatedTime} 
                onChange={(e) => setEstimatedTime(parseInt(e.target.value))} 
                min={1}
                className="w-full"
              />
            ) : (
              <div className="p-2 bg-gray-50 rounded border">{formatTime(estimatedTime)}</div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Labels</label>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0" 
                onClick={() => setEditingLabels(!editingLabels)}
              >
                <Pencil className="h-3 w-3" />
              </Button>
            </div>
            {editingLabels ? (
              <div className="flex flex-wrap gap-2">
                {availableLabels.map((label) => (
                  <Badge 
                    key={label.id} 
                    style={{ 
                      backgroundColor: selectedLabels.some(l => l.id === label.id) 
                        ? label.color 
                        : 'transparent',
                      color: selectedLabels.some(l => l.id === label.id) 
                        ? 'white' 
                        : 'black',
                      border: `1px solid ${label.color}`
                    }}
                    className="cursor-pointer"
                    onClick={() => toggleLabel(label)}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <div className="p-2 bg-gray-50 rounded border flex flex-wrap gap-1">
                {selectedLabels.length > 0 ? (
                  selectedLabels.map((label) => (
                    <Badge 
                      key={label.id} 
                      style={{ backgroundColor: label.color }}
                      className="text-white"
                    >
                      {label.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-gray-500">No labels</span>
                )}
              </div>
            )}
          </div>
          
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
              
              {/* Add Stop Timer Button for running timers */}
              {task.timerStarted && !task.timerPaused && !task.timerExpired && (
                <Button 
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  onClick={handleTimerStop}
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Timer
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={handleTimerStart}
              >
                <Calendar className="h-4 w-4 mr-2" />
                <Play className="h-4 w-4 mr-1" />
                Start Task Now
              </Button>
              <p className="text-xs text-gray-500">
                This will schedule the task to start now on the calendar.
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between mt-4">
          <div className="flex gap-2 flex-col sm:flex-row">
            {task.scheduled && (
              <Button 
                variant="outline" 
                onClick={handleUnschedule}
                className="w-full sm:w-auto"
              >
                Unschedule Task
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              onClick={handleComplete}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          </div>
          
          {/* Only show save button if any field is being edited */}
          {(editingTitle || editingDescription || editingPriority || editingTime || editingLabels) && (
            <Button onClick={handleSave} className="w-full sm:w-auto">
              Save Changes
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
