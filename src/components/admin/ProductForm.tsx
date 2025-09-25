"use client";

import React, { useState, useEffect } from 'react';
import { Product } from '@/lib/entities';
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
  brand: string;
  category: string;
  images: string[];
  variants: any[];
  featured: boolean;
}

interface ProductFormProps {
  product?: any;
  onSubmitSuccess: () => void;
}

export default function ProductForm({ product, onSubmitSuccess }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    brand: 'FastDrill',
    category: 'Tools',
    images: [],
    variants: [],
    featured: false,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        brand: product.brand || 'FastDrill',
        category: product.category || 'Tools',
        images: product.images || [],
        variants: product.variants || [],
        featured: product.featured || false,
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };
  
  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const dataToSave = { ...formData };
      if (product && product.id) {
        await Product.update(product.id, dataToSave);
      } else {
        await Product.create(dataToSave);
      }
      onSubmitSuccess();
    } catch (error) {
      console.error('Failed to save product', error);
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
          <Label htmlFor="brand">Brand</Label>
          <Select id="brand" value={formData.brand} onValueChange={(value) => handleSelectChange('brand', value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="FastDrill">FastDrill</SelectItem>
              <SelectItem value="Spider">Spider</SelectItem>
              <SelectItem value="Gorkha">Gorkha</SelectItem>
              <SelectItem value="General Imports">General Imports</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={formData.category} onChange={handleChange} />
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
        <Checkbox id="featured" checked={formData.featured} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))} />
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
