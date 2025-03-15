
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export type Label = {
  id: string;
  name: string;
  color: string;
};

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  estimatedTime: number; // in minutes
  completed: boolean;
  labels: Label[];
  scheduled?: {
    start: Date;
    end: Date;
  };
  // New fields for timer functionality
  timerStarted?: Date; // When the timer was last started
  timerPaused?: Date; // When the timer was last paused
  timerElapsed?: number; // Total elapsed time in minutes
  timerExpired?: boolean; // Whether the timer has expired
  remainingTime?: number; // Remaining time in minutes (for partially completed tasks)
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isGoogleEvent: boolean;
}

export interface TaskSection {
  id: string;
  title: string;
  tasks: Task[];
  collapsed?: boolean;
}
