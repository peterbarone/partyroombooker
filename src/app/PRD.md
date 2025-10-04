PRD: Party Booking App

Project Goal
Build a self-hosted web application for The Family Fun Factory that allows customers to book birthday parties online. The system must manage rooms, packages, time slots with cleanup buffers, deposits through Clover, and multi-tenant extensibility.

1. Stakeholders

Business owner – wants smooth booking, fewer phone calls, accurate deposits.

Staff – need clear booking calendar, policies enforced, easy refunds/reschedules.

Customers (parents/guardians) – want a simple online flow to choose date/time, room, and pay deposit.

2. Core Requirements
   Booking Flow

Customer Steps to book a party:

childs name

childs age

Date

Party package

Number of kids

System checks available time slots (2 hours + 30 min buffer).

Customer chooses a room (eligible by package + capacity).

Customer provides parent/guardian info.

System calculates price (base + extra kids + add-ons).

Customer pays 50% deposit online via Clover Hosted Checkout.

Booking marked confirmed after Clover webhook succeeds.

Balance is due on the day of the event (paid on Clover POS).

Waiver signed online or in person (linked to booking).

3. Business Rules

Deposit: 50% online, balance due at event.

Refunds:

≥7 days before: full refund or reschedule.

<7 days: deposit non-refundable, but one reschedule within 60 days allowed.

No-show: deposit forfeited.

Buffer: 30 minutes between parties for cleanup.

Tax: 8.75% NY State sales tax applied to taxable items.

Multi-tenant ready: Each tenant (location) has its own rooms, packages, policies, integrations.

4. Tech Stack

Frontend: Next.js 15 + Tailwind (multi-tenant, path-based routing /[tenant]/...).

Backend: Supabase (Postgres + RLS + Edge Functions).

Payments: Clover Hosted Checkout + Webhook integration.

Hosting: Self-hosted Supabase + Next.js on VPS (Coolify).

Storage: Supabase buckets for waiver files.

5. Database Schema (Supabase / Postgres)

Tables (with RLS):

tenants (slug, name, timezone, currency, active)

tenant_policies (buffer_minutes, refund_days_full, reschedule_window_days, tax_rate)

tenant_integrations (clover creds, webhook secret)

rooms (name, max_kids, active)

packages (name, base_price, base_kids, extra_kid_price, duration_min, includes_json)

package_rooms (package ↔ room mapping)

slot_templates (dow, start_times JSON, open/close times)

blackouts (date range, reason)

addons (name, unit, price, taxable)

customers (parent/guardian contact info)

bookings (customer_id, package_id, room_id, start_time, end_time, kids_count, status, deposit_due/paid, balance_due/paid, notes)

booking_addons (booking_id, addon_id, qty, unit_price, taxable)

payments (booking_id, type, amount, status, clover_payment_id, raw_webhook_json)

waivers (booking_id, signer_name/email, signed_at, method, file_url)

Indexes + unique constraints:

bookings: unique(tenant_id, room_id, start_time)

package_rooms: unique(tenant_id, package_id, room_id)

waivers: unique(tenant_id, booking_id)

6. Edge Functions
   availability

Input: tenantSlug, date (YYYY-MM-DD), packageId, kids

Output: List of slots {timeStart, timeEnd, rooms:[{roomId, roomName, maxKids, eligible, available}]}

Logic:

Pull slot templates for DOW.

Apply package eligibility + capacity.

Check existing bookings with buffer.

createBooking

Input: tenantSlug, customer (name/email/phone), packageId, roomId, startTime, kidsCount

Logic:

Validate slot is available.

Compute price & 50% deposit.

Upsert customer.

Create pending booking.

Call Clover API for Hosted Checkout.

Return checkoutUrl.

cloverWebhook

Triggered by Clover.

Verifies secret signature.

Finds booking by state payload.

Records payment row.

Marks booking confirmed if deposit succeeded.

7. Frontend (Next.js)
   Pages

/[tenant]/book

Step 1: Pick date, package, kids → check availability.

Step 2: Choose time + room.

Step 3: Enter parent/guardian info.

Step 4: Redirect to Clover deposit checkout.

/[tenant]/waiver/[bookingId]

Capture e-signature (name/email/date, draw or check box).

Upload/store signed waiver (file or JSON).

Admin (later)

Calendar view (bookings with status).

Customer lookup.

Reporting (sales, deposits, top customers).

8. Security / Permissions

JWT claims: { tenant_id, role }

Roles:

admin/staff → full R/W for tenant data.

customer → can read/insert own bookings only.

anon → read catalog only (or use functions).

Edge Functions use service role to bypass RLS.

9. Non-Functional Requirements

Mobile-friendly booking flow.

Self-hosted (Supabase + Next.js) deployable on VPS.

Scalable to multiple tenants.

Audit trail in DB for payments/refunds.

Exportable CSV reports.

10. Next Steps (MVP)

Apply schema (SQL).

Deploy Supabase functions: availability, createBooking, cloverWebhook.

Build Next.js booking page.

Integrate real Clover Hosted Checkout.

Add waiver page.

Deploy to book.thefamilyfunfactory.com.
