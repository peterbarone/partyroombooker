// Clover Payment Integration Configuration

export interface CloverConfig {
  appId: string;
  environment: 'sandbox' | 'production';
  apiBaseUrl: string;
  checkoutBaseUrl: string;
}

export const cloverConfig: CloverConfig = {
  appId: process.env.CLOVER_APP_ID || '',
  environment: (process.env.CLOVER_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  apiBaseUrl: process.env.CLOVER_ENVIRONMENT === 'production' 
    ? 'https://api.clover.com' 
    : 'https://apisandbox.dev.clover.com',
  checkoutBaseUrl: process.env.CLOVER_ENVIRONMENT === 'production'
    ? 'https://checkout.clover.com'
    : 'https://checkout.sandbox.dev.clover.com'
};

export interface CloverCheckoutRequest {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
  };
  shoppingCart: {
    lineItems: Array<{
      name: string;
      price: number;
      quantity?: number;
      unitQty?: string;
    }>;
  };
  redirectUrl: string;
  metadata?: Record<string, any>;
}

export interface CloverWebhookPayload {
  type: string;
  data: {
    id: string;
    object: string;
    amount: number;
    currency: string;
    status: string;
    created: number;
    metadata?: Record<string, any>;
  };
}

export const createCloverCheckout = async (
  request: CloverCheckoutRequest,
  merchantId: string,
  apiToken: string
): Promise<{ checkoutUrl: string; paymentId: string }> => {
  const response = await fetch(`${cloverConfig.apiBaseUrl}/v1/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      ...request,
      merchant: { id: merchantId },
    }),
  });

  if (!response.ok) {
    throw new Error(`Clover API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    checkoutUrl: `${cloverConfig.checkoutBaseUrl}/invoices/${data.id}`,
    paymentId: data.id,
  };
};

export const verifyCloverWebhook = (
  payload: string,
  signature: string,
  secret: string
): boolean => {
  // Implement webhook signature verification
  // This would use HMAC-SHA256 to verify the webhook signature
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
};