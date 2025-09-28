"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BulkUploader from '@/components/admin/BulkUploader';
import ExcelTemplateGenerator from '@/components/admin/ExcelTemplateGenerator';
import { Package, Award, Upload, Ship } from 'lucide-react';

export default function AdminBulkUpload() {
  const [productUploadCount, setProductUploadCount] = useState(0);
  const [brandUploadCount, setBrandUploadCount] = useState(0);
  const [shipmentUploadCount, setShipmentUploadCount] = useState(0);

  const handleProductUploadSuccess = (count: number) => {
    setProductUploadCount(prev => prev + count);
  };

  const handleBrandUploadSuccess = (count: number) => {
    setBrandUploadCount(prev => prev + count);
  };

  const handleShipmentUploadSuccess = (count: number) => {
    setShipmentUploadCount(prev => prev + count);
  };

  const totalUploads = productUploadCount + brandUploadCount + shipmentUploadCount;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Bulk Data Import</h1>
          <p className="text-gray-600">
            Import products, brands, and other data in bulk using CSV or Excel files.
            Upload images directly to Supabase Storage and reference them in your data files.
          </p>
        </div>

        {totalUploads > 0 && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Session Import Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{productUploadCount}</div>
                  <div className="text-sm text-green-700">Products Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{brandUploadCount}</div>
                  <div className="text-sm text-blue-700">Brands Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{shipmentUploadCount}</div>
                  <div className="text-sm text-purple-700">Shipments Imported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{totalUploads}</div>
                  <div className="text-sm text-gray-600">Total Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="brands" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              Brands
            </TabsTrigger>
            <TabsTrigger value="shipments" className="flex items-center gap-2">
              <Ship className="w-4 h-4" />
              Shipments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-6">
            <div className="space-y-6">
              <ExcelTemplateGenerator entityType="Product" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Import Products
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BulkUploader />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="brands" className="mt-6">
            <div className="space-y-6">
              <ExcelTemplateGenerator entityType="Brand" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5" />
                    Import Brands
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BulkUploader />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="shipments" className="mt-6">
            <div className="space-y-6">
              <ExcelTemplateGenerator entityType="Shipment" />
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ship className="w-5 h-5" />
                    Import Shipments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <BulkUploader />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
