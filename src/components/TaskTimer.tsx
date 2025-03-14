
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";

interface TaskTimerProps {
  duration: number; // in minutes
  onComplete: () => void;
}

const TaskTimer: React.FC<TaskTimerProps> = ({ duration, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(100);

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
    } else if (timeLeft === 0) {
      onComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, duration, onComplete]);

  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
    setProgress(100);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours > 0 ? `${hours.toString().padStart(2, '0')}:` : ''}${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-2">
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
    </div>
  );
};

export default TaskTimer;
