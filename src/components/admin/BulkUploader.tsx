"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product, Brand, Shipment } from '@/lib/entities';
import { Upload, FileText, CheckCircle, AlertCircle, Download, Eye, Loader2, Image } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EntitySchema {
  [key: string]: {
    type: string;
    required: boolean;
    default?: any;
    enum?: string[];
    description?: string;
  };
}

interface EntitySchemas {
  [key: string]: EntitySchema;
}

const entitySchemas: EntitySchemas = {
  Product: {
    name: { type: 'string', required: true },
    brand: { type: 'string', required: true },
    category: { type: 'string', required: true },
    slug: { type: 'string', required: false },
    description: { type: 'string', required: false },
    featured: { type: 'boolean', required: false, default: false },
    images: { type: 'string', required: false, description: 'Comma-separated image URLs' },
    size: { type: 'string', required: false },
    packaging: { type: 'string', required: false },
    estimated_price_npr: { type: 'number', required: false },
    stock_status: { type: 'string', required: true, enum: ["In Stock", "Low Stock", "Out of Stock", "Pre-Order"] }
  },
  Brand: {
    name: { type: 'string', required: true },
    slug: { type: 'string', required: false },
    description: { type: 'string', required: false },
    logo: { type: 'string', required: false },
    origin_country: { type: 'string', required: false },
    established_year: { type: 'string', required: false },
    specialty: { type: 'string', required: false },
    active: { type: 'boolean', required: false, default: true }
  },
  Shipment: {
    tracking_number: { type: 'string', required: true },
    origin_country: { type: 'string', required: true, enum: ['China', 'India'] },
    status: { type: 'string', required: true, enum: ["Booked", "In Transit", "At Port", "Customs", "In Warehouse"] },
    eta_date: { type: 'string', required: true, description: 'Format: YYYY-MM-DD' },
    product_names: { type: 'string', required: false, description: 'Comma-separated product names' },
    port_name: { type: 'string', required: false }
  }
};

const sampleData: { [key: string]: string } = {
  Product: `name,brand,category,description,size,packaging,estimated_price_npr,stock_status
FastDrill Pro 2000,FastDrill,Power Tools,High-performance drill for professional use,Standard,Box,15000,In Stock
Spider Wrench Set,Spider,Hand Tools,Complete wrench set for all applications,12-piece,Case,8500,In Stock
Gorkha Hammer,Gorkha,Hand Tools,Heavy-duty construction hammer,Medium,Individual,2500,Low Stock`,
  
  Brand: `name,slug,description,origin_country,established_year,specialty,active
FastDrill,fastdrill,Premium power tools manufacturer,Germany,1985,Power Tools,true
Spider,spider,Professional hand tools brand,Japan,1978,Hand Tools,true
Gorkha,gorkha,Traditional Nepalese tool brand,Nepal,1995,Traditional Tools,true`,
  
  Shipment: `tracking_number,origin_country,status,eta_date,product_names,port_name
SHIP001,China,In Transit,2024-02-15,"FastDrill Pro 2000, Spider Wrench Set",Shanghai Port
SHIP002,India,At Port,2024-02-20,"Gorkha Hammer",Mumbai Port
SHIP003,China,Customs,2024-02-10,"FastDrill Accessories",Guangzhou Port`
};

type EntityType = 'Product' | 'Brand' | 'Shipment';

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

interface ProcessedData {
  valid: any[];
  invalid: any[];
  errors: ValidationError[];
}

export default function BulkUploader() {
  const [selectedEntity, setSelectedEntity] = useState<EntityType>('Product');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [extractedData, setExtractedData] = useState<any[]>([]);
  const [processedData, setProcessedData] = useState<ProcessedData>({ valid: [], invalid: [], errors: [] });
  const [uploadStep, setUploadStep] = useState<'upload' | 'preview' | 'results'>('upload');
  const [imageProcessingStatus, setImageProcessingStatus] = useState<string>('');

  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  };

  const parseExcel = async (file: File): Promise<any[]> => {
    // Dynamic import for xlsx to avoid SSR issues
    const XLSX = await import('xlsx');
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the Products sheet
          if (!workbook.SheetNames.includes('Products')) {
            reject(new Error('Products sheet not found in Excel file'));
            return;
          }
          
          const worksheet = workbook.Sheets['Products'];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const processImages = async (imagesPaths: string[], productSlug: string): Promise<string[]> => {
    if (!imagesPaths || imagesPaths.length === 0) {
      return [];
    }

    const processedImages: string[] = [];
    
    for (let i = 0; i < imagesPaths.length; i++) {
      const imagePath = imagesPaths[i].trim();
      
      // Skip if empty
      if (!imagePath) continue;

      // If it's already a web URL, keep it as is
      if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('/')) {
        processedImages.push(imagePath);
        continue;
      }

      // For local files, we'll need to handle them differently in the browser
      // For now, we'll just keep the path and show a warning
      setImageProcessingStatus(`⚠️ Local image paths detected. Please use web URLs or upload images separately.`);
      processedImages.push(imagePath);
    }

    return processedImages;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const isCSV = file.name.endsWith('.csv');
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (!isCSV && !isExcel) {
      alert('Please upload a CSV or Excel file');
      return;
    }

    setUploadedFile(file);
    setIsUploading(true);
    setImageProcessingStatus('');

    try {
      let data: any[];
      
      if (isCSV) {
        const text = await file.text();
        data = parseCSV(text);
      } else {
        // Excel file
        data = await parseExcel(file);
      }
      
      if (data.length === 0) {
        alert('No data found in file. Please check the file format.');
        return;
      }
      
      setExtractedData(data);
      setUploadStep('preview');
    } catch (error) {
      console.error('File upload error:', error);
      alert(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const validateAndProcessData = async () => {
    setIsProcessing(true);
    setImageProcessingStatus('🖼️ Processing images...');
    
    const schema = entitySchemas[selectedEntity];
    const valid: any[] = [];
    const invalid: any[] = [];
    const errors: ValidationError[] = [];

    for (let index = 0; index < extractedData.length; index++) {
      const row = extractedData[index];
      const processedRow = { ...row };
      let isValid = true;
      
      // Clean up the data
      Object.keys(processedRow).forEach(key => {
        if (processedRow[key] === null || processedRow[key] === undefined) {
          processedRow[key] = '';
        } else {
          processedRow[key] = processedRow[key].toString().trim();
        }
      });
      
      // Check required fields
      Object.entries(schema).forEach(([field, fieldConfig]) => {
        if (fieldConfig.required && (!processedRow[field] || processedRow[field].toString().trim() === '')) {
          errors.push({
            row: index + 1,
            field,
            message: `${field} is required`
          });
          isValid = false;
        }
        
        // Type validation
        if (processedRow[field]) {
          if (fieldConfig.type === 'number') {
            const numValue = parseFloat(processedRow[field]);
            if (isNaN(numValue)) {
              errors.push({
                row: index + 1,
                field,
                message: `${field} must be a valid number`
              });
              isValid = false;
            } else {
              processedRow[field] = numValue;
            }
          }
          
          if (fieldConfig.type === 'boolean') {
            const boolValue = processedRow[field].toString().toLowerCase();
            processedRow[field] = boolValue === 'true' || boolValue === '1' || boolValue === 'yes';
          }
          
          // Enum validation
          if (fieldConfig.enum && !fieldConfig.enum.includes(processedRow[field])) {
            errors.push({
              row: index + 1,
              field,
              message: `${field} must be one of: ${fieldConfig.enum.join(', ')}`
            });
            isValid = false;
          }
        }
        
        // Set default values
        if (!processedRow[field] && fieldConfig.default !== undefined) {
          processedRow[field] = fieldConfig.default;
        }
      });
      
      // Generate slug if not provided
      if (selectedEntity !== 'Shipment' && !processedRow.slug && processedRow.name) {
        processedRow.slug = processedRow.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      
      // Process images for products
      if (selectedEntity === 'Product' && processedRow.images) {
        const imagesPaths = processedRow.images.split(',').map((img: string) => img.trim()).filter((img: string) => img);
        processedRow.images = await processImages(imagesPaths, processedRow.slug);
      }
      
      if (isValid) {
        valid.push(processedRow);
      } else {
        invalid.push({ ...processedRow, _errors: errors.filter(e => e.row === index + 1) });
      }
    }

    setProcessedData({ valid, invalid, errors });
    setUploadStep('results');
    setIsProcessing(false);
    setImageProcessingStatus('');
  };

  const saveValidData = async () => {
    if (processedData.valid.length === 0) return;
    
    setIsSaving(true);
    
    try {
      const EntityClass = selectedEntity === 'Product' ? Product : 
                         selectedEntity === 'Brand' ? Brand : Shipment;
      
      const results = await Promise.allSettled(
        processedData.valid.map(item => EntityClass.create(item))
      );
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      alert(`Bulk upload completed!\nSuccessful: ${successful}\nFailed: ${failed}`);
      
      // Reset form
      setUploadedFile(null);
      setExtractedData([]);
      setProcessedData({ valid: [], invalid: [], errors: [] });
      setUploadStep('upload');
      
    } catch (error) {
      console.error('Bulk save error:', error);
      alert('Failed to save data. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = sampleData[selectedEntity];
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEntity}_sample.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setExtractedData([]);
    setProcessedData({ valid: [], invalid: [], errors: [] });
    setUploadStep('upload');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Data Upload
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedEntity} onValueChange={(value) => setSelectedEntity(value as EntityType)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="Product">Products</TabsTrigger>
              <TabsTrigger value="Brand">Brands</TabsTrigger>
              <TabsTrigger value="Shipment">Shipments</TabsTrigger>
            </TabsList>

            {Object.entries(entitySchemas).map(([entityName, schema]) => (
              <TabsContent key={entityName} value={entityName} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Required Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(schema)
                          .filter(([_, config]) => config.required)
                          .map(([field, config]) => (
                            <div key={field} className="flex items-center justify-between">
                              <span className="font-medium">{field}</span>
                              <Badge variant="destructive">Required</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Optional Fields</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(schema)
                          .filter(([_, config]) => !config.required)
                          .map(([field, config]) => (
                            <div key={field} className="flex items-center justify-between">
                              <span className="font-medium">{field}</span>
                              <Badge variant="secondary">Optional</Badge>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2">
                  <Button onClick={downloadSampleCSV} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Sample CSV
                  </Button>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {uploadStep === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select CSV or Excel file</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <div className="text-sm text-gray-600 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4" />
                    <span>Supported formats: CSV, Excel (.xlsx, .xls)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    <span>Images: Use web URLs (http/https) for best results</span>
                  </div>
                </div>
              </div>
              
              {isUploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing file...
                </div>
              )}
              
              {imageProcessingStatus && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{imageProcessingStatus}</AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {uploadStep === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Preview Data ({extractedData.length} rows)
              </span>
              <div className="flex gap-2">
                <Button onClick={resetUpload} variant="outline">
                  Upload Different File
                </Button>
                <Button onClick={validateAndProcessData} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {imageProcessingStatus ? 'Processing Images...' : 'Validating...'}
                    </>
                  ) : (
                    'Validate & Process'
                  )}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {extractedData[0] && Object.keys(extractedData[0]).map(key => (
                      <TableHead key={key}>{key}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {extractedData.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value: any, cellIndex) => (
                        <TableCell key={cellIndex}>{value?.toString() || ''}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {extractedData.length > 10 && (
              <p className="text-sm text-gray-500 mt-2">
                Showing first 10 rows of {extractedData.length} total rows
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {uploadStep === 'results' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Valid Records</p>
                    <p className="text-2xl font-bold text-green-600">{processedData.valid.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">Invalid Records</p>
                    <p className="text-2xl font-bold text-red-600">{processedData.invalid.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Total Errors</p>
                    <p className="text-2xl font-bold text-blue-600">{processedData.errors.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {processedData.errors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Validation Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {processedData.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Row {error.row}, Field "{error.field}": {error.message}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={resetUpload} variant="outline">
              Upload New File
            </Button>
            {processedData.valid.length > 0 && (
              <Button onClick={saveValidData} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  `Save ${processedData.valid.length} Valid Records`
                )}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
