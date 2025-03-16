
import React, { useState } from 'react';
import { Task } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, CheckCircle, Trash } from 'lucide-react';
import { format } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CompletedTasksPanelProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

const CompletedTasksPanel: React.FC<CompletedTasksPanelProps> = ({
  tasks, 
  onTaskClick,
  onTaskDelete
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (tasks.length === 0) {
    return null;
  }

  return (
    <Card className="flex flex-col">
      <div 
        className="p-2 bg-gray-100 font-medium flex justify-between items-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
          <h3>Completed Tasks</h3>
        </div>
        <div className="flex items-center">
          <span className="bg-gray-200 px-2 rounded-full text-sm mr-2">{tasks.length}</span>
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </div>
      
      {isExpanded && (
        <ScrollArea className="max-h-60">
          <div className="p-2 space-y-2">
            {tasks.map(task => (
              <div 
                key={task.id}
                className="p-2 border rounded bg-gray-50 hover:bg-gray-100 transition-colors flex justify-between group"
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onTaskClick(task)}
                >
                  <div className="font-medium line-through opacity-70">{task.title}</div>
                  <div className="text-xs text-gray-500">
                    Completed {task.timerElapsed ? `(${Math.floor(task.timerElapsed)} min)` : ''}
                  </div>
                </div>
                
                {onTaskDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onTaskDelete(task.id)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </Card>
  );
};

export default CompletedTasksPanel;
