import { supabase } from './supabase'
import type { Database } from './supabase'

// Type definitions for better TypeScript support
type Tables = Database['public']['Tables']
type User = Tables['users']['Row']
type Brand = Tables['brands']['Row']
type Category = Tables['categories']['Row']
type Product = Tables['products']['Row']
type DealerApplication = Tables['dealer_applications']['Row']
type Order = Tables['orders']['Row']
type Shipment = Tables['shipments']['Row']

// Base database service class
export class DatabaseService {
  protected tableName: string

  constructor(tableName: string) {
    this.tableName = tableName
  }

  async list(sortBy?: string, filters?: any) {
    try {
      let query = supabase.from(this.tableName).select('*')

      // Apply filters
      if (filters) {
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== null) {
            query = query.eq(key, filters[key])
          }
        })
      }

      // Apply sorting
      if (sortBy) {
        const isDescending = sortBy.startsWith('-')
        const field = isDescending ? sortBy.substring(1) : sortBy
        query = query.order(field, { ascending: !isDescending })
      }

      const { data, error } = await query
      
      if (error) {
        console.error(`Database error in ${this.tableName}.list():`, error)
        
        // If it's an RLS policy error, provide helpful guidance
        if (error.message?.includes('infinite recursion detected in policy')) {
          console.error('RLS Policy Error: Please run the fix-policies.sql or disable-rls-dev.sql script in your Supabase SQL editor')
          throw new Error(`RLS Policy Error in ${this.tableName}: ${error.message}. Please check the database policies.`)
        }
        
        // If table doesn't exist, return empty array for graceful degradation
        if (error.message?.includes('relation') && error.message?.includes('does not exist')) {
          console.warn(`Table ${this.tableName} does not exist. Please run the database migration scripts.`)
          return []
        }
        
        throw error
      }
      return data || []
    } catch (error) {
      console.error(`Error in ${this.tableName}.list():`, error)
      throw error
    }
  }

  async findById(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findBySlug(slug: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async create(itemData: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(id: string) {
    const { data, error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async search(query: string, searchFields: string[] = ['name']) {
    if (!query) return this.list()

    let supabaseQuery = supabase.from(this.tableName).select('*')

    // Create OR condition for multiple fields
    const orConditions = searchFields
      .map(field => `${field}.ilike.%${query}%`)
      .join(',')

    supabaseQuery = supabaseQuery.or(orConditions)

    const { data, error } = await supabaseQuery
    if (error) throw error
    return data || []
  }
}

// User service
export class UserService extends DatabaseService {
  constructor() {
    super('users')
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)

    if (error) throw error
    return data || []
  }

  async findByStatus(status: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('dealer_status', status)

    if (error) throw error
    return data || []
  }

  async me(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    return this.findById(user.id)
  }

  async updateMyUserData(updates: any): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    return this.update(user.id, updates)
  }
}

// Brand service
export class BrandService extends DatabaseService {
  constructor() {
    super('brands')
  }

  async getBySlug(slug: string): Promise<Brand | null> {
    return this.findBySlug(slug)
  }

  async getActive(): Promise<Brand[]> {
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true })

      if (error) {
        console.error('Database error in brands.getActive():', error)
        throw error
      }
      return data || []
    } catch (error) {
      console.error('Error in brands.getActive():', error)
      throw error
    }
  }
}

// Category service
export class CategoryService extends DatabaseService {
  constructor() {
    super('categories')
  }

  async getBySlug(slug: string): Promise<Category | null> {
    return this.findBySlug(slug)
  }

  async getActive(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error
    return data || []
  }
}

// Product service
export class ProductService extends DatabaseService {
  constructor() {
    super('products')
  }

  async findByBrand(brandId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(*)')
      .eq('brand_id', brandId)
      .eq('active', true)

    if (error) throw error
    return data || []
  }

  async getFeatured(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(id, name, slug),
        categories!inner(id, name, slug)
      `)
      .eq('featured', true)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match expected format
    return (data || []).map(product => ({
      ...product,
      brand: product.brands?.name || 'Unknown',
      category: product.categories?.name || 'Uncategorized',
      created_date: product.created_at // Add compatibility field
    }))
  }

  async getByCategory(categoryId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*, brands(*), categories(*)')
      .eq('category_id', categoryId)
      .eq('active', true)

    if (error) throw error
    return data || []
  }

  async getWithRelations() {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(id, name, slug),
        categories!inner(id, name, slug)
      `)
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Transform the data to match expected format
    return (data || []).map(product => ({
      ...product,
      brand: product.brands?.name || 'Unknown',
      category: product.categories?.name || 'Uncategorized',
      created_date: product.created_at // Add compatibility field
    }))
  }

  async findBySlugWithRelations(slug: string) {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands!inner(id, name, slug, origin_country),
        categories!inner(id, name, slug)
      `)
      .eq('slug', slug)
      .eq('active', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    
    if (!data) return null
    
    // Transform the data to match expected format
    return {
      ...data,
      brand: data.brands?.name || 'Unknown',
      brand_origin_country: data.brands?.origin_country || null,
      category: data.categories?.name || 'Uncategorized',
      created_date: data.created_at // Add compatibility field
    }
  }
}

// Dealer Application service
export class DealerApplicationService extends DatabaseService {
  constructor() {
    super('dealer_applications')
  }

  async findByEmail(email: string): Promise<DealerApplication | null> {
    const { data, error } = await supabase
      .from('dealer_applications')
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findByStatus(status: string): Promise<DealerApplication[]> {
    const { data, error } = await supabase
      .from('dealer_applications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findByBusinessType(businessType: string): Promise<DealerApplication[]> {
    const { data, error } = await supabase
      .from('dealer_applications')
      .select('*')
      .eq('business_type', businessType)

    if (error) throw error
    return data || []
  }

  async approve(id: string): Promise<DealerApplication> {
    return this.update(id, { status: 'approved' })
  }

  async reject(id: string): Promise<DealerApplication> {
    return this.update(id, { status: 'rejected' })
  }
}

// Order service
export class OrderService extends DatabaseService {
  constructor() {
    super('orders')
  }

  async findByDealer(dealerEmail: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('dealer_email', dealerEmail)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findByStatus(status: string): Promise<Order[]> {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async generateOrderNumber(): Promise<string> {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    
    // Get count of orders this month
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', `${year}-${month}-01`)
      .lt('created_at', `${year}-${String(parseInt(month) + 1).padStart(2, '0')}-01`)

    const orderNumber = `ORD-${year}${month}-${String((count || 0) + 1).padStart(3, '0')}`
    return orderNumber
  }

  async createOrder(orderData: any): Promise<Order> {
    const orderNumber = await this.generateOrderNumber()
    return this.create({
      ...orderData,
      order_number: orderNumber,
      inquiry_type: 'order'
    })
  }

  async createInquiry(inquiryData: any): Promise<Order> {
    const inquiryNumber = await this.generateOrderNumber()
    return this.create({
      ...inquiryData,
      order_number: inquiryNumber.replace('ORD-', 'INQ-'),
      inquiry_type: 'inquiry'
    })
  }
}

// Shipment service
export class ShipmentService extends DatabaseService {
  constructor() {
    super('shipments')
  }

  async findByTrackingNumber(trackingNumber: string): Promise<Shipment | null> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('tracking_number', trackingNumber)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findByStatus(status: string): Promise<Shipment[]> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('status', status)
      .order('last_updated', { ascending: false })

    if (error) throw error
    return data || []
  }

  async findByOrigin(originCountry: string): Promise<Shipment[]> {
    const { data, error } = await supabase
      .from('shipments')
      .select('*')
      .eq('origin_country', originCountry)

    if (error) throw error
    return data || []
  }

  async updateStatus(id: string, status: string): Promise<Shipment> {
    return this.update(id, { 
      status, 
      last_updated: new Date().toISOString() 
    })
  }
}

// SiteSettings service
export class SiteSettingsService extends DatabaseService {
  constructor() {
    super('site_settings')
  }

  async getSettings() {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code === 'PGRST116') {
        // No settings found, return default
        return {
          id: '1',
          company_name: 'Jeen Mata Impex',
          tagline: 'Premium Import Solutions',
          contact_email: 'jeenmataimpex8@gmail.com',
          contact_phone: '+977-1-XXXXXXX',
          contact_address: 'Kathmandu, Nepal',
          whatsapp_number: '+977-9876543210',
          default_theme: 'light',
          default_language: 'en',
          enable_dealer_notifications: true,
          enable_inquiry_notifications: true,
          enable_whatsapp_notifications: false,
          auto_approve_dealers: false,
          created_at: new Date().toISOString()
        }
      }

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching site settings:', error)
      // Return default settings on error
      return {
        id: '1',
        company_name: 'Jeen Mata Impex',
        tagline: 'Premium Import Solutions',
        contact_email: 'jeenmataimpex8@gmail.com',
        contact_phone: '+977-1-XXXXXXX',
        contact_address: 'Kathmandu, Nepal',
        whatsapp_number: '+977-9876543210',
        default_theme: 'light',
        default_language: 'en',
        enable_dealer_notifications: true,
        enable_inquiry_notifications: true,
        enable_whatsapp_notifications: false,
        auto_approve_dealers: false,
        created_at: new Date().toISOString()
      }
    }
  }

  async updateSettings(settingsData: any) {
    try {
      console.log('Updating site settings with data:', settingsData)
      
      // First, try to get existing settings
      const { data: existing } = await supabase
        .from('site_settings')
        .select('id')
        .limit(1)
        .single()

      if (existing) {
        // Update existing record
        const { data, error } = await supabase
          .from('site_settings')
          .update({
            company_name: settingsData.company_name,
            tagline: settingsData.tagline,
            contact_email: settingsData.contact_email,
            contact_phone: settingsData.contact_phone,
            contact_address: settingsData.contact_address,
            whatsapp_number: settingsData.whatsapp_number,
            default_theme: settingsData.default_theme,
            default_language: settingsData.default_language,
            enable_dealer_notifications: settingsData.enable_dealer_notifications,
            enable_inquiry_notifications: settingsData.enable_inquiry_notifications,
            enable_whatsapp_notifications: settingsData.enable_whatsapp_notifications,
            auto_approve_dealers: settingsData.auto_approve_dealers,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          console.error('Error updating site settings:', error)
          throw error
        }
        
        console.log('Site settings updated successfully:', data)
        return data
      } else {
        // Create new record if none exists
        const { data, error } = await supabase
          .from('site_settings')
          .insert({
            company_name: settingsData.company_name,
            tagline: settingsData.tagline,
            contact_email: settingsData.contact_email,
            contact_phone: settingsData.contact_phone,
            contact_address: settingsData.contact_address,
            whatsapp_number: settingsData.whatsapp_number,
            default_theme: settingsData.default_theme,
            default_language: settingsData.default_language,
            enable_dealer_notifications: settingsData.enable_dealer_notifications,
            enable_inquiry_notifications: settingsData.enable_inquiry_notifications,
            enable_whatsapp_notifications: settingsData.enable_whatsapp_notifications,
            auto_approve_dealers: settingsData.auto_approve_dealers
          })
          .select()
          .single()

        if (error) {
          console.error('Error creating site settings:', error)
          throw error
        }
        
        console.log('Site settings created successfully:', data)
        return data
      }
    } catch (error) {
      console.error('Error in updateSettings:', error)
      throw error
    }
  }
}

// PageVisit service
export class PageVisitService extends DatabaseService {
  constructor() {
    super('page_visits')
  }

  async trackVisit(visitData: {
    path: string
    page: string
    user_email?: string
    user_agent: string
  }) {
    try {
      return await this.create({
        ...visitData,
        visited_at: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error tracking page visit:', error)
      // Don't throw error for analytics - just log it
      return null
    }
  }

  async getVisitsByDateRange(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('page_visits')
        .select('*')
        .gte('visited_at', startDate)
        .lte('visited_at', endDate)
        .order('visited_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching page visits:', error)
      return []
    }
  }
}

// Export service instances
export const userService = new UserService()
export const brandService = new BrandService()
export const categoryService = new CategoryService()
export const productService = new ProductService()
export const dealerApplicationService = new DealerApplicationService()
export const orderService = new OrderService()
export const shipmentService = new ShipmentService()
export const siteSettingsService = new SiteSettingsService()
export const pageVisitService = new PageVisitService()

// Export types
export type {
  User,
  Brand,
  Category,
  Product,
  DealerApplication,
  Order,
  Shipment
}
