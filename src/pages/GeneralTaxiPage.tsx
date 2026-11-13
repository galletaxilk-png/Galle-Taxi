import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
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
  Compass,
  Navigation,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { CurrencySelector } from '../components/CurrencySelector';
import {
  getActivePublicVehicles,
  getCategoryFallbackImage,
  normalizeVehicleImageUrl,
} from '../lib/vehicleHelpers';

interface PopularRoute {
  from: string;
  to: string;
  duration: string;
  distanceKm: number;
  sedanLkr: number;
  vanLkr: number;
  highlight: string;
}

const POPULAR_COASTAL_ROUTES: PopularRoute[] = [
  {
    from: 'Galle Dutch Fort',
    to: 'Unawatuna Beach',
    duration: '15 Mins',
    distanceKm: 6,
    sedanLkr: 2500,
    vanLkr: 3500,
    highlight: 'Quick beach shuttle, Yaddehimulla, Jungle Beach',
  },
  {
    from: 'Galle Fort',
    to: 'Thalpe / Koggala Lake',
    duration: '20 Mins',
    distanceKm: 14,
    sedanLkr: 3500,
    vanLkr: 4800,
    highlight: 'Stilt fishermen, spice gardens & Martin Wickramasinghe Museum',
  },
  {
    from: 'Galle Fort',
    to: 'Ahangama / Kabalana Surf',
    duration: '30 Mins',
    distanceKm: 21,
    sedanLkr: 5200,
    vanLkr: 6800,
    highlight: 'Surf camps, boutique beachfront cafes & sunset bars',
  },
  {
    from: 'Galle Fort',
    to: 'Weligama Bay',
    duration: '40 Mins',
    distanceKm: 29,
    sedanLkr: 7200,
    vanLkr: 9200,
    highlight: 'Beginner surf beach, Marriott resort & Taprobane Island',
  },
  {
    from: 'Galle Fort',
    to: 'Mirissa Beach & Harbour',
    duration: '45 Mins',
    distanceKm: 35,
    sedanLkr: 8500,
    vanLkr: 11000,
    highlight: 'Coconut Tree Hill, whale watching dock & parrot rock',
  },
  {
    from: 'Galle Fort',
    to: 'Hikkaduwa Beach',
    duration: '30 Mins',
    distanceKm: 20,
    sedanLkr: 5000,
    vanLkr: 6500,
    highlight: 'Coral reef sanctuary, sea turtle point & beach clubs',
  },
  {
    from: 'Galle Coast',
    to: 'Ella Hill Country',
    duration: '4h 15m',
    distanceKm: 200,
    sedanLkr: 38000,
    vanLkr: 46000,
    highlight: 'Scenic mountain climb, Ravana Falls & tea plantations',
  },
  {
    from: 'Galle Coast',
    to: 'Yala National Park Safari',
    duration: '3h 30m',
    distanceKm: 165,
    sedanLkr: 34000,
    vanLkr: 42000,
    highlight: 'Leopard & elephant safari drop directly to luxury tent camps',
  },
];

const GENERAL_TAXI_FAQS = [
  {
    question: 'How fast can a taxi arrive for an on-demand pickup in Galle or Unawatuna?',
    answer:
      'We maintain active vehicles throughout Galle Fort, Unawatuna, Thalpe, and Ahangama. Average arrival time is 10 to 20 minutes from the moment you book via our website or message our WhatsApp dispatch.',
  },
  {
    question: 'Are all taxis air-conditioned and private?',
    answer:
      'Yes, 100%. Every Galle Taxi ride is strictly private—never shared with strangers—and operates in modern, cool, fully air-conditioned vehicles with licensed, courteous English-speaking chauffeurs.',
  },
  {
    question: 'Can we hire a taxi and driver for a full day of sightseeing or custom stops?',
    answer:
      'Yes! We offer flexible hourly and full-day chauffeur hire. Your driver will remain on standby at each destination while you explore, shop, dine, or surf.',
  },
  {
    question: 'How are fares calculated for custom point-to-point trips?',
    answer:
      'Our fares are calculated based on transparent per-kilometer rates with zero surge pricing. Short trips have fixed transparent minimums, and long-distance inter-city trips feature all-inclusive fixed rates covering fuel, vehicle, and driver.',
  },
  {
    question: 'Can we stop for photos, fresh coconuts, or currency exchange along the way?',
    answer:
      'Of course. Your chauffeur is at your complete disposal and happy to accommodate brief stops for roadside king coconuts, viewpoints, or quick errands at no extra charge.',
  },
];

export const GeneralTaxiPage: React.FC = () => {
  const { vehicles, fareRules, siteSettings, formatFare } = useApp();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const popularRoutes: PopularRoute[] = React.useMemo(() => {
    if (fareRules.fixedRoutes && fareRules.fixedRoutes.length > 0) {
      return fareRules.fixedRoutes.map((r) => ({
        from: r.from,
        to: r.to,
        duration: r.estimatedDuration || 'Direct Transfer',
        distanceKm: r.estimatedDistanceKm || 0,
        sedanLkr: r.sedanPrice,
        vanLkr: r.vanPrice,
        highlight: r.description || `${r.from} to ${r.to} private AC transfer`,
      }));
    }
    return POPULAR_COASTAL_ROUTES;
  }, [fareRules.fixedRoutes]);

  // SEO Meta Title, Meta Description, Social Cards & Schema.org Structured Data
  useEffect(() => {
    const prevTitle = document.title;
    const pageTitle = 'Galle Taxi Service | 24/7 Private Rides & Coastal Transfers';
    const pageDescription =
      'Book reliable 24/7 private taxi in Galle, Unawatuna, Weligama & Mirissa. Fixed rates, modern AC fleet, fast pickups & intercity transfers across Sri Lanka.';
    const pageKeywords =
      'galle taxi service, general taxi galle, private taxi south coast sri lanka, unawatuna taxi, weligama taxi, mirissa taxi service, intercity taxi sri lanka, private driver galle';
    const canonicalUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}/general-taxi`
        : 'https://galletaxi.lk/general-taxi';
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
    const schemaScriptId = 'general-taxi-seo-schema';
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
          name: 'Galle Taxi Service - Private Coastal & Intercity Transfers',
          serviceType: 'Point-to-Point Taxi and Intercity Chauffeur Service',
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
            { '@type': 'AdministrativeArea', name: 'Ella' },
            { '@type': 'AdministrativeArea', name: 'Yala' },
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
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Popular Coastal and Intercity Taxi Routes',
            itemListElement: popularRoutes.map((route) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: `${route.from} to ${route.to} Private Taxi`,
                description: `${route.duration} (${route.distanceKm} km). ${route.highlight}`,
              },
            })),
          },
        },
        {
          '@type': 'FAQPage',
          '@id': `${canonicalUrl}#faq`,
          mainEntity: GENERAL_TAXI_FAQS.map((faq) => ({
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
  }, [siteSettings.businessName, siteSettings.phone, siteSettings.address, popularRoutes]);

  // Quick Book parameters
  const [selectedPickup, setSelectedPickup] = useState('Galle Dutch Fort');
  const [selectedDestination, setSelectedDestination] = useState('Mirissa Beach / Weligama');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('10:00');
  const [passengerCount, setPassengerCount] = useState(2);

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

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
                <Car className="w-3.5 h-3.5" />
                <span>24/7 Southern Coast & Island-Wide Taxi</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
                General Taxi & Coastal Rides: Galle, Southern Beaches & Beyond
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                Experience hassle-free point-to-point private travel across southern Sri Lanka. From 15-minute coastal hops between Galle Fort, Unawatuna, and Mirissa to scenic cross-country journeys to Ella or Yala, our executive air-conditioned fleet is always at your command.
              </p>

              {/* Key Trust Signals */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Average Response</span>
                  <span className="text-base font-bold text-white font-['Outfit']">10–20 Minutes</span>
                  <span className="text-[10px] text-emerald-400 block font-medium">Fast southern pickup</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <span className="text-[11px] text-slate-400 block">Pricing Model</span>
                  <span className="text-base font-bold text-[#F5B91B] font-['Outfit']">Zero Surge</span>
                  <span className="text-[10px] text-slate-400 block">Fixed transparent fares</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141416] border border-[#27272A] space-y-1 col-span-2 sm:col-span-1">
                  <span className="text-[11px] text-slate-400 block">Comfort Standard</span>
                  <span className="text-base font-bold text-white font-['Outfit']">100% Private A/C</span>
                  <span className="text-[10px] text-slate-400 block">Clean & sanitized vehicles</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  to={`/book?serviceType=TAXI+RIDE&pickup=${encodeURIComponent(
                    selectedPickup
                  )}&destination=${encodeURIComponent(
                    selectedDestination
                  )}&date=${selectedDate}&time=${selectedTime}`}
                  className="px-6 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-[#F5B91B]/20 transition-all cursor-pointer"
                >
                  <span>Book a Taxi Ride Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    'Hello Galle Taxi, I need a private taxi from ' +
                      selectedPickup +
                      ' to ' +
                      selectedDestination +
                      '.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-3.5 rounded-xl bg-[#141416] hover:bg-[#1f1f23] text-white border border-[#27272A] hover:border-[#25D366]/50 text-sm font-semibold flex items-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>Instant WhatsApp Call</span>
                </a>
              </div>
            </div>

            {/* Right Card Column - Quick Ride Configurator */}
            <div className="lg:col-span-5">
              <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
                  <div className="space-y-0.5">
                    <span className="text-xs uppercase tracking-wider text-[#F5B91B] font-bold">
                      Point-to-Point & Day Hire
                    </span>
                    <h3 className="text-lg font-bold text-white font-['Outfit']">
                      Book a Private Taxi
                    </h3>
                  </div>
                  <CurrencySelector variant="navbar" />
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Pickup Location</span>
                    </label>
                    <select
                      value={selectedPickup}
                      onChange={(e) => setSelectedPickup(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    >
                      <option value="Galle Dutch Fort">Galle Dutch Fort (Any Hotel / Cafe)</option>
                      <option value="Unawatuna Beach">Unawatuna (Main Beach / Yaddehimulla)</option>
                      <option value="Thalpe Beach">Thalpe (Luxury Beach Villas)</option>
                      <option value="Koggala Lake">Koggala (Lake / Airbase)</option>
                      <option value="Ahangama / Kabalana">Ahangama (Kabalana Surf Point / Cafes)</option>
                      <option value="Midigama Surf">Midigama (Rams / Lazy Left)</option>
                      <option value="Weligama Bay">Weligama Bay (Marriott / Surf Beach)</option>
                      <option value="Mirissa Coast">Mirissa (Beach / Coconut Tree Hill)</option>
                      <option value="Hikkaduwa Beach">Hikkaduwa (Beach / Surfing Area)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Destination</span>
                    </label>
                    <select
                      value={selectedDestination}
                      onChange={(e) => setSelectedDestination(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    >
                      <option value="Mirissa Beach / Weligama">Mirissa Beach / Weligama Bay</option>
                      <option value="Unawatuna Beach">Unawatuna Beach / Peace Pagoda</option>
                      <option value="Ahangama Surf Point">Ahangama Surf Point / Cafes</option>
                      <option value="Hikkaduwa Beach">Hikkaduwa Coral Reef / Beach</option>
                      <option value="Hiriketiya Beach">Hiriketiya Horseshoe Bay / Dikwella</option>
                      <option value="Tangalle Coast">Tangalle (Silent Beach / Anantara)</option>
                      <option value="Ella Hill Country">Ella Hill Country (Nine Arch Bridge)</option>
                      <option value="Yala National Park">Yala National Park (Safari Gateway)</option>
                      <option value="Udawalawe Elephant Reserve">Udawalawe Elephant Sanctuary</option>
                      <option value="Kandy Royal Botanical Gardens">Kandy (Temple of the Tooth)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label htmlFor="general-pickup-date" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Pickup Date</span>
                      </label>
                      <input
                        id="general-pickup-date"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full min-h-[44px] px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label htmlFor="general-pickup-time" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Pickup Time</span>
                      </label>
                      <input
                        id="general-pickup-time"
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
                      <span>Passengers</span>
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
                    to={`/book?serviceType=TAXI+RIDE&pickup=${encodeURIComponent(
                      selectedPickup
                    )}&destination=${encodeURIComponent(
                      selectedDestination
                    )}&date=${selectedDate}&time=${selectedTime}&passengers=${passengerCount}`}
                    className="w-full py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>Check Distance & Calculate Authoritative Fare</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <p className="text-[11px] text-slate-400 text-center mt-2.5">
                    Transparent distance-based rates. No hidden surge pricing.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. POPULAR SOUTHERN COASTAL ROUTES TABLE */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Transparent Point-to-Point Fares
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Popular Southern Coast & Inter-City Routes
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Fixed transparent rates for clean air-conditioned private vehicles. All prices include fuel, driver allowances, and taxes.
          </p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#1B1B1F] border-b border-[#27272A] text-slate-300 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-4 px-4 sm:px-6">Route</th>
                  <th className="py-4 px-3">Distance & Time</th>
                  <th className="py-4 px-3 text-right">Executive Sedan</th>
                  <th className="py-4 px-3 text-right">VIP Van</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272A]/70">
                {popularRoutes.map((route, idx) => (
                  <tr key={idx} className="hover:bg-[#1A1A1E] transition-colors">
                    <td className="py-4 px-4 sm:px-6">
                      <div className="font-bold text-white text-sm font-['Outfit'] flex items-center gap-1.5">
                        <span>{route.from}</span>
                        <ArrowRight className="w-3 h-3 text-[#F5B91B] shrink-0" />
                        <span>{route.to}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{route.highlight}</div>
                    </td>
                    <td className="py-4 px-3 whitespace-nowrap">
                      <div className="font-mono text-slate-200 font-bold">{route.distanceKm} km</div>
                      <div className="text-[10px] text-slate-400">{route.duration}</div>
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap font-mono text-sm font-bold text-white">
                      {formatFare(route.sedanLkr)}
                    </td>
                    <td className="py-4 px-3 text-right whitespace-nowrap font-mono text-sm font-bold text-[#F5B91B]">
                      {formatFare(route.vanLkr)}
                    </td>
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <Link
                        to={`/book?serviceType=TAXI+RIDE&pickup=${encodeURIComponent(
                          route.from
                        )}&destination=${encodeURIComponent(route.to)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Book</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 3. OUR FLEET FOR GENERAL TAXI */}
      <section className="py-16 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12 max-w-2xl mx-auto">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Versatile Fleet
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Choose the Perfect Vehicle for Your Ride
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm">
              From nimble budget cars for quick town trips to spacious executive commuter vans for groups and surfboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {getActivePublicVehicles(vehicles).map((veh) => (
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

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {veh.description}
                  </p>
                </div>

                <div className="pt-5">
                  <Link
                    to={`/book?serviceType=TAXI+RIDE&vehicleId=${encodeURIComponent(veh.id)}`}
                    className="w-full py-2.5 rounded-xl bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-white font-bold text-xs transition-colors text-center block cursor-pointer"
                  >
                    Select {veh.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-10">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            General Taxi Queries
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Taxi & Coastal Rides FAQ
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Answers to common questions about local taxi rides, surf transfers, and inter-city trips in Sri Lanka.
          </p>
        </div>

        <div className="space-y-3">
          {GENERAL_TAXI_FAQS.map((faq, idx) => {
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
              Need a ride right now in Galle, Unawatuna, or Mirissa?
            </h4>
            <p className="text-xs text-slate-400">
              Our 24/7 dispatchers can assign a nearby driver to your location in minutes.
            </p>
          </div>
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              'Hello Galle Taxi, I need an immediate taxi pickup right now.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-black font-extrabold text-xs flex items-center gap-2 shrink-0 transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Quick Ride</span>
          </a>
        </div>
      </section>
    </div>
  );
};
