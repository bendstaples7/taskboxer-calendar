import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle, Plus, Minus, Clock, Timer } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Task } from "@/lib/types";

interface TaskTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  onTimeAdjust?: (newDuration: number) => void;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
  initialTimeLeft?: number; // in seconds
  expired?: boolean;
  className?: string; // Add missing className prop
  task?: Task; // Add optional task prop for backward compatibility
  onTimerExpired?: () => void; // Add optional callback for backward compatibility
}

const TaskTimer: React.FC<TaskTimerProps> = ({ 
  duration, 
  onComplete, 
  onTimeAdjust,
  onTimerStart,
  onTimerStop,
  initialTimeLeft,
  expired = false,
  className = "",
  task, // Added for backward compatibility
  onTimerExpired // Added for backward compatibility
}) => {
  const effectiveDuration = task ? task.estimatedTime : duration;
  
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || effectiveDuration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);
  const [adjustMode, setAdjustMode] = useState(false);
  const [adjustValue, setAdjustValue] = useState(30); // Default additional time in minutes

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          setProgress(Math.floor((newTime / (effectiveDuration * 60)) * 100));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onComplete();
      if (onTimerExpired) onTimerExpired();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, effectiveDuration, onComplete, onTimerExpired]);

  const toggleTimer = () => {
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    if (newRunningState && onTimerStart) {
      onTimerStart();
    } else if (!newRunningState && onTimerStop) {
      onTimerStop();
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(effectiveDuration * 60);
    setProgress(100);
    if (onTimerStop) onTimerStop();
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeAdjust = () => {
    if (onTimeAdjust) {
      onTimeAdjust(adjustValue);
      setAdjustMode(false);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {expired ? (
        <div className="rounded-md bg-yellow-50 p-3 mb-2">
          <h4 className="text-sm font-medium text-yellow-800 mb-2">Time Expired</h4>
          
          {adjustMode ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 w-7 p-0"
                  onClick={() => setAdjustValue(prev => Math.max(5, prev - 5))}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={adjustValue}
                  onChange={(e) => setAdjustValue(parseInt(e.target.value) || 30)}
                  className="h-7"
                />
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 w-7 p-0"
                  onClick={() => setAdjustValue(prev => prev + 5)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-gray-500">minutes</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7"
                  onClick={() => setAdjustMode(false)}
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  className="h-7"
                  onClick={handleTimeAdjust}
                >
                  Add Time
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setAdjustMode(true)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Time
              </Button>
              <Button 
                size="sm"
                onClick={onComplete}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div className={`text-xl font-mono flex items-center ${isRunning ? 'text-purple-600' : ''}`}>
              {isRunning && <Timer className="h-4 w-4 mr-2 animate-pulse text-purple-600" />}
              {formatTime(timeLeft)}
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={isRunning ? "default" : "outline"}
                className={isRunning ? "bg-purple-600 hover:bg-purple-700" : ""}
                onClick={toggleTimer}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? "Pause" : "Start"}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetTimer}
                disabled={timeLeft === effectiveDuration * 60}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button 
                size="sm"
                onClick={onComplete}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Complete
              </Button>
            </div>
          </div>
          <Progress 
            value={progress} 
            className={`h-2 ${isRunning ? 'animate-pulse' : ''}`}
            style={{
              background: isRunning ? '#e9d5ff' : '', // Light purple when active
              '--progress-color': isRunning ? '#9333ea' : '' // Darker purple for progress bar
            } as React.CSSProperties}
          />
          {isRunning && (
            <div className="text-xs text-center text-purple-600 animate-pulse mt-1">
              Timer running...
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TaskTimer;
