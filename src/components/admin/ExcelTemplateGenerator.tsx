"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ExcelTemplateGeneratorProps {
  entityType: 'Product' | 'Brand' | 'Shipment';
}

export default function ExcelTemplateGenerator({ entityType }: ExcelTemplateGeneratorProps) {
  const generateExcelTemplate = async () => {
    try {
      // Dynamic import to avoid SSR issues
      const XLSX = await import('xlsx');
      
      // Define sample data based on entity type
      const sampleData = getSampleData(entityType);
      const instructions = getInstructions(entityType);
      const validationData = getValidationData(entityType);
      
      // Create a new workbook
      const wb = XLSX.utils.book_new();

      // Create Instructions sheet
      const instructionsWS = XLSX.utils.aoa_to_sheet(instructions);
      XLSX.utils.book_append_sheet(wb, instructionsWS, 'Instructions');

      // Create main data sheet
      const dataWS = XLSX.utils.json_to_sheet(sampleData);
      XLSX.utils.book_append_sheet(wb, dataWS, entityType === 'Product' ? 'Products' : entityType === 'Brand' ? 'Brands' : 'Shipments');

      // Create Validation sheet
      const validationWS = XLSX.utils.aoa_to_sheet(validationData);
      XLSX.utils.book_append_sheet(wb, validationWS, 'Validation');

      // Save the file
      const filename = `${entityType.toLowerCase()}-upload-template.xlsx`;
      XLSX.writeFile(wb, filename);
      
    } catch (error) {
      console.error('Error generating Excel template:', error);
      alert('Failed to generate Excel template. Please make sure you have a modern browser.');
    }
  };

  const getSampleData = (type: string) => {
    switch (type) {
      case 'Product':
        return [
          {
            name: 'FastDrill Pro 2000',
            brand: 'FastDrill',
            category: 'Power Tools',
            description: 'High-performance drill for professional use',
            slug: 'fastdrill-pro-2000',
            size: 'Standard',
            packaging: 'Box',
            estimated_price_npr: 15000,
            stock_status: 'In Stock',
            featured: true,
            images: 'https://example.com/image1.jpg,https://example.com/image2.jpg'
          },
          {
            name: 'Spider Wrench Set',
            brand: 'Spider',
            category: 'Hand Tools',
            description: 'Complete wrench set for all applications',
            slug: 'spider-wrench-set',
            size: '12-piece',
            packaging: 'Case',
            estimated_price_npr: 8500,
            stock_status: 'In Stock',
            featured: false,
            images: 'https://example.com/wrench1.jpg'
          },
          {
            name: 'Gorkha Hammer',
            brand: 'Gorkha',
            category: 'Hand Tools',
            description: 'Heavy-duty construction hammer',
            slug: 'gorkha-hammer',
            size: 'Medium',
            packaging: 'Individual',
            estimated_price_npr: 2500,
            stock_status: 'Low Stock',
            featured: false,
            images: ''
          }
        ];
      case 'Brand':
        return [
          {
            name: 'FastDrill',
            slug: 'fastdrill',
            description: 'Premium power tools manufacturer',
            origin_country: 'Germany',
            established_year: '1985',
            specialty: 'Power Tools',
            active: true
          },
          {
            name: 'Spider',
            slug: 'spider',
            description: 'Professional hand tools brand',
            origin_country: 'Japan',
            established_year: '1978',
            specialty: 'Hand Tools',
            active: true
          }
        ];
      case 'Shipment':
        return [
          {
            tracking_number: 'SHIP001',
            origin_country: 'China',
            status: 'In Transit',
            eta_date: '2024-02-15',
            product_names: 'FastDrill Pro 2000, Spider Wrench Set',
            port_name: 'Shanghai Port'
          },
          {
            tracking_number: 'SHIP002',
            origin_country: 'India',
            status: 'At Port',
            eta_date: '2024-02-20',
            product_names: 'Gorkha Hammer',
            port_name: 'Mumbai Port'
          }
        ];
      default:
        return [];
    }
  };

  const getInstructions = (type: string) => {
    const baseInstructions = [
      [`INSTRUCTIONS FOR FILLING THE ${type.toUpperCase()} TEMPLATE:`, ''],
      ['', ''],
      ['REQUIRED FIELDS (must be filled):', ''],
    ];

    const specificInstructions = {
      Product: [
        ['• name - Product name (unique)', ''],
        ['• brand - Brand name (must exist in system)', ''],
        ['• category - Category name (must exist in system)', ''],
        ['• stock_status - Must be one of: In Stock, Low Stock, Out of Stock, Pre-Order', ''],
        ['', ''],
        ['OPTIONAL FIELDS:', ''],
        ['• description - Product description', ''],
        ['• slug - URL-friendly name (auto-generated if empty)', ''],
        ['• size - Product dimensions/size', ''],
        ['• packaging - How the product is packaged', ''],
        ['• estimated_price_npr - Price in Nepali Rupees (numbers only)', ''],
        ['• featured - true or false (default: false)', ''],
        ['• images - Comma-separated image URLs', ''],
      ],
      Brand: [
        ['• name - Brand name (unique)', ''],
        ['', ''],
        ['OPTIONAL FIELDS:', ''],
        ['• slug - URL-friendly name (auto-generated if empty)', ''],
        ['• description - Brand description', ''],
        ['• origin_country - Country of origin', ''],
        ['• established_year - Year established', ''],
        ['• specialty - Brand specialty/focus area', ''],
        ['• active - true or false (default: true)', ''],
      ],
      Shipment: [
        ['• tracking_number - Unique tracking number', ''],
        ['• origin_country - Must be: China or India', ''],
        ['• status - Must be one of: Booked, In Transit, At Port, Customs, In Warehouse', ''],
        ['• eta_date - Expected arrival date (YYYY-MM-DD format)', ''],
        ['', ''],
        ['OPTIONAL FIELDS:', ''],
        ['• product_names - Comma-separated product names', ''],
        ['• port_name - Port name', ''],
      ]
    };

    const endInstructions = [
      ['', ''],
      ['NOTES:', ''],
      ['• Delete the sample rows before adding your data', ''],
      ['• Each row represents one item', ''],
      ['• Save as .xlsx format', ''],
      ['• For products: Brands and categories must exist in the system first', ''],
      ['• For images: Use web URLs (https://...) for best results', ''],
      ['', '']
    ];

    return [
      ...baseInstructions,
      ...specificInstructions[type as keyof typeof specificInstructions],
      ...endInstructions
    ];
  };

  const getValidationData = (type: string) => {
    switch (type) {
      case 'Product':
        return [
          ['Stock Status Options:', 'Featured Options:', 'Sample Brands:', 'Sample Categories:'],
          ['In Stock', 'true', 'FastDrill', 'Power Tools'],
          ['Low Stock', 'false', 'Spider', 'Hand Tools'],
          ['Out of Stock', '', 'Gorkha', 'Construction Tools'],
          ['Pre-Order', '', 'General Imports', 'Safety Equipment']
        ];
      case 'Brand':
        return [
          ['Active Options:', 'Sample Countries:', 'Sample Specialties:', ''],
          ['true', 'Germany', 'Power Tools', ''],
          ['false', 'Japan', 'Hand Tools', ''],
          ['', 'China', 'Construction Tools', ''],
          ['', 'India', 'Safety Equipment', '']
        ];
      case 'Shipment':
        return [
          ['Origin Countries:', 'Status Options:', 'Sample Ports:', ''],
          ['China', 'Booked', 'Shanghai Port', ''],
          ['India', 'In Transit', 'Mumbai Port', ''],
          ['', 'At Port', 'Guangzhou Port', ''],
          ['', 'Customs', 'Chennai Port', ''],
          ['', 'In Warehouse', '', '']
        ];
      default:
        return [];
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5" />
          Excel Template Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Download the Excel template, fill it with your {entityType.toLowerCase()} data, then upload it back using the file uploader above.
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col gap-2">
          <Button onClick={generateExcelTemplate} className="w-full">
            <Download className="w-4 h-4 mr-2" />
            Download {entityType} Excel Template
          </Button>
          
          <div className="text-sm text-gray-600">
            <p><strong>Template includes:</strong></p>
            <ul className="list-disc list-inside ml-2 mt-1">
              <li>Instructions sheet with detailed guidelines</li>
              <li>{entityType}s sheet with sample data</li>
              <li>Validation sheet with allowed values</li>
              {entityType === 'Product' && <li>Image handling instructions</li>}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
