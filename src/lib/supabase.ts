import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  });
  throw new Error('Missing Supabase environment variables')
}

console.log('Creating Supabase client with URL:', supabaseUrl.substring(0, 30) + '...');
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log('Supabase client created successfully:', !!supabase);

// Database Types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          business_name?: string
          vat_pan?: string
          address?: string
          phone?: string
          whatsapp?: string
          role: 'admin' | 'dealer' | 'user'
          dealer_status?: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          business_name?: string
          vat_pan?: string
          address?: string
          phone?: string
          whatsapp?: string
          role?: 'admin' | 'dealer' | 'user'
          dealer_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          business_name?: string
          vat_pan?: string
          address?: string
          phone?: string
          whatsapp?: string
          role?: 'admin' | 'dealer' | 'user'
          dealer_status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      brands: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          logo?: string
          origin_country?: string
          established_year?: string
          specialty?: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          logo?: string
          origin_country?: string
          established_year?: string
          specialty?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          logo?: string
          origin_country?: string
          established_year?: string
          specialty?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          parent_id?: string
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          parent_id?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          parent_id?: string
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          slug: string
          description?: string
          brand_id: string
          category_id: string
          images: string[]
          variants: any[]
          featured: boolean
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string
          brand_id: string
          category_id: string
          images?: string[]
          variants?: any[]
          featured?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string
          brand_id?: string
          category_id?: string
          images?: string[]
          variants?: any[]
          featured?: boolean
          active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      dealer_applications: {
        Row: {
          id: string
          business_name: string
          contact_person: string
          email: string
          phone: string
          whatsapp?: string
          address: string
          vat_pan?: string
          business_type: string
          years_in_business: string
          interested_brands?: string[]
          annual_turnover?: string
          experience_years?: number
          message?: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          business_name: string
          contact_person: string
          email: string
          phone: string
          whatsapp?: string
          address: string
          vat_pan?: string
          business_type: string
          years_in_business: string
          interested_brands?: string[]
          annual_turnover?: string
          experience_years?: number
          message?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          business_name?: string
          contact_person?: string
          email?: string
          phone?: string
          whatsapp?: string
          address?: string
          vat_pan?: string
          business_type?: string
          years_in_business?: string
          interested_brands?: string[]
          annual_turnover?: string
          experience_years?: number
          message?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          order_number: string
          dealer_id: string
          dealer_email: string
          dealer_name: string
          contact_person: string
          contact_phone: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_date: string
          items: any[]
          total_items: number
          estimated_total_value: number
          additional_notes?: string
          inquiry_type: 'order' | 'inquiry'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          order_number: string
          dealer_id: string
          dealer_email: string
          dealer_name: string
          contact_person: string
          contact_phone: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_date: string
          items: any[]
          total_items: number
          estimated_total_value: number
          additional_notes?: string
          inquiry_type?: 'order' | 'inquiry'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          order_number?: string
          dealer_id?: string
          dealer_email?: string
          dealer_name?: string
          contact_person?: string
          contact_phone?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          order_date?: string
          items?: any[]
          total_items?: number
          estimated_total_value?: number
          additional_notes?: string
          inquiry_type?: 'order' | 'inquiry'
          created_at?: string
          updated_at?: string
        }
      }
      shipments: {
        Row: {
          id: string
          tracking_number: string
          origin_country: string
          status: 'pending' | 'in_transit' | 'customs' | 'delivered'
          eta_date?: string
          product_names: string[]
          port_name?: string
          last_updated: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tracking_number: string
          origin_country: string
          status?: 'pending' | 'in_transit' | 'customs' | 'delivered'
          eta_date?: string
          product_names: string[]
          port_name?: string
          last_updated: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tracking_number?: string
          origin_country?: string
          status?: 'pending' | 'in_transit' | 'customs' | 'delivered'
          eta_date?: string
          product_names?: string[]
          port_name?: string
          last_updated?: string
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
