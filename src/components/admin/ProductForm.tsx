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

  useEffect(() => {
    // Load brands and categories
    const loadData = async () => {
      try {
        const [brandsData, categoriesData] = await Promise.all([
          Brand.list(),
          Category.list()
        ]);
        setBrands(brandsData);
        setCategories(categoriesData);
        
        // Set default values if no brands/categories exist
        if (brandsData.length > 0 && !formData.brand_id) {
          setFormData(prev => ({ ...prev, brand_id: brandsData[0].id }));
        }
        if (categoriesData.length > 0 && !formData.category_id) {
          setFormData(prev => ({ ...prev, category_id: categoriesData[0].id }));
        }
      } catch (error) {
        console.error('Failed to load brands/categories:', error);
      }
    };
    
    loadData();
    
    if (product) {
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
    }
  }, [product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = {
        ...formData,
        // Generate slug if empty
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        // Ensure active is set
        active: true
      };
      
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
          <Select value={formData.brand_id} onValueChange={(value) => handleSelectChange('brand_id', value)}>
            <SelectTrigger><SelectValue placeholder="Select a brand" /></SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>
          <Select value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
            <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Images</Label>
        <ImageUploader files={formData.images} setFiles={(images) => setFormData(prev => ({ ...prev, images }))} />
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
