/**
 * Unified Notification Service
 * Handles WhatsApp notifications
 */

import { whatsAppService } from '@/lib/integrations/whatsapp';

interface ApplicationData {
  business_name?: string;
  businessName?: string;
  contact_person?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  business_type?: string;
  businessType?: string;
  experience_years?: number;
  experienceYears?: number;
  annual_turnover?: string;
  annualTurnover?: string;
  interested_brands?: string[];
  interestedBrands?: string[];
  message?: string;
  created_date?: string;
  createdDate?: string;
}

interface NotificationResult {
  success: boolean;
  error: string | null;
}

class NotificationService {
  private ownerWhatsApp: string = '+977-9876543210';

  /**
   * Send notification to owner about new dealer application
   */
  async notifyOwnerNewApplication(applicationData: ApplicationData): Promise<NotificationResult> {
    const result: NotificationResult = { success: false, error: null };

    try {
      const message = `🆕 New Dealer Application

Business: ${applicationData.business_name || applicationData.businessName}
Contact: ${applicationData.contact_person || applicationData.contactPerson}
Email: ${applicationData.email}
Phone: ${applicationData.phone}
Address: ${applicationData.address}
Type: ${applicationData.business_type || applicationData.businessType}

Please review the application in the admin panel.`;

      const whatsappResult = await whatsAppService.sendTextMessage(this.ownerWhatsApp, message);
      
      if (whatsappResult) {
        result.success = true;
        console.log('✅ Owner WhatsApp notification sent');
      } else {
        result.error = 'Failed to send WhatsApp message';
        console.error('❌ Failed to send owner WhatsApp notification');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error sending owner notification:', error);
    }

    return result;
  }

  /**
   * Send welcome notification to approved dealer
   */
  async notifyDealerApproval(dealerData: ApplicationData): Promise<NotificationResult> {
    const result: NotificationResult = { success: false, error: null };

    if (!dealerData.phone) {
      result.error = 'No phone number provided';
      return result;
    }

    try {
      const success = await whatsAppService.sendDealerWelcome({
        name: dealerData.contact_person || dealerData.contactPerson || 'Dealer',
        businessName: dealerData.business_name || dealerData.businessName || 'Your Business',
        phone: dealerData.phone
      });

      if (success) {
        result.success = true;
        console.log('✅ Dealer welcome notification sent');
      } else {
        result.error = 'Failed to send welcome message';
        console.error('❌ Failed to send dealer welcome notification');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error sending dealer approval notification:', error);
    }

    return result;
  }

  /**
   * Send order confirmation notification
   */
  async notifyOrderConfirmation(orderData: {
    dealerName: string;
    phone: string;
    orderId: string;
    totalItems: number;
    estimatedValue: number;
  }): Promise<NotificationResult> {
    const result: NotificationResult = { success: false, error: null };

    try {
      const success = await whatsAppService.sendOrderConfirmation(orderData);

      if (success) {
        result.success = true;
        console.log('✅ Order confirmation notification sent');
      } else {
        result.error = 'Failed to send order confirmation';
        console.error('❌ Failed to send order confirmation notification');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error sending order confirmation:', error);
    }

    return result;
  }

  /**
   * Send shipment update notification
   */
  async notifyShipmentUpdate(shipmentData: {
    dealerName: string;
    phone: string;
    trackingNumber: string;
    status: string;
    eta?: string;
  }): Promise<NotificationResult> {
    const result: NotificationResult = { success: false, error: null };

    try {
      const success = await whatsAppService.sendShipmentUpdate(shipmentData);

      if (success) {
        result.success = true;
        console.log('✅ Shipment update notification sent');
      } else {
        result.error = 'Failed to send shipment update';
        console.error('❌ Failed to send shipment update notification');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ Error sending shipment update:', error);
    }

    return result;
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
