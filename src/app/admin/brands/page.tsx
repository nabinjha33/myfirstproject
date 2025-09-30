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
import { PlusCircle, Edit, Trash2, Package } from 'lucide-react';
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
  logo: string; // Keep for backward compatibility
  images: string[]; // New field for multiple images (UI only)
  origin_country: string;
  established_year: string;
  specialty: string;
  active: boolean;
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
    logo: '', // Keep for backward compatibility
    images: [], // New field for multiple images (UI only)
    origin_country: '',
    established_year: '',
    specialty: '',
    active: true
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
      // Handle backward compatibility: if brand has logo but no images array, create images array
      const brandData = {
        ...brand,
        images: brand.images || (brand.logo ? [brand.logo] : [])
      };
      setFormData(brandData);
    } else {
      setEditingBrand(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        logo: '',
        images: [],
        origin_country: '',
        established_year: '',
        specialty: '',
        active: true
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
      images: [],
      origin_country: '',
      established_year: '',
      specialty: '',
      active: true
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
    
    // Basic validation
    if (!formData.name.trim()) {
      alert('Brand name is required');
      return;
    }
    
    if (!formData.slug.trim()) {
      alert('Brand slug is required');
      return;
    }
    
    setIsSaving(true);

    try {
      // Prepare data for database (only include fields that exist in schema)
      const dbData = {
        name: formData.name.trim(),
        slug: formData.slug.trim(),
        description: formData.description || null,
        logo: formData.images.length > 0 ? formData.images[0] : (formData.logo || null), // Use first image as logo
        origin_country: formData.origin_country || null,
        established_year: formData.established_year || null,
        specialty: formData.specialty || null,
        active: formData.active
        // Note: sort_order is not in the database schema, so we exclude it
      };
      
      console.log('Saving brand data to database:', dbData);
      
      if (editingBrand) {
        await Brand.update(editingBrand.id!, dbData);
        console.log('Brand updated successfully');
      } else {
        await Brand.create(dbData);
        console.log('Brand created successfully');
      }
      
      await loadBrands();
      handleCloseForm();
    } catch (error) {
      console.error('Failed to save brand:', error);
      
      // Better error handling
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      alert(`Failed to save brand: ${errorMessage}`);
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

  // Note: Sort order functionality removed as it's not in the database schema
  // const handleSortOrderChange = async (brandId: string, direction: 'up' | 'down') => {
  //   // This functionality is disabled until sort_order field is added to database
  // };

  const handleImagesUpload = (imageUrls: string[]) => {
    console.log('Handling brand images upload:', imageUrls);
    console.log('Current form data before update:', formData);
    
    setFormData(prev => {
      const updated = {
        ...prev,
        images: imageUrls,
        logo: imageUrls[0] || '' // Keep first image as logo for backward compatibility
      };
      console.log('Updated form data:', updated);
      return updated;
    });
    
    // Show success feedback
    if (imageUrls.length > 0) {
      console.log(`Brand images successfully updated in form data: ${imageUrls.length} images`);
    }
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
                  <TableHead>Images</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Origin</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {(() => {
                          const images = brand.images || (brand.logo ? [brand.logo] : []);
                          if (images.length === 0) {
                            return (
                              <div className="w-20 h-20 flex items-center justify-center">
                                <Package className="h-10 w-10 text-gray-400" />
                              </div>
                            );
                          }
                          
                          return (
                            <>
                              <img 
                                src={images[0]} 
                                alt={brand.name}
                                className="w-20 h-20 object-contain"
                              />
                              {images.length > 1 && (
                                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center text-xs font-medium text-gray-600 border">
                                  +{images.length - 1}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-xl font-semibold">
              {editingBrand ? 'Edit Brand' : 'Add New Brand'}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto pr-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">Brand Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter brand name"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="slug" className="text-sm font-medium">URL Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => handleInputChange('slug', e.target.value)}
                      placeholder="auto-generated-from-name"
                      required
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">Used in URLs: /brands/{formData.slug}</p>
                  </div>

                  <div>
                    <Label htmlFor="origin_country" className="text-sm font-medium">Origin Country</Label>
                    <Input
                      id="origin_country"
                      value={formData.origin_country}
                      onChange={(e) => handleInputChange('origin_country', e.target.value)}
                      placeholder="e.g., Germany, Japan, USA"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="established_year" className="text-sm font-medium">Established Year</Label>
                    <Input
                      id="established_year"
                      value={formData.established_year}
                      onChange={(e) => handleInputChange('established_year', e.target.value)}
                      placeholder="e.g., 1985"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Brand Details</h3>
                <div>
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Brief description of the brand and its products..."
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="specialty" className="text-sm font-medium">Specialty/Category</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => handleInputChange('specialty', e.target.value)}
                    placeholder="e.g., Power Tools, Hand Tools, Construction Equipment"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Images Upload Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Brand Images</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <ImageUploader
                    onImagesUploaded={(urls) => {
                      console.log('ImageUploader callback called with URLs:', urls);
                      if (urls.length > 0) {
                        handleImagesUpload(urls);
                      } else {
                        console.warn('No URLs received from image upload');
                      }
                    }}
                    existingImages={formData.images || []}
                    maxFiles={5}
                    folder="brands"
                    title="Upload Brand Images"
                  />
                  <p className="text-xs text-gray-600 mt-2">
                    Upload up to 5 brand images. Recommended: Square images (200x200px or larger), PNG/JPG format, max 5MB each
                  </p>
                  
                  {/* Manual URL Input as backup */}
                  <div className="mt-4 space-y-2">
                    <Label htmlFor="images_urls" className="text-sm font-medium">Or enter image URLs manually (one per line):</Label>
                    <div className="space-y-2">
                      <textarea
                        id="images_urls"
                        value={formData.images.join('\n')}
                        onChange={(e) => {
                          const urls = e.target.value.split('\n').filter(url => url.trim());
                          handleImagesUpload(urls);
                        }}
                        placeholder="https://example.com/image1.png&#10;https://example.com/image2.png"
                        className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        rows={3}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          if (formData.images.length > 0) {
                            navigator.clipboard.writeText(formData.images.join('\n'));
                            alert('Image URLs copied to clipboard!');
                          }
                        }}
                        disabled={formData.images.length === 0}
                        className="w-full"
                      >
                        Copy All URLs
                      </Button>
                    </div>
                  </div>
                  
                  {/* Debug: Show current image URLs */}
                  {formData.images.length > 0 && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-700 font-medium">Current Brand Images ({formData.images.length}):</p>
                      <div className="space-y-1 mt-1">
                        {formData.images.map((url, index) => (
                          <p key={index} className="text-xs text-green-600 break-all">
                            {index + 1}. {url}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Settings Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => handleInputChange('active', checked)}
                      />
                      <div>
                        <Label htmlFor="active" className="text-sm font-medium">Active Brand</Label>
                        <p className="text-xs text-gray-500">Show this brand on the website</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">
                      Brands are automatically sorted by creation date. Custom sorting will be available in a future update.
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button type="button" variant="outline" onClick={handleCloseForm} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving} className="min-w-[120px]">
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    editingBrand ? 'Update Brand' : 'Create Brand'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
