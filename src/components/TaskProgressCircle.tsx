
import React from 'react';

interface TaskProgressCircleProps {
  progress: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
  bgColor?: string;
  progressColor?: string;
  onClick?: () => void;
}

const TaskProgressCircle: React.FC<TaskProgressCircleProps> = ({
  progress,
  size = 24,
  strokeWidth = 2,
  bgColor = '#e5e7eb', // gray-200
  progressColor = '#4b5563', // gray-600
  onClick
}) => {
  const normalizedProgress = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - normalizedProgress * circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={`transform -rotate-90 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Background circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={bgColor}
        strokeWidth={strokeWidth}
      />
      
      {/* Progress circle */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={progressColor}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />
    </svg>
  );
};

export default TaskProgressCircle;
