# Party Room Booker - Docker Deployment

This application uses a multi-stage Docker build optimized for Next.js production deployment.

## 🚀 Quick Start

### Local Development with Docker

```bash
# Start development environment with hot reload
npm run dev:docker

# Stop development environment
npm run dev:docker-stop
```

### Production Deployment

1. **Set up environment variables** in your deployment platform
2. **Deploy from GitHub repository**: `https://github.com/peterbarone/partyroombooker.git`
3. **Use master branch** for deployment

## 📋 Environment Variables Required

Copy these to your deployment platform's environment settings:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://odxxhramogcwahiqeegm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keHhocmFtb2djd2FoaXFlZWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDM4MjUsImV4cCI6MjA3NDk3OTgyNX0.Nj51jvun0QDEniyTlzQZpWbrk3G6dBbnr-6cxwxvoMM
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9keHhocmFtb2djd2FoaXFlZWdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQwMzgyNSwiZXhwIjoyMDc0OTc5ODI1fQ.TpauCsOQnjzceg2zef4EiVvt7UGCH42cJBEH9Uf9-Yw

# Clover Integration
CLOVER_APP_ID=J24ENBBZETA4C
CLOVER_APP_SECRET=195c8ce8-13c2-e2b4-2eb9-e165fe6198d0
CLOVER_ENVIRONMENT=sandbox
CLOVER_MERCHANT_ID=RCTSTAVI0010002
CLOVER_API_TOKEN=bf965ffe-097d-ae20-7159-d01fbd3764d0
CLOVER_WEBHOOK_SECRET=webhook_secret_partyroom_2024_secure_key_456789

# Application Configuration
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com
NEXT_PUBLIC_APP_URL=https://your-production-domain.com
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your_secure_random_string_here
```

## 🐳 Docker Build Process

The Dockerfile uses a multi-stage build:

1. **Dependencies Stage**: Installs production dependencies
2. **Builder Stage**: Builds the Next.js application with standalone output
3. **Runtime Stage**: Creates minimal production image

## 🔧 Key Features

- ✅ **Optimized for Next.js 13+ App Router**
- ✅ **Standalone output** for minimal Docker images
- ✅ **Multi-stage build** for smaller production images
- ✅ **Non-root user** for security
- ✅ **Hot reload development** environment

## 📝 Build Requirements

- Node.js 18+
- Next.js 13+ with App Router
- Standalone output enabled in next.config.js

## 🌐 After Deployment

1. Update your Clover webhook URL to: `https://your-domain.com/api/clover-webhook`
2. Test the booking flow at: `https://your-domain.com/[tenant]/book`
3. Example: `https://your-domain.com/thefamilyfunfactory/book`
