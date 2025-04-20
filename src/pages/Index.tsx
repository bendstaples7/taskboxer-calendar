import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Task, Priority, Label, CalendarEvent } from "@/lib/types";
import TaskBoard from "@/components/TaskBoard";
import StackedTaskBoard from "@/components/StackedTaskBoard";
import CalendarView from "@/components/CalendarView";
import AnimatedPanel from "@/components/AnimatedPanel";
import AddTaskDialog from "@/components/AddTaskDialog";
import TaskDetails from "@/components/TaskDetails";
import ActiveTasksDropdown from "@/components/ActiveTasksDropdown";
import GoogleCalendarConnect from "@/components/GoogleCalendarConnect";
import { useGoogleCalendarSync } from "@/hooks/useGoogleCalendarSync";
import EventDetailsDialog from "@/components/EventDetailsDialog";
import { Plus, Calendar as CalendarIcon, LayoutList } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { addMinutes, startOfWeek, endOfWeek } from "date-fns";
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  fetchLabels,
  createLabel,
  updateTaskPositions
} from "@/services/taskService";

document.title = "shinkō";

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [calendarExpanded, setCalendarExpanded] = useState(true);
  const [taskboardExpanded, setTaskboardExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'calendar' | 'taskboard'>('calendar');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [defaultPriority, setDefaultPriority] = useState<Priority>('medium');

  const { toast } = useToast();
  const [lastToastTimestamp, setLastToastTimestamp] = useState<number>(0);
  const [lastToastMessage, setLastToastMessage] = useState<string>('');

  const {
    isInitialized,
    loadEvents
  } = useGoogleCalendarSync();

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

  const showToast = (title: string, description: string, variant: "default" | "destructive" = "default") => {
    const now = Date.now();
    const message = `${title}:${description}`;
    if ((now - lastToastTimestamp > 2000) || (message !== lastToastMessage)) {
      toast({ title, description, variant });
      setLastToastTimestamp(now);
      setLastToastMessage(message);
    }
  };

  const handleGoogleCalendarEvents = (googleEvents: CalendarEvent[]) => {
    const nonGoogleEvents = events.filter(event => !event.isGoogleEvent);
    setEvents([...nonGoogleEvents, ...googleEvents]);
  };

  const handleCalendarDateChange = (date: Date) => {
    setSelectedDate(date);
    if (isInitialized) {
      loadEvents(date);
    }
  };

  const handleToggleSection = (section: string) => {
    setCollapsedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleCreateTask = async (task: Task) => {
    const created = await createTask(task);
    setTasks(prev => [...prev, created]);
    showToast("Task created", task.title);
  };

  return (
    <div className="min-h-screen h-screen flex flex-col bg-stone-50 overflow-hidden">
      <header className="p-4 bg-white border-b shadow-sm">
        <div className="w-full max-w-screen-xl mx-auto flex justify-between items-center px-4">
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
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 overflow-hidden h-full">
        <div className="flex gap-4 h-full overflow-hidden">
          <AnimatedPanel
            title="Calendar"
            side="left"
            expanded={calendarExpanded}
            onToggle={() => {
              setCalendarExpanded(prev => !prev);
              setTaskboardExpanded(prev => !prev);
              setViewMode(calendarExpanded ? 'taskboard' : 'calendar');
            }}
          >
            <CalendarView
              events={events}
              tasks={tasks}
              onDateChange={handleCalendarDateChange}
              scrollToCurrentTime
              minimized={!calendarExpanded}
              singleDayMode={taskboardExpanded} // 👈 This is the important new prop
              onEventClick={handleEventClick}
            />
          </AnimatedPanel>

          <AnimatedPanel
            title="Task Board"
            side="right"
            expanded={taskboardExpanded}
            onToggle={() => {
              setTaskboardExpanded(prev => !prev);
              setCalendarExpanded(prev => !prev);
              setViewMode(taskboardExpanded ? 'calendar' : 'taskboard');
            }}
          >
            {taskboardExpanded ? (
              <TaskBoard tasks={tasks} />
            ) : (
              <StackedTaskBoard
                tasks={tasks}
                collapsedSections={collapsedSections}
                onToggleSection={handleToggleSection}
                onTaskClick={() => {}}
                onAddTask={(priority: Priority) => {
                  setDefaultPriority(priority);
                  setShowAddDialog(true);
                }}
              />
            )}
          </AnimatedPanel>
        </div>
      </main>

      <EventDetailsDialog
        event={selectedEvent}
        open={showEventDialog}
        onClose={() => setShowEventDialog(false)}
      />

      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onClose={() => setShowAddDialog(false)}
        onCreate={handleCreateTask}
        defaultPriority={defaultPriority}
        labels={labels}
        availableLabels={labels}
        defaultEstimate={30}
      />
    </div>
  );
};

export default Index;
