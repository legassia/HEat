// Supabase Database Types
// This file will be auto-generated when you run `supabase gen types typescript`
// For now, we define basic types manually

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
      profiles: {
        Row: {
          id: string
          name: string | null
          phone: string | null
          address: string | null
          avatar_url: string | null
          emoji: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          emoji?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          phone?: string | null
          address?: string | null
          avatar_url?: string | null
          emoji?: string | null
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          category: 'arepas' | 'perros' | 'hamburguesas'
          base_price: number
          description: string | null
          image_url: string | null
          is_available: boolean
          popular: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          category: 'arepas' | 'perros' | 'hamburguesas'
          base_price: number
          description?: string | null
          image_url?: string | null
          is_available?: boolean
          popular?: boolean
        }
        Update: {
          name?: string
          category?: 'arepas' | 'perros' | 'hamburguesas'
          base_price?: number
          description?: string | null
          image_url?: string | null
          is_available?: boolean
          popular?: boolean
          updated_at?: string
        }
      }
      product_options: {
        Row: {
          id: string
          product_id: string
          name: string
          option_group: string
          price_modifier: number
          is_default: boolean
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          option_group: string
          price_modifier?: number
          is_default?: boolean
          is_available?: boolean
        }
        Update: {
          product_id?: string
          name?: string
          option_group?: string
          price_modifier?: number
          is_default?: boolean
          is_available?: boolean
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          plate_code: string
          status: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
          total: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          plate_code?: string
          status?: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
          total: number
          notes?: string | null
        }
        Update: {
          user_id?: string | null
          plate_code?: string
          status?: 'pending' | 'cooking' | 'ready' | 'delivered' | 'cancelled'
          total?: number
          notes?: string | null
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          selected_options: Json
          subtotal: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          selected_options?: Json
          subtotal: number
        }
        Update: {
          order_id?: string
          product_id?: string | null
          quantity?: number
          selected_options?: Json
          subtotal?: number
        }
      }
    }
    Functions: {
      generate_plate_code: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

