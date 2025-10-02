import { NextRequest, NextResponse } from 'next/server';
import { createCloverCheckout } from '@/lib/clover';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tenant, customer, lineItems, amount, bookingData } = body;

    // Validate required fields
    if (!tenant || !customer || !lineItems || !amount || !bookingData) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate customer email
    if (!customer.email || !customer.firstName) {
      return NextResponse.json(
        { success: false, error: 'Customer email and first name are required' },
        { status: 400 }
      );
    }

    // Create a unique order reference
    const orderRef = `${tenant}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Prepare Clover checkout data
    const checkoutData = {
      customer,
      lineItems,
      shoppingCart: {
        lineItems: lineItems.map((item: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          item: {
            id: Math.random().toString(36).substr(2, 9),
            name: item.name,
            price: item.price,
          },
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          unitQty: item.unitQty || "1",
        })),
      },
      redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${tenant}/booking-success?ref=${orderRef}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/${tenant}/book?step=4&error=payment_cancelled`,
      orderRef,
      metadata: {
        tenant,
        bookingData: JSON.stringify(bookingData),
        orderRef,
      },
    };

    console.log('Creating Clover checkout with data:', JSON.stringify(checkoutData, null, 2));

    // Get Clover credentials from environment
    const merchantId = process.env.CLOVER_MERCHANT_ID;
    const apiToken = process.env.CLOVER_API_TOKEN;

    if (!merchantId || !apiToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Clover credentials not configured' 
        },
        { status: 500 }
      );
    }

    try {
      // Create Clover checkout
      const result = await createCloverCheckout(checkoutData, merchantId, apiToken);

      return NextResponse.json({
        success: true,
        checkoutUrl: result.checkoutUrl,
        paymentId: result.paymentId,
        orderRef,
      });
    } catch (cloverError) {
      console.error('Clover checkout creation failed:', cloverError);
      return NextResponse.json(
        { 
          success: false, 
          error: cloverError instanceof Error ? cloverError.message : 'Failed to create payment session',
          details: cloverError 
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}