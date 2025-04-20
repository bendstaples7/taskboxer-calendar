import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Task, Priority } from "@/lib/types";
import TaskCard from './TaskCard';

interface TaskBoardProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onAddTask?: (priority: Priority) => void;
  onDragStart?: (task: Task) => void;
  onTaskMove?: (taskId: string, newPriority: Priority, newPosition?: number) => void;
  onTaskDragToCalendar?: (task: Task, dropTime: Date) => void;
  minimized?: boolean;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  onTaskClick,
  onAddTask,
  onDragStart,
  onTaskMove,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const dragIndicatorRef = useRef<HTMLDivElement>(null);

  const priorities: { title: string; key: Priority }[] = [
    { title: 'Critical', key: 'critical' },
    { title: 'High', key: 'high' },
    { title: 'Medium', key: 'medium' },
    { title: 'Low', key: 'low' }
  ];

  const getSortedTasks = (priority: Priority) =>
    tasks
      .filter(t => t && t.priority === priority && !t.completed && !t.scheduled)
      .sort((a, b) => (a?.position || 0) - (b?.position || 0));

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, task: Task) => {
    e.dataTransfer.setData('taskId', task.id);
    e.dataTransfer.setData('taskPriority', task.priority);
    e.dataTransfer.setData('from', 'taskboard');
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
    onDragStart?.(task);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    priority: Priority,
    index: number = -1
  ) => {
    const taskId = e.dataTransfer.getData('taskId');
    const from = e.dataTransfer.getData('from');

    if (from === 'taskboard' && taskId && onTaskMove) {
      const tasksInColumn = getSortedTasks(priority);
      const newPosition = index === -1 ? tasksInColumn.length : index;
      onTaskMove(taskId, priority, newPosition);
    }

    setDraggedTaskId(null);
  };

  const renderColumn = (priority: Priority, title: string) => {
    const sortedTasks = getSortedTasks(priority);

    return (
      <div
        className="min-w-[16rem] flex flex-col bg-gray-50 border-r border-gray-300 rounded-md"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, priority)}
      >
        <div className="flex justify-between items-center p-2 border-b">
          <h3 className="text-sm font-semibold">{title} ({sortedTasks.length})</h3>
          {onAddTask && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={() => onAddTask(priority)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex-1 p-2 overflow-y-auto">
          {sortedTasks.map((task, index) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => handleDragStart(e, task)}
              onDragEnd={() => setDraggedTaskId(null)}
              className={`${draggedTaskId === task.id ? 'opacity-50' : ''} mb-2`}
            >
              <TaskCard
                task={task}
                onClick={() => onTaskClick(task)}
                isDragging={draggedTaskId === task.id}
                showStartButton={true}
              />
            </div>
          ))}
        </div>

        {onAddTask && (
          <div className="p-2 border-t mt-auto">
            <button
              onClick={() => onAddTask(priority)}
              className="w-full text-left text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition"
            >
              + Add a card
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex gap-4 h-full overflow-auto pr-3 pb-3">
      {priorities.map(p => renderColumn(p.key, p.title))}
    </div>
  );
};

export default TaskBoard;
