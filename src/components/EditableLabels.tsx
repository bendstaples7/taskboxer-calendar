
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { PenLine, Plus, X } from "lucide-react";
import { Label } from "@/lib/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditableLabelsProps {
  selectedLabels: Label[];
  availableLabels: Label[];
  onUpdate: (labels: Label[]) => void;
  onAddLabel?: (label: Label) => void;
  disabled?: boolean;
}

const LABEL_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#84cc16", // lime
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#d946ef", // pink
  "#6b7280", // gray
];

const EditableLabels: React.FC<EditableLabelsProps> = ({
  selectedLabels,
  availableLabels,
  onUpdate,
  onAddLabel,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [localSelectedLabels, setLocalSelectedLabels] = useState<Label[]>(selectedLabels);
  const [isEditingLabelName, setIsEditingLabelName] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);
  const [isAddingLabel, setIsAddingLabel] = useState(false);
  const newLabelInputRef = useRef<HTMLInputElement>(null);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(localSelectedLabels);
    setEditing(false);
    setIsEditingLabelName(null);
  };

  const handleCancel = () => {
    setLocalSelectedLabels(selectedLabels);
    setEditing(false);
    setIsEditingLabelName(null);
    setIsAddingLabel(false);
  };

  const toggleLabel = (label: Label) => {
    if (localSelectedLabels.some(l => l.id === label.id)) {
      setLocalSelectedLabels(localSelectedLabels.filter(l => l.id !== label.id));
    } else {
      setLocalSelectedLabels([...localSelectedLabels, label]);
    }
  };

  const handleEditLabelName = (labelId: string, currentName: string) => {
    setIsEditingLabelName(labelId);
    setNewLabelName(currentName);
  };

  const handleUpdateLabelName = (labelId: string) => {
    if (newLabelName.trim() === "") return;
    
    // First update local state
    const updatedAvailableLabels = availableLabels.map(label => 
      label.id === labelId ? { ...label, name: newLabelName } : label
    );
    
    // Update selected labels if the label is selected
    const updatedSelectedLabels = localSelectedLabels.map(label => 
      label.id === labelId ? { ...label, name: newLabelName } : label
    );
    
    setLocalSelectedLabels(updatedSelectedLabels);
    
    // If there's a handler to update labels at the parent level
    if (onAddLabel) {
      const labelToUpdate = updatedAvailableLabels.find(l => l.id === labelId);
      if (labelToUpdate) {
        onAddLabel(labelToUpdate);
      }
    }
    
    setIsEditingLabelName(null);
  };

  const handleColorChange = (labelId: string, color: string) => {
    // Update local state
    const updatedAvailableLabels = availableLabels.map(label => 
      label.id === labelId ? { ...label, color } : label
    );
    
    // Update selected labels if the label is selected
    const updatedSelectedLabels = localSelectedLabels.map(label => 
      label.id === labelId ? { ...label, color } : label
    );
    
    setLocalSelectedLabels(updatedSelectedLabels);
    
    // If there's a handler to update labels at the parent level
    if (onAddLabel) {
      const labelToUpdate = updatedAvailableLabels.find(l => l.id === labelId);
      if (labelToUpdate) {
        onAddLabel(labelToUpdate);
      }
    }
  };

  const startAddingNewLabel = () => {
    setIsAddingLabel(true);
    setNewLabelName("");
    setTimeout(() => newLabelInputRef.current?.focus(), 0);
  };

  const handleAddNewLabel = () => {
    if (newLabelName.trim() === "") return;
    
    const newLabel: Label = {
      id: Date.now().toString(),
      name: newLabelName,
      color: newLabelColor,
    };
    
    if (onAddLabel) {
      onAddLabel(newLabel);
      // Automatically select the new label
      setLocalSelectedLabels([...localSelectedLabels, newLabel]);
    }
    
    setIsAddingLabel(false);
    setNewLabelName("");
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Labels</label>
        {!disabled && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0" 
            onClick={handleEdit}
          >
            <PenLine className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {editing ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((label) => (
              <div key={label.id} className="relative">
                {isEditingLabelName === label.id ? (
                  <div className="flex">
                    <Input
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      className="w-full text-sm h-7 py-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateLabelName(label.id);
                        if (e.key === 'Escape') setIsEditingLabelName(null);
                      }}
                      autoFocus
                    />
                    <Button 
                      size="sm"
                      className="ml-1 h-7"
                      onClick={() => handleUpdateLabelName(label.id)}
                    >
                      Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <Badge 
                      style={{ 
                        backgroundColor: localSelectedLabels.some(l => l.id === label.id) 
                          ? label.color 
                          : 'transparent',
                        color: localSelectedLabels.some(l => l.id === label.id) 
                          ? 'white' 
                          : 'black',
                        border: `1px solid ${label.color}`
                      }}
                      className="cursor-pointer"
                      onClick={() => toggleLabel(label)}
                    >
                      {label.name}
                    </Badge>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                          <PenLine className="h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2">
                        <div className="space-y-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-left flex justify-start"
                            onClick={() => handleEditLabelName(label.id, label.name)}
                          >
                            Edit name
                          </Button>
                          <div>
                            <p className="text-xs mb-1">Label color</p>
                            <div className="flex flex-wrap gap-1">
                              {LABEL_COLORS.map((color) => (
                                <div
                                  key={color}
                                  className="w-5 h-5 rounded-full cursor-pointer border border-gray-300"
                                  style={{ backgroundColor: color }}
                                  onClick={() => handleColorChange(label.id, color)}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            ))}
            
            {isAddingLabel ? (
              <div className="flex">
                <Input
                  ref={newLabelInputRef}
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Label name"
                  className="w-full text-sm h-7 py-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddNewLabel();
                    if (e.key === 'Escape') setIsAddingLabel(false);
                  }}
                />
                <div className="flex mx-1">
                  <Popover>
                    <PopoverTrigger asChild>
                      <div
                        className="w-7 h-7 rounded-full cursor-pointer border border-gray-300 flex items-center justify-center"
                        style={{ backgroundColor: newLabelColor }}
                      />
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2">
                      <div className="space-y-2">
                        <p className="text-xs mb-1">Select color</p>
                        <div className="flex flex-wrap gap-1">
                          {LABEL_COLORS.map((color) => (
                            <div
                              key={color}
                              className="w-5 h-5 rounded-full cursor-pointer border border-gray-300"
                              style={{ backgroundColor: color }}
                              onClick={() => setNewLabelColor(color)}
                            />
                          ))}
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button 
                    size="sm"
                    className="ml-1 h-7"
                    onClick={handleAddNewLabel}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center text-gray-500"
                onClick={startAddingNewLabel}
              >
                <Plus className="h-3 w-3 mr-1" />
                Add label
              </Button>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-2 bg-gray-50 rounded border flex flex-wrap gap-1 cursor-pointer group" onClick={!disabled ? handleEdit : undefined}>
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
          {!disabled && (
            <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              Click to edit
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EditableLabels;
