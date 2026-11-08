import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  Shield,
  Clock,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Briefcase,
  ArrowRight,
  MessageSquare,
  CheckCircle2,
  Plane,
  Compass,
  Star,
  PlaneTakeoff,
  PlaneLanding,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Navigation,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { formatLKR, calculateAuthoritativeFare } from '../lib/fareEngine';
import { CurrencySelector } from '../components/CurrencySelector';
import { GoogleAddressAutocomplete } from '../components/GoogleAddressAutocomplete';
import { ToursSection } from '../components/ToursSection';
import { SeasonalBannerSection } from '../components/SeasonalBannerSection';
import { SouthernHubsSection } from '../components/SouthernHubsSection';
import { VehicleSelectionCarousel } from '../components/VehicleSelectionCarousel';
import { RouteDistanceResult } from '../lib/routeDistanceService';

export type ServiceTabType = 'AIRPORT DROP' | 'AIRPORT PICK UP' | 'TAXI RIDE' | 'TOURS';

export interface ServiceTabItem {
  id: ServiceTabType;
  label: string;
  badge: string;
  defaultPickup: string;
  defaultDestination: string;
  description: string;
}

export const SERVICE_TABS: ServiceTabItem[] = [
  {
    id: 'AIRPORT DROP',
    label: 'AIRPORT DROP',
    badge: 'Expressway Direct',
    defaultPickup: 'Galle Dutch Fort',
    defaultDestination: 'Bandaranaike International Airport (CMB)',
    description: 'Expressway Highway Transfer from Galle/South Coast directly to Colombo Airport Departure Terminal.',
  },
  {
    id: 'AIRPORT PICK UP',
    label: 'AIRPORT PICK UP',
    badge: 'Meet & Greet',
    defaultPickup: 'Bandaranaike International Airport (CMB)',
    defaultDestination: 'Galle Dutch Fort',
    description: 'Arrival Terminal Meet & Greet with Nameboard & Free Flight Delay Monitoring.',
  },
  {
    id: 'TAXI RIDE',
    label: 'TAXI RIDE',
    badge: 'City & Coast',
    defaultPickup: 'Galle Dutch Fort',
    defaultDestination: 'Mirissa Beach / Weligama',
    description: 'Point-to-point coastal, city, and inter-province private rides in luxury air-conditioned vehicles.',
  },
  {
    id: 'TOURS',
    label: 'TOURS',
    badge: 'Private Day Tour',
    defaultPickup: 'Galle, Unawatuna, or Ahangama',
    defaultDestination: 'Galle & South Coast Discovery (8–9 Hours)',
    description: 'Private 8–9 hour coastal tour: Galle Fort, Peace Pagoda, Unawatuna Beach & Koggala Stilt Fishermen.',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { siteSettings, services, vehicles, fareRules, currency, formatFare } = useApp();

  // Active Category Tab
  const [activeTab, setActiveTab] = useState<ServiceTabType>('AIRPORT DROP');
  const [routeInfo, setRouteInfo] = useState<RouteDistanceResult | null>(null);

  // Mobile Route Cards Slider State
  const mobileRouteSliderRef = useRef<HTMLDivElement>(null);
  const [activeRouteSlide, setActiveRouteSlide] = useState(0);

  const handleRouteScroll = () => {
    if (!mobileRouteSliderRef.current) return;
    const { scrollLeft, offsetWidth } = mobileRouteSliderRef.current;
    if (offsetWidth > 0) {
      const cardWidth = offsetWidth * 0.85;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveRouteSlide(Math.min(fareRules.fixedRoutes.length - 1, Math.max(0, index)));
    }
  };

  const scrollToRouteSlide = (index: number) => {
    if (!mobileRouteSliderRef.current) return;
    const container = mobileRouteSliderRef.current;
    const cards = container.children;
    if (cards && cards[index]) {
      (cards[index] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });
      setActiveRouteSlide(index);
    }
  };

  // Fleet Showcase Slider State & Auto-Slide (15% smaller cards)
  const fleetSliderRef = useRef<HTMLDivElement>(null);
  const [isFleetHovered, setIsFleetHovered] = useState(false);
  const [activeFleetIndex, setActiveFleetIndex] = useState(0);

  useEffect(() => {
    if (isFleetHovered) return;

    const interval = setInterval(() => {
      const container = fleetSliderRef.current;
      if (!container) return;

      const cardStep = 265; // ~245px card + 16px gap
      const maxScroll = container.scrollWidth - container.clientWidth;

      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
        setActiveFleetIndex(0);
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }, 3200);

    return () => clearInterval(interval);
  }, [isFleetHovered, vehicles.length]);

  const handleFleetScroll = () => {
    if (!fleetSliderRef.current) return;
    const { scrollLeft } = fleetSliderRef.current;
    const cardStep = 265;
    const idx = Math.round(scrollLeft / cardStep);
    setActiveFleetIndex(Math.min(vehicles.length - 1, Math.max(0, idx)));
  };

  const scrollFleet = (direction: 'prev' | 'next') => {
    if (!fleetSliderRef.current) return;
    const container = fleetSliderRef.current;
    const cardStep = 265;
    if (direction === 'prev') {
      container.scrollBy({ left: -cardStep, behavior: 'smooth' });
    } else {
      const maxScroll = container.scrollWidth - container.clientWidth;
      if (container.scrollLeft >= maxScroll - 20) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: cardStep, behavior: 'smooth' });
      }
    }
  };

  // Quick Quote Form State initialized for AIRPORT DROP
  const [quickPickup, setQuickPickup] = useState('Galle Dutch Fort');
  const [quickDestination, setQuickDestination] = useState('Bandaranaike International Airport (CMB)');
  const [quickVehicleId, setQuickVehicleId] = useState(vehicles[0]?.id || 'veh-sedan-std');
  const [quickDate, setQuickDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split('T')[0];
  });
  const [quickTime, setQuickTime] = useState('14:00');

  const handleTabChange = (tabId: ServiceTabType) => {
    setActiveTab(tabId);
    const tabConfig = SERVICE_TABS.find((t) => t.id === tabId);
    if (tabConfig) {
      setQuickPickup(tabConfig.defaultPickup);
      setQuickDestination(tabConfig.defaultDestination);
    }
  };

  // Authoritative calculation for quick quote
  const quickEstimate = calculateAuthoritativeFare({
    pickup: quickPickup,
    destination: quickDestination,
    vehicleCategoryId: quickVehicleId,
    pickupTime: quickTime,
    vehicles,
    fareRules,
  });

  const handleStartBooking = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/book?pickup=${encodeURIComponent(quickPickup)}&destination=${encodeURIComponent(
        quickDestination
      )}&vehicleId=${encodeURIComponent(quickVehicleId)}&date=${encodeURIComponent(quickDate)}&time=${encodeURIComponent(
        quickTime
      )}&serviceType=${encodeURIComponent(activeTab)}`
    );
  };

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-100">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-20 lg:pt-16 lg:pb-28 border-b border-[#1F1F23]">
        {/* Cinematic Sunset Beach Road Trip Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png"
            alt="Galle Taxi Sri Lanka Beach Road Trip"
            className="w-full h-full object-cover object-right md:object-center"
          />
          {/* Multi-layered dark gradient overlays for typography contrast */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/90 to-[#0B0B0D]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-[#0B0B0D]/70" />
        </div>

        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none z-[1]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl space-y-6">
            {/* Marquee Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-['Outfit']" style={{ textWrap: 'balance' }}>
              Your Journey, <span className="text-[#F5B91B]">Our Priority</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl font-light leading-relaxed">
              Safe, Comfortable & Reliable Taxi Services in Galle, Sri Lanka. From direct highway airport transfers to custom island tours with verified English-speaking chauffeurs.
            </p>

            {/* Prominent Southern Coast Taxi Hubs Quick-Access Strip */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5B91B] uppercase tracking-wider shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Southern Hubs:</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {[
                  { name: 'Ahangama', path: '/ahangama-taxi', tag: 'Surf & Villas' },
                  { name: 'Mirissa', path: '/mirissa-taxi', tag: 'Whales' },
                  { name: 'Unawatuna', path: '/unawatuna-taxi', tag: 'Beach' },
                  { name: 'Hikkaduwa', path: '/hikkaduwa-taxi', tag: 'Coral' },
                  { name: 'Bentota', path: '/bentota-taxi', tag: 'Resorts' },
                  { name: 'Weligama', path: '/weligama-taxi', tag: 'Bay' },
                ].map((hub) => (
                  <Link
                    key={hub.path}
                    to={hub.path}
                    className="px-2.5 py-1 rounded-lg bg-[#141416]/90 hover:bg-[#F5B91B] text-slate-200 hover:text-black border border-[#27272A] hover:border-[#F5B91B] text-xs font-semibold transition-all flex items-center gap-1.5 backdrop-blur-md group shadow-sm"
                  >
                    <span>{hub.name} Taxi</span>
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#27272A] text-[#F5B91B] group-hover:bg-black/20 group-hover:text-black">
                      {hub.tag}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* SERVICE TABS: AIRPORT DROP | AIRPORT PICK UP | TAXI RIDE | TOURS */}
          <div className="mt-8 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F5B91B]" />
                <span className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
                  Select Ride Category
                </span>
              </div>
              <div className="text-xs text-slate-300/80 font-mono">
                {SERVICE_TABS.find((t) => t.id === activeTab)?.badge} · Authoritative Upfront Pricing
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SERVICE_TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                const IconComponent =
                  tab.id === 'AIRPORT DROP'
                    ? PlaneTakeoff
                    : tab.id === 'AIRPORT PICK UP'
                    ? PlaneLanding
                    : tab.id === 'TAXI RIDE'
                    ? Car
                    : Compass;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border flex items-center gap-3 transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-[#F5B91B] text-black border-[#F5B91B] shadow-xl shadow-[#F5B91B]/20 scale-[1.02]'
                        : 'bg-[#141416]/80 backdrop-blur-md hover:bg-[#1A1A1E] text-slate-200 hover:text-white border-[#27272A]/80 hover:border-[#F5B91B]/40'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-black text-[#F5B91B]' : 'bg-[#1F1F24] text-[#F5B91B]'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-extrabold uppercase tracking-wide truncate font-['Outfit']">
                        {tab.label}
                      </div>
                      <div
                        className={`text-[10px] truncate ${
                          isSelected ? 'text-black/80 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {tab.badge}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. INSTANT FARE CALCULATOR & QUICK BOOKING BAR (Full Available Browser Viewport) */}
      <section className="relative z-20 w-full bg-[#111114] border-t border-b border-[#27272A] py-8 sm:py-12">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#27272A] mb-5">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-[#F5B91B]" />
              <h2 className="text-lg font-bold text-white font-['Outfit']">Instant Fare Calculator & Direct Booking</h2>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs text-slate-400 hidden lg:inline font-medium">Currency:</span>
              <CurrencySelector variant="segmented" className="w-full sm:w-auto" />
            </div>
          </div>

          {/* Quick Tab Selector Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-[#27272A]">
            <div className="flex flex-wrap items-center gap-2">
              {SERVICE_TABS.map((tab) => {
                const isSelected = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F5B91B] text-black shadow-md'
                        : 'bg-[#0B0B0D] hover:bg-[#1E1E22] text-slate-300 hover:text-white border border-[#27272A]'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
            <div className="text-xs text-[#F5B91B] font-mono hidden md:block">
              {SERVICE_TABS.find((t) => t.id === activeTab)?.description}
            </div>
          </div>

          {/* Route & Schedule Quick Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end mb-8 p-4 sm:p-5 rounded-2xl bg-[#0B0B0D] border border-[#27272A]">
            {/* Pickup */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Pickup Location</span>
                <span className="text-[#FFC400] text-[10px] font-mono">Door-to-door</span>
              </label>
              <GoogleAddressAutocomplete
                value={quickPickup}
                onChange={setQuickPickup}
                placeholder="e.g. Add your pickup location"
                required
                iconColor="text-[#FFC400]"
              />
            </div>

            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                <span>Destination</span>
                <button
                  type="button"
                  onClick={() => {
                    const temp = quickPickup;
                    setQuickPickup(quickDestination);
                    setQuickDestination(temp);
                  }}
                  className="text-[#F5B91B] hover:text-white text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer bg-[#1A1A20] px-2 py-0.5 rounded border border-[#2E2E36] hover:border-[#F5B91B]"
                  title="Swap Pickup and Destination"
                >
                  <ArrowUpDown className="w-2.5 h-2.5" />
                  <span>Swap</span>
                </button>
              </label>
              <GoogleAddressAutocomplete
                value={quickDestination}
                onChange={setQuickDestination}
                placeholder="e.g. Galle Fort, Airport, Mirissa"
                required
                iconColor="text-emerald-400"
              />
            </div>

            {/* Pickup Date & Time */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Date & Time (24h)
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="date"
                  value={quickDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setQuickDate(e.target.value)}
                  required
                  className="w-full px-2 py-2.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#FFC400]"
                />
                <input
                  type="time"
                  value={quickTime}
                  onChange={(e) => setQuickTime(e.target.value)}
                  required
                  className="w-full px-2 py-2.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            </div>

            {/* Route Status Tag */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Expressway & Rates
              </label>
              <div className="h-[42px] px-3.5 rounded-lg bg-[#141416] border border-[#27272A] flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {routeInfo?.distanceKm ? `${routeInfo.distanceKm} km · Tolls Included` : 'Tolls Included'}
                  </span>
                </span>
                <span className="font-mono text-[#FFC400] text-[11px] font-extrabold bg-[#FFC400]/10 px-2 py-0.5 rounded border border-[#FFC400]/30 shrink-0">
                  {routeInfo?.isFixedRoute ? 'Fixed Pricing' : routeInfo?.distanceKm ? 'Distance Rate' : 'Fixed Pricing'}
                </span>
              </div>
            </div>
          </div>

          {/* PREMIUM HORIZONTAL SLIDING VEHICLE SELECTION CAROUSEL */}
          <VehicleSelectionCarousel
            pickupLocation={quickPickup}
            destinationLocation={quickDestination}
            pickupDate={quickDate}
            pickupTime={quickTime}
            selectedVehicleId={quickVehicleId}
            onSelectVehicle={setQuickVehicleId}
            onRouteCalculated={setRouteInfo}
            onContinueBooking={() => {
              navigate(
                `/book?pickup=${encodeURIComponent(quickPickup)}&destination=${encodeURIComponent(
                  quickDestination
                )}&vehicleId=${encodeURIComponent(quickVehicleId)}&date=${encodeURIComponent(
                  quickDate
                )}&time=${encodeURIComponent(quickTime)}&serviceType=${encodeURIComponent(activeTab)}`
              );
            }}
            serviceType={activeTab}
          />
        </div>
      </section>

      {/* 3. SRI LANKA DOWN SOUTH SEASON CAMPAIGN BANNER */}
      <SeasonalBannerSection />

      {/* SOUTHERN COAST TAXI HUBS SECTION */}
      <div id="taxi-hubs">
        <SouthernHubsSection />
      </div>

      {/* 4. POPULAR SRI LANKA ROUTES & UPFRONT FIXED FARES */}
      <section className="py-12 sm:py-16 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-12 text-center max-w-2xl mx-auto px-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white font-['Outfit'] leading-tight">
            Popular Routes & Fixed Rates
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
            All long-distance and airport transfer rates include vehicle fuel, English-speaking chauffeur allowance, and Southern Expressway (E01) tolls.
          </p>
        </div>

        {/* Mobile Route Cards Horizontal Sliding Carousel (Screens < 768px) */}
        <div
          ref={mobileRouteSliderRef}
          onScroll={handleRouteScroll}
          className="flex md:hidden overflow-x-auto snap-x snap-mandatory gap-4 pb-3 pt-1 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {fareRules.fixedRoutes.map((route, idx) => {
            const suvPrice =
              route.suvPrice !== undefined && route.suvPrice > 0
                ? route.suvPrice
                : Math.round(route.sedanPrice * 1.35);
            const kdhFlatPrice = route.vanPrice;
            const kdhHighPrice =
              (route.luxuryPrice !== undefined && route.luxuryPrice > 0)
                ? route.luxuryPrice
                : (route.categoryPrices?.['KDH HIGH ROOF'] || route.categoryPrices?.['KDH High Roof'] || Math.round(route.vanPrice * 1.15));

            return (
              <div
                key={`mobile-route-${route.id}`}
                className="snap-center shrink-0 w-[85vw] max-w-[340px] bg-[#141416] border border-[#27272A] rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl hover:border-[#F5B91B]/40 transition-all flex flex-col justify-between select-none"
              >
                <div className="space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-white text-base font-['Outfit'] leading-snug">
                      {route.from} <span className="text-[#F5B91B]">⇄</span> {route.to}
                    </h3>
                    <span className="shrink-0 font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F5B91B]/15 text-[#F5B91B] border border-[#F5B91B]/30">
                      {route.estimatedDistanceKm} km
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{route.description}</p>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 text-[#F5B91B]">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{route.estimatedDuration}</span>
                    </div>
                    <span>·</span>
                    <span className="text-emerald-400 font-medium">Expressway Included</span>
                  </div>
                </div>

                {/* Pricing Grid per Vehicle Category */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1F1F23]">
                  {/* SEDAN CAR */}
                  <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider">SEDAN CAR (4 Pax)</span>
                      <div className="text-sm font-mono font-bold text-white">{formatFare(route.sedanPrice)}</div>
                    </div>
                  </div>
                  {/* SUV CAR */}
                  <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#27272A]">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">SUV CAR (4 Pax)</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{formatFare(suvPrice)}</div>
                  </div>
                  {/* KDH FLAT ROOF */}
                  <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#27272A]">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">KDH FLAT ROOF (8 Pax)</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{formatFare(kdhFlatPrice)}</div>
                  </div>
                  {/* KDH HIGH ROOF */}
                  <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">KDH HIGH ROOF (10 Pax)</span>
                      <span className="text-xs font-mono font-bold text-slate-200">{formatFare(kdhHighPrice)}</span>
                    </div>
                  </div>
                </div>

                {/* Direct Booking CTA */}
                <Link
                  to={`/book?pickup=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>Book This Route</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Mobile Slide Controls & Dots Indicator */}
        <div className="md:hidden flex items-center justify-between pt-2 px-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B91B] animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Swipe to slide</span>
            <span className="font-mono text-[10px] text-slate-500">
              ({activeRouteSlide + 1}/{fareRules.fixedRoutes.length})
            </span>
          </div>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5">
            {fareRules.fixedRoutes.map((_, dotIdx) => (
              <button
                key={`slide-dot-${dotIdx}`}
                type="button"
                onClick={() => scrollToRouteSlide(dotIdx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeRouteSlide === dotIdx ? 'w-5 bg-[#F5B91B]' : 'w-1.5 bg-[#27272A] hover:bg-slate-500'
                }`}
                aria-label={`Slide to route ${dotIdx + 1}`}
              />
            ))}
          </div>

          {/* Previous / Next Arrows */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => scrollToRouteSlide(activeRouteSlide - 1)}
              disabled={activeRouteSlide === 0}
              className="w-7 h-7 rounded-lg bg-[#141416] border border-[#27272A] flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Previous Route Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToRouteSlide(activeRouteSlide + 1)}
              disabled={activeRouteSlide === fareRules.fixedRoutes.length - 1}
              className="w-7 h-7 rounded-lg bg-[#141416] border border-[#27272A] flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
              aria-label="Next Route Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop View Table (Screens >= 768px) */}
        <div className="hidden md:block bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl mt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1A1E] text-xs uppercase tracking-wider text-slate-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-4 px-4 font-semibold">Route & Destination</th>
                  <th className="py-4 px-2 font-semibold">Est. Dist</th>
                  <th className="py-4 px-3 font-semibold text-right">SEDAN CAR</th>
                  <th className="py-4 px-3 font-semibold text-right">SUV CAR</th>
                  <th className="py-4 px-3 font-semibold text-right">KDH FLAT ROOF</th>
                  <th className="py-4 px-3 font-semibold text-right">KDH HIGH ROOF</th>
                  <th className="py-4 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {fareRules.fixedRoutes.map((route) => {
                  const suvPrice =
                    route.suvPrice !== undefined && route.suvPrice > 0
                      ? route.suvPrice
                      : Math.round(route.sedanPrice * 1.35);
                  const kdhFlatPrice = route.vanPrice;
                  const kdhHighPrice =
                    (route.luxuryPrice !== undefined && route.luxuryPrice > 0)
                      ? route.luxuryPrice
                      : (route.categoryPrices?.['KDH HIGH ROOF'] || route.categoryPrices?.['KDH High Roof'] || Math.round(route.vanPrice * 1.15));

                  return (
                    <tr key={route.id} className="hover:bg-[#1B1B1F] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">
                          {route.from} <span className="text-[#F5B91B]">⇄</span> {route.to}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{route.description}</div>
                      </td>
                      <td className="py-3.5 px-2 text-xs text-slate-300">
                        <span className="font-mono font-medium text-white">{route.estimatedDistanceKm} km</span>
                        <div className="text-slate-400 text-[10px]">{route.estimatedDuration}</div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-white">
                        {formatFare(route.sedanPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-slate-200">
                        {formatFare(suvPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-slate-200">
                        {formatFare(kdhFlatPrice)}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono text-xs font-bold text-slate-200">
                        {formatFare(kdhHighPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          to={`/book?pickup=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(
                            route.to
                          )}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-semibold transition-colors"
                        >
                          <span>Book</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. DISCOVER SRI LANKA – PRIVATE DAY TOURS FROM GALLE */}
      <ToursSection />

      {/* 5. PREMIUM FLEET SHOWCASE */}
      <section className="py-16 sm:py-20 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
            <div className="space-y-2">
              <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
                Meticulously Maintained Fleet
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                Choose Your Preferred Ride
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
                Every vehicle in our fleet is air-conditioned, commercially insured, and inspected before each departure.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/vehicles"
                className="text-xs text-[#F5B91B] hover:underline flex items-center gap-1.5 font-semibold"
              >
                <span>Explore All Vehicles</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {/* Slider Arrows */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollFleet('prev')}
                  className="w-8 h-8 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#F5B91B] hover:text-black hover:border-[#F5B91B] text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Previous vehicles"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollFleet('next')}
                  className="w-8 h-8 rounded-lg border border-[#27272A] bg-[#141416] hover:bg-[#F5B91B] hover:text-black hover:border-[#F5B91B] text-slate-300 flex items-center justify-center transition-colors"
                  aria-label="Next vehicles"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Auto-sliding Carousel Container (Cards 15% smaller) */}
          <div
            ref={fleetSliderRef}
            onScroll={handleFleetScroll}
            onMouseEnter={() => setIsFleetHovered(true)}
            onMouseLeave={() => setIsFleetHovered(false)}
            onTouchStart={() => setIsFleetHovered(true)}
            onTouchEnd={() => setTimeout(() => setIsFleetHovered(false), 2500)}
            className="flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {vehicles.map((veh) => (
              <div
                key={veh.id}
                className="w-[240px] sm:w-[250px] flex-shrink-0 snap-start bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden flex flex-col justify-between hover:border-[#F5B91B]/50 hover:shadow-lg hover:shadow-black/50 transition-all duration-300"
              >
                <div>
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#1A1A1E] flex items-center justify-center p-3 rounded-t-xl border-b border-[#27272A]">
                    <img
                      src={veh.imageUrl}
                      alt={veh.name}
                      className="w-full h-full object-contain rounded-lg transition-transform duration-500 hover:scale-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (
                          !target.src.startsWith('data:') &&
                          !target.src.startsWith('blob:') &&
                          !target.src.includes('regenerated_image') &&
                          !target.src.includes('vehicle_')
                        ) {
                          target.src = '/src/assets/images/regenerated_image_1793163512211.png';
                        }
                      }}
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-semibold text-[#F5B91B] border border-[#27272A]">
                      {veh.category}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-bold text-white font-['Outfit'] leading-tight truncate">
                      {veh.name}
                    </h3>
                    
                    {/* Capacities */}
                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#F5B91B]" />
                        <span>Up to {veh.passengers} Pax</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-[#F5B91B]" />
                        <span>{veh.luggage} Bags</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {veh.description}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <Link
                    to={`/book?vehicleId=${encodeURIComponent(veh.id)}`}
                    className="w-full py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-bold text-xs transition-colors text-center block"
                  >
                    Select {veh.name.split(' ')[0]}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-1.5 mt-5">
            {vehicles.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  if (fleetSliderRef.current) {
                    fleetSliderRef.current.scrollTo({ left: i * 265, behavior: 'smooth' });
                    setActiveFleetIndex(i);
                  }
                }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeFleetIndex === i ? 'w-6 bg-[#F5B91B]' : 'w-1.5 bg-[#27272A] hover:bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. WHY CHOOSE GALLE TAXI */}
      <section className="py-12 sm:py-16 bg-[#0E0E10] border-t border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Punctual & Reliable</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We monitor incoming flights into Colombo (CMB) in real time. Your driver waits at arrival with a clear nameboard even if your flight is delayed.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Vetted Chauffeurs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Licensed tourism-board trained drivers with spotless safety records, fluent English, and deep knowledge of Sri Lanka’s secret coastal gems.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Modern Luxury Fleet</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                High-spec air-conditioned Toyota sedans, high-roof VIP KDH commuter vans, and Mercedes luxury cars cleaned and sanitized before every ride.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white font-['Outfit']">Zero Hidden Charges</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Upfront quotes in Sri Lankan Rupees (LKR) with highway tolls, fuel, parking, and driver meal allowances already included. What you see is what you pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CORE SERVICES & DEDICATED TRANSFER CHANNELS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="space-y-4 text-center max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Tailored Southern Transportation
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Our Premium Taxi & Transfer Services
          </h2>
          <p className="text-slate-400 text-sm">
            Whether arriving at midnight on an international flight or embarking on a scenic safari excursion, our vehicles and chauffeurs deliver seamless reliability.
          </p>
        </div>

        {/* 3 Dedicated Service Pillars */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F1F23] pb-3">
            <h3 className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Specialized Transfer Channels
            </h3>
            <span className="text-xs text-slate-400">Direct dedicated bookings</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Airport Drop */}
            <div className="bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/50 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 border border-[#F5B91B]/20 flex items-center justify-center text-[#F5B91B] group-hover:scale-105 transition-transform">
                  <PlaneTakeoff className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Expressway Direct
                  </span>
                  <h4 className="text-xl font-bold text-white font-['Outfit']">
                    Airport Drop Service
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Direct door-to-door departure transfer from Galle & southern villas to Colombo Airport (CMB) with prepaid E01 highway toll clearance.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#27272A] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>1h 45m – 2h 15m Southern Expressway</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>All Highway Tolls & Fuel Included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>24/7 Hotel Lobby Departure</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  to="/airport-drop"
                  className="w-full py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Explore Airport Drop Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/book?serviceType=AIRPORT+DROP&pickup=Galle+Dutch+Fort&destination=Bandaranaike+International+Airport+(CMB)"
                  className="w-full py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-300 hover:text-white border border-[#27272A] font-semibold text-xs text-center block transition-colors"
                >
                  Instant Drop Booking
                </Link>
              </div>
            </div>

            {/* 2. Airport Pick Up */}
            <div className="bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/50 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 border border-[#F5B91B]/20 flex items-center justify-center text-[#F5B91B] group-hover:scale-105 transition-transform">
                  <PlaneLanding className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    VIP Meet & Greet
                  </span>
                  <h4 className="text-xl font-bold text-white font-['Outfit']">
                    Airport Pick Up Service
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Chauffeur welcomes you inside Colombo Airport arrival terminal with a personalized nameboard and monitors live flight delays with zero penalty.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#27272A] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Live Flight Delay Radar Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Lobby Nameboard Welcome</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>ATM & Tourist SIM Assistance</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  to="/airport-pickup"
                  className="w-full py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Explore Airport Pick Up Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/book?serviceType=AIRPORT+PICK+UP&pickup=Bandaranaike+International+Airport+(CMB)&destination=Galle+Dutch+Fort"
                  className="w-full py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-300 hover:text-white border border-[#27272A] font-semibold text-xs text-center block transition-colors"
                >
                  Instant Pickup Booking
                </Link>
              </div>
            </div>

            {/* 3. General Taxi */}
            <div className="bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/50 rounded-2xl p-6 flex flex-col justify-between transition-all group shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F5B91B]/10 border border-[#F5B91B]/20 flex items-center justify-center text-[#F5B91B] group-hover:scale-105 transition-transform">
                  <Navigation className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    24/7 Coastal Rides
                  </span>
                  <h4 className="text-xl font-bold text-white font-['Outfit']">
                    General Taxi & Rides
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    On-demand private taxi rides connecting Galle Fort, Unawatuna, Thalpe, Ahangama, Midigama, Weligama, and Mirissa with zero surge pricing.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#27272A] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>10–20 Minute Rapid Response</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Fixed Per-KM Transparent Pricing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Point-to-Point or Hourly Hire</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 space-y-2">
                <Link
                  to="/general-taxi"
                  className="w-full py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  <span>Explore General Taxi Page</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/book?serviceType=TAXI+RIDE&pickup=Galle+Dutch+Fort&destination=Mirissa+Beach+/+Weligama"
                  className="w-full py-2 rounded-xl bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-300 hover:text-white border border-[#27272A] font-semibold text-xs text-center block transition-colors"
                >
                  Instant Taxi Ride Booking
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* General Services Header */}
        <div className="pt-4 border-t border-[#1F1F23]">
          <div className="space-y-1 mb-8">
            <span className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Complete Southern Fleet
            </span>
            <h3 className="text-2xl font-bold text-white font-['Outfit']">
              All Available Chauffeur Packages
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/40 rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col"
            >
              {/* Service Visual */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#1B1B1F]">
                <img
                  src={srv.imageUrl}
                  alt={srv.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-3 right-3 px-3 py-1 bg-[#0B0B0D]/90 backdrop-blur-md rounded text-xs font-mono text-[#F5B91B] border border-[#27272A]">
                  From {formatFare(srv.startingFromLkr)}
                </div>
              </div>

              {/* Service Content */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-[#F5B91B] transition-colors font-['Outfit']">
                    {srv.title}
                  </h3>
                  <p className="text-xs text-[#A1A1AA] font-medium mt-0.5">{srv.subtitle}</p>
                  <p className="text-slate-400 text-xs mt-3 leading-relaxed">{srv.description}</p>
                </div>

                {/* Features List */}
                <div className="pt-2 border-t border-[#1F1F23] space-y-2">
                  {srv.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={`/book?service=${encodeURIComponent(srv.id)}`}
                  className="w-full mt-2 py-2.5 rounded-lg bg-[#1F1F23] hover:bg-[#F5B91B] hover:text-black text-slate-200 font-semibold text-xs transition-all text-center flex items-center justify-center gap-2"
                >
                  <span>Book {srv.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. GUEST REVIEWS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-14">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Traveler Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Trusted by International & Local Travelers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-[#F5B91B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F5B91B]" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "We booked our airport transfer from Colombo to Galle Fort with Galle Taxi. Dinesh our driver was waiting right outside customs with a sign. Smooth 2-hour ride on the highway in a spotless air-conditioned sedan. 10/10 service!"
            </p>
            <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between text-xs">
              <span className="font-bold text-white">Oliver & Sophie Bennett</span>
              <span className="text-slate-500">London, UK</span>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-[#F5B91B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F5B91B]" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Traveling as a family of 6 with 8 bags and surfboards, we needed a reliable large van. The Toyota KDH VIP was immense and comfortable. Driver Lasantha drove so safely on the mountain roads to Ella. Highly recommended!"
            </p>
            <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between text-xs">
              <span className="font-bold text-white">Lars Lindqvist</span>
              <span className="text-slate-500">Stockholm, Sweden</span>
            </div>
          </div>

          <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-1 text-[#F5B91B]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#F5B91B]" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "Fastest booking response in Sri Lanka. I messaged them on WhatsApp for an urgent sunrise transfer from Unawatuna to Mirissa for whale watching. The car arrived 10 minutes early. Fair and honest pricing."
            </p>
            <div className="pt-3 border-t border-[#1F1F23] flex items-center justify-between text-xs">
              <span className="font-bold text-white">Praveen Senanayake</span>
              <span className="text-slate-500">Colombo, Sri Lanka</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA STRIP */}
      <section className="py-20 bg-gradient-to-b from-[#141416] to-[#0B0B0D] border-t border-[#27272A]">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Ready to Travel in Comfort Across Sri Lanka?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Book online in under 2 minutes or contact our 24/7 dispatch desk on WhatsApp for immediate vehicle confirmation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/book"
              className="px-8 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm tracking-wide shadow-lg shadow-[#F5B91B]/20 transition-all hover:scale-105"
            >
              Book a Taxi Online
            </Link>
            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                'Hello Galle Taxi, I would like to reserve a ride.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-7 py-3.5 rounded-xl bg-[#171719] hover:bg-[#202024] text-white border border-[#27272A] font-semibold text-sm transition-all flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Dispatch (+94 77 123 4567)</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
