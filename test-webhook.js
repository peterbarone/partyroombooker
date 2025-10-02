#!/usr/bin/env node

/**
 * Webhook Test Script for Party Room Booker
 * 
 * This script helps test the Clover webhook endpoint locally.
 * Usage: node test-webhook.js [event-type] [webhook-url]
 */

const https = require('https');
const http = require('http');
const crypto = require('crypto');

// Configuration
const WEBHOOK_SECRET = 'webhook_secret_partyroom_2024_secure_key_456789';
const DEFAULT_WEBHOOK_URL = 'http://localhost:3000/api/clover-webhook';

// Sample webhook payloads
const samplePayloads = {
  'payment.completed': {
    type: 'payment.completed',
    data: {
      id: 'test-payment-' + Date.now(),
      object: 'payment',
      amount: 5000, // $50.00 in cents
      currency: 'USD',
      status: 'completed',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        tenant: 'thefamilyfunfactory',
        bookingData: JSON.stringify({
          date: '2024-02-15',
          time: '2:00 PM',
          package: 'Birthday Bash',
          room: 'Party Room A',
          kidsCount: 8,
          addons: []
        }),
        orderRef: 'thefamilyfunfactory-' + Date.now() + '-abc123'
      }
    }
  },
  
  'payment.failed': {
    type: 'payment.failed',
    data: {
      id: 'test-payment-failed-' + Date.now(),
      object: 'payment',
      amount: 5000,
      currency: 'USD',
      status: 'failed',
      created: Math.floor(Date.now() / 1000),
      failure_reason: 'card_declined',
      metadata: {
        tenant: 'thefamilyfunfactory',
        orderRef: 'thefamilyfunfactory-' + Date.now() + '-abc123'
      }
    }
  },
  
  'order.created': {
    type: 'order.created',
    data: {
      id: 'test-order-' + Date.now(),
      object: 'order',
      amount: 5000,
      currency: 'USD',
      status: 'created',
      created: Math.floor(Date.now() / 1000),
      metadata: {
        tenant: 'thefamilyfunfactory',
        orderRef: 'thefamilyfunfactory-' + Date.now() + '-abc123'
      }
    }
  }
};

function generateSignature(payload, secret) {
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

function sendWebhook(eventType, webhookUrl) {
  const payload = samplePayloads[eventType];
  
  if (!payload) {
    console.error('❌ Unknown event type:', eventType);
    console.log('Available event types:', Object.keys(samplePayloads).join(', '));
    process.exit(1);
  }
  
  const payloadString = JSON.stringify(payload, null, 2);
  const signature = generateSignature(payloadString, WEBHOOK_SECRET);
  
  console.log('🚀 Sending webhook:', eventType);
  console.log('📍 Target URL:', webhookUrl);
  console.log('🔑 Signature:', signature);
  console.log('📦 Payload:');
  console.log(payloadString);
  console.log('\n' + '='.repeat(50) + '\n');
  
  const url = new URL(webhookUrl);
  const isHttps = url.protocol === 'https:';
  const client = isHttps ? https : http;
  
  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payloadString),
      'clover-signature': signature,
      'User-Agent': 'CloverWebhookTest/1.0'
    }
  };
  
  const req = client.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log('✅ Response Status:', res.statusCode);
      console.log('📥 Response Headers:', res.headers);
      console.log('📄 Response Body:', responseData || '(empty)');
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log('\n🎉 Webhook test successful!');
      } else {
        console.log('\n❌ Webhook test failed!');
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Request error:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure your server is running: npm run dev');
    console.log('2. Check if the webhook URL is correct');
    console.log('3. For HTTPS URLs, ensure SSL certificate is valid');
  });
  
  req.write(payloadString);
  req.end();
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const eventType = args[0] || 'payment.completed';
  const webhookUrl = args[1] || DEFAULT_WEBHOOK_URL;
  
  console.log('🧪 Clover Webhook Test Script');
  console.log('===============================\n');
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node test-webhook.js [event-type] [webhook-url]');
    console.log('\nAvailable event types:');
    Object.keys(samplePayloads).forEach(type => {
      console.log(`  - ${type}`);
    });
    console.log('\nExamples:');
    console.log('  node test-webhook.js payment.completed');
    console.log('  node test-webhook.js payment.failed http://localhost:3000/api/clover-webhook');
    console.log('  node test-webhook.js payment.completed https://abc123.ngrok.io/api/clover-webhook');
    return;
  }
  
  sendWebhook(eventType, webhookUrl);
}

if (require.main === module) {
  main();
}

module.exports = { sendWebhook, generateSignature, samplePayloads };