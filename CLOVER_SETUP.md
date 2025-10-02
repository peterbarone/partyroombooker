# Clover Payment Integration Setup

This document explains how to configure the Clover payment integration for the Party Room Booker application.

## Overview

The application integrates with Clover's payment system to process party booking payments. Customers can choose to:

- Pay a 50% deposit upfront (balance due at event)
- Pay the full amount upfront

## Environment Setup

Add the following environment variables to your `.env` file:

```env
# Clover Integration
CLOVER_APP_ID=your_clover_app_id
CLOVER_APP_SECRET=your_clover_app_secret
CLOVER_ENVIRONMENT=sandbox  # Use 'production' for live payments
CLOVER_MERCHANT_ID=your_merchant_id
CLOVER_API_TOKEN=your_api_token
CLOVER_WEBHOOK_SECRET=your_webhook_secret

# Application URLs
NEXT_PUBLIC_BASE_URL=http://localhost:3000  # Update for production
```

## Clover Setup Steps

### 1. Create a Clover Developer Account

1. Go to [Clover Developer Portal](https://clover.com/developers)
2. Sign up for a developer account
3. Create a new app

### 2. Configure Your App

1. In the Clover Developer Dashboard:
   - Set app name: "Party Room Booker"
   - Set app URL: Your domain (e.g., `https://yourapp.com`)
   - Configure permissions:
     - Read orders
     - Write orders
     - Process payments

### 3. Get API Credentials

1. **App ID**: Found in your app settings (already configured: `J24ENBBZETA4C`)
2. **App Secret**: Found in your app settings
3. **Merchant ID**: Your test/production merchant ID
4. **API Token**: Generate from merchant dashboard

### 4. Webhook Configuration

1. In Clover Dashboard, go to Webhooks
2. Add webhook URL: `https://yourapp.com/api/clover-webhook`
3. Subscribe to events:
   - `payment.completed`
   - `payment.failed`
   - `order.created`

## Payment Flow

### 1. Customer Journey

1. Customer completes booking wizard (steps 1-3)
2. Customer reaches payment step and chooses deposit or full payment
3. System creates Clover checkout session with line items
4. Customer is redirected to Clover checkout page
5. After payment, customer returns to booking success page

### 2. Technical Flow

1. `BookingWizard.tsx` calls `/api/create-payment`
2. API creates Clover checkout session with line items
3. Customer redirected to Clover checkout URL
4. On completion, Clover redirects to `/[tenant]/booking-success`
5. Webhooks process payment confirmations

## API Endpoints

### POST `/api/create-payment`

Creates a Clover checkout session for the booking.

**Request Body:**

```json
{
  "tenant": "tenant-name",
  "customer": {
    "email": "customer@email.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "lineItems": [
    {
      "name": "Birthday Bash Package",
      "price": 15000, // Price in cents
      "quantity": 1,
      "unitQty": "1"
    }
  ],
  "amount": 15000, // Total amount in cents
  "bookingData": {
    "date": "2024-02-15",
    "time": "2:00 PM",
    "package": "Birthday Bash",
    "room": "Party Room A",
    "kidsCount": 8,
    "addons": []
  }
}
```

### POST `/api/clover-webhook`

Handles Clover webhook events for payment processing.

## Security Notes

1. **Webhook Verification**: Webhooks are verified using HMAC-SHA256
2. **Environment Variables**: Never commit sensitive credentials to version control
3. **HTTPS Required**: Clover requires HTTPS for webhooks in production
4. **Test Mode**: Use sandbox environment for development

## Testing

### Sandbox Testing

1. Use Clover's test credit card numbers
2. Test successful payments: `4111111111111111`
3. Test failed payments: `4000000000000002`

### Production Checklist

- [ ] Update `CLOVER_ENVIRONMENT=production`
- [ ] Configure production merchant credentials
- [ ] Set up production webhook URLs with HTTPS
- [ ] Test with real payment methods
- [ ] Verify webhook signature validation

## Troubleshooting

### Common Issues

1. **Payment creation fails**

   - Check merchant ID and API token
   - Verify line item prices are in cents
   - Ensure required customer fields are provided

2. **Webhook not receiving events**

   - Verify webhook URL is accessible
   - Check webhook secret configuration
   - Ensure HTTPS in production

3. **Redirect issues**
   - Verify `NEXT_PUBLIC_BASE_URL` is correct
   - Check redirect URLs in Clover checkout creation

### Debug Mode

Enable debug logging by setting:

```env
DEBUG=clover:*
```

## Payment Line Items

The system automatically creates line items for:

- Base package price
- Extra children charges
- Add-on items
- Sales tax (8.75% NY State)
- Deposit adjustments (for 50% payments)

Example line items for a birthday party:

```json
[
  {
    "name": "Birthday Bash Package",
    "price": 12000, // $120.00 in cents
    "quantity": 1
  },
  {
    "name": "Extra Children (2)",
    "price": 3000, // $30.00 in cents
    "quantity": 1
  },
  {
    "name": "Sales Tax (8.75%)",
    "price": 1313, // $13.13 in cents
    "quantity": 1
  }
]
```

## Support

For Clover integration issues:

- [Clover Developer Docs](https://docs.clover.com/)
- [Clover Support](https://help.clover.com/developers/)

For application-specific issues, contact the development team.
