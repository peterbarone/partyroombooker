# Clover Webhook Setup Guide

This guide walks you through setting up webhooks for the Party Room Booker application to receive real-time payment notifications from Clover.

## Prerequisites

- Clover Developer Account
- Your app deployed and accessible via HTTPS (required for production webhooks)
- Your Clover App ID: `J24ENBBZETA4C`

## Step 1: Access Clover Developer Dashboard

1. Go to [Clover Developer Portal](https://clover.com/developers)
2. Sign in with your developer account
3. Navigate to your "Party Room Booker" app

## Step 2: Configure Webhook URL

### For Development (Local Testing)

Since Clover requires HTTPS for webhooks, you'll need to use a tunneling service like ngrok for local development:

1. **Install ngrok** (if not already installed):

   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com/
   ```

2. **Start your local server**:

   ```bash
   npm run dev
   ```

3. **In a new terminal, create an ngrok tunnel**:

   ```bash
   ngrok http 3000
   ```

4. **Copy the HTTPS URL** from ngrok output (e.g., `https://abc123.ngrok.io`)

5. **Update your webhook URL in Clover Dashboard**:
   - Webhook URL: `https://abc123.ngrok.io/api/clover-webhook`

### For Production

Use your production domain:

- Webhook URL: `https://yourdomain.com/api/clover-webhook`

## Step 3: Configure Webhook in Clover Dashboard

1. **Navigate to Webhooks Section**:

   - In your app dashboard, go to "Webhooks" or "Web Configuration"
   - Click "Add Webhook" or "Configure Webhooks"

2. **Enter Webhook Details**:

   ```
   URL: https://your-domain.com/api/clover-webhook
   Secret: webhook_secret_partyroom_2024_secure_key_456789
   ```

3. **Select Events to Subscribe To**:
   Check these events:

   - ✅ `PAYMENT_COMPLETED` - When payment is successfully processed
   - ✅ `PAYMENT_FAILED` - When payment fails
   - ✅ `ORDER_CREATED` - When an order is created
   - ✅ `ORDER_UPDATED` - When an order is modified
   - ✅ `REFUND_CREATED` - When a refund is processed

4. **Set HTTP Method**: POST

5. **Save Configuration**

## Step 4: Test Webhook Configuration

### Manual Test

1. **Test Webhook Endpoint** using curl or Postman:

   ```bash
   curl -X POST https://your-domain.com/api/clover-webhook \
     -H "Content-Type: application/json" \
     -H "clover-signature: test-signature" \
     -d '{
       "type": "payment.completed",
       "data": {
         "id": "test-payment-123",
         "amount": 5000,
         "status": "completed",
         "metadata": {
           "bookingData": "{\"date\":\"2024-02-15\",\"package\":\"Birthday Bash\"}"
         }
       }
     }'
   ```

2. **Check Server Logs** to confirm webhook is received and processed

### Live Test

1. **Create a Test Payment** through your booking flow
2. **Monitor Server Logs** for webhook events
3. **Verify Payment Processing** in your application

## Step 5: Webhook Security Verification

The webhook endpoint automatically verifies signatures using the secret. Here's how it works:

```typescript
// In your webhook handler
const signature = request.headers.get("clover-signature") || "";
const webhookSecret = process.env.CLOVER_WEBHOOK_SECRET;

if (webhookSecret && !verifyCloverWebhook(body, signature, webhookSecret)) {
  return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
}
```

## Step 6: Webhook Event Handling

Your webhook endpoint handles these events:

### Payment Completed

```json
{
  "type": "payment.completed",
  "data": {
    "id": "payment-id",
    "amount": 5000,
    "currency": "USD",
    "status": "completed",
    "metadata": {
      "tenant": "thefamilyfunfactory",
      "bookingData": "{...}",
      "orderRef": "tenant-timestamp-ref"
    }
  }
}
```

### Payment Failed

```json
{
  "type": "payment.failed",
  "data": {
    "id": "payment-id",
    "amount": 5000,
    "status": "failed",
    "reason": "card_declined"
  }
}
```

## Troubleshooting

### Common Issues

1. **Webhook Not Receiving Events**:

   - ✅ Verify webhook URL is accessible via HTTPS
   - ✅ Check ngrok is running for local development
   - ✅ Confirm webhook is saved in Clover dashboard
   - ✅ Check server logs for errors

2. **Signature Verification Failing**:

   - ✅ Verify webhook secret matches in both Clover and your `.env`
   - ✅ Ensure secret is exactly: `webhook_secret_partyroom_2024_secure_key_456789`
   - ✅ Check for extra spaces or characters

3. **Events Not Processing**:
   - ✅ Review server logs for processing errors
   - ✅ Verify event types match your switch statement
   - ✅ Check JSON parsing of webhook payload

### Debug Webhook Issues

1. **Enable Debug Logging**:

   ```bash
   export DEBUG=webhook:*
   npm run dev
   ```

2. **Log All Webhook Requests**:
   Add temporary logging to your webhook handler:

   ```typescript
   console.log("Webhook received:", {
     headers: Object.fromEntries(request.headers.entries()),
     body: body,
     signature: signature,
   });
   ```

3. **Test with Webhook Testing Tools**:
   - Use [webhook.site](https://webhook.site) to test webhook delivery
   - Use [ngrok inspector](http://localhost:4040) to see webhook requests

## Environment Variables Checklist

Ensure these are set in your `.env` file:

```env
# Clover Integration
CLOVER_APP_ID=J24ENBBZETA4C
CLOVER_APP_SECRET=195c8ce8-13c2-e2b4-2eb9-e165fe6198d0
CLOVER_ENVIRONMENT=sandbox
CLOVER_MERCHANT_ID=RCTSTAVI0010002
CLOVER_API_TOKEN=bf965ffe-097d-ae20-7159-d01fbd3764d0
CLOVER_WEBHOOK_SECRET=webhook_secret_partyroom_2024_secure_key_456789

# Application URLs
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Production Deployment Checklist

Before going live:

- [ ] Update `CLOVER_ENVIRONMENT=production`
- [ ] Configure production Clover merchant credentials
- [ ] Set production webhook URL with HTTPS
- [ ] Test webhook with production credentials
- [ ] Verify signature validation is working
- [ ] Test complete payment flow end-to-end
- [ ] Set up monitoring for webhook failures

## Monitoring Webhook Health

Consider implementing:

1. **Webhook Failure Alerts**: Monitor for failed webhook processing
2. **Payment Status Reconciliation**: Periodic checks to ensure payment states match
3. **Webhook Replay**: Ability to replay failed webhook events
4. **Rate Limiting**: Protect webhook endpoint from abuse

## Support Resources

- [Clover Webhook Documentation](https://docs.clover.com/reference/webhooks)
- [Clover Developer Community](https://community.clover.com/)
- [ngrok Documentation](https://ngrok.com/docs)

---

## Quick Setup Summary

1. **Set webhook secret** in `.env`: `CLOVER_WEBHOOK_SECRET=webhook_secret_partyroom_2024_secure_key_456789`
2. **Start ngrok** for local development: `ngrok http 3000`
3. **Configure webhook** in Clover Dashboard: `https://your-ngrok-url.ngrok.io/api/clover-webhook`
4. **Subscribe to events**: payment.completed, payment.failed, order.created
5. **Test webhook** with a sample payment
6. **Monitor logs** to confirm webhook processing

Your webhook endpoint is ready at: `/api/clover-webhook`
