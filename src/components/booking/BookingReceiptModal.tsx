import React, { useRef } from 'react';
import {
  Printer,
  X,
  Share2,
  CheckCircle2,
  Download,
  Calendar,
  Clock,
  MapPin,
  Car,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Plane,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Copy,
  Receipt,
  FileText,
  Loader2,
  Send,
  XCircle,
} from 'lucide-react';
import { Booking } from '../../types';
import { useApp } from '../../lib/store';
import { formatLKR, formatCurrency } from '../../lib/fareEngine';
import { findTourForBooking } from '../../lib/toursData';
import {
  dispatchOfficialReceiptEmail,
  getDispatcherReceiptGmailUrl,
  OFFICIAL_DISPATCH_EMAIL,
} from '../../lib/emailService';

interface BookingReceiptModalProps {
  booking: Booking;
  onClose: () => void;
}

export const BookingReceiptModal: React.FC<BookingReceiptModalProps> = ({ booking, onClose }) => {
  const { siteSettings, currency, formatFare, tours } = useApp();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);
  const [isSendingEmail, setIsSendingEmail] = React.useState(false);
  const [emailStatusMessage, setEmailStatusMessage] = React.useState<string | null>(null);

  const matchedTour = findTourForBooking(booking, tours);

  const receiptNumber = `REC-${booking.bookingReference}`;

  const handleSendEmailReceipt = async () => {
    setIsSendingEmail(true);
    setEmailStatusMessage(null);
    try {
      const res = await dispatchOfficialReceiptEmail({
        bookingReference: booking.bookingReference,
        customerName: booking.customerName,
        customerEmail: booking.email || '',
        phone: booking.phone,
        pickupLocation: booking.pickupLocation,
        destination: booking.destination,
        pickupDate: booking.pickupDate,
        pickupTime: booking.pickupTime,
        vehicleCategoryName: booking.vehicleCategoryName,
        vehiclePlate: booking.vehiclePlate,
        driverName: booking.driverName,
        driverPhone: booking.driverPhone,
        passengerCount: booking.passengerCount,
        luggageCount: booking.luggageCount,
        flightNumber: booking.flightNumber,
        nameboardText: booking.nameboardText,
        estimatedFare: booking.estimatedFare,
        finalFare: booking.finalFare,
        specialInstructions: booking.specialInstructions,
        dispatcherEmail: siteSettings.email || OFFICIAL_DISPATCH_EMAIL,
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
      });

      setEmailStatusMessage(
        res.simulated
          ? `Receipt REC-${booking.bookingReference} queued & logged for ${OFFICIAL_DISPATCH_EMAIL}`
          : `Receipt REC-${booking.bookingReference} delivered to ${OFFICIAL_DISPATCH_EMAIL}!`
      );
      setTimeout(() => setEmailStatusMessage(null), 5000);
    } catch (err: any) {
      setEmailStatusMessage(`Failed to send receipt: ${err?.message || 'Error'}`);
    } finally {
      setIsSendingEmail(false);
    }
  };
  const issueDate = new Date(booking.createdAt || Date.now()).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const issueTime = new Date(booking.createdAt || Date.now()).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalFareLKR = booking.finalFare || booking.estimatedFare;
  const fareDisplay =
    currency === 'LKR'
      ? formatLKR(totalFareLKR)
      : `${formatFare(totalFareLKR)} (${formatLKR(totalFareLKR)})`;

  // Tracking link that can be opened or verified
  const liveTrackingUrl = `${window.location.origin}/track?ref=${encodeURIComponent(
    booking.bookingReference
  )}&phone=${encodeURIComponent((booking.phone || '').replace(/[^0-9]/g, ''))}`;

  const cleanCustomerPhone = (booking.phone || '').replace(/[^0-9+]/g, '');
  const cleanCustomerWhatsapp = (booking.phone || '').replace(/[^0-9]/g, '');
  const cleanDispatcherPhone = (siteSettings.phone || '+94771234567').replace(/[^0-9+]/g, '');
  const cleanDispatcherWhatsapp = (siteSettings.whatsappNumber || siteSettings.phone || '+94771234567').replace(/[^0-9]/g, '');
  const cleanDriverPhone = (booking.driverPhone || '').replace(/[^0-9+]/g, '');
  const cleanDriverWhatsapp = (booking.driverPhone || '').replace(/[^0-9]/g, '');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveTrackingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');
  const shareWhatsAppMessage = encodeURIComponent(
    `*GALLE TAXI - OFFICIAL TRIP RECEIPT*\n` +
      `Receipt No: ${receiptNumber}\n` +
      `Booking Ref: ${booking.bookingReference}\n` +
      `Passenger: ${booking.customerName}\n` +
      `Pickup: ${booking.pickupLocation}\n` +
      `Destination: ${booking.destination}\n` +
      `Date & Time: ${booking.pickupDate} at ${booking.pickupTime}\n` +
      `Vehicle: ${booking.vehicleCategoryName}\n` +
      (booking.vehiclePlate ? `Vehicle Plate: ${booking.vehiclePlate}\n` : '') +
      (booking.driverName ? `Chauffeur: ${booking.driverName} (${booking.driverPhone || ''})\n` : '') +
      `Total Fare: ${fareDisplay}\n` +
      `Payment Terms: Cash to Chauffeur on Arrival\n\n` +
      `Verify & Live Track: ${liveTrackingUrl}`
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Print styles injected for pristine A4 formatting */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #galle-taxi-receipt, #galle-taxi-receipt * {
            visibility: visible;
          }
          #galle-taxi-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 24px;
            background: white !important;
            color: #111827 !important;
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-3xl bg-[#141417] border border-[#27272A] rounded-2xl shadow-2xl overflow-hidden my-auto print:border-none print:shadow-none print:max-w-none print:my-0">
        
        {/* Top Action Toolbar (Hidden during print) */}
        <div className="no-print p-4 bg-[#18181E] border-b border-[#27272A] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5B91B]/15 text-[#F5B91B] flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-['Outfit']">Official Booking Receipt</h3>
              <p className="text-[11px] text-slate-400 font-mono">Invoice Reference: {receiptNumber}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Print / Save PDF Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Print / Save PDF</span>
            </button>

            {/* Share via WhatsApp */}
            <a
              href={`https://wa.me/?text=${shareWhatsAppMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              title="Share on WhatsApp"
            >
              <MessageSquare className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            {/* Copy Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Copy Verification Link"
            >
              <Copy className="w-4 h-4 text-[#F5B91B]" />
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Link'}</span>
            </button>

            {/* Close Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#27272A] hover:bg-red-950/60 hover:text-red-400 text-slate-400 flex items-center justify-center text-sm cursor-pointer transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE RECEIPT BODY */}
        <div
          id="galle-taxi-receipt"
          ref={receiptRef}
          className="p-4 sm:p-8 lg:p-10 bg-white text-slate-900 font-['Outfit'] space-y-5 sm:space-y-6 select-text overflow-x-hidden"
        >
          {/* Header & Logo */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b-2 border-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#F5B91B] text-black font-black flex items-center justify-center text-lg shadow-sm">
                  GT
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-none">
                    GALLE TAXI
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#B45309]">
                    Cabs & Airport Transfers Sri Lanka
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                Registered Dispatch Desk: Galle Dutch Fort, Southern Province, Sri Lanka<br />
                Hotline: <a href={`tel:${cleanDispatcherPhone}`} className="text-slate-900 hover:text-[#B45309] font-mono font-bold underline">{siteSettings.phone}</a> • WhatsApp: <a href={`https://wa.me/${cleanDispatcherWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 font-mono font-bold underline">Chat on WhatsApp</a> • Email: <a href="mailto:support@galletaxi.lk" className="text-slate-900 hover:text-[#B45309] underline font-semibold">support@galletaxi.lk</a>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1 sm:shrink-0 bg-amber-50 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-amber-200 sm:border-none">
              <div className="inline-block px-3 py-1 rounded bg-[#F5B91B]/20 text-[#B45309] border border-[#F5B91B]/40 text-xs font-black uppercase tracking-wider">
                {matchedTour ? 'Official Tour Voucher & Invoice' : 'Official Booking Invoice & Voucher'}
              </div>
              <div className="text-xs font-mono font-bold text-slate-900 mt-1">
                Receipt No: <span className="text-slate-950 font-black">{receiptNumber}</span>
              </div>
              <div className="text-[11px] font-mono text-slate-600">
                Booking Reference: {booking.bookingReference}
              </div>
              <div className="text-[11px] text-slate-500">
                Issued: {issueDate} at {issueTime}
              </div>
            </div>
          </div>

          {/* Official Booking ID & Status Banner (Stacks cleanly on mobile) */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-[#17171C] via-[#121216] to-[#17171C] text-white border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="space-y-0.5">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F5B91B] block">
                OFFICIAL BOOKING ID
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono tracking-wider text-white break-all">
                {booking.bookingReference}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Tax Receipt Reference: <span className="text-[#F5B91B] font-bold">{receiptNumber}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:flex-col sm:items-end pt-0.5 sm:pt-0">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{booking.status || 'Confirmed & Dispatched'}</span>
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {issueDate} at {issueTime}
              </span>
            </div>
          </div>

          {/* Passenger & Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Passenger Name
              </span>
              <span className="font-extrabold text-sm text-slate-900 block">{booking.customerName}</span>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <a
                  href={`tel:${cleanCustomerPhone}`}
                  className="inline-flex items-center gap-1 text-slate-800 hover:text-[#B45309] font-mono text-[11px] font-bold underline"
                  title="Call Passenger Directly"
                >
                  <Phone className="w-3 h-3 text-slate-500" />
                  <span>{booking.phone}</span>
                </a>
                {cleanCustomerWhatsapp && (
                  <a
                    href={`https://wa.me/${cleanCustomerWhatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 text-[10px] font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded transition-colors"
                    title="Open WhatsApp Chat"
                  >
                    <MessageSquare className="w-2.5 h-2.5 fill-emerald-600" />
                    <span>WhatsApp</span>
                  </a>
                )}
              </div>
              {booking.email && (
                <a
                  href={`mailto:${booking.email}`}
                  className="text-slate-600 hover:text-slate-900 block text-[11px] truncate underline pt-0.5"
                >
                  {booking.email}
                </a>
              )}
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Reservation Status
              </span>
              <span className="inline-flex items-center gap-1.5 font-extrabold text-sm text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{booking.status}</span>
              </span>
              <span className="text-[11px] text-slate-600 block">
                {booking.passengerCount} Passengers • {booking.luggageCount} Luggage Bags
              </span>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold block">
                Payment Terms
              </span>
              <span className="font-bold text-slate-900 text-xs block">
                Cash to Chauffeur on Arrival
              </span>
              <span className="text-[11px] text-slate-600 block">
                LKR, USD, EUR, GBP, or INR accepted
              </span>
            </div>
          </div>

          {matchedTour ? (
            /* DEDICATED PRIVATE DAY TOUR ITINERARY & HIGHLIGHTS */
            <div className="space-y-4">
              {/* Tour Overview Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50/70 border border-amber-200 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#B45309] text-white text-[10px] font-extrabold uppercase tracking-wider">
                      Private Day Tour Package
                    </span>
                    {matchedTour.badge && (
                      <span className="px-2 py-0.5 rounded-full bg-[#F5B91B]/30 text-[#92400e] text-[10px] font-bold">
                        {matchedTour.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Duration: {matchedTour.duration}</span>
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-slate-950 font-['Outfit']">
                  {matchedTour.title}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {matchedTour.shortDescription}
                </p>
              </div>

              {/* Schedule & Pickup Details */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tour Schedule & Private Chauffeur Pickup
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70 items-center">
                    <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Departure Date & Time:</span>
                    </span>
                    <span className="sm:col-span-9 font-extrabold text-slate-900 text-sm">
                      {booking.pickupDate} at {booking.pickupTime}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 p-3 items-start">
                    <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Hotel / Villa Pickup:</span>
                    </span>
                    <span className="sm:col-span-9 font-bold text-slate-900">
                      {booking.pickupLocation}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70 items-start">
                    <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                      <Car className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Reserved Vehicle Class:</span>
                    </span>
                    <span className="sm:col-span-9 font-bold text-slate-900">
                      {booking.vehicleCategoryName} (Private Air-Conditioned Vehicle for your party)
                    </span>
                  </div>

                  {booking.specialInstructions && (
                    <div className="grid grid-cols-1 sm:grid-cols-12 p-3 items-start bg-amber-50/40">
                      <span className="sm:col-span-3 text-slate-500 font-semibold">
                        Special Requests:
                      </span>
                      <span className="sm:col-span-9 text-slate-700 italic">
                        {booking.specialInstructions}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Highlights */}
              {matchedTour.highlights && matchedTour.highlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Experience Highlights</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    {matchedTour.highlights.map((hl, hlIdx) => (
                      <div key={hlIdx} className="flex items-start gap-2 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-900 block leading-tight">{hl.title}</strong>
                          <span className="text-slate-600 text-[11px] leading-relaxed block mt-0.5">
                            {hl.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Day Itinerary Timeline */}
              {matchedTour.itinerary && matchedTour.itinerary.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Day Itinerary Timeline</span>
                  </h4>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                    {matchedTour.itinerary.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="flex items-start gap-3 relative pb-2.5 border-b border-slate-200 last:border-b-0 last:pb-0"
                      >
                        <span className="px-2 py-1 rounded bg-amber-100/90 text-amber-950 font-mono text-[11px] font-bold whitespace-nowrap shrink-0">
                          {item.time}
                        </span>
                        <div>
                          <span className="font-extrabold text-slate-900 block">{item.title}</span>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Included & What's Excluded */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
                  <h5 className="font-bold text-emerald-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>What's Included in Fare</span>
                  </h5>
                  <ul className="space-y-1 pt-1 text-[11px] text-slate-700">
                    {matchedTour.included.map((inc, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <h5 className="font-bold text-slate-700 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>What's Excluded / Extra</span>
                  </h5>
                  <ul className="space-y-1 pt-1 text-[11px] text-slate-600">
                    {matchedTour.excluded.map((exc, eIdx) => (
                      <li key={eIdx} className="flex items-start gap-1.5">
                        <span className="text-rose-500 font-bold">✗</span>
                        <span>{exc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* STANDARD TRANSFER ITINERARY TABLE */
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Transfer Schedule & Route Itinerary
              </h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70 items-center">
                  <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Pickup Schedule:</span>
                  </span>
                  <span className="sm:col-span-9 font-extrabold text-slate-900 text-sm">
                    {booking.pickupDate} at {booking.pickupTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 p-3 items-start">
                  <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#B45309]" />
                    <span>Pickup Location:</span>
                  </span>
                  <span className="sm:col-span-9 font-bold text-slate-900">
                    {booking.pickupLocation}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-slate-50/70 items-start">
                  <span className="sm:col-span-3 text-slate-500 font-semibold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Destination:</span>
                  </span>
                  <span className="sm:col-span-9 font-bold text-slate-900">
                    {booking.destination}
                  </span>
                </div>

                {booking.flightNumber && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-amber-50/60 items-center text-amber-950">
                    <span className="sm:col-span-3 font-semibold flex items-center gap-1.5">
                      <Plane className="w-3.5 h-3.5 text-[#B45309]" />
                      <span>Arrival Flight No:</span>
                    </span>
                    <span className="sm:col-span-9 font-mono font-extrabold tracking-wide">
                      {booking.flightNumber} (Live Flight Tracking Included)
                    </span>
                  </div>
                )}

                {booking.nameboardText && (
                  <div className="grid grid-cols-1 sm:grid-cols-12 p-3 bg-emerald-50/60 items-center text-emerald-950">
                    <span className="sm:col-span-3 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Greeting Placard:</span>
                    </span>
                    <span className="sm:col-span-9 font-extrabold">
                      "{booking.nameboardText}"
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Multi-Currency Authoritative Pricing Breakdown: LKR, USD, EUR, GBP, INR */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Authoritative Multi-Currency Pricing (LKR, USD, EUR, GBP, INR)
              </h4>
              <span className="text-[10px] text-emerald-700 font-semibold">
                ✓ Guaranteed Net Fare
              </span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              {/* LKR (Base) - Prominent full width on mobile */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-white border-2 border-[#F5B91B] shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  🇱🇰 LKR (Base Fare)
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-slate-950 block mt-1 tracking-tight">
                  {formatLKR(totalFareLKR)}
                </span>
                <span className="text-[9px] font-bold text-[#B45309] block mt-0.5">
                  Official Base Rate
                </span>
              </div>

              {/* USD */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-slate-200 shadow-sm min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  🇺🇸 USD ($)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 block mt-1 whitespace-nowrap">
                  {formatCurrency(totalFareLKR, 'USD')}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  US Dollar
                </span>
              </div>

              {/* EUR */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-slate-200 shadow-sm min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  🇪🇺 EUR (€)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 block mt-1 whitespace-nowrap">
                  {formatCurrency(totalFareLKR, 'EUR')}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  Euro
                </span>
              </div>

              {/* GBP */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-slate-200 shadow-sm min-w-0">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  🇬🇧 GBP (£)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 block mt-1 whitespace-nowrap">
                  {formatCurrency(totalFareLKR, 'GBP')}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  British Pound
                </span>
              </div>

              {/* INR */}
              <div className="p-2.5 sm:p-3 rounded-lg bg-white border border-slate-200 shadow-sm min-w-0 col-span-2 sm:col-span-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                  🇮🇳 INR (₹)
                </span>
                <span className="text-sm sm:text-base font-black font-mono text-slate-900 block mt-1 whitespace-nowrap">
                  {formatCurrency(totalFareLKR, 'INR')}
                </span>
                <span className="text-[9px] text-slate-500 block mt-0.5">
                  Indian Rupee
                </span>
              </div>
            </div>
          </div>

          {/* Authoritative Fare Breakdown: Mobile Stacked Blocks & Desktop 3-Col Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Authoritative Fare Breakdown
            </h4>

            {/* Mobile View: Stacked Block Elements (Zero horizontal clipping, 100% visible) */}
            <div className="block sm:hidden space-y-2.5">
              {/* Primary Transfer Item */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                <div>
                  <div className="font-bold text-slate-900 text-xs leading-snug">
                    {matchedTour
                      ? `${matchedTour.title} – Private Day Tour (${matchedTour.duration})`
                      : `Private Highway Transfer (${booking.pickupLocation} ➔ ${booking.destination})`}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {matchedTour
                      ? `Reserved ${booking.vehicleCategoryName} with dedicated English-speaking local chauffeur`
                      : 'Air-conditioned private passenger transport'}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    Confirmed
                  </span>
                  <span className="font-mono font-black text-sm text-slate-950">
                    {formatLKR(totalFareLKR)}
                  </span>
                </div>
              </div>

              {/* Expressway Highway Tolls */}
              <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-xs text-slate-700 font-medium leading-snug">
                  {matchedTour
                    ? 'Expressway Highway Tolls & Reserved Site Parking Clearances'
                    : 'Southern Expressway (E01) Highway Tolls & Exit Fees'}
                </div>
                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    INCLUDED
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    Rs. 0 (Inclusive)
                  </span>
                </div>
              </div>

              {/* Fuel & Chauffeur Transit Allowance */}
              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5">
                <div className="text-xs text-slate-700 font-medium leading-snug">
                  {matchedTour
                    ? 'Full Day Fuel & Professional Chauffeur Allowance'
                    : 'Fuel & Chauffeur Transit Allowance'}
                </div>
                <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                    INCLUDED
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-600">
                    Rs. 0 (Inclusive)
                  </span>
                </div>
              </div>

              {matchedTour && (
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="text-xs text-slate-700 font-medium leading-snug">
                    Door-to-Door Hotel / Villa Pickup & Guaranteed Return Transfers
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      INCLUDED
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Rs. 0 (Inclusive)
                    </span>
                  </div>
                </div>
              )}

              {booking.flightNumber && (
                <div className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl space-y-1.5">
                  <div className="text-xs text-slate-700 font-medium leading-snug">
                    Airport Flight Delay Waiting (Up to 90 mins post-landing) & Placard Meet
                  </div>
                  <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                      FREE
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-600">
                      Rs. 0 (Free)
                    </span>
                  </div>
                </div>
              )}

              {/* Mobile Net Total Due Card */}
              <div className="p-3.5 bg-amber-50/90 border-2 border-slate-900 rounded-xl space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-black text-xs text-slate-950 uppercase tracking-wide">
                      Net Guaranteed Total Due
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Payable in cash upon arrival
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-mono font-black text-slate-950">
                      {formatLKR(totalFareLKR)}
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-amber-200/80 text-[11px] font-mono font-bold text-[#B45309] flex flex-wrap items-center gap-1.5">
                  <span>{formatCurrency(totalFareLKR, 'USD')}</span>
                  <span>•</span>
                  <span>{formatCurrency(totalFareLKR, 'EUR')}</span>
                  <span>•</span>
                  <span>{formatCurrency(totalFareLKR, 'GBP')}</span>
                  <span>•</span>
                  <span>{formatCurrency(totalFareLKR, 'INR')}</span>
                </div>
              </div>
            </div>

            {/* Desktop View: Full 3-Column Table */}
            <div className="hidden sm:block border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3 font-extrabold">Service Breakdown & Inclusions</th>
                    <th className="py-2.5 px-3 text-center font-extrabold">Status</th>
                    <th className="py-2.5 px-3 text-right font-extrabold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-slate-900">
                        {matchedTour
                          ? `${matchedTour.title} – Private Day Tour (${matchedTour.duration})`
                          : `Private Highway Transfer (${booking.pickupLocation} ➔ ${booking.destination})`}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {matchedTour
                          ? `Reserved ${booking.vehicleCategoryName} with dedicated English-speaking local chauffeur`
                          : 'Air-conditioned private passenger transport'}
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatLKR(totalFareLKR)}
                    </td>
                  </tr>

                  <tr className="bg-slate-50/50">
                    <td className="py-2 px-3 text-[11px] text-slate-600">
                      {matchedTour
                        ? 'Expressway Highway Tolls & Reserved Site Parking Clearances'
                        : 'Southern Expressway (E01) Highway Tolls & Exit Fees'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        INCLUDED
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                      Rs. 0 (Inclusive)
                    </td>
                  </tr>

                  <tr>
                    <td className="py-2 px-3 text-[11px] text-slate-600">
                      {matchedTour
                        ? 'Full Day Fuel & Professional Chauffeur Allowance'
                        : 'Fuel & Chauffeur Transit Allowance'}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                        INCLUDED
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                      Rs. 0 (Inclusive)
                    </td>
                  </tr>

                  {matchedTour && (
                    <tr className="bg-slate-50/50">
                      <td className="py-2 px-3 text-[11px] text-slate-600">
                        Door-to-Door Hotel / Villa Pickup & Guaranteed Return Transfers
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          INCLUDED
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                        Rs. 0 (Inclusive)
                      </td>
                    </tr>
                  )}

                  {booking.flightNumber && (
                    <tr className="bg-slate-50/50">
                      <td className="py-2 px-3 text-[11px] text-slate-600">
                        Airport Flight Delay Waiting (Up to 90 mins post-landing) & Nameboard Meet
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider">
                          FREE
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-[11px] text-emerald-700 font-semibold whitespace-nowrap">
                        Rs. 0 (Free)
                      </td>
                    </tr>
                  )}

                  {/* Net Total Due Row */}
                  <tr className="bg-amber-50/80 border-t-2 border-slate-900">
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-sm text-slate-950 uppercase tracking-wide">
                        Net Guaranteed Total Due
                      </div>
                      <div className="text-[11px] text-slate-600">
                        Payable in cash upon arrival (LKR, USD, EUR, GBP, or INR accepted)
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 uppercase">
                        Cash On Arrival
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="text-base sm:text-lg font-mono font-black text-slate-950">
                        {formatLKR(totalFareLKR)}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-mono font-bold text-[#B45309] space-x-1 mt-0.5">
                        <span>{formatCurrency(totalFareLKR, 'USD')}</span>
                        <span>•</span>
                        <span>{formatCurrency(totalFareLKR, 'EUR')}</span>
                        <span>•</span>
                        <span>{formatCurrency(totalFareLKR, 'GBP')}</span>
                        <span>•</span>
                        <span>{formatCurrency(totalFareLKR, 'INR')}</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Clean Professional Footer & Dispatch Verification (Without QR code box or stamp box) */}
          <div className="pt-4 border-t-2 border-slate-900 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">
                  Official Verification & Dispatch Record
                </span>
                <p className="text-[11px] text-slate-600 max-w-md leading-relaxed">
                  This booking voucher and invoice constitutes a confirmed travel contract with Galle Taxi Cabs (Sri Lanka). 24/7 client dispatch monitoring active.
                </p>
                <div className="font-mono text-[10px] text-slate-500">
                  Verification Code: <strong className="text-slate-800">{booking.id.toUpperCase()}</strong> • Reference: <strong className="text-slate-800">{receiptNumber}</strong>
                </div>
              </div>

              {/* Direct Click-to-Action Dispatch Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0 shrink-0">
                <a
                  href={`tel:${cleanDispatcherPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-colors"
                  title="Call Galle Taxi Hotline"
                >
                  <Phone className="w-3.5 h-3.5 text-slate-700" />
                  <span>Call Dispatch</span>
                </a>
                <a
                  href={`https://wa.me/${cleanDispatcherWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                  title="Chat on WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 fill-white" />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="mailto:support@galletaxi.lk"
                  className="px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-black text-[#F5B91B] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  title="Email Support"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>support@galletaxi.lk</span>
                </a>
              </div>
            </div>

            {/* Bottom helpline banner with interactive links */}
            <div className="pt-2 text-center text-[11px] text-slate-500 font-mono border-t border-slate-200 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
              <span>For 24/7 assistance:</span>
              <a href={`tel:${cleanDispatcherPhone}`} className="text-slate-800 hover:text-[#B45309] font-bold underline">
                Call {siteSettings.phone}
              </a>
              <span>•</span>
              <a href={`https://wa.me/${cleanDispatcherWhatsapp}`} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:text-emerald-800 font-bold underline">
                WhatsApp
              </a>
              <span>•</span>
              <a href="mailto:support@galletaxi.lk" className="text-slate-800 hover:text-[#B45309] font-bold underline">
                support@galletaxi.lk
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
