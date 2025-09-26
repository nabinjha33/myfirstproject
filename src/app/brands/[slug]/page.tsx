import React from 'react';
import BrandPageLayout from '@/components/brands/BrandPageLayoutFixed';
import { Brand } from '@/lib/entities';

interface BrandPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  
  // Fetch brand data server-side
  let brandData = null;
  try {
    const brands = await Brand.filter({ slug });
    if (brands.length > 0) {
      brandData = brands[0];
    } else {
      // Create a default brand object if not found
      brandData = {
        id: slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        slug: slug,
        description: `Premium ${slug} products and tools`,
        logo: null,
        active: true
      };
    }
  } catch (error) {
    console.error('Error loading brand:', error);
    // Fallback brand data
    brandData = {
      id: slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      slug: slug,
      description: `Premium ${slug} products and tools`,
      logo: null,
      active: true
    };
  }

  if (!brandData) {
    return <div>Brand not found</div>;
  }

  return <BrandPageLayout brand={brandData} />;
}

// Enable ISR with revalidation
export const revalidate = 60; // Revalidate every 60 seconds

// Generate static params for known brands (optional, for better SEO)
export async function generateStaticParams() {
  // You can fetch this from your database or define statically
  const brands = [
    { slug: 'fastdrill' },
    { slug: 'spider' },
    { slug: 'gorkha' },
    { slug: 'general-imports' }
  ];

  return brands.map((brand) => ({
    slug: brand.slug,
  }));
}

// Generate metadata for each brand page
export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params;
  const brandName = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  return {
    title: `${brandName} Products - Jeen Mata Impex`,
    description: `Explore premium ${brandName} products available through Jeen Mata Impex. Quality tools and equipment from trusted manufacturers.`,
  };
}
