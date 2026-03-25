@echo off
echo =====================================
echo CivilBridge Email Setup Helper
echo =====================================
echo.
echo This script will help you set up email for OTP verification.
echo.
echo OPTION 1: Quick Gmail Setup
echo   1. Create a Gmail account or use existing one
echo   2. Enable 2-Factor Authentication
echo   3. Go to: https://myaccount.google.com/apppasswords
echo   4. Generate an App Password for "Mail"
echo   5. Copy the 16-character password
echo.
echo OPTION 2: Use Development Mode (Current)
echo   - Emails will be sent to Ethereal Email
echo   - Check console for preview URL after registration
echo   - No real email setup needed
echo.
echo To set up Gmail, create/edit your .env file in the back folder:
echo.
echo EMAIL_HOST=smtp.gmail.com
echo EMAIL_PORT=587
echo EMAIL_SECURE=false
echo EMAIL_USER=your_email@gmail.com
echo EMAIL_PASS=your_16_char_app_password
echo EMAIL_FROM=CivilBridge <your_email@gmail.com>
echo.
echo =====================================
echo.
echo Current Status: Development Mode (Ethereal Email)
echo.
echo To test registration:
echo 1. Start backend server
echo 2. Try registering a new account
echo 3. Check console for "Email preview URL"
echo 4. Click the URL to see the OTP email
echo.
echo Press any key to continue...
pause >nul
