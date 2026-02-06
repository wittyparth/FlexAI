import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

// SMTP Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const FROM_EMAIL = process.env.FROM_EMAIL || SMTP_USER;
const FROM_NAME = process.env.FROM_NAME || 'FitTrack';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASSWORD,
  },
});

// Check if email is configured
const isEmailConfigured = () => {
  return !!(SMTP_USER && SMTP_PASSWORD);
};

/**
 * Email Service - handles sending emails
 */
export const emailService = {
  /**
   * Send verification OTP email
   */
  async sendVerificationEmail(to: string, otp: string, firstName?: string) {
    if (!isEmailConfigured()) {
      logger.warn(`📧 Email not configured. Verification OTP for ${to}: ${otp}`);
      return { success: true, mocked: true };
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: 'Verify Your Email - FitTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0052FF 0%, #0039B3 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTrack</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Welcome${firstName ? `, ${firstName}` : ''}!</h2>
            <p style="color: #666; font-size: 16px;">
              Thank you for signing up for FitTrack. Please use the verification code below to verify your email:
            </p>
            <div style="background: white; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #0052FF; letter-spacing: 8px; font-size: 36px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 14px;">
              This code will expire in 15 minutes. If you didn't request this, please ignore this email.
            </p>
          </div>
          <div style="padding: 20px; text-align: center; background: #333;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} FitTrack. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`📧 Verification email sent to ${to}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send verification email to ${to}:`, error);
      // Don't throw - just log the OTP for development
      logger.warn(`📧 [Fallback] Verification OTP for ${to}: ${otp}`);
      return { success: false, error };
    }
  },

  /**
   * Send password reset OTP email
   */
  async sendPasswordResetEmail(to: string, otp: string, firstName?: string) {
    if (!isEmailConfigured()) {
      logger.warn(`📧 Email not configured. Password reset OTP for ${to}: ${otp}`);
      return { success: true, mocked: true };
    }

    const mailOptions = {
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject: 'Reset Your Password - FitTrack',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #0052FF 0%, #0039B3 100%); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0;">FitTrack</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #666; font-size: 16px;">
              Hi${firstName ? ` ${firstName}` : ''}, we received a request to reset your password. Use the code below to set a new password:
            </p>
            <div style="background: white; border-radius: 10px; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #0052FF; letter-spacing: 8px; font-size: 36px; margin: 0;">${otp}</h1>
            </div>
            <p style="color: #999; font-size: 14px;">
              This code will expire in 15 minutes. If you didn't request this, please ignore this email - your password will remain unchanged.
            </p>
          </div>
          <div style="padding: 20px; text-align: center; background: #333;">
            <p style="color: #999; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} FitTrack. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      logger.info(`📧 Password reset email sent to ${to}`);
      return { success: true };
    } catch (error) {
      logger.error(`Failed to send password reset email to ${to}:`, error);
      // Don't throw - just log the OTP for development
      logger.warn(`📧 [Fallback] Password reset OTP for ${to}: ${otp}`);
      return { success: false, error };
    }
  },

  /**
   * Verify SMTP connection
   */
  async verifyConnection() {
    if (!isEmailConfigured()) {
      logger.warn('📧 Email service not configured (SMTP_USER/SMTP_PASSWORD missing)');
      return false;
    }

    try {
      await transporter.verify();
      logger.info('📧 Email service connected');
      return true;
    } catch (error) {
      logger.error('📧 Email service connection failed:', error);
      return false;
    }
  },
};
