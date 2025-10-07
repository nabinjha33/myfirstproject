"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAppContext } from '@/contexts/AppContext';
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
  Flag 
} from 'lucide-react';
import { generateBrandTheme, enhanceBrandData } from './BrandThemeGenerator';

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

export default function BrandPageLayout({ brand: originalBrand }: { brand: any }) {
  // Enhance brand data with defaults for new brands
  const brand = enhanceBrandData(originalBrand);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [brandStats, setBrandStats] = useState<any>({});
  const { getText } = useAppContext();

  // Use existing theme or generate new one for new brands
  const theme = brandThemes[brand.name] || generateBrandTheme(brand.name);

  const loadBrandProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      console.log('Loading products for brand:', brand.name);
      
      // Use getWithRelations to get products with brand and category names
      const allProducts = await Product.getWithRelations();
      console.log('All products loaded with relations:', allProducts.length);
      
      // Filter by brand ID or brand name (case-insensitive)
      const brandProducts = allProducts.filter((product: any) => {
        // First try to match by brand_id if available
        if (product.brand_id && brand.id) {
          return product.brand_id === brand.id;
        }
        // Fallback to brand name matching
        const productBrand = product.brand?.toLowerCase();
        const targetBrand = brand.name?.toLowerCase();
        return productBrand === targetBrand;
      });
      
      console.log(`Found ${brandProducts.length} products for brand ${brand.name}`);
      
      setProducts(brandProducts);

      // Calculate brand statistics
      const stats = {
        totalProducts: brandProducts.length,
        featuredProducts: brandProducts.filter((p: any) => p.featured).length,
        categories: new Set(brandProducts.map((p: any) => p.category).filter(Boolean)).size,
        inStock: brandProducts.filter((p: any) =>
          p.variants?.some((v: any) => v.stock_status === 'In Stock')
        ).length
      };
      setBrandStats(stats);

      // Extract unique categories for this brand
      const uniqueCategories = ['All', ...new Set(brandProducts.map((p: any) => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error('Failed to load brand products:', error);
      
      // Check if it's an RLS policy error and provide guidance
      if (error?.message?.includes('policy') || error?.message?.includes('RLS') || error?.message?.includes('permission')) {
        console.error('Database RLS policy error detected. Please run one of these SQL scripts in your Supabase SQL editor:');
        console.error('- For development: database/disable-rls-dev.sql');
        console.error('- For production: database/fix-policies.sql');
      }
      
      // Set empty data but don't crash the UI
      setProducts([]);
      setBrandStats({
        totalProducts: 0,
        featuredProducts: 0,
        categories: 0,
        inStock: 0
      });
      setCategories(['All']);
      
      // Re-throw the error so it's visible in the console
      throw error;
    }
    setIsLoading(false);
  }, [brand.name]);

  const applyFilters = useCallback(() => {
    let filtered = [...products];

    if (searchQuery.trim()) {
      filtered = filtered.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter !== 'All') {
      filtered = filtered.filter((product: any) => product.category === categoryFilter);
    }

    setFilteredProducts(filtered);
  }, [products, searchQuery, categoryFilter]);

  // Group products by category
  const groupProductsByCategory = (products: any[]) => {
    const grouped = products.reduce((acc: any, product: any) => {
      const category = product.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(product);
      return acc;
    }, {});
    
    // Sort categories by product count (descending)
    return Object.entries(grouped)
      .sort(([, a]: any, [, b]: any) => b.length - a.length)
      .reduce((acc: any, [category, products]) => {
        acc[category] = products;
        return acc;
      }, {});
  };

  const groupedProducts = groupProductsByCategory(filteredProducts);
  const categoryCount = Object.keys(groupedProducts).length;
  const totalFilteredProducts = filteredProducts.length;
  const hasActiveFilters = searchQuery.trim() || categoryFilter !== 'All';

  useEffect(() => {
    loadBrandProducts();
  }, [loadBrandProducts]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const ProductCard = ({ product, index }: { product: any, index: number }) => (
    <div
      className="group"
      style={{ animationDelay: `${index * 100}ms` }}>

      <Link
        href={`/products/${product.slug}?from=${brand.name}Brand`}
        className="block h-full">

        <Card className="h-full overflow-hidden hover:shadow-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-105 flex flex-col border-0 shadow-lg bg-white/95 backdrop-blur-sm">
          <div className="relative h-56 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-t ${theme.primary} opacity-0 group-hover:opacity-20 transition-all duration-500 z-10`}></div>
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${theme.secondary}`}>
                <Package className={`w-20 h-20 text-${theme.text} opacity-40`} />
              </div>
            )}
            
            {product.featured && (
              <div className="absolute top-4 right-4 z-20">
                <Badge className={`bg-gradient-to-r ${theme.special || theme.primary} text-white border-0 shadow-lg`}>
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Featured
                </Badge>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
              <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                {brand.name}
              </Badge>
            </div>
          </div>
          
          <CardContent className="p-6 flex-1 flex flex-col bg-white">
            <div className="flex-1">
              <h3 className="text-lg font-bold mb-3 group-hover:text-amber-600 transition-colors leading-tight h-14 line-clamp-2 text-gray-900">
                {product.name}
              </h3>

              {product.variants && product.variants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.variants.slice(0, 3).map((variant: any, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs px-3 py-1 bg-gradient-to-r from-amber-50 to-red-50 text-amber-800 border border-amber-200 rounded-full font-medium">
                      {variant.size || 'Standard'}
                    </span>
                  ))}
                  {product.variants.length > 3 && (
                    <span className="text-xs px-3 py-1 bg-gradient-to-r from-amber-50 to-red-50 text-amber-800 border border-amber-200 rounded-full font-medium">
                      +{product.variants.length - 3} more
                    </span>
                  )}
                </div>
              )}
              
              <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed h-10">
                {product.description || 'Premium quality product with excellent performance and durability.'}
              </p>
              
              {product.variants && product.variants.length > 0 && (
                <div className="mb-4">
                  <Badge variant="outline" className={`
                    ${product.variants[0].stock_status === 'In Stock' ? 'text-green-700 border-green-300 bg-green-50' :
                      product.variants[0].stock_status === 'Low Stock' ? 'text-amber-700 border-amber-300 bg-amber-50' :
                      product.variants[0].stock_status === 'Out of Stock' ? 'text-red-700 border-red-300 bg-red-50' :
                      'text-blue-700 border-blue-300 bg-blue-50'} font-medium
                  `}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {product.variants[0].stock_status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-2">
                    {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} available
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-sm font-medium text-gray-600">{product.category || 'Premium'}</span>
              <div className="flex items-center text-amber-600 group-hover:translate-x-2 transition-all duration-300">
                <span className="text-sm font-semibold">Explore</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle }: { icon: any, title: string, value: number, subtitle: string }) => {
    const getTextColor = () => {
      switch (brand.name) {
        case 'Gorkha': return 'text-amber-800';
        case 'FastDrill': return 'text-blue-800';
        case 'Spider': return 'text-red-800';
        default: return 'text-gray-800';
      }
    };
    
    return (
    <div className={`bg-gradient-to-br ${theme.secondary} p-6 rounded-2xl border border-amber-200 hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTextColor()}`}>{value}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">{subtitle}</div>
        </div>
      </div>
      <h4 className={`font-semibold ${getTextColor()}`}>{title}</h4>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-blue-950">
      <Header />

      {/* Premium Hero Section with Enhanced Brand Information */}
      <section className={`relative overflow-hidden ${theme.gradient} text-white`}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-80 h-80 rounded-full bg-white/5 animate-pulse"></div>
          <div className="absolute top-1/2 -left-20 w-60 h-60 rounded-full bg-white/10 animate-bounce"></div>
          <div className="absolute bottom-0 right-1/4 w-40 h-40 rounded-full bg-white/5"></div>
        </div>
        
        {brand.heroImage && (
          <div className="absolute inset-0">
            <img src={brand.heroImage} alt={brand.name} className="w-full h-full object-cover opacity-20" />
          </div>
        )}
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 lg:gap-6">
                {brand.logo && (
                  <div className="relative flex-shrink-0">
                    <div className={`${brand.name === 'Gorkha' ? 'w-20 h-20 sm:w-28 sm:h-28 rounded-full p-0.5 sm:p-1' : 'w-16 h-16 sm:w-24 sm:h-24 rounded-2xl p-1.5 sm:p-2'} bg-white backdrop-blur-sm shadow-2xl border-4 border-white/30`}>
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                    </div>
                    <div className={`absolute -inset-1 bg-gradient-to-r from-white/30 to-white/50 ${brand.name === 'Gorkha' ? 'rounded-full' : 'rounded-2xl'} blur-sm -z-10`}></div>
                    {brand.name === 'Gorkha' && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-md -z-20"></div>
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl xl:text-7xl font-black mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
                    {brand.name}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-medium text-white/90">{brand.tagline || brand.description}</p>
                </div>
              </div>
              
              {/* Enhanced Brand Information Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 py-3 sm:py-4 lg:py-6">
                {brand.established_year && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-white/20 hover:bg-white/15 transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-300" />
                      <span className="text-xs sm:text-sm font-medium text-white/80">Established</span>
                    </div>
                    <span className="text-lg sm:text-xl font-bold text-white">{brand.established_year}</span>
                  </div>
                )}
                
                {brand.origin_country && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Flag className="w-5 h-5 text-blue-300" />
                      <span className="text-sm font-medium text-white/80">Origin</span>
                    </div>
                    <span className="text-xl font-bold text-white">{brand.origin_country}</span>
                  </div>
                )}
                
                {brand.specialty && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Award className="w-5 h-5 text-green-300" />
                      <span className="text-sm font-medium text-white/80">Specialty</span>
                    </div>
                    <span className="text-lg font-bold text-white">{brand.specialty}</span>
                  </div>
                )}
                
                {/* Quality Badge */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30 col-span-2 md:col-span-3">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-green-300" />
                    <div>
                      <span className="text-sm font-medium text-green-200">Quality Assured</span>
                      <p className="text-xs text-green-100/80">Trusted by professionals across Nepal</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-white/90 font-light">
                {brand.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-3 sm:pt-4">
                <Link href="/dealer-login">
                  <button className="h-14 px-8 border-2 border-white/50 text-white hover:bg-white hover:text-gray-900 hover:border-white backdrop-blur-sm transition-all duration-300 font-semibold rounded-md flex items-center justify-center gap-2" style={{ color: 'white' }}>
                    <ShoppingCart className="w-5 h-5" />
                    {getText('Get Quote', 'कोटेशन प्राप्त गर्नुहोस्')}
                  </button>
                </Link>
              </div>
            </div>
            
            {/* Brand Stats */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 mt-6 lg:mt-0">
              <StatCard
                icon={Package}
                title="Total Products"
                value={brandStats.totalProducts || 0}
                subtitle="Available" />

              <StatCard
                icon={Star}
                title="Featured Items"
                value={brandStats.featuredProducts || 0}
                subtitle="Premium" />

              <StatCard
                icon={CheckCircle}
                title="In Stock"
                value={brandStats.inStock || 0}
                subtitle="Ready" />

              <StatCard
                icon={Factory}
                title="Categories"
                value={brandStats.categories || 0}
                subtitle="Types" />
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              {brand.name} <span className={`text-${theme.accent}`}>Collection</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our premium range of {brand.name} products, engineered for excellence and built to last.
            </p>
          </div>

          {/* Advanced Search and Filters */}
          <div className={`bg-gradient-to-r ${theme.secondary} rounded-xl sm:rounded-2xl shadow-xl border border-${theme.accent}/20 p-4 sm:p-6 lg:p-8 mb-8 sm:mb-10 lg:mb-12`}>
            <div className="flex flex-col sm:flex-row lg:flex-row gap-4 sm:gap-6">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-4 w-5 h-5 text-${theme.text}/50`} />
                <Input
                  type="text"
                  placeholder={`Search ${brand.name} products...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 h-12 border-2 border-${theme.accent}/20 focus:border-${theme.accent} rounded-xl bg-white/80 backdrop-blur-sm`} />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className={`w-full sm:w-48 h-12 border-2 border-${theme.accent}/20 rounded-xl bg-white/80 backdrop-blur-sm`}>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} className="font-medium">
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse h-96">
                  <div className="h-56 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-6 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className={`w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br ${theme.secondary} flex items-center justify-center`}>
                <Package className={`w-12 h-12 text-${theme.accent}`} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Products Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {hasActiveFilters ?
                  'Try adjusting your search criteria or filters' :
                  `No ${brand.name} products are currently available`
                }
              </p>
              {hasActiveFilters && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }}
                  className={`bg-${theme.accent} hover:bg-${theme.accentHover} text-white px-8 py-3 rounded-xl font-semibold`}>
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Summary */}
              {hasActiveFilters && (
                <div className={`bg-gradient-to-r ${theme.secondary} border border-${theme.accent}/20 rounded-lg p-4`}>
                  <div className={`flex items-center gap-2 text-${theme.text}`}>
                    <Package className="w-5 h-5" />
                    <span className="font-medium">
                      Showing {totalFilteredProducts} products in {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
                    </span>
                  </div>
                  {categoryCount < categories.length - 1 && (
                    <p className={`text-sm text-${theme.text}/70 mt-2`}>
                      💡 Tip: Clear filters to see all {categories.length - 1} categories
                    </p>
                  )}
                </div>
              )}

              {/* Category Groups */}
              {Object.entries(groupedProducts).map(([category, categoryProducts]: [string, any], index: number) => (
                <div key={category} className={`space-y-6 ${index > 0 ? 'pt-12 border-t-2 border-gray-100' : ''}`}>
                  <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                        <div className="w-2 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-md"></div>
                        <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                          {category}
                        </span>
                        <Badge variant="outline" className="text-sm bg-white border-red-200 text-red-700">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                        </Badge>
                      </h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                    {categoryProducts.map((product: any, index: number) => (
                      <ProductCard key={product.id} product={product} index={index} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Brand Story Section */}
      {brand.story && (
        <section className={`py-20 lg:py-28 bg-gradient-to-r ${theme.secondary}`}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                The <span className={`text-${theme.accent}`}>{brand.name}</span> Legacy
              </h2>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border border-white/50">
              <p className="text-lg leading-relaxed text-gray-700 font-light">
                {brand.story}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className={`py-20 lg:py-28 ${theme.gradient} text-white relative overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/5 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 rounded-full bg-white/10"></div>
        </div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Ready to Partner with <span className="text-yellow-300">{brand.name}</span>?
          </h2>
          <p className="text-xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
            Join our exclusive dealer network and unlock access to premium {brand.name} products with competitive wholesale pricing, dedicated support, and priority shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button size="lg" className="h-16 px-10 bg-white/90 hover:bg-white text-gray-900 hover:shadow-2xl transition-all duration-300 font-bold text-lg rounded-2xl" asChild>
              <Link href="/dealer-login">
                <Users className="w-6 h-6 mr-3" />
                Become a Dealer
              </Link>
            </Button>
            <Link href="/products">
              <button className="h-16 px-10 border-2 border-white/50 text-white hover:bg-white hover:text-gray-900 hover:border-white backdrop-blur-sm transition-all duration-300 font-bold text-lg rounded-2xl flex items-center justify-center gap-3" style={{ color: 'white' }}>
                <Globe className="w-6 h-6" />
                Explore Catalog
              </button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
