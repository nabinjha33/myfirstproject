// Test script to check if brands and categories are loading properly
import { Brand, Category } from './src/lib/entities/index.js';

async function testDropdownData() {
  try {
    console.log('Testing brand and category data loading...');
    
    // Test brands
    console.log('Loading brands...');
    const brands = await Brand.list();
    console.log('Brands result:', brands);
    console.log('Number of brands:', brands?.length || 0);
    
    // Test categories
    console.log('Loading categories...');
    const categories = await Category.list();
    console.log('Categories result:', categories);
    console.log('Number of categories:', categories?.length || 0);
    
  } catch (error) {
    console.error('Error testing dropdown data:', error);
  }
}

testDropdownData();
