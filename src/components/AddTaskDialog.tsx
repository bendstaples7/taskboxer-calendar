
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Priority, Task, Label as TaskLabel } from "@/lib/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckIcon, PlusIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";

interface AddTaskDialogProps {
  open: boolean;
  initialPriority?: Priority;
  onOpenChange: (open: boolean) => void;
  onAddTask: (task: Task) => void;
  availableLabels: TaskLabel[];
  onAddLabel: (label: TaskLabel) => void;
  initialDuration?: number;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  initialPriority = 'medium',
  onOpenChange,
  onAddTask,
  availableLabels,
  onAddLabel,
  initialDuration
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>(initialPriority);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [showLabelForm, setShowLabelForm] = useState(false);

  // Set initial duration if provided
  useEffect(() => {
    if (initialDuration) {
      const hours = Math.floor(initialDuration / 60);
      const minutes = initialDuration % 60;
      setEstimatedHours(hours);
      setEstimatedMinutes(minutes);
    }
  }, [initialDuration]);

  // Reset priority when initialPriority changes
  useEffect(() => {
    setPriority(initialPriority);
  }, [initialPriority]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(initialPriority);
    setEstimatedHours(0);
    setEstimatedMinutes(30);
    setSelectedLabels([]);
    setNewLabelName("");
    setNewLabelColor("#3B82F6");
    setShowLabelForm(false);
  };

  const handleAddTask = () => {
    if (!title.trim()) return;

    const totalMinutes = estimatedHours * 60 + estimatedMinutes;
    
    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      priority,
      estimatedTime: totalMinutes,
      completed: false,
      labels: availableLabels.filter(label => selectedLabels.includes(label.id))
    };

    onAddTask(newTask);
    resetForm();
    onOpenChange(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddTask();
    }
  };

  const toggleLabel = (labelId: string) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    );
  };

  const handleAddLabel = () => {
    if (!newLabelName.trim()) return;

    const newLabel: TaskLabel = {
      id: uuidv4(),
      name: newLabelName.trim(),
      color: newLabelColor
    };

    onAddLabel(newLabel);
    setSelectedLabels(prev => [...prev, newLabel.id]);
    setNewLabelName("");
    setNewLabelColor("#3B82F6");
    setShowLabelForm(false);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Priority</Label>
            <RadioGroup 
              value={priority} 
              onValueChange={(value) => setPriority(value as Priority)}
              className="flex"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low" className="text-blue-500 font-medium">Low</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium" className="text-yellow-500 font-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high" className="text-orange-500 font-medium">High</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="critical" id="critical" />
                <Label htmlFor="critical" className="text-red-500 font-medium">Critical</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid gap-2">
            <Label>Estimated Time</Label>
            <div className="flex gap-2">
              <div className="grid grid-cols-3 items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                  className="col-span-2"
                />
                <span>hours</span>
              </div>
              <div className="grid grid-cols-3 items-center gap-1">
                <Input
                  type="number"
                  min="0"
                  max="59"
                  value={estimatedMinutes}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setEstimatedMinutes(value > 59 ? 59 : value);
                  }}
                  className="col-span-2"
                />
                <span>minutes</span>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Labels</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableLabels.map((label) => (
                <Badge
                  key={label.id}
                  style={{ 
                    backgroundColor: selectedLabels.includes(label.id) ? label.color : 'transparent',
                    color: selectedLabels.includes(label.id) ? 'white' : 'inherit',
                    border: `1px solid ${label.color}`
                  }}
                  className="cursor-pointer"
                  onClick={() => toggleLabel(label.id)}
                >
                  {label.name}
                  {selectedLabels.includes(label.id) && (
                    <CheckIcon className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
            
            {showLabelForm ? (
              <div className="grid gap-2 border p-2 rounded-md">
                <div className="flex gap-2">
                  <Input
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Label name"
                  />
                  <input
                    type="color"
                    value={newLabelColor}
                    onChange={(e) => setNewLabelColor(e.target.value)}
                    className="w-12 h-10 rounded-md"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowLabelForm(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button 
                    type="button" 
                    size="sm"
                    onClick={handleAddLabel}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowLabelForm(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Label
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleAddTask}>Create Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
