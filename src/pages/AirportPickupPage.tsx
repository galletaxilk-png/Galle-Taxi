import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  PlaneLanding,
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
  UserCheck,
  Plane,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { CurrencySelector } from '../components/CurrencySelector';
import { calculateAuthoritativeFare } from '../lib/fareEngine';
import {
  getActivePublicVehicles,
  getCategoryFallbackImage,
  normalizeVehicleImageUrl,
} from '../lib/vehicleHelpers';

interface FaqItem {
  question: string;
  answer: string;
}

const AIRPORT_PICKUP_FAQS: FaqItem[] = [
  {
    question: 'How will I find my chauffeur at Colombo Airport (CMB)?',
    answer:
      'Immediately after clearing customs, baggage claim, and currency exchange, step into the main arrival lobby. Your chauffeur will be waiting in the greeting area holding a clear nameboard prominently displaying your name and the Galle Taxi emblem.',
  },
  {
    question: 'What happens if my inbound flight is delayed or rescheduled?',
    answer:
      'We monitor all incoming commercial flights in real time using automated flight radar. There is ZERO extra waiting surcharge or penalty if your flight touches down later than scheduled. Your chauffeur automatically adjusts pickup time to your actual landing time.',
  },
  {
    question: 'Is there time to withdraw Sri Lankan Rupees (LKR) or purchase a tourist SIM card?',
    answer:
      'Absolutely. There are multiple 24/7 bank ATMs and Dialog/Mobitel telecommunications kiosks right in the arrivals hall before exiting. Your chauffeur will patiently assist you and wait until you have everything sorted before heading to the vehicle.',
  },
  {
    question: 'Can you transport surfboards, baby strollers, and oversized baggage?',
    answer:
      'Yes. For travelers carrying surfboard bags, golf bags, or heavy family luggage, we recommend our High-Roof VIP KDH Commuter Van, which easily accommodates long boards and up to 10 large suitcases without crowding passengers.',
  },
  {
    question: 'How do we pay for our airport transfer?',
    answer:
      'You can pay your driver upon safe arrival at your hotel in Sri Lankan Rupees (LKR), USD, EUR, or GBP at current bank rates, or arrange credit card processing with our dispatch office beforehand.',
  },
];

export const AirportPickupPage: React.FC = () => {
  const { vehicles, fareRules, siteSettings, formatFare } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // SEO Meta Title, Meta Description, Social Cards & Schema.org Structured Data
  useEffect(() => {
    const prevTitle = document.title;
    const pageTitle = 'Colombo Airport Pick Up Taxi | CMB to Galle Transfers';
    const pageDescription =
      'Book 24/7 Colombo Airport (CMB) pick up taxi to Galle & South Coast. VIP arrivals meet & greet, free flight delay tracking, E01 expressway tolls included.';
    const pageKeywords =
      'colombo airport pick up taxi, cmb airport taxi to galle, airport arrival transfer sri lanka, bandaranaike airport meet and greet taxi, colombo to unawatuna taxi, colombo to weligama transfer, private airport pickup sri lanka';
    const canonicalUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/airport-pickup`
        : 'https://galletaxi.lk/airport-pickup';
    const ogImage =
      typeof window !== 'undefined'
        ? `${window.location.origin}/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png`
        : 'https://galletaxi.lk/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png';

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
    const schemaScriptId = 'airport-pickup-seo-schema';
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
          name: 'Colombo Airport Pick Up Taxi Service - Galle Taxi',
          serviceType: 'Private Airport Arrival Transfer',
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
          mainEntity: AIRPORT_PICKUP_FAQS.map((faq) => ({
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
  const [flightNumber, setFlightNumber] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('Galle Dutch Fort');
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [landingTime, setLandingTime] = useState('11:30');
  const [passengerCount, setPassengerCount] = useState(2);

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  // Representative airport route
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
                <PlaneLanding className="w-3.5 h-3.5" />
                <span>VIP Arrival Meet & Greet with Flight Radar Tracking</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
                Airport Pick Up Service: Colombo (CMB) to Galle & Southern Beaches
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Arrive in Sri Lanka with complete peace of mind. Your personal chauffeur greets you inside the Bandaranaike International Airport arrival lobby with a personalized nameboard, monitors flight delays in real time, and whisks you south along the Southern Expressway (E01).
              </p>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Flight Delay Cover</span>
                  <span className="text-base font-bold text-[#F5B91B] font-['Outfit']">Free Radar Tracking</span>
                  <span className="text-[10px] text-slate-400 block">No surcharge for late arrivals</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Arrival Meet & Greet</span>
                  <span className="text-base font-bold text-white font-['Outfit']">Lobby Nameboard</span>
                  <span className="text-[10px] text-emerald-400 block font-medium">Luggage assistance included</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Expressway Tolls</span>
                  <span className="text-base font-bold text-white font-['Outfit']">E01 & E02 Included</span>
                  <span className="text-[10px] text-slate-400 block">Fast highway transit</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={`/book?serviceType=AIRPORT+PICK+UP&pickup=Bandaranaike+International+Airport+(CMB)&destination=${encodeURIComponent(
                    selectedDestination
                  )}&date=${selectedDate}&time=${landingTime}`}
                  className="px-6 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#F5B91B]/20 transition-all cursor-pointer"
                >
                  <span>Book Airport Pick Up Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    'Hello Galle Taxi, I would like to book an Airport Pick Up from Colombo Airport (CMB) to ' +
                      selectedDestination +
                      '.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1f1f23] text-white border border-[#27272A] hover:border-[#25D366]/50 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp 24/7 Desk</span>
                </a>
              </div>
            </div>

            {/* Right Card Column - Quick Ride Configurator */}
            <div className="lg:col-span-5">
              <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider text-[#F5B91B] font-bold">
                      Arrival Transfer
                    </span>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      CMB Airport Pickup
                    </h3>
                  </div>
                  <CurrencySelector variant="navbar" />
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label htmlFor="pickup-arrival-airport" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <PlaneLanding className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Arrival Airport</span>
                    </label>
                    <input
                      id="pickup-arrival-airport"
                      type="text"
                      disabled
                      value="Bandaranaike International Airport (CMB) — Arrival Lobby"
                      className="w-full min-h-[44px] px-3 py-2.5 bg-[#0B0B0D]/60 border border-[#27272A] rounded-xl text-xs text-slate-300 font-medium cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="pickup-destination-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>South Coast Destination (Hotel, Resort, or Villa)</span>
                    </label>
                    <select
                      id="pickup-destination-select"
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      className="w-full min-h-[44px] px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    >
                      <option value="Galle Dutch Fort">Galle Dutch Fort (Historic Fort / Lighthouse)</option>
                      <option value="Unawatuna Beach">Unawatuna (Beach / Yaddehimulla / Jungle Beach)</option>
                      <option value="Thalpe / Koggala">Thalpe / Koggala (Beach Villas & Resorts)</option>
                      <option value="Ahangama / Kabalana">Ahangama / Kabalana Surf Coast</option>
                      <option value="Midigama Beach">Midigama (Surf Point & Villas)</option>
                      <option value="Weligama Bay">Weligama Bay (Marriott / Surf Schools / Cape)</option>
                      <option value="Mirissa Coast">Mirissa (Beach / Coconut Tree Hill / Harbour)</option>
                      <option value="Dikwella / Hiriketiya">Hiriketiya Horseshoe Bay / Dikwella</option>
                      <option value="Tangalle Coast">Tangalle (Anantara / Silent Beach)</option>
                      <option value="Hikkaduwa Beach">Hikkaduwa (Beach Resorts / Coral Reef)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="pickup-landing-date" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Landing Date</span>
                      </label>
                      <input
                        id="pickup-landing-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pickup-landing-time" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Estimated Landing Time</span>
                      </label>
                      <input
                        id="pickup-landing-time"
                        type="time"
                        value={landingTime}
                        onChange={(e) => setLandingTime(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="pickup-flight-number" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Plane className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Inbound Flight No. (Optional)</span>
                      </label>
                      <input
                        id="pickup-flight-number"
                        type="text"
                        placeholder="e.g. UL 504 / EK 652"
                        value={flightNumber}
                        onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="pickup-passengers-select" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Passengers</span>
                      </label>
                      <select
                        id="pickup-passengers-select"
                        value={passengerCount}
                        onChange={(e) => setPassengerCount(Number(e.target.value))}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      >
                        <option value={1}>1 Passenger</option>
                        <option value={2}>2 Passengers</option>
                        <option value={3}>3 Passengers</option>
                        <option value={4}>4 Passengers</option>
                        <option value={6}>5–6 Passengers</option>
                        <option value={8}>7–8+ Passengers (Van)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    to={`/book?serviceType=AIRPORT+PICK+UP&pickup=Bandaranaike+International+Airport+(CMB)&destination=${encodeURIComponent(
                      selectedDestination
                    )}&date=${selectedDate}&time=${landingTime}&passengers=${passengerCount}`}
                    className="w-full py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Confirm Vehicle Class & Upfront Fare</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Complimentary flight delay tracking & nameboard meet in lobby included.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. FLEET & FIXED PRICING FOR AIRPORT PICKUP */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Guaranteed Fixed Arrival Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Airport Pick Up Rates by Vehicle Class
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            From Colombo (CMB) Airport to Galle, Unawatuna, Weligama & Mirissa. Includes meet & greet, Southern Expressway E01 tolls, flight delay waiting, and bottled water.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {getActivePublicVehicles(vehicles).map((veh) => {
            const fareCalc = calculateAuthoritativeFare({
              pickup: 'Bandaranaike International Airport (CMB)',
              destination: selectedDestination || 'Galle Dutch Fort',
              vehicleCategoryId: veh.id,
              pickupTime: landingTime || '11:30',
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
                    <img
                      src={normalizeVehicleImageUrl(veh.imageUrl, veh.category, veh.id, veh.name)}
                      alt={veh.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.dataset.fallbackApplied) return;
                        target.dataset.fallbackApplied = 'true';
                        target.src = getCategoryFallbackImage(veh.category, veh.id, veh.name);
                      }}
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
                      Arrival All-Inclusive Fare
                    </span>
                    <div className="text-xl font-mono font-extrabold text-[#F5B91B]">
                      {formatFare(estimatedPrice)}
                    </div>
                    <span className="text-[10px] text-emerald-400 block font-medium">
                      ✓ Lobby Nameboard + Tolls Included
                    </span>
                  </div>
                </div>

                <div className="pt-5">
                  <Link
                    to={`/book?serviceType=AIRPORT+PICK+UP&vehicleId=${encodeURIComponent(
                      veh.id
                    )}&pickup=Bandaranaike+International+Airport+(CMB)&destination=Galle+Dutch+Fort`}
                    className="w-full py-2.5 rounded-xl bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-white font-bold text-xs transition-colors text-center block cursor-pointer"
                  >
                    Book {veh.name.split(' ')[0]} Pickup
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. STEP BY STEP ARRIVAL PROCESS */}
      <section className="py-16 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Seamless Arrival Protocol
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              What to Expect When You Land at Colombo (CMB)
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              From touchdown through the arrival gates to your beachside villa doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                01
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Automated Flight Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Provide your flight number when reserving. Our system monitors live radar updates and dispatches your driver exactly when your plane touches down.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                02
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Meet in Arrival Hall</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clear customs and step into the main terminal lobby. Your chauffeur will be waiting right in front of the exit doors holding a personalized nameboard.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                03
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">SIM & Currency Assistance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Need Sri Lankan cash or an eSIM/SIM card? Your driver will happily wait while you access the 24/7 bank ATMs and telecom booths inside the terminal.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 text-[#F5B91B] font-black font-mono text-base flex items-center justify-center">
                04
              </div>
              <h3 className="text-base font-bold text-white font-['Outfit']">Southern Expressway Ride</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Relax in a cool, quiet, air-conditioned vehicle with complimentary bottled water as you cruise south directly to your resort or private villa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Arrival Inquiries
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Airport Pick Up FAQ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Answers to common questions regarding landing at Bandaranaike International Airport (CMB).
          </p>
        </div>

        <div className="space-y-3">
          {AIRPORT_PICKUP_FAQS.map((faq, idx) => {
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
              Need to coordinate an arrival right now?
            </h4>
            <p className="text-xs text-slate-400">
              Our 24/7 airport dispatch team can arrange a vehicle in as little as 30 minutes.
            </p>
          </div>
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              'Hello Galle Taxi, I just landed / am landing soon at Colombo Airport and need a transfer.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center gap-2 shrink-0 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Instant WhatsApp Dispatch</span>
          </a>
        </div>
      </section>
    </div>
  );
};
