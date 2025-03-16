
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'unscheduled' | 'scheduled' | 'completed'
          start_time: string | null
          end_time: string | null
          position: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority: 'low' | 'medium' | 'high' | 'critical'
          status: 'unscheduled' | 'scheduled' | 'completed'
          start_time?: string | null
          end_time?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high' | 'critical'
          status?: 'unscheduled' | 'scheduled' | 'completed'
          start_time?: string | null
          end_time?: string | null
          position?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      task_labels: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      task_label_relations: {
        Row: {
          id: string
          task_id: string
          label_id: string
        }
        Insert: {
          id?: string
          task_id: string
          label_id: string
        }
        Update: {
          id?: string
          task_id?: string
          label_id?: string
        }
      }
    }
  }
}
