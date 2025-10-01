'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Package, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { SiteSettings, PageVisit, User } from '@/lib/entities';

const publicRoutes = [
  { title: "Home", url: "/" },
  { title: "Brands", url: "/brands" },
  { title: "Products", url: "/products" }
];

export default function Header() {
  const pathname = usePathname();
  const { isDark, toggleTheme, language, toggleLanguage, getText } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [siteInfo, setSiteInfo] = useState({
    company_name: 'Jeen Mata Impex',
    tagline: 'Premium Import Solutions',
    contact_email: 'jeenmataimpex8@gmail.com',
    contact_phone: '+977-1-XXXXXXX',
    contact_address: 'Kathmandu, Nepal'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsList = await SiteSettings.list();
        if (settingsList.length > 0) {
          setSiteInfo(settingsList[0]);
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      }
    };
    fetchSettings();
  }, []);

  // Effect to track page visits
  useEffect(() => {
    const trackVisit = async () => {
      // Don't track visits for admin pages
      if (pathname?.startsWith('/admin')) {
        return;
      }
      
      try {
        let userEmail = null;
        try {
          const currentUser = await User.me();
          if (currentUser) {
            userEmail = currentUser.email;
          }
        } catch (e) {
          // User is not logged in, which is fine.
        }

        // Determine page name from pathname
        let pageName = 'Unknown';
        if (pathname === '/') pageName = 'Home';
        else if (pathname === '/brands') pageName = 'Brands';
        else if (pathname === '/products') pageName = 'Products';
        else if (pathname.startsWith('/brands/')) {
          const brandName = pathname.split('/')[2];
          pageName = `${brandName}Brand`;
        }

        await PageVisit.create({
          path: pathname,
          page: pageName,
          user_email: userEmail,
          user_agent: navigator.userAgent
        });
      } catch (error) {
        console.warn("Failed to track page visit:", error);
      }
    };

    trackVisit();
  }, [pathname]);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-red-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 min-w-0 flex-1 md:flex-none">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm md:text-xl font-bold text-gray-900 dark:text-white transition-colors truncate">
                {siteInfo.company_name}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors hidden sm:block">
                {getText(siteInfo.tagline, 'प्रिमियम आयात समाधान')}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {publicRoutes.map((route) => (
              <Link
                key={route.title}
                href={route.url}
                className={`text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 ${
                  pathname === route.url ? 
                    'text-red-600 dark:text-red-400' : 
                    'text-gray-700 dark:text-gray-300'
                }`}
              >
                {getText(
                  route.title,
                  route.title === 'Home' ? 'घर' : 
                  route.title === 'Brands' ? 'ब्रान्डहरू' : 
                  route.title === 'Products' ? 'उत्पादनहरू' : 
                  route.title
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-600"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-600"
            >
              <Globe className="w-4 h-4 mr-2" />
              {language.toUpperCase()}
            </Button>

            {/* Dealer Login */}
            <Link href="/dealer/login">
              <Button className="bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600 transition-colors">
                {getText('Dealer Login', 'डीलर लगइन')}
              </Button>
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex md:hidden items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-red-100 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {publicRoutes.map((route) => (
                <Link
                  key={route.title}
                  href={route.url}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === route.url ? 
                      'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20' : 
                      'text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Package className="w-5 h-5 mr-3" />
                  {getText(
                    route.title,
                    route.title === 'Home' ? 'घर' : 
                    route.title === 'Brands' ? 'ब्रान्डहरू' : 
                    route.title === 'Products' ? 'उत्पादनहरू' : 
                    route.title
                  )}
                </Link>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={toggleLanguage}
                  className="w-full justify-start px-3 py-2 text-gray-600 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Globe className="w-5 h-5 mr-3" />
                  Language: {language.toUpperCase()}
                </Button>
                <Link href="/dealer/login" className="block mt-2">
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-600"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {getText('Dealer Login', 'डीलर लगइन')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );