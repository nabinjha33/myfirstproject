"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Brand, Product } from "@/lib/entities";

export default function DebugDatabase() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testing...");
  const [brands, setBrands] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      // Test 1: Basic Supabase connection
      setConnectionStatus("Testing Supabase connection...");
      const { data: testData, error: testError } = await supabase
        .from('brands')
        .select('count', { count: 'exact', head: true });

      if (testError) {
        console.error("Supabase connection error:", testError);
        setError(`Supabase Error: ${testError.message}`);
        setConnectionStatus("Failed - Supabase connection error");
        return;
      }

      setConnectionStatus("Supabase connected successfully");

      // Test 2: Try to fetch brands using entity
      try {
        console.log("Testing Brand.list()...");
        const brandsList = await Brand.list();
        console.log("Brands fetched:", brandsList);
        setBrands(brandsList);
      } catch (brandError: any) {
        console.error("Brand.list() error:", brandError);
        setError(`Brand Entity Error: ${brandError.message}`);
      }

      // Test 3: Try to fetch products using entity
      try {
        console.log("Testing Product.list()...");
        const productsList = await Product.list();
        console.log("Products fetched:", productsList);
        setProducts(productsList);
      } catch (productError: any) {
        console.error("Product.list() error:", productError);
        setError(`Product Entity Error: ${productError.message}`);
      }

      // Test 4: Direct Supabase query
      try {
        console.log("Testing direct Supabase query...");
        const { data: directBrands, error: directError } = await supabase
          .from('brands')
          .select('*');
        
        if (directError) {
          console.error("Direct query error:", directError);
          setError(`Direct Query Error: ${directError.message}`);
        } else {
          console.log("Direct brands query result:", directBrands);
        }
      } catch (directQueryError: any) {
        console.error("Direct query exception:", directQueryError);
        setError(`Direct Query Exception: ${directQueryError.message}`);
      }

    } catch (generalError: any) {
      console.error("General error:", generalError);
      setError(`General Error: ${generalError.message}`);
      setConnectionStatus("Failed - General error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Debug Page</h1>
        
        <div className="space-y-6">
          {/* Connection Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
            <p className={`text-lg ${connectionStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {connectionStatus}
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <h2 className="text-xl font-semibold text-red-800 mb-4">Error Details</h2>
              <pre className="text-red-700 whitespace-pre-wrap">{error}</pre>
            </div>
          )}

          {/* Environment Variables */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              <p>
                <strong>NEXT_PUBLIC_SUPABASE_URL:</strong> {' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_URL ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}
                </span>
              </p>
              <p>
                <strong>NEXT_PUBLIC_SUPABASE_ANON_KEY:</strong> {' '}
                <span className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'text-green-600' : 'text-red-600'}>
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}
                </span>
              </p>
            </div>
          </div>

          {/* Brands Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Brands Data ({brands.length} items)</h2>
            {brands.length > 0 ? (
              <div className="space-y-2">
                {brands.map((brand, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p><strong>Name:</strong> {brand.name}</p>
                    <p><strong>Slug:</strong> {brand.slug}</p>
                    <p><strong>Active:</strong> {brand.active ? 'Yes' : 'No'}</p>
                    <p><strong>Origin:</strong> {brand.origin_country || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No brands found</p>
            )}
          </div>

          {/* Products Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Products Data ({products.length} items)</h2>
            {products.length > 0 ? (
              <div className="space-y-2">
                {products.slice(0, 3).map((product, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded">
                    <p><strong>Name:</strong> {product.name}</p>
                    <p><strong>Slug:</strong> {product.slug}</p>
                    <p><strong>Featured:</strong> {product.featured ? 'Yes' : 'No'}</p>
                    <p><strong>Active:</strong> {product.active ? 'Yes' : 'No'}</p>
                  </div>
                ))}
                {products.length > 3 && (
                  <p className="text-gray-600">... and {products.length - 3} more</p>
                )}
              </div>
            ) : (
              <p className="text-gray-600">No products found</p>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <button 
              onClick={testDatabaseConnection}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Retry Connection Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
