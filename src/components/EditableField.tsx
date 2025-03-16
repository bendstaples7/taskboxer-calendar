
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { cn } from '@/lib/utils';

interface EditableFieldProps {
  label: string;
  value: string;
  onUpdate: (value: string) => void;
  multiline?: boolean;
  className?: string;
  disabled?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onUpdate,
  multiline = false,
  className,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    onUpdate(inputValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(value);
    setEditing(false);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
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
          {multiline ? (
            <Textarea 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={`Enter ${label.toLowerCase()}`} 
              rows={3}
              className="w-full resize-none"
            />
          ) : (
            <Input 
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder={`Enter ${label.toLowerCase()}`} 
              className="w-full"
            />
          )}
          
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
        <div className="p-2 bg-gray-50 rounded border min-h-[1.5rem]">
          {value || `No ${label.toLowerCase()}`}
        </div>
      )}
    </div>
  );
};

export default EditableField;
