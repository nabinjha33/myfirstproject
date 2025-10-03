'use client';

import { useState, useEffect } from 'react';
import { useSignIn, useUser, useClerk } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface TestResult {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message: string;
  data?: any;
  timestamp?: string;
}

export default function DebugAll() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { user, isLoaded: userLoaded } = useUser();
  const { signOut } = useClerk();
  
  const [email, setEmail] = useState('admin@jeenmataimpex.com');
  const [password, setPassword] = useState('');
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (id: string, name: string, status: TestResult['status'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => {
      const filtered = prev.filter(r => r.id !== id);
      return [...filtered, { id, name, status, message, data, timestamp }];
    });
  };

  const updateResult = (id: string, status: TestResult['status'], message: string, data?: any) => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => prev.map(r => 
      r.id === id ? { ...r, status, message, data, timestamp } : r
    ));
  };

  // Test 1: Environment Check
  const testEnvironment = async () => {
    addResult('env', 'Environment Check', 'running', 'Checking environment variables...');
    
    try {
      const response = await fetch('/api/debug/environment');
      const data = await response.json();
      
      if (response.ok) {
        const envData = {
          ...data,
          clientDomain: window.location.origin,
          userAgent: navigator.userAgent.substring(0, 50) + '...'
        };
        
        if (data.configured) {
          updateResult('env', 'success', 'Environment configured correctly', envData);
        } else {
          updateResult('env', 'error', 'Missing environment variables', envData);
        }
      } else {
        updateResult('env', 'error', `Environment check failed: ${data.error}`, data);
      }
    } catch (error: any) {
      updateResult('env', 'error', `Environment check failed: ${error.message}`);
    }
  };

  // Test 2: Clerk Status
  const testClerkStatus = async () => {
    addResult('clerk', 'Clerk Status', 'running', 'Checking Clerk authentication state...');
    
    try {
      const clerkData = {
        signInLoaded,
        userLoaded,
        hasUser: !!user,
        userEmail: user?.emailAddresses?.[0]?.emailAddress || 'None',
        userId: user?.id || 'None'
      };
      
      if (signInLoaded && userLoaded) {
        updateResult('clerk', 'success', 'Clerk loaded successfully', clerkData);
      } else {
        updateResult('clerk', 'error', 'Clerk not fully loaded', clerkData);
      }
    } catch (error: any) {
      updateResult('clerk', 'error', `Clerk status check failed: ${error.message}`);
    }
  };

  // Test 3: Database Connection
  const testDatabase = async () => {
    addResult('db', 'Database Check', 'running', 'Testing database connection...');
    
    try {
      const response = await fetch('/api/debug/database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        updateResult('db', 'success', 'Database connection successful', data);
      } else {
        updateResult('db', 'error', `Database error: ${data.error}`, data);
      }
    } catch (error: any) {
      updateResult('db', 'error', `Database connection failed: ${error.message}`);
    }
  };

  // Test 4: Clerk Login
  const testClerkLogin = async () => {
    if (!password) {
      addResult('login', 'Clerk Login', 'error', 'Password required for login test');
      return;
    }
    
    addResult('login', 'Clerk Login', 'running', 'Attempting Clerk authentication...');
    
    try {
      if (!signInLoaded || !signIn) {
        updateResult('login', 'error', 'Clerk signIn not loaded');
        return;
      }

      const result = await signIn.create({
        identifier: email,
        password: password,
      });

      const loginData = {
        status: result.status,
        userId: result.createdUserId,
        sessionId: result.createdSessionId
      };

      if (result.status === 'complete') {
        updateResult('login', 'success', 'Clerk login successful', loginData);
      } else {
        updateResult('login', 'error', `Login incomplete: ${result.status}`, loginData);
      }
    } catch (error: any) {
      const errorData = {
        message: error.message,
        errors: error.errors?.map((e: any) => ({ code: e.code, message: e.message }))
      };
      
      if (error.errors?.[0]?.code === 'session_exists') {
        updateResult('login', 'success', 'Already logged in (session exists)', errorData);
      } else {
        updateResult('login', 'error', `Login failed: ${error.message}`, errorData);
      }
    }
  };

  // Test 5: Clerk Server Test
  const testClerkServer = async () => {
    addResult('clerk-server', 'Clerk Server', 'running', 'Testing Clerk server-side functions...');
    
    try {
      const response = await fetch('/api/debug/clerk-test');
      const data = await response.json();
      
      if (response.ok && data.clerkServerWorking) {
        updateResult('clerk-server', 'success', 'Clerk server functions working', data);
      } else {
        updateResult('clerk-server', 'error', `Clerk server error: ${data.error || 'Unknown error'}`, data);
      }
    } catch (error: any) {
      updateResult('clerk-server', 'error', `Clerk server test failed: ${error.message}`);
    }
  };

  // Test 6: Admin API
  const testAdminAPI = async () => {
    addResult('api', 'Admin API', 'running', 'Testing admin status API...');
    
    try {
      const response = await fetch('/api/admin/check-status');
      const data = await response.json();
      
      const apiData = {
        status: response.status,
        isAdmin: data.isAdmin,
        user: data.user,
        error: data.error,
        debug: data.debug
      };
      
      if (response.ok && data.isAdmin) {
        updateResult('api', 'success', 'Admin API working correctly', apiData);
      } else if (response.status === 401) {
        updateResult('api', 'error', 'API authentication failed', apiData);
      } else {
        updateResult('api', 'error', `API failed: ${data.error || 'Unknown error'}`, apiData);
      }
    } catch (error: any) {
      updateResult('api', 'error', `API request failed: ${error.message}`);
    }
  };

  // Test 7: Full Login Flow
  const testFullFlow = async () => {
    if (!password) {
      addResult('flow', 'Full Flow', 'error', 'Password required for full flow test');
      return;
    }
    
    addResult('flow', 'Full Login Flow', 'running', 'Testing complete login flow...');
    
    try {
      // Step 1: Login
      let loginSuccess = false;
      if (signInLoaded && signIn) {
        try {
          const result = await signIn.create({
            identifier: email,
            password: password,
          });
          loginSuccess = result.status === 'complete';
        } catch (error: any) {
          if (error.errors?.[0]?.code === 'session_exists') {
            loginSuccess = true;
          }
        }
      }
      
      if (!loginSuccess) {
        updateResult('flow', 'error', 'Login step failed in full flow');
        return;
      }
      
      // Step 2: Wait and retry admin API
      const maxRetries = 3;
      let apiSuccess = false;
      
      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, (i + 1) * 500));
        
        try {
          const response = await fetch('/api/admin/check-status');
          const data = await response.json();
          
          if (response.ok && data.isAdmin) {
            apiSuccess = true;
            updateResult('flow', 'success', `Full flow successful (attempt ${i + 1})`, {
              loginSuccess,
              apiResponse: data,
              attempts: i + 1
            });
            break;
          }
        } catch (error) {
          // Continue retrying
        }
      }
      
      if (!apiSuccess) {
        updateResult('flow', 'error', 'Admin API failed after login in full flow');
      }
      
    } catch (error: any) {
      updateResult('flow', 'error', `Full flow failed: ${error.message}`);
    }
  };

  // Run all tests
  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    await testEnvironment();
    await testClerkStatus();
    await testDatabase();
    await testClerkLogin();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for login to settle
    await testClerkServer();
    await testAdminAPI();
    await testFullFlow();
    
    setIsRunning(false);
  };

  const clearResults = () => setResults([]);

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'running': return '🔄';
      default: return '⏳';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">🔧 Complete Authentication Debug Suite</h1>
            <p className="text-gray-600">Test all authentication components at once</p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin-login">
              <Button variant="outline">Admin Login</Button>
            </Link>
            <Link href="/debug-auth">
              <Button variant="outline">Simple Debug</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Admin Email:</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@jeenmataimpex.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password:</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
              />
            </div>
          </div>
          
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={runAllTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? '🔄 Running Tests...' : '🚀 Run All Tests'}
            </Button>
            
            <Button onClick={testEnvironment} variant="outline">Environment</Button>
            <Button onClick={testClerkStatus} variant="outline">Clerk Status</Button>
            <Button onClick={testDatabase} variant="outline">Database</Button>
            <Button onClick={testClerkLogin} variant="outline">Login</Button>
            <Button onClick={testClerkServer} variant="outline">Clerk Server</Button>
            <Button onClick={testAdminAPI} variant="outline">Admin API</Button>
            <Button onClick={testFullFlow} variant="outline">Full Flow</Button>
            
            <Button onClick={clearResults} variant="outline">Clear</Button>
            
            {user && (
              <Button onClick={() => signOut()} variant="destructive">
                Logout ({user.emailAddresses?.[0]?.emailAddress})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <strong>Clerk Loaded:</strong> {signInLoaded && userLoaded ? '✅' : '❌'}
            </div>
            <div>
              <strong>User:</strong> {user ? '✅ Logged In' : '❌ Not Logged In'}
            </div>
            <div>
              <strong>Email:</strong> {user?.emailAddresses?.[0]?.emailAddress || 'None'}
            </div>
            <div>
              <strong>Domain:</strong> {typeof window !== 'undefined' ? window.location.origin : 'Loading...'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Test Results ({results.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tests run yet. Click "Run All Tests" to begin.</p>
          ) : (
            <div className="space-y-4">
              {results.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getStatusIcon(result.status)}</span>
                      <h3 className="font-semibold">{result.name}</h3>
                      <Badge className={getStatusColor(result.status)}>
                        {result.status.toUpperCase()}
                      </Badge>
                    </div>
                    {result.timestamp && (
                      <span className="text-sm text-gray-500">{result.timestamp}</span>
                    )}
                  </div>
                  
                  <p className="text-sm mb-2">{result.message}</p>
                  
                  {result.data && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                        View Details
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
