import BrandPageLayout from '@/components/brands/BrandPageLayout';

interface BrandPageProps {
  params: {
    slug: string;
  };
}

export default function BrandPage({ params }: BrandPageProps) {
  return <BrandPageLayout brandSlug={params.slug} />;
}

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
  const brandName = params.slug.charAt(0).toUpperCase() + params.slug.slice(1);
  
  return {
    title: `${brandName} Products - Jeen Mata Impex`,
    description: `Explore premium ${brandName} products available through Jeen Mata Impex. Quality tools and equipment from trusted manufacturers.`,
  };
}
