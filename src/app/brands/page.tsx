"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, Brand } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Globe,
  Search,
  Filter
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const iconComponents = {
  CheckSquare, Zap, Shield, Thermometer, HardHat, SunSnow, UserCheck, Hammer, Heart, Users, Globe, Package
};

// Brand page mapping for dedicated brand pages
const brandPageMap: { [key: string]: string } = {
  'FastDrill': 'fastdrill',
  'Spider': 'spider', 
  'Gorkha': 'gorkha'
};

interface BrandData {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string;
  origin_country: string;
  established_year: string;
  specialty: string;
  active: boolean;
  sort_order: number;
}

interface ProductData {
  id: string;
  name: string;
  brand: string;
  category: string;
  featured: boolean;
}

interface BrandStats {
  [brandName: string]: {
    totalProducts: number;
    featuredProducts: number;
    categories: string[];
  };
}

export default function Brands() {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<BrandData[]>([]);
  const [brandStats, setBrandStats] = useState<BrandStats>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    loadBrandData();
  }, []);

  useEffect(() => {
    filterBrands();
  }, [brands, searchTerm, countryFilter, sortBy]);

  const loadBrandData = async () => {
    setIsLoading(true);
    try {
      // Load all products and brands
      const [productData, brandData] = await Promise.all([
        Product.list('name'),
        Brand.list('sort_order')
      ]);

      setProducts(productData);
      setBrands(brandData.filter(brand => brand.active));

      // Calculate brand statistics
      const stats: BrandStats = {};
      brandData.forEach(brand => {
        const brandProducts = productData.filter(p => p.brand === brand.name);
        stats[brand.name] = {
          totalProducts: brandProducts.length,
          featuredProducts: brandProducts.filter(p => p.featured).length,
          categories: [...new Set(brandProducts.map(p => p.category))]
        };
      });
      setBrandStats(stats);
    } catch (error) {
      console.error('Failed to load brand data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterBrands = () => {
    let filtered = [...brands];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(brand =>
        brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (countryFilter !== 'all') {
      filtered = filtered.filter(brand => brand.origin_country === countryFilter);
    }

    // Sort brands
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'products':
          const aProducts = brandStats[a.name]?.totalProducts || 0;
          const bProducts = brandStats[b.name]?.totalProducts || 0;
          return bProducts - aProducts;
        case 'established':
          return (b.established_year || '0').localeCompare(a.established_year || '0');
        case 'sort_order':
          return a.sort_order - b.sort_order;
        default:
          return 0;
      }
    });

    setFilteredBrands(filtered);
  };

  const getUniqueCountries = () => {
    return [...new Set(brands.map(brand => brand.origin_country).filter(Boolean))];
  };

  const getBrandIcon = (brandName: string) => {
    // You can customize this logic based on brand names or categories
    const iconMap: { [key: string]: keyof typeof iconComponents } = {
      'FastDrill': 'Zap',
      'Spider': 'Shield',
      'Gorkha': 'Hammer',
      'General Imports': 'Globe'
    };
    
    const IconComponent = iconComponents[iconMap[brandName]] || iconComponents.Package;
    return IconComponent;
  };

  const getBrandColor = (index: number) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600', 
      'from-purple-500 to-purple-600',
      'from-red-500 to-red-600',
      'from-yellow-500 to-yellow-600',
      'from-indigo-500 to-indigo-600',
      'from-pink-500 to-pink-600',
      'from-teal-500 to-teal-600'
    ];
    return colors[index % colors.length];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading brands...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Brands</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover premium quality products from trusted international brands. 
          We partner with leading manufacturers to bring you the best tools and equipment.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{brands.length}</div>
                <div className="text-sm text-gray-600">Total Brands</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{products.length}</div>
                <div className="text-sm text-gray-600">Total Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {products.filter(p => p.featured).length}
                </div>
                <div className="text-sm text-gray-600">Featured Products</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Globe className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {getUniqueCountries().length}
                </div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search brands by name, specialty, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-48">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {getUniqueCountries().map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="products">Products</SelectItem>
                  <SelectItem value="established">Established</SelectItem>
                  <SelectItem value="sort_order">Featured</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Brands Grid */}
      {filteredBrands.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBrands.map((brand, index) => {
            const BrandIcon = getBrandIcon(brand.name);
            const stats = brandStats[brand.name] || { totalProducts: 0, featuredProducts: 0, categories: [] };
            const hasDedicatedPage = brandPageMap[brand.name];
            
            return (
              <Card key={brand.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-32 bg-gradient-to-br ${getBrandColor(index)} relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <BrandIcon className="h-8 w-8 text-white" />
                  </div>
                  {brand.logo && (
                    <div className="absolute top-4 right-4">
                      <img 
                        src={brand.logo} 
                        alt={brand.name}
                        className="w-12 h-12 object-contain bg-white rounded-lg p-1"
                      />
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold">{brand.name}</h3>
                    {brand.specialty && (
                      <p className="text-sm opacity-90">{brand.specialty}</p>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="space-y-4">
                    {brand.description && (
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {brand.description}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      {brand.origin_country && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{brand.origin_country}</span>
                        </div>
                      )}
                      {brand.established_year && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          <span>Est. {brand.established_year}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">{stats.totalProducts}</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">{stats.featuredProducts}</div>
                        <div className="text-xs text-gray-500">Featured</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-600">{stats.categories.length}</div>
                        <div className="text-xs text-gray-500">Categories</div>
                      </div>
                    </div>

                    {stats.categories.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">Categories:</div>
                        <div className="flex flex-wrap gap-1">
                          {stats.categories.slice(0, 3).map(category => (
                            <Badge key={category} variant="secondary" className="text-xs">
                              {category}
                            </Badge>
                          ))}
                          {stats.categories.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{stats.categories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {hasDedicatedPage ? (
                        <Link href={`/brands/${brand.slug}`} className="flex-1">
                          <Button className="w-full group-hover:bg-blue-600 transition-colors">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Explore Brand
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/products?brand=${encodeURIComponent(brand.name)}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            <Package className="h-4 w-4 mr-2" />
                            View Products
                          </Button>
                        </Link>
                      )}
                      
                      <Link href={`/products?brand=${encodeURIComponent(brand.name)}`}>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Brands Found</h3>
            <p className="text-gray-600">
              {searchTerm || countryFilter !== 'all'
                ? 'No brands match your search criteria. Try adjusting your filters.'
                : 'No brands are currently available.'
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Looking for a Specific Brand or Product?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Can't find what you're looking for? Our team can help you source products from 
            additional brands and manufacturers. Contact us for custom import solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg">
                <Users className="h-5 w-5 mr-2" />
                Contact Our Team
              </Button>
            </Link>
            <Link href="/products">
              <Button variant="outline" size="lg">
                <Package className="h-5 w-5 mr-2" />
                Browse All Products
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
