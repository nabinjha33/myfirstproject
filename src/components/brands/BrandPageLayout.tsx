"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product, Brand } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Search,
  Star,
  ArrowRight,
  ShoppingCart,
  Award,
  TrendingUp,
  MapPin,
  Users,
  CheckCircle,
  Globe,
  Factory,
  Shield,
  Zap,
  Calendar,
  Flag,
  Filter,
  Grid3X3,
  List,
  Eye
} from 'lucide-react';

// Brand-specific themes
const brandThemes: any = {
  'FastDrill': {
    primary: 'from-blue-900 to-blue-950',
    secondary: 'from-blue-50 to-cyan-50',
    accent: 'blue-600',
    accentHover: 'blue-700',
    text: 'blue-800',
    gradient: 'bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900'
  },
  'Spider': {
    primary: 'from-red-600 to-red-800',
    secondary: 'from-red-50 to-orange-50',
    accent: 'red-600',
    accentHover: 'red-700',
    text: 'red-800',
    gradient: 'bg-gradient-to-br from-red-600 via-red-700 to-orange-700'
  },
  'Gorkha': {
    primary: 'from-amber-700 to-red-900',
    secondary: 'from-amber-50 to-red-50',
    accent: 'amber-600',
    accentHover: 'amber-700',
    text: 'amber-800',
    gradient: 'bg-gradient-to-br from-[#1D3557] via-[#1D3557] to-[#2A4A72]',
    special: 'from-yellow-400 to-amber-600'
  }
};

// Type definitions
interface ProductData {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  slug?: string;
  images?: string[];
  featured?: boolean;
  variants?: Array<{
    id: string;
    price_npr: number;
    stock_status: string;
  }>;
}

export default function BrandPageLayout({ brandSlug }: { brandSlug: string }) {
  const [brand, setBrand] = useState<any>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [categories, setCategories] = useState(['All']);
  const [brandStats, setBrandStats] = useState<any>({});

  // Default to FastDrill theme if brand not found
  const theme = brandThemes[brand?.name] || brandThemes['FastDrill'];

  useEffect(() => {
    loadBrandData();
  }, [brandSlug]);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter, sortBy]);

  const loadBrandData = async () => {
    setIsLoading(true);
    try {
      // Load brand information
      const brandData = await Brand.getBySlug(brandSlug);
      
      if (!brandData) {
        // If brand not found, create a default brand object
        const defaultBrand = {
          id: brandSlug,
          name: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
          slug: brandSlug,
          description: `Premium ${brandSlug} products and tools`,
          logo: null,
          active: true
        };
        setBrand(defaultBrand);
        setProducts([]);
        setCategories(['All']);
        return;
      }
      
      setBrand(brandData);

      // Load products for this brand
      const productData = await Product.list('name', { brand: brandData.name });
      setProducts(productData || []);

      // Extract unique categories
      const uniqueCategories = ['All', ...new Set((productData || []).map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load brand data:', error);
      // Set a fallback brand to prevent undefined errors
      const fallbackBrand = {
        id: brandSlug,
        name: brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1),
        slug: brandSlug,
        description: `Premium ${brandSlug} products and tools`,
        logo: null,
        active: true
      };
      setBrand(fallbackBrand);
      setProducts([]);
      setCategories(['All']);
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Sort products
    filtered.sort((a: ProductData, b: ProductData) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          const aPrice = a.variants?.[0]?.price_npr || 0;
          const bPrice = b.variants?.[0]?.price_npr || 0;
          return aPrice - bPrice;
        case 'featured':
          return (b as any).featured ? 1 : -1;
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
  };

  const getProductPrice = (product: ProductData) => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => v.price_npr).filter((p: number) => p > 0);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        return minPrice === maxPrice 
          ? `NPR ${minPrice.toLocaleString()}`
          : `NPR ${minPrice.toLocaleString()} - ${maxPrice.toLocaleString()}`;
      }
    }
    return 'Price on request';
  };

  const getStockStatus = (product: ProductData) => {
    if (product.variants && product.variants.length > 0) {
      const statuses = product.variants.map((v: any) => v.stock_status);
      if (statuses.includes('In Stock')) return 'In Stock';
      if (statuses.includes('Low Stock')) return 'Low Stock';
      if (statuses.includes('Pre-Order')) return 'Pre-Order';
      return 'Out of Stock';
    }
    return 'Unknown';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'In Stock': return 'bg-green-100 text-green-800';
      case 'Low Stock': return 'bg-yellow-100 text-yellow-800';
      case 'Pre-Order': return 'bg-blue-100 text-blue-800';
      case 'Out of Stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading brand information...</div>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand Not Found</h1>
        <p className="text-gray-600 mb-6">The brand you're looking for doesn't exist.</p>
        <Link href="/brands">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Brands
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>/</span>
        <Link href="/brands" className="hover:text-blue-600">Brands</Link>
        <span>/</span>
        <span className="text-gray-900">{brand.name}</span>
      </nav>

      {/* Brand Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {brand.logo && (
            <div className="flex-shrink-0">
              <img 
                src={brand.logo} 
                alt={brand.name}
                className="w-24 h-24 object-contain rounded-lg bg-white p-2 shadow-sm"
              />
            </div>
          )}
          
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{brand.name}</h1>
            {brand.description && (
              <p className="text-lg text-gray-600 mb-4">{brand.description}</p>
            )}
            
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {brand.origin_country && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{brand.origin_country}</span>
                </div>
              )}
              {brand.established_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Est. {brand.established_year}</span>
                </div>
              )}
              {brand.specialty && (
                <div className="flex items-center gap-1">
                  <Award className="h-4 w-4" />
                  <span>{brand.specialty}</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{products.length}</div>
            <div className="text-sm text-gray-600">Products Available</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Grid/List */}
      {filteredProducts.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
        }>
          {filteredProducts.map((product) => (
            <Card key={product.id} className={`group hover:shadow-lg transition-shadow ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}>
              <div className={viewMode === 'list' ? 'w-48 flex-shrink-0' : ''}>
                <div className={`relative overflow-hidden ${
                  viewMode === 'list' ? 'h-full' : 'aspect-square'
                } bg-gray-100 rounded-t-lg ${viewMode === 'list' ? 'rounded-l-lg rounded-tr-none' : ''}`}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {product.featured && (
                    <Badge className="absolute top-2 left-2 bg-yellow-500 text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  
                  <Badge className={`absolute top-2 right-2 ${getStockStatusColor(getStockStatus(product))}`}>
                    {getStockStatus(product)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
                <div className={viewMode === 'list' ? 'flex flex-col justify-between h-full py-4' : ''}>
                  <div>
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="text-sm text-gray-500 mb-2">
                      Category: {product.category}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-blue-600">
                        {getProductPrice(product)}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/products/${product.slug}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </Link>
                      <Button size="sm" className="flex-1">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-600">
              {searchTerm || categoryFilter !== 'all' 
                ? 'No products match your search criteria. Try adjusting your filters.'
                : `No products are currently available for ${brand.name}.`
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Back to Brands */}
      <div className="text-center pt-8">
        <Link href="/brands">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to All Brands
          </Button>
        </Link>
      </div>
    </div>
  );
}
