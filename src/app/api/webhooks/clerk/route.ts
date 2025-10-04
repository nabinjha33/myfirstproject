import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { supabase } from '@/lib/supabase';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  console.log(`Webhook with an ID of ${evt.data.id} and type of ${eventType}`);

  if (eventType === 'user.created') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
    
    try {
      // Create user in Supabase with clerk_user_id instead of using Clerk ID as primary key
      const insertData: any = {
        clerk_user_id: id, // Store Clerk ID in separate column
        email: email_addresses[0]?.email_address,
        full_name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address,
        phone: phone_numbers?.[0]?.phone_number,
        role: 'user', // Default role, will be updated to 'dealer' when application is approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Try with clerk_user_id first, fallback without it if column doesn't exist
      let { error } = await supabase
        .from('users')
        .insert(insertData);
        
      if (error && (error.message.includes('clerk_user_id') || error.code === '42703')) {
        // Column doesn't exist, retry without it
        console.log('clerk_user_id column not found, creating user without it');
        delete insertData.clerk_user_id;
        
        const result = await supabase
          .from('users')
          .insert(insertData);
          
        error = result.error;
      }

      if (error) {
        console.error('Error creating user in Supabase:', error);
        return new Response('Error creating user', { status: 500 });
      }

      console.log('User created successfully in Supabase');
    } catch (error) {
      console.error('Error in user.created webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, first_name, last_name, phone_numbers } = evt.data;
    
    try {
      // Update user in Supabase using clerk_user_id or email
      let { error } = await supabase
        .from('users')
        .update({
          full_name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address,
          phone: phone_numbers?.[0]?.phone_number,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', id);
        
      // If clerk_user_id column doesn't exist, try using email
      if (error && (error.message.includes('clerk_user_id') || error.code === '42703')) {
        const result = await supabase
          .from('users')
          .update({
            full_name: `${first_name || ''} ${last_name || ''}`.trim() || email_addresses[0]?.email_address,
            phone: phone_numbers?.[0]?.phone_number,
            updated_at: new Date().toISOString(),
          })
          .eq('email', email_addresses[0]?.email_address);
          
        error = result.error;
      }

      if (error) {
        console.error('Error updating user in Supabase:', error);
        return new Response('Error updating user', { status: 500 });
      }

      console.log('User updated successfully in Supabase');
    } catch (error) {
      console.error('Error in user.updated webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  if (eventType === 'user.deleted') {
    const { id } = evt.data;
    
    try {
      // Soft delete or mark user as inactive in Supabase
      // We don't actually delete the user to preserve data integrity
      let { error } = await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString(),
          // You could add an 'active' field and set it to false
        })
        .eq('clerk_user_id', id);
        
      // If clerk_user_id column doesn't exist, we can't easily identify the user
      if (error && (error.message.includes('clerk_user_id') || error.code === '42703')) {
        console.log('Cannot handle user deletion without clerk_user_id column');
        // Could potentially use email if available in the webhook data
      }

      if (error) {
        console.error('Error handling user deletion in Supabase:', error);
        return new Response('Error deleting user', { status: 500 });
      }

      console.log('User deletion handled successfully in Supabase');
    } catch (error) {
      console.error('Error in user.deleted webhook:', error);
      return new Response('Error processing webhook', { status: 500 });
    }
  }

  return new Response('', { status: 200 });
}
