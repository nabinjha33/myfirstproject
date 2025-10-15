import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/contexts/AppContext";
import { ClerkProvider } from '@clerk/nextjs';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Jeen Mata Impex - Premium Import Solutions",
  description: "Your trusted partner for premium imports from China and India to Nepal. FastDrill, Spider, Gorkha, and General Imports brands.",
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcut: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: '#dc2626', // Red-600 to match your brand
        },
        elements: {
          formButtonPrimary: 'bg-red-600 hover:bg-red-700 text-white',
          card: 'shadow-lg border border-gray-200',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <AppProvider>
            {children}
          </AppProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
