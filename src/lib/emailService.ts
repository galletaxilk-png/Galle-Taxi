import { Booking } from '../types';
import { formatLKR } from './fareEngine';

export interface EmailVoucherData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  phone: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  vehicleCategoryName: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
  passengerCount: number;
  luggageCount: number;
  flightNumber?: string;
  nameboardText?: string;
  estimatedFare: number;
  finalFare?: number;
  specialInstructions?: string;
  dispatcherEmail?: string;
  dispatcherPhone?: string;
  dispatcherWhatsapp?: string;
  apiKey?: string;
  gmailAppPassword?: string;
  gmailUser?: string;
  tourId?: string;
  tourSlug?: string;
  tourTitle?: string;
  tourDuration?: string;
  tourHighlights?: string[];
  tourItinerary?: string[];
  tourIncluded?: string[];
  tourExcluded?: string[];
}

export const OFFICIAL_DISPATCH_EMAIL = 'support@galletaxi.lk';
export const GMAIL_DISPATCH_INBOX = 'galletaxi.lk@gmail.com';
export const STRICT_SENDER_FROM = 'Galle Taxi <support@galletaxi.lk>';
export const SUPPORT_EMAIL = 'support@galletaxi.lk';

/**
 * Safely parses and reads RESEND_API_KEY from process.env, Vite import.meta.env, or browser storage
 */
export function getResendApiKey(): string | undefined {
  let key: string | undefined;

  // 1. Read directly from process.env (Node.js runtime or Vite define replacement)
  try {
    if (typeof process !== 'undefined' && process?.env) {
      key = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY || (process.env as any).RESEND_KEY;
    }
  } catch {}

  // 2. Read from Vite client environment import.meta.env
  if (!key) {
    try {
      key =
        (import.meta as any).env?.VITE_RESEND_API_KEY ||
        (import.meta as any).env?.RESEND_API_KEY;
    } catch {}
  }

  // 3. Fallback to localStorage configured by admin
  if (!key && typeof window !== 'undefined') {
    try {
      key = localStorage.getItem('galle_taxi_resend_key') || undefined;
    } catch {}
  }

  if (!key) return undefined;
  const cleaned = key.replace(/^["']|["']$/g, '').trim();
  return cleaned || undefined;
}

/**
 * Generates an executive plain-text booking confirmation voucher and tax invoice
 */
export function generateVoucherPlainText(data: EmailVoucherData): string {
  const dispatcherEmail = data.dispatcherEmail || OFFICIAL_DISPATCH_EMAIL;
  const dispatcherPhone = data.dispatcherPhone || '+94 77 123 4567';
  const dispatcherWhatsapp = data.dispatcherWhatsapp || '+94 77 123 4567';
  const receiptNo = `REC-${data.bookingReference}`;
  const totalDue = Number(data.finalFare || data.estimatedFare || 0);
  const isTour = Boolean(data.tourTitle || data.tourId || data.destination?.includes('Day Tour'));

  const headerTitle = isTour
    ? `GALLE TAXI - OFFICIAL PRIVATE DAY TOUR VOUCHER & TAX INVOICE`
    : `GALLE TAXI - OFFICIAL BOOKING CONFIRMATION & TAX INVOICE`;

  let tourSection = '';
  if (isTour) {
    tourSection = `
-----------------------------------------------------
★ PRIVATE DAY TOUR SPECIFICATIONS:
-----------------------------------------------------
- Excursion Title: ${data.tourTitle || data.destination}
- Duration: ${data.tourDuration || 'Full Day Private Tour'}
- Pickup / Return Point: ${data.pickupLocation} (Door-to-door hotel transfers)
- Assigned Private Vehicle: ${data.vehicleCategoryName}
`;

    if (data.tourHighlights && data.tourHighlights.length > 0) {
      tourSection += `
-----------------------------------------------------
★ EXPERIENCE HIGHLIGHTS:
-----------------------------------------------------
${data.tourHighlights.map((hl) => `• ${hl}`).join('\n')}
`;
    }

    if (data.tourItinerary && data.tourItinerary.length > 0) {
      tourSection += `
-----------------------------------------------------
★ DAY ITINERARY TIMELINE:
-----------------------------------------------------
${data.tourItinerary.map((it) => `• ${it}`).join('\n')}
`;
    }

    if (data.tourIncluded && data.tourIncluded.length > 0) {
      tourSection += `
-----------------------------------------------------
★ WHAT'S INCLUDED:
-----------------------------------------------------
${data.tourIncluded.map((inc) => `✓ ${inc}`).join('\n')}
`;
    }

    if (data.tourExcluded && data.tourExcluded.length > 0) {
      tourSection += `
-----------------------------------------------------
★ WHAT'S EXCLUDED:
-----------------------------------------------------
${data.tourExcluded.map((exc) => `✗ ${exc}`).join('\n')}
`;
    }
  }

  return `=====================================================
${headerTitle}
Booking ID: ${data.bookingReference}
Invoice Reference: ${receiptNo}
Galle Dutch Fort, Southern Province, Sri Lanka
Hotline / WhatsApp: ${dispatcherPhone} | Dispatch: ${dispatcherEmail} | Support: support@galletaxi.lk
=====================================================

RESERVATION STATUS: CONFIRMED & DISPATCHED
Date Issued: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}

-----------------------------------------------------
1. BOOKING & VEHICLE SUMMARY:
-----------------------------------------------------
- Booking ID: ${data.bookingReference}
- Route / Destination: ${data.pickupLocation} ➔ ${data.destination}
- Reserved Vehicle: ${data.vehicleCategoryName || 'Air-Conditioned Private Vehicle'}
- Total Net Fare: Rs. ${totalDue.toLocaleString()} (Payable upon arrival)

-----------------------------------------------------
2. PASSENGER INFORMATION:
-----------------------------------------------------
- Primary Passenger: ${data.customerName}
- Passenger Contact: ${data.phone}
- Passenger Email: ${data.customerEmail || 'N/A'}
- Total Passengers: ${data.passengerCount} Passengers
- Luggage Count: ${data.luggageCount} Luggage Bags

-----------------------------------------------------
3. SCHEDULE & PICKUP TIMELINE:
-----------------------------------------------------
- Pickup Date & Time: ${data.pickupDate} at ${data.pickupTime}
- Pickup Location: ${data.pickupLocation}
- Destination: ${data.destination}
- Selected Vehicle: ${data.vehicleCategoryName || 'Air-Conditioned Private Vehicle'}
${data.flightNumber ? `- Arrival Flight Number: ${data.flightNumber} (Live Flight Tracking Included)\n` : ''}${
    data.nameboardText ? `- Airport Placard Nameboard: "${data.nameboardText}"\n` : ''
  }${data.specialInstructions ? `- Special Notes / Requests: ${data.specialInstructions}\n` : ''}${tourSection}
-----------------------------------------------------
4. AUTHORITATIVE MULTI-CURRENCY FARE DETAILS:
-----------------------------------------------------
- LKR: Rs. ${totalDue.toLocaleString()} (Sri Lankan Rupee - Base)
- USD: $${Math.round(totalDue / 305).toLocaleString()} (US Dollar)
- EUR: €${Math.round(totalDue / 330).toLocaleString()} (Euro)
- GBP: £${Math.round(totalDue / 395).toLocaleString()} (British Pound)
- INR: ₹${Math.round(totalDue / 3.65).toLocaleString()} (Indian Rupee)

- Fuel & Chauffeur Transit Allowance: INCLUDED (Rs. 0)
- Southern Expressway (E01) Highway Tolls: INCLUDED (Rs. 0)
${data.flightNumber ? '- Airport Delay Waiting (Up to 90 min) & Meet: FREE (Rs. 0)\n' : ''}- Payment Terms: Cash to Chauffeur on Arrival (LKR, USD, EUR, GBP, or INR accepted)

NET GUARANTEED TOTAL DUE: Rs. ${totalDue.toLocaleString()}

-----------------------------------------------------
5. DISPATCH & SUPPORT ASSISTANCE:
-----------------------------------------------------
For 24/7 assistance, ride updates, or questions:
- Official Support & Reply-To: support@galletaxi.lk
- WhatsApp / Hotline: ${dispatcherWhatsapp} (Chat: https://wa.me/${dispatcherWhatsapp.replace(/[^0-9]/g, '')})
- Central Dispatch Email: ${dispatcherEmail}
- Track Ride Live Online: https://galletaxi.lk/track-booking?ref=${data.bookingReference}&phone=${data.phone.replace(/[^0-9]/g, '')}

Galle Taxi Operations, Galle Fort, Sri Lanka
Official Booking Confirmation & Travel Invoice`;
}

/**
 * Creates direct URL to open Gmail compose pre-filled with the official tax receipt addressed to dispatcher
 */
export function getDispatcherReceiptGmailUrl(data: EmailVoucherData): string {
  const subject = encodeURIComponent(
    `[Booking Invoice REC-${data.bookingReference}] New Booking: ${data.customerName} - ${data.pickupLocation} to ${data.destination}`
  );
  const body = encodeURIComponent(generateVoucherPlainText(data));
  const to = encodeURIComponent(OFFICIAL_DISPATCH_EMAIL);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
}

/**
 * Creates direct URL to open Gmail compose pre-filled with customer confirmation voucher
 */
export function getCustomerGmailComposeUrl(data: EmailVoucherData): string {
  const subject = encodeURIComponent(`Booking Confirmation: ${data.bookingReference} - Galle Taxi`);
  const body = encodeURIComponent(generateVoucherPlainText(data));
  const to = encodeURIComponent(data.customerEmail);
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&cc=${encodeURIComponent('support@galletaxi.lk')}&su=${subject}&body=${body}`;
}

/**
 * Creates mailto URL for default mail client
 */
export function getCustomerMailtoUrl(data: EmailVoucherData): string {
  const subject = encodeURIComponent(`Booking Confirmation: ${data.bookingReference} - Galle Taxi`);
  const body = encodeURIComponent(generateVoucherPlainText(data));
  const to = encodeURIComponent(data.customerEmail);
  return `mailto:${to}?subject=${subject}&cc=${encodeURIComponent('support@galletaxi.lk')}&body=${body}`;
}

/**
 * Dispatches official Booking Receipt & Tax Invoice automatically to galletaxi.lk@gmail.com and passenger
 */
export async function dispatchOfficialReceiptEmail(data: EmailVoucherData): Promise<{
  success: boolean;
  message: string;
  receiptNumber: string;
  sentTo: string[];
  method: string;
  simulated?: boolean;
}> {
  console.info(`[Galle Taxi Email Dispatcher] Automatically sending Tax Receipt strictly from ${STRICT_SENDER_FROM} to customer ${data.customerEmail} (copies to ${OFFICIAL_DISPATCH_EMAIL} & ${GMAIL_DISPATCH_INBOX})`);

  const savedResendKey =
    data.apiKey ||
    getResendApiKey() ||
    (typeof window !== 'undefined' ? localStorage.getItem('galle_taxi_resend_key') || undefined : undefined);
  const savedGmailAppPass =
    data.gmailAppPassword ||
    (typeof window !== 'undefined' ? localStorage.getItem('galle_taxi_gmail_app_password') || undefined : undefined);

  try {
    const response = await fetch('/api/send-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        from: STRICT_SENDER_FROM,
        apiKey: savedResendKey,
        gmailAppPassword: savedGmailAppPass,
        dispatcherEmail: data.dispatcherEmail || OFFICIAL_DISPATCH_EMAIL,
        appUrl: typeof window !== 'undefined' ? window.location.origin : 'https://galletaxi.lk',
      }),
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.simulated) {
        console.warn(
          `[Galle Taxi Email Dispatcher] Notice: Confirmation email simulated/logged without live SMTP dispatch.\n` +
          `Reason: ${resData.diagnostic || resData.error || 'RESEND_API_KEY missing'}`
        );
      } else {
        console.info(
          `[Galle Taxi Email Dispatcher] SUCCESS: Confirmation email delivered to [${resData.recipients?.join(', ')}] via ${resData.method} (Message ID: ${resData.messageId || 'N/A'}).`
        );
      }
      return {
        success: true,
        receiptNumber: resData.receiptNumber || `REC-${data.bookingReference}`,
        message:
          resData.message ||
          `Official Tax Receipt successfully processed for customer & dispatch`,
        sentTo: resData.recipients || [data.customerEmail, OFFICIAL_DISPATCH_EMAIL, GMAIL_DISPATCH_INBOX].filter(Boolean),
        method: resData.method || 'server',
        simulated: !!resData.simulated,
      };
    } else {
      const errJson = await response.json().catch(() => ({}));
      console.error('[Galle Taxi Email Dispatcher] Server responded with error status:', {
        status: response.status,
        statusText: response.statusText,
        error: errJson.error || errJson.message,
        diagnostic: errJson.diagnostic,
      });
    }
  } catch (err: any) {
    console.error('[Galle Taxi Email Dispatcher] Exception calling /api/send-receipt:', {
      message: err?.message,
      stack: err?.stack,
    });
  }

  // Record dispatch in local audit history
  const timestamp = new Date().toISOString();
  try {
    const history = JSON.parse(localStorage.getItem('galle_taxi_email_dispatches') || '[]');
    history.unshift({
      bookingReference: data.bookingReference,
      receiptNumber: `REC-${data.bookingReference}`,
      sentTo: [OFFICIAL_DISPATCH_EMAIL, data.customerEmail].filter(Boolean).join(', '),
      timestamp,
      customerName: data.customerName,
    });
    localStorage.setItem('galle_taxi_email_dispatches', JSON.stringify(history.slice(0, 50)));
  } catch {}

  return {
    success: true,
    receiptNumber: `REC-${data.bookingReference}`,
    message: `Tax Receipt REC-${data.bookingReference} queued for ${OFFICIAL_DISPATCH_EMAIL}`,
    sentTo: [OFFICIAL_DISPATCH_EMAIL, data.customerEmail].filter(Boolean),
    method: 'client-logged',
    simulated: true,
  };
}

/**
 * Backward compatibility alias
 */
export async function dispatchCustomerEmailVoucher(data: EmailVoucherData) {
  return dispatchOfficialReceiptEmail(data);
}
