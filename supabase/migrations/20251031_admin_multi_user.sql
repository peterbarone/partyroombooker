-- 20251031_admin_multi_user.sql
-- Adds multi-user ownership, staff management, and Stripe subscription tracking for admin area

BEGIN;

-- ============================================================================
-- 1. USER_TENANTS TABLE - Multi-company ownership
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  role varchar NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT user_tenants_unique UNIQUE(user_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_user_tenants_user ON public.user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant ON public.user_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_role ON public.user_tenants(tenant_id, role);

COMMENT ON TABLE public.user_tenants IS 'Links users to tenants with roles - supports multi-company ownership';
COMMENT ON COLUMN public.user_tenants.role IS 'owner: full access, admin: all features, manager: limited, staff: read-only';

-- ============================================================================
-- 2. STAFF TABLE - Team member management
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name varchar NOT NULL,
  email varchar NOT NULL,
  phone varchar,
  role varchar CHECK (role IN ('Admin', 'Manager', 'Staff')),
  permissions_json jsonb DEFAULT '[]'::jsonb,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_tenant ON public.staff(tenant_id);
CREATE INDEX IF NOT EXISTS idx_staff_email ON public.staff(tenant_id, email);
CREATE INDEX IF NOT EXISTS idx_staff_active ON public.staff(tenant_id, active);

COMMENT ON TABLE public.staff IS 'Staff/team members per tenant - used for admin UI display';

-- ============================================================================
-- 3. ADD STRIPE COLUMNS TO TENANTS
-- ============================================================================
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS stripe_customer_id varchar;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS stripe_subscription_id varchar;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS subscription_status varchar;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS subscription_current_period_end timestamptz;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_email varchar;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_phone varchar;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS contact_address text;
ALTER TABLE public.tenants ADD COLUMN IF NOT EXISTS logo_url text;

CREATE INDEX IF NOT EXISTS idx_tenants_stripe_customer ON public.tenants(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_tenants_stripe_subscription ON public.tenants(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON public.tenants(subscription_status);

COMMENT ON COLUMN public.tenants.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN public.tenants.subscription_status IS 'active, past_due, canceled, etc.';

-- ============================================================================
-- 4. RLS POLICIES FOR USER_TENANTS
-- ============================================================================
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- Users can see their own tenant relationships
CREATE POLICY "user_tenants_select_own" ON public.user_tenants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Users can insert themselves as owner when creating a company
CREATE POLICY "user_tenants_insert_own" ON public.user_tenants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only owners can invite other users to their tenants
CREATE POLICY "user_tenants_insert_by_owner" ON public.user_tenants
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Users can update their own permissions if they're an owner
CREATE POLICY "user_tenants_update_owner" ON public.user_tenants
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- Users can delete relationships they created (except their own if owner)
CREATE POLICY "user_tenants_delete_owner" ON public.user_tenants
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
    AND NOT (user_id = auth.uid() AND role = 'owner')
  );

-- Service role has full access
CREATE POLICY "user_tenants_service" ON public.user_tenants
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 5. RLS POLICIES FOR STAFF
-- ============================================================================
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Users can see staff from their tenants
CREATE POLICY "staff_select" ON public.staff
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid()
    )
  );

-- Admins/owners can insert staff
CREATE POLICY "staff_insert" ON public.staff
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Admins/owners can update staff
CREATE POLICY "staff_update" ON public.staff
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Admins/owners can delete staff
CREATE POLICY "staff_delete" ON public.staff
  FOR DELETE TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() 
      AND role IN ('owner', 'admin')
    )
  );

-- Service role has full access
CREATE POLICY "staff_service" ON public.staff
  FOR ALL TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- 6. HELPER FUNCTIONS FOR TENANT ACCESS
-- ============================================================================

-- Check if user has access to a tenant by slug
CREATE OR REPLACE FUNCTION public.user_has_tenant_access(p_tenant_slug varchar)
RETURNS boolean AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM public.user_tenants ut
    JOIN public.tenants t ON t.id = ut.tenant_id
    WHERE ut.user_id = auth.uid() 
      AND t.slug = p_tenant_slug
      AND t.active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get tenant ID by slug for current user (returns NULL if no access)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(p_tenant_slug varchar)
RETURNS uuid AS $$
  SELECT ut.tenant_id 
  FROM public.user_tenants ut
  JOIN public.tenants t ON t.id = ut.tenant_id
  WHERE ut.user_id = auth.uid() 
    AND t.slug = p_tenant_slug
    AND t.active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Get user's role for a tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_role(p_tenant_slug varchar)
RETURNS varchar AS $$
  SELECT ut.role 
  FROM public.user_tenants ut
  JOIN public.tenants t ON t.id = ut.tenant_id
  WHERE ut.user_id = auth.uid() 
    AND t.slug = p_tenant_slug
    AND t.active = true
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================================
-- 7. UPDATE EXISTING RLS POLICIES TO USE NEW ACCESS MODEL
-- ============================================================================

-- Drop old tenant access policies that relied on JWT tenant_id
DROP POLICY IF EXISTS "tenants_select_for_authenticated" ON public.tenants;

-- New policy: users can see tenants they have access to
CREATE POLICY "tenants_select_user_access" ON public.tenants
  FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid()
    )
  );

-- Owners can update their tenant info
CREATE POLICY "tenants_update_owner" ON public.tenants
  FOR UPDATE TO authenticated
  USING (
    id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT tenant_id FROM public.user_tenants 
      WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 20251031_admin_multi_user completed successfully!';
  RAISE NOTICE '📊 Created tables: user_tenants, staff';
  RAISE NOTICE '💳 Added Stripe columns to tenants';
  RAISE NOTICE '🔒 Configured RLS policies for multi-user access';
END $$;
