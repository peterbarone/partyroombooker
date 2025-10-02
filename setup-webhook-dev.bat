@echo off
echo 🚀 Setting up Clover Webhooks for Local Development
echo ==================================================

REM Check if ngrok is installed
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ ngrok is not installed
    echo.
    echo Please install ngrok first:
    echo   Option 1: npm install -g ngrok
    echo   Option 2: Download from https://ngrok.com/
    echo   Option 3: choco install ngrok (Windows with Chocolatey)
    echo.
    pause
    exit /b 1
)

echo ✅ ngrok is installed

REM Check if the development server is running
curl -s http://localhost:3000 >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  Development server is not running on port 3000
    echo.
    echo Please start your development server first:
    echo   npm run dev
    echo.
    echo Then run this script again.
    pause
    exit /b 1
)

echo ✅ Development server is running on port 3000

echo.
echo 🌐 Starting ngrok tunnel...
echo    This will create a secure HTTPS tunnel to your local server
echo    Keep this terminal open while testing webhooks
echo.

REM Start ngrok in a new window
start "ngrok" cmd /c "ngrok http 3000"

REM Wait for ngrok to start
timeout /t 5 /nobreak >nul

REM Try to get the ngrok URL (this is a simplified approach)
echo ✅ ngrok tunnel should be created now!
echo.
echo 📍 To get your webhook URL:
echo    1. Check the ngrok terminal window that just opened
echo    2. Look for the HTTPS URL (e.g., https://abc123.ngrok.io)
echo    3. Your webhook URL will be: https://abc123.ngrok.io/api/clover-webhook
echo.
echo 🔧 Next steps:
echo    1. Copy the webhook URL from the ngrok window
echo    2. Go to your Clover Developer Dashboard
echo    3. Navigate to Webhooks settings
echo    4. Add webhook with URL: https://your-ngrok-url.ngrok.io/api/clover-webhook
echo    5. Set webhook secret: webhook_secret_partyroom_2024_secure_key_456789
echo    6. Subscribe to events: payment.completed, payment.failed, order.created
echo.
echo 🧪 Test your webhook:
echo    node test-webhook.js payment.completed https://your-ngrok-url.ngrok.io/api/clover-webhook
echo.
echo 🌐 ngrok web interface: http://localhost:4040
echo.
echo Press any key to exit (this will stop the script but leave ngrok running)
pause >nul