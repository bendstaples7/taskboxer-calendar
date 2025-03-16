
import { supabase } from '@/integrations/supabase/client';
import { Task, Label, Priority } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Default user ID for anonymous usage - in a real app this would be from authentication
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000000';

// Convert from app task model to database model
const taskToDbModel = (task: Task, userId: string) => {
  const status = task.completed
    ? 'completed'
    : task.scheduled
    ? 'scheduled'
    : 'unscheduled';

  return {
    id: task.id,
    user_id: userId,
    title: task.title,
    description: task.description || null,
    priority: task.priority,
    status,
    start_time: task.scheduled?.start ? new Date(task.scheduled.start).toISOString() : null,
    end_time: task.scheduled?.end ? new Date(task.scheduled.end).toISOString() : null,
    estimated_time: task.estimatedTime,
    remaining_time: task.remainingTime || null,
    position: task.position || 0,
    timer_started: task.timerStarted ? new Date(task.timerStarted).toISOString() : null,
    timer_paused: task.timerPaused ? new Date(task.timerPaused).toISOString() : null,
    timer_elapsed: task.timerElapsed || null,
    timer_expired: task.timerExpired || null,
    google_event_id: task.googleEventId || null,
    updated_at: new Date().toISOString(),
  };
};

// Convert from database model to app task model
const dbModelToTask = (dbTask: any, labels: Label[] = []): Task => {
  return {
    id: dbTask.id,
    title: dbTask.title,
    description: dbTask.description || '',
    priority: dbTask.priority as Priority,
    estimatedTime: dbTask.estimated_time || 30,
    completed: dbTask.status === 'completed',
    labels,
    position: dbTask.position || 0,
    scheduled: dbTask.start_time && dbTask.end_time
      ? { 
          start: new Date(dbTask.start_time), 
          end: new Date(dbTask.end_time) 
        }
      : undefined,
    timerStarted: dbTask.timer_started ? new Date(dbTask.timer_started) : undefined,
    timerPaused: dbTask.timer_paused ? new Date(dbTask.timer_paused) : undefined,
    timerElapsed: dbTask.timer_elapsed || undefined,
    timerExpired: dbTask.timer_expired || undefined,
    remainingTime: dbTask.remaining_time || undefined,
    googleEventId: dbTask.google_event_id || undefined,
  };
};

export const fetchTasks = async (): Promise<Task[]> => {
  try {
    // Fetch tasks
    const { data: dbTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', DEFAULT_USER_ID);

    if (tasksError) throw tasksError;
    if (!dbTasks) return [];

    // Fetch task-label relations
    const { data: relations, error: relationsError } = await supabase
      .from('task_label_relations')
      .select('*')
      .in('task_id', dbTasks.map(task => task.id));

    if (relationsError) throw relationsError;

    // Fetch all unique labels
    const labelIds = [...new Set((relations || []).map(rel => rel.label_id))];
    
    let labels: any[] = [];
    if (labelIds.length > 0) {
      const { data: dbLabels, error: labelsError } = await supabase
        .from('task_labels')
        .select('*')
        .in('id', labelIds);

      if (labelsError) throw labelsError;
      labels = dbLabels || [];
    }

    // Map tasks with their labels
    return dbTasks.map(dbTask => {
      const taskLabelIds = (relations || [])
        .filter(rel => rel.task_id === dbTask.id)
        .map(rel => rel.label_id);
      
      const taskLabels = labels
        .filter(label => taskLabelIds.includes(label.id))
        .map(label => ({
          id: label.id,
          name: label.name,
          color: label.color
        }));

      return dbModelToTask(dbTask, taskLabels);
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
};

export const createTask = async (task: Task, userId = DEFAULT_USER_ID): Promise<Task | null> => {
  try {
    // Create task
    const { data: createdTask, error: taskError } = await supabase
      .from('tasks')
      .insert(taskToDbModel(task, userId))
      .select()
      .single();

    if (taskError) throw taskError;
    if (!createdTask) return null;

    // Create label relations if needed
    if (task.labels && task.labels.length > 0) {
      const labelRelations = task.labels.map(label => ({
        id: uuidv4(),
        task_id: createdTask.id,
        label_id: label.id
      }));

      const { error: relationsError } = await supabase
        .from('task_label_relations')
        .insert(labelRelations);

      if (relationsError) throw relationsError;
    }

    return {
      ...task,
      id: createdTask.id
    };
  } catch (error) {
    console.error('Error creating task:', error);
    return null;
  }
};

export const updateTask = async (task: Task, userId = DEFAULT_USER_ID): Promise<boolean> => {
  try {
    // Update task
    const { error: taskError } = await supabase
      .from('tasks')
      .update(taskToDbModel(task, userId))
      .eq('id', task.id);

    if (taskError) throw taskError;

    // Handle label relations
    // First, delete existing relations
    const { error: deleteError } = await supabase
      .from('task_label_relations')
      .delete()
      .eq('task_id', task.id);

    if (deleteError) throw deleteError;

    // Then, insert new relations
    if (task.labels && task.labels.length > 0) {
      const labelRelations = task.labels.map(label => ({
        id: uuidv4(),
        task_id: task.id,
        label_id: label.id
      }));

      const { error: relationsError } = await supabase
        .from('task_label_relations')
        .insert(labelRelations);

      if (relationsError) throw relationsError;
    }

    return true;
  } catch (error) {
    console.error('Error updating task:', error);
    return false;
  }
};

export const deleteTask = async (taskId: string): Promise<boolean> => {
  try {
    // Delete label relations first
    const { error: relationsError } = await supabase
      .from('task_label_relations')
      .delete()
      .eq('task_id', taskId);

    if (relationsError) throw relationsError;

    // Delete the task
    const { error: taskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (taskError) throw taskError;

    return true;
  } catch (error) {
    console.error('Error deleting task:', error);
    return false;
  }
};

export const fetchLabels = async (userId = DEFAULT_USER_ID): Promise<Label[]> => {
  try {
    const { data, error } = await supabase
      .from('task_labels')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(label => ({
      id: label.id,
      name: label.name,
      color: label.color
    }));
  } catch (error) {
    console.error('Error fetching labels:', error);
    return [];
  }
};

export const createLabel = async (label: Label, userId = DEFAULT_USER_ID): Promise<Label | null> => {
  try {
    const { data, error } = await supabase
      .from('task_labels')
      .insert({
        id: label.id || uuidv4(),
        name: label.name,
        color: label.color,
        user_id: userId
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      color: data.color
    };
  } catch (error) {
    console.error('Error creating label:', error);
    return null;
  }
};

export const updateTaskPositions = async (tasks: Task[], userId = DEFAULT_USER_ID): Promise<boolean> => {
  try {
    const updates = tasks.map(task => ({
      id: task.id,
      position: task.position || 0,
      user_id: userId
    }));

    const { error } = await supabase
      .from('tasks')
      .upsert(updates, { onConflict: 'id' });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating task positions:', error);
    return false;
  }
};
