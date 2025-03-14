
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
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  isGoogleEvent: boolean;
}
