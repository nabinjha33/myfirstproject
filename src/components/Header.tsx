'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Package, Sun, Moon, Globe, Menu, X } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const publicRoutes = [
  { title: "Home", url: "/" },
  { title: "Brands", url: "/brands" },
  { title: "Products", url: "/products" }
];

export default function Header() {
  const pathname = usePathname();
  const { isDark, toggleTheme, language, toggleLanguage, getText } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-red-100 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">
                Jeen Mata Impex
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 transition-colors">
                {getText('Premium Import Solutions', 'प्रिमियम आयात समाधान')}
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

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Language Toggle */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleLanguage}
              className="text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-red-100 dark:border-gray-700 py-4">
            <nav className="flex flex-col space-y-4">
              {publicRoutes.map((route) => (
                <Link
                  key={route.title}
                  href={route.url}
                  className={`text-sm font-medium transition-colors hover:text-red-600 dark:hover:text-red-400 ${
                    pathname === route.url ? 
                      'text-red-600 dark:text-red-400' : 
                      'text-gray-700 dark:text-gray-300'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
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
          </div>
        )}
      </div>
    </header>
  );
}