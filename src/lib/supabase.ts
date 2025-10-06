import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Fail fast in dev/browser if envs aren’t wired up so we don’t call placeholder.supabase.co
  const msg = 'Supabase env missing: ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.'
  // eslint-disable-next-line no-console
  console.error(msg, { supabaseUrlPresent: !!supabaseUrl, supabaseAnonKeyPresent: !!supabaseAnonKey })
  throw new Error(msg)
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Type-safe client for server-side operations
export type Database = {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          slug: string
          name: string
          timezone: string
          currency: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          timezone?: string
          currency?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          timezone?: string
          currency?: string
          active?: boolean
          updated_at?: string
        }
      }
      tenant_policies: {
        Row: {
          id: string
          tenant_id: string
          buffer_minutes: number
          refund_days_full: number
          reschedule_window_days: number
          tax_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          buffer_minutes?: number
          refund_days_full?: number
          reschedule_window_days?: number
          tax_rate?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          buffer_minutes?: number
          refund_days_full?: number
          reschedule_window_days?: number
          tax_rate?: number
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          max_kids: number
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          max_kids: number
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          max_kids?: number
          active?: boolean
          updated_at?: string
        }
      }
      packages: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          base_price: number
          base_kids: number
          extra_kid_price: number
          duration_minutes: number
          includes_json: any
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          base_price: number
          base_kids: number
          extra_kid_price: number
          duration_minutes: number
          includes_json?: any
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          base_price?: number
          base_kids?: number
          extra_kid_price?: number
          duration_minutes?: number
          includes_json?: any
          active?: boolean
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          tenant_id: string
          customer_id: string
          package_id: string
          room_id: string
          start_time: string
          end_time: string
          kids_count: number
          status: string
          deposit_due: number
          deposit_paid: number
          balance_due: number
          balance_paid: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          customer_id: string
          package_id: string
          room_id: string
          start_time: string
          end_time: string
          kids_count: number
          status?: string
          deposit_due: number
          deposit_paid?: number
          balance_due: number
          balance_paid?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          customer_id?: string
          package_id?: string
          room_id?: string
          start_time?: string
          end_time?: string
          kids_count?: number
          status?: string
          deposit_due?: number
          deposit_paid?: number
          balance_due?: number
          balance_paid?: number
          notes?: string | null
          updated_at?: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
  }
}