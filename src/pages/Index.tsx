
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Task, Priority, Label, CalendarEvent } from "@/lib/types";
import TaskBoard from "@/components/TaskBoard";
import CalendarView from "@/components/CalendarView";
import AddTaskDialog from "@/components/AddTaskDialog";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";

// Mock labels
const initialLabels: Label[] = [
  { id: uuidv4(), name: "Work", color: "#3B82F6" },
  { id: uuidv4(), name: "Personal", color: "#EC4899" },
  { id: uuidv4(), name: "Urgent", color: "#EF4444" },
  { id: uuidv4(), name: "Important", color: "#F59E0B" },
];

// Mock tasks
const initialTasks: Task[] = [
  {
    id: uuidv4(),
    title: "Complete project proposal",
    description: "Finish the proposal for the new client project",
    priority: "high",
    estimatedTime: 120,
    completed: false,
    labels: [initialLabels[0], initialLabels[3]],
  },
  {
    id: uuidv4(),
    title: "Review analytics report",
    description: "Go through the quarterly analytics and prepare summary",
    priority: "medium",
    estimatedTime: 60,
    completed: false,
    labels: [initialLabels[0]],
  },
  {
    id: uuidv4(),
    title: "Plan weekend trip",
    description: "Research destinations and accommodations",
    priority: "low",
    estimatedTime: 45,
    completed: false,
    labels: [initialLabels[1]],
  },
  {
    id: uuidv4(),
    title: "Fix critical bug in production",
    description: "Users are experiencing login issues in the live environment",
    priority: "critical",
    estimatedTime: 90,
    completed: false,
    labels: [initialLabels[0], initialLabels[2]],
  },
];

// Mock Google Calendar events
const initialEvents: CalendarEvent[] = [
  {
    id: uuidv4(),
    title: "Team Meeting",
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    isGoogleEvent: true,
  },
  {
    id: uuidv4(),
    title: "Lunch with Sarah",
    start: new Date(new Date().setHours(12, 30, 0, 0)),
    end: new Date(new Date().setHours(13, 30, 0, 0)),
    isGoogleEvent: true,
  },
  {
    id: uuidv4(),
    title: "Doctor Appointment",
    start: addMinutes(new Date().setHours(15, 0, 0, 0), 1440), // Tomorrow
    end: addMinutes(new Date().setHours(16, 0, 0, 0), 1440),    // Tomorrow
    isGoogleEvent: true,
  },
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [labels, setLabels] = useState<Label[]>(initialLabels);
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [initialPriority, setInitialPriority] = useState<Priority>('medium');
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleAddTask = (task: Task) => {
    setTasks(prev => [...prev, task]);
    toast({
      title: "Task added",
      description: `"${task.title}" has been added to ${task.priority} priority.`,
    });
  };

  const handleAddLabel = (label: Label) => {
    setLabels(prev => [...prev, label]);
  };

  const handleTaskSchedule = (task: Task, startTime: Date) => {
    const endTime = addMinutes(startTime, task.estimatedTime);
    
    setTasks(prev => prev.map(t => 
      t.id === task.id 
        ? { ...t, scheduled: { start: startTime, end: endTime } } 
        : t
    ));

    toast({
      title: "Task scheduled",
      description: `"${task.title}" has been scheduled on the calendar.`,
    });
  };

  const handleTaskUnschedule = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, scheduled: undefined } 
        : t
    ));

    toast({
      title: "Task unscheduled",
      description: "Task has been moved back to the task board.",
    });
  };

  const handleTaskComplete = (taskId: string) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: true } 
        : t
    ));

    toast({
      title: "Task completed",
      description: "Great job! Task has been marked as completed.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center">
            <CalendarIcon className="h-6 w-6 mr-2 text-blue-500" />
            TaskBoxer Calendar
          </h1>
          <Button onClick={() => setAddTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-10rem)]">
          <div className="bg-white rounded-lg p-4 shadow-sm border h-full overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Calendar</h2>
            <div className="h-full overflow-auto">
              <CalendarView 
                events={events}
                tasks={tasks}
                onTaskUnschedule={handleTaskUnschedule}
                onTaskComplete={handleTaskComplete}
                onDropTask={handleTaskSchedule}
              />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border h-full overflow-hidden">
            <h2 className="text-xl font-semibold mb-4">Task Board</h2>
            <div className="h-full overflow-auto">
              <TaskBoard 
                tasks={tasks}
                onTaskClick={(task) => console.log("Task clicked:", task)}
                onAddTask={(priority) => {
                  setInitialPriority(priority);
                  setAddTaskDialogOpen(true);
                }}
                onDragStart={setDraggingTask}
              />
            </div>
          </div>
        </div>
      </main>

      <AddTaskDialog 
        open={addTaskDialogOpen}
        initialPriority={initialPriority}
        onOpenChange={setAddTaskDialogOpen}
        onAddTask={handleAddTask}
        availableLabels={labels}
        onAddLabel={handleAddLabel}
      />
    </div>
  );
};

export default Index;
