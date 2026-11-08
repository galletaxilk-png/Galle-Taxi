import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  Car,
  User,
  Phone,
  AlertCircle,
  MapPin,
  Calendar,
  MessageSquare,
  Shield,
  ArrowLeft,
  Plane,
  UserCheck,
  Receipt,
  Printer,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { Booking, BookingStatus } from '../types';
import { formatLKR } from '../lib/fareEngine';
import { BookingReceiptModal } from '../components/booking/BookingReceiptModal';

const STATUS_STEPS: BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Driver Assigned',
  'Driver En Route',
  'Picked Up',
  'Completed',
];

export const TrackBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getBookingByReferenceAndPhone, siteSettings, currency, formatFare } = useApp();

  const [reference, setReference] = useState(searchParams.get('ref') || '');
  const [phone, setPhone] = useState(searchParams.get('phone') || '');
  const [hasSearched, setHasSearched] = useState(false);
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  // Auto-search if parameters are in the URL
  useEffect(() => {
    const urlRef = searchParams.get('ref');
    const urlPhone = searchParams.get('phone');
    if (urlRef && urlPhone) {
      handleSearch(undefined, urlRef, urlPhone);
    }
  }, [searchParams]);

  const handleSearch = (e?: React.FormEvent, refParam?: string, phoneParam?: string) => {
    if (e) e.preventDefault();
    setSearchError(null);
    setHasSearched(true);

    const targetRef = (refParam || reference).trim();
    const targetPhone = (phoneParam || phone).trim();

    if (!targetRef) {
      setSearchError('Please enter your Booking Reference number (e.g. GT-2026-8941).');
      setFoundBooking(null);
      return;
    }

    if (!targetPhone) {
      setSearchError('Please enter the contact phone number used during booking for verification.');
      setFoundBooking(null);
      return;
    }

    const matched = getBookingByReferenceAndPhone(targetRef, targetPhone);
    if (matched) {
      setFoundBooking(matched);
    } else {
      setFoundBooking(null);
      setSearchError(
        'No matching booking found. Please verify the Reference ID and phone number, or contact our 24/7 WhatsApp dispatch desk.'
      );
    }
  };

  const getStepState = (step: BookingStatus, currentStatus: BookingStatus) => {
    if (currentStatus === 'Cancelled') return 'cancelled';
    const currentIdx = STATUS_STEPS.indexOf(currentStatus);
    const stepIdx = STATUS_STEPS.indexOf(step);
    if (stepIdx < currentIdx) return 'completed';
    if (stepIdx === currentIdx) return 'current';
    return 'upcoming';
  };

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F5B91B] bg-[#141416] hover:bg-[#1f1f23] border border-[#27272A] hover:border-[#F5B91B]/40 px-3.5 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
          <div className="text-[11px] text-slate-400 font-mono">
            Booking Verification & Live Status
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Live Vehicle & Dispatch Tracking
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Track Your <span className="text-[#F5B91B]">Galle Taxi</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Enter your booking reference and phone number below to access live chauffeur assignment, vehicle details, and journey status.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl">
          <form onSubmit={(e) => handleSearch(e)} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Booking Reference
              </label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="GT-2026-8941"
                required
                className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono uppercase focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="sm:col-span-4 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+94 77 123 4567"
                required
                className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-[#F5B91B]/20"
              >
                <Search className="w-4 h-4" />
                <span>Search Ride</span>
              </button>
            </div>
          </form>

          {/* Quick Demo Reference Fill */}
          <div className="mt-4 pt-4 border-t border-[#1F1F23] flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
            <span>Want to test with a sample booking?</span>
            <button
              type="button"
              onClick={() => {
                setReference('GT-2026-8941');
                setPhone('+44 7911 123456');
                handleSearch(undefined, 'GT-2026-8941', '+44 7911 123456');
              }}
              className="text-[#F5B91B] hover:underline font-mono"
            >
              Load Sample Booking GT-2026-8941
            </button>
          </div>
        </div>

        {/* Error message */}
        {searchError && (
          <div className="p-4 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{searchError}</span>
          </div>
        )}

        {/* Found Booking Card */}
        {foundBooking && (
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl space-y-8 p-6 sm:p-8">
            
            {/* Top Bar with Reference & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Booking Reference</span>
                <div className="text-2xl font-black font-mono text-[#F5B91B]">
                  {foundBooking.bookingReference}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Placed on {new Date(foundBooking.createdAt).toLocaleDateString()} for {foundBooking.customerName}
                </div>
              </div>

              {/* Status Badge & Official Receipt Button */}
              <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4 stroke-[2.5]" />
                  <span>View Official Receipt</span>
                </button>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    foundBooking.status === 'Completed'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : foundBooking.status === 'Cancelled'
                      ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                      : foundBooking.status === 'Driver En Route' || foundBooking.status === 'Picked Up'
                      ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 animate-pulse'
                      : 'bg-[#F5B91B]/10 text-[#F5B91B] border border-[#F5B91B]/30'
                  }`}
                >
                  {foundBooking.status}
                </span>
              </div>
            </div>

            {/* Lifecycle Progress Bar */}
            {foundBooking.status !== 'Cancelled' && (
              <div className="space-y-3">
                <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Live Dispatch Progress
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {STATUS_STEPS.map((step, idx) => {
                    const state = getStepState(step, foundBooking.status);
                    return (
                      <div
                        key={step}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          state === 'completed'
                            ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-400'
                            : state === 'current'
                            ? 'bg-[#F5B91B]/15 border-[#F5B91B] text-[#F5B91B] font-bold shadow-md shadow-[#F5B91B]/10'
                            : 'bg-[#0B0B0D] border-[#27272A] text-slate-500'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-slate-400">Step {idx + 1}</div>
                        <div className="text-xs font-medium mt-1 truncate">{step}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Assigned Driver & Vehicle Card (if assigned) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[#27272A]">
              <div className="p-5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <User className="w-4 h-4 text-[#F5B91B]" />
                  <span>Assigned Chauffeur</span>
                </div>
                {foundBooking.driverName ? (
                  <div className="space-y-1">
                    <div className="text-base font-bold text-white">{foundBooking.driverName}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>{foundBooking.driverPhone}</span>
                    </div>
                    <div className="text-[11px] text-emerald-400 font-medium pt-1">
                      Licensed Tourist Chauffeur
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    Chauffeur will be assigned 1-2 hours prior to scheduled departure.
                  </div>
                )}
              </div>

              <div className="p-5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Car className="w-4 h-4 text-[#F5B91B]" />
                  <span>Assigned Vehicle</span>
                </div>
                <div className="space-y-1">
                  <div className="text-base font-bold text-white">{foundBooking.vehicleCategoryName}</div>
                  <div className="text-[11px] text-slate-400">
                    Dual climate control · Bottled water provided
                  </div>
                </div>
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-3 pt-4 border-t border-[#27272A] text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5B91B] mt-1 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Pickup Location:</span>
                    <div className="font-semibold text-white">{foundBooking.pickupLocation}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Destination:</span>
                    <div className="font-semibold text-white">{foundBooking.destination}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">
                      {foundBooking.flightNumber ? 'Arrival Schedule:' : 'Pickup Date & Time:'}
                    </span>
                    <div className="font-medium text-white">
                      {foundBooking.pickupDate} at {foundBooking.pickupTime}
                    </div>
                    {foundBooking.flightNumber && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] font-mono font-bold text-xs">
                        <Plane className="w-3.5 h-3.5" />
                        <span>Flight: {foundBooking.flightNumber}</span>
                      </div>
                    )}
                    {foundBooking.nameboardText && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 ml-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-xs">
                        <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Greeting Board: "{foundBooking.nameboardText}"</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-[#F5B91B] mt-1 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Authoritative Fare:</span>
                    <div className="font-mono font-bold text-[#F5B91B]">
                      {formatFare(foundBooking.finalFare || foundBooking.estimatedFare)}
                    </div>
                    {currency !== 'LKR' && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        ≈ {formatLKR(foundBooking.finalFare || foundBooking.estimatedFare)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {foundBooking.specialInstructions && (
                <div className="p-3 bg-[#0B0B0D] rounded-lg border border-[#27272A] text-xs text-slate-300">
                  <span className="text-slate-400 font-semibold">Special Instructions: </span>
                  {foundBooking.specialInstructions}
                </div>
              )}
            </div>

            {/* Action Buttons: Tax Receipt & WhatsApp Assistance */}
            <div className="pt-4 border-t border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-slate-400">
                Official travel receipt with QR code verification and toll inclusions:
              </span>
              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(true)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#F5B91B]/15 hover:bg-[#F5B91B]/25 text-[#F5B91B] border border-[#F5B91B]/40 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-[#F5B91B]" />
                  <span>Print / Save Tax Receipt (PDF)</span>
                </button>
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    `Hello Galle Taxi, I would like to check on my booking reference ${foundBooking.bookingReference}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg bg-[#25D366] hover:bg-[#20BA5A] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp Dispatcher</span>
                </a>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Booking Receipt Modal */}
      {showReceiptModal && foundBooking && (
        <BookingReceiptModal
          booking={foundBooking}
          onClose={() => setShowReceiptModal(false)}
        />
      )}
    </div>
  );
};
