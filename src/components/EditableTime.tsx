
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { formatMinutes, STANDARD_TIME_OPTIONS } from "@/lib/timeUtils";

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
  const [isCustomValue, setIsCustomValue] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current && isCustomValue) {
      inputRef.current.focus();
    }
  }, [editing, isCustomValue]);

  useEffect(() => {
    // Check if current value is in standard options
    setIsCustomValue(!STANDARD_TIME_OPTIONS.some(option => 
      typeof option.value === 'number' && option.value === minutes
    ));
  }, [minutes]);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    if (isCustomValue) {
      const parsedValue = parseInt(inputValue);
      if (!isNaN(parsedValue) && parsedValue > 0) {
        onUpdate(parsedValue);
      }
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(minutes.toString());
    setIsCustomValue(false);
    setEditing(false);
  };

  const handleSelectChange = (value: string) => {
    if (value === 'custom') {
      setIsCustomValue(true);
      return;
    }
    
    const numericValue = parseInt(value);
    if (!isNaN(numericValue)) {
      onUpdate(numericValue);
      setEditing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">Estimated Time</label>
      </div>
      
      {editing ? (
        <div className="space-y-2">
          <Select 
            defaultValue={isCustomValue ? 'custom' : minutes.toString()}
            onValueChange={handleSelectChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              {STANDARD_TIME_OPTIONS.map((option) => (
                <SelectItem 
                  key={option.value.toString()} 
                  value={option.value.toString()}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {isCustomValue && (
            <div className="flex gap-2 mt-2">
              <Input 
                ref={inputRef}
                type="number"
                value={inputValue} 
                onChange={(e) => setInputValue(e.target.value)} 
                placeholder="Enter minutes"
                className="flex-1"
                min={1}
              />
              <Button 
                size="sm" 
                onClick={handleSave}
              >
                Save
              </Button>
            </div>
          )}
          
          {!isCustomValue && (
            <div className="flex justify-end gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div 
          className="p-2 bg-gray-50 rounded border text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer group"
          onClick={!disabled ? handleEdit : undefined}
        >
          <div className="flex items-center justify-between">
            <span>{formatMinutes(minutes)}</span>
            {!disabled && (
              <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Click to edit
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableTime;
