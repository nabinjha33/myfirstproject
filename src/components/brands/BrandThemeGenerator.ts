// Brand theme generator utility
export const generateBrandTheme = (brandName: string) => {
  const themes = [
    {
      primary: 'from-emerald-600 to-emerald-800',
      secondary: 'from-emerald-50 to-green-50',
      accent: 'emerald-600',
      accentHover: 'emerald-700',
      text: 'emerald-800',
      gradient: 'bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-700'
    },
    {
      primary: 'from-purple-600 to-purple-800',
      secondary: 'from-purple-50 to-violet-50',
      accent: 'purple-600',
      accentHover: 'purple-700',
      text: 'purple-800',
      gradient: 'bg-gradient-to-br from-purple-600 via-purple-700 to-violet-700'
    },
    {
      primary: 'from-indigo-600 to-indigo-800',
      secondary: 'from-indigo-50 to-blue-50',
      accent: 'indigo-600',
      accentHover: 'indigo-700',
      text: 'indigo-800',
      gradient: 'bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-700'
    },
    {
      primary: 'from-orange-600 to-orange-800',
      secondary: 'from-orange-50 to-amber-50',
      accent: 'orange-600',
      accentHover: 'orange-700',
      text: 'orange-800',
      gradient: 'bg-gradient-to-br from-orange-600 via-orange-700 to-red-700'
    },
    {
      primary: 'from-teal-600 to-teal-800',
      secondary: 'from-teal-50 to-cyan-50',
      accent: 'teal-600',
      accentHover: 'teal-700',
      text: 'teal-800',
      gradient: 'bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-700'
    },
    {
      primary: 'from-rose-600 to-rose-800',
      secondary: 'from-rose-50 to-pink-50',
      accent: 'rose-600',
      accentHover: 'rose-700',
      text: 'rose-800',
      gradient: 'bg-gradient-to-br from-rose-600 via-rose-700 to-pink-700'
    },
    {
      primary: 'from-slate-600 to-slate-800',
      secondary: 'from-slate-50 to-gray-50',
      accent: 'slate-600',
      accentHover: 'slate-700',
      text: 'slate-800',
      gradient: 'bg-gradient-to-br from-slate-600 via-slate-700 to-gray-700'
    },
    {
      primary: 'from-cyan-600 to-cyan-800',
      secondary: 'from-cyan-50 to-blue-50',
      accent: 'cyan-600',
      accentHover: 'cyan-700',
      text: 'cyan-800',
      gradient: 'bg-gradient-to-br from-cyan-600 via-cyan-700 to-blue-700'
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
