"use client";

import React, { useState, useEffect } from 'react';
import { testDatabaseConnection, testTableAccess } from '@/lib/test-db';
import { Brand, Product } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setLogs([]);
    
    addLog('Starting database connection test...');
    
    try {
      // Test environment variables
      addLog('Checking environment variables...');
      const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
      const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      addLog(`Supabase URL: ${hasUrl ? 'Set' : 'Missing'}`);
      addLog(`Supabase Key: ${hasKey ? 'Set' : 'Missing'}`);
      
      if (!hasUrl || !hasKey) {
        addLog('❌ Missing environment variables!');
        return;
      }
      
      // Test basic connection
      addLog('Testing basic database connection...');
      const connectionResult = await testDatabaseConnection();
      addLog(`Connection test result: ${connectionResult ? '✅ Success' : '❌ Failed'}`);
      
      // Test table access
      addLog('Testing table access...');
      await testTableAccess();
      
      // Test entity methods
      addLog('Testing Brand entity...');
      try {
        const brands = await Brand.list();
        addLog(`✅ Brand.list() returned ${brands.length} brands`);
      } catch (error: any) {
        addLog(`❌ Brand.list() failed: ${error?.message || 'Unknown error'}`);
      }
      
      addLog('Testing Product entity...');
      try {
        const products = await Product.list();
        addLog(`✅ Product.list() returned ${products.length} products`);
      } catch (error: any) {
        addLog(`❌ Product.list() failed: ${error?.message || 'Unknown error'}`);
      }
      
      // Test filter methods
      addLog('Testing Brand.filter() method...');
      try {
        const activeBrands = await Brand.filter({ active: true });
        addLog(`✅ Brand.filter({active: true}) returned ${activeBrands.length} brands`);
      } catch (error: any) {
        addLog(`❌ Brand.filter() failed: ${error?.message || 'Unknown error'}`);
      }
      
      addLog('Testing Product.filter() method...');
      try {
        const featuredProducts = await Product.filter({ featured: true });
        addLog(`✅ Product.filter({featured: true}) returned ${featuredProducts.length} products`);
      } catch (error: any) {
        addLog(`❌ Product.filter() failed: ${error?.message || 'Unknown error'}`);
      }
      
    } catch (error: any) {
      addLog(`❌ Test failed with error: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
      addLog('Test completed.');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Database Connection Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={testConnection} disabled={isLoading}>
              {isLoading ? 'Testing...' : 'Test Database Connection'}
            </Button>
            <Button variant="outline" onClick={clearLogs}>
              Clear Logs
            </Button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
            <div className="font-mono text-sm space-y-1">
              {logs.length === 0 ? (
                <div className="text-gray-500">Click "Test Database Connection" to start debugging...</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className={`${
                    log.includes('❌') ? 'text-red-600' : 
                    log.includes('✅') ? 'text-green-600' : 
                    'text-gray-800'
                  }`}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Environment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 font-mono text-sm">
            <div>Node Environment: {process.env.NODE_ENV}</div>
            <div>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not Set'}</div>
            <div>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not Set'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
