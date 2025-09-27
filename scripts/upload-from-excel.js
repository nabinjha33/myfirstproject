// Script to upload products from Excel file
// Run with: node scripts/upload-from-excel.js your-file.xlsx
// Requires: npm install xlsx

const XLSX = require('xlsx');
const path = require('path');

// Mock Product entity (replace with actual import)
// import { Product } from '@/lib/entities';

// For now, we'll simulate the database operations
const Product = {
  async create(productData) {
    // Simulate API call
    console.log('📦 Creating product:', productData.name);
    
    // Add some random delay to simulate real database operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error(`Simulated error for ${productData.name}`);
    }
    
    return { id: Date.now(), ...productData };
  }
};

function validateProduct(product, rowIndex) {
  const errors = [];
  
  // Required field validation
  if (!product.name || product.name.toString().trim() === '') {
    errors.push(`Row ${rowIndex}: Product name is required`);
  }
  
  if (!product.brand || product.brand.toString().trim() === '') {
    errors.push(`Row ${rowIndex}: Brand is required`);
  }
  
  if (!product.category || product.category.toString().trim() === '') {
    errors.push(`Row ${rowIndex}: Category is required`);
  }
  
  if (!product.stock_status || product.stock_status.toString().trim() === '') {
    errors.push(`Row ${rowIndex}: Stock status is required`);
  }
  
  // Stock status validation
  const validStockStatuses = ['In Stock', 'Low Stock', 'Out of Stock', 'Pre-Order'];
  if (product.stock_status && !validStockStatuses.includes(product.stock_status)) {
    errors.push(`Row ${rowIndex}: Stock status must be one of: ${validStockStatuses.join(', ')}`);
  }
  
  // Price validation
  if (product.estimated_price_npr && isNaN(parseFloat(product.estimated_price_npr))) {
    errors.push(`Row ${rowIndex}: Price must be a valid number`);
  }
  
  // Featured validation
  if (product.featured && !['true', 'false', true, false].includes(product.featured)) {
    errors.push(`Row ${rowIndex}: Featured must be true or false`);
  }
  
  return errors;
}

function processProduct(rawProduct, rowIndex) {
  const product = { ...rawProduct };
  
  // Clean up the data
  Object.keys(product).forEach(key => {
    if (product[key] === null || product[key] === undefined) {
      product[key] = '';
    } else {
      product[key] = product[key].toString().trim();
    }
  });
  
  // Generate slug if not provided
  if (!product.slug && product.name) {
    product.slug = product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Convert price to number
  if (product.estimated_price_npr) {
    product.estimated_price_npr = parseFloat(product.estimated_price_npr);
  }
  
  // Convert featured to boolean
  if (product.featured) {
    product.featured = product.featured.toString().toLowerCase() === 'true';
  } else {
    product.featured = false;
  }
  
  // Process images (convert comma-separated string to array)
  if (product.images) {
    product.images = product.images.split(',').map(img => img.trim()).filter(img => img);
  } else {
    product.images = [];
  }
  
  return product;
}

async function uploadFromExcel(filename) {
  try {
    // Check if file exists
    if (!require('fs').existsSync(filename)) {
      console.log(`❌ File not found: ${filename}`);
      return;
    }
    
    console.log(`📖 Reading Excel file: ${filename}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filename);
    
    // Get the Products sheet
    if (!workbook.SheetNames.includes('Products')) {
      console.log('❌ Products sheet not found in Excel file');
      console.log('Available sheets:', workbook.SheetNames.join(', '));
      return;
    }
    
    const worksheet = workbook.Sheets['Products'];
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    if (rawData.length === 0) {
      console.log('❌ No data found in Products sheet');
      return;
    }
    
    console.log(`📊 Found ${rawData.length} products to process`);
    
    // Validate and process products
    const validProducts = [];
    const invalidProducts = [];
    const allErrors = [];
    
    rawData.forEach((rawProduct, index) => {
      const rowIndex = index + 2; // Excel row number (accounting for header)
      const product = processProduct(rawProduct, rowIndex);
      const errors = validateProduct(product, rowIndex);
      
      if (errors.length === 0) {
        validProducts.push(product);
      } else {
        invalidProducts.push({ ...product, _errors: errors });
        allErrors.push(...errors);
      }
    });
    
    console.log(`✅ Valid products: ${validProducts.length}`);
    console.log(`❌ Invalid products: ${invalidProducts.length}`);
    
    if (allErrors.length > 0) {
      console.log('\n🚨 Validation Errors:');
      allErrors.forEach(error => console.log(`   ${error}`));
    }
    
    if (validProducts.length === 0) {
      console.log('\n❌ No valid products to upload');
      return;
    }
    
    // Ask for confirmation
    console.log(`\n🤔 Do you want to upload ${validProducts.length} valid products?`);
    console.log('Press Ctrl+C to cancel, or wait 5 seconds to continue...');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Upload valid products
    console.log('\n🚀 Starting upload...');
    const results = [];
    const uploadErrors = [];
    
    for (let i = 0; i < validProducts.length; i++) {
      const product = validProducts[i];
      
      try {
        const result = await Product.create(product);
        results.push(result);
        console.log(`✅ ${i + 1}/${validProducts.length}: ${product.name}`);
      } catch (error) {
        uploadErrors.push({ product: product.name, error: error.message });
        console.log(`❌ ${i + 1}/${validProducts.length}: ${product.name} - ${error.message}`);
      }
    }
    
    // Final summary
    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successfully uploaded: ${results.length}`);
    console.log(`❌ Failed uploads: ${uploadErrors.length}`);
    console.log(`⚠️  Invalid products skipped: ${invalidProducts.length}`);
    
    if (uploadErrors.length > 0) {
      console.log('\n🚨 Upload Errors:');
      uploadErrors.forEach(error => {
        console.log(`   ${error.product}: ${error.error}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error processing Excel file:', error.message);
  }
}

// Main execution
const filename = process.argv[2];

if (!filename) {
  console.log('❌ Please provide Excel filename');
  console.log('Usage: node scripts/upload-from-excel.js your-file.xlsx');
  process.exit(1);
}

// Check if xlsx package is installed
try {
  require('xlsx');
  uploadFromExcel(filename);
} catch (error) {
  console.log('❌ xlsx package not found. Please install it first:');
  console.log('npm install xlsx');
}
