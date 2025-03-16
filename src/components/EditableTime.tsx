
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil } from "lucide-react";

interface EditableTimeProps {
  minutes: number;
  onUpdate: (minutes: number) => void;
  disabled?: boolean;
}

const EditableTime: React.FC<EditableTimeProps> = ({
  minutes,
  onUpdate,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(minutes.toString());

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    const parsedValue = parseInt(inputValue);
    if (!isNaN(parsedValue) && parsedValue > 0) {
      onUpdate(parsedValue);
    } else {
      setInputValue(minutes.toString());
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(minutes.toString());
    setEditing(false);
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Estimated Time</label>
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
          <Input 
            type="number" 
            value={inputValue} 
            onChange={(e) => setInputValue(e.target.value)} 
            min={1}
            className="w-full"
          />
          
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
        <div className="p-2 bg-gray-50 rounded border">
          {formatTime(minutes)}
        </div>
      )}
    </div>
  );
};

export default EditableTime;
