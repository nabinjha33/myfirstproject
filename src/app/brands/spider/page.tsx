"use client";

import React, { useState, useEffect } from 'react';
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
  SelectValue,
} from '@/components/ui/select';
import {
  Package,
  Search,
  Star,
  ShoppingCart,
  Award,
  Users,
  CheckCircle
} from 'lucide-react';

export default function SpiderBrand() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [brandData, setBrandData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, categoryFilter]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load brand data
      const brands = await Brand.filter({ slug: 'spider' });
      if (brands.length > 0) {
        setBrandData(brands[0]);
      }

      // Load products for this brand
      const allProducts = await Product.list('-created_at');
      const brandProducts = allProducts.filter((product: any) => 
        product.brand === 'Spider'
      );
      setProducts(brandProducts);

      // Extract categories
      const uniqueCategories = ['All', ...new Set(brandProducts.map((p: any) => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Failed to load Spider brand data:', error);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
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
  };

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <Badge className="absolute top-3 left-3 bg-red-600 text-white">Spider</Badge>
        {product.featured && (
          <Star className="absolute top-3 right-3 w-5 h-5 text-yellow-400 fill-current" />
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
        
        {product.variants && product.variants.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {product.variants.slice(0, 3).map((variant: any, index: number) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded"
              >
                {variant.size || 'Standard'}
              </span>
            ))}
            {product.variants.length > 3 && (
              <span className="text-xs px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded">
                +{product.variants.length - 3} more
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="text-xs">{product.category || 'Tools'}</Badge>
          {product.variants?.[0]?.estimated_price_npr && (
            <span className="text-sm font-bold text-red-700">
              From NPR {Math.min(...product.variants.map((v: any) => v.estimated_price_npr || 0)).toLocaleString()}
            </span>
          )}
        </div>

        <p className="text-gray-600 mb-3 text-sm line-clamp-2">
          {product.description || 'High-quality Spider product for professional use.'}
        </p>

        <Link href={`/products/${product.slug}`}>
          <Button className="w-full bg-red-600 hover:bg-red-700">
            <ShoppingCart className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-gray-600 hover:text-red-600 transition-colors">
              Home
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/brands" className="text-gray-600 hover:text-red-600 transition-colors">
              Brands
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-red-600 font-semibold">Spider</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-red-600 to-red-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-6 mb-6">
                {brandData?.logo && (
                  <div className="w-20 h-20 bg-white rounded-xl p-3">
                    <img src={brandData.logo} alt="Spider" className="w-full h-full object-contain" />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-2">Spider</h1>
                  <p className="text-xl text-red-200">Precision Engineering Tools</p>
                </div>
              </div>
              
              <p className="text-lg text-red-100 mb-8 leading-relaxed">
                {brandData?.description || 'Spider specializes in precision engineering tools and equipment designed for accuracy and reliability. Trusted by professionals worldwide for critical applications.'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-white text-red-900 hover:bg-red-50">
                  <Package className="w-5 h-5 mr-2" />
                  Explore Products
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Get Quote
                </Button>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Package className="w-8 h-8 text-red-300 mx-auto mb-3" />
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-red-200 text-sm">Products</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Star className="w-8 h-8 text-yellow-300 mx-auto mb-3" />
                <div className="text-2xl font-bold">{products.filter(p => p.featured).length}</div>
                <div className="text-red-200 text-sm">Featured</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-3" />
                <div className="text-2xl font-bold">{products.filter(p => p.variants?.some((v: any) => v.stock_status === 'In Stock')).length}</div>
                <div className="text-red-200 text-sm">In Stock</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                <Award className="w-8 h-8 text-orange-300 mx-auto mb-3" />
                <div className="text-2xl font-bold">{new Set(products.map(p => p.category)).size}</div>
                <div className="text-red-200 text-sm">Categories</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Spider <span className="text-red-600">Products</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover our complete range of precision Spider tools and engineering equipment.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search Spider products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse h-96">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery || categoryFilter !== 'All' ?
                  'Try adjusting your search criteria or filters' :
                  'No Spider products are currently available'
                }
              </p>
              {(searchQuery || categoryFilter !== 'All') && (
                <Button
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('All');
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  <span className="font-semibold text-red-600">{filteredProducts.length}</span> 
                  {' '}product{filteredProducts.length !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Partner with Spider?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Join our dealer network and get access to wholesale pricing, dedicated support, and priority shipping.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-red-600 hover:bg-red-50">
              <Users className="w-5 h-5 mr-2" />
              Become a Dealer
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Package className="w-5 h-5 mr-2" />
              View All Products
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
