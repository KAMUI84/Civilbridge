import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.initializeTransporter();
  }

  initializeTransporter() {
    // Use environment variables for email configuration
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    };

    // For development, use ethereal.email if no real credentials
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      console.log('📧 Email: No credentials found, using development mode (ethereal.email)');
      this.setupDevelopmentTransporter();
    } else {
      console.log('📧 Email: Using production SMTP with:', emailConfig.auth.user);
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

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || '"CivilBridge" <noreply@civilbridge.rw>',
        to: Array.isArray(to) ? to.join(', ') : to,
        subject,
        html,
        ...(text && { text })
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      // Log preview URL for development
      if (process.env.NODE_ENV !== 'production') {
        console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
      }

      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('📧 Email send error:', error);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  async sendVerificationEmail(email, otp, firstName = null) {
    const subject = 'Verify Your CivilBridge Account';
    const html = this.getVerificationTemplate(otp, firstName);
    
    return this.sendEmail(email, subject, html);
  }

  async sendWelcomeEmail(email, firstName = null) {
    const subject = 'Welcome to CivilBridge!';
    const html = this.getWelcomeTemplate(firstName);
    
    return this.sendEmail(email, subject, html);
  }

  getVerificationTemplate(otp, firstName) {
    const name = firstName || 'there';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0c1220; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7f8fb; }
          .otp { background: #eef0f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #64708a; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ CivilBridge</h1>
            <p>Your Construction Project Partner</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>Thank you for registering with CivilBridge. To complete your registration, please verify your email address using the code below:</p>
            <div class="otp">${otp}</div>
            <p>This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.</p>
            <p>Best regards,<br>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. Building Rwanda's Future.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendPasswordResetEmail(email, resetToken, firstName = null) {
    const subject = 'Reset Your CivilBridge Password';
    const html = this.getPasswordResetTemplate(resetToken, firstName);
    
    return this.sendEmail(email, subject, html);
  }

  getPasswordResetTemplate(resetToken, firstName) {
    const name = firstName || 'there';
    const resetUrl = `http://localhost:5175/reset-password?token=${resetToken}`;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0c1220; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7f8fb; }
          .reset-button { 
            display: inline-block; 
            background: #1d4ed8; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 6px; 
            margin: 20px 0; 
          }
          .footer { text-align: center; padding: 20px; color: #64708a; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ CivilBridge</h1>
            <p>Your Construction Project Partner</p>
          </div>
          <div class="content">
            <h2>Hello ${name}!</h2>
            <p>We received a request to reset your password for your CivilBridge account. Click the button below to reset your password:</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="reset-button">Reset Password</a>
            </div>
            <p>This link will expire in 15 minutes. If you didn't request this password reset, please ignore this email.</p>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #1d4ed8;">${resetUrl}</p>
            <p>Best regards,<br>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. Building Rwanda's Future.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTemplate(firstName) {
    const name = firstName || 'there';
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to CivilBridge</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0c1220; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f7f8fb; }
          .footer { text-align: center; padding: 20px; color: #64708a; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ CivilBridge</h1>
            <p>Your Construction Project Partner</p>
          </div>
          <div class="content">
            <h2>Welcome ${name}! 🎉</h2>
            <p>Your CivilBridge account is now active! You can start:</p>
            <ul>
              <li>📋 Creating construction projects</li>
              <li>💰 Generating cost estimates</li>
              <li>🏛️ Getting architectural recommendations</li>
              <li>👥 Connecting with verified experts</li>
            </ul>
            <p>Ready to start building? <a href="http://localhost:5175/dashboard">Go to Dashboard</a></p>
            <p>Best regards,<br>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. Building Rwanda's Future.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
