"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Product, Category } from "@/lib/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Package,
  ShoppingCart,
  Star,
  Download,
  Eye,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCart from '@/components/useCart';
import DealerAuthWrapper from '@/components/dealer/DealerAuthWrapper';

const brands = ["All", "FastDrill", "Spider", "Gorkha", "General Imports"];

export default function DealerCatalog() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState<any>(null);
  const [selectedVariants, setSelectedVariants] = useState<{[key: string]: number}>({});

  const orderCart = useCart('orderCart');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, selectedBrand, selectedCategory]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [allProducts, activeCategories] = await Promise.all([
        Product.list('-created_at'),
        Category.getActive()
      ]);
      
      setProducts(allProducts);
      setCategories(['All', ...activeCategories.map((cat: any) => cat.name)]);
    } catch (error) {
      console.error("Failed to load data:", error);
      setProducts([]);
      setCategories(['All']);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...products];
    if (searchQuery.trim()) {
      filtered = filtered.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedBrand !== "All") {
      filtered = filtered.filter((p: any) => p.brand === selectedBrand);
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p: any) => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  };

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
  const hasActiveFilters = searchQuery.trim() || selectedBrand !== 'All' || selectedCategory !== 'All';

  const showSuccessMessage = (productName: string) => {
    setAddedToCart({ productName, timestamp: Date.now() });
    setTimeout(() => setAddedToCart(null), 3000);
  };

  const handleAddToCart = (product: any, variant?: any) => {
    const selectedVariant = variant || product.variants?.[0] || { id: 'default', size: 'Standard', packaging: 'Default' };
    orderCart.addToCart(product, selectedVariant, 1);
    showSuccessMessage(product.name);
    console.log('Added to cart:', product.name, selectedVariant);
  };

  const handleVariantSelection = (product: any, variant: any) => {
    handleAddToCart(product, variant);
    setIsVariantDialogOpen(false);
  };

  const updateVariantQuantity = (variantId: string, quantity: number) => {
    setSelectedVariants(prev => {
      if (quantity <= 0) {
        const newVariants = { ...prev };
        delete newVariants[variantId];
        return newVariants;
      }
      return { ...prev, [variantId]: quantity };
    });
  };

  const addSelectedVariantsToCart = () => {
    if (!selectedProduct) return;
    
    let addedCount = 0;
    Object.entries(selectedVariants).forEach(([variantId, quantity]) => {
      const variant = selectedProduct.variants.find((v: any) => v.id === variantId);
      if (variant && quantity > 0) {
        orderCart.addToCart(selectedProduct, variant, quantity);
        addedCount++;
      }
    });
    
    if (addedCount > 0) {
      showSuccessMessage(`${addedCount} variant${addedCount > 1 ? 's' : ''} of ${selectedProduct.name}`);
    }
    
    setSelectedVariants({});
    setIsVariantDialogOpen(false);
  };

  const openVariantDialog = (product: any) => {
    setSelectedProduct(product);
    setSelectedVariants({});
    setIsVariantDialogOpen(true);
  };

  // Function to download product details as PDF for dealers
  const downloadProductDetails = async (product: any) => {
    try {
      const { generateProductPDF } = await import('@/lib/pdfGenerator');
      await generateProductPDF(product, true); // true = dealer (with pricing)
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text download
      const productInfo = `
DEALER PRODUCT DETAILS
======================

Name: ${product.name}
Brand: ${product.brand || 'N/A'}
Category: ${product.category || 'N/A'}
Description: ${product.description || 'No description available'}

VARIANTS & PRICING:
${product.variants?.map((variant: any, index: number) => 
  `${index + 1}. Size: ${variant.size || 'N/A'}
   Packaging: ${variant.packaging || 'N/A'}
   Est. Price: ${variant.estimated_price_npr ? `NPR ${variant.estimated_price_npr.toLocaleString()} (Estimated)` : 'Contact for Price'}
   Stock: ${variant.stock_status || 'N/A'}`
).join('\n\n') || 'No variants available'}

Dealer Information:
This document contains confidential pricing information.
For internal use only.

Generated on: ${new Date().toLocaleDateString()}
Generated by: Dealer Portal
      `;
      
      const blob = new Blob([productInfo], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dealer_${product.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }
  };

  const ProductCard = ({ product }: { product: any }) => (
    <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="relative h-72 overflow-hidden bg-gray-100">
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
        <Badge className="absolute top-3 left-3 bg-red-600 text-white shadow-md">{product.brand}</Badge>
        {product.featured && <Star className="absolute top-3 right-3 w-5 h-5 text-yellow-400 fill-current drop-shadow" />}
      </div>
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>
          
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs">{product.category || 'Uncategorized'}</Badge>
            {product.variants?.[0]?.estimated_price_npr && (
              <span className="text-sm font-bold text-red-700">
                From NPR {Math.min(...product.variants.map((v: any) => v.estimated_price_npr || 0)).toLocaleString()} <span className="text-xs text-gray-500">(Est.)</span>
              </span>
            )}
          </div>

          <p className="text-gray-500 mb-3 text-xs line-clamp-2">
            {product.description || 'No description available.'}
          </p>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-8 text-xs"
              onClick={() => {
                setSelectedProduct(product);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => downloadProductDetails(product)}
              title="Download Product Details (PDF)"
            >
              <Download className="w-3 h-3" />
            </Button>
          </div>
          <Button
            size="sm"
            className="w-full h-8 bg-red-600 hover:bg-red-700 text-xs"
            onClick={() => {
              if (product.variants && product.variants.length > 1) {
                openVariantDialog(product);
              } else {
                handleAddToCart(product);
              }
            }}
          >
            <ShoppingCart className="w-3 h-3 mr-1" />
            {product.variants && product.variants.length > 1 ? 'Select Variant' : 'Add to Cart'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DealerAuthWrapper>
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Success Toast */}
          {addedToCart && (
            <div className="fixed top-4 right-4 z-50 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg animate-in slide-in-from-right">
              <div className="flex items-center">
                <Check className="w-5 h-5 mr-2" />
                <div>
                  <p className="font-medium">Item Added Successfully!</p>
                  <p className="text-sm">"{addedToCart.productName}" added to Order Cart</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dealer Catalog</h1>
              <p className="text-sm sm:text-base text-gray-600">Browse products and add them to your order cart.</p>
            </div>

            <div className="flex gap-4">
              <Link href="/dealer/order-cart">
                <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-sm sm:text-base">
                  <ShoppingCart className="w-4 h-4" />
                  <span className="hidden sm:inline">Order Cart</span>
                  <span className="sm:hidden">Cart</span>
                  ({orderCart.getCartItemCount()})
                </Button>
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : totalFilteredProducts === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your filters or search terms.</p>
              {hasActiveFilters && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedBrand('All');
                    setSelectedCategory('All');
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Results Summary */}
              {hasActiveFilters && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Package className="w-5 h-5" />
                    <span className="font-medium">
                      Showing {totalFilteredProducts} products in {categoryCount} {categoryCount === 1 ? 'category' : 'categories'}
                    </span>
                  </div>
                  {categoryCount < categories.length - 1 && (
                    <p className="text-sm text-blue-600 mt-2">
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
                      <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-4">
                        <div className="w-2 h-10 bg-gradient-to-b from-red-500 to-red-600 rounded-full shadow-md"></div>
                        <span className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                          {category}
                        </span>
                        <Badge variant="outline" className="text-sm bg-white border-red-200 text-red-700">
                          {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'}
                        </Badge>
                      </h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryProducts.map((product: any) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Product Details Dialog */}
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-4xl w-[95vw] max-h-[85vh] overflow-y-auto sm:max-h-[90vh]">
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedProduct?.name}</DialogTitle>
              </DialogHeader>
              
              {selectedProduct && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 py-2">
                  {/* Product Images Section */}
                  <div className="space-y-4">
                    <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                      <div className="aspect-square sm:aspect-video lg:aspect-square flex items-center justify-center">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          <img
                            src={selectedProduct.images[0]}
                            alt={selectedProduct.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-100">
                            <Package className="w-24 h-24 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {selectedProduct.featured && (
                        <div className="absolute top-4 right-4">
                          <Badge className="bg-yellow-500 text-white">
                            <Star className="w-3 h-3 mr-1 fill-current" />
                            Featured
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product Information Section */}
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-4 mb-4">
                        <Badge className="bg-red-600 text-white">{selectedProduct.brand}</Badge>
                        <span className="text-sm text-gray-600">{selectedProduct.category}</span>
                      </div>
                      
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {selectedProduct.name}
                      </h2>
                      
                      {selectedProduct.description && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                          <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                            {selectedProduct.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Variants Table */}
                    {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Available Variants</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {selectedProduct.variants.slice(0, 6).map((variant: any, index: number) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-gray-50 rounded-lg border">
                              <div className="flex-1">
                                <div className="font-medium text-sm">
                                  {variant.size || 'Standard'} {variant.packaging && `(${variant.packaging})`}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">
                                  {variant.estimated_price_npr ? 
                                    `NPR ${variant.estimated_price_npr.toLocaleString()} (Est.)` : 
                                    'Contact for Price'
                                  }
                                </div>
                              </div>
                              <Badge
                                variant="outline"
                                className={`mt-2 sm:mt-0 text-xs ${
                                  variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600 bg-green-50' :
                                  variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' :
                                  variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600 bg-red-50' :
                                  'text-blue-600 border-blue-600 bg-blue-50'
                                }`}
                              >
                                {variant.stock_status || 'Available'}
                              </Badge>
                            </div>
                          ))}
                          {selectedProduct.variants.length > 6 && (
                            <div className="text-center text-sm text-gray-500 py-2">
                              ... and {selectedProduct.variants.length - 6} more variants
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-center">
                      <Button
                        variant="outline"
                        onClick={() => downloadProductDetails(selectedProduct)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Details
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Variant Selection Dialog */}
          <Dialog open={isVariantDialogOpen} onOpenChange={setIsVariantDialogOpen}>
            <DialogContent className="max-w-3xl w-[95vw] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg">Select Variants - {selectedProduct?.name}</DialogTitle>
                <p className="text-sm text-gray-600 mt-2">
                  Select multiple variants and quantities to add to your cart
                </p>
              </DialogHeader>
              
              {selectedProduct && selectedProduct.variants && (
                <div className="py-4">
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedProduct.variants.map((variant: any, index: number) => (
                      <Card key={variant.id || index} className="border-2 hover:border-red-200 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                                <div className="flex-1">
                                  <span className="font-medium text-gray-900">
                                    {variant.size || 'Standard Size'}
                                  </span>
                                  {variant.packaging && (
                                    <span className="text-sm text-gray-600 ml-2">
                                      ({variant.packaging})
                                    </span>
                                  )}
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${
                                    variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600 bg-green-50' :
                                    variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' :
                                    variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600 bg-red-50' :
                                    'text-blue-600 border-blue-600 bg-blue-50'
                                  }`}
                                >
                                  {variant.stock_status || 'Available'}
                                </Badge>
                              </div>
                              <div className="text-sm font-bold text-red-700">
                                {variant.estimated_price_npr ? 
                                  `NPR ${variant.estimated_price_npr.toLocaleString()} (Est.)` : 
                                  'Contact for Price'
                                }
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateVariantQuantity(variant.id || `variant-${index}`, Math.max(0, (selectedVariants[variant.id || `variant-${index}`] || 0) - 1))}
                                disabled={!selectedVariants[variant.id || `variant-${index}`] || selectedVariants[variant.id || `variant-${index}`] <= 0}
                              >
                                -
                              </Button>
                              <span className="w-12 text-center font-medium">
                                {selectedVariants[variant.id || `variant-${index}`] || 0}
                              </span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateVariantQuantity(variant.id || `variant-${index}`, (selectedVariants[variant.id || `variant-${index}`] || 0) + 1)}
                                disabled={variant.stock_status === 'Out of Stock'}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      {Object.values(selectedVariants).reduce((sum, qty) => sum + qty, 0)} items selected
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedVariants({});
                          setIsVariantDialogOpen(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={addSelectedVariantsToCart}
                        disabled={Object.values(selectedVariants).reduce((sum, qty) => sum + qty, 0) === 0}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart ({Object.values(selectedVariants).reduce((sum, qty) => sum + qty, 0)})
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </DealerAuthWrapper>
  );
}
