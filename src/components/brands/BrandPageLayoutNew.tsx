"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/entities';
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
  Flag 
} from 'lucide-react';

// Brand-specific themes
const brandThemes: any = {
  'FastDrill': {
    primary: 'from-red-700 to-red-900',
    secondary: 'from-red-50 to-gray-100',
    accent: 'red-600',
    accentHover: 'red-700',
    text: 'red-800',
    gradient: 'bg-gradient-to-br from-red-700 via-red-800 to-gray-700'
  },
  'Spider': {
    primary: 'from-[#0a1929] to-[#1a2332]',
    secondary: 'from-slate-50 to-slate-100',
    accent: 'slate-900',
    accentHover: 'slate-800',
    text: 'slate-900',
    gradient: 'bg-gradient-to-br from-[#0a1929] via-[#0f1f30] to-[#1a2332]'
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

export default function BrandPageLayout({ brand }: { brand: any }) {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [brandStats, setBrandStats] = useState<any>({});

  // Default to FastDrill theme if brand not found
  const theme = brandThemes[brand.name] || brandThemes['FastDrill'];

  const loadBrandProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const brandProducts = await Product.filter({ brand: brand.name }, '-created_date');
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
    } catch (error) {
      console.error('Failed to load brand products:', error);
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
              <h3 className={`text-lg font-bold mb-3 group-hover:text-${theme.accent} transition-colors leading-tight h-14 line-clamp-2`}>
                {product.name}
              </h3>

              {product.variants && product.variants.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {product.variants.slice(0, 3).map((variant: any, idx: number) => (
                    <span
                      key={idx}
                      className={`text-xs px-3 py-1 bg-gradient-to-r ${theme.secondary} text-${theme.text} border border-${theme.accent}/20 rounded-full font-medium`}>
                      {variant.size || 'Standard'}
                    </span>
                  ))}
                  {product.variants.length > 3 && (
                    <span className={`text-xs px-3 py-1 bg-gradient-to-r ${theme.secondary} text-${theme.text} border border-${theme.accent}/20 rounded-full font-medium`}>
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
              <div className={`flex items-center text-${theme.accent} group-hover:translate-x-2 transition-all duration-300`}>
                <span className="text-sm font-semibold">Explore</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle }: { icon: any, title: string, value: number, subtitle: string }) => (
    <div className={`bg-gradient-to-br ${theme.secondary} p-6 rounded-2xl border border-${theme.accent}/20 hover:shadow-lg transition-all duration-300 group`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${theme.primary} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold text-${theme.text}`}>{value}</div>
          <div className="text-xs text-gray-600 uppercase tracking-wide">{subtitle}</div>
        </div>
      </div>
      <h4 className={`font-semibold text-${theme.text}`}>{title}</h4>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Breadcrumb */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className={`text-gray-600 hover:text-${theme.accent} transition-colors font-medium`}>
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/brands" className={`text-gray-600 hover:text-${theme.accent} transition-colors font-medium`}>
              Brands
            </Link>
            <span className="text-gray-400">/</span>
            <span className={`text-${theme.text} font-semibold`}>{brand.name}</span>
          </div>
        </div>
      </div>

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
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                {brand.logo && (
                  <div className="relative">
                    <div className={`${brand.name === 'Gorkha' ? 'w-28 h-28 rounded-full' : 'w-24 h-24 rounded-2xl'} bg-white/95 backdrop-blur-sm p-4 shadow-2xl border-4 border-white/30`}>
                      <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                    </div>
                    <div className={`absolute -inset-1 bg-gradient-to-r from-white/30 to-white/50 ${brand.name === 'Gorkha' ? 'rounded-full' : 'rounded-2xl'} blur-sm -z-10`}></div>
                    {brand.name === 'Gorkha' && (
                      <div className="absolute -inset-2 bg-gradient-to-r from-yellow-400/20 to-amber-500/20 rounded-full blur-md -z-20"></div>
                    )}
                  </div>
                )}
                <div>
                  <h1 className="text-5xl md:text-7xl font-black mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent leading-tight">
                    {brand.name}
                  </h1>
                  <p className="text-xl md:text-2xl font-medium text-white/90">{brand.tagline || brand.description}</p>
                </div>
              </div>
              
              {/* Enhanced Brand Information Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 py-6">
                {brand.established_year && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-yellow-300" />
                      <span className="text-sm font-medium text-white/80">Established</span>
                    </div>
                    <span className="text-xl font-bold text-white">{brand.established_year}</span>
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
              
              <p className="text-lg md:text-xl leading-relaxed text-white/90 font-light">
                {brand.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="h-14 px-8 bg-white/90 hover:bg-white text-gray-900 hover:shadow-2xl transition-all duration-300 font-semibold" asChild>
                  <Link href={`/products?brand=${encodeURIComponent(brand.name)}`}>
                    <Package className="w-5 h-5 mr-2" />
                    Explore Products
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-8 border-2 border-white/50 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300 font-semibold" asChild>
                  <Link href="/dealer/login">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Get Quote
                  </Link>
                </Button>
              </div>
            </div>
            
            {/* Brand Stats */}
            <div className="grid grid-cols-2 gap-4 lg:gap-6">
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
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {brand.name} <span className={`text-${theme.accent}`}>Collection</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Discover our premium range of {brand.name} products, engineered for excellence and built to last.
            </p>
          </div>

          {/* Advanced Search and Filters */}
          <div className={`bg-gradient-to-r ${theme.secondary} rounded-2xl shadow-xl border border-${theme.accent}/20 p-8 mb-12`}>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-4 w-5 h-5 text-${theme.text}/50`} />
                <Input
                  type="text"
                  placeholder={`Search ${brand.name} products...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`pl-12 h-12 border-2 border-${theme.accent}/20 focus:border-${theme.accent} rounded-xl bg-white/80 backdrop-blur-sm`} />
              </div>
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className={`w-48 h-12 border-2 border-${theme.accent}/20 rounded-xl bg-white/80 backdrop-blur-sm`}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                {searchQuery || categoryFilter !== 'All' ?
                  'Try adjusting your search criteria or filters' :
                  `No ${brand.name} products are currently available`
                }
              </p>
              {(searchQuery || categoryFilter !== 'All') && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }}
                  className={`bg-${theme.accent} hover:bg-${theme.accentHover} text-white px-8 py-3 rounded-xl font-semibold`}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <p className="text-lg text-gray-600">
                  <span className={`font-bold text-${theme.accent}`}>{filteredProducts.length}</span> 
                  {' '}product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            </>
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
              <Link href="/dealer/login">
                <Users className="w-6 h-6 mr-3" />
                Become a Dealer
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 border-2 border-white/50 text-white hover:bg-white/10 backdrop-blur-sm transition-all duration-300 font-bold text-lg rounded-2xl" asChild>
              <Link href="/products">
                <Globe className="w-6 h-6 mr-3" />
                Explore Catalog
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
