-- Party Room Booker Database Schema
-- This SQL script creates the database structure according to the PRD requirements

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    currency VARCHAR(3) DEFAULT 'USD',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tenant_policies table
CREATE TABLE IF NOT EXISTS tenant_policies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    buffer_minutes INTEGER DEFAULT 30,
    refund_days_full INTEGER DEFAULT 7,
    reschedule_window_days INTEGER DEFAULT 60,
    tax_rate DECIMAL(5,4) DEFAULT 0.0875, -- 8.75% for NY
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Create tenant_integrations table
CREATE TABLE IF NOT EXISTS tenant_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    clover_merchant_id VARCHAR(255),
    clover_api_token TEXT,
    clover_webhook_secret VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id)
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    max_kids INTEGER NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create packages table
CREATE TABLE IF NOT EXISTS packages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    base_kids INTEGER NOT NULL,
    extra_kid_price DECIMAL(10,2) NOT NULL,
    duration_minutes INTEGER NOT NULL,
    includes_json JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create package_rooms mapping table
CREATE TABLE IF NOT EXISTS package_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, package_id, room_id)
);

-- Create slot_templates table
CREATE TABLE IF NOT EXISTS slot_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_times_json JSONB DEFAULT '[]',
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blackouts table
CREATE TABLE IF NOT EXISTS blackouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create addons table
CREATE TABLE IF NOT EXISTS addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    unit VARCHAR(50) NOT NULL, -- 'per item', 'per hour', etc.
    price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN DEFAULT true,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, email)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    kids_count INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    deposit_due DECIMAL(10,2) NOT NULL,
    deposit_paid DECIMAL(10,2) DEFAULT 0,
    balance_due DECIMAL(10,2) NOT NULL,
    balance_paid DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, room_id, start_time)
);

-- Create booking_addons table
CREATE TABLE IF NOT EXISTS booking_addons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    addon_id UUID REFERENCES addons(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    taxable BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'balance', 'refund')),
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    clover_payment_id VARCHAR(255),
    raw_webhook_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create waivers table
CREATE TABLE IF NOT EXISTS waivers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    signer_name VARCHAR(100) NOT NULL,
    signer_email VARCHAR(255) NOT NULL,
    signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
    method VARCHAR(20) NOT NULL CHECK (method IN ('online', 'in_person')),
    file_url TEXT,
    signature_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id, booking_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_rooms_tenant_id ON rooms(tenant_id);
CREATE INDEX IF NOT EXISTS idx_packages_tenant_id ON packages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_start_time ON bookings(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_room_id_start_time ON bookings(room_id, start_time);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_id_email ON customers(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_waivers_booking_id ON waivers(booking_id);

-- Enable Row Level Security on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE package_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE slot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE waivers ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public read access for booking flow)
-- In production, these would be more restrictive based on JWT claims

-- Tenants - public read for active tenants
CREATE POLICY "Allow public read active tenants" ON tenants
    FOR SELECT USING (active = true);

-- Rooms - public read for active rooms
CREATE POLICY "Allow public read active rooms" ON rooms
    FOR SELECT USING (active = true);

-- Packages - public read for active packages
CREATE POLICY "Allow public read active packages" ON packages
    FOR SELECT USING (active = true);

-- Package rooms - public read
CREATE POLICY "Allow public read package rooms" ON package_rooms
    FOR SELECT USING (true);

-- Addons - public read for active addons
CREATE POLICY "Allow public read active addons" ON addons
    FOR SELECT USING (active = true);

-- Bookings - allow insert for new bookings, read own bookings
CREATE POLICY "Allow insert bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read own bookings" ON bookings
    FOR SELECT USING (true); -- In production, restrict by user

-- Customers - allow insert and read own
CREATE POLICY "Allow insert customers" ON customers
    FOR INSERT WITH CHECK (true);

-- Booking addons - allow insert with booking
CREATE POLICY "Allow insert booking addons" ON booking_addons
    FOR INSERT WITH CHECK (true);

-- Payments - allow insert
CREATE POLICY "Allow insert payments" ON payments
    FOR INSERT WITH CHECK (true);

-- Waivers - allow insert and read
CREATE POLICY "Allow insert waivers" ON waivers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow read waivers" ON waivers
    FOR SELECT USING (true);

-- Insert sample data for The Family Fun Factory
INSERT INTO tenants (slug, name, timezone, currency, active) 
VALUES ('thefamilyfunfactory', 'The Family Fun Factory', 'America/New_York', 'USD', true)
ON CONFLICT (slug) DO NOTHING;

-- Get the tenant ID for further inserts
DO $$
DECLARE
    tenant_uuid UUID;
BEGIN
    SELECT id INTO tenant_uuid FROM tenants WHERE slug = 'thefamilyfunfactory';
    
    -- Insert tenant policy
    INSERT INTO tenant_policies (tenant_id, buffer_minutes, refund_days_full, reschedule_window_days, tax_rate)
    VALUES (tenant_uuid, 30, 7, 60, 0.0875)
    ON CONFLICT (tenant_id) DO NOTHING;
    
    -- Insert sample rooms
    INSERT INTO rooms (tenant_id, name, description, max_kids, active) VALUES
    (tenant_uuid, 'Rainbow Room', 'Bright and colorful space perfect for younger children', 15, true),
    (tenant_uuid, 'Adventure Zone', 'Action-packed room with climbing and obstacle features', 20, true),
    (tenant_uuid, 'Princess Palace', 'Elegant themed room for royal celebrations', 12, true),
    (tenant_uuid, 'Sports Arena', 'Perfect for active parties and sports-themed celebrations', 25, true)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample packages
    INSERT INTO packages (tenant_id, name, description, base_price, base_kids, extra_kid_price, duration_minutes, includes_json, active) VALUES
    (tenant_uuid, 'Basic Birthday Bash', 'Perfect for smaller celebrations with all the essentials', 150.00, 8, 10.00, 120, 
     '{"includes": ["Party host", "Basic decorations", "Paper goods", "Setup & cleanup"], "restrictions": ["No outside food", "No alcohol"]}', true),
    (tenant_uuid, 'Deluxe Party Package', 'Enhanced experience with premium amenities and activities', 250.00, 12, 15.00, 150,
     '{"includes": ["Dedicated party host", "Premium decorations", "Activity stations", "Photo props", "Party favors", "Setup & cleanup"], "restrictions": ["No outside food except cake", "No alcohol"]}', true),
    (tenant_uuid, 'Ultimate Celebration', 'The complete party experience with all premium features', 400.00, 16, 20.00, 180,
     '{"includes": ["Premium party host", "Custom decorations", "Multiple activity stations", "Professional photos", "Party favors", "Goodie bags", "Pizza & drinks", "Setup & cleanup"], "restrictions": ["No alcohol"]}', true)
    ON CONFLICT DO NOTHING;
    
    -- Insert sample addons
    INSERT INTO addons (tenant_id, name, description, unit, price, taxable, active) VALUES
    (tenant_uuid, 'Extra Pizza', 'Additional large pizza', 'per pizza', 18.00, true, true),
    (tenant_uuid, 'Face Painting', 'Professional face painter for 1 hour', 'per hour', 75.00, true, true),
    (tenant_uuid, 'Balloon Artist', 'Balloon twisting artist for entertainment', 'per hour', 85.00, true, true),
    (tenant_uuid, 'Extra Goodie Bag', 'Additional party favor bag', 'per bag', 8.00, true, true)
    ON CONFLICT DO NOTHING;
    
END $$;