
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface EditableTimeProps {
  minutes: number;
  onUpdate: (minutes: number) => void;
  disabled?: boolean;
}

const PRESET_TIMES = [
  { label: '15 minutes', value: 15 },
  { label: '30 minutes', value: 30 },
  { label: '45 minutes', value: 45 },
  { label: '1 hour', value: 60 },
  { label: '2 hours', value: 120 },
  { label: '3 hours', value: 180 },
  { label: '4 hours', value: 240 },
];

const EditableTime: React.FC<EditableTimeProps> = ({
  minutes,
  onUpdate,
  disabled = false
}) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(minutes.toString());
  const [showPresets, setShowPresets] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleEdit = () => {
    if (disabled) return;
    setEditing(true);
  };

  const handleSave = () => {
    parseAndSaveTime(inputValue);
    setEditing(false);
  };

  const handleCancel = () => {
    setInputValue(minutes.toString());
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const parseAndSaveTime = (timeStr: string) => {
    timeStr = timeStr.toLowerCase().trim();
    let totalMinutes = 0;
    
    // Check if it's just a number (assume minutes)
    if (/^\d+$/.test(timeStr)) {
      totalMinutes = parseInt(timeStr, 10);
    } 
    // Parse "X hours Y minutes" or variations
    else {
      const hoursMatch = timeStr.match(/(\d+)\s*h(our)?s?/);
      const minutesMatch = timeStr.match(/(\d+)\s*m(in(ute)?)?s?/);
      
      if (hoursMatch) {
        totalMinutes += parseInt(hoursMatch[1], 10) * 60;
      }
      
      if (minutesMatch) {
        totalMinutes += parseInt(minutesMatch[1], 10);
      }
    }
    
    if (totalMinutes > 0) {
      onUpdate(totalMinutes);
    } else {
      setInputValue(minutes.toString());
    }
  };

  const selectPreset = (presetMinutes: number) => {
    onUpdate(presetMinutes);
    setShowPresets(false);
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
          <div className="flex">
            <Input 
              ref={inputRef}
              value={inputValue} 
              onChange={(e) => setInputValue(e.target.value)} 
              placeholder="e.g. 30m, 1h 30m"
              className="flex-1"
              onKeyDown={handleKeyDown}
            />
            <Popover open={showPresets} onOpenChange={setShowPresets}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="ml-1"
                  onClick={() => setShowPresets(!showPresets)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="p-1">
                  {PRESET_TIMES.map((preset) => (
                    <Button 
                      key={preset.value} 
                      variant="ghost" 
                      className="w-full justify-start text-left font-normal p-2 h-8"
                      onClick={() => selectPreset(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
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
        <div className="p-2 bg-gray-50 rounded border text-gray-600">
          {formatTime(minutes)}
        </div>
      )}
    </div>
  );
};

export default EditableTime;
