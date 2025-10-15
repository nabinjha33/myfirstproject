"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Product, Brand, Category } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Trash2, Edit, Package, Filter } from 'lucide-react';
import ProductForm from '@/components/admin/ProductForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsData, brandsData, categoriesData] = await Promise.all([
        Product.getWithRelations(),
        Brand.list(),
        Category.list()
      ]);
      setProducts(productsData);
      setBrands(brandsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFormSubmit = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };
  
  const handleDelete = async (productId: string) => {
      if (window.confirm("Are you sure you want to delete this product?")) {
          await Product.delete(productId);
          fetchProducts();
      }
  };
  
  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...products];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((p: any) => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Brand filter
    if (brandFilter !== "all") {
      filtered = filtered.filter((p: any) => p.brand_id === brandFilter);
    }
    
    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((p: any) => p.category_id === categoryFilter);
    }
    
    // Sort
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "brand":
          return (a.brand || '').localeCompare(b.brand || '');
        case "category":
          return (a.category || '').localeCompare(b.category || '');
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });
    
    setFilteredProducts(filtered);
  }, [products, searchTerm, brandFilter, categoryFilter, sortBy]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Products</h1>
          <Button onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>

        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct ? 'Update the product information below.' : 'Fill in the details to create a new product.'}
              </DialogDescription>
            </DialogHeader>
            <ProductForm product={editingProduct} onSubmitSuccess={handleFormSubmit} />
          </DialogContent>
        </Dialog>
        
        <Card>
            <CardContent className="p-4">
                {/* Search and Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input 
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Brands</SelectItem>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="brand">Brand</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="created_at">Newest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {/* Results count */}
                <div className="mb-4 text-sm text-gray-600">
                  Showing {filteredProducts.length} of {products.length} products
                </div>
                
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Variants</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product: any) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                                    {product.images && product.images.length > 0 ? (
                                      <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <Package className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="font-medium">
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    {product.description && (
                                      <div className="text-sm text-gray-500 truncate max-w-xs">
                                        {product.description.substring(0, 60)}...
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{product.brand || 'N/A'}</TableCell>
                                <TableCell>{product.category || 'N/A'}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <span>{product.variants?.length || 0}</span>
                                    {product.variants?.length > 0 && (
                                      <span className="text-xs text-gray-500">variants</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <Badge variant={product.featured ? "default" : "secondary"}>
                                      {product.featured ? 'Featured' : 'Standard'}
                                    </Badge>
                                    <Badge variant={product.active ? "outline" : "destructive"} className="text-xs">
                                      {product.active ? 'Active' : 'Inactive'}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                                          <Edit className="h-4 w-4 mr-2"/>Edit
                                        </Button>
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                                          <Trash2 className="h-4 w-4 mr-2"/>Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
