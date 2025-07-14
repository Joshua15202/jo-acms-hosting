import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Define the database types for the auth system
export type User = {
  id: string
  first_name: string
  last_name: string
  email: string
  password: string // Note: In production, this should be password_hash
  verified: boolean
  created_at: string
}

export type VerificationCode = {
  id: string
  email: string
  code: string
  expires_at: string
  created_at: string
}

// Your existing types for the catering system
export type Appointment = {
  id: string
  user_id: string
  event_type: string
  guest_count: number
  event_date: string
  event_time: string
  venue?: string
  budget?: number
  special_requests?: string
  contact_name: string
  contact_email: string
  contact_phone?: string
  selected_package?: any
  customizations?: any
  status: "pending" | "confirmed" | "cancelled" | "completed"
  created_at: string
  updated_at: string
}

export type ChatSession = {
  id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
}

export type Message = {
  id: string
  session_id: string
  user_id: string
  content: string
  role: "user" | "assistant"
  created_at: string
  updated_at: string
}

// Database schema type
export type Database = {
  public: {
    Tables: {
      // Auth tables (what we created)
      users: {
        Row: User
        Insert: Omit<User, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<User, "id">>
      }
      verification_codes: {
        Row: VerificationCode
        Insert: Omit<VerificationCode, "id" | "created_at"> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Omit<VerificationCode, "id">>
      }
      // Your existing catering tables
      tbl_appointments: {
        Row: Appointment
        Insert: Omit<Appointment, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Appointment, "id">>
      }
      chat_sessions: {
        Row: ChatSession
        Insert: Omit<ChatSession, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<ChatSession, "id">>
      }
      messages: {
        Row: Message
        Insert: Omit<Message, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<Message, "id">>
      }
    }
  }
}

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Admin client for server-side operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Client for browser operations
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export a function to get the appropriate client
export function getSupabaseClient(useServiceRole = false): SupabaseClient<Database> {
  return useServiceRole ? supabaseAdmin : supabase
}

console.log("Supabase clients initialized successfully")
