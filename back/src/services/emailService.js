// Production Email Service Configuration
import nodemailer from 'nodemailer';

// Production Email Configuration
const emailConfig = {
  // SMTP Configuration (Production)
  production: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || 'noreply@civilbridge.com',
      pass: process.env.SMTP_PASS || 'your-app-password'
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  
  // Development Configuration
  development: {
    host: 'localhost',
    port: 1025,
    secure: false,
    auth: false
  }
};

// Email Templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to CivilBridge - {{firstName}}!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to CivilBridge</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #00f2ff, #6366f1); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { background: #00f2ff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to CivilBridge, {{firstName}}!</h1>
            <p>Your construction management journey starts here</p>
          </div>
          <div class="content">
            <p>Dear {{firstName}},</p>
            <p>Thank you for joining CivilBridge! We're excited to help you streamline your construction projects.</p>
            <p>With CivilBridge, you can:</p>
            <ul>
              <li>Manage projects efficiently</li>
              <li>Track progress in real-time</li>
              <li>Collaborate with your team</li>
              <li>Analyze performance metrics</li>
            </ul>
            <p>Click the button below to get started:</p>
            <a href="{{loginUrl}}" class="button">Login to CivilBridge</a>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <p>Best regards,<br/>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. All rights reserved.</p>
            <p>This email was sent to {{email}} because you registered for a CivilBridge account.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  projectAssignment: {
    subject: 'New Project Assignment: {{projectName}}',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Project Assignment</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .project-info { background: #e5f5e5; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Project Assignment</h1>
            <p>You've been assigned to a new project!</p>
          </div>
          <div class="content">
            <p>Dear {{professionalName}},</p>
            <p>You have been assigned to a new project in the CivilBridge system.</p>
            
            <div class="project-info">
              <h3>Project Details:</h3>
              <p><strong>Project Name:</strong> {{projectName}}</p>
              <p><strong>Client:</strong> {{clientName}}</p>
              <p><strong>Start Date:</strong> {{startDate}}</p>
              <p><strong>Estimated Duration:</strong> {{duration}}</p>
            </div>
            
            <p>Please review the project details and confirm your availability.</p>
            <a href="{{projectUrl}}" class="button">View Project Details</a>
            
            <p>If you have any questions about this assignment, please contact the project manager.</p>
            <p>Best regards,<br/>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  invoiceReminder: {
    subject: 'Invoice {{invoiceNumber}} - Payment Reminder',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Reminder</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .invoice-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Payment Reminder</h1>
            <p>Invoice {{invoiceNumber}} is due soon</p>
          </div>
          <div class="content">
            <p>Dear {{clientName}},</p>
            <p>This is a friendly reminder that your invoice payment is due soon.</p>
            
            <div class="invoice-info">
              <h3>Invoice Details:</h3>
              <p><strong>Invoice Number:</strong> {{invoiceNumber}}</p>
              <p><strong>Amount:</strong> \${{amount}}</p>
              <p><strong>Due Date:</strong> {{dueDate}}</p>
              <p><strong>Project:</strong> {{projectName}}</p>
            </div>
            
            <p>Please ensure payment is made on time to avoid any service interruptions.</p>
            <a href="{{paymentUrl}}" class="button">Pay Invoice Now</a>
            
            <p>If you have any questions about this invoice, please contact our billing department.</p>
            <p>Best regards,<br/>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  },

  projectCompletion: {
    subject: 'Project {{projectName}} - Completed!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Project Completed</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1, #4f46e5); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .project-info { background: #e0e7ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .button { background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Project Completed! 🎉</h1>
            <p>Your project has been successfully completed</p>
          </div>
          <div class="content">
            <p>Dear {{clientName}},</p>
            <p>We're pleased to inform you that your project has been completed successfully!</p>
            
            <div class="project-info">
              <h3>Project Summary:</h3>
              <p><strong>Project Name:</strong> {{projectName}}</p>
              <p><strong>Completion Date:</strong> {{completionDate}}</p>
              <p><strong>Final Report:</strong> Available for download</p>
              <p><strong>Next Steps:</strong> {{nextSteps}}</p>
            </div>
            
            <p>You can now access the final project report and all deliverables.</p>
            <a href="{{finalReportUrl}}" class="button">Download Final Report</a>
            
            <p>Thank you for choosing CivilBridge for your construction management needs. We hope you're satisfied with the results!</p>
            <p>Best regards,<br/>The CivilBridge Team</p>
          </div>
          <div class="footer">
            <p>© 2024 CivilBridge. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
};

// Email Service Class
class EmailService {
  constructor() {
    this.transporter = null;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.initialize();
  }

  initialize() {
    try {
      const config = this.isProduction ? emailConfig.production : emailConfig.development;
      this.transporter = nodemailer.createTransport(config);
      
      // Verify connection in production
      if (this.isProduction) {
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ Email service configuration error:', error);
          } else {
            console.log('✅ Email service is ready to send messages');
          }
        });
      } else {
        console.log('📧 Email service running in development mode (using Ethereal)');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendEmail(to, templateName, variables = {}) {
    try {
      const template = emailTemplates[templateName];
      if (!template) {
        throw new Error(`Email template '${templateName}' not found`);
      }

      // Process template variables
      let subject = template.subject;
      let html = template.html;

      // Replace variables in subject and HTML
      Object.keys(variables).forEach(key => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        subject = subject.replace(regex, variables[key]);
        html = html.replace(regex, variables[key]);
      });

      const mailOptions = {
        from: this.isProduction ? '"CivilBridge" <noreply@civilbridge.com>' : '"CivilBridge Dev" <dev@civilbridge.com>',
        to: to,
        subject: subject,
        html: html
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log('✅ Email sent successfully:', info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        preview: this.isProduction ? null : nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    return this.sendEmail(user.email, 'welcome', {
      firstName: user.fullName.split(' ')[0],
      loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/login`
    });
  }

  async sendProjectAssignmentEmail(professional, project) {
    return this.sendEmail(professional.email, 'projectAssignment', {
      professionalName: professional.fullName,
      projectName: project.name,
      clientName: project.client,
      startDate: project.startDate,
      duration: project.duration,
      projectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/${project.id}`
    });
  }

  async sendInvoiceReminderEmail(client, invoice) {
    return this.sendEmail(client.email, 'invoiceReminder', {
      clientName: client.fullName,
      invoiceNumber: invoice.number,
      amount: invoice.amount,
      dueDate: invoice.dueDate,
      projectName: invoice.projectName,
      paymentUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payments/${invoice.id}`
    });
  }

  async sendProjectCompletionEmail(client, project) {
    return this.sendEmail(client.email, 'projectCompletion', {
      clientName: client.fullName,
      projectName: project.name,
      completionDate: project.completionDate,
      nextSteps: project.nextSteps,
      finalReportUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/projects/${project.id}/report`
    });
  }

  // Test email function
  async sendTestEmail(to = 'samuelnizeyimana505@gmail.com') {
    try {
      const result = await this.sendEmail(to, 'welcome', {
        firstName: 'Samuel',
        loginUrl: 'http://localhost:3000/login'
      });
      
      console.log('📧 Test email sent successfully!');
      if (result.preview) {
        console.log('🔍 Preview URL:', result.preview);
      }
      
      return result;
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  }

  // Get email service status
  getStatus() {
    return {
      isProduction: this.isProduction,
      isConfigured: !!this.transporter,
      availableTemplates: Object.keys(emailTemplates),
      config: this.isProduction ? emailConfig.production : emailConfig.development
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export the service as ES module
export default emailService;

