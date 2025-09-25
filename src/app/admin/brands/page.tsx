"use client";

import React, { useState, useEffect } from 'react';
import { Brand } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Package, ArrowUp, ArrowDown } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from '@/components/ui/checkbox';
import ImageUploader from '@/components/admin/ImageUploader';

interface BrandData {
  id?: string;
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

export default function AdminBrands() {
  const [brands, setBrands] = useState<BrandData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandData | null>(null);
  const [formData, setFormData] = useState<BrandData>({
    name: '',
    slug: '',
    description: '',
    logo: '',
    origin_country: '',
    established_year: '',
    specialty: '',
    active: true,
    sort_order: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    setIsLoading(true);
    try {
      const data = await Brand.list('sort_order'); // Fetch brands sorted by sort_order
      setBrands(data);
    } catch (error) {
      console.error('Failed to load brands:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (brand: BrandData | null = null) => {
    if (brand) {
      setEditingBrand(brand);
      setFormData({ ...brand });
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        origin_country: '',
        established_year: '',
        specialty: '',
        active: true,
        sort_order: brands.length
      });
    }
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBrand(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      logo: '',
      origin_country: '',
      established_year: '',
      specialty: '',
      active: true,
      sort_order: 0
    });
  };

  const handleInputChange = (field: keyof BrandData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug from name
    if (field === 'name' && !editingBrand) {
      const slug = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({
        ...prev,
        slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingBrand) {
        await Brand.update(editingBrand.id!, formData);
      } else {
        await Brand.create(formData);
      }
      
      await loadBrands();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save brand:', error);
      alert('Failed to save brand. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (brandId: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) return;

    try {
      await Brand.delete(brandId);
      await loadBrands();
    } catch (error) {
      console.error('Failed to delete brand:', error);
      alert('Failed to delete brand. Please try again.');
    }
  };

  const handleSortOrderChange = async (brandId: string, direction: 'up' | 'down') => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;

    const newSortOrder = direction === 'up' ? brand.sort_order - 1 : brand.sort_order + 1;
    
    try {
      await Brand.update(brandId, { sort_order: newSortOrder });
      await loadBrands();
    } catch (error) {
      console.error('Failed to update sort order:', error);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      logo: imageUrl
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading brands...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Brand Management</h1>
          <p className="text-gray-600">Manage your product brands and their information</p>
        </div>
        <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add New Brand
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Brands ({brands.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      {brand.logo ? (
                        <img 
                          src={brand.logo} 
                          alt={brand.name}
                          className="w-10 h-10 object-contain rounded"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{brand.name}</div>
                        <div className="text-sm text-gray-500">/{brand.slug}</div>
                      </div>
                    </TableCell>
                    <TableCell>{brand.origin_country || 'N/A'}</TableCell>
                    <TableCell>{brand.specialty || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={brand.active ? "default" : "secondary"}>
                        {brand.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{brand.sort_order}</span>
                        <div className="flex flex-col">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSortOrderChange(brand.id!, 'up')}
                            disabled={brand.sort_order === 0}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSortOrderChange(brand.id!, 'down')}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenForm(brand)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(brand.id!)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {brands.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No brands found. Add your first brand to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Brand Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange('slug', e.target.value)}
                  required
                />
              </div>

              <div>
                <Label htmlFor="origin_country">Origin Country</Label>
                <Input
                  id="origin_country"
                  value={formData.origin_country}
                  onChange={(e) => handleInputChange('origin_country', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="established_year">Established Year</Label>
                <Input
                  id="established_year"
                  value={formData.established_year}
                  onChange={(e) => handleInputChange('established_year', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="specialty">Specialty</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => handleInputChange('specialty', e.target.value)}
                placeholder="e.g., Power Tools, Hand Tools, etc."
              />
            </div>

            <div>
              <Label>Brand Logo</Label>
              <ImageUploader
                onImageUpload={handleImageUpload}
                currentImage={formData.logo}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => handleInputChange('active', checked)}
                />
                <Label htmlFor="active">Active Brand</Label>
              </div>

              <div>
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => handleInputChange('sort_order', parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : (editingBrand ? 'Update Brand' : 'Create Brand')}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
