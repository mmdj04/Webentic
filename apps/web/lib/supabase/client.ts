import { createBrowserClient } from '@supabase/ssr'

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      agent_configs: {
        Row: {
          id: string
          user_id: string
          name: string
          api_used: string
          model_type: string
          status: 'running' | 'stopped' | 'error'
          gemini_api_key: string | null
          github_token: string | null
          generation_frequency: 'manual' | '1h' | '3h' | '6h' | '12h' | '24h'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          api_used: string
          model_type?: string
          status?: 'running' | 'stopped' | 'error'
          gemini_api_key?: string | null
          github_token?: string | null
          generation_frequency?: 'manual' | '1h' | '3h' | '6h' | '12h' | '24h'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          api_used?: string
          model_type?: string
          status?: 'running' | 'stopped' | 'error'
          gemini_api_key?: string | null
          github_token?: string | null
          generation_frequency?: 'manual' | '1h' | '3h' | '6h' | '12h' | '24h'
          created_at?: string
          updated_at?: string
        }
      }
      agent_logs: {
        Row: {
          id: number
          agent_id: string
          message: string
          level: string
          created_at: string
        }
        Insert: {
          id?: number
          agent_id: string
          message: string
          level?: string
          created_at?: string
        }
        Update: {
          id?: number
          agent_id?: string
          message?: string
          level?: string
          created_at?: string
        }
      }
      repository_analyses: {
        Row: {
          id: string
          user_id: string
          repo_owner: string
          repo_name: string
          repo_url: string
          analysis_data: Json | null
          documentation: string | null
          status: 'pending' | 'analyzing' | 'completed' | 'failed'
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          repo_owner: string
          repo_name: string
          repo_url: string
          analysis_data?: Json | null
          documentation?: string | null
          status?: 'pending' | 'analyzing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          repo_owner?: string
          repo_name?: string
          repo_url?: string
          analysis_data?: Json | null
          documentation?: string | null
          status?: 'pending' | 'analyzing' | 'completed' | 'failed'
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
