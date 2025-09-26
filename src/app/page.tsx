"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product, Brand } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ArrowRight,
  Package,
  Truck,
  Shield,
  Clock,
  Star,
  TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Package,
    title: "Premium Quality",
    title_ne: "प्रिमियम गुणस्तर",
    description: "Carefully selected products from trusted manufacturers",
    description_ne: "विश्वसनीय निर्माताहरूबाट सावधानीपूर्वक चयन गरिएका उत्पादनहरू"
  },
  {
    icon: Truck,
    title: "Reliable Import",
    title_ne: "विश्वसनीय आयात",
    description: "Streamlined import process from China and India",
    description_ne: "चीन र भारतबाट सुव्यवस्थित आयात प्रक्रिया"
  },
  {
    icon: Shield,
    title: "Quality Assurance",
    title_ne: "गुणस्तर आश्वासन",
    description: "Rigorous quality checks for all imported products",
    description_ne: "सबै आयातित उत्पादनहरूको लागि कडा गुणस्तर जाँच"
  },
  {
    icon: Clock,
    title: "Timely Delivery",
    title_ne: "समयमा डेलिभरी",
    description: "Efficient logistics and shipment tracking",
    description_ne: "कुशल रसद र ढुवानी ट्र्याकिङ"
  }
];

export default function Home() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Simple getText function for now (can be enhanced later)
  const getText = (english: string, nepali?: string) => english;

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      console.log('Loading home page data...');
      
      // Fetch featured products
      console.log('Fetching featured products...');
      const products = await Product.filter({ featured: true }, '-created_at', 6);
      console.log('Featured products loaded:', products.length);
      
      // Fetch all active brands
      console.log('Fetching active brands...');
      const activeBrands = await Brand.filter({ active: true }, 'name');
      console.log('Active brands loaded:', activeBrands.length);
      
      setFeaturedProducts(products);
      setBrands(activeBrands);
      console.log('Home page data loaded successfully');
    } catch (error) {
      console.error('Failed to load data:', error);
      console.error('Error details:', {
        message: error?.message || 'Unknown error',
        code: error?.code || 'No code',
        details: error?.details || 'No details',
        hint: error?.hint || 'No hint',
        stack: error?.stack || 'No stack trace'
      });
    }
    setIsLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-amber-50 dark:bg-gradient-to-br dark:from-gray-900 dark:via-slate-900 dark:to-blue-950 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-blue-950 to-slate-900 text-white">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/40"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              {getText('Premium Import Solutions', 'प्रिमियम आयात समाधान')}
              <span className="block text-2xl md:text-3xl font-normal mt-2 text-blue-200">
                {getText('From China & India to Nepal', 'चीन र भारतबाट नेपालमा')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              {getText(
                'Discover quality products from trusted brands. FastDrill, Spider, Gorkha, and more.',
                'विश्वसनीय ब्रान्डहरूबाट गुणस्तरीय उत्पादनहरू पत्ता लगाउनुहोस्। FastDrill, Spider, Gorkha, र अन्य धेरै।'
              )}
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={getText("Search products, brands, categories...", "उत्पादनहरू, ब्रान्डहरू, कोटीहरू खोज्नुहोस्...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 text-lg bg-white/95 border-0 shadow-lg dark:bg-slate-800/90 dark:text-slate-100 dark:placeholder-slate-300 dark:border-slate-600" />
                  <Search className="absolute left-4 top-4 w-6 h-6 text-gray-400 dark:text-slate-300" />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-14 px-8 bg-white text-blue-800 hover:bg-blue-50 shadow-lg dark:bg-teal-600 dark:text-white dark:hover:bg-teal-700 dark:border-0">
                  {getText("Search", "खोज्नुहोस्")}
                </Button>
              </div>
            </form>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/products">
                <Button size="lg" variant="secondary" className="h-12 px-8 bg-white/10 text-white border-white/30 hover:bg-white/20 dark:bg-slate-700/60 dark:border-slate-500 dark:hover:bg-slate-600/70 dark:text-blue-100">
                  {getText("Browse Products", "उत्पादनहरू हेर्नुहोस्")}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/dealer/login">
                <Button size="lg" className="h-12 px-8 bg-white text-blue-800 hover:bg-blue-50 dark:bg-cyan-600 dark:hover:bg-cyan-700 dark:text-white dark:border-0">
                  {getText("Become a Dealer", "डिलर बन्नुहोस्")}
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-1/4 left-10 w-20 h-20 bg-white/10 dark:bg-blue-400/10 rounded-full animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-1/4 right-10 w-16 h-16 bg-blue-300/20 dark:bg-teal-400/10 rounded-full animate-bounce hidden lg:block"></div>
      </section>

      {/* Brand Highlights */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4 transition-colors">
              {getText('Our Premium Brands', 'हाम्रा प्रिमियम ब्रान्डहरू')}
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto transition-colors">
              {getText(
                'We partner with the most trusted manufacturers to bring you quality products',
                'हामी तपाईंलाई गुणस्तरीय उत्पादनहरू ल्याउन सबैभन्दा विश्वसनीय निर्माताहरूसँग साझेदारी गर्छौं'
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brands.map((brand: any) => (
              <Link
                key={brand.id}
                href={brand.slug === 'fastdrill' ? '/brands/fastdrill' : brand.slug === 'spider' ? '/brands/spider' : brand.slug === 'gorkha' ? '/brands/gorkha' : '/brands/general-imports'}
                className="group">
                <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2 dark:bg-slate-700/80 dark:border-slate-600 dark:hover:shadow-2xl">
                  <div className="relative h-48 overflow-hidden">
                    {brand.logo ?
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> :
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-500 dark:from-teal-600 dark:to-cyan-600 flex items-center justify-center">
                        <Package className="w-16 h-16 text-white" />
                      </div>
                    }
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{brand.name}</h3>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <p className="text-gray-600 dark:text-slate-300">{brand.description}</p>
                    <div className="flex items-center mt-4 text-blue-600 dark:text-teal-400 group-hover:translate-x-2 transition-transform">
                      <span className="font-medium">{getText("Explore Brand", "ब्रान्ड पत्ता लगाउनुहोस्")}</span>
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 lg:py-24 bg-gray-50 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
                {getText("Featured Products", "विशेष उत्पादनहरू")}
              </h2>
              <p className="text-xl text-gray-600 dark:text-slate-300">
                {getText("Handpicked selections from our premium inventory", "हाम्रो प्रिमियम सूचीबाट विशेष चयनहरू")}
              </p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="hidden md:flex dark:bg-slate-700/70 dark:text-teal-400 dark:border-slate-600 dark:hover:bg-slate-600/70 dark:hover:border-teal-500">
                {getText("View All Products", "सबै उत्पादनहरू हेर्नुहोस्")}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoading ?
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) =>
                <Card key={i} className="animate-pulse dark:bg-slate-700/50 dark:border-slate-600">
                  <div className="h-48 bg-gray-200 dark:bg-slate-600/50"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2 dark:bg-slate-600/50"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4 dark:bg-slate-600/50"></div>
                    <div className="h-8 bg-gray-200 rounded dark:bg-slate-600/50"></div>
                  </CardContent>
                </Card>
              )}
            </div> :
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product: any) =>
                <Link
                  key={product.id}
                  href={`/products/${product.slug}?from=Home`}
                  className="group block h-full">
                  <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 flex flex-col dark:bg-slate-700/70 dark:border-slate-600 dark:hover:shadow-2xl">
                    <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-slate-600/50 flex-shrink-0">
                      {product.images && product.images.length > 0 ?
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> :
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-400 dark:text-slate-400" />
                        </div>
                      }
                      <Badge className="absolute top-4 left-4 bg-red-600 dark:bg-teal-600">
                        {product.brand}
                      </Badge>
                      <div className="absolute top-4 right-4">
                        <Star className="w-5 h-5 text-yellow-400 dark:text-cyan-400 fill-current" />
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-red-600 transition-colors line-clamp-2 min-h-[3.5rem] dark:text-slate-100 dark:group-hover:text-teal-300">
                          {product.name}
                        </h3>

                        {/* Variants Display */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {product.variants.slice(0, 3).map((variant: any, index: number) => (
                              <span
                                key={index}
                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-500 rounded"
                              >
                                {variant.size || 'Standard'}
                              </span>
                            ))}
                            {product.variants.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-600 text-gray-600 dark:text-slate-300 border border-gray-200 dark:border-slate-500 rounded">
                                +{product.variants.length - 3} more
                              </span>
                            )}
                          </div>
                        )}

                        <p className="text-gray-600 dark:text-slate-300 mb-4 line-clamp-3 min-h-[4rem]">
                          {product.description || getText('No description available', 'विवरण उपलब्ध छैन')}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-auto">
                        <Badge variant="outline" className="text-green-600 border-green-600 dark:text-emerald-400 dark:border-emerald-400">
                          {product.variants?.[0]?.stock_status || getText("In Stock", "स्टकमा छ")}
                        </Badge>
                        <div className="flex items-center text-red-600 dark:text-cyan-400">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          <span className="text-sm font-medium">{getText("Popular", "लोकप्रिय")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          }
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">
              {getText("Why Choose Jeen Mata Impex", "किन जीन माता इम्पेक्स छनौट गर्ने")}
            </h2>
            <p className="text-xl text-gray-600 dark:text-slate-300 max-w-2xl mx-auto">
              {getText(
                "Your trusted partner for premium imports with unmatched service quality",
                "अद्वितीय सेवा गुणस्तरका साथ प्रिमियम आयातका लागि तपाईंको विश्वसनीय साझेदार"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) =>
              <div key={index} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-red-50 to-amber-50 dark:from-slate-700/50 dark:to-teal-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-10 h-10 text-red-600 dark:text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3 dark:text-slate-100">{getText(feature.title, feature.title_ne)}</h3>
                <p className="text-gray-600 dark:text-slate-300">{getText(feature.description, feature.description_ne)}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-r from-gray-800 via-blue-950 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {getText("Ready to Start Your Import Journey?", "आयात यात्रा सुरु गर्न तयार हुनुहुन्छ?")}
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            {getText(
              "Join our network of successful dealers and access premium products with competitive pricing.",
              "सफल डिलरहरूको हाम्रो सञ्जालमा सामेल हुनुहोस् र प्रतिस्पर्धी मूल्य निर्धारणका साथ प्रिमियम उत्पादनहरूमा पहुँच प्राप्त गर्नुहोस्।"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dealer/login">
              <Button size="lg" className="h-12 px-8 bg-white text-blue-800 hover:bg-blue-50 dark:bg-teal-600 dark:hover:bg-teal-700 dark:text-white dark:border-0">
                {getText("Request Dealer Access", "डिलर पहुँच अनुरोध गर्नुहोस्")}
              </Button>
            </Link>
            <Link href="/products">
              <Button size="lg" variant="outline" className="h-12 px-8 border-white text-white hover:bg-white/10 dark:border-slate-300 dark:hover:bg-slate-700/50 dark:text-slate-200">
                {getText("Browse Catalog", "सूची हेर्नुहोस्")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>);

}
