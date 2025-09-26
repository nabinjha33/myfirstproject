"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  Check,
  Eye
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
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState<any>(null);

  const orderCart = useCart('orderCart');

  const applyFilters = useCallback(() => {
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
  }, [products, searchQuery, selectedBrand, selectedCategory]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      console.log('Loading products for dealer catalog...');
      const allProducts = await Product.list('-created_at');
      console.log('Products loaded:', allProducts.length);
      console.log('Products data:', allProducts);
      setProducts(allProducts);
    } catch (error: any) {
      console.error("Failed to load products:", error);
      console.error('Error details:', error?.message || 'Unknown error');
      setProducts([]);
    }
    setIsLoading(false);
  };

  const loadCategories = async () => {
    try {
      console.log('Loading categories for dealer catalog...');
      const activeCategories = await Category.getActive();
      console.log('Categories loaded:', activeCategories.length);
      console.log('Categories data:', activeCategories);
      setCategories(['All', ...activeCategories.map((cat: any) => cat.name)]);
    } catch (error: any) {
      console.error("Failed to load categories:", error);
      console.error('Error details:', error?.message || 'Unknown error');
      setCategories(['All']);
    }
  };

  const showSuccessMessage = (productName: string) => {
    setAddedToCart({ productName, timestamp: Date.now() });
    setTimeout(() => setAddedToCart(null), 3000);
  };

  const handleAddToCart = (product: any, variant: any) => {
    orderCart.addToCart(product, variant, 1);
    showSuccessMessage(product.name);
    setIsVariantDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const ProductCard = ({ product }: { product: any }) => {
    return (
      <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col border border-gray-200">
        <div className="relative h-48 overflow-hidden bg-gray-100 flex-shrink-0">
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

            {product.variants && product.variants.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {product.variants.slice(0, 3).map((variant: any, index: number) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded"
                  >
                    {variant.size || 'Standard'}
                  </span>
                ))}
                {product.variants.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 border border-gray-200 rounded">
                    +{product.variants.length - 3} more
                  </span>
                )}
              </div>
            )}
            
            <div className="flex items-center justify-between mb-3">
              <Badge variant="outline" className="text-xs">{product.category || 'Uncategorized'}</Badge>
              {product.variants?.[0]?.estimated_price_npr && (
                <span className="text-sm font-bold text-red-700">
                  From NPR {Math.min(...product.variants.map((v: any) => v.estimated_price_npr || 0)).toLocaleString()}
                </span>
              )}
            </div>

            <p className="text-gray-500 mb-3 text-xs line-clamp-2">
              {product.description || 'No description available.'}
            </p>

            {product.variants && product.variants.length > 0 && (
              <div className="text-xs text-gray-500 mb-3">
                {product.variants.length} variant{product.variants.length > 1 ? 's' : ''} available
              </div>
            )}
          </div>

          <div className="mt-auto pt-2 flex gap-2">
             <Button
              variant="outline"
              size="sm"
              className="w-full h-8"
              onClick={() => {
                setSelectedProduct(product);
                setIsDetailsDialogOpen(true);
              }}
            >
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
            <Button
              size="sm"
              className="w-full h-8 bg-red-600 hover:bg-red-700"
              onClick={() => {
                setSelectedProduct(product);
                setIsVariantDialogOpen(true);
              }}
            >
              <ShoppingCart className="w-3 h-3 mr-1" />
              Add to Order
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const VariantSelectionDialog = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
    if (!product) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add "{product.name}" to Order Cart</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {product.variants && product.variants.length > 0 ? (
              <div>
                <h4 className="font-semibold mb-3">Select Variant:</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead>Packaging</TableHead>
                      <TableHead>Est. Price (NPR)</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {product.variants.map((variant: any, index: number) => (
                      <TableRow key={variant.id || index}>
                        <TableCell className="font-medium">
                          {variant.size || '-'}
                        </TableCell>
                        <TableCell>{variant.packaging || '-'}</TableCell>
                        <TableCell>
                          {variant.estimated_price_npr ?
                            `NPR ${variant.estimated_price_npr.toLocaleString()}` :
                            'Contact for Price'
                          }
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600 bg-green-50' :
                              variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' :
                              variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600 bg-red-50' :
                              'text-blue-600 border-blue-600 bg-blue-50'
                            }
                          >
                            {variant.stock_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => handleAddToCart(product, variant)}
                          >
                            <ShoppingCart className="w-4 h-4 mr-1" />
                            Add to Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No variants available for this product</p>
                <div className="flex justify-center gap-4 mt-4">
                  <Button
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleAddToCart(product, { id: 'default', size: 'Standard', packaging: 'Default' })}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Order Cart
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };
  
  const ProductDetailsDialog = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

    React.useEffect(() => {
      if (product) {
        setCurrentImageIndex(0);
      }
    }, [product]);

    if (!product) return null;

    const images = product.images && product.images.length > 0 ? product.images : [null];

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{product.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
            {/* Product Images Section */}
            <div className="space-y-4">
              <div className="relative bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
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
                  {images.map((image: any, index: number) => (
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

            {/* Product Information Section */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <Badge className="bg-red-600 text-white">{product.brand}</Badge>
                  <span className="text-sm text-gray-600">{product.category}</span>
                </div>
                
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {product.name}
                </h2>
                
                {product.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Description</h4>
                    <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Info Card */}
              <Card className="bg-gray-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Brand</h4>
                      <p className="text-gray-600">{product.brand}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Category</h4>
                      <p className="text-gray-600">{product.category}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Variants</h4>
                      <p className="text-gray-600">
                        {product.variants ? product.variants.length : 0} Available
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1">Origin</h4>
                      <p className="text-gray-600">China/India Import</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="variants" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="variants">Product Variants</TabsTrigger>
                <TabsTrigger value="specifications">Specifications</TabsTrigger>
              </TabsList>
              
              <TabsContent value="variants" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      Available Variants
                    </h3>
                    {product.variants && product.variants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Size</TableHead>
                              <TableHead>Packaging</TableHead>
                              <TableHead>Estimated Price (NPR)</TableHead>
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
                                  {variant.estimated_price_npr ? 
                                    `NPR ${variant.estimated_price_npr.toLocaleString()}` : 
                                    'Contact for Price'
                                  }
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant="outline"
                                    className={
                                      variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600 bg-green-50' :
                                      variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600 bg-yellow-50' :
                                      variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600 bg-red-50' :
                                      'text-blue-600 border-blue-600 bg-blue-50'
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
                        <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No variant information available</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="space-y-4 mt-6">
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Product Specifications</h3>
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
                            <span className="font-medium">China/India</span>
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
          </div>

          {/* Action Button */}
          <div className="mt-6 flex justify-end">
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                onClose(); // Close details dialog
                setSelectedProduct(product); // Ensure product is set for variant dialog
                setIsVariantDialogOpen(true); // Open variant selection dialog
              }}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Order Cart
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Catalog</h1>
            <p className="text-gray-600">Browse products and add them to your order cart.</p>
          </div>

          <div className="flex gap-4">
            <Link href="/dealer/order-cart">
              <Button className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                <ShoppingCart className="w-4 h-4" />
                Order Cart ({orderCart.getCartItemCount()})
              </Button>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Brand" />
                </SelectTrigger>
                <SelectContent>{brands.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse"><div className="h-48 bg-gray-200"></div><CardContent className="p-6"><div className="h-4 bg-gray-200 rounded mb-2"></div><div className="h-3 bg-gray-200 rounded mb-4"></div><div className="h-8 bg-gray-200 rounded"></div></CardContent></Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}

        <VariantSelectionDialog 
          product={selectedProduct}
          isOpen={isVariantDialogOpen}
          onClose={() => {
            setIsVariantDialogOpen(false);
            setSelectedProduct(null);
          }}
        />

        <ProductDetailsDialog
          product={selectedProduct}
          isOpen={isDetailsDialogOpen}
          onClose={() => {
            setIsDetailsDialogOpen(false);
            setSelectedProduct(null);
          }}
        />
      </div>
    </div>
  );
}
