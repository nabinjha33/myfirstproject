"use client";

import React, { useState, useEffect } from 'react';
import BrandPageLayout from '@/components/brands/BrandPageLayoutNew';
import { Brand } from '@/lib/entities';

export default function SpiderBrand() {
  const [brandData, setBrandData] = useState<any>(null);

  useEffect(() => {
    const fetchBrand = async () => {
      const brands = await Brand.filter({ slug: 'spider' });
      if (brands.length > 0) {
        setBrandData(brands[0]);
      }
    };
    fetchBrand();
  }, []);

  if (!brandData) {
    return <div>Loading brand...</div>;
  }

  return <BrandPageLayout brand={brandData} />;
}
