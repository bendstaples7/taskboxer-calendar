
import React, { useState } from 'react';
import { Task, Priority, Label } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, Trash } from 'lucide-react';
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
  availableLabels: Label[];
}

const EditTaskDialog: React.FC<EditTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onUpdate,
  onComplete,
  onUnschedule,
  availableLabels
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [estimatedTime, setEstimatedTime] = useState(task.estimatedTime);
  const [selectedLabels, setSelectedLabels] = useState<Label[]>(task.labels);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Task description" 
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select 
              value={priority} 
              onValueChange={(value: Priority) => setPriority(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
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
          
          {task.scheduled && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Scheduled Time</label>
              <div className="text-sm bg-gray-50 p-2 rounded border">
                {format(new Date(task.scheduled.start), 'PPp')} - 
                {format(new Date(task.scheduled.end), 'PPp')}
              </div>
              
              <TaskTimer
                duration={task.estimatedTime}
                onComplete={onComplete}
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
          <div className="flex gap-2">
            {task.scheduled && (
              <Button 
                variant="outline" 
                onClick={onUnschedule}
              >
                Return to Task Board
              </Button>
            )}
            
            <Button 
              variant="destructive" 
              onClick={onComplete}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Mark as Completed
            </Button>
          </div>
          
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskDialog;
