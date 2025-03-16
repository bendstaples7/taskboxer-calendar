
import React, { useState, useEffect } from 'react';
import { Task, Priority, Label } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Calendar, Play, Pause, Square, SignalLow, SignalMedium, SignalHigh, Flame } from 'lucide-react';
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

  useEffect(() => {
    // Update local state when task prop changes
    setTitle(task.title);
    setDescription(task.description);
    setPriority(task.priority);
    setEstimatedTime(task.estimatedTime);
    setSelectedLabels(task.labels);
  }, [task]);

  const handleSave = () => {
    onUpdate({
      ...task,
      title,
      description,
      priority,
      estimatedTime,
      labels: selectedLabels
    });
    onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Task title" 
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Task description" 
              rows={3}
              className="w-full resize-none"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
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
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Estimated Time (minutes)</label>
            <Input 
              type="number" 
              value={estimatedTime} 
              onChange={(e) => setEstimatedTime(parseInt(e.target.value))} 
              min={1}
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Labels</label>
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
                Return to Task Board
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
          
          <Button onClick={handleSave} className="w-full sm:w-auto">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
