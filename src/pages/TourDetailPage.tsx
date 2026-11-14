/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Calendar,
  Users,
  Briefcase,
  ChevronRight,
  ArrowLeft,
  Share2,
  Check,
  Info,
  Car,
  AlertCircle,
  Phone,
  MessageSquare,
  Sparkles,
  Camera,
  Map,
} from 'lucide-react';
import { PRIVATE_DAY_TOURS, DayTourProduct, TourVehiclePrice } from '../lib/toursData';
import { useApp } from '../lib/store';
import { formatCurrency } from '../lib/fareEngine';
import { GoogleAddressAutocomplete } from '../components/GoogleAddressAutocomplete';
import { dispatchCustomerEmailVoucher } from '../lib/emailService';
import { Booking } from '../types';
import { OptimizedImage } from '../components/OptimizedImage';

export const TourDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    currency,
    formatFare,
    createBooking,
    siteSettings,
    tours,
    isAdminLoggedIn,
    isFirebaseActive,
    isPublicDataLoaded,
  } = useApp();

  const tour: DayTourProduct | undefined = (tours || []).find((t) => t.slug === slug || t.id === slug);

  // Gallery state
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Booking Form State
  const [selectedVehicle, setSelectedVehicle] = useState<TourVehiclePrice | null>(null);
  const [travelDate, setTravelDate] = useState<string>('');
  const [pickupTime, setPickupTime] = useState<string>('08:30');
  const [passengerCount, setPassengerCount] = useState<number>(2);
  const [pickupAddress, setPickupAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const bookingCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tour) {
      setSelectedVehicle(tour.vehiclePrices?.[0] || null);
      // Set default tomorrow date
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setTravelDate(tomorrow.toISOString().split('T')[0]);
      // Update document title for SEO
      document.title = tour.seo?.title || `${tour.title} | Galle Taxi`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', tour.seo?.description || tour.shortDescription || '');
      }
    }
  }, [tour]);

  if (!tour && isFirebaseActive && !isPublicDataLoaded) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] py-24 px-4 text-center text-slate-100 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F5B91B] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-400 font-mono mt-4">Loading tour details...</p>
      </div>
    );
  }

  if (!tour || (!isAdminLoggedIn && tour.isPublished === false)) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] py-20 px-4 text-center text-slate-100 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-extrabold text-white font-['Outfit']">Tour Currently Unavailable</h1>
        <p className="text-slate-400 text-sm mt-2 max-w-md">
          This private day tour is currently unpublished or undergoing seasonal updates. Browse our other available tours below.
        </p>
        <Link
          to="/"
          className="mt-6 px-6 py-2.5 rounded-xl bg-[#F5B91B] text-black font-extrabold text-xs shadow-md"
        >
          Return to Homepage
        </Link>
      </div>
    );
  }

  // Calculate prices
  const vehiclePriceUsd = selectedVehicle
    ? selectedVehicle.priceUsd
    : tour.vehiclePrices?.[0]?.priceUsd || 0;
  const priceInLkr = vehiclePriceUsd * 310;
  const formattedVehiclePrice = currency === 'USD' ? `$${vehiclePriceUsd}` : formatFare(priceInLkr);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const scrollToBooking = () => {
    bookingCardRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVehicle) {
      setBookingError('Please select your preferred vehicle.');
      return;
    }
    if (!pickupAddress) {
      setBookingError('Please provide your pickup hotel or villa address.');
      return;
    }

    try {
      setIsSubmitting(true);
      setBookingError(null);

      const bookingPayload: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'status'> = {
        bookingReference: `GT-TOUR-${Math.floor(100000 + Math.random() * 900000)}`,
        customerName,
        email: customerEmail,
        phone: customerPhone,
        pickupLocation: pickupAddress,
        destination: `${tour.title} (Day Tour Return to Hotel)`,
        pickupDate: travelDate,
        pickupTime: pickupTime,
        passengerCount: passengerCount,
        luggageCount: 2,
        vehicleCategoryId: selectedVehicle.id,
        vehicleCategoryName: `${tour.title} - ${selectedVehicle.name}`,
        specialInstructions: `Tour: ${tour.title} (${tour.duration}). Notes: ${specialNotes}`,
        tourId: tour.id,
        tourSlug: tour.slug,
        tourTitle: tour.title,
        isDayTour: true,
        estimatedFare: priceInLkr,
      };

      const newBooking = await createBooking(bookingPayload);

      // Send automated voucher email to both customer and dispatch
      try {
        await dispatchCustomerEmailVoucher({
          bookingReference: newBooking.bookingReference,
          customerName: newBooking.customerName,
          customerEmail: newBooking.email || customerEmail,
          phone: newBooking.phone,
          pickupLocation: newBooking.pickupLocation,
          destination: newBooking.destination,
          pickupDate: newBooking.pickupDate,
          pickupTime: newBooking.pickupTime,
          vehicleCategoryName: newBooking.vehicleCategoryName,
          passengerCount: newBooking.passengerCount,
          luggageCount: newBooking.luggageCount,
          estimatedFare: newBooking.estimatedFare,
          specialInstructions: newBooking.specialInstructions,
          dispatcherEmail: siteSettings.email,
          dispatcherPhone: siteSettings.phone,
          dispatcherWhatsapp: siteSettings.whatsappNumber,
          tourId: tour.id,
          tourSlug: tour.slug,
          tourTitle: tour.title,
          tourDuration: tour.duration,
          tourHighlights: (tour.highlights || []).map((h) => `${h.title}: ${h.description}`),
          tourItinerary: (tour.itinerary || []).map((i) => `${i.time} - ${i.title}: ${i.description}`),
          tourIncluded: tour.included || [],
          tourExcluded: tour.excluded || [],
        });
      } catch (err) {
        console.warn('Voucher email notice:', err);
      }

      navigate(`/booking-success?id=${newBooking.id}&ref=${newBooking.bookingReference}&tour=${encodeURIComponent(tour.slug)}`);
    } catch (err: any) {
      console.error('Booking submission failed:', err);
      setBookingError(err.message || 'Failed to submit booking. Please check your connection or contact our 24/7 hotline.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const normalizedHero = tour.heroImage?.startsWith('/src/assets/images/')
    ? tour.heroImage.replace('/src/assets/images/', '/assets/images/')
    : tour.heroImage || '/assets/images/regenerated_image_1794057460840.webp';
  const rawGallery = tour.galleryImages && tour.galleryImages.length > 0 ? tour.galleryImages : [normalizedHero];
  const gallery = rawGallery.map((g) =>
    g?.startsWith('/src/assets/images/') ? g.replace('/src/assets/images/', '/assets/images/') : g
  );

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-100 pb-24">
      {/* Breadcrumb Navigation Bar */}
      <div className="bg-[#121214] border-b border-[#27272A] sticky top-16 z-30">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-white flex items-center gap-1">
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <Link to="/services" className="hover:text-white">
              <span>Day Tours</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-[#F5B91B] font-semibold truncate">{tour.shortTitle}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F1F23] hover:bg-[#27272A] text-slate-300 hover:text-white text-[11px] font-semibold transition-colors cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Link Copied</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 pt-6 sm:pt-8">
        {/* Title & Key Meta Header */}
        <div className="space-y-3 mb-6 sm:mb-8">
          <div className="flex flex-wrap items-center gap-2">
            {tour.badge && (
              <span className="px-3 py-1 rounded-full bg-[#F5B91B]/15 text-[#F5B91B] border border-[#F5B91B]/30 text-xs font-extrabold uppercase tracking-wider">
                {tour.badge}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs font-bold text-white px-2.5 py-1 rounded-full bg-[#18181B] border border-[#27272A]">
              <Star className="w-3.5 h-3.5 fill-[#F5B91B] text-[#F5B91B]" />
              <span>{(tour.rating ?? 5.0).toFixed(2)}</span>
              <span className="text-slate-400 font-normal">({tour.reviewCount ?? 0} verified traveler reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-[#18181B] border border-[#27272A]">
              <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span>{tour.duration || 'Full Day'} Duration</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400 px-2.5 py-1 rounded-full bg-[#18181B] border border-[#27272A]">
              <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span>Pickup in {(tour.startingLocation || 'Galle, Sri Lanka').split(',')[0]}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
            {tour.title}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
            {tour.shortDescription}
          </p>
        </div>

        {/* Large Cinematic Image Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mb-10">
          {/* Main Large Visual: 8 cols */}
          <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-[#141416] border border-[#27272A] shadow-2xl">
            <OptimizedImage
              src={gallery[selectedPhotoIndex] || normalizedHero}
              fallbackSrc="/assets/images/regenerated_image_1794057460840.webp"
              alt={`${tour.title} photo`}
              className="w-full h-full object-cover transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200">
              <span className="bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-slate-700 font-medium">
                Private Luxury Transport • English-speaking Chauffeur
              </span>
              <span className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700 font-mono">
                {selectedPhotoIndex + 1} / {gallery.length}
              </span>
            </div>
          </div>

          {/* Thumbnail Strip: 4 cols */}
          <div className="lg:col-span-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3">
            {gallery.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedPhotoIndex(idx)}
                className={`relative aspect-[16/10] lg:aspect-[16/7] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                  selectedPhotoIndex === idx
                    ? 'border-[#F5B91B] ring-2 ring-[#F5B91B]/30'
                    : 'border-[#27272A] hover:border-slate-500 opacity-70 hover:opacity-100'
                }`}
              >
                <OptimizedImage
                  src={imgUrl}
                  fallbackSrc="/assets/images/regenerated_image_1794057460840.webp"
                  alt="Thumbnail"
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content & Sticky Booking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (7 cols): Descriptions, Highlights, Itinerary, Inclusions */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Tour Full Description */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#F5B91B]" />
                <span>Tour Overview</span>
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {tour.fullDescription}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[#27272A]">
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#27272A]">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Duration</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{tour.duration}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#27272A]">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Tour Type</span>
                  <span className="text-sm font-bold text-[#F5B91B] mt-0.5 block">100% Private Tour</span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B0B0D] border border-[#27272A] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Vehicle Pricing</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">Per Car (Not / Person)</span>
                </div>
              </div>
            </section>

            {/* Tour Highlights */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Experience Highlights
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {(tour.highlights || []).map((hl, idx) => (
                  <div key={idx} className="flex items-start gap-3.5 p-3.5 rounded-xl bg-[#0B0B0D] border border-[#27272A]">
                    <div className="w-8 h-8 rounded-lg bg-[#F5B91B]/15 text-[#F5B91B] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{hl.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{hl.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Suggested Itinerary with Times */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                    Suggested Itinerary & Timeline
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Flexible and customizable based on your pace and requests.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-[#F5B91B]/10 text-[#F5B91B] text-xs font-bold border border-[#F5B91B]/30">
                  {tour.duration}
                </span>
              </div>

              <div className="relative pl-6 sm:pl-8 space-y-6 border-l-2 border-[#27272A] ml-2">
                {(tour.itinerary || []).map((stop, idx) => (
                  <div key={idx} className="relative group">
                    {/* Step marker */}
                    <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full bg-[#0B0B0D] border-2 border-[#F5B91B] group-hover:bg-[#F5B91B] transition-colors" />
                    <div className="space-y-1">
                      <div className="inline-block px-2.5 py-0.5 rounded bg-[#1F1F23] text-[#F5B91B] font-mono text-xs font-bold">
                        {stop.time}
                      </div>
                      <h3 className="text-base font-bold text-white pt-1">{stop.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{stop.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Interactive Google Map Route Section */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Map className="w-5 h-5 text-[#F5B91B]" />
                  <span>Route Map & Navigation</span>
                </h2>
                <span className="text-xs text-slate-400">Live Satellite / Street View</span>
              </div>
              <p className="text-xs text-slate-400">
                Departing directly from your hotel in Galle or nearby coastal resort, cruising with air-conditioned comfort.
              </p>
              <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-[#27272A] bg-[#0B0B0D]">
                <iframe
                  title="Tour Route Map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  src={`https://www.google.com/maps?q=${tour.mapQuery}&output=embed`}
                />
              </div>
            </section>

            {/* What's Included vs What's Excluded */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl sm:text-2xl font-bold text-white font-['Outfit']">
                Inclusions & Exclusions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Included */}
                <div className="space-y-3 bg-[#0B0B0D] p-5 rounded-xl border border-emerald-900/40">
                  <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>What's Included</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(tour.included || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Excluded */}
                <div className="space-y-3 bg-[#0B0B0D] p-5 rounded-xl border border-rose-900/40">
                  <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    <span>What's Excluded</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {(tour.excluded || []).map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">✕</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Important Info & Cancellation Policy */}
            <section className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="space-y-3">
                <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#F5B91B]" />
                  <span>Important Traveler Information</span>
                </h2>
                <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                  {(tour.importantInfo || []).map((info, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {info}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#27272A] space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Cancellation Policy</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tour.cancellationPolicy}
                </p>
              </div>
            </section>
          </div>

          {/* Right Column (5 cols): Sticky Booking & Pricing Card */}
          <div ref={bookingCardRef} id="booking" className="lg:col-span-5 lg:sticky lg:top-32 space-y-6">
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#F5B91B]/5 rounded-full blur-2xl pointer-events-none" />

              <div className="border-b border-[#27272A] pb-5 mb-5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#F5B91B] uppercase tracking-wider">
                    Instant Tour Reservation
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Official Rate
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-3xl font-extrabold text-white font-['Outfit']">
                      ${vehiclePriceUsd}{' '}
                      <span className="text-xs font-normal text-slate-400 font-sans">USD</span>
                    </div>
                    {currency !== 'USD' && (
                      <div className="text-xs font-mono font-bold text-[#F5B91B]">
                        ≈ {formattedVehiclePrice}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-medium block">Per private car</span>
                    <span className="text-[11px] text-emerald-400 font-bold">100% Private vehicle</span>
                  </div>
                </div>
              </div>

              {bookingError && (
                <div className="mb-4 p-3 bg-rose-950/70 border border-rose-800 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{bookingError}</span>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {/* 1. Vehicle Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>1. Select Vehicle Type</span>
                    <span className="text-[10px] text-slate-500">Prices per vehicle</span>
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {(tour.vehiclePrices || []).map((veh) => {
                      const isSelected = selectedVehicle?.id === veh.id;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => setSelectedVehicle(veh)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#F5B91B]/10 border-[#F5B91B] text-white shadow-md'
                              : 'bg-[#0B0B0D] border-[#27272A] text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold">{veh.name}</span>
                              {veh.badge && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#F5B91B]/20 text-[#F5B91B]">
                                  {veh.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {veh.passengers} • {veh.luggage}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-extrabold text-[#F5B91B] font-mono">
                              ${veh.priceUsd}
                            </div>
                            <div className="text-[9px] text-slate-500">Full day</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="tour-travel-date" className="text-xs font-semibold text-slate-300">Travel Date</label>
                    <input
                      id="tour-travel-date"
                      type="date"
                      required
                      value={travelDate}
                      onChange={(e) => setTravelDate(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="tour-pickup-time" className="text-xs font-semibold text-slate-300">Pickup Time</label>
                    <input
                      id="tour-pickup-time"
                      type="time"
                      required
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                </div>

                {/* 3. Passengers */}
                <div className="space-y-1.5">
                  <label htmlFor="tour-passenger-count" className="text-xs font-semibold text-slate-300">Number of Passengers</label>
                  <select
                    id="tour-passenger-count"
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <option key={num} value={num} className="bg-[#141416]">
                        {num} {num === 1 ? 'Passenger' : 'Passengers'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 4. Pickup Location */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Pickup Hotel / Villa Location</label>
                  <GoogleAddressAutocomplete
                    value={pickupAddress}
                    onChange={setPickupAddress}
                    placeholder="e.g. Amangalla Hotel, Galle Fort or Unawatuna Beach Villa"
                    required
                  />
                </div>

                {/* 5. Contact Details */}
                <div className="space-y-3 pt-2 border-t border-[#27272A]">
                  <div className="space-y-1.5">
                    <label htmlFor="tour-customer-name" className="text-xs font-semibold text-slate-300">Lead Passenger Full Name</label>
                    <input
                      id="tour-customer-name"
                      type="text"
                      required
                      placeholder="e.g. James Wilson"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tour-customer-email" className="text-xs font-semibold text-slate-300">Email Address (for voucher)</label>
                    <input
                      id="tour-customer-email"
                      type="email"
                      required
                      placeholder="e.g. james@example.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="tour-customer-phone" className="text-xs font-semibold text-slate-300">WhatsApp Mobile Number</label>
                    <input
                      id="tour-customer-phone"
                      type="tel"
                      required
                      placeholder="+44 7123 456789 or +94 77 123 4567"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Special Notes / Child Seats</label>
                    <textarea
                      rows={2}
                      placeholder="Baby seats, dietary preferences, or specific stops..."
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                </div>

                {/* Price Summary Breakdown */}
                <div className="p-3.5 bg-[#0B0B0D] rounded-xl border border-[#27272A] space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>{tour.title}</span>
                    <span>{selectedVehicle?.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Chauffeur & Fuel</span>
                    <span className="text-emerald-400 font-semibold">Included</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Highway Tolls & Parking</span>
                    <span className="text-emerald-400 font-semibold">Included</span>
                  </div>
                  <div className="pt-2 border-t border-[#27272A] flex justify-between items-baseline font-bold">
                    <span className="text-white">Total Booking Price:</span>
                    <span className="text-base text-[#F5B91B] font-mono">
                      ${vehiclePriceUsd} USD
                    </span>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm transition-all shadow-lg shadow-[#F5B91B]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Reservation...</span>
                  ) : (
                    <>
                      <span>Confirm & Reserve Tour</span>
                      <ChevronRight className="w-4 h-4 stroke-[3]" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <p className="text-[11px] text-slate-400">
                    No upfront credit card payment needed • Pay cash directly to driver
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
