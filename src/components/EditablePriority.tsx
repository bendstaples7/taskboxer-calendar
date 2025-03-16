
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Priority } from "@/lib/types";
import { SignalLow, SignalMedium, SignalHigh, Flame } from "lucide-react";

interface EditablePriorityProps {
  priority: Priority;
  onUpdate: (priority: Priority) => void;
  disabled?: boolean;
}

const EditablePriority: React.FC<EditablePriorityProps> = ({
  priority,
  onUpdate,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<Priority>(priority);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(selectedPriority);
    setEditing(false);
  };

  const handleCancel = () => {
    setSelectedPriority(priority);
    setEditing(false);
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
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Priority</label>
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
          <Select 
            value={selectedPriority} 
            onValueChange={(value: Priority) => setSelectedPriority(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority">
                {selectedPriority && (
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(selectedPriority)}
                    <span className="capitalize">{selectedPriority}</span>
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
        <div className="p-2 bg-gray-50 rounded border flex items-center gap-2">
          {getPriorityIcon(priority)}
          <span className="capitalize">{priority}</span>
        </div>
      )}
    </div>
  );
};

export default EditablePriority;
