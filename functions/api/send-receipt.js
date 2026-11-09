/**
 * Cloudflare Pages Function: /api/send-receipt
 * Handles POST /api/send-receipt requests to dispatch booking confirmation emails & tax invoices via Resend.
 * 
 * Fully compatible with Cloudflare Pages Functions runtime (Edge/V8) & standard Node.js environments.
 */

const OFFICIAL_DISPATCH_EMAIL = 'support@galletaxi.lk';
const GMAIL_DISPATCH_INBOX = 'galletaxi.lk@gmail.com';
const DEFAULT_SUPPORT_EMAIL = 'support@galletaxi.lk';
const DEFAULT_FROM_ADDRESS = 'Galle Taxi <support@galletaxi.lk>';

/**
 * Safely extracts RESEND_API_KEY from Cloudflare Pages context bindings, Node process.env, or client payload.
 */
function getResendApiKey(context, payload) {
  const env = (context && context.env) || {};
  let key =
    env.RESEND_API_KEY ||
    (typeof process !== 'undefined' && process?.env?.RESEND_API_KEY) ||
    env.VITE_RESEND_API_KEY ||
    (typeof process !== 'undefined' && process?.env?.VITE_RESEND_API_KEY) ||
    payload?.apiKey;

  if (typeof key === 'string') {
    key = key.replace(/^["']|["']$/g, '').trim();
  }
  return key || '';
}

function cleanEmail(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/^["']|["']$/g, '').trim();
}

/**
 * Generates official executive responsive HTML tax receipt & booking invoice for Galle Taxi
 */
function generateOfficialReceiptHtml(data) {
  const receiptNo = `REC-${data.bookingReference || 'GT'}`;
  const totalFare = Number(data.finalFare || data.estimatedFare || 0);
  const formattedFare = `Rs. ${totalFare.toLocaleString()}`;
  const appBaseUrl = data.appUrl || 'https://galletaxi.lk';
  const cleanPhone = (data.phone || '').replace(/[^0-9]/g, '');
  const trackingUrl = `${appBaseUrl}/track-booking?ref=${encodeURIComponent(
    data.bookingReference || ''
  )}&phone=${encodeURIComponent(cleanPhone)}`;

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

        <div class="receipt-body">
          <div class="hero-banner">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="mobile-block" valign="middle">
                  <div class="hero-id-label">OFFICIAL BOOKING ID</div>
                  <div class="hero-booking-id">${data.bookingReference || 'GT-RESERVATION'}</div>
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

            <div class="hero-route-box">
              <div class="hero-route-label">CONFIRMED TRANSFER ROUTE</div>
              <div class="hero-route-val">
                ${data.pickupLocation || 'Pickup Location'} <span style="color: #ffffff; margin: 0 4px;">➔</span> ${data.destination || 'Destination'}
              </div>
            </div>

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

          <table class="summary-grid">
            <tr>
              <td class="summary-col" width="33%">
                <div class="label">Primary Passenger</div>
                <div class="val">${data.customerName || 'Valued Passenger'}</div>
                <div style="font-size: 11px; margin-top: 4px;">
                  <a href="tel:${(data.phone || '').replace(/[^0-9+]/g, '')}" style="color: #111827; font-family: monospace; font-weight: bold; text-decoration: underline;">${data.phone || 'N/A'}</a>
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

          <div class="table-section-title">Transfer Route & Vehicle Schedule</div>
          <table class="data-table">
            <tr>
              <td width="30%" style="color: #6b7280; font-weight: 600;">Booking ID</td>
              <td style="font-weight: 800; font-family: monospace; color: #b45309;">${data.bookingReference || 'N/A'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Transfer Route</td>
              <td style="font-weight: 800; color: #111827;">${data.pickupLocation || 'Pickup'} ➔ ${data.destination || 'Destination'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Reserved Vehicle</td>
              <td style="font-weight: 800; color: #111827;">🚗 ${data.vehicleCategoryName || 'Air-Conditioned Private Vehicle'}</td>
            </tr>
            <tr>
              <td style="color: #6b7280; font-weight: 600;">Pickup Schedule</td>
              <td style="font-weight: 800; color: #111827;">${data.pickupDate || 'Today'} at ${data.pickupTime || 'Flexible'}</td>
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

          <!-- Multi-Currency Guaranteed Pricing -->
          <div class="table-section-title">Authoritative Multi-Currency Pricing</div>
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
                    Air-conditioned private passenger transport
                  </span>
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
                    Southern Expressway (E01) Highway Tolls & Exit Fees
                  </span>
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
                    Fuel & Professional Chauffeur Allowance
                  </span>
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
                    Verification Code: <strong style="font-family: monospace; color: #111827;">${data.bookingReference || 'GT'}</strong> &nbsp;|&nbsp; 24/7 Client Dispatch Active
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
 * Core handler for POST /api/send-receipt
 */
export async function handleSendReceipt(context) {
  let payload = {};
  try {
    payload = await context.request.json();
  } catch (e) {
    payload = {};
  }

  const bookingRef = payload.bookingReference || `GT-${Date.now().toString().slice(-4)}`;
  const customerEmail = cleanEmail(payload.customerEmail);
  const dispatcherEmail = cleanEmail(payload.dispatcherEmail || DEFAULT_SUPPORT_EMAIL);

  const recipients = [];
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

  const subject = `[Booking Confirmed: ${bookingRef}] Galle Taxi: ${payload.pickupLocation || 'Galle'} ➔ ${payload.destination || 'Airport'}`;
  const html = generateOfficialReceiptHtml(payload);
  const resendApiKey = getResendApiKey(context, payload);
  const primaryFrom = (context?.env?.RESEND_FROM_EMAIL || DEFAULT_FROM_ADDRESS).replace(/^["']|["']$/g, '').trim();

  // If no RESEND_API_KEY is available, return graceful simulation status
  if (!resendApiKey) {
    console.warn(`[Cloudflare Pages Functions] RESEND_API_KEY missing in context.env. Simulated confirmation for ${bookingRef}`);
    return new Response(
      JSON.stringify({
        success: true,
        simulated: true,
        method: 'logged',
        receiptNumber: `REC-${bookingRef}`,
        recipients,
        diagnostic: 'RESEND_API_KEY is not defined in Cloudflare Pages environment variables.',
        message: `Booking Confirmation & Tax Invoice REC-${bookingRef} recorded safely. (Live email delivery requires RESEND_API_KEY in Cloudflare Pages Settings -> Environment Variables).`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  try {
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: primaryFrom,
        to: recipients,
        reply_to: DEFAULT_SUPPORT_EMAIL,
        headers: {
          'Reply-To': DEFAULT_SUPPORT_EMAIL,
        },
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json().catch(() => ({}));

    if (resendResponse.ok && resendData?.id) {
      console.info(`[Cloudflare Pages Functions] Resend SUCCESS: ${resendData.id} to ${recipients.join(', ')}`);
      return new Response(
        JSON.stringify({
          success: true,
          method: 'resend',
          messageId: resendData.id,
          receiptNumber: `REC-${bookingRef}`,
          recipients,
          message: `Booking Confirmation & Tax Invoice REC-${bookingRef} automatically delivered to ${recipients.join(', ')} via Resend (from ${DEFAULT_SUPPORT_EMAIL}).`,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    } else {
      console.error('[Cloudflare Pages Functions] Resend API Error:', resendData);
      return new Response(
        JSON.stringify({
          success: false,
          error: resendData.message || 'Resend API returned an error',
          diagnostic: resendData,
          receiptNumber: `REC-${bookingRef}`,
          recipients,
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  } catch (err) {
    console.error('[Cloudflare Pages Functions] Exception dispatching email:', err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Network exception during Resend API call',
        receiptNumber: `REC-${bookingRef}`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

/**
 * Cloudflare Pages Function entry points
 */
export async function onRequestPost(context) {
  return handleSendReceipt(context);
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
    return handleSendReceipt(context);
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
