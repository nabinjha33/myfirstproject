"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Package, 
  Sun,
  Moon,
  Globe,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";

const publicRoutes = [
  { title: "Home", url: "/", icon: Home },
  { title: "Brands", url: "/brands", icon: Package },
  { title: "Products", url: "/products", icon: Package },
];

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState("en");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 to-amber-50 ${isDark ? 'dark' : ''}`}>
      {/* Public Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2 min-w-0 flex-1 md:flex-none">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center flex-shrink-0">
                <Package className="w-4 h-4 md:w-6 md:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-gray-900 truncate">Jeen Mata Impex</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Premium Import Solutions</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {publicRoutes.map((route) => (
                <Link
                  key={route.title}
                  href={route.url}
                  className={`text-sm font-medium transition-colors hover:text-red-600 ${
                    pathname === route.url ? 'text-red-600' : 'text-gray-700'
                  }`}
                >
                  {route.title}
                </Link>
              ))}
            </nav>

            {/* Desktop Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleLanguage}>
                <Globe className="w-4 h-4 mr-2" />
                {language.toUpperCase()}
              </Button>
              <Link href="/dealer-login">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  Dealer Login
                </Button>
              </Link>
            </div>

            {/* Mobile Controls */}
            <div className="flex md:hidden items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme}>
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-red-100 bg-white/95 backdrop-blur-sm">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {publicRoutes.map((route) => {
                  const IconComponent = route.icon;
                  return (
                    <Link
                      key={route.title}
                      href={route.url}
                      className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                        pathname === route.url 
                          ? 'text-red-600 bg-red-50' 
                          : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <IconComponent className="w-5 h-5 mr-3" />
                      {route.title}
                    </Link>
                  );
                })}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={toggleLanguage}
                    className="w-full justify-start px-3 py-2"
                  >
                    <Globe className="w-5 h-5 mr-3" />
                    Language: {language.toUpperCase()}
                  </Button>
                  <Link href="/dealer-login" className="block mt-2">
                    <Button 
                      className="w-full bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dealer Login
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Public Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Footer */}
      <Footer />
    </div>
  );
}
