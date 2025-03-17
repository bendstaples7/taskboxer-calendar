
import React from 'react';
import { Task } from '@/lib/types';
import { CheckCircle, Pause, ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TaskTimer from './TaskTimer';

interface ActiveTasksDropdownProps {
  tasks?: Task[];
  activeTasks?: Task[];
  onCompleteTask: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onMoveToBoard?: (taskId: string) => void;
  onOpenTask?: (task: Task) => void;
  onAddTime?: (taskId: string, minutes: number) => void;
}

const ActiveTasksDropdown: React.FC<ActiveTasksDropdownProps> = ({
  tasks,
  activeTasks,
  onCompleteTask,
  onPauseTask,
  onMoveToBoard,
  onOpenTask,
  onAddTime
}) => {
  // Use either activeTasks or tasks based on what's provided
  const displayTasks = activeTasks || tasks || [];
  
  if (displayTasks.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No active tasks
      </div>
    );
  }

  return (
    <div className="p-2 max-h-[300px] overflow-y-auto">
      {displayTasks.map(task => (
        <div 
          key={task.id} 
          className="p-2 mb-2 border rounded-md flex items-center justify-between hover:bg-gray-50"
          onClick={() => onOpenTask?.(task)}
        >
          <div className="flex-1 cursor-pointer">
            <div className="font-medium">{task.title}</div>
            <TaskTimer 
              duration={task.estimatedTime} 
              onComplete={() => {}} 
              initialTimeLeft={task.remainingTime ? task.remainingTime * 60 : task.estimatedTime * 60}
            />
          </div>
          <div className="flex space-x-1">
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100" 
              onClick={(e) => {
                e.stopPropagation();
                onCompleteTask(task.id);
              }}
              title="Mark as complete"
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
            {onPauseTask && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-orange-600 hover:text-orange-700 hover:bg-orange-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  onPauseTask(task.id);
                }}
                title="Pause timer"
              >
                <Pause className="h-4 w-4" />
              </Button>
            )}
            {onMoveToBoard && (
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-100" 
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToBoard(task.id);
                }}
                title="Move to task board"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActiveTasksDropdown;
