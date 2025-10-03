'use client';

import { useState } from 'react';
import { useSignIn, useUser } from '@clerk/nextjs';

export default function DebugAuth() {
  const { signIn, isLoaded } = useSignIn();
  const { user } = useUser();
  const [email, setEmail] = useState('admin@jeenmataimpex.com');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testClerkLogin = async () => {
    if (!isLoaded || !signIn) return;
    
    try {
      addResult('🔄 Attempting Clerk login...');
      
      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      if (result.status === 'complete') {
        addResult('✅ Clerk login successful!');
        addResult(`Logged in as: ${result.createdUserId}`);
      } else {
        addResult(`⚠️ Login incomplete. Status: ${result.status}`);
      }
    } catch (error: any) {
      addResult(`❌ Clerk login failed: ${error.message}`);
      if (error.errors) {
        error.errors.forEach((err: any) => {
          addResult(`Error code: ${err.code} - ${err.message}`);
        });
      }
    }
  };

  const testAdminAPI = async () => {
    try {
      addResult('🔄 Testing admin API...');
      
      const response = await fetch('/api/admin/check-status');
      const data = await response.json();
      
      addResult(`API Status: ${response.status}`);
      addResult(`Response: ${JSON.stringify(data, null, 2)}`);
      
      if (response.ok && data.isAdmin) {
        addResult('✅ Admin API working correctly!');
      } else if (response.status === 401) {
        addResult('❌ API says not authenticated');
      } else {
        addResult('❌ Admin verification failed');
      }
    } catch (error: any) {
      addResult(`❌ API test failed: ${error.message}`);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Clerk Authentication</h1>
      
      <div className="mb-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter admin email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Enter admin password"
          />
        </div>
      </div>

      <div className="mb-6 space-x-4">
        <button
          onClick={testClerkLogin}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Test Clerk Login
        </button>
        
        <button
          onClick={testAdminAPI}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Test Admin API
        </button>
        
        <button
          onClick={clearResults}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Results
        </button>
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Current Status:</h3>
        <p>Clerk Loaded: {isLoaded ? '✅' : '❌'}</p>
        <p>Current User: {user ? `✅ ${user.emailAddresses?.[0]?.emailAddress}` : '❌ Not logged in'}</p>
      </div>

      <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2">Debug Results:</h3>
        {results.length === 0 ? (
          <p className="text-gray-500">No results yet. Click a test button above.</p>
        ) : (
          <div className="space-y-1">
            {results.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
