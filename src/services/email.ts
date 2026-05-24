import { jobQueue } from './jobQueue';

export interface EmailPayload {
  to: string;
  template: string;
  data: Record<string, any>;
}

class EmailService {
  /**
   * Enqueue a verification email.
   */
  async sendVerificationEmail(to: string, token: string) {
    return jobQueue.enqueue('email', {
      to,
      template: 'verification',
      data: { token }
    });
  }

  /**
   * Enqueue a password reset email.
   */
  async sendPasswordResetEmail(to: string, token: string) {
    return jobQueue.enqueue('email', {
      to,
      template: 'password_reset',
      data: { token }
    });
  }

  /**
   * Enqueue a booking confirmation email.
   */
  async sendBookingConfirmation(to: string, bookingDetails: Record<string, any>) {
    return jobQueue.enqueue('email', {
      to,
      template: 'booking_confirmation',
      data: { bookingDetails }
    });
  }

  /**
   * Enqueue a billing receipt email.
   */
  async sendBillingReceipt(to: string, invoiceDetails: Record<string, any>) {
    return jobQueue.enqueue('email', {
      to,
      template: 'billing_receipt',
      data: { invoiceDetails }
    });
  }

  /**
   * Enqueue a system alert email to an admin/user.
   */
  async sendAlertEmail(to: string, alertDetails: Record<string, any>) {
    return jobQueue.enqueue('email', {
      to,
      template: 'system_alert',
      data: { alertDetails }
    });
  }
}

export const emailService = new EmailService();
