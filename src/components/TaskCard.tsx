
import React from "react";
import { cn } from "@/lib/utils";
import { Task } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, SignalLow, SignalMedium, SignalHigh, Flame } from "lucide-react";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, isDragging, onClick }) => {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  const getPriorityIcon = () => {
    switch (task.priority) {
      case 'low':
        return <SignalLow className="h-4 w-4 text-blue-500" />;
      case 'medium':
        return <SignalMedium className="h-4 w-4 text-green-500" />;
      case 'high':
        return <SignalHigh className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <Flame className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all bg-white",
        isDragging && "task-dragging shadow-lg",
        "mb-3 hover:shadow-md",
        task.priority === "low" && "priority-low",
        task.priority === "medium" && "priority-medium",
        task.priority === "high" && "priority-high",
        task.priority === "critical" && "priority-critical"
      )}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-0">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {getPriorityIcon()}
            <h3 className="font-medium text-sm">{task.title}</h3>
          </div>
          {task.completed && <CheckCircle className="h-4 w-4 text-green-600" />}
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-2">
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
        )}
        <div className="flex gap-1 flex-wrap">
          {task.labels.map((label) => (
            <Badge 
              key={label.id} 
              style={{ backgroundColor: label.color }}
              className="text-white text-xs"
            >
              {label.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{formatTime(task.estimatedTime)}</span>
        </div>
        {task.scheduled && (
          <Badge variant="outline" className="text-xs">
            Scheduled
          </Badge>
        )}
      </CardFooter>
    </Card>
  );
};

export default TaskCard;
