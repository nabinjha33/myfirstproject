'use client';

import React, { useState, useEffect } from 'react';
import BrandPageLayout from '@/components/brands/BrandPageLayoutFixed';
import { Brand } from '@/lib/entities';


export default function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const [brandData, setBrandData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState<string>('');

  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.slug);
    };
    getSlug();
  }, [params]);

  useEffect(() => {
    if (!slug) return;

    const fetchBrandData = async () => {
      console.log('Loading brand page for slug:', slug);
      setIsLoading(true);
      
      try {
        console.log('Attempting to fetch brand with slug:', slug);
        const brands = await Brand.filter({ slug });
        console.log('Brand filter result:', brands);
        
        if (brands.length > 0) {
          setBrandData(brands[0]);
          console.log('Found brand in database:', brands[0].name);
        } else {
          console.log('Brand not found in database, creating fallback data');
          // Create a more complete brand object if not found
          const fallbackBrand = {
            id: slug,
            name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
            slug: slug,
            description: `Premium ${slug.replace(/-/g, ' ')} products and tools`,
            logo: null,
            active: true,
            specialty: 'Professional Tools & Equipment',
            origin_country: 'International',
            established_year: '2020'
          };
          setBrandData(fallbackBrand);
        }
      } catch (error) {
        console.error('Error loading brand:', error);
        // Enhanced fallback brand data
        const fallbackBrand = {
          id: slug,
          name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
          slug: slug,
          description: `Premium ${slug.replace(/-/g, ' ')} products and tools`,
          logo: null,
          active: true,
          specialty: 'Professional Tools & Equipment',
          origin_country: 'International',
          established_year: '2020'
        };
        setBrandData(fallbackBrand);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrandData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading brand page...</p>
        </div>
      </div>
    );
  }

  if (!brandData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Brand not found</h1>
          <p className="text-gray-600">The requested brand could not be loaded.</p>
        </div>
      </div>
    );
  }

  return <BrandPageLayout brand={brandData} />;
}

