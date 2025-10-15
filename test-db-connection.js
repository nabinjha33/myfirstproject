// Test database connection and check if brands/categories exist
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Environment check:');
console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Supabase Key:', supabaseAnonKey ? 'Set (length: ' + supabaseAnonKey.length + ')' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabaseConnection() {
  try {
    console.log('\n=== Testing Database Connection ===');
    
    // Test basic connection
    console.log('1. Testing basic connection...');
    const { data: testData, error: testError } = await supabase
      .from('brands')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return;
    }
    
    console.log('✅ Basic connection successful');
    
    // Test brands table
    console.log('\n2. Testing brands table...');
    const { data: brands, error: brandsError } = await supabase
      .from('brands')
      .select('*');
    
    if (brandsError) {
      console.error('Brands query failed:', brandsError);
    } else {
      console.log('✅ Brands query successful');
      console.log(`Found ${brands.length} brands:`, brands.map(b => b.name));
    }
    
    // Test categories table
    console.log('\n3. Testing categories table...');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*');
    
    if (categoriesError) {
      console.error('Categories query failed:', categoriesError);
    } else {
      console.log('✅ Categories query successful');
      console.log(`Found ${categories.length} categories:`, categories.map(c => c.name));
    }
    
    // Test products table
    console.log('\n4. Testing products table...');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');
    
    if (productsError) {
      console.error('Products query failed:', productsError);
    } else {
      console.log('✅ Products query successful');
      console.log(`Found ${products.length} products:`, products.map(p => p.name));
    }
    
  } catch (error) {
    console.error('Test failed with exception:', error);
  }
}

testDatabaseConnection();
