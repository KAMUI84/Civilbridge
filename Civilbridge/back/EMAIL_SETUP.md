# Email Setup Guide for CivilBridge

## 🚧 Quick Setup for Email Verification

To make the OTP email verification work properly, you need to configure email settings. Follow these steps:

### Option 1: Gmail Setup (Recommended)

1. **Create a Gmail Account** (or use existing one)
2. **Enable 2-Factor Authentication** on the Gmail account
3. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" for the app
   - Generate a 16-character password
4. **Update your `.env` file** in the `back/` folder:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_character_app_password
EMAIL_FROM=CivilBridge <your_email@gmail.com>
```

### Option 2: Use Ethereal Email (Development Only)

If you don't want to set up Gmail right now, the system will automatically use Ethereal Email for development.

**To see the emails:**
1. Start the backend server
2. Look for the "Development email credentials" message in the console
3. Visit the preview URL shown in the console
4. You'll see the OTP email there

### Option 3: Other Email Services

You can use any SMTP service. Update these values in your `.env`:

```env
# Example for Outlook/Hotmail
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
EMAIL_FROM=CivilBridge <your_email@outlook.com>
```

## 🔧 Testing the Email System

After setting up email:

1. **Restart the backend server** (`npm run dev`)
2. **Try registering** a new account
3. **Check your email** for the OTP code
4. **Enter the OTP** to complete registration

## 🐛 Troubleshooting

### "Email not working"?
- Check that EMAIL_USER and EMAIL_PASS are set correctly
- For Gmail: Make sure you're using an App Password, not your regular password
- Make sure 2FA is enabled on the Gmail account

### "No email received"?
- Check your spam folder
- Make sure the email address is correct
- Try restarting the backend server

### "Development mode" message?
- This means EMAIL_USER or EMAIL_PASS are not set
- Set up proper email credentials as shown above

## 📝 Current Status

The email system is configured to:
- ✅ Send OTP verification codes
- ✅ Handle both development and production email services
- ✅ Use professional email templates
- ✅ Log preview URLs for development

Once you configure the email settings, the registration flow will work:
1. User enters email → OTP sent to email
2. User checks email → Gets OTP code
3. User enters OTP → Account created and logged in

## 🚀 Next Steps

1. Configure your email settings in `.env`
2. Restart the backend server
3. Test the registration flow
4. Verify you receive OTP emails in your inbox
