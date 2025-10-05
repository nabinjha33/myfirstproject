"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Product } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ArrowLeft, 
  Package, 
  Star, 
  Share2, 
  Download,
  ShoppingCart,
  Info
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// TypeScript interfaces
interface ProductVariant {
  id: string;
  name: string;
  size?: string;
  packaging?: string;
  price_npr?: number;
  price_usd?: number;
  stock_quantity?: number;
  stock_status?: string;
  estimated_price_npr?: number;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string;
  images?: string[];
  variants?: ProductVariant[];
  featured?: boolean;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fetchProduct = async (slug: string) => {
    setIsLoading(true);
    try {
      const foundProduct = await Product.findBySlug(slug);
      setProduct(foundProduct);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string);
    }
  }, [params.slug]);

  // Function to download product details as PDF
  const downloadProductDetails = async (product: ProductData) => {
    try {
      const { generateProductPDF } = await import('@/lib/pdfGenerator');
      await generateProductPDF(product, false); // false = public user (no pricing)
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      const productInfo = `
PRODUCT DETAILS
===============

Name: ${product.name}
Brand: ${product.brand || 'N/A'}
Category: ${product.category || 'N/A'}
Description: ${product.description || 'No description available'}

VARIANTS:
${product.variants?.map((variant, index) => 
  `${index + 1}. Size: ${variant.size || 'N/A'} | Packaging: ${variant.packaging || 'N/A'} | Stock: ${variant.stock_status || 'N/A'}`
).join('\n') || 'No variants available'}

Contact us for pricing and availability.
Website: ${window.location.origin}
Generated on: ${new Date().toLocaleDateString()}
      `;
      
      const blob = new Blob([productInfo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="h-96 bg-gray-200 rounded-xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Product not found</h2>
          <p className="text-gray-600 mb-4">The product you're looking for doesn't exist.</p>
          <Link href="/products">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Products
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [null];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 md:mb-8 overflow-x-auto">
          <Link href="/" className="hover:text-red-600 whitespace-nowrap">Home</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600 whitespace-nowrap">Products</Link>
          <span>/</span>
          <span className="text-gray-900 truncate">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-8 lg:mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200">
              <div className="aspect-square flex items-center justify-center">
                {images[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Package className="w-24 h-24 text-gray-400" />
                  </div>
                )}
              </div>
              
              {product.featured && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-white">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Featured
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      currentImageIndex === index ? 'border-red-600' : 'border-gray-200'
                    }`}
                  >
                    {image ? (
                      <img src={image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-red-600 text-white">{product.brand}</Badge>
                <span className="text-sm text-gray-600">{product.category}</span>
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              
              {product.description && (
                <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dealer-login" className="flex-1">
                <Button className="w-full bg-red-600 hover:bg-red-700 h-12">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Request Quote as Dealer
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="h-12 w-12"
                  onClick={() => downloadProductDetails(product)}
                  title="Download Product Details"
                >
                  <Download className="w-5 h-5" />
                </Button>
                <Button variant="outline" size="icon" className="h-12 w-12">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Info */}
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Brand</h4>
                    <p className="text-gray-600">{product.brand}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                    <p className="text-gray-600">{product.category}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Variants</h4>
                    <p className="text-gray-600">
                      {product.variants ? product.variants.length : 0} Available
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Origin</h4>
                    <p className="text-gray-600">{(product as any).brand_origin_country || 'Import'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="variants" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="variants">Product Variants</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="variants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Available Variants
                </CardTitle>
              </CardHeader>
              <CardContent>
                {product.variants && product.variants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Size</TableHead>
                          <TableHead>Packaging</TableHead>
                          <TableHead>Stock Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {product.variants.map((variant: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {variant.size || '-'}
                            </TableCell>
                            <TableCell>{variant.packaging || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600' :
                                  variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600' :
                                  variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600' :
                                  'text-blue-600 border-blue-600'
                                }
                              >
                                {variant.stock_status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No variant information available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="specifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">General Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Brand:</span>
                        <span className="font-medium">{product.brand}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Origin:</span>
                        <span className="font-medium">{(product as any).brand_origin_country || 'Import'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Availability</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Variants:</span>
                        <span className="font-medium">
                          {product.variants ? product.variants.length : 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Featured:</span>
                        <span className="font-medium">
                          {product.featured ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
        </Tabs>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">
            Interested in this product?
          </h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Join our dealer network to access wholesale pricing and place orders for this and thousands of other premium products.
          </p>
          <Link href="/dealer-login">
            <Button size="lg" className="bg-white text-red-600 hover:bg-red-50 h-12 px-8">
              Request Dealer Access
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
