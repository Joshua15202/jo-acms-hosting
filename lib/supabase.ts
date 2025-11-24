import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Define the database types
export type User = {
  id: string
  first_name: string
  last_name: string
  full_name: string
  email: string
  phone?: string
  password_hash: string
  role: "user" | "admin" | "assistant"
  is_verified: boolean
  verification_code?: string
  verification_expires?: string
  created_at: string
  updated_at: string
}

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
      tbl_users: {
        Row: User
        Insert: Omit<User, "id" | "created_at" | "updated_at"> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Omit<User, "id">>
      }
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

if (!supabaseServiceKey && typeof window === "undefined") {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Admin client for server-side operations only
export const supabaseAdmin = supabaseServiceKey
  ? createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

// Client for browser operations
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Export function to create a browser client instance
export function createBrowserClient(): SupabaseClient<Database> {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Export a function to get the appropriate client
export function getSupabaseClient(useServiceRole = false): SupabaseClient<Database> {
  if (useServiceRole && !supabaseAdmin) {
    throw new Error("Admin client not available")
  }
  return useServiceRole ? supabaseAdmin! : supabase
}

console.log("Supabase clients initialized successfully")
