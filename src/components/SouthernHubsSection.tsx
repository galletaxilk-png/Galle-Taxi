import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, ArrowRight, ShieldCheck, Car } from 'lucide-react';
import { useApp } from '../lib/store';
import { OptimizedImage } from './OptimizedImage';

export interface SouthernHubItem {
  id: string;
  name: string;
  slug: string;
  badge: string;
  tagline: string;
  distGalle: string;
  distAirport: string;
  popularTrip: string;
  sedanLkr: number;
  vanLkr: number;
  features: string[];
  image: string;
}

export const SOUTHERN_HUBS: SouthernHubItem[] = [
  {
    id: 'ahangama',
    name: 'Ahangama Taxi',
    slug: 'ahangama-taxi',
    badge: 'Surf & Villas Hub',
    tagline: 'Kabalana The Rock, Midigama surf breaks, oceanfront cafes & boutique wellness villas.',
    distGalle: '21 km (30 mins)',
    distAirport: '165 km (2h 15m)',
    popularTrip: 'Ahangama → Colombo Airport (CMB)',
    sedanLkr: 22000,
    vanLkr: 26000,
    features: ['Surfboard Racks Available', 'Expressway Tolls Included', 'Villa Door-to-Door Pickup'],
    image: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp',
  },
  {
    id: 'mirissa',
    name: 'Mirissa Taxi',
    slug: 'mirissa-taxi',
    badge: 'Whales & Bay Haven',
    tagline: 'Whale watching harbour departures, Coconut Tree Hill, Secret Beach & vibrant nightlife.',
    distGalle: '34 km (45 mins)',
    distAirport: '178 km (2h 30m)',
    popularTrip: 'Mirissa → Colombo Airport (CMB)',
    sedanLkr: 23500,
    vanLkr: 28000,
    features: ['Early Morning Boat Transfers', 'Harbour Meet & Greet', 'Luggage Assistance'],
    image: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
  },
  {
    id: 'unawatuna',
    name: 'Unawatuna Taxi',
    slug: 'unawatuna-taxi',
    badge: 'Jungle Beach & Coral',
    tagline: 'Golden crescent beach, Japanese Peace Pagoda, Dalawella turtle lagoon & Rumassala sanctuary.',
    distGalle: '6 km (10 mins)',
    distAirport: '155 km (2h 00m)',
    popularTrip: 'Unawatuna → Colombo Airport (CMB)',
    sedanLkr: 19500,
    vanLkr: 24000,
    features: ['10 Mins to Galle Fort', 'Nightlife & Dinner Rides', 'Child Seat on Request'],
    image: '/assets/aistudio/Down_South_Season_Coastal_Adventures.webp',
  },
  {
    id: 'hikkaduwa',
    name: 'Hikkaduwa Taxi',
    slug: 'hikkaduwa-taxi',
    badge: 'Marine Sanctuary & Waves',
    tagline: 'Vibrant coral reef snorkeling, giant sea turtles, Narigama surf breaks & seafood cafes.',
    distGalle: '19 km (25 mins)',
    distAirport: '142 km (1h 50m)',
    popularTrip: 'Hikkaduwa → Colombo Airport (CMB)',
    sedanLkr: 18500,
    vanLkr: 23000,
    features: ['Direct Highway Access', 'Turtle Sanctuary Stops', 'English-Speaking Drivers'],
    image: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp',
  },
  {
    id: 'bentota',
    name: 'Bentota Taxi',
    slug: 'bentota-taxi',
    badge: 'River Safari & 5-Star Resorts',
    tagline: 'Bentota River boat safaris, jet ski watersports, luxury beachfront resorts & Geoffrey Bawa gardens.',
    distGalle: '52 km (45 mins)',
    distAirport: '108 km (1h 30m)',
    popularTrip: 'Bentota → Colombo Airport (CMB)',
    sedanLkr: 16500,
    vanLkr: 21000,
    features: ['Fastest CMB Airport Time', 'River Safari Pickups', 'VIP Executive Fleet'],
    image: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
  },
  {
    id: 'weligama',
    name: 'Weligama Taxi',
    slug: 'weligama-taxi',
    badge: 'Beginner Surf & Marriott Bay',
    tagline: 'Gentle sand-break waves, bustling fish market, iconic stilt fishermen & boutique beach stays.',
    distGalle: '29 km (40 mins)',
    distAirport: '172 km (2h 20m)',
    popularTrip: 'Weligama → Colombo Airport (CMB)',
    sedanLkr: 23000,
    vanLkr: 27500,
    features: ['Surf Camp Shuttles', 'Marriott Resort Transfers', 'Board Storage Friendly'],
    image: '/assets/aistudio/Down_South_Season_Coastal_Adventures.webp',
  },
];

export const SouthernHubsSection: React.FC = () => {
  const { taxiHubs, formatFare, isFirebaseActive, isPublicDataLoaded } = useApp();

  const CORE_HUB_ORDER = [
    'ahangama-taxi',
    'mirissa-taxi',
    'unawatuna-taxi',
    'hikkaduwa-taxi',
    'bentota-taxi',
    'weligama-taxi',
  ];

  const liveHubList = Object.values(taxiHubs || {}).sort((a, b) => {
    const aIdx = CORE_HUB_ORDER.indexOf(a.id || a.slug);
    const bIdx = CORE_HUB_ORDER.indexOf(b.id || b.slug);
    if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
    if (aIdx !== -1) return -1;
    if (bIdx !== -1) return 1;
    return (a.townName || '').localeCompare(b.townName || '');
  });

  const isLoadingHubs = liveHubList.length === 0 && isFirebaseActive && !isPublicDataLoaded;

  // Dynamically derive display items from the live taxiHubs CMS state
  const hubsToDisplay = liveHubList.map((hub) => {
    const mainRoute = hub.popularRoutes?.[0];
    const defaultFeatures = [
      'Surfboard Racks Available',
      'Expressway (E01) Tolls Included',
      'Door-to-Door Villa & Hotel Pickup',
    ];

    const features =
      hub.attractions && hub.attractions.length > 0
        ? hub.attractions.slice(0, 3).map((a) => `${a.name} (${a.category})`)
        : defaultFeatures;

    const rawImg = hub.heroImage || '';
    const normalizedImg = rawImg.startsWith('/src/assets/images/')
      ? rawImg.replace('/src/assets/images/', '/assets/images/')
      : rawImg;

    const image =
      normalizedImg ||
      (hub.id === 'ahangama-taxi' || hub.id === 'ahangama' || hub.slug === 'ahangama-taxi'
        ? '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp'
        : '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp');

    return {
      id: hub.id,
      name: `${hub.townName} Taxi`,
      slug: hub.slug,
      badge: hub.badge,
      tagline: hub.tagline,
      distGalle: hub.distanceToGalle?.split('·')?.[0]?.trim() || hub.distanceToGalle,
      distAirport: hub.distanceToAirport?.split('·')?.[0]?.trim() || hub.distanceToAirport,
      popularTrip: mainRoute ? `${mainRoute.from} → ${mainRoute.to}` : `${hub.townName} → Colombo Airport (CMB)`,
      sedanLkr: mainRoute?.sedanLkr || 22000,
      vanLkr: mainRoute?.vanLkr || 26000,
      features,
      image,
    };
  });

  const resolvedHubs =
    hubsToDisplay.length > 0
      ? hubsToDisplay
      : !isFirebaseActive
      ? SOUTHERN_HUBS
      : [];

  return (
    <section className="py-14 sm:py-20 bg-[#0E0E11] border-b border-[#1F1F23]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-3 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Southern Coast Taxi Hubs
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Direct highway airport transfers, daily surf shuttles, and inter-beach taxi rides with verified English-speaking chauffeurs across Sri Lanka's top southern coastal towns.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All Expressway (E01) Tolls Included</span>
            </div>
          </div>
        </div>

        {/* 6 Town Hub Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {isLoadingHubs ? (
            Array.from({ length: 6 }).map((_, sIdx) => (
              <div
                key={`hub-skeleton-${sIdx}`}
                className="bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden animate-pulse p-4 space-y-3"
              >
                <div className="h-44 rounded-lg bg-[#1A1A1E]" />
                <div className="h-5 w-1/2 rounded bg-[#1F1F26]" />
                <div className="h-3 w-full rounded bg-[#1A1A1E]" />
                <div className="h-14 w-full rounded-lg bg-[#0B0B0D]" />
                <div className="h-9 w-full rounded-lg bg-[#1F1F26]" />
              </div>
            ))
          ) : (
            resolvedHubs.map((hub) => (
            <div
              key={hub.id}
              className="bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden shadow-xl hover:border-[#F5B91B]/60 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div>
                {/* Visual Header with Image & Badge */}
                <div className="relative h-44 sm:h-48 overflow-hidden bg-[#1A1A1E]">
                  <OptimizedImage
                    src={hub.image}
                    fallbackSrc="/assets/images/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp"
                    alt={`${hub.name} Sri Lanka`}
                    loading="lazy"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-[#141416]/25 to-transparent pointer-events-none" />
                  
                  {/* Badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2 py-0.5 rounded bg-[#0B0B0D]/90 backdrop-blur-md border border-[#F5B91B]/40 text-[#F5B91B] text-[10px] font-bold uppercase tracking-wider">
                      {hub.badge}
                    </span>
                  </div>

                  {/* Distance Pills */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-[10px] text-slate-200">
                    <div className="flex items-center gap-1 bg-[#0B0B0D]/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                      <MapPin className="w-2.5 h-2.5 text-[#F5B91B]" />
                      <span>{hub.distGalle}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#0B0B0D]/80 px-2 py-0.5 rounded backdrop-blur-sm border border-white/10">
                      <Navigation className="w-2.5 h-2.5 text-[#F5B91B]" />
                      <span>CMB: {hub.distAirport}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-4.5 space-y-3">
                  <div>
                    <h3 className="text-lg font-extrabold text-white font-['Outfit'] group-hover:text-[#F5B91B] transition-colors flex items-center justify-between">
                      <span>{hub.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#F5B91B] group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-[11.5px] text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {hub.tagline}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1 pt-0.5">
                    {hub.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[10.5px] text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#F5B91B] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Pricing Box */}
                  <div className="p-2.5 rounded-lg bg-[#0B0B0D] border border-[#27272A] space-y-1">
                    <div className="flex items-center justify-between text-[9.5px] text-slate-400 font-semibold uppercase tracking-wider">
                      <span>CMB Airport Transfer From</span>
                      <span className="text-emerald-400">All Tolls Incl.</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {formatFare(hub.sedanLkr)}{' '}
                        <span className="text-[9.5px] font-normal text-slate-400">/ Sedan</span>
                      </div>
                      <div className="text-[11px] sm:text-xs font-bold text-white font-mono">
                        {formatFare(hub.vanLkr)}{' '}
                        <span className="text-[8.5px] font-normal text-slate-400">/ Van</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 sm:p-4.5 pt-0 grid grid-cols-2 gap-2">
                <Link
                  to={`/${hub.slug}`}
                  className="py-2 px-2.5 rounded-lg bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-200 hover:text-white border border-[#27272A] text-xs font-bold text-center transition-colors flex items-center justify-center gap-1"
                >
                  <span>Hub Details</span>
                </Link>
                <Link
                  to={`/book?pickup=${encodeURIComponent(hub.name.replace(' Taxi', ' Beach'))}&serviceType=AIRPORT%20DROP`}
                  className="py-2 px-2.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold text-center transition-colors shadow-md flex items-center justify-center gap-1"
                >
                  <Car className="w-3 h-3 text-black" />
                  <span>Book Ride</span>
                </Link>
              </div>
            </div>
            ))
          )}
        </div>

      </div>
    </section>
  );
};
