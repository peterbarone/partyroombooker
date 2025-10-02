// Multi-tenant types based on PRD database schema

export interface Tenant {
  id: string;
  slug: string;
  name: string;
  timezone: string;
  currency: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TenantPolicy {
  id: string;
  tenant_id: string;
  buffer_minutes: number;
  refund_days_full: number;
  reschedule_window_days: number;
  tax_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface TenantIntegration {
  id: string;
  tenant_id: string;
  clover_merchant_id?: string;
  clover_api_token?: string;
  clover_webhook_secret?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Room {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  max_kids: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Package {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  base_price: number;
  base_kids: number;
  extra_kid_price: number;
  duration_minutes: number;
  includes_json: Record<string, any>;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface PackageRoom {
  id: string;
  tenant_id: string;
  package_id: string;
  room_id: string;
  created_at: Date;
}

export interface SlotTemplate {
  id: string;
  tenant_id: string;
  day_of_week: number; // 0-6, Sunday = 0
  start_times_json: string[]; // Array of time strings like ["10:00", "12:00", "14:00"]
  open_time: string;
  close_time: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Blackout {
  id: string;
  tenant_id: string;
  start_date: Date;
  end_date: Date;
  reason: string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Addon {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  unit: string; // "per item", "per hour", etc.
  price: number;
  taxable: boolean;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  created_at: Date;
  updated_at: Date;
}

export interface Booking {
  id: string;
  tenant_id: string;
  customer_id: string;
  package_id: string;
  room_id: string;
  start_time: Date;
  end_time: Date;
  kids_count: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  deposit_due: number;
  deposit_paid: number;
  balance_due: number;
  balance_paid: number;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface BookingAddon {
  id: string;
  tenant_id: string;
  booking_id: string;
  addon_id: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
  created_at: Date;
}

export interface Payment {
  id: string;
  tenant_id: string;
  booking_id: string;
  type: 'deposit' | 'balance' | 'refund';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  clover_payment_id?: string;
  raw_webhook_json?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface Waiver {
  id: string;
  tenant_id: string;
  booking_id: string;
  signer_name: string;
  signer_email: string;
  signed_at: Date;
  method: 'online' | 'in_person';
  file_url?: string;
  signature_data?: Record<string, any>;
  created_at: Date;
}

// Booking flow types
export interface AvailabilitySlot {
  time_start: string;
  time_end: string;
  rooms: RoomAvailability[];
}

export interface RoomAvailability {
  room_id: string;
  room_name: string;
  max_kids: number;
  eligible: boolean;
  available: boolean;
}

export interface BookingRequest {
  tenant_slug: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  package_id: string;
  room_id: string;
  start_time: string;
  kids_count: number;
  addons?: Array<{
    addon_id: string;
    quantity: number;
  }>;
}

export interface PriceCalculation {
  base_price: number;
  extra_kids_price: number;
  addons_price: number;
  subtotal: number;
  tax: number;
  total: number;
  deposit_amount: number;
  balance_amount: number;
}