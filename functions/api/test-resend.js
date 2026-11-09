/**
 * Cloudflare Pages Function: /api/test-resend & /api/test-email
 * Allows testing Resend email delivery directly from the Admin Settings console.
 */
import { handleSendReceipt } from './send-receipt.js';

export async function onRequestPost(context) {
  let body = {};
  try {
    body = await context.request.json();
  } catch (e) {
    body = {};
  }

  // Synthesize test payload
  const testPayload = {
    bookingReference: `GT-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: 'Galle Taxi Dispatcher Test',
    customerEmail: body.targetEmail || 'galletaxi.lk@gmail.com',
    phone: '+94 77 123 4567',
    pickupLocation: 'Galle Dutch Fort, Southern Province',
    destination: 'Bandaranaike International Airport (CMB)',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    vehicleCategoryName: 'Executive Hybrid Sedan (Air-conditioned)',
    passengerCount: 2,
    luggageCount: 2,
    estimatedFare: 18500,
    finalFare: 18500,
    apiKey: body.apiKey,
  };

  // Create a synthetic context with test payload
  const syntheticContext = {
    ...context,
    request: {
      ...context.request,
      json: async () => testPayload,
    },
  };

  return handleSendReceipt(syntheticContext);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return onRequestOptions();
  }
  if (context.request.method === 'POST') {
    return onRequestPost(context);
  }
  return new Response(JSON.stringify({ error: `Method ${context.request.method} Not Allowed` }), {
    status: 405,
    headers: {
      'Content-Type': 'application/json',
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
