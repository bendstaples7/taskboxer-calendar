import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label as UiLabel } from "@/components/ui/label";
import { Priority, Task, Label as TaskLabel } from "@/lib/types";
import { CheckIcon, PlusIcon, X, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { v4 as uuidv4 } from "uuid";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (task: Task) => void;
  availableLabels: TaskLabel[];
  onAddLabel: (label: TaskLabel) => void;
  initialDuration?: number;
  defaultPriority?: Priority;
  labels: TaskLabel[];
  defaultEstimate?: number;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  open,
  defaultPriority = "medium",
  onOpenChange,
  onCreate,
  availableLabels,
  onAddLabel,
  initialDuration
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [estimatedTime, setEstimatedTime] = useState<number>(initialDuration || 30);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [showLabelForm, setShowLabelForm] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  useEffect(() => {
    setPriority(defaultPriority || "medium");
  }, [defaultPriority]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority(defaultPriority || "medium");
    setEstimatedTime(initialDuration || 30);
    setSelectedLabels([]);
    setNewLabelName("");
    setNewLabelColor("#3B82F6");
    setShowLabelForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError("Title is required");
      return;
    }

    setTitleError(null);

    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      priority,
      estimatedTime,
      completed: false,
      labels: availableLabels.filter(label => selectedLabels.includes(label.id)),
    };

    onCreate(newTask);
    resetForm();
    onOpenChange(false);
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
      color: newLabelColor,
    };

    onAddLabel(newLabel);
    setSelectedLabels(prev => [...prev, newLabel.id]);
    setNewLabelName("");
    setNewLabelColor("#3B82F6");
    setShowLabelForm(false);
  };

  const increaseEstimatedTime = () => {
    if (estimatedTime === 15) {
      setEstimatedTime(30);
    } else if (estimatedTime === 30) {
      setEstimatedTime(45);
    } else if (estimatedTime === 45) {
      setEstimatedTime(60);
    } else if (estimatedTime >= 60) {
      if (estimatedTime % 60 === 0) {
        setEstimatedTime(estimatedTime + 30);
      } else {
        setEstimatedTime(Math.ceil(estimatedTime / 60) * 60);
      }
    }
  };

  const decreaseEstimatedTime = () => {
    if (estimatedTime === 30) {
      setEstimatedTime(15);
    } else if (estimatedTime === 45) {
      setEstimatedTime(30);
    } else if (estimatedTime === 60) {
      setEstimatedTime(45);
    } else if (estimatedTime > 60) {
      if (estimatedTime % 60 === 0) {
        setEstimatedTime(estimatedTime - 30);
      } else {
        setEstimatedTime(Math.floor(estimatedTime / 60) * 60);
      }
    }
  };

  const formatTime = (mins: number) => {
    if (mins < 60) {
      return `${mins} min${mins !== 1 ? "s" : ""}`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (remainingMins === 0) {
        return `${hours} hr${hours !== 1 ? "s" : ""}`;
      } else {
        return `${hours} hr ${remainingMins} min`;
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) resetForm();
      onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        {/* IMPORTANT: form starts here, inside DialogContent, but not around DialogContent */}
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <UiLabel htmlFor="title">Title</UiLabel>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Task title"
              autoFocus
            />
            {titleError && (
              <p className="text-red-500 text-sm">{titleError}</p>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <UiLabel htmlFor="description">Description</UiLabel>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Task description"
              rows={3}
            />
          </div>

          {/* Priority */}
          <div className="grid gap-2">
            <UiLabel>Priority</UiLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="justify-start w-[150px]">
                  {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : "Priority"}
                  <ChevronDown className="w-4 h-4 ml-auto opacity-50 shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[150px]">
                {["low", "medium", "high", "critical"].map((level) => (
                  <DropdownMenuItem key={level} onClick={() => setPriority(level as Priority)}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Estimated Time */}
          <div className="grid gap-2">
            <UiLabel>Estimated Time</UiLabel>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={decreaseEstimatedTime}
                disabled={estimatedTime <= 15}
                className="transition-transform active:scale-95"
              >
                -
              </Button>
              <Input
                type="number"
                min="0"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(parseInt(e.target.value) || 0)}
                className="w-32 text-center"
                placeholder={formatTime(estimatedTime)}
              />
              <Button
                variant="outline"
                size="icon"
                type="button"
                onClick={increaseEstimatedTime}
                className="transition-transform active:scale-95"
              >
                +
              </Button>
            </div>
          </div>

          {/* Labels */}
          <div className="grid gap-2">
            <UiLabel>Labels</UiLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {availableLabels.map((label) => (
                <Badge
                  key={label.id}
                  style={{
                    backgroundColor: selectedLabels.includes(label.id) ? label.color : "transparent",
                    color: selectedLabels.includes(label.id) ? "white" : "inherit",
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

            {/* New Label Form */}
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
                  <Button variant="outline" size="sm" type="button" onClick={() => setShowLabelForm(false)}>
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button size="sm" type="button" onClick={handleAddLabel}>
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" size="sm" type="button" onClick={() => setShowLabelForm(true)}>
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Label
              </Button>
            )}
          </div>

          {/* Create Task Button */}
          <DialogFooter>
            <Button type="submit">
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
