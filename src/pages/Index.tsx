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
import ActiveTasksDropdown from "@/components/ActiveTasksDropdown";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendarSync";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  CalendarDays,
  LayoutList 
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";

const initialLabels: Label[] = [
  { id: uuidv4(), name: "Work", color: "#3B82F6" },
  { id: uuidv4(), name: "Personal", color: "#EC4899" },
  { id: uuidv4(), name: "Urgent", color: "#EF4444" },
  { id: uuidv4(), name: "Important", color: "#F59E0B" },
];

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

const loadTasksFromStorage = () => {
  try {
    const savedTasks = localStorage.getItem('shinko-tasks');
    return savedTasks ? JSON.parse(savedTasks, (key, value) => {
      if (key === 'start' || key === 'end' || key === 'timerStarted' || key === 'timerPaused') {
        return value ? new Date(value) : null;
      }
      return value;
    }) : initialTasks;
  } catch (error) {
    console.error('Error loading tasks from storage', error);
    return initialTasks;
  }
};

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage());
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
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const { toast } = useToast();

  const { 
    isInitialized, 
    calendarEvents, 
    loadEvents,
    addTaskToCalendar,
    updateTaskInCalendar,
    removeTaskFromCalendar,
    syncTasksWithCalendar
  } = useGoogleCalendarSync();

  useEffect(() => {
    localStorage.setItem('shinko-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired) {
          const startTime = new Date(task.timerStarted).getTime();
          const elapsedMs = Date.now() - startTime;
          const elapsedMinutes = elapsedMs / (1000 * 60);
          
          if (elapsedMinutes >= task.estimatedTime) {
            return { ...task, timerExpired: true };
          }
        }
        return task;
      }));
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const active = tasks.filter(task => 
      task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired
    );
    setActiveTasks(active);
  }, [tasks]);

  useEffect(() => {
    const now = new Date();
    
    setTasks(prev => prev.map(task => {
      if (
        task.scheduled && 
        !task.timerStarted && 
        !task.completed && 
        new Date(task.scheduled.end) < now
      ) {
        return { ...task, scheduled: undefined };
      }
      return task;
    }));
  }, []);

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

  const handleTaskSchedule = async (task: Task, startTime: Date) => {
    const endTime = addMinutes(startTime, task.estimatedTime);
    const updatedTask = { 
      ...task, 
      scheduled: { start: startTime, end: endTime } 
    };
    
    if (isInitialized) {
      const taskWithGoogleId = await addTaskToCalendar(updatedTask);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? taskWithGoogleId : t
      ));
    } else {
      setTasks(prev => prev.map(t => 
        t.id === task.id ? updatedTask : t
      ));
    }

    toast({
      title: "Task scheduled",
      description: `"${task.title}" has been scheduled on the calendar.`,
    });
  };

  const handleResizeTask = async (taskId: string, newDuration: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.scheduled) {
        const newEnd = addMinutes(new Date(task.scheduled.start), newDuration);
        const updatedTask = { 
          ...task, 
          remainingTime: newDuration,
          scheduled: { 
            ...task.scheduled, 
            end: newEnd 
          } 
        };
        
        if (isInitialized && task.googleEventId) {
          updateTaskInCalendar(updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const handleTaskUnschedule = async (taskId: string) => {
    const taskToUnschedule = tasks.find(t => t.id === taskId);
    
    if (taskToUnschedule && taskToUnschedule.googleEventId) {
      await removeTaskFromCalendar(taskToUnschedule);
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, scheduled: undefined, timerStarted: undefined, timerPaused: undefined, timerElapsed: undefined, timerExpired: undefined, googleEventId: undefined } 
        : t
    ));

    toast({
      title: "Task unscheduled",
      description: "Task has been moved back to the task board.",
    });
  };

  const handleTaskComplete = async (taskId: string) => {
    const taskToComplete = tasks.find(t => t.id === taskId);
    
    if (taskToComplete && taskToComplete.googleEventId) {
      await removeTaskFromCalendar(taskToComplete);
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? { ...t, completed: true, timerExpired: false, googleEventId: undefined } 
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

  const handleUpdateTask = async (updatedTask: Task) => {
    if (updatedTask.scheduled && updatedTask.googleEventId && isInitialized) {
      await updateTaskInCalendar(updatedTask);
    }
    
    setTasks(prev => prev.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    
    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated.`,
    });
  };

  const handleStartTimer = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, timerStarted: new Date(), timerPaused: undefined };
      }
      return task;
    }));
  };

  const handleStopTimer = (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId && task.timerStarted) {
        const elapsedMs = Date.now() - new Date(task.timerStarted).getTime();
        const newElapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
        const totalElapsed = (task.timerElapsed || 0) + newElapsedMinutes;
        
        return { 
          ...task, 
          timerPaused: new Date(),
          timerElapsed: totalElapsed,
          remainingTime: Math.max(0, task.estimatedTime - totalElapsed)
        };
      }
      return task;
    }));
  };

  const handleAddTime = (taskId: string, minutes: number) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const newEstimatedTime = task.estimatedTime + minutes;
        let newEnd = task.scheduled?.end;
        
        if (task.scheduled) {
          newEnd = addMinutes(new Date(task.scheduled.start), newEstimatedTime);
          
          if (isInitialized && task.googleEventId) {
            const updatedTask = { 
              ...task, 
              estimatedTime: newEstimatedTime,
              timerExpired: false,
              scheduled: { ...task.scheduled, end: newEnd } 
            };
            updateTaskInCalendar(updatedTask);
          }
        }
        
        return { 
          ...task, 
          estimatedTime: newEstimatedTime,
          timerExpired: false,
          scheduled: task.scheduled ? { ...task.scheduled, end: newEnd } : undefined
        };
      }
      return task;
    }));

    toast({
      title: "Time added",
      description: `Added ${minutes} minutes to the task.`,
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

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section) 
        : [...prev, section]
    );
  };

  const handleGoogleCalendarEvents = (googleEvents: CalendarEvent[]) => {
    const nonGoogleEvents = events.filter(event => !event.isGoogleEvent);
    setEvents([...nonGoogleEvents, ...googleEvents]);
  };

  const handleCalendarDateChange = (date: Date) => {
    if (isInitialized) {
      loadEvents(date);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      <header className="p-4 bg-white border-b shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold flex items-center font-['Noto_Sans_JP',_sans-serif]">
              <CalendarIcon className="h-6 w-6 mr-2 text-purple-500" />
              進行 Shinkō
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setViewMode('day')}
                className={viewMode === 'day' ? 'bg-purple-100 text-purple-900' : ''}
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
                className={viewMode === 'calendar' ? 'bg-purple-100 text-purple-900' : ''}
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
                className={viewMode === 'taskboard' ? 'bg-purple-100 text-purple-900' : ''}
              >
                <LayoutList className="h-4 w-4 mr-1" />
                Board View
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GoogleCalendarConnect onEventsLoaded={handleGoogleCalendarEvents} />
            
            {activeTasks.length > 0 && (
              <ActiveTasksDropdown 
                activeTasks={activeTasks}
                onCompleteTask={handleTaskComplete}
                onAddTime={handleAddTime}
                onOpenTask={handleTaskClick}
              />
            )}
            <Button onClick={() => setAddTaskDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
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
                  onDateChange={handleCalendarDateChange}
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
                onDateChange={handleCalendarDateChange}
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
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
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
          onStartTimer={(taskId) => handleStartTimer(taskId)}
          onStopTimer={(taskId) => handleStopTimer(taskId)}
          onTimerComplete={(taskId) => handleTaskComplete(taskId)}
          onAddTime={(taskId, minutes) => handleAddTime(taskId, minutes)}
          availableLabels={labels}
        />
      )}
    </div>
  );
};

export default Index;
