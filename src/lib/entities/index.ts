// Import database services
import {
  userService,
  brandService,
  categoryService,
  productService,
  dealerApplicationService,
  orderService,
  shipmentService,
  siteSettingsService,
  pageVisitService
} from '../database'

// Base entity class wrapper for database services
class BaseEntity {
  data: any;
  
  constructor(data: any) {
    this.data = data;
  }
}

// Product entity
class Product extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return productService.list(sortBy, filters);
  }

  static async filter(filters?: any, sortBy?: string, limit?: number): Promise<any[]> {
    // Handle featured products specifically
    if (filters?.featured === true) {
      const products = await productService.getFeatured();
      if (limit) {
        return products.slice(0, limit);
      }
      return products;
    }
    
    // For other filters, use the list method
    let result = await productService.list(sortBy, filters);
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  static async findById(id: string): Promise<any | null> {
    return productService.findById(id);
  }

  static async findBySlug(slug: string): Promise<any | null> {
    return productService.findBySlug(slug);
  }

  static async create(itemData: any): Promise<any> {
    return productService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return productService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return productService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return productService.search(query, ['name', 'description']);
  }

  static async findByBrand(brandId: string): Promise<any[]> {
    return productService.findByBrand(brandId);
  }

  static async getFeatured(): Promise<any[]> {
    return productService.getFeatured();
  }

  static async getByCategory(categoryId: string): Promise<any[]> {
    return productService.getByCategory(categoryId);
  }

  static async getWithRelations(): Promise<any[]> {
    return productService.getWithRelations();
  }
}

// Order entity
class Order extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return orderService.list(sortBy, filters);
  }

  static async findById(id: string): Promise<any | null> {
    return orderService.findById(id);
  }

  static async create(itemData: any): Promise<any> {
    return orderService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return orderService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return orderService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return orderService.search(query, ['order_number', 'dealer_name', 'dealer_email']);
  }

  static async findByDealer(dealerEmail: string): Promise<any[]> {
    return orderService.findByDealer(dealerEmail);
  }

  static async findByStatus(status: string): Promise<any[]> {
    return orderService.findByStatus(status);
  }

  static async createOrder(orderData: any): Promise<any> {
    return orderService.createOrder(orderData);
  }

  static async createInquiry(inquiryData: any): Promise<any> {
    return orderService.createInquiry(inquiryData);
  }
}

// Inquiry entity (now part of orders with inquiry_type = 'inquiry')
class Inquiry extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return orderService.list(sortBy, { ...filters, inquiry_type: 'inquiry' });
  }

  static async findById(id: string): Promise<any | null> {
    return orderService.findById(id);
  }

  static async create(itemData: any): Promise<any> {
    return orderService.createInquiry(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return orderService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return orderService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    const results = await orderService.search(query, ['order_number', 'dealer_name', 'dealer_email']);
    return results.filter((item: any) => item.inquiry_type === 'inquiry');
  }

  static async findByDealer(dealerEmail: string): Promise<any[]> {
    const results = await orderService.findByDealer(dealerEmail);
    return results.filter((item: any) => item.inquiry_type === 'inquiry');
  }

  static async findByStatus(status: string): Promise<any[]> {
    const results = await orderService.findByStatus(status);
    return results.filter((item: any) => item.inquiry_type === 'inquiry');
  }
}

// Shipment entity
class Shipment extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return shipmentService.list(sortBy, filters);
  }

  static async findById(id: string): Promise<any | null> {
    return shipmentService.findById(id);
  }

  static async create(itemData: any): Promise<any> {
    return shipmentService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return shipmentService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return shipmentService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return shipmentService.search(query, ['tracking_number', 'origin_country']);
  }

  static async findByTrackingNumber(trackingNumber: string): Promise<any | null> {
    return shipmentService.findByTrackingNumber(trackingNumber);
  }

  static async findByStatus(status: string): Promise<any[]> {
    return shipmentService.findByStatus(status);
  }

  static async findByOrigin(originCountry: string): Promise<any[]> {
    return shipmentService.findByOrigin(originCountry);
  }

  static async updateStatus(id: string, status: string): Promise<any> {
    return shipmentService.updateStatus(id, status);
  }
}

// User entity
class User extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return userService.list(sortBy, filters);
  }

  static async findById(id: string): Promise<any | null> {
    return userService.findById(id);
  }

  static async create(itemData: any): Promise<any> {
    return userService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return userService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return userService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return userService.search(query, ['full_name', 'email', 'business_name']);
  }

  static async findByEmail(email: string): Promise<any | null> {
    return userService.findByEmail(email);
  }

  static async findByRole(role: string): Promise<any[]> {
    return userService.findByRole(role);
  }

  static async findByStatus(status: string): Promise<any[]> {
    return userService.findByStatus(status);
  }

  static async me(): Promise<any | null> {
    return userService.me();
  }

  static async updateMyUserData(updates: any): Promise<any> {
    return userService.updateMyUserData(updates);
  }
}

// Brand entity
class Brand extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return brandService.list(sortBy, filters);
  }

  static async filter(filters?: any, sortBy?: string, limit?: number): Promise<any[]> {
    // Handle active brands specifically
    if (filters?.active === true) {
      const brands = await brandService.getActive();
      if (limit) {
        return brands.slice(0, limit);
      }
      return brands;
    }
    
    // For other filters, use the list method
    let result = await brandService.list(sortBy, filters);
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  static async findById(id: string): Promise<any | null> {
    return brandService.findById(id);
  }

  static async findBySlug(slug: string): Promise<any | null> {
    return brandService.findBySlug(slug);
  }

  static async create(itemData: any): Promise<any> {
    return brandService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return brandService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return brandService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return brandService.search(query, ['name', 'description']);
  }

  static async getBySlug(slug: string): Promise<any | null> {
    return brandService.getBySlug(slug);
  }

  static async getActive(): Promise<any[]> {
    return brandService.getActive();
  }
}

// Category entity
class Category extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return categoryService.list(sortBy, filters);
  }

  static async filter(filters?: any, sortBy?: string, limit?: number): Promise<any[]> {
    // Handle active categories specifically
    if (filters?.active === true) {
      const categories = await categoryService.getActive();
      if (limit) {
        return categories.slice(0, limit);
      }
      return categories;
    }
    
    // For other filters, use the list method
    let result = await categoryService.list(sortBy, filters);
    if (limit) {
      result = result.slice(0, limit);
    }
    return result;
  }

  static async findById(id: string): Promise<any | null> {
    return categoryService.findById(id);
  }

  static async findBySlug(slug: string): Promise<any | null> {
    return categoryService.findBySlug(slug);
  }

  static async create(itemData: any): Promise<any> {
    return categoryService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return categoryService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return categoryService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return categoryService.search(query, ['name', 'description']);
  }

  static async getBySlug(slug: string): Promise<any | null> {
    return categoryService.getBySlug(slug);
  }

  static async getActive(): Promise<any[]> {
    return categoryService.getActive();
  }
}

// DealerApplication entity
class DealerApplication extends BaseEntity {
  static async list(sortBy?: string, filters?: any): Promise<any[]> {
    return dealerApplicationService.list(sortBy, filters);
  }

  static async findById(id: string): Promise<any | null> {
    return dealerApplicationService.findById(id);
  }

  static async create(itemData: any): Promise<any> {
    return dealerApplicationService.create(itemData);
  }

  static async update(id: string, updates: any): Promise<any> {
    return dealerApplicationService.update(id, updates);
  }

  static async delete(id: string): Promise<any> {
    return dealerApplicationService.delete(id);
  }

  static async search(query: string): Promise<any[]> {
    return dealerApplicationService.search(query, ['business_name', 'contact_person', 'email']);
  }

  static async findByEmail(email: string): Promise<any | null> {
    return dealerApplicationService.findByEmail(email);
  }

  static async findByStatus(status: string): Promise<any[]> {
    return dealerApplicationService.findByStatus(status);
  }

  static async findByBusinessType(businessType: string): Promise<any[]> {
    return dealerApplicationService.findByBusinessType(businessType);
  }

  static async approve(id: string): Promise<any> {
    return dealerApplicationService.approve(id);
  }

  static async reject(id: string): Promise<any> {
    return dealerApplicationService.reject(id);
  }
}

// PageVisit entity (for analytics)
class PageVisit extends BaseEntity {
  static async list(sortBy?: string, limit?: number): Promise<any[]> {
    try {
      const visits = await pageVisitService.list(sortBy);
      return limit ? visits.slice(0, limit) : visits;
    } catch (error) {
      console.error('Error fetching page visits:', error);
      // Return empty array on error to prevent breaking the UI
      return [];
    }
  }

  static async create(itemData: any): Promise<any> {
    try {
      return await pageVisitService.trackVisit(itemData);
    } catch (error) {
      console.error('Error tracking page visit:', error);
      // Don't throw error for analytics - just log it
      return null;
    }
  }
}

// SiteSettings entity (for dynamic site configuration)
class SiteSettings extends BaseEntity {
  static async list(): Promise<any[]> {
    try {
      const settings = await siteSettingsService.getSettings();
      return [settings]; // Return as array to match expected interface
    } catch (error) {
      console.error('Error fetching site settings:', error);
      // Return default settings on error
      return [{
        id: 1,
        company_name: 'Jeen Mata Impex',
        tagline: 'Premium Import Solutions',
        contact_email: 'jeenmataimpex8@gmail.com',
        contact_phone: '+977-1-XXXXXXX',
        contact_address: 'Kathmandu, Nepal',
        created_date: new Date().toISOString()
      }];
    }
  }

  static async update(id: string, updates: any): Promise<any> {
    try {
      return await siteSettingsService.update(id, updates);
    } catch (error) {
      console.error('Error updating site settings:', error);
      throw error;
    }
  }
}

// Export all entities
export { BaseEntity };

// Named exports for direct import
export { Product, Order, Inquiry, Shipment, User, Brand, Category, DealerApplication, PageVisit, SiteSettings };

// Default export for backward compatibility
export default {
  Product,
  Order,
  Inquiry,
  Shipment,
  User,
  Brand,
  Category,
  DealerApplication,
  PageVisit,
  SiteSettings
};
