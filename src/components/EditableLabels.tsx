
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil } from "lucide-react";
import { Label } from "@/lib/types";

interface EditableLabelsProps {
  selectedLabels: Label[];
  availableLabels: Label[];
  onUpdate: (labels: Label[]) => void;
  onAddLabel?: (label: any) => void; // Add missing prop
  disabled?: boolean;
}

const EditableLabels: React.FC<EditableLabelsProps> = ({
  selectedLabels,
  availableLabels,
  onUpdate,
  onAddLabel,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [localSelectedLabels, setLocalSelectedLabels] = useState<Label[]>(selectedLabels);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(localSelectedLabels);
    setEditing(false);
  };

  const handleCancel = () => {
    setLocalSelectedLabels(selectedLabels);
    setEditing(false);
  };

  const toggleLabel = (label: Label) => {
    if (localSelectedLabels.some(l => l.id === label.id)) {
      setLocalSelectedLabels(localSelectedLabels.filter(l => l.id !== label.id));
    } else {
      setLocalSelectedLabels([...localSelectedLabels, label]);
    }
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
            <Pencil className="h-3 w-3" />
          </Button>
        )}
      </div>
      
      {editing ? (
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {availableLabels.map((label) => (
              <Badge 
                key={label.id} 
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
            ))}
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
  );
};

export default EditableLabels;
