"use client";

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';

interface AppContextType {
  isDark: boolean;
  toggleTheme: () => void;
  language: 'en' | 'ne';
  toggleLanguage: () => void;
  getText: (en: string, ne: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider = ({ children }: AppProviderProps) => {
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ne'>('en');

  // Initialize theme and language from localStorage on component mount
  useEffect(() => {
    // Load theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    // Load language preference
    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'ne')) {
      setLanguage(savedLanguage as 'en' | 'ne');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ne' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };
  
  const getText = (en: string, ne: string): string => (language === 'ne' ? ne : en);

  const value: AppContextType = {
    isDark,
    toggleTheme,
    language,
    toggleLanguage,
    getText,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
