// Test database connection
import { supabase } from './supabase'
import { brandService, productService } from './database'

export async function testDatabaseConnection() {
  console.log('Testing database connection...')
  
  try {
    // Test basic Supabase connection
    const { data, error } = await supabase.from('brands').select('count').single()
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('✅ Supabase connection successful')
    
    // Test brand service
    console.log('Testing brand service...')
    const brands = await brandService.list()
    console.log(`✅ Found ${brands.length} brands`)
    
    // Test product service
    console.log('Testing product service...')
    const products = await productService.list()
    console.log(`✅ Found ${products.length} products`)
    
    return true
  } catch (error) {
    console.error('❌ Database connection test failed:', error)
    return false
  }
}

// Test individual table access
export async function testTableAccess() {
  const tables = ['brands', 'products', 'categories', 'users', 'orders', 'shipments']
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (error) {
        console.error(`❌ Error accessing ${table}:`, error)
      } else {
        console.log(`✅ ${table} table accessible (${data?.length || 0} records found)`)
      }
    } catch (error) {
      console.error(`❌ Exception accessing ${table}:`, error)
    }
  }
}
