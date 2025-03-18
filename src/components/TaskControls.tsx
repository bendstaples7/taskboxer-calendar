
import React from 'react';
import { Task } from '@/lib/types';
import TaskActions from './TaskActions';

interface TaskControlsProps {
  task: Task;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onComplete: () => void;
  onUnschedule?: () => void;
  onDelete?: () => void;
}

const TaskControls: React.FC<TaskControlsProps> = (props) => {
  return (
    <div className="w-full flex justify-center">
      <TaskActions {...props} />
    </div>
  );
};

export default TaskControls;
