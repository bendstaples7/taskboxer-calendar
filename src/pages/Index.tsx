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
import { Plus, Calendar as CalendarIcon, LayoutList } from "lucide-react";
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

  const handleGoogleCalendarEvents = (googleEvents: any[]) => {
    const normalized = googleEvents.map(event => ({
      id: event.id,
      title: event.summary || "(No title)",
      start: new Date(event.start?.dateTime || event.start?.date),
      end: new Date(event.end?.dateTime || event.end?.date),
      isGoogleEvent: true
    }));

    const nonGoogleEvents = events.filter(event => !event.isGoogleEvent);
    setEvents([...nonGoogleEvents, ...normalized]);
  };

  const handleCalendarDateChange = (date: Date) => {
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
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <div className="flex gap-4 h-[calc(100vh-10rem)]">
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
              singleDayMode={false}
              events={events}
              tasks={tasks}
              onDateChange={handleCalendarDateChange}
              scrollToCurrentTime
              minimized={!calendarExpanded}
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
              />
            )}
          </AnimatedPanel>
        </div>
      </main>
    </div>
  );
};

export default Index;
