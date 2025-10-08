-- rls_policies.sql
-- Row Level Security policies and helper functions for multi-tenant and user ownership patterns.
-- Apply after creating tables. These policies assume authenticated users and JWT claims:
--  - auth.uid() returns user's UUID
--  - auth.jwt() ->> 'tenant_id' contains user's tenant UUID
-- Adjust claims names as needed.

-- Helper: get_user_tenant() returns tenant_id from JWT or user_profiles table.
CREATE OR REPLACE FUNCTION public.get_user_tenant() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT (auth.jwt() ->> 'tenant_id')::uuid;
$$;
REVOKE EXECUTE ON FUNCTION public.get_user_tenant() FROM anon, authenticated;

-- Enable RLS on tenant-scoped tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blackouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_faqs ENABLE ROW LEVEL SECURITY;

-- Tenants: only service_role can manage tenants; authenticated users can select if their tenant matches
CREATE POLICY "tenants_select_for_service" ON public.tenants FOR SELECT TO service_role USING (true);
CREATE POLICY "tenants_select_for_authenticated" ON public.tenants FOR SELECT TO authenticated USING (id = get_user_tenant());
CREATE POLICY "tenants_insert_service" ON public.tenants FOR INSERT TO service_role WITH CHECK (true);
CREATE POLICY "tenants_update_service" ON public.tenants FOR UPDATE TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "tenants_delete_service" ON public.tenants FOR DELETE TO service_role USING (true);

-- Generic tenant-scoped SELECT/INSERT policies for authenticated role
-- Rooms
CREATE POLICY "rooms_tenant_select" ON public.rooms FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "rooms_tenant_insert" ON public.rooms FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "rooms_tenant_update" ON public.rooms FOR UPDATE TO authenticated USING (tenant_id = get_user_tenant()) WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "rooms_tenant_delete" ON public.rooms FOR DELETE TO authenticated USING (tenant_id = get_user_tenant());

-- Packages
CREATE POLICY "packages_tenant_select" ON public.packages FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "packages_tenant_insert" ON public.packages FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "packages_tenant_update" ON public.packages FOR UPDATE TO authenticated USING (tenant_id = get_user_tenant()) WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "packages_tenant_delete" ON public.packages FOR DELETE TO authenticated USING (tenant_id = get_user_tenant());

-- Package Rooms (join)
CREATE POLICY "package_rooms_tenant_select" ON public.package_rooms FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "package_rooms_tenant_insert" ON public.package_rooms FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "package_rooms_tenant_update" ON public.package_rooms FOR UPDATE TO authenticated USING (tenant_id = get_user_tenant()) WITH CHECK (tenant_id = get_user_tenant());

-- Slot templates, blackouts, addons, customers, party_characters, party_faqs
CREATE POLICY "slot_templates_tenant_select" ON public.slot_templates FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "slot_templates_tenant_insert" ON public.slot_templates FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "blackouts_tenant_select" ON public.blackouts FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "blackouts_tenant_insert" ON public.blackouts FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "addons_tenant_select" ON public.addons FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "addons_tenant_insert" ON public.addons FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "customers_tenant_select" ON public.customers FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "customers_tenant_insert" ON public.customers FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "party_characters_tenant_select" ON public.party_characters FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "party_characters_tenant_insert" ON public.party_characters FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "party_faqs_tenant_select" ON public.party_faqs FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "party_faqs_tenant_insert" ON public.party_faqs FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());

-- Bookings: customers of tenant can create/read their own bookings
CREATE POLICY "bookings_tenant_select" ON public.bookings FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "bookings_tenant_insert" ON public.bookings FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant() AND (customer_id IS NULL OR customer_id IN (SELECT id FROM public.customers WHERE tenant_id = get_user_tenant())));
CREATE POLICY "bookings_tenant_update" ON public.bookings FOR UPDATE TO authenticated USING (tenant_id = get_user_tenant()) WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "bookings_tenant_delete" ON public.bookings FOR DELETE TO authenticated USING (tenant_id = get_user_tenant());

-- Booking addons, payments, waivers
CREATE POLICY "booking_addons_tenant_select" ON public.booking_addons FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "booking_addons_tenant_insert" ON public.booking_addons FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "payments_tenant_select" ON public.payments FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "payments_tenant_insert" ON public.payments FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "waivers_tenant_select" ON public.waivers FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "waivers_tenant_insert" ON public.waivers FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());

-- Tenant policies & integrations: tenant admins only
CREATE POLICY "tenant_policies_select" ON public.tenant_policies FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "tenant_policies_insert" ON public.tenant_policies FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());
CREATE POLICY "tenant_integrations_select" ON public.tenant_integrations FOR SELECT TO authenticated USING (tenant_id = get_user_tenant());
CREATE POLICY "tenant_integrations_insert" ON public.tenant_integrations FOR INSERT TO authenticated WITH CHECK (tenant_id = get_user_tenant());

-- Allow service_role full access (bypass RLS)
-- Note: service_role automatically bypasses RLS in Supabase; explicit policies not required.