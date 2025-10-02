import { NextRequest, NextResponse } from 'next/server';
import { verifyCloverWebhook } from '@/lib/clover';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('clover-signature') || '';
    const webhookSecret = process.env.CLOVER_WEBHOOK_SECRET || '';

    // Verify webhook signature if secret is configured
    if (webhookSecret && !verifyCloverWebhook(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const payload = JSON.parse(body);
    console.log('Clover webhook received:', payload);

    // Handle different webhook types
    switch (payload.type) {
      case 'payment.completed':
        await handlePaymentCompleted(payload.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(payload.data);
        break;
      case 'order.created':
        await handleOrderCreated(payload.data);
        break;
      default:
        console.log('Unhandled webhook type:', payload.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentCompleted(data: any) {
  console.log('Payment completed:', data);
  
  // Here you would typically:
  // 1. Update booking status in database
  // 2. Send confirmation email
  // 3. Update inventory/availability
  
  const metadata = data.metadata;
  if (metadata?.bookingData) {
    try {
      const bookingData = JSON.parse(metadata.bookingData);
      console.log('Booking data from payment:', bookingData);
      
      // TODO: Save booking to database
      // await saveBookingToDatabase(bookingData, data);
      
      // TODO: Send confirmation email
      // await sendConfirmationEmail(bookingData, data);
      
    } catch (error) {
      console.error('Error processing booking data:', error);
    }
  }
}

async function handlePaymentFailed(data: any) {
  console.log('Payment failed:', data);
  
  // Handle failed payment
  // - Send notification to customer
  // - Log for follow-up
  // - Release any held inventory
}

async function handleOrderCreated(data: any) {
  console.log('Order created:', data);
  
  // Handle order creation
  // - Log order details
  // - Update internal tracking
}