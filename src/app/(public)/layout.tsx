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
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ne' : 'en');
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-red-50 to-amber-50 ${isDark ? 'dark' : ''}`}>
      {/* Public Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Jeen Mata Impex</h1>
                <p className="text-xs text-gray-500">Premium Import Solutions</p>
              </div>
            </Link>

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

            <div className="flex items-center space-x-4">
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
          </div>
        </div>
      </header>

      {/* Public Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Public Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Jeen Mata Impex</h3>
              <p className="text-gray-400 text-sm">
                Your trusted partner for premium imports from China and India to Nepal.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Our Brands</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>FastDrill</li>
                <li>Spider</li>
                <li>Gorkha</li>
                <li>General Imports</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Import Solutions</li>
                <li>Dealer Support</li>
                <li>Shipment Tracking</li>
                <li>Quality Assurance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <p>Kathmandu, Nepal</p>
                <p>info@jeenmataimex.com</p>
                <p>+977-1-XXXXXXX</p>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Jeen Mata Impex Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
