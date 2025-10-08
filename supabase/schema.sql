-- schema.sql
-- Full DDL for public schema (derived from current DB)
-- Generated: 2025-10-03
-- Requires: pgcrypto (gen_random_uuid())

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- TENANTS
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar UNIQUE NOT NULL,
  name varchar NOT NULL,
  timezone varchar DEFAULT 'America/New_York',
  currency varchar DEFAULT 'USD',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- TENANT POLICIES
CREATE TABLE IF NOT EXISTS public.tenant_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  buffer_minutes integer DEFAULT 30,
  refund_days_full integer DEFAULT 7,
  reschedule_window_days integer DEFAULT 60,
  tax_rate numeric DEFAULT 0.0875,
  deposit_percent numeric DEFAULT 0,
  duration_minutes integer DEFAULT 120,
  cancellation_policy text,
  arrival_note text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tenant_policies_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- TENANT INTEGRATIONS
CREATE TABLE IF NOT EXISTS public.tenant_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL UNIQUE,
  clover_merchant_id varchar,
  clover_api_token text,
  clover_webhook_secret varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT tenant_integrations_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- ROOMS
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name varchar NOT NULL,
  description text,
  max_kids integer,
  active boolean DEFAULT true,
  slug varchar,
  capacity integer,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT rooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- PACKAGES
CREATE TABLE IF NOT EXISTS public.packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name varchar NOT NULL,
  description text,
  base_price numeric,
  base_kids integer,
  extra_kid_price numeric,
  duration_minutes integer,
  includes_json jsonb DEFAULT '{}'::jsonb,
  active boolean DEFAULT true,
  slug varchar,
  base_price_cents bigint DEFAULT 0,
  extra_child_price_cents bigint DEFAULT 0,
  includes jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT packages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- PACKAGE_ROOMS
CREATE TABLE IF NOT EXISTS public.package_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  package_id uuid NOT NULL,
  room_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT package_rooms_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages (id) ON DELETE CASCADE,
  CONSTRAINT package_rooms_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms (id) ON DELETE CASCADE,
  CONSTRAINT package_rooms_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- SLOT_TEMPLATES
CREATE TABLE IF NOT EXISTS public.slot_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  day_of_week integer CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_times_json jsonb DEFAULT '[]'::jsonb,
  open_time time,
  close_time time,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT slot_templates_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- BLACKOUTS
CREATE TABLE IF NOT EXISTS public.blackouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  start_date date,
  end_date date,
  reason varchar,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT blackouts_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- ADDONS
CREATE TABLE IF NOT EXISTS public.addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name varchar NOT NULL,
  description text,
  unit varchar,
  price numeric,
  price_cents bigint DEFAULT 0,
  taxable boolean DEFAULT true,
  active boolean DEFAULT true,
  notes text,
  slug varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT addons_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  name varchar,
  email varchar,
  phone varchar,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT customers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- BOOKINGS
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  customer_id uuid,
  package_id uuid,
  room_id uuid,
  start_time timestamptz,
  end_time timestamptz,
  kids_count integer,
  status varchar DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
  deposit_due numeric,
  deposit_paid numeric DEFAULT 0,
  balance_due numeric,
  balance_paid numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers (id) ON DELETE SET NULL,
  CONSTRAINT bookings_package_id_fkey FOREIGN KEY (package_id) REFERENCES public.packages (id) ON DELETE SET NULL,
  CONSTRAINT bookings_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms (id) ON DELETE SET NULL,
  CONSTRAINT bookings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- BOOKING_ADDONS
CREATE TABLE IF NOT EXISTS public.booking_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  booking_id uuid NOT NULL,
  addon_id uuid NOT NULL,
  quantity integer DEFAULT 1,
  unit_price numeric,
  taxable boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT booking_addons_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings (id) ON DELETE CASCADE,
  CONSTRAINT booking_addons_addon_id_fkey FOREIGN KEY (addon_id) REFERENCES public.addons (id) ON DELETE CASCADE,
  CONSTRAINT booking_addons_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  booking_id uuid,
  type varchar CHECK (type IN ('deposit','balance','refund')),
  amount numeric,
  status varchar DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  clover_payment_id varchar,
  raw_webhook_json jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT payments_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings (id) ON DELETE SET NULL,
  CONSTRAINT payments_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

-- WAIVERS
CREATE TABLE IF NOT EXISTS public.waivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  booking_id uuid,
  signer_name varchar,
  signer_email varchar,
  signed_at timestamptz,
  method varchar CHECK (method IN ('online','in_person')),
  file_url text,
  signature_data jsonb,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT waivers_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE,
  CONSTRAINT waivers_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings (id) ON DELETE SET NULL
);

-- PARTY_CHARACTERS
CREATE TABLE IF NOT EXISTS public.party_characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  slug varchar,
  name varchar NOT NULL,
  price_cents bigint DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT party_characters_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_party_characters_tenant_slug
  ON public.party_characters (tenant_id, slug);

-- PARTY FAQS
CREATE TABLE IF NOT EXISTS public.party_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT party_faqs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_party_faqs_tenant_sort ON public.party_faqs (tenant_id, sort_order);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_tenant_active ON public.rooms (tenant_id, active);
CREATE INDEX IF NOT EXISTS idx_packages_tenant_active ON public.packages (tenant_id, active);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_start ON public.bookings (tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_customers_tenant_email ON public.customers (tenant_id, email);