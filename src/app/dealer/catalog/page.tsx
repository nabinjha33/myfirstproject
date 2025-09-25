"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Product } from "@/lib/entities";
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
  MessageSquare,
  Star,
  ArrowRight,
  Plus,
  Check
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useCart from '@/components/useCart';

const brands = ["All", "FastDrill", "Spider", "Gorkha", "General Imports"];
const categories = ["All", "Tools", "Equipment", "Hardware", "Industrial"];

export default function DealerCatalog() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isVariantDialogOpen, setIsVariantDialogOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(null); // Track recent additions
  
  const inquiryCart = useCart('inquiryCart');
  const orderCart = useCart('orderCart');

  const applyFilters = useCallback(() => {
    let filtered = [...products];
    if (searchQuery.trim()) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedBrand !== "All") {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }
    if (selectedCategory !== "All") {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedBrand, selectedCategory]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadProducts = async () => {
    setIsLoading(true);
    const allProducts = await Product.list('-created_date');
    setProducts(allProducts);
    setIsLoading(false);
  };

  const showSuccessMessage = (productName: string, cartType: string) => {
    setAddedToCart({ productName, cartType, timestamp: Date.now() });
    setTimeout(() => setAddedToCart(null), 3000); // Clear after 3 seconds
  };

  const handleAddToCart = (product: any, variant: any, cartType: string) => {
    if (cartType === 'inquiry') {
      inquiryCart.addToCart(product, variant, 1);
      showSuccessMessage(product.name, 'Inquiry Cart');
    } else {
      orderCart.addToCart(product, variant, 1);
      showSuccessMessage(product.name, 'Order Cart');
    }
    setIsVariantDialogOpen(false);
    setSelectedProduct(null);
  };
  
  const ProductCard = ({ product }: { product: any }) => (
    <Card className="h-full overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <Link
        href={`/products/${product.slug}`}
        className="group block"
      >
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
            <Badge className="absolute top-4 left-4 bg-red-600">{product.brand}</Badge>
            {product.featured && <Star className="absolute top-4 right-4 w-5 h-5 text-yellow-400 fill-current" />}
        </div>
      </Link>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2 group-hover:text-red-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
          {product.description}
        </p>
        {product.variants?.[0]?.estimated_price_npr && (
          <p className="text-xl font-bold text-red-700 mb-4">
            Starts at NPR {product.variants[0].estimated_price_npr.toLocaleString()}
          </p>
        )}
        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={(e) => {
              e.preventDefault();
              setSelectedProduct(product);
              setIsVariantDialogOpen(true);
            }}
          >
            <ShoppingCart className="w-4 h-4 mr-2" /> Add to Carts
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const VariantSelectionDialog = ({ product, isOpen, onClose }: { product: any, isOpen: boolean, onClose: () => void }) => {
    if (!product) return null;

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add "{product.name}" to Cart</DialogTitle>
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
                              variant.stock_status === 'In Stock' ? 'text-green-600 border-green-600' :
                              variant.stock_status === 'Low Stock' ? 'text-yellow-600 border-yellow-600' :
                              variant.stock_status === 'Out of Stock' ? 'text-red-600 border-red-600' :
                              'text-blue-600 border-blue-600'
                            }
                          >
                            {variant.stock_status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleAddToCart(product, variant, 'inquiry')}
                            >
                              <MessageSquare className="w-4 h-4 mr-1" />
                              Inquiry
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleAddToCart(product, variant, 'order')}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Order
                            </Button>
                          </div>
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
                    variant="outline"
                    onClick={() => handleAddToCart(product, { id: 'default', size: 'Standard', packaging: 'Default' }, 'inquiry')}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Add to Inquiry Cart
                  </Button>
                  <Button 
                    onClick={() => handleAddToCart(product, { id: 'default', size: 'Standard', packaging: 'Default' }, 'order')}
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
                <p className="text-sm">"{addedToCart.productName}" added to {addedToCart.cartType}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dealer Catalog</h1>
            <p className="text-gray-600">Browse products and add them to your inquiry or order cart.</p>
          </div>
          
          <div className="flex gap-4">
            <Link href="/dealer/inquiry-cart">
              <Button variant="outline" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Inquiry Cart ({inquiryCart.getCartItemCount()})
              </Button>
            </Link>
            <Link href="/dealer/order-cart">
              <Button className="flex items-center gap-2">
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
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)}
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
      </div>
    </div>
  );
}
