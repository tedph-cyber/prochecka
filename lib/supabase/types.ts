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
      chat_history: {
        Row: {
          id: string
          user_id: string
          role: 'user' | 'assistant'
          text: string
          timestamp: string
          is_final: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role: 'user' | 'assistant'
          text: string
          timestamp?: string
          is_final?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: 'user' | 'assistant'
          text?: string
          timestamp?: string
          is_final?: boolean
          created_at?: string
        }
      }
      action_plans: {
        Row: {
          id: string
          user_id: string
          risk_score: number
          factor: string
          plan_message: string
          tasks: TaskItem[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          risk_score: number
          factor: string
          plan_message: string
          tasks: TaskItem[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          risk_score?: number
          factor?: string
          plan_message?: string
          tasks?: TaskItem[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export interface TaskItem {
  id: string
  text: string
  completed: boolean
}
