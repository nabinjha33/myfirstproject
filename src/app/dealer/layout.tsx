"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { 
  Package, 
  ShoppingCart, 
  Ship, 
  Settings,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  FileText
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

const dealerRoutes = [
  { title: "Catalog", url: "/dealer/catalog", icon: Package },
  { title: "Order Cart", url: "/dealer/order-cart", icon: ShoppingCart },
  { title: "My Orders", url: "/dealer/my-orders", icon: FileText },
  { title: "Shipments", url: "/dealer/shipments", icon: Ship },
  { title: "Profile", url: "/dealer/profile", icon: User },
];

export default function DealerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState("en");
  const [mounted, setMounted] = useState(false);
  const [dealerUser, setDealerUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check if dark mode is already enabled
    const isDarkMode = document.documentElement.classList.contains('dark');
    setIsDark(isDarkMode);
  }, []);

  // Check dealer status on mount and user change
  useEffect(() => {
    const checkDealerStatus = async (retryCount = 0, maxRetries = 3) => {
      if (!isLoaded || !mounted) return;
      
      if (!user) {
        window.location.href = '/dealer-login';
        return;
      }

      try {
        const userEmail = user.primaryEmailAddress?.emailAddress;
        if (!userEmail) {
          console.error('No email found for user');
          window.location.href = '/dealer-login';
          return;
        }

        console.log('Checking dealer status for:', {
          clerkUserId: user.id,
          userEmail: userEmail,
          attempt: retryCount + 1
        });

        // Check dealer status in database
        const response = await fetch('/api/dealers/check-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: userEmail,
            clerkUserId: user.id
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.isApprovedDealer) {
            setDealerUser(data.user);
            setIsCheckingAuth(false);
          } else {
            console.log('User is not an approved dealer:', data);
            alert('Your dealer account is not approved yet. Please contact support.');
            await signOut();
            return;
          }
        } else if (response.status === 401 && retryCount < maxRetries) {
          // Retry after a short delay if authentication is not ready
          console.log(`Dealer status check failed (401), retrying in ${(retryCount + 1) * 500}ms... (attempt ${retryCount + 1}/${maxRetries})`);
          setTimeout(() => {
            checkDealerStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        } else {
          console.error('Dealer status check failed:', response.status);
          alert('Unable to verify dealer status. Please try logging in again.');
          await signOut();
          return;
        }
      } catch (error) {
        console.error('Error checking dealer status:', error);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            checkDealerStatus(retryCount + 1, maxRetries);
          }, (retryCount + 1) * 500);
          return;
        }
        alert('Network error checking dealer status. Please check your connection.');
        await signOut();
        return;
      }
    };

    checkDealerStatus();
  }, [user, isLoaded, mounted, signOut]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  const handleSignOut = () => {
    signOut();
  };

  // Show loading while checking authentication
  if (!mounted || !isLoaded || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying dealer access...</p>
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
                <p className="text-xs text-red-600">Dealer Portal</p>
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
                  {dealerRoutes.map((item) => (
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
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                {user?.imageUrl ? (
                  <img 
                    src={user.imageUrl} 
                    alt={user.fullName || 'User'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm truncate">
                  {user?.fullName || 'Dealer User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" suppressHydrationWarning>
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
                  <DropdownMenuItem onClick={handleSignOut}>
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
                    <p className="text-xs text-red-600">Dealer Portal</p>
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
                    <DropdownMenuItem onClick={handleSignOut}>
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
