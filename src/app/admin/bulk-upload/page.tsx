"use client";

import React from 'react';
import BulkUploader from '@/components/admin/BulkUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileSpreadsheet, Database } from 'lucide-react';

export default function AdminBulkUpload() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Bulk Data Upload</h1>
          <p className="text-gray-600">Upload CSV or Excel files to import products, brands, and shipments in bulk</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Supported Formats</h3>
                <p className="text-sm text-gray-600">CSV, Excel (.xlsx, .xls)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Data Validation</h3>
                <p className="text-sm text-gray-600">Automatic validation & error reporting</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Upload className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">Batch Processing</h3>
                <p className="text-sm text-gray-600">Process hundreds of records at once</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">📋 Before You Start</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Download the sample CSV template for your data type</li>
                  <li>• Ensure all required fields are filled</li>
                  <li>• Use the exact column names as shown in the template</li>
                  <li>• Save your file in CSV or Excel format</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">⚡ Processing Steps</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• 1. Select your data type (Products, Brands, or Shipments)</li>
                  <li>• 2. Upload your prepared file</li>
                  <li>• 3. Preview and validate the data</li>
                  <li>• 4. Review any errors and fix them</li>
                  <li>• 5. Save valid records to the database</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Important Notes</h4>
              <ul className="space-y-1 text-sm text-yellow-700">
                <li>• Large files may take several minutes to process</li>
                <li>• Invalid records will be highlighted with specific error messages</li>
                <li>• Only valid records will be saved to the database</li>
                <li>• You can download error reports to fix issues in your source file</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <BulkUploader />
    </div>
  );
}
