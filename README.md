# Jeen Mata Impex - Next.js Application

A comprehensive B2B import/export platform built with Next.js, Base44 Entity SDK, and modern web technologies. This application serves as a digital platform for Jeen Mata Impex, facilitating dealer management, product catalogs, order processing, and shipment tracking.

## 🚀 Features

### 🏢 **Admin Panel**
- **Dashboard**: Analytics, charts, and key metrics
- **Product Management**: Add, edit, and manage product catalog with variants
- **Dealer Management**: Approve/reject dealer applications, manage dealer accounts
- **Order Processing**: View and process dealer inquiries and orders
- **Shipment Tracking**: Manage shipments with visual progress tracking
- **Settings**: Configure site settings, notifications, and system preferences

### 👥 **Dealer Portal**
- **Product Catalog**: Browse products by brand, category, and search
- **Inquiry Cart**: Add products to inquiry cart and request quotes
- **Order History**: Track submitted inquiries and orders
- **Profile Management**: Update business information and contact details
- **Shipment Tracking**: Real-time shipment status with visual progress

### 📱 **Modern Features**
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Theme switching capability
- **WhatsApp Integration**: Automated notifications and communication
- **Real-time Updates**: Live data synchronization
- **Advanced Search**: Filter and search across products and brands

## 🛠️ Technology Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: TypeScript for type safety
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/ui](https://ui.shadcn.com/)
- **Backend**: [Base44 Entity SDK](https://base44.com/) for data management
- **Charts**: [Recharts](https://recharts.org/) for analytics visualization
- **Icons**: [Lucide React](https://lucide.dev/) for consistent iconography
- **Date Handling**: [date-fns](https://date-fns.org/) for date formatting
- **Integration**: WhatsApp Business API for notifications

## 📋 Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Base44 Entity SDK** access credentials
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/jeen-mata-impex.git
cd jeen-mata-impex
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
```bash
# Copy environment example
cp env.example .env.local

# Edit with your actual values
nano .env.local
```

### 4. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel pages
│   ├── dealer/            # Dealer portal pages
│   ├── brands/            # Brand pages
│   ├── products/          # Product pages
│   └── api/               # API routes
├── components/            # Reusable React components
│   ├── ui/               # Shadcn/ui components
│   ├── admin/            # Admin-specific components
│   ├── brands/           # Brand-related components
│   └── shipments/        # Shipment components
├── lib/                   # Utility libraries
│   ├── entities/         # Base44 entity definitions
│   ├── fixtures/         # Sample data for testing
│   └── integrations/     # Third-party integrations
├── contexts/             # React contexts
└── hooks/                # Custom React hooks
```

## 🔧 Configuration

### Environment Variables
See `env.example` for all required environment variables:

- **Base44 SDK**: API credentials and project configuration
- **WhatsApp**: Business API integration (optional)
- **Analytics**: Google Analytics, Facebook Pixel (optional)
- **Email**: SMTP configuration for notifications (optional)

### Base44 Entities
The application uses the following Base44 entities:
- `User` - Dealer accounts and admin users
- `Product` - Product catalog with variants
- `Order` - Dealer inquiries and orders
- `Shipment` - Shipment tracking information
- `DealerApplication` - New dealer applications
- `Brand` - Product brands and manufacturers

## 📱 Key Pages & Routes

### Public Routes
- `/` - Homepage with company information
- `/products` - Product catalog
- `/brands/[slug]` - Individual brand pages
- `/products/[slug]` - Product detail pages

### Dealer Routes (Protected)
- `/dealer/profile` - Dealer profile management
- `/dealer/cart` - Inquiry cart
- `/dealer/orders` - Order history
- `/dealer/shipments` - Shipment tracking

### Admin Routes (Protected)
- `/admin/dashboard` - Analytics dashboard
- `/admin/products` - Product management
- `/admin/dealers` - Dealer management
- `/admin/orders` - Order processing
- `/admin/shipments` - Shipment management
- `/admin/settings` - System configuration

## 🧪 Testing & Development

### Sample Data
Load sample data for development:
```bash
# The application includes comprehensive fixture data
# Located in src/lib/fixtures/sampleData.ts
```

### Testing Features
- Comprehensive sample data for all entities
- Mock WhatsApp integration for development
- Responsive design testing across devices

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Manual Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 📊 Features Overview

### Admin Dashboard
- **Analytics Charts**: Revenue, orders, dealer statistics
- **Recent Activity**: Latest orders, applications, shipments
- **Quick Actions**: Direct access to key admin functions

### Product Management
- **Variant System**: Multiple sizes, packaging options, pricing
- **Image Management**: Multiple product images
- **Brand Association**: Products linked to specific brands
- **Category Organization**: Structured product categorization

### Dealer Management
- **Application Workflow**: Review and approve new dealers
- **Status Management**: Track dealer approval status
- **Communication**: Integrated WhatsApp notifications
- **Profile Management**: Comprehensive dealer information

### Order Processing
- **Inquiry System**: Dealers submit product inquiries
- **Quote Management**: Process and respond to inquiries
- **Status Tracking**: Monitor order progress
- **Communication**: Automated notifications

### Shipment Tracking
- **Visual Progress**: Step-by-step shipment visualization
- **Status Updates**: Real-time shipment status
- **ETA Management**: Estimated arrival dates
- **Product Association**: Link shipments to specific products

## 🔗 Integration Features

### WhatsApp Business API
- **Dealer Notifications**: Welcome messages, order confirmations
- **Shipment Updates**: Automated status notifications
- **Inquiry Responses**: Direct communication channel
- **Bulk Messaging**: Promotional messages to dealers

### Analytics & Monitoring
- **Performance Tracking**: Page views, user engagement
- **Error Monitoring**: Real-time error tracking
- **Business Metrics**: Sales, dealer growth, order volume

## 📚 Documentation

- **Environment Setup**: See `ENVIRONMENT_SETUP.md`
- **API Documentation**: Base44 Entity SDK docs
- **Component Library**: Shadcn/ui documentation
- **Deployment Guide**: Vercel deployment docs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Jeen Mata Impex. All rights reserved.

## 📞 Support

- **Email**: dev@jeenmataimpex.com
- **Phone**: +977-1-4567890
- **WhatsApp**: +977-9876543210

---

**Built with ❤️ for Jeen Mata Impex**  
**Version**: 1.0.0  
**Last Updated**: March 2024
