
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle, Plus, Minus } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

interface TaskTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
  onTimeAdjust?: (newDuration: number) => void;
  onTimerStart?: () => void;
  onTimerStop?: () => void;
  initialTimeLeft?: number; // in seconds
  expired?: boolean;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ 
  duration, 
  onComplete, 
  onTimeAdjust,
  onTimerStart,
  onTimerStop,
  initialTimeLeft,
  expired = false
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTimeLeft || duration * 60); // Convert to seconds
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
          setProgress(Math.floor((newTime / (duration * 60)) * 100));
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, onComplete]);

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
    setTimeLeft(duration * 60);
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
    <div className="flex flex-col gap-2">
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
            <div className="text-xl font-mono">{formatTime(timeLeft)}</div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={toggleTimer}
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={resetTimer}
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
          <Progress value={progress} className="h-2" />
        </>
      )}
    </div>
  );
};

export default TaskTimer;
