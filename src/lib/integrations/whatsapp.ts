/**
 * WhatsApp Integration for Jeen Mata Impex
 * 
 * This module provides WhatsApp messaging capabilities for:
 * - Dealer notifications
 * - Order confirmations
 * - Shipment updates
 * - General business communication
 */

interface WhatsAppConfig {
  apiUrl: string;
  accessToken: string;
  phoneNumberId: string;
  businessPhoneNumber: string;
  webhookVerifyToken: string;
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
}

interface WhatsAppResponse {
  messaging_product: string;
  contacts: Array<{
    input: string;
    wa_id: string;
  }>;
  messages: Array<{
    id: string;
  }>;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0',
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessPhoneNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '+977-9876543210',
      webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || ''
    };
  }

  /**
   * Send a text message via WhatsApp
   */
  async sendTextMessage(to: string, message: string): Promise<WhatsAppResponse | null> {
    try {
      const payload: WhatsAppMessage = {
        to: this.formatPhoneNumber(to),
        type: 'text',
        text: {
          body: message
        }
      };

      const response = await fetch(
        `${this.config.apiUrl}/${this.config.phoneNumberId}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
      return null;
    }
  }

  /**
   * Send dealer welcome message
   */
  async sendDealerWelcome(dealerInfo: {
    name: string;
    businessName: string;
    phone: string;
  }): Promise<boolean> {
    const message = `🎉 Welcome to Jeen Mata Impex!

Dear ${dealerInfo.name},

Your dealer account for "${dealerInfo.businessName}" has been approved! 

✅ You can now:
• Browse our complete product catalog
• Request quotes for bulk orders
• Track your shipments in real-time
• Access dealer-only pricing

Login to your account: https://jeenmataimpex.com/dealer/login

For support, contact us:
📞 +977-1-4567890
📧 info@jeenmataimpex.com

Thank you for choosing Jeen Mata Impex!`;

    const result = await this.sendTextMessage(dealerInfo.phone, message);
    return result !== null;
  }

  /**
   * Send order confirmation message
   */
  async sendOrderConfirmation(orderInfo: {
    dealerName: string;
    phone: string;
    orderId: string;
    totalItems: number;
    estimatedValue: number;
  }): Promise<boolean> {
    const message = `📋 Order Confirmation - Jeen Mata Impex

Dear ${orderInfo.dealerName},

Your inquiry has been received successfully!

🔢 Order ID: ${orderInfo.orderId}
📦 Total Items: ${orderInfo.totalItems}
💰 Estimated Value: NPR ${orderInfo.estimatedValue.toLocaleString()}

Our team will review your inquiry and send you a detailed quote within 24 hours.

Track your order: https://jeenmataimpex.com/dealer/orders

Thank you for your business!`;

    const result = await this.sendTextMessage(orderInfo.phone, message);
    return result !== null;
  }

  /**
   * Send shipment update message
   */
  async sendShipmentUpdate(shipmentInfo: {
    dealerName: string;
    phone: string;
    trackingNumber: string;
    status: string;
    eta?: string;
  }): Promise<boolean> {
    const statusEmoji = {
      'Booked': '📋',
      'In Transit': '🚛',
      'At Port': '🚢',
      'Customs': '🏛️',
      'In Warehouse': '📦'
    }[shipmentInfo.status] || '📍';

    const message = `${statusEmoji} Shipment Update - Jeen Mata Impex

Dear ${shipmentInfo.dealerName},

Tracking #: ${shipmentInfo.trackingNumber}
Status: ${shipmentInfo.status}
${shipmentInfo.eta ? `ETA: ${shipmentInfo.eta}` : ''}

${shipmentInfo.status === 'In Warehouse' ? 
  '🎉 Your shipment has arrived! Contact us to arrange pickup.' :
  'We\'ll keep you updated on any status changes.'
}

Track shipment: https://jeenmataimpex.com/dealer/shipments

Questions? Reply to this message or call +977-1-4567890`;

    const result = await this.sendTextMessage(shipmentInfo.phone, message);
    return result !== null;
  }

  /**
   * Send inquiry response message
   */
  async sendInquiryResponse(inquiryInfo: {
    dealerName: string;
    phone: string;
    subject: string;
    responseMessage: string;
  }): Promise<boolean> {
    const message = `💬 Inquiry Response - Jeen Mata Impex

Dear ${inquiryInfo.dealerName},

Re: ${inquiryInfo.subject}

${inquiryInfo.responseMessage}

Need more information? Contact us:
📞 +977-1-4567890
📧 info@jeenmataimpex.com

Best regards,
Jeen Mata Impex Team`;

    const result = await this.sendTextMessage(inquiryInfo.phone, message);
    return result !== null;
  }

  /**
   * Send bulk promotional message
   */
  async sendPromotionalMessage(dealers: Array<{
    name: string;
    phone: string;
  }>, message: string): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const dealer of dealers) {
      const personalizedMessage = `Dear ${dealer.name},

${message}

Best regards,
Jeen Mata Impex Team`;

      const result = await this.sendTextMessage(dealer.phone, personalizedMessage);
      if (result) {
        sent++;
      } else {
        failed++;
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return { sent, failed };
  }

  /**
   * Format phone number for WhatsApp API
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith('977') && cleaned.length === 10) {
      cleaned = '977' + cleaned;
    }
    
    return cleaned;
  }

  /**
   * Verify webhook token
   */
  verifyWebhook(token: string): boolean {
    return token === this.config.webhookVerifyToken;
  }

  /**
   * Process incoming webhook message
   */
  async processWebhookMessage(body: any): Promise<void> {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;
      
      if (value?.messages) {
        for (const message of value.messages) {
          await this.handleIncomingMessage(message, value.contacts?.[0]);
        }
      }
    } catch (error) {
      console.error('Error processing webhook message:', error);
    }
  }

  /**
   * Handle incoming message from dealer
   */
  private async handleIncomingMessage(message: any, contact: any): Promise<void> {
    const from = message.from;
    const messageText = message.text?.body;
    const messageType = message.type;

    console.log(`Received ${messageType} message from ${from}: ${messageText}`);

    // Auto-reply for text messages
    if (messageType === 'text') {
      const autoReply = `Thank you for contacting Jeen Mata Impex! 

We've received your message and will respond shortly during business hours (9 AM - 6 PM).

For urgent matters:
📞 +977-1-4567890
📧 info@jeenmataimpex.com

Visit our portal: https://jeenmataimpex.com`;

      await this.sendTextMessage(from, autoReply);
    }
  }

  /**
   * Get service status
   */
  getStatus(): {
    configured: boolean;
    businessNumber: string;
    hasAccessToken: boolean;
  } {
    return {
      configured: !!(this.config.accessToken && this.config.phoneNumberId),
      businessNumber: this.config.businessPhoneNumber,
      hasAccessToken: !!this.config.accessToken
    };
  }
}

// Export singleton instance
export const whatsAppService = new WhatsAppService();

// Export types for use in other modules
export type {
  WhatsAppConfig,
  WhatsAppMessage,
  WhatsAppResponse
};

export default whatsAppService;
