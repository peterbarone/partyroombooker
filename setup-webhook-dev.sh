#!/bin/bash

# Clover Webhook Development Setup Script
# This script helps set up ngrok for local webhook testing

echo "🚀 Setting up Clover Webhooks for Local Development"
echo "=================================================="

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed"
    echo ""
    echo "Please install ngrok first:"
    echo "  Option 1: npm install -g ngrok"
    echo "  Option 2: Download from https://ngrok.com/"
    echo "  Option 3: brew install ngrok (macOS)"
    echo ""
    exit 1
fi

echo "✅ ngrok is installed"

# Check if the development server is running
if ! curl -s http://localhost:3000 > /dev/null; then
    echo "⚠️  Development server is not running on port 3000"
    echo ""
    echo "Please start your development server first:"
    echo "  npm run dev"
    echo ""
    echo "Then run this script again."
    exit 1
fi

echo "✅ Development server is running on port 3000"

# Start ngrok
echo ""
echo "🌐 Starting ngrok tunnel..."
echo "   This will create a secure HTTPS tunnel to your local server"
echo "   Keep this terminal open while testing webhooks"
echo ""

# Start ngrok and capture the URL
ngrok http 3000 --log=stdout &
NGROK_PID=$!

# Wait a moment for ngrok to start
sleep 3

# Get the ngrok URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok\.io')

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "   Please check if ngrok started correctly"
    exit 1
fi

echo "✅ ngrok tunnel created successfully!"
echo ""
echo "📍 Your webhook URL is:"
echo "   $NGROK_URL/api/clover-webhook"
echo ""
echo "🔧 Next steps:"
echo "   1. Copy the webhook URL above"
echo "   2. Go to your Clover Developer Dashboard"
echo "   3. Navigate to Webhooks settings"
echo "   4. Add webhook with URL: $NGROK_URL/api/clover-webhook"
echo "   5. Set webhook secret: webhook_secret_partyroom_2024_secure_key_456789"
echo "   6. Subscribe to events: payment.completed, payment.failed, order.created"
echo ""
echo "🧪 Test your webhook:"
echo "   node test-webhook.js payment.completed $NGROK_URL/api/clover-webhook"
echo ""
echo "🌐 ngrok web interface: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok when done testing"

# Wait for user to stop
wait $NGROK_PID