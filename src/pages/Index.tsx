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
import TaskDetails from "@/components/TaskDetails";
import ActiveTasksDropdown from "@/components/ActiveTasksDropdown";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendarSync";
import { 
  Plus, 
  Calendar as CalendarIcon, 
  LayoutList 
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { addMinutes } from "date-fns";
import { 
  fetchTasks, 
  createTask, 
  updateTask, 
  deleteTask, 
  fetchLabels, 
  createLabel,
  updateTaskPositions 
} from "@/services/taskService";

// Set document title to match the app name
document.title = "shinkō";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [addTaskDialogOpen, setAddTaskDialogOpen] = useState(false);
  const [initialPriority, setInitialPriority] = useState<Priority>('medium');
  const [draggingTask, setDraggingTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'calendar' | 'taskboard'>('calendar');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [taskboardExpanded, setTaskboardExpanded] = useState(false);
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Load tasks and labels from Supabase
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [tasksData, labelsData] = await Promise.all([
        fetchTasks(),
        fetchLabels()
      ]);
      
      setTasks(tasksData);
      setLabels(labelsData);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  // Update active tasks
  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.timerStarted && !task.timerPaused && !task.completed && !task.timerExpired) {
          const startTime = new Date(task.timerStarted).getTime();
          const elapsedMs = Date.now() - startTime;
          const elapsedMinutes = elapsedMs / (1000 * 60);
          
          if (elapsedMinutes >= task.estimatedTime) {
            // Update the task in Supabase
            const updatedTask = { ...task, timerExpired: true };
            updateTask(updatedTask);
            return updatedTask;
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
    
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (
          task.scheduled && 
          !task.timerStarted && 
          !task.completed && 
          new Date(task.scheduled.end) < now
        ) {
          return { ...task, scheduled: undefined };
        }
        return task;
      });
      
      // Update any changed tasks in Supabase
      updatedTasks.forEach(task => {
        const originalTask = prev.find(t => t.id === task.id);
        if (originalTask && JSON.stringify(originalTask) !== JSON.stringify(task)) {
          updateTask(task);
        }
      });
      
      return updatedTasks;
    });
  }, []);

  const handleAddTask = async (task: Task) => {
    const newTask = await createTask(task);
    if (newTask) {
      setTasks(prev => [...prev, newTask]);
      toast({
        title: "Task added",
        description: `"${task.title}" has been added to ${task.priority} priority.`,
      });
    }
  };

  const handleAddLabel = async (label: Label) => {
    const newLabel = await createLabel(label);
    if (newLabel) {
      setLabels(prev => [...prev, newLabel]);
    }
  };

  const handleTaskSchedule = async (task: Task, startTime: Date) => {
    const endTime = addMinutes(startTime, task.estimatedTime);
    const updatedTask = { 
      ...task, 
      scheduled: { start: startTime, end: endTime } 
    };
    
    if (isInitialized) {
      const taskWithGoogleId = await addTaskToCalendar(updatedTask);
      await updateTask(taskWithGoogleId);
      setTasks(prev => prev.map(t => 
        t.id === task.id ? taskWithGoogleId : t
      ));
    } else {
      await updateTask(updatedTask);
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
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
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
          
          // Update in Supabase
          updateTask(updatedTask);
          
          return updatedTask;
        }
        return task;
      });
      
      return updatedTasks;
    });
  };

  const handleTaskUnschedule = async (taskId: string) => {
    const taskToUnschedule = tasks.find(t => t.id === taskId);
    
    if (taskToUnschedule && taskToUnschedule.googleEventId) {
      await removeTaskFromCalendar(taskToUnschedule);
    }
    
    const updatedTask = { 
      ...taskToUnschedule, 
      scheduled: undefined, 
      timerStarted: undefined, 
      timerPaused: undefined, 
      timerElapsed: undefined, 
      timerExpired: undefined, 
      googleEventId: undefined 
    };
    
    if (updatedTask) {
      await updateTask(updatedTask);
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? updatedTask : t
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
    
    const updatedTask = { 
      ...taskToComplete, 
      completed: true, 
      timerExpired: false, 
      googleEventId: undefined 
    };
    
    if (updatedTask) {
      await updateTask(updatedTask);
    }
    
    setTasks(prev => prev.map(t => 
      t.id === taskId ? updatedTask : t
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
    
    await updateTask(updatedTask);
    
    setTasks(prev => prev.map(t => 
      t.id === updatedTask.id ? updatedTask : t
    ));
    
    toast({
      title: "Task updated",
      description: `"${updatedTask.title}" has been updated.`,
    });
  };

  const handleStartTimer = async (taskId: string) => {
    const taskToStart = tasks.find(t => t.id === taskId);
    
    if (taskToStart) {
      const currentTime = new Date();
      const endTime = addMinutes(currentTime, taskToStart.estimatedTime);
      
      // If the task is not already scheduled, schedule it now
      if (!taskToStart.scheduled) {
        const updatedTask = { 
          ...taskToStart, 
          scheduled: { 
            start: currentTime, 
            end: endTime 
          },
          timerStarted: currentTime,
          timerPaused: undefined
        };
        
        // If connected to Google Calendar, add to calendar
        if (isInitialized) {
          const taskWithGoogleId = await addTaskToCalendar(updatedTask);
          await updateTask(taskWithGoogleId);
          setTasks(prev => prev.map(t => 
            t.id === taskId ? taskWithGoogleId : t
          ));
        } else {
          await updateTask(updatedTask);
          setTasks(prev => prev.map(t => 
            t.id === taskId ? updatedTask : t
          ));
        }
        
        toast({
          title: "Task started",
          description: `"${taskToStart.title}" has been scheduled and started.`,
        });
        
        return;
      }
      
      // If already scheduled, just start the timer
      const updatedTask = { 
        ...taskToStart, 
        timerStarted: currentTime, 
        timerPaused: undefined 
      };
      
      await updateTask(updatedTask);
      
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          return updatedTask;
        }
        return task;
      }));
    }
  };

  const handleStopTimer = async (taskId: string) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
        if (task.id === taskId && task.timerStarted) {
          const elapsedMs = Date.now() - new Date(task.timerStarted).getTime();
          const newElapsedMinutes = Math.floor(elapsedMs / (1000 * 60));
          const totalElapsed = (task.timerElapsed || 0) + newElapsedMinutes;
          
          const updatedTask = { 
            ...task, 
            timerPaused: new Date(),
            timerElapsed: totalElapsed,
            remainingTime: Math.max(0, task.estimatedTime - totalElapsed)
          };
          
          // Update in Supabase
          updateTask(updatedTask);
          
          return updatedTask;
        }
        return task;
      });
      
      return updatedTasks;
    });

    toast({
      title: "Timer paused",
      description: "Task timer has been paused. You can resume it later.",
    });
  };

  const handleTaskMove = async (taskId: string, newPriority: Priority, newPosition?: number) => {
    setTasks(prev => {
      const updatedTasks = [...prev];
      const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
      
      if (taskIndex === -1) return prev;
      
      const taskToMove = { ...updatedTasks[taskIndex] };
      const oldPriority = taskToMove.priority;
      
      // If just changing priority
      if (oldPriority !== newPriority && newPosition === undefined) {
        taskToMove.priority = newPriority;
        updatedTasks[taskIndex] = taskToMove;
        
        // Update task in Supabase
        updateTask(taskToMove);
        
        return updatedTasks;
      }
      
      // If reordering within the same priority or changing priority with specific position
      updatedTasks.splice(taskIndex, 1); // Remove task from its current position
      
      if (newPosition !== undefined) {
        taskToMove.priority = newPriority;
        
        // Get all tasks of the new priority
        const priorityTasks = updatedTasks
          .filter(t => t.priority === newPriority && !t.scheduled && !t.completed)
          .sort((a, b) => (a.position || 0) - (b.position || 0));
        
        // Insert task at the new position
        priorityTasks.splice(Math.min(newPosition, priorityTasks.length), 0, taskToMove);
        
        // Update positions for all priority tasks
        const updatedPriorityTasks = priorityTasks.map((task, index) => ({
          ...task,
          position: index
        }));
        
        // Replace all tasks of this priority with the updated ones
        updatedTasks.forEach((task, i) => {
          if (task.priority === newPriority && !task.scheduled && !task.completed) {
            const updatedTask = updatedPriorityTasks.find(t => t.id === task.id);
            if (updatedTask) {
              updatedTasks[i] = updatedTask;
            }
          }
        });
        
        // Insert the moved task
        updatedTasks.push(...updatedPriorityTasks.filter(t => !updatedTasks.some(task => task.id === t.id)));
        
        // Update positions in Supabase
        updateTaskPositions(updatedPriorityTasks);
      } else {
        // Just change priority without specific position
        taskToMove.priority = newPriority;
        updatedTasks.push(taskToMove);
        
        // Update task in Supabase
        updateTask(taskToMove);
      }
      
      return updatedTasks;
    });

    toast({
      title: "Task moved",
      description: `Task has been moved to ${newPriority} priority.`,
    });
  };

  const handleAddTime = async (taskId: string, minutes: number) => {
    setTasks(prev => {
      const updatedTasks = prev.map(task => {
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
          
          const updatedTask = { 
            ...task, 
            estimatedTime: newEstimatedTime,
            timerExpired: false,
            scheduled: task.scheduled ? { ...task.scheduled, end: newEnd } : undefined
          };
          
          // Update in Supabase
          updateTask(updatedTask);
          
          return updatedTask;
        }
        return task;
      });
      
      return updatedTasks;
    });

    toast({
      title: "Time added",
      description: `Added ${minutes} minutes to the task.`,
    });
  };

  const handleTaskDelete = async (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    
    if (taskToDelete && taskToDelete.googleEventId && isInitialized) {
      await removeTaskFromCalendar(taskToDelete);
    }

    await deleteTask(taskId);
    
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    toast({
      title: "Task deleted",
      description: "The task has been permanently deleted.",
    });
  };

  const toggleCalendarExpanded = () => {
    setCalendarExpanded(prev => !prev);
    setTaskboardExpanded(prev => !prev);
    
    // Sync the view mode with panel state
    if (!calendarExpanded) {
      setViewMode('calendar');
    } else {
      setViewMode('taskboard');
    }
  };

  const toggleTaskboardExpanded = () => {
    setTaskboardExpanded(prev => !prev);
    setCalendarExpanded(prev => !prev);
    
    // Sync the view mode with panel state
    if (!taskboardExpanded) {
      setViewMode('taskboard');
    } else {
      setViewMode('calendar');
    }
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
              <img src="/lovable-uploads/f43f9967-69ed-4047-bfc3-f619d50d3d40.png" alt="Shinko Logo" className="app-logo h-12 w-auto" />
            </h1>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setViewMode('calendar');
                  setCalendarExpanded(true);
                  setTaskboardExpanded(false);
                }}
                className={viewMode === 'calendar' ? 'bg-gray-100 text-gray-900' : ''}
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
                className={viewMode === 'taskboard' ? 'bg-gray-100 text-gray-900' : ''}
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
            <Button onClick={() => {
              setAddTaskDialogOpen(true);
              // Default to medium priority when adding from header
              setInitialPriority('medium');
            }} className="bg-gray-800 hover:bg-gray-900">
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
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
              minimized={!calendarExpanded}
              scrollToCurrentTime={true}
              onTaskDragToBoard={handleTaskMove}
              onStartTask={handleStartTimer}
              onTaskDelete={handleTaskDelete}
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
                onTaskMove={handleTaskMove}
                onTaskDragToCalendar={handleTaskSchedule}
                minimized={false}
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
        <TaskDetails
          task={selectedTask}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
          onUpdate={handleUpdateTask}
          onComplete={() => {
            handleTaskComplete(selectedTask.id);
            setTaskDialogOpen(false);
          }}
          onStartTimer={() => {
            handleStartTimer(selectedTask.id);
            setTaskDialogOpen(false);
          }}
          onStopTimer={() => {
            handleStopTimer(selectedTask.id);
          }}
          onUnschedule={selectedTask.scheduled ? () => {
            handleTaskUnschedule(selectedTask.id);
            setTaskDialogOpen(false);
          } : undefined}
          onDelete={() => {
            // Ask for confirmation
            if (window.confirm(`Delete task "${selectedTask.title}"?`)) {
              if (handleTaskDelete) handleTaskDelete(selectedTask.id);
              setTaskDialogOpen(false);
            }
          }}
          availableLabels={labels}
          onAddLabel={handleAddLabel}
        />
      )}
    </div>
  );
};

export default Index;
