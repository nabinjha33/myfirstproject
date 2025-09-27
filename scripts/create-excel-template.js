// Script to create Excel template for product uploads
// Run with: node scripts/create-excel-template.js
// Requires: npm install xlsx

const XLSX = require('xlsx');

// Define the product template structure
const productHeaders = [
  'name',                    // Required - Product name
  'brand',                   // Required - Brand name  
  'category',                // Required - Category name
  'description',             // Optional - Product description
  'slug',                    // Optional - URL slug (auto-generated if empty)
  'size',                    // Optional - Product size/dimensions
  'packaging',               // Optional - How it's packaged
  'estimated_price_npr',     // Optional - Price in NPR
  'stock_status',            // Required - In Stock, Low Stock, Out of Stock, Pre-Order
  'featured',                // Optional - true/false for featured products
  'images'                   // Optional - Comma-separated image URLs
];

// Sample data to help users understand the format
const sampleData = [
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

// Validation rules and instructions
const instructions = [
  ['INSTRUCTIONS FOR FILLING THE TEMPLATE:', ''],
  ['', ''],
  ['REQUIRED FIELDS (must be filled):', ''],
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
  ['', ''],
  ['NOTES:', ''],
  ['• Delete the sample rows before adding your data', ''],
  ['• Each row represents one product', ''],
  ['• Save as .xlsx or .csv format', ''],
  ['• Brands and categories must exist in the system first', ''],
  ['', '']
];

function createExcelTemplate() {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // Create Instructions sheet
  const instructionsWS = XLSX.utils.aoa_to_sheet(instructions);
  XLSX.utils.book_append_sheet(wb, instructionsWS, 'Instructions');

  // Create Products sheet with headers and sample data
  const productsWS = XLSX.utils.json_to_sheet(sampleData);
  XLSX.utils.book_append_sheet(wb, productsWS, 'Products');

  // Create Validation sheet with allowed values
  const validationData = [
    ['Stock Status Options:', 'Featured Options:', 'Sample Brands:', 'Sample Categories:'],
    ['In Stock', 'true', 'FastDrill', 'Power Tools'],
    ['Low Stock', 'false', 'Spider', 'Hand Tools'],
    ['Out of Stock', '', 'Gorkha', 'Construction Tools'],
    ['Pre-Order', '', 'General Imports', 'Safety Equipment']
  ];
  const validationWS = XLSX.utils.aoa_to_sheet(validationData);
  XLSX.utils.book_append_sheet(wb, validationWS, 'Validation');

  // Save the file
  const filename = 'product-upload-template.xlsx';
  XLSX.writeFile(wb, filename);
  
  console.log(`✅ Excel template created: ${filename}`);
  console.log('📋 Template includes:');
  console.log('   • Instructions sheet with detailed guidelines');
  console.log('   • Products sheet with sample data');
  console.log('   • Validation sheet with allowed values');
  console.log('');
  console.log('📝 Next steps:');
  console.log('   1. Open the Excel file');
  console.log('   2. Read the Instructions sheet');
  console.log('   3. Fill the Products sheet with your data');
  console.log('   4. Save and send back for upload');
}

// Check if xlsx package is installed
try {
  require('xlsx');
  createExcelTemplate();
} catch (error) {
  console.log('❌ xlsx package not found. Please install it first:');
  console.log('npm install xlsx');
  console.log('');
  console.log('Then run this script again:');
  console.log('node scripts/create-excel-template.js');
}
