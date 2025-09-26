"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, Brand } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Package, 
  Star, 
  TrendingUp,
  MapPin,
  Award,
  ShoppingBag,
  CheckSquare,
  Zap,
  Shield,
  Thermometer,
  HardHat,
  SunSnow,
  UserCheck,
  Hammer,
  Heart,
  Users,
  Globe
} from "lucide-react";

const iconComponents = {
  CheckSquare, Zap, Shield, Thermometer, HardHat, SunSnow, UserCheck, Hammer, Heart, Users, Globe
};

// Brand page mapping for dedicated brand pages (removed General Imports)
const brandPageMap: { [key: string]: string } = {
  'FastDrill': '/brands/fastdrill',
  'Spider': '/brands/spider', 
  'Gorkha': '/brands/gorkha'
};

export default function Brands() {
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [brandStats, setBrandStats] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBrandData();
  }, []);

  const loadBrandData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading brand data...');
      
      const [allProducts, activeBrands] = await Promise.all([
        Product.list('-created_at'),
        Brand.getActive()
      ]);
      
      console.log('Loaded products:', allProducts.length);
      console.log('Loaded brands:', activeBrands.length);
      console.log('Brands data:', activeBrands);
      console.log('Products data:', allProducts);
      
      setProducts(allProducts);
      setBrands(activeBrands);

      // Calculate statistics for each brand
      const stats: any = {};
      activeBrands.forEach((brand: any) => {
        // Fix: Match by brand_id instead of brand name
        const brandProducts = allProducts.filter((product: any) => product.brand_id === brand.id);
        const featuredCount = brandProducts.filter((product: any) => product.featured).length;
        
        console.log(`Brand ${brand.name} has ${brandProducts.length} products`);
        
        stats[brand.name] = {
          totalProducts: brandProducts.length,
          featuredProducts: featuredCount,
          inStockProducts: brandProducts.filter((product: any) => 
            product.variants?.some((variant: any) => variant.stock_status === 'In Stock')
          ).length
        };
      });
      
      console.log('Brand stats:', stats);
      setBrandStats(stats);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Failed to load brand data:', error);
      console.error('Error details:', error);
      setError(error?.message || 'Failed to load brand data');
    }
    setIsLoading(false);
  };

  const BrandCard = ({ brand, stats, index }: { brand: any, stats: any, index: number }) => {
    // Check if brand has dedicated page
    const dedicatedPage = brandPageMap[brand.name];
    
    return (
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col">
        <div className="relative h-64 overflow-hidden">
          {brand.logo ? (
            <img 
              src={brand.logo} 
              alt={brand.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-red-500 to-amber-500 opacity-80 flex items-center justify-center">
              <Package className="w-24 h-24 text-white" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-6 left-6 text-white">
            <h3 className="text-3xl font-bold mb-2">{brand.name}</h3>
            <p className="text-lg text-white/90">{brand.description}</p>
          </div>
          <div className="absolute top-6 right-6">
            <Badge className="bg-white/20 text-white border-white/30">
              {brand.origin_country || 'Import'}
            </Badge>
          </div>
        </div>
        
        <CardContent className="p-6 flex flex-col flex-1">
          <div className="space-y-4 flex-1">
            {/* Brand Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">Est. {brand.established_year || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">{brand.specialty || 'General'}</span>
              </div>
            </div>

            {/* Statistics */}
            {stats && (
              <div className="grid grid-cols-3 gap-4 py-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
                  <div className="text-xs text-gray-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.inStockProducts}</div>
                  <div className="text-xs text-gray-600">In Stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.featuredProducts}</div>
                  <div className="text-xs text-gray-600">Featured</div>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            {dedicatedPage ? (
              <Link href={dedicatedPage} className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <Award className="w-4 h-4 mr-2" />
                  Explore Brand
                </Button>
              </Link>
            ) : (
              <Link 
                href={`/products?brand=${encodeURIComponent(brand.name)}`}
                className="flex-1"
              >
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  View Products
                </Button>
              </Link>
            )}
            <Button variant="outline" size="icon">
              <Star className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              Our Premium Brands
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Discover quality products from trusted manufacturers across China, India, and Nepal
            </p>
            <div className="flex justify-center items-center gap-8 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>Global Import</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Quality Assured</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>Competitive Pricing</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Grid */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Trusted Manufacturing Partners
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Each brand represents years of partnership and commitment to quality
            </p>
          </div>

          {error ? (
            <div className="text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-red-800">Error Loading Brands</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button 
                  onClick={loadBrandData}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No brands available</h3>
              <p className="text-gray-600">Brands will appear here once they are added through the admin panel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brands.map((brand: any, index: number) => (
                <BrandCard 
                  key={brand.id} 
                  brand={brand} 
                  stats={brandStats[brand.name]}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Our Brand Partners Choose Us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Building lasting relationships through trust, quality, and mutual growth
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Quality Assurance</h3>
              <p className="text-gray-600">
                Rigorous quality control processes ensure only the best products reach our customers
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Market Growth</h3>
              <p className="text-gray-600">
                Supporting brand growth in the Nepali market through strategic partnerships
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-red-50 to-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Brand Excellence</h3>
              <p className="text-gray-600">
                Maintaining brand integrity and reputation through professional service
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-red-600 to-amber-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Explore Our Brands?
          </h2>
          <p className="text-xl mb-8 text-red-100">
            Browse our complete product catalog and discover the perfect tools for your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button size="lg" className="h-12 px-8 bg-white text-red-600 hover:bg-red-50">
                <Package className="w-5 h-5 mr-2" />
                Browse All Products
              </Button>
            </Link>
            <Link href="/dealer/login">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white/10">
                <ArrowRight className="w-5 h-5 mr-2" />
                Become a Dealer
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
