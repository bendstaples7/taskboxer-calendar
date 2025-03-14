import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Task, Priority, Label, CalendarEvent } from "@/lib/types";
import TaskBoard from "@/components/TaskBoard";
import StackedTaskBoard from "@/components/StackedTaskBoard";
import CalendarView from "@/components/CalendarView";
import AnimatedPanel from "@/components/AnimatedPanel";
import AddTaskDialog from "@/components/AddTaskDialog";
import EditTaskDialog from "@/components/EditTaskDialog";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CalendarDays,
  LayoutList 
} from "lucide-react";
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
  const [viewMode, setViewMode] = useState<'calendar' | 'taskboard' | 'day'>('calendar');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [taskboardExpanded, setTaskboardExpanded] = useState(false);
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    
    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated.`,
    });
  };

  const toggleCalendarExpanded = () => {
    setCalendarExpanded(prev => !prev);
    setTaskboardExpanded(prev => !prev);
  };

  const toggleTaskboardExpanded = () => {
    setTaskboardExpanded(prev => !prev);
    setCalendarExpanded(prev => !prev);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-white border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center">
              <CalendarIcon className="h-6 w-6 mr-2 text-blue-500" />
              TaskBoxer Calendar
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('day')}
                className={viewMode === 'day' ? 'bg-blue-100' : ''}
              >
                <CalendarDays className="h-4 w-4 mr-1" />
                Day View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setViewMode('calendar');
                  setCalendarExpanded(true);
                  setTaskboardExpanded(false);
                }}
                className={viewMode === 'calendar' ? 'bg-blue-100' : ''}
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                Week View
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setViewMode('taskboard');
                  setTaskboardExpanded(true);
                  setCalendarExpanded(false);
                }}
                className={viewMode === 'taskboard' ? 'bg-blue-100' : ''}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                Board View
              </Button>
            </div>
          </div>
          <Button onClick={() => setAddTaskDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        {viewMode === 'day' ? (
          <div className="flex gap-4 h-[calc(100vh-10rem)]">
            <div className="w-1/3 bg-white rounded-lg shadow-sm border h-full overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Today</h2>
              </div>
              <div className="h-[calc(100%-4rem)] overflow-auto">
                <CalendarView 
                  singleDayMode={true}
                  events={events}
                  tasks={tasks}
                  onTaskUnschedule={handleTaskUnschedule}
                  onTaskComplete={handleTaskComplete}
                  onDropTask={handleTaskSchedule}
                  onTaskClick={handleTaskClick}
                />
              </div>
            </div>
            
            <div className="w-2/3 bg-white rounded-lg shadow-sm border h-full overflow-hidden">
              <div className="p-4 border-b">
                <h2 className="text-xl font-semibold">Task Board</h2>
              </div>
              <div className="h-[calc(100%-4rem)] overflow-auto">
                <TaskBoard 
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={(priority) => {
                    setInitialPriority(priority);
                    setAddTaskDialogOpen(true);
                  }}
                  onDragStart={setDraggingTask}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-4 h-[calc(100vh-10rem)]">
            <AnimatedPanel
              title="Calendar"
              side="left"
              expanded={calendarExpanded}
              onToggle={toggleCalendarExpanded}
            >
              <CalendarView 
                singleDayMode={false}
                events={events}
                tasks={tasks}
                onTaskUnschedule={handleTaskUnschedule}
                onTaskComplete={handleTaskComplete}
                onDropTask={handleTaskSchedule}
                onTaskClick={handleTaskClick}
              />
            </AnimatedPanel>
            
            <AnimatedPanel
              title="Task Board"
              side="right"
              expanded={taskboardExpanded}
              onToggle={toggleTaskboardExpanded}
            >
              {taskboardExpanded ? (
                <TaskBoard 
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={(priority) => {
                    setInitialPriority(priority);
                    setAddTaskDialogOpen(true);
                  }}
                  onDragStart={setDraggingTask}
                />
              ) : (
                <StackedTaskBoard
                  tasks={tasks}
                  onTaskClick={handleTaskClick}
                  onAddTask={(priority) => {
                    setInitialPriority(priority);
                    setAddTaskDialogOpen(true);
                  }}
                  onDragStart={setDraggingTask}
                  minimized={true}
                />
              )}
            </AnimatedPanel>
          </div>
        )}
      </main>

      <AddTaskDialog 
        open={addTaskDialogOpen}
        initialPriority={initialPriority}
        onOpenChange={setAddTaskDialogOpen}
        onAddTask={handleAddTask}
        availableLabels={labels}
        onAddLabel={handleAddLabel}
      />

      {selectedTask && (
        <EditTaskDialog
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          task={selectedTask}
          onUpdate={handleUpdateTask}
          onComplete={() => {
            handleTaskComplete(selectedTask.id);
            setTaskDialogOpen(false);
          }}
          onUnschedule={() => {
            if (selectedTask.scheduled) {
              handleTaskUnschedule(selectedTask.id);
              setTaskDialogOpen(false);
            }
          }}
          availableLabels={labels}
        />
      )}
    </div>
  );
};

export default Index;
