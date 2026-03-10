// Email service for sending OTP codes
// You can use: SendGrid, AWS SES, Nodemailer, etc.

// Example with Nodemailer (you'll need to install it: npm install nodemailer)
// import nodemailer from 'nodemailer';

export async function sendOtpEmail(email, otp) {
  // TODO: Configure your email service
  
  // Example with Nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  await transporter.sendMail({

    // For development, use ethereal.email if no real credentials
    if (!emailConfig.auth.user) {
      console.log('📧 Email: Using development mode (ethereal.email)');
      this.setupDevelopmentTransporter();
    } else {
      console.log('📧 Email: Using production SMTP');
      this.transporter = nodemailer.createTransport(emailConfig);
      this.isConfigured = true;
    }
  }

  async setupDevelopmentTransporter() {
    // Create test account for development
    const testAccount = await nodemailer.createTestAccount();
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    this.isConfigured = true;
    console.log('📧 Development email credentials:', testAccount);
  }

  async sendEmail(to, subject, html, text = null) {
    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });
  */

  console.log(`[DEV] Would send OTP ${otp} to ${phone}`);
  return true;
}
