import { NextRequest, NextResponse } from 'next/server';
import { whatsAppService } from '@/lib/integrations/whatsapp';

/**
 * WhatsApp Webhook Handler
 * 
 * This API route handles incoming WhatsApp webhook events from Meta's WhatsApp Business API.
 * It processes incoming messages and sends auto-replies.
 */

// Handle GET request for webhook verification
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('WhatsApp webhook verification attempt:', { mode, token });

  // Verify the webhook
  if (mode === 'subscribe' && whatsAppService.verifyWebhook(token || '')) {
    console.log('✅ WhatsApp webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.log('❌ WhatsApp webhook verification failed');
    return new NextResponse('Forbidden', { status: 403 });
  }
}

// Handle POST request for incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📨 Received WhatsApp webhook:', JSON.stringify(body, null, 2));

    // Process the incoming message
    await whatsAppService.processWebhookMessage(body);

    // Always return 200 to acknowledge receipt
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Error processing WhatsApp webhook:', error);
    
    // Still return 200 to prevent webhook retries
    return new NextResponse('Error processed', { status: 200 });
  }
}
