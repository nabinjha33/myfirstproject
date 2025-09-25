/**
 * WhatsApp Integration Service
 * 
 * This service handles WhatsApp message sending through various providers
 * Currently supports: Twilio, WhatsApp Business API, and custom webhook endpoints
 * 
 * @author Jeen Mata Impex Development Team
 */

interface WhatsAppConfig {
  enabled: boolean;
  provider: 'twilio' | 'whatsapp-business' | 'custom-webhook';
  twilio: {
    accountSid: string;
    authToken: string;
    whatsappNumber: string;
  };
  whatsappBusiness: {
    accessToken: string;
    phoneNumberId: string;
    businessAccountId: string;
  };
  customWebhook: {
    endpoint: string;
    apiKey: string;
  };
}

interface WhatsAppResult {
  success: boolean;
  error: string | null;
  messageId?: string;
}

interface ApplicationData {
  business_name?: string;
  businessName?: string;
  contact_person?: string;
  contactPerson?: string;
  phone?: string;
}

class WhatsAppService {
  private config: WhatsAppConfig;

  constructor() {
    this.config = {
      // Enable/disable WhatsApp notifications globally
      enabled: false, // Set to true when you have API credentials
      
      // Provider selection: 'twilio', 'whatsapp-business', 'custom-webhook'
      provider: 'twilio',
      
      // Provider-specific configurations
      // IMPORTANT: Replace these placeholder values with your actual credentials
      twilio: {
        accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', // Replace with your Twilio Account SID
        authToken: 'your_auth_token_here', // Replace with your Twilio Auth Token
        whatsappNumber: 'whatsapp:+14155238886', // Replace with your Twilio WhatsApp number
      },
      
      whatsappBusiness: {
        accessToken: 'your_access_token_here', // Replace with your WhatsApp Business access token
        phoneNumberId: 'your_phone_number_id_here', // Replace with your phone number ID
        businessAccountId: 'your_business_account_id_here', // Replace with your business account ID
      },
      
      customWebhook: {
        endpoint: 'https://your-api.com/send-whatsapp', // Replace with your webhook URL
        apiKey: 'your_api_key_here', // Replace with your API key
      }
    };
  }

  /**
   * Check if WhatsApp service is properly configured
   */
  isConfigured(): boolean {
    if (!this.config.enabled) return false;
    
    switch (this.config.provider) {
      case 'twilio':
        return !!(this.config.twilio.accountSid && 
                 this.config.twilio.authToken && 
                 this.config.twilio.whatsappNumber &&
                 !this.config.twilio.accountSid.includes('xxxxxxx'));
      
      case 'whatsapp-business':
        return !!(this.config.whatsappBusiness.accessToken && 
                 this.config.whatsappBusiness.phoneNumberId &&
                 !this.config.whatsappBusiness.accessToken.includes('your_'));
      
      case 'custom-webhook':
        return !!(this.config.customWebhook.endpoint && 
                 this.config.customWebhook.apiKey &&
                 !this.config.customWebhook.endpoint.includes('your-api'));
      
      default:
        return false;
    }
  }

  /**
   * Send a WhatsApp message using the configured provider
   */
  private async sendMessage(to: string, message: string): Promise<WhatsAppResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'WhatsApp service is not properly configured or disabled'
      };
    }

    // Normalize phone number (remove any non-digit characters except +)
    const normalizedPhone = to.replace(/[^\d+]/g, '');
    
    try {
      switch (this.config.provider) {
        case 'twilio':
          return await this.sendViaTwilio(normalizedPhone, message);
        
        case 'whatsapp-business':
          return await this.sendViaWhatsAppBusiness(normalizedPhone, message);
        
        case 'custom-webhook':
          return await this.sendViaCustomWebhook(normalizedPhone, message);
        
        default:
          return {
            success: false,
            error: 'Invalid WhatsApp provider configured'
          };
      }
    } catch (error) {
      console.error('WhatsApp Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Send message via Twilio
   */
  private async sendViaTwilio(to: string, message: string): Promise<WhatsAppResult> {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${this.config.twilio.accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('From', this.config.twilio.whatsappNumber);
    formData.append('To', `whatsapp:${to}`);
    formData.append('Body', message);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${this.config.twilio.accountSid}:${this.config.twilio.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        error: null,
        messageId: result.sid
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to send via Twilio'
      };
    }
  }

  /**
   * Send message via WhatsApp Business API
   */
  private async sendViaWhatsAppBusiness(to: string, message: string): Promise<WhatsAppResult> {
    const url = `https://graph.facebook.com/v18.0/${this.config.whatsappBusiness.phoneNumberId}/messages`;
    
    const payload = {
      messaging_product: 'whatsapp',
      to: to,
      type: 'text',
      text: {
        body: message
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.whatsappBusiness.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        error: null,
        messageId: result.messages?.[0]?.id
      };
    } else {
      return {
        success: false,
        error: result.error?.message || 'Failed to send via WhatsApp Business API'
      };
    }
  }

  /**
   * Send message via custom webhook
   */
  private async sendViaCustomWebhook(to: string, message: string): Promise<WhatsAppResult> {
    const payload = {
      to: to,
      message: message,
      timestamp: new Date().toISOString()
    };

    const response = await fetch(this.config.customWebhook.endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.customWebhook.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        error: null,
        messageId: result.messageId || result.id
      };
    } else {
      return {
        success: false,
        error: result.error || 'Failed to send via custom webhook'
      };
    }
  }

  /**
   * Send new dealer application notification to owner
   */
  async sendNewApplicationNotification(ownerPhone: string, applicationData: ApplicationData): Promise<WhatsAppResult> {
    const businessName = applicationData.business_name || applicationData.businessName || 'Unknown Business';
    const contactPerson = applicationData.contact_person || applicationData.contactPerson || 'Unknown Contact';
    
    const message = `🆕 *New Dealer Application*

*Business:* ${businessName}
*Contact:* ${contactPerson}
*Phone:* ${applicationData.phone || 'Not provided'}

Please review the application in the admin panel.

_Jeen Mata Impex - Automated Notification_`;

    return await this.sendMessage(ownerPhone, message);
  }

  /**
   * Send application confirmation to dealer
   */
  async sendApplicationConfirmation(dealerPhone: string, applicationData: ApplicationData): Promise<WhatsAppResult> {
    const businessName = applicationData.business_name || applicationData.businessName || 'Your Business';
    
    const message = `✅ *Application Received*

Dear ${applicationData.contact_person || applicationData.contactPerson || 'Valued Partner'},

Thank you for applying to become a dealer for *Jeen Mata Impex*!

*Business:* ${businessName}
*Status:* Under Review

Our team will review your application within 2-3 business days. You'll receive updates via email and WhatsApp.

For questions: jeenmataimpex8@gmail.com

_Jeen Mata Impex Team_`;

    return await this.sendMessage(dealerPhone, message);
  }

  /**
   * Send order status update
   */
  async sendOrderStatusUpdate(dealerPhone: string, orderData: any): Promise<WhatsAppResult> {
    const message = `📦 *Order Status Update*

*Order:* ${orderData.order_number || orderData.orderNumber}
*Status:* ${orderData.status}
*Updated:* ${new Date().toLocaleDateString()}

${orderData.tracking_number ? `*Tracking:* ${orderData.tracking_number}` : ''}

Thank you for your business!

_Jeen Mata Impex Team_`;

    return await this.sendMessage(dealerPhone, message);
  }

  /**
   * Send shipment arrival notification
   */
  async sendShipmentArrivalNotification(dealerPhone: string, shipmentData: any): Promise<WhatsAppResult> {
    const message = `🚢 *Shipment Update*

*Tracking:* ${shipmentData.tracking_number}
*Status:* ${shipmentData.status}
*ETA:* ${shipmentData.eta_date}

${shipmentData.product_names ? `*Products:* ${shipmentData.product_names}` : ''}

We'll keep you updated on the progress.

_Jeen Mata Impex Team_`;

    return await this.sendMessage(dealerPhone, message);
  }

  /**
   * Send bulk notification to multiple recipients
   */
  async sendBulkNotification(recipients: string[], message: string): Promise<{ success: number; failed: number; results: WhatsAppResult[] }> {
    const results: WhatsAppResult[] = [];
    let successCount = 0;
    let failedCount = 0;

    for (const recipient of recipients) {
      const result = await this.sendMessage(recipient, message);
      results.push(result);
      
      if (result.success) {
        successCount++;
      } else {
        failedCount++;
      }

      // Add a small delay between messages to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: successCount,
      failed: failedCount,
      results
    };
  }

  /**
   * Update configuration (useful for admin settings)
   */
  updateConfig(newConfig: Partial<WhatsAppConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration status (without sensitive data)
   */
  getConfigStatus(): { enabled: boolean; provider: string; configured: boolean } {
    return {
      enabled: this.config.enabled,
      provider: this.config.provider,
      configured: this.isConfigured()
    };
  }
}

export default new WhatsAppService();
