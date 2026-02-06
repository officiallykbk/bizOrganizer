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
      cargo_jobs: {
        Row: {
          id: string
          shipper_name: string
          payment_status: string
          delivery_status: string
          pickup_location: string
          dropoff_location: string
          intermediate_stops: Json | null
          pickup_date: string
          estimated_delivery_date: string
          actual_delivery_date: string | null
          agreed_price: number
          notes: string | null
          created_at: string
          updated_at: string
          created_by: string
        }
        Insert: {
          id?: string
          shipper_name: string
          payment_status: string
          delivery_status: string
          pickup_location: string
          dropoff_location: string
          intermediate_stops?: Json | null
          pickup_date: string
          estimated_delivery_date: string
          actual_delivery_date?: string | null
          agreed_price: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by: string
        }
        Update: {
          id?: string
          shipper_name?: string
          payment_status?: string
          delivery_status?: string
          pickup_location?: string
          dropoff_location?: string
          intermediate_stops?: Json | null
          pickup_date?: string
          estimated_delivery_date?: string
          actual_delivery_date?: string | null
          agreed_price?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string
        }
      }
      job_history: {
        Row: {
          id: string
          job_id: string
          field: string
          old_value: Json | null
          new_value: Json
          changed_at: string
          changed_by: string
        }
        Insert: {
          id?: string
          job_id: string
          field: string
          old_value?: Json | null
          new_value: Json
          changed_at?: string
          changed_by: string
        }
        Update: {
          id?: string
          job_id?: string
          field?: string
          old_value?: Json | null
          new_value?: Json
          changed_at?: string
          changed_by?: string
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