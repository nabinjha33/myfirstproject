"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useClerk } from '@clerk/nextjs';
import { 
  Package, 
  Users, 
  ShoppingCart, 
  Ship, 
  BarChart3, 
  Settings,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  Tag,
  Upload,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const adminRoutes = [
  { title: "Dashboard", url: "/admin/dashboard", icon: BarChart3 },
  { title: "Products", url: "/admin/products", icon: Package },
  { title: "Brands", url: "/admin/brands", icon: Tag },
  { title: "Categories", url: "/admin/categories", icon: Tag },
  { title: "Orders", url: "/admin/orders", icon: ShoppingCart },
  { title: "Shipments", url: "/admin/shipments", icon: Ship },
  { title: "Dealers", url: "/admin/dealers", icon: Users },
  { title: "Users", url: "/admin/users", icon: UserCheck },
  { title: "Bulk Upload", url: "/admin/bulk-upload", icon: Upload },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState("en");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Check admin status on mount and user change
  useEffect(() => {
    const checkAdminStatus = async (retryCount = 0, maxRetries = 3) => {
      if (!isLoaded) return;
      
      if (!user) {
        router.push('/admin-login');
        return;
      }

      try {
        const response = await fetch('/api/admin/check-status');
        const data = await response.json();
        
        console.log('Admin status check response:', { status: response.status, data, attempt: retryCount + 1 });
        
        if (response.ok) {
          if (data.isAdmin) {
            setAdminUser(data.user);
            setIsCheckingAuth(false);
          } else {
            console.log('User is not admin:', data);
            router.push('/access-denied?reason=admin_required');
            return;
          }
        } else if (response.status === 401 && retryCount < maxRetries) {
          // Retry after a short delay if authentication is not ready
          console.log(`Admin status check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            checkAdminStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        } else {
          console.error('Admin status check failed:', data);
          
          // Show specific error messages
          if (response.status === 404) {
            alert(`Admin user not found in database. Please run this SQL in Supabase:\n\nINSERT INTO users (id, email, full_name, role, dealer_status, created_at, updated_at) VALUES (gen_random_uuid(), '${data.debug?.includes('@') ? data.debug.split(': ')[1] : 'admin@jeenmataimpex.com'}', 'Admin User', 'admin', 'approved', NOW(), NOW());`);
          }
          
          router.push('/admin-login');
          return;
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            checkAdminStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        }
        alert('Network error checking admin status. Please check your connection.');
        router.push('/admin-login');
        return;
      }
    };

    checkAdminStatus();
  }, [user, isLoaded, router]);

  // Show loading while checking authentication
  if (!isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className={`min-h-screen flex w-full ${isDark ? 'dark' : ''}`}>
        <Sidebar className="border-r border-gray-200">
          <SidebarHeader className="border-b border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">Jeen Mata Impex</h2>
                <p className="text-xs text-red-600">Admin Portal</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-2">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminRoutes.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-red-50 hover:text-red-700 transition-colors duration-200 rounded-lg mb-1 ${
                          pathname === item.url ? 'bg-red-50 text-red-700' : ''
                        }`}
                      >
                        <Link href={item.url} className="flex items-center gap-3 px-3 py-2">
                          <item.icon className="w-4 h-4" />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {adminUser?.name || 'Admin User'}
                </p>
                <p className="text-xs text-gray-500 truncate">{adminUser?.email || 'admin@jeenmataimpex.com'}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {isDark ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleLanguage}>
                    <Globe className="w-4 h-4 mr-2" />
                    {language === 'en' ? 'नेपाली' : 'English'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-gray-50">
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 md:hidden sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-900 truncate">Jeen Mata Impex</h1>
                    <p className="text-xs text-red-600">Admin Portal</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                  {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-2">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={toggleLanguage}>
                      <Globe className="w-4 h-4 mr-2" />
                      {language === 'en' ? 'नेपाली' : 'English'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
