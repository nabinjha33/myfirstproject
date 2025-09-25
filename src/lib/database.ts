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
    if (error) throw error
    return data || []
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
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
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
      .order('name')

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
      .select('*, brands(*), categories(*)')
      .eq('featured', true)
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
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
      .select('*, brands(*), categories(*)')
      .eq('active', true)
      .order('name')

    if (error) throw error
    return data || []
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

// Export service instances
export const userService = new UserService()
export const brandService = new BrandService()
export const categoryService = new CategoryService()
export const productService = new ProductService()
export const dealerApplicationService = new DealerApplicationService()
export const orderService = new OrderService()
export const shipmentService = new ShipmentService()

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
