import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlaneTakeoff,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  Sparkles,
  Phone,
  MessageSquare,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { CurrencySelector } from '../components/CurrencySelector';
import { calculateAuthoritativeFare } from '../lib/fareEngine';
import {
  getActivePublicVehicles,
  getCategoryFallbackImage,
  normalizeVehicleImageUrl,
} from '../lib/vehicleHelpers';
import { OptimizedImage } from '../components/OptimizedImage';

interface FaqItem {
  question: string;
  answer: string;
}

const AIRPORT_DROP_FAQS: FaqItem[] = [
  {
    question: 'How long does the drive take from Galle to Colombo Airport (CMB)?',
    answer:
      'Via the Southern Expressway (E01) and Outer Circular Expressway (E02), the drive usually takes 1 hour 45 minutes to 2 hours 15 minutes depending on traffic near the airport gate. We always recommend scheduling your departure at least 4.5 hours before an international flight departure time.',
  },
  {
    question: 'Are the expressway highway toll clearances included in the fare?',
    answer:
      'Yes, 100% included. All quoted fares on Galle Taxi include the Southern Expressway toll fees, vehicle fuel, parking clearances, and English-speaking chauffeur service. You will never be asked for additional toll cash during the trip.',
  },
  {
    question: 'Can you pick up from any hotel, villa, or resort along the South Coast?',
    answer:
      'Yes. We provide door-to-door departure pickups from anywhere in Galle Fort, Unawatuna, Thalpe, Koggala, Ahangama, Midigama, Weligama, Mirissa, and surrounding southern beach villas. Your chauffeur will arrive 10 minutes prior to your requested departure time.',
  },
  {
    question: 'What if our departure flight is scheduled in the middle of the night?',
    answer:
      'Our dispatch desk and chauffeurs operate 24 hours a day, 7 days a week. Midnight, early dawn, or late evening pickups are fully supported at no extra night surcharge.',
  },
  {
    question: 'What happens if we need to cancel or change our pickup time?',
    answer:
      'We offer free cancellations and flexible reschedule options up to 12 hours before your scheduled pickup time. Just message our 24/7 WhatsApp hotline or email us.',
  },
];

export const AirportDropPage: React.FC = () => {
  const { vehicles, fareRules, siteSettings, formatFare, isFirebaseActive, isPublicDataLoaded } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const activePublicVehicles = useMemo(() => getActivePublicVehicles(vehicles), [vehicles]);
  const isLoadingVehicles = activePublicVehicles.length === 0 && isFirebaseActive && !isPublicDataLoaded;

  // SEO Meta Title, Meta Description, Social Cards & Schema.org Structured Data
  useEffect(() => {
    const prevTitle = document.title;
    const pageTitle = 'Galle to Colombo Airport Drop Taxi | Private CMB Transfers';
    const pageDescription =
      'Book reliable 24/7 airport drop taxi from Galle & South Coast to Colombo Airport (CMB). Fixed rates, E01 highway tolls included, private AC fleet & chauffeurs.';
    const pageKeywords =
      'galle to colombo airport taxi, airport drop galle, colombo airport transfer cmb, southern expressway taxi sri lanka, unawatuna to airport taxi, weligama to cmb transfer, private airport drop sri lanka';
    const canonicalUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/airport-drop`
        : 'https://galletaxi.lk/airport-drop';
    const ogImage =
      typeof window !== 'undefined'
        ? `${window.location.origin}/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp`
        : 'https://galletaxi.lk/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp';

    // 1. Update Title
    document.title = pageTitle;

    // 2. Helper to safely update or insert meta tags with cleanup
    const metaCleanups: (() => void)[] = [];
    const setMetaTag = (attributeName: 'name' | 'property', key: string, content: string) => {
      let metaEl = document.querySelector(`meta[${attributeName}="${key}"]`);
      const created = !metaEl;
      const prevContent = metaEl?.getAttribute('content') ?? null;

      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute(attributeName, key);
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', content);

      metaCleanups.push(() => {
        if (created) {
          metaEl?.remove();
        } else if (prevContent !== null) {
          metaEl?.setAttribute('content', prevContent);
        }
      });
    };

    // Standard SEO Tags
    setMetaTag('name', 'description', pageDescription);
    setMetaTag('name', 'keywords', pageKeywords);

    // OpenGraph Tags
    setMetaTag('property', 'og:title', pageTitle);
    setMetaTag('property', 'og:description', pageDescription);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('property', 'og:image', ogImage);
    setMetaTag('property', 'og:site_name', siteSettings.businessName || 'Galle Taxi');

    // Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', pageTitle);
    setMetaTag('name', 'twitter:description', pageDescription);
    setMetaTag('name', 'twitter:image', ogImage);

    // Canonical Link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    const createdCanonical = !canonicalLink;
    const prevCanonicalHref = canonicalLink?.getAttribute('href') ?? null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonicalUrl);

    // Schema.org Structured Data (TaxiService & FAQPage)
    const schemaScriptId = 'airport-drop-seo-schema';
    let schemaScript = document.getElementById(schemaScriptId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaScriptId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const structuredData = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TaxiService',
          '@id': `${canonicalUrl}#taxiservice`,
          name: 'Colombo Airport Drop Taxi Service - Galle Taxi',
          serviceType: 'Private Airport Departure Transfer',
          description: pageDescription,
          url: canonicalUrl,
          telephone: siteSettings.phone || '+94771234567',
          priceRange: '$$',
          currenciesAccepted: 'LKR, USD, EUR, GBP',
          paymentAccepted: 'Cash, Credit Card, Bank Transfer',
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '00:00',
              closes: '23:59',
            },
          ],
          areaServed: [
            { '@type': 'AdministrativeArea', name: 'Galle' },
            { '@type': 'AdministrativeArea', name: 'Unawatuna' },
            { '@type': 'AdministrativeArea', name: 'Ahangama' },
            { '@type': 'AdministrativeArea', name: 'Weligama' },
            { '@type': 'AdministrativeArea', name: 'Mirissa' },
            { '@type': 'AdministrativeArea', name: 'Hikkaduwa' },
            { '@type': 'AdministrativeArea', name: 'Koggala' },
            { '@type': 'AdministrativeArea', name: 'Talpe' },
            { '@type': 'AdministrativeArea', name: 'Midigama' },
            { '@type': 'AdministrativeArea', name: 'Bentota' },
          ],
          provider: {
            '@type': 'LocalBusiness',
            name: siteSettings.businessName || 'Galle Taxi',
            image: ogImage,
            telephone: siteSettings.phone || '+94771234567',
            address: {
              '@type': 'PostalAddress',
              streetAddress: siteSettings.address || 'Rampart Street, Galle Dutch Fort',
              addressLocality: 'Galle',
              postalCode: '80000',
              addressCountry: 'LK',
            },
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: AIRPORT_DROP_FAQS.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: faq.answer,
            },
          })),
        },
      ],
    };

    schemaScript.textContent = JSON.stringify(structuredData);

    return () => {
      document.title = prevTitle;
      metaCleanups.forEach((cleanup) => cleanup());
      if (createdCanonical) {
        canonicalLink?.remove();
      } else if (prevCanonicalHref !== null) {
        canonicalLink?.setAttribute('href', prevCanonicalHref);
      }
      const existingScript = document.getElementById(schemaScriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [siteSettings.businessName, siteSettings.phone, siteSettings.address]);

  // Quick Book parameters
  const [selectedPickup, setSelectedPickup] = useState('Galle Dutch Fort');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [passengerCount, setPassengerCount] = useState(2);

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  // Representative airport route from Galle to CMB
  const airportRoute =
    fareRules.fixedRoutes.find(
      (r) =>
        r.to.toLowerCase().includes('airport') ||
        r.to.toLowerCase().includes('cmb') ||
        r.from.toLowerCase().includes('galle')
    ) || fareRules.fixedRoutes[0];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden border-b border-[#1F1F23] py-16 sm:py-24">
        {/* Ambient luxury glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] text-xs font-bold uppercase tracking-wider">
                <PlaneTakeoff className="w-3.5 h-3.5" />
                <span>Expressway Direct Highway Transfer</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
                Airport Drop Service: Galle & South Coast to Colombo Airport (CMB)
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Guaranteed on-time executive transfers via the Southern Expressway (E01) directly to the Departure Terminal of Bandaranaike International Airport. Highway tolls, luggage handling, fuel, and private A/C chauffeur included with zero hidden extras.
              </p>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Highway Duration</span>
                  <span className="text-base font-bold text-white font-['Outfit']">1h 45m – 2h 15m</span>
                  <span className="text-[10px] text-emerald-400 block font-medium">Southern Expressway (E01)</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Expressway Tolls</span>
                  <span className="text-base font-bold text-[#F5B91B] font-['Outfit']">100% Included</span>
                  <span className="text-[10px] text-slate-400 block">No cash needed at toll gates</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Departure Timing</span>
                  <span className="text-base font-bold text-white font-['Outfit']">24/7 On Demand</span>
                  <span className="text-[10px] text-slate-400 block">Pickup at hotel lobby</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={`/book?serviceType=AIRPORT+DROP&pickup=${encodeURIComponent(
                    selectedPickup
                  )}&destination=Bandaranaike+International+Airport+(CMB)&date=${selectedDate}&time=${selectedTime}`}
                  className="px-6 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#F5B91B]/20 transition-all cursor-pointer"
                >
                  <span>Book Airport Drop Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    'Hello Galle Taxi, I would like to book an Airport Drop from ' +
                      selectedPickup +
                      ' to Colombo Airport (CMB).'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1f1f23] text-white border border-[#27272A] hover:border-[#25D366]/50 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Dispatch</span>
                </a>
              </div>
            </div>

            {/* Right Card Column - Quick Ride Configurator */}
            <div className="lg:col-span-5">
              <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider text-[#F5B91B] font-bold">
                      Direct Airport Drop
                    </span>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      Departure Reservation
                    </h3>
                  </div>
                  <CurrencySelector variant="navbar" />
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Pickup Location (South Coast Hotel / Villa)</span>
                    </label>
                    <select
                      value={selectedPickup}
                      onChange={(e) => setSelectedPickup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    >
                      <option value="Galle Dutch Fort">Galle Dutch Fort (Any Hotel / Villa)</option>
                      <option value="Unawatuna Beach">Unawatuna (Beach / Yaddehimulla)</option>
                      <option value="Thalpe / Koggala">Thalpe / Koggala Beach Resorts</option>
                      <option value="Ahangama / Kabalana">Ahangama / Kabalana Surf Villas</option>
                      <option value="Midigama Beach">Midigama Beach</option>
                      <option value="Weligama Bay">Weligama Bay (Resorts / Beach)</option>
                      <option value="Mirissa Coast">Mirissa (Harbour / Coconut Tree Hill)</option>
                      <option value="Hikkaduwa Beach">Hikkaduwa (Beach / Hotels)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="drop-destination-airport" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <PlaneTakeoff className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Destination Airport</span>
                    </label>
                    <input
                      id="drop-destination-airport"
                      type="text"
                      disabled
                      value="Bandaranaike International Airport (CMB) — Departure Terminal"
                      className="w-full min-h-[44px] px-3 py-2.5 bg-[#0B0B0D]/60 border border-[#27272A] rounded-xl text-xs text-slate-300 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="drop-pickup-date" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Pickup Date</span>
                      </label>
                      <input
                        id="drop-pickup-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="drop-pickup-time" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Pickup Time</span>
                      </label>
                      <input
                        id="drop-pickup-time"
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Passenger Count</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 4, 7].map((count) => (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setPassengerCount(count)}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            passengerCount === count
                              ? 'bg-[#F5B91B] text-black border-[#F5B91B]'
                              : 'bg-[#0B0B0D] text-slate-300 border-[#27272A] hover:border-slate-500'
                          }`}
                        >
                          {count} {count === 1 ? 'Pax' : count === 7 ? '7+ Pax' : 'Pax'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/book?serviceType=AIRPORT+DROP&pickup=${encodeURIComponent(
                      selectedPickup
                    )}&destination=Bandaranaike+International+Airport+(CMB)&date=${selectedDate}&time=${selectedTime}&passengers=${passengerCount}`}
                    className="w-full py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Proceed to Vehicle Selection & Final Quote</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Zero prepayment required. Instant email voucher and chauffeur confirmation.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FLEET & FIXED PRICING FOR AIRPORT DROP */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Transparent Pricing Structure
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Airport Drop Rates by Vehicle Class
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Fixed rates from Galle / South Coast to Colombo Airport (CMB). All prices include Southern Expressway E01 tolls, fuel, vehicle insurance, and driver.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoadingVehicles ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`drop-veh-skeleton-${idx}`}
                className="bg-[#141416] border border-[#27272A] rounded-2xl p-5 animate-pulse space-y-4"
              >
                <div className="aspect-[16/10] bg-[#1A1A1E] rounded-xl" />
                <div className="h-5 w-2/3 rounded bg-[#1F1F26]" />
                <div className="h-8 w-1/2 rounded bg-[#1A1A1E]" />
                <div className="h-9 w-full rounded-xl bg-[#1F1F26]" />
              </div>
            ))
          ) : (
            activePublicVehicles.map((veh) => {
            const fareCalc = calculateAuthoritativeFare({
              pickup: selectedPickup || 'Galle Dutch Fort',
              destination: 'Bandaranaike International Airport (CMB)',
              vehicleCategoryId: veh.id,
              pickupTime: selectedTime || '14:00',
              vehicles,
              fareRules,
            });
            const estimatedPrice = fareCalc.fare;

            return (
              <div
                key={veh.id}
                className="bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/50 rounded-2xl overflow-hidden flex flex-col justify-between p-5 transition-all shadow-xl group"
              >
                <div className="space-y-4">
                  <div className="relative aspect-[16/10] bg-[#1A1A1E] rounded-xl overflow-hidden border border-[#27272A] p-2 flex items-center justify-center">
                    <OptimizedImage
                      src={normalizeVehicleImageUrl(veh.imageUrl, veh.category, veh.id, veh.name)}
                      fallbackSrc={getCategoryFallbackImage(veh.category, veh.id, veh.name)}
                      alt={veh.name}
                      loading="lazy"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#F5B91B] border border-[#27272A]">
                      {veh.category}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white font-['Outfit']">
                      {veh.name}
                    </h3>
                    <p className="text-xs text-slate-400">{veh.modelSubtitle || veh.category}</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>{veh.passengers} Pax</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>{veh.luggage} Bags</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#27272A] space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                      Fixed All-Inclusive Drop Fare
                    </span>
                    <div className="text-xl font-mono font-extrabold text-[#F5B91B]">
                      {formatFare(estimatedPrice)}
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-medium">
                      ✓ Expressway E01 Toll Included
                    </span>
                  </div>
                </div>

                <div className="pt-5">
                  <Link
                    to={`/book?serviceType=AIRPORT+DROP&vehicleId=${encodeURIComponent(
                      veh.id
                    )}&pickup=Galle+Dutch+Fort&destination=Bandaranaike+International+Airport+(CMB)`}
                    className="w-full py-2.5 rounded-xl bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-white font-bold text-xs transition-colors text-center block cursor-pointer"
                  >
                    Select {veh.name.split(' ')[0]} Drop
                  </Link>
                </div>
              </div>
            );
          })
          )}
        </div>
      </section>

      {/* 3. STEP BY STEP HOW IT WORKS */}
      <section className="py-16 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Effortless Departure
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              How the Airport Drop Works
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              We eliminate departure stress with disciplined timing and professional chauffeur protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Schedule Your Pickup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your southern villa or hotel address and flight departure time. We recommend leaving 4.5 hours prior to your international flight.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Instant Chauffeur Dispatch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive an immediate booking voucher by email and WhatsApp confirmation with your designated driver’s name, phone, and vehicle details.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Punctual Lobby Pickup</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your driver arrives 10 minutes early at your hotel lobby or villa driveway, assists with all heavy baggage, and sets up your air-conditioned ride.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                04
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Expressway Direct Drop</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Cruise non-stop along the Southern Expressway (E01) with prepaid toll clearance, arriving smoothly at the Departure Porch of Colombo (CMB) terminal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Airport Drop FAQ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Everything you need to know about departure airport transfers from southern Sri Lanka.
          </p>
        </div>

        <div className="space-y-3">
          {AIRPORT_DROP_FAQS.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#1a1a1e] transition-colors"
                >
                  <span className="text-sm font-bold text-white font-['Outfit']">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#F5B91B] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#1F1F23]">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-[#141416] border border-[#27272A] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white font-['Outfit']">
              Have an urgent departure or flight question?
            </h4>
            <p className="text-xs text-slate-400">
              Our 24/7 airport dispatch team is ready to assist with real-time advice.
            </p>
          </div>
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              'Hello Galle Taxi, I have a question regarding an airport drop departure.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center gap-2 shrink-0 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat on WhatsApp</span>
          </a>
        </div>
      </section>
    </div>
  );
};
