import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { execFile } from 'child_process';
import { promisify } from 'util';

dotenv.config();
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
} catch {}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT) || 3000;

// Allow up to 25MB payloads for high-resolution tour imagery uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Ensure uploads directories exist for tour & hub media
const uploadsDir = path.resolve(__dirname, 'public', 'uploads');
const tourUploadsDir = path.resolve(uploadsDir, 'tours');
const hubsUploadsDir = path.resolve(uploadsDir, 'hubs');
try {
  if (!fs.existsSync(tourUploadsDir)) {
    fs.mkdirSync(tourUploadsDir, { recursive: true });
  }
  if (!fs.existsSync(hubsUploadsDir)) {
    fs.mkdirSync(hubsUploadsDir, { recursive: true });
  }
} catch (e) {
  console.warn('[Galle Taxi] Notice on uploads dir initialization:', e);
}

// Serve /uploads statically so all uploaded images are immediately accessible by URL
app.use('/uploads', express.static(uploadsDir));

const OFFICIAL_DISPATCH_EMAIL = 'support@galletaxi.lk';
const GMAIL_DISPATCH_INBOX = 'galletaxi.lk@gmail.com';
const DEFAULT_DISPATCHER_EMAIL = 'support@galletaxi.lk';
const DEFAULT_SUPPORT_EMAIL = 'support@galletaxi.lk';
const DEFAULT_FROM_ADDRESS = 'Galle Taxi <support@galletaxi.lk>';

export function cleanEnvValue(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

export function getParsedResendApiKey(overrideKey?: string): string {
  const cleanedOverride = cleanEnvValue(overrideKey);
  if (cleanedOverride) return cleanedOverride;

  // Reload .env so dynamically updated keys take effect immediately
  try {
    dotenv.config({ path: path.resolve(process.cwd(), '.env'), override: true });
  } catch {}

  const keyFromEnv =
    cleanEnvValue(process.env.RESEND_API_KEY) ||
    cleanEnvValue(process.env.VITE_RESEND_API_KEY) ||
    cleanEnvValue((process.env as any).RESEND_KEY);

  return keyFromEnv;
}

const STRICT_FROM_ADDRESS = 'Galle Taxi <support@galletaxi.lk>';

function getCleanFromAddress(raw?: string): string {
  // Strictly enforce support@galletaxi.lk and completely reject onboarding@resend.dev or sandbox senders
  if (!raw) return STRICT_FROM_ADDRESS;
  const cleaned = raw.replace(/^["']|["']$/g, '').trim();
  if (!cleaned || cleaned.toLowerCase().includes('onboarding@resend.dev') || cleaned.toLowerCase().includes('resend.dev')) {
    return STRICT_FROM_ADDRESS;
  }
  return cleaned;
}

function cleanEmail(raw?: string): string {
  if (!raw) return '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

export interface ReceiptEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail?: string;
  phone: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  vehicleCategoryName: string;
  vehiclePlate?: string;
  driverName?: string;
  driverPhone?: string;
  passengerCount?: number;
  luggageCount?: number;
  flightNumber?: string;
  nameboardText?: string;
  estimatedFare?: number;
  finalFare?: number;
  specialInstructions?: string;
  dispatcherEmail?: string;
  dispatcherPhone?: string;
  dispatcherWhatsapp?: string;
  appUrl?: string;
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

/**
 * Generates an executive, official HTML Tax Receipt & Travel Invoice for Galle Taxi
 * Explicitly highlighting Booking ID, Confirmed Route, Reserved Vehicle, and Total Fare details.
 */
function generateOfficialReceiptHtml(data: ReceiptEmailData): string {
  const receiptNo = `REC-${data.bookingReference}`;
  const totalFare = Number(data.finalFare || data.estimatedFare || 0);
  const formattedFare = `Rs. ${totalFare.toLocaleString()}`;
  const appBaseUrl = data.appUrl || 'https://galletaxi.lk';
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
  const trackingUrl = `${appBaseUrl}/track-booking?ref=${encodeURIComponent(
    data.bookingReference
  )}&phone=${encodeURIComponent(cleanPhone)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    trackingUrl
  )}&color=000000&bgcolor=ffffff&margin=0`;

  const issueDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const issueTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation & Receipt ${receiptNo}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0d; color: #111827; margin: 0; padding: 24px 12px; }
        .wrapper { max-width: 680px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 12px 30px rgba(0,0,0,0.35); border: 1px solid #e5e7eb; }
        .top-brand { background-color: #141417; padding: 24px 28px; border-bottom: 3px solid #f5b91b; }
        .brand-title { color: #ffffff; font-size: 24px; font-weight: 900; letter-spacing: 1px; margin: 0; }
        .brand-title span { color: #f5b91b; }
        .brand-sub { color: #f5b91b; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin-top: 4px; }
        .brand-contact { color: #9ca3af; font-size: 11px; margin-top: 8px; line-height: 1.5; }
        .receipt-body { padding: 28px; }
        .hero-banner { background: linear-gradient(135deg, #18181b, #09090b); border-radius: 14px; padding: 20px 22px; color: #ffffff; margin-bottom: 22px; border: 1px solid #27272a; }
        .hero-id-label { font-size: 10px; text-transform: uppercase; letter-spacing: 1.5px; color: #f5b91b; font-weight: 800; }
        .hero-booking-id { font-size: 26px; font-weight: 900; font-family: monospace; color: #ffffff; letter-spacing: 1.5px; margin-top: 2px; word-break: break-all; }
        .hero-route-box { margin-top: 16px; padding-top: 14px; border-top: 1px solid #27272a; }
        .hero-route-label { font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; }
        .hero-route-val { font-size: 17px; font-weight: 800; color: #f5b91b; margin-top: 4px; line-height: 1.4; }
        .hero-vehicle-card { margin-top: 14px; padding: 12px 14px; background-color: rgba(245, 185, 27, 0.08); border: 1px solid rgba(245, 185, 27, 0.25); border-radius: 10px; }
        .summary-grid { width: 100%; border-collapse: collapse; margin-bottom: 22px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; }
        .summary-grid td { padding: 12px 14px; font-size: 12px; vertical-align: top; border-bottom: 1px solid #e5e7eb; }
        .label { color: #6b7280; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px; }
        .val { color: #111827; font-weight: 700; font-size: 13px; }
        .table-section-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #374151; margin: 20px 0 8px 0; }
        .data-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .data-table th { background-color: #f3f4f6; padding: 10px 12px; text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #4b5563; border-bottom: 1px solid #e5e7eb; }
        .data-table td { padding: 10px 12px; border-bottom: 1px solid #f3f4f6; }
        .total-row { background-color: #fffbeb !important; border-top: 2px solid #111827; }
        .total-fare { font-size: 20px; font-weight: 900; font-family: monospace; color: #111827; text-align: right; }
        .stamp-box { border: 2px dashed #b45309; background-color: #fffbeb; padding: 10px 14px; border-radius: 8px; text-align: center; display: inline-block; }
        .stamp-title { color: #b45309; font-weight: 900; font-size: 10px; letter-spacing: 1.5px; }
        .stamp-org { color: #111827; font-weight: 800; font-size: 12px; }
        .cta-btn { display: inline-block; background-color: #f5b91b; color: #000000 !important; font-weight: 800; font-size: 13px; padding: 12px 26px; border-radius: 10px; text-decoration: none; box-shadow: 0 4px 12px rgba(245,185,27,0.3); text-align: center; }
        .footer { background-color: #141417; padding: 22px 28px; text-align: center; font-size: 11px; color: #9ca3af; line-height: 1.6; border-top: 1px solid #27272a; }
        .mobile-show { display: none; }
        @media only screen and (max-width: 600px) {
          body { padding: 10px 4px !important; }
          .wrapper { border-radius: 10px !important; }
          .top-brand { padding: 18px 16px !important; }
          .brand-title { font-size: 20px !important; }
          .receipt-body { padding: 16px 14px !important; }
          .hero-banner { padding: 16px 14px !important; }
          .mobile-block { display: block !important; width: 100% !important; box-sizing: border-box !important; }
          .mobile-stack-right { display: block !important; width: 100% !important; text-align: left !important; margin-top: 10px !important; box-sizing: border-box !important; }
          .hero-booking-id { font-size: 20px !important; word-break: break-all !important; letter-spacing: 0.5px !important; line-height: 1.2 !important; }
          .summary-col { display: block !important; width: 100% !important; box-sizing: border-box !important; border-bottom: 1px solid #e5e7eb !important; padding: 10px 12px !important; }
          .summary-col:last-child { border-bottom: none !important; }
          .currency-card { display: inline-block !important; width: 48% !important; margin: 0 1% 6px 1% !important; box-sizing: border-box !important; vertical-align: top !important; }
          .mobile-hide { display: none !important; }
          .mobile-show { display: block !important; }
          .total-fare { font-size: 22px !important; text-align: left !important; margin-top: 4px !important; }
          .footer { padding: 18px 16px !important; }
        }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <!-- Official Brand Header -->
        <div class="top-brand">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td>
                <h1 class="brand-title">GALLE <span>TAXI</span></h1>
                <div class="brand-sub">Cabs & Airport Transfers Sri Lanka</div>
                <div class="brand-contact">
                  Registered Dispatch: Galle Dutch Fort, Southern Province, Sri Lanka<br/>
                  Hotline: <a href="tel:${(data.dispatcherPhone || '+94771234567').replace(/[^0-9+]/g, '')}" style="color: #ffffff; text-decoration: underline;">${data.dispatcherPhone || '+94 77 123 4567'}</a> &nbsp;|&nbsp; WhatsApp: <a href="https://wa.me/${(data.dispatcherWhatsapp || data.dispatcherPhone || '94771234567').replace(/[^0-9]/g, '')}" style="color: #25d366; text-decoration: underline;" target="_blank">Chat on WhatsApp</a> &nbsp;|&nbsp; Support: <a href="mailto:support@galletaxi.lk" style="color: #f5b91b; text-decoration: underline;">support@galletaxi.lk</a>
                </div>
              </td>
            </tr>
          </table>
        </div>

        <!-- Receipt Body -->
        <div class="receipt-body">
          
          <!-- Key Details Banner: Booking ID, Route, Vehicle, Total Fare (Stacks cleanly on mobile) -->
          <div class="hero-banner">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="mobile-block" valign="middle">
                  <div class="hero-id-label">OFFICIAL BOOKING ID</div>
                  <div class="hero-booking-id">${data.bookingReference}</div>
                  <div style="font-size: 12px; color: #a1a1aa; margin-top: 3px;">Tax Receipt Reference: <strong style="color: #f5b91b;">${receiptNo}</strong></div>
                </td>
                <td class="mobile-stack-right" align="right" valign="middle">
                  <span style="background-color: #059669; color: #ffffff; font-size: 11px; font-weight: 800; padding: 6px 14px; border-radius: 9999px; text-transform: uppercase; letter-spacing: 1px; display: inline-block;">
                    ✓ Confirmed & Dispatched
                  </span>
                  <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">${issueDate} at ${issueTime}</div>
                </td>
              </tr>
            </table>

            <!-- Highlighted Route -->
            <div class="hero-route-box">
              <div class="hero-route-label">CONFIRMED TRANSFER ROUTE</div>
              <div class="hero-route-val">
                ${data.pickupLocation} <span style="color: #ffffff; margin: 0 4px;">➔</span> ${data.destination}
              </div>
            </div>

            <!-- Highlighted Vehicle -->
            <div class="hero-vehicle-card">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <div style="font-size: 10px; color: #f5b91b; text-transform: uppercase; letter-spacing: 1px; font-weight: 800;">RESERVED VEHICLE CATEGORY</div>
                    <div style="font-size: 16px; font-weight: 800; color: #ffffff; margin-top: 2px;">
                      🚗 ${data.vehicleCategoryName || 'Air-Conditioned Premium Vehicle'}
                    </div>
                  </td>
                  <td align="right">
                    <span style="font-size: 11px; color: #e4e4e7; background-color: rgba(0,0,0,0.45); padding: 5px 12px; border-radius: 6px; font-weight: 600;">
                      Air-Conditioned • Private Transfer
                    </span>
                  </td>
                </tr>
              </table>
            </div>
          </div>

          <!-- Passenger Details with Clickable Phone & WhatsApp (Responsive stacked on mobile) -->
          <table class="summary-grid">
            <tr>
              <td class="summary-col" width="33%">
                <div class="label">Primary Passenger</div>
                <div class="val">${data.customerName}</div>
                <div style="font-size: 11px; margin-top: 4px;">
                  <a href="tel:${(data.phone || '').replace(/[^0-9+]/g, '')}" style="color: #111827; font-family: monospace; font-weight: bold; text-decoration: underline;">${data.phone}</a>
                  &nbsp;(<a href="https://wa.me/${(data.phone || '').replace(/[^0-9]/g, '')}" style="color: #059669; font-weight: bold; text-decoration: underline;" target="_blank">WhatsApp</a>)
                </div>
                ${data.customerEmail ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;"><a href="mailto:${data.customerEmail}" style="color: #6b7280; text-decoration: underline;">${data.customerEmail}</a></div>` : ''}
              </td>
              <td class="summary-col" width="33%">
                <div class="label">Trip Capacity</div>
                <div class="val">${data.passengerCount || 1} Passengers</div>
                <div style="font-size: 11px; color: #4b5563;">${data.luggageCount || 0} Luggage Bags</div>
              </td>
              <td class="summary-col" width="34%">
                <div class="label">Payment Terms</div>
                <div class="val" style="color: #059669;">Cash on Arrival</div>
                <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">LKR, USD, EUR, GBP, or INR accepted</div>
              </td>
            </tr>
          </table>

          <!-- Itinerary & Vehicle -->
          <div class="table-section-title">Transfer Route & Vehicle Schedule</div>
          <table class="data-table">
            <tr>
              <td width="30%" style="color: #6b7280; font-weight: 600;">Booking ID</td>
              <td style="font-weight: 800; font-family: monospace; color: #b45309;">${data.bookingReference}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Transfer Route</td>
              <td style="font-weight: 800; color: #111827;">${data.pickupLocation} ➔ ${data.destination}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Reserved Vehicle</td>
              <td style="font-weight: 800; color: #111827;">🚗 ${data.vehicleCategoryName || 'Air-Conditioned Private Vehicle'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Pickup Schedule</td>
              <td style="font-weight: 800; color: #111827;">${data.pickupDate} at ${data.pickupTime}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Pickup Location</td>
              <td style="font-weight: 700; color: #111827;">${data.pickupLocation}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Destination</td>
              <td style="font-weight: 700; color: #111827;">${data.destination}</td>
            </tr>
            ${data.flightNumber ? `
            <tr style="background-color: #fffbeb;">
              <td style="color: #b45309; font-weight: 600;">Arrival Flight No</td>
              <td style="font-weight: 800; font-family: monospace; color: #b45309;">${data.flightNumber} (Live Flight Tracking Included)</td>
            </tr>` : ''}
            ${data.nameboardText ? `
            <tr style="background-color: #ecfdf5;">
              <td style="color: #059669; font-weight: 600;">Airport Placard</td>
              <td style="font-weight: 800; color: #065f46;">"${data.nameboardText}"</td>
            </tr>` : ''}
          </table>

          ${data.tourTitle ? `
          <!-- Private Day Tour Overview & Highlights -->
          <div style="margin-top: 18px; padding: 14px 16px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
            <div style="font-size: 9px; font-weight: 800; text-transform: uppercase; color: #b45309; margin-bottom: 4px;">
              ★ PRIVATE DAY TOUR EXCURSION ★
            </div>
            <div style="font-size: 16px; font-weight: 900; color: #111827; font-family: 'Outfit', sans-serif;">
              ${data.tourTitle} ${data.tourDuration ? `<span style="font-size: 12px; font-weight: bold; color: #92400e;">(${data.tourDuration})</span>` : ''}
            </div>
            <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">
              Dedicated private vehicle (${data.vehicleCategoryName}) with door-to-door hotel transfers & local chauffeur.
            </div>
          </div>
          ` : ''}

          ${data.tourHighlights && data.tourHighlights.length > 0 ? `
          <div class="table-section-title" style="margin-top: 16px;">Tour Experience Highlights</div>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
            <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #374151; line-height: 1.6;">
              ${data.tourHighlights.map(h => `<li style="margin-bottom: 4px;">${h}</li>`).join('')}
            </ul>
          </div>
          ` : ''}

          ${data.tourItinerary && data.tourItinerary.length > 0 ? `
          <div class="table-section-title">Day Itinerary Timeline</div>
          <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size: 12px; line-height: 1.5;">
              ${data.tourItinerary.map(item => `
                <tr>
                  <td style="padding: 4px 0; color: #111827;">• ${item}</td>
                </tr>
              `).join('')}
            </table>
          </div>
          ` : ''}

          ${(data.tourIncluded?.length || data.tourExcluded?.length) ? `
          <table width="100%" cellpadding="0" cellspacing="6" border="0" style="margin-bottom: 16px;">
            <tr>
              ${data.tourIncluded?.length ? `
              <td width="50%" valign="top" style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 10px 12px; font-size: 11px;">
                <strong style="color: #065f46; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px;">✓ Included in Tour Fare</strong>
                <ul style="margin: 0; padding-left: 14px; color: #047857; line-height: 1.5;">
                  ${data.tourIncluded.map(inc => `<li>${inc}</li>`).join('')}
                </ul>
              </td>` : ''}
              ${data.tourExcluded?.length ? `
              <td width="50%" valign="top" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 12px; font-size: 11px;">
                <strong style="color: #6b7280; text-transform: uppercase; font-size: 10px; display: block; margin-bottom: 4px;">✗ Excluded / Optional</strong>
                <ul style="margin: 0; padding-left: 14px; color: #4b5563; line-height: 1.5;">
                  ${data.tourExcluded.map(exc => `<li>${exc}</li>`).join('')}
                </ul>
              </td>` : ''}
            </tr>
          </table>
          ` : ''}

          <!-- Multi-Currency Guaranteed Pricing: LKR, USD, EUR, GBP, INR (Mobile Responsive) -->
          <div class="table-section-title">Authoritative Multi-Currency Pricing (LKR, USD, EUR, GBP, INR)</div>
          
          <!-- LKR Official Base Fare Card (Full Width Highlight) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 8px;">
            <tr>
              <td style="background-color: #fffbeb; border: 2px solid #f5b91b; border-radius: 10px; padding: 12px 14px;">
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td valign="middle">
                      <div style="font-size: 10px; font-weight: 800; color: #b45309; text-transform: uppercase; letter-spacing: 0.5px;">🇱🇰 Official Fare (Base LKR)</div>
                      <div style="font-size: 20px; font-weight: 900; font-family: monospace; color: #111827; margin-top: 2px; white-space: nowrap;">${formattedFare}</div>
                    </td>
                    <td align="right" valign="middle">
                      <span style="font-size: 10px; font-weight: 800; color: #b45309; background-color: rgba(245, 185, 27, 0.25); border: 1px solid #f5b91b; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">Guaranteed Rate</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Secondary Foreign Currencies Grid (USD, EUR, GBP, INR) -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 20px;">
            <tr>
              <td>
                <table width="100%" cellpadding="0" cellspacing="6" border="0">
                  <tr>
                    <td class="currency-card" width="25%" valign="top" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 6px; text-align: center;">
                      <div style="font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase;">🇺🇸 USD ($)</div>
                      <div style="font-size: 15px; font-weight: 900; font-family: monospace; color: #111827; margin-top: 4px; white-space: nowrap;">$${Math.round(totalFare / 305).toLocaleString()}</div>
                      <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">US Dollar</div>
                    </td>
                    <td class="currency-card" width="25%" valign="top" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 6px; text-align: center;">
                      <div style="font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase;">🇪🇺 EUR (€)</div>
                      <div style="font-size: 15px; font-weight: 900; font-family: monospace; color: #111827; margin-top: 4px; white-space: nowrap;">€${Math.round(totalFare / 330).toLocaleString()}</div>
                      <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">Euro</div>
                    </td>
                    <td class="currency-card" width="25%" valign="top" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 6px; text-align: center;">
                      <div style="font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase;">🇬🇧 GBP (£)</div>
                      <div style="font-size: 15px; font-weight: 900; font-family: monospace; color: #111827; margin-top: 4px; white-space: nowrap;">£${Math.round(totalFare / 395).toLocaleString()}</div>
                      <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">British Pound</div>
                    </td>
                    <td class="currency-card" width="25%" valign="top" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 6px; text-align: center;">
                      <div style="font-size: 9px; font-weight: bold; color: #6b7280; text-transform: uppercase;">🇮🇳 INR (₹)</div>
                      <div style="font-size: 15px; font-weight: 900; font-family: monospace; color: #111827; margin-top: 4px; white-space: nowrap;">₹${Math.round(totalFare / 3.65).toLocaleString()}</div>
                      <div style="font-size: 8px; color: #6b7280; margin-top: 2px;">Indian Rupee</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Authoritative Fare Breakdown (Mobile Responsive) -->
          <div class="table-section-title">Authoritative Fare Breakdown</div>
          <table class="data-table" width="100%">
            <thead>
              <tr class="mobile-hide">
                <th style="padding: 10px 12px;">Service Breakdown</th>
                <th style="padding: 10px 12px; text-align: center; width: 100px;">Status</th>
                <th style="padding: 10px 12px; text-align: right; width: 120px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 10px 12px;">
                  <strong style="color: #111827; font-size: 13px;">${data.tourTitle ? `${data.tourTitle} (Private Day Tour)` : 'Private Highway Transfer'}</strong><br/>
                  <span style="font-size: 11px; color: #6b7280; line-height: 1.4; display: block; margin-top: 2px;">
                    ${data.tourTitle ? `Reserved ${data.vehicleCategoryName || 'Air-Conditioned Private Vehicle'} with professional chauffeur` : 'Air-conditioned private passenger transport'}
                  </span>
                  <!-- Mobile stacked status and amount bar -->
                  <div class="mobile-show" style="display: none; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">✓ Confirmed</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-weight: 900; font-size: 14px; color: #111827;">${formattedFare}</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
                <td class="mobile-hide" align="center" style="padding: 10px 12px; color: #059669; font-weight: bold; font-size: 11px;">Confirmed</td>
                <td class="mobile-hide" align="right" style="padding: 10px 12px; font-family: monospace; font-weight: bold; font-size: 13px;">${formattedFare}</td>
              </tr>
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 12px;">
                  <span style="font-size: 12px; color: #374151; font-weight: 600;">
                    ${data.tourTitle ? 'Expressway Highway Tolls & Reserved Site Parking Clearances' : 'Southern Expressway (E01) Highway Tolls & Exit Fees'}
                  </span>
                  <!-- Mobile stacked status and amount bar -->
                  <div class="mobile-show" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">INCLUDED</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #6b7280;">Rs. 0 (Inclusive)</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
                <td class="mobile-hide" align="center" style="padding: 10px 12px; font-size: 10px; font-weight: bold; color: #059669;">INCLUDED</td>
                <td class="mobile-hide" align="right" style="padding: 10px 12px; font-size: 12px; color: #6b7280; font-family: monospace; font-weight: 600;">Rs. 0 (Inclusive)</td>
              </tr>
              <tr>
                <td style="padding: 10px 12px;">
                  <span style="font-size: 12px; color: #374151; font-weight: 600;">
                    ${data.tourTitle ? 'Full Day Fuel & Professional Chauffeur Allowance' : 'Fuel & Chauffeur Transit Allowance'}
                  </span>
                  <!-- Mobile stacked status and amount bar -->
                  <div class="mobile-show" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">INCLUDED</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #6b7280;">Rs. 0 (Inclusive)</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
                <td class="mobile-hide" align="center" style="padding: 10px 12px; font-size: 10px; font-weight: bold; color: #059669;">INCLUDED</td>
                <td class="mobile-hide" align="right" style="padding: 10px 12px; font-size: 12px; color: #6b7280; font-family: monospace; font-weight: 600;">Rs. 0 (Inclusive)</td>
              </tr>
              ${data.tourTitle ? `
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 12px;">
                  <span style="font-size: 12px; color: #374151; font-weight: 600;">Door-to-Door Hotel Pickup & Return Transfer</span>
                  <div class="mobile-show" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">INCLUDED</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #6b7280;">Rs. 0 (Inclusive)</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
                <td class="mobile-hide" align="center" style="padding: 10px 12px; font-size: 10px; font-weight: bold; color: #059669;">INCLUDED</td>
                <td class="mobile-hide" align="right" style="padding: 10px 12px; font-size: 12px; color: #6b7280; font-family: monospace; font-weight: 600;">Rs. 0 (Inclusive)</td>
              </tr>` : ''}
              ${data.flightNumber ? `
              <tr style="background-color: #f9fafb;">
                <td style="padding: 10px 12px;">
                  <span style="font-size: 12px; color: #374151; font-weight: 600;">Airport Flight Delay Waiting (Up to 90 mins post-landing)</span>
                  <div class="mobile-show" style="display: none; margin-top: 6px; padding-top: 6px; border-top: 1px dashed #e5e7eb;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="background-color: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">FREE</span>
                        </td>
                        <td align="right">
                          <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #6b7280;">Rs. 0 (Free)</span>
                        </td>
                      </tr>
                    </table>
                  </div>
                </td>
                <td class="mobile-hide" align="center" style="padding: 10px 12px; font-size: 10px; font-weight: bold; color: #059669;">FREE</td>
                <td class="mobile-hide" align="right" style="padding: 10px 12px; font-size: 12px; color: #6b7280; font-family: monospace; font-weight: 600;">Rs. 0 (Free)</td>
              </tr>` : ''}
              <tr class="total-row">
                <td colspan="3" style="padding: 14px 12px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td class="mobile-block" valign="middle">
                        <strong style="font-size: 13px; text-transform: uppercase; color: #111827;">Net Guaranteed Total Due</strong><br/>
                        <span style="font-size: 11px; color: #6b7280;">Payable in cash upon arrival (LKR, USD, EUR, GBP, or INR accepted)</span>
                      </td>
                      <td class="mobile-stack-right" align="right" valign="middle">
                        <div class="total-fare">${formattedFare}</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Official Verification & Live Trip Tracking Action -->
          <div style="margin-top: 24px; padding: 18px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f9fafb;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="mobile-block" valign="middle">
                  <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #b45309;">
                    OFFICIAL DISPATCH & VERIFICATION RECORD
                  </div>
                  <div style="font-size: 13px; font-weight: bold; color: #111827; margin-top: 3px;">
                    Galle Taxi Central Dispatch Desk
                  </div>
                  <div style="font-size: 11px; color: #4b5563; margin-top: 2px;">
                    Verification Code: <strong style="font-family: monospace; color: #111827;">${data.bookingReference}</strong> &nbsp;|&nbsp; 24/7 Client Dispatch Active
                  </div>
                </td>
                <td class="mobile-stack-right" align="right" valign="middle">
                  <a href="${trackingUrl}" class="cta-btn" target="_blank" style="display: inline-block; background-color: #f5b91b; color: #000000 !important; font-weight: 800; font-size: 12px; padding: 10px 20px; border-radius: 8px; text-decoration: none;">
                    Open Live Tracking & Details ➔
                  </a>
                </td>
              </tr>
            </table>
          </div>

        </div>

        <!-- Footer -->
        <div class="footer">
          <strong>Galle Taxi Operations Central Dispatch Desk</strong><br/>
          Rampart Street, Galle Dutch Fort, Southern Province 80000, Sri Lanka<br/>
          24/7 Hotline: <a href="tel:${(data.dispatcherPhone || '+94771234567').replace(/[^0-9+]/g, '')}" style="color: #ffffff; text-decoration: underline;">${data.dispatcherPhone || '+94 77 123 4567'}</a> &nbsp;|&nbsp; WhatsApp: <a href="https://wa.me/${(data.dispatcherWhatsapp || data.dispatcherPhone || '94771234567').replace(/[^0-9]/g, '')}" style="color: #25d366; text-decoration: underline;" target="_blank">Chat on WhatsApp</a> &nbsp;|&nbsp; Support: <a href="mailto:support@galletaxi.lk" style="color: #f5b91b; text-decoration: underline;">support@galletaxi.lk</a><br/>
          <em>This official confirmation voucher constitutes a confirmed travel contract with Galle Taxi Cabs.</em>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Robust Multi-channel Email Dispatcher
 * Priority 1: Resend API (with support@galletaxi.lk as requested)
 * Priority 2: Gmail SMTP (nodemailer)
 * Priority 3: Structured fallback simulation & diagnostic console logging
 */
async function deliverEmail({
  recipients,
  subject,
  html,
  resendApiKey,
  gmailUser,
  gmailAppPassword,
}: {
  recipients: string[];
  subject: string;
  html: string;
  resendApiKey?: string;
  gmailUser?: string;
  gmailAppPassword?: string;
}): Promise<{
  success: boolean;
  method: string;
  messageId?: string;
  simulated?: boolean;
  recipients: string[];
  error?: string;
  diagnostic?: string;
}> {
  const cleanRecipients = recipients
    .map((r) => cleanEmail(r))
    .filter((r) => r && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r));

  if (cleanRecipients.length === 0) {
    cleanRecipients.push(DEFAULT_DISPATCHER_EMAIL);
  }

  const effectiveResendKey = getParsedResendApiKey(resendApiKey);
  const effectiveGmailUser = cleanEmail(gmailUser || process.env.GMAIL_USER || DEFAULT_DISPATCHER_EMAIL);
  const effectiveGmailPass = cleanEnvValue(gmailAppPassword) || cleanEnvValue(process.env.GMAIL_APP_PASSWORD);

  const failureDiagnostics: string[] = [];

  // 1. Try Resend first as requested: sender support@galletaxi.lk
  if (effectiveResendKey) {
    const primaryFrom = getCleanFromAddress(process.env.RESEND_FROM_EMAIL);
    const maskedKey = `${effectiveResendKey.slice(0, 7)}...${effectiveResendKey.slice(-4)}`;
    console.info(`[Resend Email Dispatcher] Initiating live delivery with key (${maskedKey}) strictly from "${primaryFrom}" to customer [${cleanRecipients.join(', ')}] with subject: "${subject}"`);

    try {
      const resend = new Resend(effectiveResendKey);

      const { data, error } = await resend.emails.send({
        from: primaryFrom,
        to: cleanRecipients,
        replyTo: DEFAULT_SUPPORT_EMAIL,
        headers: {
          'Reply-To': DEFAULT_SUPPORT_EMAIL,
        },
        subject,
        html,
      });

      if (!error && data?.id) {
        console.info(`[Resend Email Dispatcher] SUCCESS: Message ID ${data.id} dispatched directly to customer from "${primaryFrom}" to [${cleanRecipients.join(', ')}]`);
        return {
          success: true,
          method: 'resend',
          messageId: data.id,
          recipients: cleanRecipients,
        };
      }

      if (error) {
        const errorDetail = {
          name: error.name || 'ResendApiError',
          message: error.message,
          statusCode: (error as any).statusCode || (error as any).status,
          code: (error as any).code,
          from: primaryFrom,
          recipients: cleanRecipients,
        };
        console.error('[Resend Email Dispatcher] ERROR returned by Resend API:', JSON.stringify(errorDetail, null, 2));
        failureDiagnostics.push(`Resend API Error: ${error.message} (${error.name || 'API failure'})`);
      }
    } catch (err: any) {
      console.error('[Resend Email Dispatcher] UNCAUGHT RESEND EXCEPTION:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });
      failureDiagnostics.push(`Resend Runtime Exception: ${err.message}`);
    }
  } else {
    const missingResendMsg = 'RESEND_API_KEY is not defined in environment variables (process.env.RESEND_API_KEY) or booking payload.';
    console.warn(`[Resend Email Dispatcher Notice] ${missingResendMsg} Skipping Resend live send.`);
    failureDiagnostics.push(missingResendMsg);
  }

  // 2. Secondary: Try Gmail SMTP if configured
  if (effectiveGmailPass && effectiveGmailUser) {
    try {
      console.info(`[Gmail SMTP Dispatcher] Attempting fallback delivery via Gmail account "${effectiveGmailUser}"...`);
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: effectiveGmailUser,
          pass: effectiveGmailPass,
        },
      });

      const info = await transporter.sendMail({
        from: `Galle Taxi <${DEFAULT_SUPPORT_EMAIL}>`,
        replyTo: DEFAULT_SUPPORT_EMAIL,
        headers: {
          'Reply-To': DEFAULT_SUPPORT_EMAIL,
        },
        to: cleanRecipients,
        subject,
        html,
      });

      console.info(`[Gmail SMTP Dispatcher] SUCCESS: Message ID ${info.messageId} to [${cleanRecipients.join(', ')}]`);
      return {
        success: true,
        method: 'gmail-smtp',
        messageId: info.messageId,
        recipients: cleanRecipients,
      };
    } catch (err: any) {
      console.error('[Gmail SMTP Dispatcher] ERROR sending via Gmail SMTP:', {
        message: err.message,
        code: err.code,
      });
      failureDiagnostics.push(`Gmail SMTP Error: ${err.message}`);
    }
  } else {
    failureDiagnostics.push('GMAIL_APP_PASSWORD is not configured for secondary SMTP.');
  }

  // 3. Fallback: Automated simulation & diagnostic dispatch record logging
  const diagnosticSummary = failureDiagnostics.join(' | ');
  console.warn(
    `[Galle Taxi Email Dispatcher - Smooth Simulation Fallback]\n` +
    `Notice: Live email delivery was not executed. Reason(s):\n  ➔ ${failureDiagnostics.join('\n  ➔ ')}\n` +
    `Safeguard: The booking confirmation & Tax Receipt was compiled and safely recorded for customer [${cleanRecipients.join(', ')}] with zero UI interruption.`
  );

  return {
    success: true,
    simulated: true,
    method: 'logged',
    recipients: cleanRecipients,
    messageId: `log-${Date.now()}`,
    error: !effectiveResendKey ? 'RESEND_API_KEY missing' : 'Live transport unavailable',
    diagnostic: diagnosticSummary,
  };
}

/**
 * POST /api/send-receipt
 * Automatically sends confirmation email & official Tax Invoice to customer and dispatcher
 * Sender: support@galletaxi.lk via Resend
 */
app.post('/api/send-receipt', async (req, res) => {
  const payload: ReceiptEmailData = req.body;
  const bookingRef = payload.bookingReference || `GT-${Date.now().toString().slice(-4)}`;
  const passengerName = payload.customerName || 'Passenger';
  const customerEmail = cleanEmail(payload.customerEmail);
  const dispatcherEmail = cleanEmail(payload.dispatcherEmail || DEFAULT_DISPATCHER_EMAIL);

  // Recipient list: Simultaneous delivery to customer, support@galletaxi.lk, and explicitly to galletaxi.lk@gmail.com
  const recipients: string[] = [];
  if (customerEmail) {
    recipients.push(customerEmail);
  }
  if (!recipients.includes(OFFICIAL_DISPATCH_EMAIL)) {
    recipients.push(OFFICIAL_DISPATCH_EMAIL);
  }
  if (!recipients.includes(GMAIL_DISPATCH_INBOX)) {
    recipients.push(GMAIL_DISPATCH_INBOX);
  }
  if (dispatcherEmail && !recipients.includes(dispatcherEmail)) {
    recipients.push(dispatcherEmail);
  }

  const subject = `[Booking Confirmed: ${bookingRef}] Galle Taxi: ${payload.pickupLocation} ➔ ${payload.destination}`;
  const html = generateOfficialReceiptHtml(payload);

  try {
    const result = await deliverEmail({
      recipients,
      subject,
      html,
      resendApiKey: payload.apiKey,
      gmailUser: payload.gmailUser,
      gmailAppPassword: payload.gmailAppPassword,
    });

    return res.json({
      ...result,
      receiptNumber: `REC-${bookingRef}`,
      diagnostic: result.diagnostic,
      message: result.simulated
        ? `Booking Confirmation & Tax Invoice REC-${bookingRef} simulated & recorded. Diagnostic: ${result.diagnostic || 'No live key configured'}`
        : `Booking Confirmation & Tax Invoice REC-${bookingRef} automatically delivered to ${recipients.join(', ')} via ${result.method} (from ${DEFAULT_SUPPORT_EMAIL}).`,
    });
  } catch (err: any) {
    console.error('Receipt dispatch failure:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/send-confirmation
 * Automatically sends booking confirmation voucher & invoice to customer and dispatcher
 * Sender: support@galletaxi.lk via Resend
 */
app.post('/api/send-confirmation', async (req, res) => {
  const payload: ReceiptEmailData = req.body;
  const bookingRef = payload.bookingReference || `GT-${Date.now().toString().slice(-4)}`;
  const passengerName = payload.customerName || 'Passenger';
  const customerEmail = cleanEmail(payload.customerEmail);
  const dispatcherEmail = cleanEmail(payload.dispatcherEmail || DEFAULT_DISPATCHER_EMAIL);

  // Recipient list: Simultaneous delivery to customer, support@galletaxi.lk, and explicitly to galletaxi.lk@gmail.com
  const recipients: string[] = [];
  if (customerEmail) {
    recipients.push(customerEmail);
  }
  if (!recipients.includes(OFFICIAL_DISPATCH_EMAIL)) {
    recipients.push(OFFICIAL_DISPATCH_EMAIL);
  }
  if (!recipients.includes(GMAIL_DISPATCH_INBOX)) {
    recipients.push(GMAIL_DISPATCH_INBOX);
  }
  if (dispatcherEmail && !recipients.includes(dispatcherEmail)) {
    recipients.push(dispatcherEmail);
  }

  const subject = `[Booking Confirmed: ${bookingRef}] Galle Taxi Voucher & Invoice: ${payload.pickupLocation} ➔ ${payload.destination}`;
  const html = generateOfficialReceiptHtml(payload);

  try {
    const result = await deliverEmail({
      recipients,
      subject,
      html,
      resendApiKey: payload.apiKey,
      gmailUser: payload.gmailUser,
      gmailAppPassword: payload.gmailAppPassword,
    });

    return res.json({
      ...result,
      receiptNumber: `REC-${bookingRef}`,
      diagnostic: result.diagnostic,
      message: result.simulated
        ? `Booking Confirmation & Tax Invoice REC-${bookingRef} simulated & recorded. Diagnostic: ${result.diagnostic || 'No live key configured'}`
        : `Booking Confirmation & Tax Invoice REC-${bookingRef} processed for ${recipients.join(', ')} via ${result.method}.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/test-email
 * Tests live email connection (Resend or Gmail SMTP) directly to galletaxi.lk@gmail.com
 */
app.post('/api/test-email', async (req, res) => {
  const { apiKey, gmailUser, gmailAppPassword, targetEmail } = req.body;
  const recipient = cleanEmail(targetEmail || DEFAULT_DISPATCHER_EMAIL);

  const sampleData: ReceiptEmailData = {
    bookingReference: `GT-TEST-${Math.floor(1000 + Math.random() * 9000)}`,
    customerName: 'Galle Taxi Dispatcher Test',
    customerEmail: recipient,
    phone: '+94 77 123 4567',
    pickupLocation: 'Galle Dutch Fort, Southern Province',
    destination: 'Bandaranaike International Airport (CMB)',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '10:00',
    vehicleCategoryName: 'Executive Hybrid Sedan (Air-conditioned)',
    vehiclePlate: 'CAB-8941',
    driverName: 'Nuwan Perera',
    driverPhone: '+94 77 987 6543',
    passengerCount: 2,
    luggageCount: 2,
    flightNumber: 'UL 504',
    nameboardText: 'MR. & MRS. SMITH',
    estimatedFare: 18500,
    finalFare: 18500,
    specialInstructions: 'Test receipt delivery verification',
    dispatcherEmail: DEFAULT_DISPATCHER_EMAIL,
    apiKey,
    gmailUser,
    gmailAppPassword,
  };

  const subject = `[Test Receipt & Tax Invoice] Galle Taxi Email Delivery Verification`;
  const html = generateOfficialReceiptHtml(sampleData);

  try {
    const result = await deliverEmail({
      recipients: [recipient],
      subject,
      html,
      resendApiKey: apiKey,
      gmailUser,
      gmailAppPassword,
    });

    return res.json({
      ...result,
      message: result.simulated
        ? `Test Receipt logged for ${recipient}. To send live emails, configure GMAIL_APP_PASSWORD or RESEND_API_KEY.`
        : `Sample Tax Receipt successfully delivered to ${recipient} via ${result.method}!`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/receipt/preview
 * Renders the official responsive email HTML template for live browser inspection
 */
app.get('/api/receipt/preview', (req, res) => {
  const sampleData: ReceiptEmailData = {
    bookingReference: 'GT-2026-7930',
    customerName: 'Alexander Wright',
    customerEmail: 'alex.wright@example.com',
    phone: '+44 7911 123456',
    pickupLocation: 'Galle Fort Heritage Villa',
    destination: 'Bandaranaike International Airport (CMB)',
    pickupDate: '2026-03-15',
    pickupTime: '06:30',
    vehicleCategoryName: 'Executive Sedan',
    passengerCount: 2,
    luggageCount: 2,
    flightNumber: 'UL 504',
    nameboardText: 'MR. WRIGHT',
    estimatedFare: 15000,
    finalFare: 15000,
    dispatcherPhone: '+94 77 123 4567',
    dispatcherWhatsapp: '+94 77 123 4567',
  };

  const html = generateOfficialReceiptHtml(sampleData);
  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

/**
 * POST /api/test-resend (legacy alias)
 */
app.post('/api/test-resend', async (req, res) => {
  const { apiKey, testEmail } = req.body;
  const recipient = cleanEmail(testEmail || DEFAULT_DISPATCHER_EMAIL);
  try {
    const result = await deliverEmail({
      recipients: [recipient],
      subject: 'Galle Taxi - Resend API Test Connection',
      html: `
        <div style="font-family: sans-serif; padding: 24px; background: #141417; color: #ffffff; border-radius: 12px; border: 1px solid #f5b91b;">
          <h2 style="color: #f5b91b; margin-top: 0;">Galle Taxi Dispatch Email Connection Active</h2>
          <p>Your automated receipt delivery system is operational.</p>
          <p style="font-size: 11px; color: #9ca3af;">Timestamp: ${new Date().toISOString()}</p>
        </div>
      `,
      resendApiKey: apiKey,
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

const execFileAsync = promisify(execFile);

async function saveUploadPreferWebp(
  targetDir: string,
  baseName: string,
  rawImageData: string
): Promise<{ filename: string; bytes: number; mimeType: string }> {
  const matches = rawImageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  let buffer: Buffer;
  let ext = 'webp';

  if (matches && matches.length === 3) {
    const mime = matches[1].toLowerCase();
    if (mime.includes('jpeg') || mime.includes('jpg')) ext = 'jpg';
    else if (mime.includes('png')) ext = 'png';
    else if (mime.includes('webp')) ext = 'webp';
    else if (mime.includes('svg')) ext = 'svg';
    else if (mime.includes('gif')) ext = 'gif';
    buffer = Buffer.from(matches[2], 'base64');
  } else {
    buffer = Buffer.from(rawImageData.replace(/^data:[^;]+;base64,/, ''), 'base64');
  }

  const stamp = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  // Already WebP or SVG vector -> write directly
  if (ext === 'webp' || ext === 'svg') {
    const finalName = `${baseName}_${stamp}.${ext}`;
    const finalPath = path.resolve(targetDir, finalName);
    fs.writeFileSync(finalPath, buffer);
    return {
      filename: finalName,
      bytes: buffer.length,
      mimeType: ext === 'svg' ? 'image/svg+xml' : 'image/webp',
    };
  }

  // Raw PNG/JPG/GIF payload -> convert to optimized WebP on server using ImageMagick
  const tmpInputPath = path.resolve(targetDir, `.tmp_${baseName}_${stamp}.${ext}`);
  const webpName = `${baseName}_${stamp}.webp`;
  const webpPath = path.resolve(targetDir, webpName);

  try {
    fs.writeFileSync(tmpInputPath, buffer);
    await execFileAsync('convert', [
      tmpInputPath,
      '-auto-orient',
      '-strip',
      '-resize',
      '1600x1000>',
      '-quality',
      '85',
      '-define',
      'webp:method=6',
      '-define',
      'webp:alpha-quality=95',
      webpPath,
    ]);
    try {
      fs.unlinkSync(tmpInputPath);
    } catch {}
    const stat = fs.statSync(webpPath);
    return {
      filename: webpName,
      bytes: stat.size,
      mimeType: 'image/webp',
    };
  } catch (convErr) {
    console.warn('[Galle Taxi] Server WebP conversion fallback to original format:', convErr);
    try {
      if (fs.existsSync(tmpInputPath)) {
        const fallbackName = `${baseName}_${stamp}.${ext}`;
        const fallbackPath = path.resolve(targetDir, fallbackName);
        fs.renameSync(tmpInputPath, fallbackPath);
        return {
          filename: fallbackName,
          bytes: buffer.length,
          mimeType: ext === 'png' ? 'image/png' : 'image/jpeg',
        };
      }
    } catch {}
    const finalName = `${baseName}_${stamp}.${ext}`;
    fs.writeFileSync(path.resolve(targetDir, finalName), buffer);
    return {
      filename: finalName,
      bytes: buffer.length,
      mimeType: ext === 'png' ? 'image/png' : 'image/jpeg',
    };
  }
}

/**
 * POST /api/upload-tour-image
 * Dedicated tour image upload handler that stores optimized WebP image files safely in /public/uploads/tours
 * and serves them as static URLs (/uploads/tours/...) to eliminate localStorage quota issues.
 */
app.post('/api/upload-tour-image', async (req, res) => {
  try {
    const { image, filename, folder } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    // Determine target subfolder (covers vs gallery)
    const targetFolder = folder === 'gallery' ? 'gallery' : 'covers';
    const subDir = path.resolve(tourUploadsDir, targetFolder);
    if (!fs.existsSync(subDir)) {
      fs.mkdirSync(subDir, { recursive: true });
    }

    const safeBaseName = (filename || 'tour_image')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40) || 'tour_image';

    const saved = await saveUploadPreferWebp(subDir, safeBaseName, image);
    const publicUrl = `/uploads/tours/${targetFolder}/${saved.filename}`;
    console.info(`[Galle Taxi] Tour image successfully uploaded and saved: ${publicUrl} (${saved.bytes} bytes, ${saved.mimeType})`);

    return res.json({
      success: true,
      url: publicUrl,
      size: saved.bytes,
      mimeType: saved.mimeType,
      filename: saved.filename,
    });
  } catch (err: any) {
    console.error('[Galle Taxi] Tour image upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save tour image' });
  }
});

/**
 * POST /api/upload-hub-image
 * Dedicated handler that stores Southern Coast Taxi Hub images as optimized WebP in /public/uploads/hubs
 * and serves them as static URLs (/uploads/hubs/...) to eliminate base64 and quota issues.
 */
app.post('/api/upload-hub-image', async (req, res) => {
  try {
    const { image, filename, hubSlug } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ success: false, error: 'No image data provided' });
    }

    if (!fs.existsSync(hubsUploadsDir)) {
      fs.mkdirSync(hubsUploadsDir, { recursive: true });
    }

    const safeBaseName = (hubSlug || filename || 'hub_banner')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40) || 'hub_banner';

    const saved = await saveUploadPreferWebp(hubsUploadsDir, safeBaseName, image);
    const publicUrl = `/uploads/hubs/${saved.filename}`;
    console.info(`[Galle Taxi] Hub image successfully uploaded and saved: ${publicUrl} (${saved.bytes} bytes, ${saved.mimeType})`);

    return res.json({
      success: true,
      url: publicUrl,
      size: saved.bytes,
      mimeType: saved.mimeType,
      filename: saved.filename,
    });
  } catch (err: any) {
    console.error('[Galle Taxi] Hub image upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Failed to save hub image' });
  }
});

/**
 * Public Fleet Cache Endpoints (/api/public/vehicles & /api/fleet/sync)
 * Keeps a persistent server-side copy of admin-managed vehicles in /public/uploads/fleet-cache.json
 * for instant initial public fleet hydration alongside live Cloud Firestore sync.
 */
const fleetCachePath = path.resolve(uploadsDir, 'fleet-cache.json');

app.get('/api/public/vehicles', (_req, res) => {
  try {
    if (fs.existsSync(fleetCachePath)) {
      const raw = fs.readFileSync(fleetCachePath, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.vehicles) && parsed.vehicles.length > 0) {
        return res.json({
          success: true,
          vehicles: parsed.vehicles,
          updatedAt: parsed.updatedAt || null,
        });
      }
    }
    return res.json({ success: true, vehicles: [], updatedAt: null });
  } catch (err: any) {
    console.warn('[Galle Taxi] Failed to read fleet-cache.json:', err?.message || err);
    return res.json({ success: true, vehicles: [], updatedAt: null });
  }
});

app.post('/api/fleet/sync', (req, res) => {
  try {
    const incoming = req.body?.vehicles;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ success: false, error: 'Non-empty vehicles array required' });
    }
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const payload = {
      updatedAt: new Date().toISOString(),
      vehicles: incoming,
    };
    fs.writeFileSync(fleetCachePath, JSON.stringify(payload), 'utf-8');
    return res.json({ success: true, count: incoming.length, updatedAt: payload.updatedAt });
  } catch (err: any) {
    console.warn('[Galle Taxi] Failed to write fleet-cache.json:', err?.message || err);
    return res.status(500).json({ success: false, error: err?.message || 'Sync failed' });
  }
});

/**
 * Dedicated routes for /sitemap.xml and /robots.txt
 * Guarantees pure XML and plain text delivery with proper headers, preventing SPA HTML fallback.
 */
app.get(['/sitemap.xml', '/sitemap'], (_req, res) => {
  const publicSitemap = path.resolve(__dirname, 'public', 'sitemap.xml');
  const distSitemap = path.resolve(__dirname, 'dist', 'sitemap.xml');
  const targetPath = fs.existsSync(publicSitemap) ? publicSitemap : fs.existsSync(distSitemap) ? distSitemap : null;

  if (targetPath) {
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(targetPath);
  }
  return res.status(404).type('text/plain').send('sitemap.xml not found');
});

app.get('/robots.txt', (_req, res) => {
  const publicRobots = path.resolve(__dirname, 'public', 'robots.txt');
  const distRobots = path.resolve(__dirname, 'dist', 'robots.txt');
  const targetPath = fs.existsSync(publicRobots) ? publicRobots : fs.existsSync(distRobots) ? distRobots : null;

  if (targetPath) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.sendFile(targetPath);
  }
  return res.status(404).type('text/plain').send('robots.txt not found');
});

/**
 * Launch Server: Mount Vite in development, static files in production
 */
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    let viteMiddlewares: express.RequestHandler | null = null;
    let viteInitError: Error | null = null;

    const viteReady = createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'spa',
    })
      .then((vite) => {
        viteMiddlewares = vite.middlewares;
      })
      .catch((err) => {
        viteInitError = err instanceof Error ? err : new Error(String(err));
        console.error('[Galle Taxi] Failed to initialize Vite dev middleware:', viteInitError);
      });

    app.use(async (req, res, next) => {
      await viteReady;
      if (viteInitError) return next(viteInitError);
      if (viteMiddlewares) return viteMiddlewares(req, res, next);
      return next();
    });
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[Galle Taxi] Full-stack dev server active on http://0.0.0.0:${port}`);
  });
}

startServer();
