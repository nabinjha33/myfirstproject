# Environment Configuration Guide
## Jeen Mata Impex - Next.js Application

This guide provides comprehensive instructions for setting up the development and production environments for the Jeen Mata Impex application.

## 📋 Prerequisites

Before setting up the environment, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git** for version control
- **Base44 Entity SDK** access credentials

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Base44 Entity SDK Configuration
```bash
# Base44 Entity SDK
BASE44_API_URL=https://api.base44.com
BASE44_API_KEY=your_base44_api_key_here
BASE44_PROJECT_ID=your_project_id_here
BASE44_ENVIRONMENT=development  # or 'production'
```

### Next.js Configuration
```bash
# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Jeen Mata Impex"
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### WhatsApp Business API (Optional)
```bash
# WhatsApp Integration
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_NUMBER=+977-9876543210
WHATSAPP_WEBHOOK_VERIFY_TOKEN=your_webhook_verify_token
```

### Email Configuration (Optional)
```bash
# Email Service (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@jeenmataimpex.com
```

### File Upload Configuration (Optional)
```bash
# File Upload (if using cloud storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Or AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your_s3_bucket_name
```

### Analytics (Optional)
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Facebook Pixel
NEXT_PUBLIC_FACEBOOK_PIXEL_ID=your_pixel_id
```

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/jeen-mata-impex.git
cd jeen-mata-impex
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Set Up Environment Variables
```bash
# Copy the example environment file
cp .env.example .env.local

# Edit the file with your actual values
nano .env.local  # or use your preferred editor
```

### 4. Initialize Base44 Entities
```bash
# Run the entity initialization script
npm run init:entities
```

### 5. Seed Sample Data (Development Only)
```bash
# Load sample data for development
npm run seed:data
```

### 6. Start Development Server
```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Base44 Entity Configuration

### Required Entities

Ensure the following entities are configured in your Base44 project:

#### 1. User Entity
```javascript
{
  "name": "User",
  "fields": {
    "email": "string",
    "full_name": "string",
    "business_name": "string",
    "vat_pan": "string",
    "address": "string",
    "phone": "string",
    "whatsapp": "string",
    "role": "string",
    "dealer_status": "string"
  }
}
```

#### 2. Product Entity
```javascript
{
  "name": "Product",
  "fields": {
    "name": "string",
    "slug": "string",
    "description": "text",
    "brand": "string",
    "category": "string",
    "images": "array",
    "variants": "array",
    "featured": "boolean"
  }
}
```

#### 3. Order Entity
```javascript
{
  "name": "Order",
  "fields": {
    "dealer_email": "string",
    "dealer_name": "string",
    "contact_person": "string",
    "contact_phone": "string",
    "status": "string",
    "order_date": "datetime",
    "items": "array",
    "total_items": "number",
    "estimated_total_value": "number",
    "additional_notes": "text",
    "inquiry_type": "string"
  }
}
```

#### 4. Shipment Entity
```javascript
{
  "name": "Shipment",
  "fields": {
    "tracking_number": "string",
    "origin_country": "string",
    "status": "string",
    "eta_date": "date",
    "product_names": "array",
    "last_updated": "datetime"
  }
}
```

#### 5. DealerApplication Entity
```javascript
{
  "name": "DealerApplication",
  "fields": {
    "business_name": "string",
    "contact_person": "string",
    "email": "string",
    "phone": "string",
    "whatsapp": "string",
    "address": "string",
    "vat_pan": "string",
    "business_type": "string",
    "years_in_business": "string",
    "status": "string"
  }
}
```

#### 6. Brand Entity
```javascript
{
  "name": "Brand",
  "fields": {
    "name": "string",
    "slug": "string",
    "description": "text",
    "logo": "string",
    "origin_country": "string",
    "established_year": "string",
    "specialty": "string",
    "active": "boolean"
  }
}
```

## 🔐 Authentication Setup

### Base44 Authentication
The application uses Base44's built-in authentication system. Configure the following:

1. **Login Page**: `/auth/login`
2. **Registration**: `/auth/register`
3. **Password Reset**: `/auth/forgot-password`

### Role-Based Access Control
- **Admin**: Full access to admin panel
- **User**: Dealer access to products and orders

## 📱 WhatsApp Integration Setup

### 1. Create WhatsApp Business Account
1. Go to [Facebook Business](https://business.facebook.com/)
2. Create a WhatsApp Business API account
3. Get your access token and phone number ID

### 2. Configure Webhook
1. Set webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
2. Set verify token in environment variables
3. Subscribe to message events

### 3. Test Integration
```bash
# Test WhatsApp service
npm run test:whatsapp
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard
```

### Docker Deployment
```bash
# Build Docker image
docker build -t jeen-mata-impex .

# Run container
docker run -p 3000:3000 --env-file .env.local jeen-mata-impex
```

### Manual Server Deployment
```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Test Data
```bash
# Load test data
npm run seed:test-data

# Clear test data
npm run clear:test-data
```

## 📊 Monitoring & Analytics

### Performance Monitoring
- **Vercel Analytics**: Automatic with Vercel deployment
- **Google Analytics**: Configure with `NEXT_PUBLIC_GA_MEASUREMENT_ID`

### Error Tracking
```bash
# Install Sentry (optional)
npm install @sentry/nextjs

# Configure in next.config.js
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Base44 Connection Issues
```bash
# Check API credentials
npm run check:base44

# Test connection
curl -H "Authorization: Bearer $BASE44_API_KEY" $BASE44_API_URL/health
```

#### 2. WhatsApp Webhook Issues
- Verify webhook URL is publicly accessible
- Check verify token matches environment variable
- Ensure HTTPS is enabled in production

#### 3. Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules
rm -rf node_modules package-lock.json
npm install
```

#### 4. Environment Variable Issues
```bash
# Check if variables are loaded
npm run check:env
```

## 📚 Additional Resources

### Documentation Links
- [Next.js Documentation](https://nextjs.org/docs)
- [Base44 Entity SDK](https://docs.base44.com)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com)

### Support
- **Email**: dev@jeenmataimpex.com
- **Documentation**: [Internal Wiki Link]
- **Issue Tracker**: [GitHub Issues Link]

## 🔄 Updates & Maintenance

### Regular Updates
```bash
# Update dependencies
npm update

# Check for security vulnerabilities
npm audit

# Update Base44 SDK
npm install @base44/entity-sdk@latest
```

### Backup Procedures
- **Database**: Automated Base44 backups
- **Files**: Regular S3/Cloudinary backups
- **Code**: Git repository with tags

---

## 📝 Environment Checklist

Before going live, ensure:

- [ ] All environment variables are set
- [ ] Base44 entities are configured
- [ ] WhatsApp integration is tested
- [ ] SSL certificate is installed
- [ ] Domain is configured
- [ ] Analytics are set up
- [ ] Error monitoring is active
- [ ] Backup procedures are in place
- [ ] Performance is optimized
- [ ] Security headers are configured

---

**Last Updated**: March 2024  
**Version**: 1.0.0  
**Maintainer**: Development Team
