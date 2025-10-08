-- 20251007_booking_holds.sql
-- Adds soft reservation (hold) capability and configurable hold window.

-- Optional: configurable hold window per tenant (default 15 minutes)
ALTER TABLE public.tenant_policies
  ADD COLUMN IF NOT EXISTS hold_minutes integer DEFAULT 15;

-- Holds table: reserves a slot temporarily while a user completes booking
CREATE TABLE IF NOT EXISTS public.booking_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  package_id uuid REFERENCES public.packages(id) ON DELETE SET NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  kids_count integer,
  client_token text, -- optional client identifier for idempotency/cleanup
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT booking_holds_unique UNIQUE (tenant_id, room_id, start_time)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_booking_holds_tenant_start ON public.booking_holds(tenant_id, start_time);
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires ON public.booking_holds(expires_at);

-- Enable RLS (access via Edge Functions using service_role by default)
ALTER TABLE public.booking_holds ENABLE ROW LEVEL SECURITY;
-- If you want authenticated tenant admins to see holds, add a SELECT policy later.
