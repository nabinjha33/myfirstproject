"use client";

import React, { useState, useEffect } from 'react';
import { Product, Brand, Category } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploader from './ImageUploader';
import VariantManager from './VariantManager';

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  brand_id: string;
  category_id: string;
  images: string[];
  variants: any[];
  featured: boolean;
}

interface ProductFormProps {
  product?: any;
  onSubmitSuccess: () => void;
}

export default function ProductForm({ product, onSubmitSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    slug: '',
    description: '',
    brand_id: '',
    category_id: '',
    images: [],
    variants: [],
    featured: false,
  });
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Load brands and categories on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading brands and categories...');
        const [brandsData, categoriesData] = await Promise.all([
          Brand.list(),
          Category.list()
        ]);
        console.log('Brands loaded:', brandsData);
        console.log('Categories loaded:', categoriesData);
        setBrands(brandsData || []);
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Failed to load brands/categories:', error);
        console.error('Error details:', error.message);
        // Set empty arrays as fallback
        setBrands([]);
        setCategories([]);
        
        // Show user-friendly error
        alert('Failed to load brands and categories. Please check your database connection and ensure the tables are properly set up.');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, []);

  // Set form data when product changes or when brands/categories are loaded
  useEffect(() => {
    if (product) {
      console.log('Setting form data for product:', product);
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        brand_id: product.brand_id || '',
        category_id: product.category_id || '',
        images: product.images || [],
        variants: product.variants || [],
        featured: product.featured || false,
      });
    } else {
      // Reset form for new product and set defaults
      setFormData({
        name: '',
        slug: '',
        description: '',
        brand_id: brands.length > 0 ? brands[0].id : '',
        category_id: categories.length > 0 ? categories[0].id : '',
        images: [],
        variants: [],
        featured: false,
      });
    }
  }, [product, brands, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    
    // Auto-generate slug from name if slug field is empty
    if (id === 'name' && !formData.slug) {
      const autoSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        alert('Product name is required');
        return;
      }
      if (!formData.brand_id) {
        alert('Please select a brand');
        return;
      }
      if (!formData.category_id) {
        alert('Please select a category');
        return;
      }

      const dataToSave = {
        ...formData,
        // Generate slug if empty
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        // Ensure active is set
        active: true
      };
      
      console.log('Saving product data:', dataToSave);
      
      if (product && product.id) {
        await Product.update(product.id, dataToSave);
      } else {
        await Product.create(dataToSave);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error('Failed to save product', error);
      alert('Failed to save product. Please check the console for details.');
    }
    setIsSaving(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" value={formData.slug} onChange={handleChange} placeholder="auto-generated-if-empty" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={formData.description} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="brand_id">Brand</Label>
          <Select value={formData.brand_id} onValueChange={(value) => handleSelectChange('brand_id', value)} disabled={isLoadingData}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingData ? "Loading brands..." : brands.length === 0 ? "No brands available" : "Select a brand"} />
            </SelectTrigger>
            <SelectContent>
              {brands.length > 0 ? (
                brands.map((brand) => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No brands available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)} disabled={isLoadingData}>
            <SelectTrigger>
              <SelectValue placeholder={isLoadingData ? "Loading categories..." : categories.length === 0 ? "No categories available" : "Select a category"} />
            </SelectTrigger>
            <SelectContent>
              {categories.length > 0 ? (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>No categories available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader 
          onImagesUploaded={(urls) => setFormData(prev => ({ ...prev, images: urls }))}
          existingImages={formData.images || []}
          maxFiles={10}
          folder="products"
          title="Product Images"
        />
      </div>

       <div className="space-y-2">
        <Label>Variants</Label>
        <VariantManager variants={formData.variants} setVariants={(variants) => setFormData(prev => ({ ...prev, variants }))} />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked === true }))} />
        <Label htmlFor="featured">Featured Product</Label>
      </div>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}
