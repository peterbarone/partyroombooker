# Party Room Booker

A modern multi-tenant web application for booking and managing party rooms and event spaces, designed specifically for The Family Fun Factory and other entertainment venues. Built with Next.js, TypeScript, Supabase, and Clover payment integration.

## Features

- 🏢 **Multi-tenant Architecture** - Support multiple locations/businesses
- 📅 **Smart Booking System** - Automated availability checking with buffer times
- 💰 **Clover Payment Integration** - Secure online deposits with POS balance payments
- 📋 **Digital Waivers** - Online waiver signing with e-signature capture
- 📱 **Responsive Design** - Mobile-friendly booking flow
- � **Business Rules Engine** - Configurable policies per tenant
- ⚡ **Real-time Availability** - Live booking slot management
- 🔒 **Row Level Security** - Secure multi-tenant data isolation

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + RLS)
- **Payments**: Clover Hosted Checkout + Webhook integration
- **Authentication**: Supabase Auth with JWT
- **Database**: PostgreSQL with Row Level Security
- **Hosting**: Self-hosted (Coolify + VPS ready)

## Business Logic

### Booking Flow

1. Customer selects date, package, and number of children
2. System shows available time slots (with 30-minute cleanup buffer)
3. Customer chooses eligible room based on package and capacity
4. Customer provides contact information and selects add-ons
5. System calculates total price (base + extra kids + add-ons + tax)
6. Customer pays 50% deposit via Clover Hosted Checkout
7. Booking confirmed after successful payment webhook
8. Digital waiver must be signed before event date

### Refund Policy

- **≥7 days before**: Full refund or free reschedule
- **<7 days**: Deposit non-refundable, one reschedule allowed within 60 days
- **No-show**: Deposit forfeited

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Clover developer account (for payments)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd partyroombooker
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
# Edit .env.local with your Supabase and Clover credentials
```

4. Set up the database:

```bash
# Run the SQL schema in your Supabase dashboard
# File: src/lib/database.sql
```

5. Run the development server:

```bash
npm run dev
```

6. Access the application:

- Default tenant: [http://localhost:3000/thefamilyfunfactory](http://localhost:3000/thefamilyfunfactory)
- Booking flow: [http://localhost:3000/thefamilyfunfactory/book](http://localhost:3000/thefamilyfunfactory/book)

## Multi-Tenant Routing

The application uses Next.js dynamic routing for multi-tenant support:

```
/[tenant]                    # Tenant home page
/[tenant]/book              # Booking wizard
/[tenant]/waiver/[bookingId] # Digital waiver signing
```

Each tenant has isolated:

- Rooms and packages
- Booking policies
- Payment integration
- Branding and content

## Project Structure

```
src/
├── app/
│   ├── [tenant]/           # Multi-tenant pages
│   │   ├── layout.tsx      # Tenant-specific layout
│   │   ├── page.tsx        # Tenant home page
│   │   ├── book/           # Booking wizard
│   │   └── waiver/         # Digital waiver
│   ├── api/                # API routes (webhooks, etc.)
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Root redirect
├── components/
│   ├── BookingWizard.tsx   # Multi-step booking flow
│   ├── Header.tsx          # Site navigation
│   ├── Footer.tsx          # Site footer
│   └── RoomCard.tsx        # Room display component
├── lib/
│   ├── supabase.ts         # Supabase client & types
│   ├── clover.ts           # Clover payment integration
│   └── database.sql        # Database schema
├── data/
│   └── rooms.ts            # Sample data
└── types/
    └── index.ts            # TypeScript definitions
```

## Database Schema

The application uses a comprehensive PostgreSQL schema with Row Level Security:

### Core Tables

- `tenants` - Business locations/franchises
- `tenant_policies` - Business rules per tenant
- `rooms` - Party rooms and event spaces
- `packages` - Party packages with pricing
- `bookings` - Customer reservations
- `customers` - Customer contact information
- `payments` - Payment records from Clover
- `waivers` - Digital waiver signatures

### Business Logic Tables

- `package_rooms` - Package-to-room eligibility mapping
- `slot_templates` - Available time slots by day of week
- `blackouts` - Date ranges when booking is unavailable
- `addons` - Optional extras (pizza, entertainment, etc.)
- `booking_addons` - Selected add-ons per booking

## API Integration

### Supabase Edge Functions

- `availability` - Check available time slots
- `createBooking` - Create pending booking and initiate payment
- `cloverWebhook` - Process payment confirmations

### Clover Payment Flow

1. Create booking with "pending" status
2. Generate Clover Hosted Checkout URL
3. Redirect customer to Clover payment page
4. Receive webhook on payment completion
5. Update booking status to "confirmed"

## Development Guidelines

- Use TypeScript for all new code
- Follow Next.js App Router conventions
- Implement responsive design with Tailwind CSS
- Use Supabase RLS for data security
- Test payment flows in Clover sandbox
- Validate all user inputs
- Handle errors gracefully with user feedback

## Deployment

The application is designed for self-hosting:

1. **Database**: Supabase (managed PostgreSQL)
2. **Application**: Next.js on VPS with Coolify
3. **Payments**: Clover production environment
4. **Domain**: Multi-tenant subdomains or path-based routing

## Environment Configuration

### Required Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clover
CLOVER_APP_ID=your_clover_app_id
CLOVER_APP_SECRET=your_clover_app_secret
CLOVER_ENVIRONMENT=sandbox  # or production

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For questions or support:

- Email: support@partyroombooker.com
- Documentation: [Link to docs]
- Issues: [GitHub Issues]
