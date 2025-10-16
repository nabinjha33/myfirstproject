// Brand theme generator utility - Returns neutral color themes for all brands
export const generateBrandTheme = (brandName: string) => {
  const themes = [
    {
      primary: 'from-slate-700 to-slate-800',
      secondary: 'from-slate-50 to-gray-50',
      accent: 'slate-700',
      accentHover: 'slate-800',
      text: 'slate-800',
      gradient: 'bg-gradient-to-br from-slate-700 via-slate-800 to-gray-800'
    },
    {
      primary: 'from-gray-700 to-gray-800',
      secondary: 'from-gray-50 to-slate-50',
      accent: 'gray-700',
      accentHover: 'gray-800',
      text: 'gray-800',
      gradient: 'bg-gradient-to-br from-gray-700 via-gray-800 to-slate-800'
    },
    {
      primary: 'from-zinc-700 to-zinc-800',
      secondary: 'from-zinc-50 to-gray-50',
      accent: 'zinc-700',
      accentHover: 'zinc-800',
      text: 'zinc-800',
      gradient: 'bg-gradient-to-br from-zinc-700 via-zinc-800 to-gray-800'
    },
    {
      primary: 'from-neutral-700 to-neutral-800',
      secondary: 'from-neutral-50 to-gray-50',
      accent: 'neutral-700',
      accentHover: 'neutral-800',
      text: 'neutral-800',
      gradient: 'bg-gradient-to-br from-neutral-700 via-neutral-800 to-gray-800'
    },
    {
      primary: 'from-stone-700 to-stone-800',
      secondary: 'from-stone-50 to-gray-50',
      accent: 'stone-700',
      accentHover: 'stone-800',
      text: 'stone-800',
      gradient: 'bg-gradient-to-br from-stone-700 via-stone-800 to-gray-800'
    },
    {
      primary: 'from-gray-600 to-gray-700',
      secondary: 'from-gray-50 to-slate-100',
      accent: 'gray-600',
      accentHover: 'gray-700',
      text: 'gray-700',
      gradient: 'bg-gradient-to-br from-gray-600 via-gray-700 to-slate-700'
    },
    {
      primary: 'from-slate-600 to-slate-700',
      secondary: 'from-slate-50 to-gray-100',
      accent: 'slate-600',
      accentHover: 'slate-700',
      text: 'slate-700',
      gradient: 'bg-gradient-to-br from-slate-600 via-slate-700 to-gray-700'
    },
    {
      primary: 'from-zinc-600 to-zinc-700',
      secondary: 'from-zinc-50 to-slate-100',
      accent: 'zinc-600',
      accentHover: 'zinc-700',
      text: 'zinc-700',
      gradient: 'bg-gradient-to-br from-zinc-600 via-zinc-700 to-slate-700'
    }
  ];
  
  // Use brand name to consistently pick a theme
  const hash = brandName.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return themes[Math.abs(hash) % themes.length];
};

// Enhanced brand data generator
export const enhanceBrandData = (brand: any) => {
  return {
    ...brand,
    tagline: brand.tagline || brand.description || `Premium ${brand.name} Products & Solutions`,
    description: brand.description || `Discover our comprehensive range of high-quality ${brand.name} products, engineered for professional excellence and built to deliver outstanding performance in every application. Our commitment to quality ensures reliable solutions for your business needs.`,
    specialty: brand.specialty || 'Professional Tools & Equipment',
    origin_country: brand.origin_country || 'International',
    established_year: brand.established_year || '2020',
    story: brand.story || `${brand.name} represents a commitment to excellence in professional tools and equipment. Our products are carefully selected and tested to meet the demanding requirements of professionals across various industries. With a focus on quality, durability, and performance, ${brand.name} continues to be a trusted choice for businesses and professionals who demand the best. We pride ourselves on delivering innovative solutions that enhance productivity and ensure reliable results in every application.`
  };
};
