-- 20251008_add_booking_addons_cents.sql
-- Adds cents-based pricing capture for booking_addons and a computed line total.

BEGIN;

-- Ensure table exists
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'booking_addons'
  ) THEN
    RAISE EXCEPTION 'Table public.booking_addons does not exist';
  END IF;
END $$;

-- Add unit_price_cents if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='booking_addons' AND column_name='unit_price_cents'
  ) THEN
    ALTER TABLE public.booking_addons
      ADD COLUMN unit_price_cents bigint NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add line_total_cents as generated column if not present
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='booking_addons' AND column_name='line_total_cents'
  ) THEN
    ALTER TABLE public.booking_addons
      ADD COLUMN line_total_cents bigint GENERATED ALWAYS AS (GREATEST(quantity, 0) * unit_price_cents) STORED;
  END IF;
END $$;

COMMIT;
