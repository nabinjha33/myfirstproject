// Comprehensive fixture data for testing the Jeen Mata Impex application

export const sampleBrands = [
  {
    id: "brand_1",
    name: "FastDrill",
    slug: "fastdrill",
    description: "Premium drilling tools and equipment from China. Known for durability and precision in industrial applications.",
    logo: "/images/brands/fastdrill-logo.png",
    origin_country: "China",
    established_year: "2010",
    specialty: "Drilling Tools & Equipment",
    active: true,
    created_date: "2024-01-15T08:00:00Z"
  },
  {
    id: "brand_2",
    name: "Spider",
    slug: "spider",
    description: "High-quality construction and industrial tools. Trusted by professionals across Nepal for reliability.",
    logo: "/images/brands/spider-logo.png",
    origin_country: "China",
    established_year: "2008",
    specialty: "Construction Tools",
    active: true,
    created_date: "2024-01-15T08:00:00Z"
  },
  {
    id: "brand_3",
    name: "Gorkha",
    slug: "gorkha",
    description: "Traditional and modern tools combining Nepali craftsmanship with international standards.",
    logo: "/images/brands/gorkha-logo.png",
    origin_country: "Nepal",
    established_year: "1995",
    specialty: "Traditional & Modern Tools",
    active: true,
    created_date: "2024-01-15T08:00:00Z"
  },
  {
    id: "brand_4",
    name: "General Imports",
    slug: "general-imports",
    description: "Diverse range of imported tools and equipment from various international manufacturers.",
    logo: "/images/brands/general-imports-logo.png",
    origin_country: "Various",
    established_year: "2012",
    specialty: "General Tools & Equipment",
    active: true,
    created_date: "2024-01-15T08:00:00Z"
  }
];

export const sampleCategories = [
  "Drilling Tools",
  "Construction Equipment",
  "Hand Tools",
  "Power Tools",
  "Safety Equipment",
  "Measuring Tools",
  "Cutting Tools",
  "Fasteners",
  "Hardware",
  "Industrial Supplies"
];

export const sampleProducts = [
  {
    id: "prod_1",
    name: "Professional Hammer Drill Set",
    slug: "professional-hammer-drill-set",
    description: "Heavy-duty hammer drill with multiple bits and accessories. Perfect for concrete, masonry, and metal drilling applications.",
    brand: "FastDrill",
    category: "Drilling Tools",
    images: [
      "/images/products/hammer-drill-1.jpg",
      "/images/products/hammer-drill-2.jpg",
      "/images/products/hammer-drill-3.jpg"
    ],
    variants: [
      {
        id: "var_1_1",
        size: "13mm",
        packaging: "Plastic Case",
        estimated_price_npr: 8500,
        stock_status: "In Stock"
      },
      {
        id: "var_1_2",
        size: "16mm",
        packaging: "Metal Case",
        estimated_price_npr: 12000,
        stock_status: "In Stock"
      },
      {
        id: "var_1_3",
        size: "20mm",
        packaging: "Professional Kit",
        estimated_price_npr: 18500,
        stock_status: "Low Stock"
      }
    ],
    featured: true,
    created_date: "2024-02-01T10:00:00Z"
  },
  {
    id: "prod_2",
    name: "Spider Construction Wrench Set",
    slug: "spider-construction-wrench-set",
    description: "Complete set of construction wrenches in various sizes. Chrome vanadium steel construction for maximum durability.",
    brand: "Spider",
    category: "Hand Tools",
    images: [
      "/images/products/wrench-set-1.jpg",
      "/images/products/wrench-set-2.jpg"
    ],
    variants: [
      {
        id: "var_2_1",
        size: "8-24mm",
        packaging: "Roll Pouch",
        estimated_price_npr: 3200,
        stock_status: "In Stock"
      },
      {
        id: "var_2_2",
        size: "6-32mm",
        packaging: "Metal Box",
        estimated_price_npr: 4800,
        stock_status: "In Stock"
      }
    ],
    featured: false,
    created_date: "2024-02-05T14:30:00Z"
  },
  {
    id: "prod_3",
    name: "Gorkha Traditional Khukuri Tool",
    slug: "gorkha-traditional-khukuri-tool",
    description: "Authentic Nepali khukuri adapted for modern construction and utility work. Hand-forged with traditional techniques.",
    brand: "Gorkha",
    category: "Cutting Tools",
    images: [
      "/images/products/khukuri-tool-1.jpg",
      "/images/products/khukuri-tool-2.jpg"
    ],
    variants: [
      {
        id: "var_3_1",
        size: "8 inch",
        packaging: "Leather Sheath",
        estimated_price_npr: 2500,
        stock_status: "In Stock"
      },
      {
        id: "var_3_2",
        size: "10 inch",
        packaging: "Wooden Box",
        estimated_price_npr: 3500,
        stock_status: "In Stock"
      }
    ],
    featured: true,
    created_date: "2024-02-10T09:15:00Z"
  },
  {
    id: "prod_4",
    name: "Industrial Safety Helmet",
    slug: "industrial-safety-helmet",
    description: "High-impact ABS safety helmet with adjustable suspension system. Meets international safety standards.",
    brand: "General Imports",
    category: "Safety Equipment",
    images: [
      "/images/products/safety-helmet-1.jpg"
    ],
    variants: [
      {
        id: "var_4_1",
        size: "Standard",
        packaging: "Individual Box",
        estimated_price_npr: 850,
        stock_status: "In Stock"
      },
      {
        id: "var_4_2",
        size: "Large",
        packaging: "Bulk Pack (10pcs)",
        estimated_price_npr: 7500,
        stock_status: "In Stock"
      }
    ],
    featured: false,
    created_date: "2024-02-15T11:45:00Z"
  },
  {
    id: "prod_5",
    name: "Precision Measuring Tape",
    slug: "precision-measuring-tape",
    description: "Professional-grade measuring tape with magnetic tip and clear markings. Essential for accurate measurements.",
    brand: "FastDrill",
    category: "Measuring Tools",
    images: [
      "/images/products/measuring-tape-1.jpg",
      "/images/products/measuring-tape-2.jpg"
    ],
    variants: [
      {
        id: "var_5_1",
        size: "5m",
        packaging: "Blister Pack",
        estimated_price_npr: 450,
        stock_status: "In Stock"
      },
      {
        id: "var_5_2",
        size: "8m",
        packaging: "Retail Box",
        estimated_price_npr: 680,
        stock_status: "In Stock"
      },
      {
        id: "var_5_3",
        size: "10m",
        packaging: "Professional Case",
        estimated_price_npr: 950,
        stock_status: "Low Stock"
      }
    ],
    featured: false,
    created_date: "2024-02-20T16:20:00Z"
  }
];

export const sampleUsers = [
  {
    id: "user_1",
    email: "admin@jeenmataimpex.com",
    full_name: "Admin User",
    role: "admin",
    dealer_status: "N/A",
    created_date: "2024-01-01T00:00:00Z"
  },
  {
    id: "user_2",
    email: "dealer1@hardware.com",
    full_name: "Rajesh Sharma",
    business_name: "Sharma Hardware Store",
    vat_pan: "301234567",
    address: "Thamel, Kathmandu",
    phone: "+977-9841234567",
    whatsapp: "+977-9841234567",
    role: "user",
    dealer_status: "Approved",
    created_date: "2024-01-15T10:30:00Z"
  },
  {
    id: "user_3",
    email: "dealer2@construction.com",
    full_name: "Sita Gurung",
    business_name: "Mountain Construction Supplies",
    vat_pan: "301234568",
    address: "Pokhara, Kaski",
    phone: "+977-9856789012",
    whatsapp: "+977-9856789012",
    role: "user",
    dealer_status: "Approved",
    created_date: "2024-01-20T14:15:00Z"
  },
  {
    id: "user_4",
    email: "dealer3@tools.com",
    full_name: "Ram Bahadur Thapa",
    business_name: "Thapa Tools & Equipment",
    vat_pan: "301234569",
    address: "Butwal, Rupandehi",
    phone: "+977-9812345678",
    whatsapp: "+977-9812345678",
    role: "user",
    dealer_status: "Pending",
    created_date: "2024-02-25T09:00:00Z"
  }
];

export const sampleDealerApplications = [
  {
    id: "app_1",
    business_name: "New Era Hardware",
    contact_person: "Krishna Prasad Oli",
    email: "krishna@newerahardware.com",
    phone: "+977-9823456789",
    whatsapp: "+977-9823456789",
    address: "Biratnagar, Morang",
    vat_pan: "301234570",
    business_type: "Retail",
    years_in_business: "5",
    status: "Pending",
    created_date: "2024-02-28T11:30:00Z"
  },
  {
    id: "app_2",
    business_name: "Himalayan Tools Pvt. Ltd.",
    contact_person: "Anita Shrestha",
    email: "anita@himalayantools.com",
    phone: "+977-9834567890",
    whatsapp: "+977-9834567890",
    address: "Lalitpur, Bagmati",
    vat_pan: "301234571",
    business_type: "Wholesale",
    years_in_business: "8",
    status: "Pending",
    created_date: "2024-03-01T15:45:00Z"
  }
];

export const sampleOrders = [
  {
    id: "order_1",
    dealer_email: "dealer1@hardware.com",
    dealer_name: "Sharma Hardware Store",
    contact_person: "Rajesh Sharma",
    contact_phone: "+977-9841234567",
    status: "Confirmed",
    order_date: "2024-02-15T10:00:00Z",
    items: [
      {
        product_name: "Professional Hammer Drill Set",
        product_brand: "FastDrill",
        variant_size: "16mm",
        variant_packaging: "Metal Case",
        estimated_price_npr: 12000,
        quantity: 2,
        notes: "Need urgent delivery",
        total_estimated_value: 24000
      },
      {
        product_name: "Spider Construction Wrench Set",
        product_brand: "Spider",
        variant_size: "8-24mm",
        variant_packaging: "Roll Pouch",
        estimated_price_npr: 3200,
        quantity: 5,
        notes: "",
        total_estimated_value: 16000
      }
    ],
    total_items: 7,
    estimated_total_value: 40000,
    additional_notes: "Please confirm delivery date",
    inquiry_type: "Product Inquiry"
  },
  {
    id: "order_2",
    dealer_email: "dealer2@construction.com",
    dealer_name: "Mountain Construction Supplies",
    contact_person: "Sita Gurung",
    contact_phone: "+977-9856789012",
    status: "Processing",
    order_date: "2024-02-20T14:30:00Z",
    items: [
      {
        product_name: "Industrial Safety Helmet",
        product_brand: "General Imports",
        variant_size: "Large",
        variant_packaging: "Bulk Pack (10pcs)",
        estimated_price_npr: 7500,
        quantity: 3,
        notes: "Different colors if available",
        total_estimated_value: 22500
      }
    ],
    total_items: 3,
    estimated_total_value: 22500,
    additional_notes: "Bulk order for construction project",
    inquiry_type: "Bulk Order"
  }
];

export const sampleShipments = [
  {
    id: "ship_1",
    tracking_number: "JMI2024001",
    origin_country: "China",
    status: "In Transit",
    eta_date: "2024-03-15",
    product_names: [
      "Professional Hammer Drill Set",
      "Precision Measuring Tape",
      "Industrial Safety Equipment"
    ],
    last_updated: "2024-03-01T08:00:00Z"
  },
  {
    id: "ship_2",
    tracking_number: "JMI2024002",
    origin_country: "India",
    status: "At Port",
    eta_date: "2024-03-10",
    product_names: [
      "Spider Construction Wrench Set",
      "Hand Tools Collection"
    ],
    last_updated: "2024-03-02T12:30:00Z"
  },
  {
    id: "ship_3",
    tracking_number: "JMI2024003",
    origin_country: "China",
    status: "In Warehouse",
    eta_date: "2024-03-05",
    product_names: [
      "Power Tools Assortment",
      "Safety Equipment Bulk"
    ],
    last_updated: "2024-03-03T16:45:00Z"
  }
];

export const sampleInquiries = [
  {
    id: "inq_1",
    dealer_email: "dealer1@hardware.com",
    dealer_name: "Sharma Hardware Store",
    contact_person: "Rajesh Sharma",
    contact_phone: "+977-9841234567",
    subject: "Bulk Pricing for Drill Sets",
    message: "I need pricing for 50+ units of hammer drill sets. Can you provide volume discounts?",
    status: "Open",
    priority: "Medium",
    created_date: "2024-02-28T09:15:00Z"
  },
  {
    id: "inq_2",
    dealer_email: "dealer2@construction.com",
    dealer_name: "Mountain Construction Supplies",
    contact_person: "Sita Gurung",
    contact_phone: "+977-9856789012",
    subject: "Custom Tool Requirements",
    message: "Do you have custom manufacturing options for specialized construction tools?",
    status: "In Progress",
    priority: "High",
    created_date: "2024-03-01T14:20:00Z"
  }
];

export const sampleSiteSettings = {
  id: "settings_1",
  company_name: "Jeen Mata Impex",
  tagline: "Premium Import Solutions from China & India",
  contact_email: "info@jeenmataimpex.com",
  contact_phone: "+977-1-4567890",
  contact_address: "Kathmandu, Nepal",
  whatsapp_number: "+977-9876543210",
  default_theme: "light",
  default_language: "en",
  enable_dealer_notifications: true,
  enable_inquiry_notifications: true,
  enable_whatsapp_notifications: false,
  auto_approve_dealers: false
};

// Helper function to get all sample data
export const getAllSampleData = () => ({
  brands: sampleBrands,
  categories: sampleCategories,
  products: sampleProducts,
  users: sampleUsers,
  dealerApplications: sampleDealerApplications,
  orders: sampleOrders,
  shipments: sampleShipments,
  inquiries: sampleInquiries,
  siteSettings: sampleSiteSettings
});

// Helper function to seed data (for testing purposes)
export const seedSampleData = async () => {
  console.log("🌱 Seeding sample data...");
  
  try {
    // In a real application, you would use your entity classes here
    // await Brand.createMany(sampleBrands);
    // await Product.createMany(sampleProducts);
    // await User.createMany(sampleUsers);
    // etc.
    
    console.log("✅ Sample data seeded successfully!");
    return getAllSampleData();
  } catch (error) {
    console.error("❌ Failed to seed sample data:", error);
    throw error;
  }
};

export default getAllSampleData;
