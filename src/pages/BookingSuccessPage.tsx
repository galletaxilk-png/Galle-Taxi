import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  CheckCircle,
  Copy,
  MessageSquare,
  Clock,
  MapPin,
  Calendar,
  Car,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Share2,
  Plane,
  UserCheck,
  Mail,
  Printer,
  Send,
  ExternalLink,
  CheckCircle2,
  Receipt,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { Booking } from '../types';
import { formatLKR } from '../lib/fareEngine';
import { findTourForBooking } from '../lib/toursData';
import { BookingReceiptModal } from '../components/booking/BookingReceiptModal';
import {
  getCustomerGmailComposeUrl,
  getCustomerMailtoUrl,
  dispatchCustomerEmailVoucher,
  EmailVoucherData,
} from '../lib/emailService';

export const BookingSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingRef = searchParams.get('ref') || 'GT-2026-XXXX';
  const bookingId = searchParams.get('id');
  const paramFlight = searchParams.get('flight');
  const paramNameboard = searchParams.get('nameboard');
  const paramEmail = searchParams.get('email');
  const paramTour = searchParams.get('tour');

  const { bookings, siteSettings, currency, formatFare, tours } = useApp();
  const [copied, setCopied] = React.useState(false);

  // Retrieve matching booking if present in state
  const booking = bookings.find((b) => b.id === bookingId || b.bookingReference === bookingRef);
  const flightNumber = booking?.flightNumber || paramFlight || undefined;
  const nameboardText = booking?.nameboardText || paramNameboard || undefined;
  const customerEmail = booking?.email || paramEmail || '';

  const [inputCustomerEmail, setInputCustomerEmail] = React.useState(customerEmail);
  const [emailStatusMessage, setEmailStatusMessage] = React.useState<string | null>(
    customerEmail ? `Confirmation voucher dispatched to ${customerEmail}` : null
  );
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [showEmailInput, setShowEmailInput] = React.useState(!customerEmail);
  const [showReceiptModal, setShowReceiptModal] = React.useState(false);

  // Fallback booking object if page refreshed without in-memory state
  const effectiveBooking: Booking = booking || {
    id: bookingId || 'gt-' + Date.now(),
    bookingReference: bookingRef,
    customerName: 'Passenger',
    phone: '',
    pickupLocation: 'Galle / Airport Transfer',
    destination: 'Sri Lanka',
    pickupDate: new Date().toISOString().split('T')[0],
    pickupTime: '12:00',
    vehicleCategoryId: 'sedan',
    vehicleCategoryName: 'Standard Sedan (Air-conditioned)',
    estimatedFare: 18500,
    passengerCount: 1,
    luggageCount: 1,
    status: 'Confirmed' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    flightNumber,
    nameboardText,
    email: customerEmail || inputCustomerEmail,
  };

  const matchedTour = findTourForBooking(
    booking || {
      tourSlug: paramTour || undefined,
      destination: effectiveBooking.destination,
      specialInstructions: effectiveBooking.specialInstructions,
      vehicleCategoryName: effectiveBooking.vehicleCategoryName,
    },
    tours
  );

  const handleCopyRef = () => {
    navigator.clipboard.writeText(bookingRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const fareDisplay = booking
    ? currency === 'LKR'
      ? formatLKR(booking.estimatedFare)
      : `${formatFare(booking.estimatedFare)} (${formatLKR(booking.estimatedFare)})`
    : 'LKR';

  const voucherData: EmailVoucherData = {
    bookingReference: bookingRef,
    customerName: booking?.customerName || 'Passenger',
    customerEmail: inputCustomerEmail.trim() || customerEmail || 'passenger@example.com',
    phone: booking?.phone || '',
    pickupLocation: booking?.pickupLocation || '',
    destination: booking?.destination || '',
    pickupDate: booking?.pickupDate || '',
    pickupTime: booking?.pickupTime || '',
    vehicleCategoryName: booking?.vehicleCategoryName || 'Private Vehicle',
    passengerCount: booking?.passengerCount || 1,
    luggageCount: booking?.luggageCount || 0,
    flightNumber,
    nameboardText,
    estimatedFare: booking?.estimatedFare || 0,
    specialInstructions: booking?.specialInstructions,
    dispatcherEmail: siteSettings.email,
    dispatcherPhone: siteSettings.phone,
    dispatcherWhatsapp: siteSettings.whatsappNumber,
    tourId: matchedTour?.id,
    tourSlug: matchedTour?.slug,
    tourTitle: matchedTour?.title,
    tourDuration: matchedTour?.duration,
    tourHighlights: matchedTour?.highlights?.map((h) => `${h.title}: ${h.description}`),
    tourItinerary: matchedTour?.itinerary?.map((i) => `${i.time} - ${i.title}: ${i.description}`),
    tourIncluded: matchedTour?.included,
    tourExcluded: matchedTour?.excluded,
  };

  const customerGmailUrl = getCustomerGmailComposeUrl(voucherData);
  const customerMailtoUrl = getCustomerMailtoUrl(voucherData);

  const handleSendCustomerEmail = async (targetEmail: string) => {
    if (!targetEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(targetEmail.trim())) {
      return;
    }
    setIsSendingEmail(true);
    try {
      await dispatchCustomerEmailVoucher({
        ...voucherData,
        customerEmail: targetEmail.trim(),
      });
      setEmailStatusMessage(`Confirmation voucher successfully sent to ${targetEmail.trim()}`);
      setInputCustomerEmail(targetEmail.trim());
      setShowEmailInput(false);
    } catch {
      setEmailStatusMessage(`Voucher prepared for ${targetEmail.trim()}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Hello Galle Taxi! I have placed an online booking.\n\n` +
      `*Reference:* ${bookingRef}\n` +
      `*Passenger:* ${booking?.customerName || 'Guest'}\n` +
      (flightNumber ? `*Arrival Flight:* ${flightNumber}\n` : '') +
      (nameboardText ? `*Airport Greeting Board:* "${nameboardText}"\n` : '') +
      `*Pickup:* ${booking?.pickupLocation || 'Pickup location'}\n` +
      `*Destination:* ${booking?.destination || 'Destination'}\n` +
      `*Date & Time:* ${booking?.pickupDate || 'Date'} at ${booking?.pickupTime || 'Time'}\n` +
      `*Estimated Fare:* ${fareDisplay}\n\n` +
      `Please confirm driver assignment and meet-and-greet details. Thank you!`
  );

  const emailSubject = encodeURIComponent(`New Booking: ${bookingRef} - ${booking?.customerName || 'Guest'}`);
  const emailPlainBody = 
`GALLE TAXI - ONLINE RESERVATION DETAILS
========================================
Booking Reference: ${bookingRef}
Status: Received & Pending Dispatch

CUSTOMER & TRIP DETAILS:
- Passenger Name: ${booking?.customerName || 'Guest'}
- Contact Phone: ${booking?.phone || 'N/A'}
${customerEmail ? `- Email: ${customerEmail}\n` : ''}- Pickup Location: ${booking?.pickupLocation || 'N/A'}
- Destination: ${booking?.destination || 'N/A'}
- Date & Time: ${booking?.pickupDate || 'N/A'} at ${booking?.pickupTime || 'N/A'}
- Selected Vehicle: ${booking?.vehicleCategoryName || 'N/A'}
- Passengers: ${booking?.passengerCount || 1} | Luggage Bags: ${booking?.luggageCount || 0}
${flightNumber ? `- Arrival Flight Number: ${flightNumber}\n` : ''}${nameboardText ? `- Airport Greeting Board: "${nameboardText}"\n` : ''}- Estimated Authoritative Fare: ${fareDisplay}
${booking?.specialInstructions ? `- Special Instructions: ${booking.specialInstructions}\n` : ''}

Dispatch Control:
Galle Taxi Operations, Galle Fort, Sri Lanka
Email: ${siteSettings.email}
Hotline: ${siteSettings.phone}
WhatsApp: ${siteSettings.whatsappNumber}`;

  const emailEncoded = encodeURIComponent(emailPlainBody);
  const gmailDirectUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(siteSettings.email)}&su=${emailSubject}&body=${emailEncoded}`;
  const mailtoUrl = `mailto:${siteSettings.email}?subject=${emailSubject}&body=${emailEncoded}`;

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8 text-center">
        
        {/* Navigation Back Button */}
        <div className="flex items-center justify-between text-left">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F5B91B] bg-[#141416] hover:bg-[#1f1f23] border border-[#27272A] hover:border-[#F5B91B]/40 px-3.5 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
          <div className="text-[11px] text-slate-400 font-mono">
            Booking Confirmed
          </div>
        </div>

        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
          <CheckCircle className="w-10 h-10" />
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            {matchedTour ? 'Reservation Secured • Private Day Tour' : 'Reservation Secured'}
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            {matchedTour ? 'Day Tour Booking Received!' : 'Booking Received Successfully!'}
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            {matchedTour
              ? `Your private day tour to ${matchedTour.title} is confirmed. A dedicated air-conditioned vehicle and local chauffeur are assigned.`
              : 'Your booking reference has been generated and dispatched to our Galle control room. Keep this reference to track your vehicle.'}
          </p>
        </div>

        {/* Reference Highlight Card */}
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 text-left shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold">Your Booking Reference</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono text-[#F5B91B] tracking-wider mt-1">
                {bookingRef}
              </div>
            </div>
            <button
              onClick={handleCopyRef}
              className="px-4 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs font-semibold text-white flex items-center gap-2 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Reference'}</span>
            </button>
          </div>

          {/* Dedicated Day Tour Spotlight */}
          {matchedTour && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-[#1A1A1E] to-[#141416] border border-[#F5B91B]/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F5B91B]/20 text-[#F5B91B] border border-[#F5B91B]/40 text-[10px] font-extrabold uppercase tracking-wider">
                  Exclusive Day Tour Package
                </span>
                <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
                  <span>{matchedTour.duration}</span>
                </span>
              </div>
              <h4 className="text-base sm:text-lg font-black text-white font-['Outfit']">
                {matchedTour.title}
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {matchedTour.shortDescription}
              </p>
              <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
                {matchedTour.highlights.slice(0, 3).map((hl, idx) => (
                  <span key={idx} className="flex items-center gap-1 bg-black/50 px-2 py-0.5 rounded border border-[#27272A]">
                    <CheckCircle2 className="w-3 h-3 text-[#F5B91B]" />
                    <span>{hl.title}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Booking Summary Details */}
          {booking && (
            <div className="space-y-3 text-sm">
              <div className="flex items-start justify-between gap-4 py-2 border-b border-[#1F1F23]">
                <span className="text-slate-400 flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-[#F5B91B]" />
                  Pickup:
                </span>
                <span className="font-semibold text-white text-right">{booking.pickupLocation}</span>
              </div>

              <div className="flex items-start justify-between gap-4 py-2 border-b border-[#1F1F23]">
                <span className="text-slate-400 flex items-center gap-2 text-xs">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Destination:
                </span>
                <span className="font-semibold text-white text-right">{booking.destination}</span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F23]">
                <span className="text-slate-400 flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  Date & Time:
                </span>
                <span className="font-medium text-white">{booking.pickupDate} at {booking.pickupTime}</span>
              </div>

              <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F23]">
                <span className="text-slate-400 flex items-center gap-2 text-xs">
                  <Car className="w-4 h-4 text-slate-400" />
                  Vehicle Category:
                </span>
                <span className="font-medium text-white">{booking.vehicleCategoryName}</span>
              </div>

              {flightNumber && (
                <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F23] bg-[#F5B91B]/5 -mx-2 px-2 rounded-lg">
                  <span className="text-slate-300 flex items-center gap-2 text-xs font-semibold">
                    <Plane className="w-4 h-4 text-[#F5B91B]" />
                    Arrival Flight Number:
                  </span>
                  <span className="font-mono font-bold text-[#F5B91B] tracking-wider">{flightNumber}</span>
                </div>
              )}

              {nameboardText && (
                <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F23] bg-emerald-500/5 -mx-2 px-2 rounded-lg">
                  <span className="text-slate-300 flex items-center gap-2 text-xs font-semibold">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    Airport Greeting Board:
                  </span>
                  <span className="font-bold text-white tracking-wide text-right">"{nameboardText}"</span>
                </div>
              )}

              {(customerEmail || inputCustomerEmail) && (
                <div className="flex items-center justify-between gap-4 py-2 border-b border-[#1F1F23]">
                  <span className="text-slate-400 flex items-center gap-2 text-xs">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    Customer Email:
                  </span>
                  <div className="flex items-center gap-1.5 font-medium text-white text-xs">
                    <span className="font-mono">{customerEmail || inputCustomerEmail}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 font-mono">
                      Voucher Queued
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-2">
                <span className="text-slate-400 text-xs">Estimated Authoritative Fare:</span>
                <div className="text-right">
                  <div className="text-xl font-mono font-bold text-[#F5B91B]">
                    {formatFare(booking.estimatedFare)}
                  </div>
                  {currency !== 'LKR' && (
                    <div className="text-[11px] text-slate-400 font-mono">
                      ≈ {formatLKR(booking.estimatedFare)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dedicated Customer Booking Confirmation Email & Voucher Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-[#101915] to-[#141416] border border-emerald-500/40 text-left space-y-3.5 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-emerald-900/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>Customer Booking Confirmation Email</span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">
                    {emailStatusMessage || 'Automatic Dispatch to Passenger Email'}
                  </div>
                </div>
              </div>

              {customerEmail && !showEmailInput && (
                <button
                  type="button"
                  onClick={() => setShowEmailInput(true)}
                  className="text-[11px] text-slate-300 hover:text-white underline self-start sm:self-auto cursor-pointer"
                >
                  Change Email / Resend
                </button>
              )}
            </div>

            {/* Email Edit or Send Form */}
            {showEmailInput ? (
              <div className="space-y-2 pt-1">
                <label className="text-xs text-slate-300 font-semibold block">
                  Send official booking voucher & fare receipt to customer email:
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    value={inputCustomerEmail}
                    onChange={(e) => setInputCustomerEmail(e.target.value)}
                    placeholder="passenger@example.com"
                    className="w-full sm:flex-1 px-3 py-2 bg-[#0B0B0D] border border-emerald-800/60 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendCustomerEmail(inputCustomerEmail)}
                    disabled={isSendingEmail}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {isSendingEmail ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Voucher Now</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5 bg-[#0B0B0D]/80 p-2.5 rounded-lg border border-emerald-900/40">
                  <span className="text-slate-400">Recipient Customer Email:</span>
                  <span className="font-mono font-bold text-emerald-300 text-right">{customerEmail || inputCustomerEmail}</span>
                </div>

                {/* 1-Click Action Buttons for Customer Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={customerGmailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 rounded-lg bg-[#EA4335] hover:bg-[#D93025] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md hover:scale-[1.01]"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Gmail</span>
                  </a>

                  <a
                    href={customerMailtoUrl}
                    className="py-2.5 px-3 rounded-lg bg-[#1F1F23] hover:bg-[#2A2A30] text-slate-200 border border-[#27272A] font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>Default Mail App</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowReceiptModal(true)}
                    className="py-2.5 px-3 rounded-lg bg-[#F5B91B]/15 hover:bg-[#F5B91B]/25 text-[#F5B91B] border border-[#F5B91B]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Receipt className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>View / Print Receipt</span>
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-[11px] text-slate-400">
              This official voucher contains the passenger booking reference, pickup schedule, flight meet-and-greet placard instructions, and fare receipt.
            </p>
          </div>

          {/* Instant 1-Tap WhatsApp Button */}
          <div className="pt-4 border-t border-[#27272A] space-y-3">
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all hover:scale-[1.01]"
            >
              <MessageSquare className="w-5 h-5 fill-white" />
              <span>Confirm on WhatsApp with 1 Tap</span>
            </a>
            <p className="text-center text-[11px] text-slate-400">
              Direct connection with our 24/7 Galle dispatcher. Get live vehicle plate and chauffeur number immediately on your phone.
            </p>
          </div>

          {/* Instant 1-Tap Gmail / Email Dispatcher */}
          <div className="pt-3 border-t border-[#27272A] space-y-2">
            <div className="text-xs font-semibold text-slate-300 text-left flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Mail className="w-4 h-4 text-[#EA4335]" />
                <span>Email Booking Voucher to Dispatcher:</span>
              </span>
              <span className="text-[11px] font-mono text-[#F5B91B]">{siteSettings.email}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={gmailDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-[#EA4335] hover:bg-[#D93025] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:scale-[1.01]"
              >
                <Mail className="w-4 h-4" />
                <span>Open in Gmail (1-Tap Send)</span>
              </a>

              <a
                href={mailtoUrl}
                className="w-full py-2.5 px-3 rounded-xl bg-[#141416] hover:bg-[#1E1E22] text-slate-200 border border-[#27272A] hover:border-slate-500 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-[#F5B91B]" />
                <span>Default Mail / Outlook</span>
              </a>
            </div>
            <p className="text-center text-[10px] text-slate-500">
              Opens Gmail directly with all booking reference and trip details ready to send to {siteSettings.email}.
            </p>
          </div>
        </div>

        {/* View & Print Official Receipt Banner */}
        <div className="bg-[#141416] border border-[#F5B91B]/40 rounded-2xl p-5 sm:p-6 text-left flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/15 text-[#F5B91B] flex items-center justify-center shrink-0 border border-[#F5B91B]/30">
              <Receipt className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-extrabold text-white font-['Outfit']">
                  {matchedTour ? 'Official Tour Booking Voucher & Invoice' : 'Official Booking Receipt & Travel Invoice'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5B91B]/20 text-[#F5B91B]">
                  REC-{bookingRef}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {matchedTour
                  ? 'Complete printable day tour voucher including experience highlights, day itinerary timeline, and included services.'
                  : 'Complete printable booking voucher and invoice with route itinerary, multi-currency breakdown, expressway toll inclusions & official dispatch verification.'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowReceiptModal(true)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] cursor-pointer shrink-0"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>{matchedTour ? 'View Tour Voucher & Invoice (PDF)' : 'View & Print Receipt (PDF)'}</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            to={`/track-booking?ref=${encodeURIComponent(bookingRef)}&phone=${encodeURIComponent(
              booking?.phone || ''
            )}`}
            className="px-6 py-2.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <span>Track Booking Status Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            to="/book"
            className="px-6 py-2.5 rounded-lg bg-transparent hover:bg-[#141416] text-[#A1A1AA] hover:text-white border border-[#27272A] text-xs font-semibold transition-colors"
          >
            Book Another Journey
          </Link>
        </div>

      </div>

      {/* Booking Receipt Modal */}
      {showReceiptModal && (
        <BookingReceiptModal
          booking={effectiveBooking}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
