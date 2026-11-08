/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Users,
  Briefcase,
  ShoppingBag,
  Wind,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Car,
  Loader2,
  AlertCircle,
  Route,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { Vehicle } from '../types';
import { calculateAuthoritativeFare, formatLKR } from '../lib/fareEngine';
import { calculateRouteDistance, RouteDistanceResult } from '../lib/routeDistanceService';

interface VehicleSelectionCarouselProps {
  pickupLocation: string;
  destinationLocation: string;
  pickupDate: string;
  pickupTime: string;
  selectedVehicleId: string;
  onSelectVehicle: (vehicleId: string) => void;
  onContinueBooking: () => void;
  serviceType?: string;
  className?: string;
  onRouteCalculated?: (route: RouteDistanceResult) => void;
}

interface DisplayVehicleItem {
  id: string;
  name: string;
  modelSubtitle: string;
  classLabel: string;
  category: Vehicle['category'];
  passengers: number;
  largeLuggage: number;
  handLuggage: number;
  acLabel: string;
  imageUrl: string;
  description: string;
  plateNumber: string;
  rawVehicle: Vehicle;
}

export const VehicleSelectionCarousel: React.FC<VehicleSelectionCarouselProps> = ({
  pickupLocation,
  destinationLocation,
  pickupDate,
  pickupTime,
  selectedVehicleId,
  onSelectVehicle,
  onContinueBooking,
  serviceType = 'AIRPORT DROP',
  className = '',
  onRouteCalculated,
}) => {
  const { vehicles, fareRules, currencies, currency, formatFare } = useApp();

  const sliderRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // Dynamic Route Distance & Live Fare Calculation State
  const [routeResult, setRouteResult] = useState<RouteDistanceResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  // Trigger dynamic driving route calculation whenever pickup or destination changes
  useEffect(() => {
    const p = pickupLocation?.trim();
    const d = destinationLocation?.trim();

    if (!p || p.length < 3 || !d || d.length < 3) {
      setRouteResult(null);
      setIsCalculatingRoute(false);
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    const debounceTimer = setTimeout(async () => {
      try {
        const res = await calculateRouteDistance(p, d, fareRules);
        if (isMounted) {
          setRouteResult(res);
          setIsCalculatingRoute(false);
          if (onRouteCalculated) {
            onRouteCalculated(res);
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsCalculatingRoute(false);
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [pickupLocation, destinationLocation, fareRules, onRouteCalculated]);

  // Mouse drag-to-scroll state for desktop
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeftState, setScrollLeftState] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // The 6 requested vehicle configurations with fallback images & metadata
  const CAROUSEL_SPECS = [
    {
      id: 'veh-mini-car',
      preferredName: 'BUDGET MINI CAR',
      modelSubtitle: 'Suzuki Alto / Wagon R',
      classLabel: 'Economy Class',
      passengers: 3,
      largeLuggage: 2,
      handLuggage: 1,
      acLabel: 'Fully Air-Conditioned',
      fallbackImage: '/src/assets/images/regenerated_image_1793161723258.png',
      category: 'Mini Car' as const,
    },
    {
      id: 'veh-sedan-std',
      preferredName: 'SEDAN CAR',
      modelSubtitle: 'Toyota Premio / Allion / Axio',
      classLabel: 'Executive Business Class',
      passengers: 4,
      largeLuggage: 3,
      handLuggage: 2,
      acLabel: 'Dual-Zone Climate Control',
      fallbackImage: '/src/assets/images/regenerated_image_1793163512211.png',
      category: 'SEDAN CAR' as const,
    },
    {
      id: 'veh-shuttle',
      preferredName: 'SHUTTLE',
      modelSubtitle: 'Toyota HiAce Minibus Shuttle',
      classLabel: 'Group Shuttle Class',
      passengers: 7,
      largeLuggage: 5,
      handLuggage: 4,
      acLabel: 'Dual Air-Conditioned',
      fallbackImage: '/src/assets/images/regenerated_image_1793465213680.png',
      category: 'Mini Van' as const,
    },
    {
      id: 'veh-suv-4wd',
      preferredName: 'SUV CAR',
      modelSubtitle: 'Toyota Prado / Fortuner 4x4',
      classLabel: 'Luxury All-Wheel SUV',
      passengers: 5,
      largeLuggage: 4,
      handLuggage: 3,
      acLabel: 'Tri-Zone Climate Control',
      fallbackImage: '/src/assets/images/regenerated_image_1793464744920.png',
      category: 'SUV CAR' as const,
    },
    {
      id: 'veh-kdh-flat',
      preferredName: 'KDH FLAT ROOF',
      modelSubtitle: 'Toyota KDH Flat Roof 200',
      classLabel: 'VIP Touring Van',
      passengers: 8,
      largeLuggage: 6,
      handLuggage: 5,
      acLabel: 'Dual High-Capacity A/C',
      fallbackImage: '/src/assets/images/vehicle_premium_van_1793121943671.jpg',
      category: 'KDH FLAT ROOF' as const,
    },
    {
      id: 'veh-kdh-high',
      preferredName: 'KDH HIGH ROOF',
      modelSubtitle: 'Toyota KDH High-Roof Commuter GL',
      classLabel: 'Executive High-Roof VIP',
      passengers: 10,
      largeLuggage: 8,
      handLuggage: 6,
      acLabel: 'Rear Climate Control A/C',
      fallbackImage: '/src/assets/images/vehicle_luxury_sedan_1793121944773.jpg',
      category: 'KDH HIGH ROOF' as const,
    },
  ];

  // Derive active vehicles dynamically from Admin / Store
  const carouselVehicles: DisplayVehicleItem[] = useMemo(() => {
    // If we have vehicles in store, filter active and visible ones
    const activeVehicles = vehicles.filter((v) => v.isAvailable !== false && !v.hideCard);
    const sourceVehicles = activeVehicles.length > 0 ? activeVehicles : vehicles;

    // If still empty (e.g. initial boot before store hydration), fallback to CAROUSEL_SPECS
    if (!sourceVehicles || sourceVehicles.length === 0) {
      return CAROUSEL_SPECS.map((spec) => ({
        id: spec.id,
        name: spec.preferredName,
        modelSubtitle: spec.modelSubtitle,
        classLabel: spec.classLabel,
        category: spec.category,
        passengers: spec.passengers,
        largeLuggage: spec.largeLuggage,
        handLuggage: spec.handLuggage,
        acLabel: spec.acLabel,
        imageUrl: spec.fallbackImage,
        description: `${spec.preferredName} with professional English-speaking chauffeur.`,
        plateNumber: 'SP CAR-2026',
        rawVehicle: {
          id: spec.id,
          name: spec.preferredName,
          category: spec.category,
          plateNumber: 'SP CAR-2026',
          passengers: spec.passengers,
          luggage: spec.largeLuggage,
          handLuggage: spec.handLuggage,
          description: `${spec.preferredName} with professional English-speaking chauffeur.`,
          pricePerKm:
            (spec.category as string) === 'Mini Car'
              ? 190
              : (spec.category as string) === 'SEDAN CAR' || (spec.category as string) === 'Sedan'
              ? 240
              : (spec.category as string) === 'SUV CAR' || (spec.category as string) === 'SUV'
              ? 380
              : (spec.category as string) === 'KDH HIGH ROOF'
              ? 360
              : 320,
          baseFare: 1500,
          imageUrl: spec.fallbackImage,
          isAvailable: true,
          features: [spec.acLabel, 'Tolls Included', 'Chauffeur Allowance', 'Luggage Space'],
        },
      }));
    }

    // Sort by displayOrder if defined, preserving order
    const sorted = [...sourceVehicles].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

    return sorted.map((v) => {
      const matchedSpec = CAROUSEL_SPECS.find((s) => s.id === v.id || (s.category as string) === (v.category as string));

      const categoryTiers =
        (fareRules.categoryPricingTiers && fareRules.categoryPricingTiers[v.category]) ||
        v.pricingTiers;

      const dynamicPricePerKm =
        v.pricePerKm ||
        (categoryTiers && categoryTiers.find((t) => t.ratePerKm > 0)?.ratePerKm) ||
        ((v.category as string) === 'Mini Car'
          ? 190
          : (v.category as string) === 'SEDAN CAR' || (v.category as string) === 'Sedan'
          ? 240
          : (v.category as string) === 'SUV CAR' || (v.category as string) === 'SUV'
          ? 380
          : (v.category as string) === 'KDH HIGH ROOF'
          ? 360
          : 320);
      const dynamicBaseFare = v.baseFare || fareRules.baseFare || 1500;

      const rawVehicle: Vehicle = {
        ...v,
        id: v.id,
        name: v.name, // Real, edited name from Admin!
        category: v.category, // Real, edited category from Admin!
        plateNumber: v.plateNumber || 'SP CAR-2026',
        passengers: v.passengers ?? (matchedSpec?.passengers || 4),
        luggage: v.luggage ?? (matchedSpec?.largeLuggage || 3),
        handLuggage: v.handLuggage ?? (matchedSpec?.handLuggage || 2),
        description: v.description || `${v.name} with professional English-speaking chauffeur.`,
        pricePerKm: dynamicPricePerKm,
        baseFare: dynamicBaseFare,
        pricingTiers: categoryTiers,
        imageUrl: v.imageUrl || matchedSpec?.fallbackImage || '/src/assets/images/regenerated_image_1793163512211.png',
        isAvailable: v.isAvailable !== false,
        features:
          v.features && v.features.length > 0
            ? v.features
            : [matchedSpec?.acLabel || 'Fully Air-Conditioned', 'Tolls Included', 'Chauffeur Allowance', 'Luggage Space'],
      };

      const acLabel =
        (v.features &&
          v.features.find(
            (f) =>
              f.toLowerCase().includes('air') ||
              f.toLowerCase().includes('climate') ||
              f.toLowerCase().includes('a/c')
          )) ||
        matchedSpec?.acLabel ||
        'Fully Air-Conditioned';

      return {
        id: v.id,
        name: v.name,
        modelSubtitle: v.modelSubtitle || matchedSpec?.modelSubtitle || '',
        classLabel: v.classLabel || matchedSpec?.classLabel || `${v.category} Class`,
        category: v.category,
        passengers: rawVehicle.passengers,
        largeLuggage: rawVehicle.luggage,
        handLuggage: rawVehicle.handLuggage || 2,
        acLabel,
        imageUrl: rawVehicle.imageUrl,
        description: rawVehicle.description,
        plateNumber: rawVehicle.plateNumber,
        rawVehicle,
      };
    });
  }, [vehicles, fareRules]);

  // Check scroll position for arrow buttons & active dot
  const updateScrollState = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const cardWidth = 280;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveSlideIndex(Math.min(carouselVehicles.length - 1, Math.max(0, index)));
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return;
    updateScrollState();
    slider.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      slider.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [carouselVehicles.length]);

  // Ensure a valid vehicle is selected when vehicle list changes or updates
  useEffect(() => {
    if (carouselVehicles.length === 0) return;
    const exists = carouselVehicles.some((c) => c.id === selectedVehicleId);
    if (!exists) {
      const defaultVeh = carouselVehicles.find((c) => c.rawVehicle.isDefaultSelected) || carouselVehicles[0];
      if (defaultVeh) {
        onSelectVehicle(defaultVeh.id);
      }
    }
  }, [carouselVehicles, selectedVehicleId, onSelectVehicle]);

  // Listen for real-time live vehicle & fare rules update events across tabs & components
  const [, setTick] = useState(0);
  useEffect(() => {
    const handleVehicleSync = () => {
      setTick((t) => t + 1);
    };
    window.addEventListener('galle_taxi_vehicle_updated', handleVehicleSync);
    window.addEventListener('galle_taxi_fare_rules_updated', handleVehicleSync);
    window.addEventListener('storage', handleVehicleSync);
    return () => {
      window.removeEventListener('galle_taxi_vehicle_updated', handleVehicleSync);
      window.removeEventListener('galle_taxi_fare_rules_updated', handleVehicleSync);
      window.removeEventListener('storage', handleVehicleSync);
    };
  }, []);

  // Scroll controls
  const handleScrollBy = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    const scrollAmount = 280;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const scrollToSlide = (index: number) => {
    if (!sliderRef.current) return;
    const cardWidth = 280;
    sliderRef.current.scrollTo({
      left: index * cardWidth,
      behavior: 'smooth',
    });
    setActiveSlideIndex(index);
  };

  // Mouse Drag Support on Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsMouseDown(true);
    setIsDragging(false);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeftState(sliderRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.3;
    if (Math.abs(walk) > 5) {
      setIsDragging(true);
    }
    sliderRef.current.scrollLeft = scrollLeftState - walk;
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
    setTimeout(() => setIsDragging(false), 50);
  };

  const handleMouseLeave = () => {
    setIsMouseDown(false);
    setIsDragging(false);
  };

  // Authoritative Calculation for Any Vehicle based on real route distance
  const getVehicleFareResult = (rawVeh: Vehicle) => {
    const effectiveKm = routeResult?.distanceKm && routeResult.distanceKm > 0 ? routeResult.distanceKm : undefined;
    return calculateAuthoritativeFare({
      pickup: pickupLocation || 'Galle Dutch Fort',
      destination: destinationLocation || 'Bandaranaike International Airport (CMB)',
      vehicleCategoryId: rawVeh.id,
      pickupTime: pickupTime || '12:00',
      vehicles: carouselVehicles.map((c) => c.rawVehicle),
      fareRules,
      customDistanceKm: effectiveKm,
    });
  };

  // Multi-Currency Converter from LKR amount using configured rates
  const getMultiCurrencyEstimates = (amountLkr: number) => {
    const usdRate = currencies['USD']?.rateToLkr || 305;
    const eurRate = currencies['EUR']?.rateToLkr || 330;
    const inrRate = currencies['INR']?.rateToLkr || 3.65;

    return {
      lkr: `Rs. ${amountLkr.toLocaleString('en-US')}`,
      usd: `$${Math.round(amountLkr / usdRate).toLocaleString('en-US')}`,
      eur: `€${Math.round(amountLkr / eurRate).toLocaleString('en-US')}`,
      inr: `₹${Math.round(amountLkr / inrRate).toLocaleString('en-US')}`,
    };
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* SECTION HEADER & CONTROLS */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-[#27272A]/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFC400]">
            <Car className="w-4 h-4" />
            <span>Select Your Private Vehicle</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit'] mt-1">
            Choose Your Travel Comfort
          </h3>
        </div>

        {/* Carousel Navigation Buttons - Hidden on mobile & desktop grid (shown on tablet if scrolling) */}
        <div className="hidden sm:flex lg:hidden items-center gap-2 self-end sm:self-auto">
          <span className="text-[11px] font-mono text-slate-400 mr-2 hidden sm:inline">
            Slide or Drag Vehicles
          </span>
          <button
            type="button"
            onClick={() => handleScrollBy('left')}
            disabled={!canScrollLeft}
            aria-label="Previous vehicles"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              canScrollLeft
                ? 'bg-[#1A1A1E] text-white hover:bg-[#FFC400] hover:text-black hover:border-[#FFC400] border-[#27272A]'
                : 'bg-[#121214] text-slate-600 border-[#1F1F23] cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScrollBy('right')}
            disabled={!canScrollRight}
            aria-label="Next vehicles"
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
              canScrollRight
                ? 'bg-[#1A1A1E] text-white hover:bg-[#FFC400] hover:text-black hover:border-[#FFC400] border-[#27272A]'
                : 'bg-[#121214] text-slate-600 border-[#1F1F23] cursor-not-allowed opacity-40'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* FULL AVAILABLE BROWSER VIEWPORT VEHICLES DISPLAY */}
      <div className="relative w-full">
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          className={`w-full flex lg:grid lg:grid-cols-6 gap-3.5 overflow-x-auto lg:overflow-visible pb-4 pt-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
            isMouseDown ? 'cursor-grabbing select-none' : 'cursor-grab'
          }`}
          style={{
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {carouselVehicles.map((veh, idx) => {
            const isSelected = veh.id === selectedVehicleId;
            const fareResult = getVehicleFareResult(veh.rawVehicle);
            const multiRates = getMultiCurrencyEstimates(fareResult.fare);

            const isSedanCar = veh.id === 'veh-sedan-std' || veh.name.toUpperCase().includes('SEDAN') || veh.category === 'SEDAN CAR' || veh.category === 'Sedan';

            return (
              <div
                key={veh.id}
                onClick={() => {
                  if (!isDragging) {
                    onSelectVehicle(veh.id);
                  }
                }}
                className={`snap-start shrink-0 w-[82vw] sm:w-[260px] lg:w-full rounded-xl p-3.5 flex flex-col justify-between transition-all duration-300 relative select-none cursor-pointer ${
                  isSelected
                    ? 'bg-[#18181E] border border-white/30 shadow-[0_12px_32px_rgba(0,0,0,0.7)] scale-[1.01]'
                    : 'bg-[#141417] hover:bg-[#1A1A20] border border-[#27272A] hover:border-white/20 shadow-[0_8px_24px_rgba(0,0,0,0.5)]'
                }`}
              >
                {/* Selected Top Tag */}
                {isSelected && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-[#FFC400] text-black font-extrabold text-[10px] uppercase tracking-wider rounded-full shadow-lg flex items-center gap-1 z-10 font-mono whitespace-nowrap">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Selected Vehicle</span>
                  </div>
                )}

                <div className="space-y-3">
                  {/* Vehicle Image Container */}
                  <div className="relative h-[105px] w-full rounded-xl overflow-hidden bg-[#1A1A1E] flex items-center justify-center p-2 border border-[#27272A]">
                    <img
                      src={veh.imageUrl}
                      alt={veh.name}
                      className="w-full h-full object-contain rounded-lg transition-transform duration-300 hover:scale-105 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]"
                      onError={(e) => {
                        const target = e.currentTarget;
                        // Never override data URLs, blob URLs, or custom uploads
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
                    <div className="absolute top-2 right-2">
                      <span className="text-[9px] font-bold text-emerald-300 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/40 shadow-sm">
                        <Wind className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                        <span>A/C</span>
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Title & Subtitle */}
                  <div>
                    <h4 className="text-sm sm:text-base font-extrabold text-white font-['Outfit'] uppercase tracking-tight truncate" title={veh.name}>
                      {veh.name}
                    </h4>
                    <div className="text-[11px] font-mono text-[#FFC400] truncate mt-0.5 font-bold">
                      {veh.classLabel}
                    </div>
                  </div>

                  {/* Price Row with Live Distance Badge */}
                  <div className="flex items-baseline justify-between pt-2 border-t border-[#27272A]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-slate-300 truncate">
                        {isCalculatingRoute
                          ? 'Calculating...'
                          : !routeResult?.isValid
                          ? 'Route Fare'
                          : fareResult.isFixedRoute
                          ? 'Fixed Fare'
                          : 'Estimated Fare'}
                      </span>
                      {routeResult?.isValid && !fareResult.isFixedRoute && routeResult.distanceKm > 0 && (
                        <span className="shrink-0 text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/30">
                          {routeResult.distanceKm} KM
                        </span>
                      )}
                    </div>
                    <span className="text-base sm:text-lg font-black text-white font-mono tracking-tight shrink-0">
                      {isCalculatingRoute ? (
                        <span className="text-xs text-[#FFC400] flex items-center gap-1">
                          <Loader2 className="w-3.5 h-3.5 animate-spin inline" />
                          <span>...</span>
                        </span>
                      ) : !routeResult?.isValid ? (
                        <span className="text-xs text-slate-400 font-normal">Enter route</span>
                      ) : (
                        formatFare(fareResult.fare)
                      )}
                    </span>
                  </div>

                  {/* Currency Estimates Grid - Clearly Readable */}
                  <div className="bg-[#0C0C0E] border border-[#27272A] rounded-xl px-2.5 py-2 text-[10px] font-mono shadow-inner">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 font-semibold text-[9.5px]">USD</span>
                        <span className="font-bold text-white text-[10.5px]">
                          {isCalculatingRoute ? '...' : !routeResult?.isValid ? '—' : multiRates.usd}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 font-semibold text-[9.5px]">EUR</span>
                        <span className="font-bold text-white text-[10.5px]">
                          {isCalculatingRoute ? '...' : !routeResult?.isValid ? '—' : multiRates.eur}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 font-semibold text-[9.5px]">INR</span>
                        <span className="font-bold text-white text-[10.5px]">
                          {isCalculatingRoute ? '...' : !routeResult?.isValid ? '—' : multiRates.inr}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span className="text-slate-400 font-semibold text-[9.5px]">LKR</span>
                        <span className="font-bold text-white text-[10px] truncate max-w-[65px]">
                          {isCalculatingRoute ? '...' : !routeResult?.isValid ? '—' : multiRates.lkr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Clear Capacities (Pax, Large Bag, Hand Bag) */}
                  <div className="flex items-center justify-around py-2 rounded-xl bg-[#0C0C0E] border border-[#27272A] text-[11px] font-medium">
                    <div className="flex items-center gap-1.5" title="Passengers">
                      <Users className="w-3.5 h-3.5 text-[#FFC400]" />
                      <span className="font-bold text-white text-xs">{veh.passengers}</span>
                      <span className="text-[9px] text-slate-400 uppercase">Pax</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-[#27272A]" />
                    <div className="flex items-center gap-1.5" title="Large Luggage">
                      <Briefcase className="w-3.5 h-3.5 text-[#FFC400]" />
                      <span className="font-bold text-white text-xs">{veh.largeLuggage}</span>
                      <span className="text-[9px] text-slate-400 uppercase">Bag</span>
                    </div>
                    <div className="w-[1px] h-3.5 bg-[#27272A]" />
                    <div className="flex items-center gap-1.5" title="Hand Luggage">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#FFC400]" />
                      <span className="font-bold text-white text-xs">{veh.handLuggage}</span>
                      <span className="text-[9px] text-slate-400 uppercase">Hand</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Button */}
                <div className="mt-3 pt-2 border-t border-[#27272A]">
                  <button
                    type="button"
                    disabled={isCalculatingRoute || !routeResult?.isValid}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!routeResult?.isValid || isCalculatingRoute) return;
                      onSelectVehicle(veh.id);
                      if (isSelected) {
                        onContinueBooking();
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-extrabold text-[11px] tracking-wider uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
                      !routeResult?.isValid
                        ? 'bg-white/5 text-slate-400 border border-white/5 cursor-not-allowed'
                        : isCalculatingRoute
                        ? 'bg-[#FFC400]/20 text-[#FFC400] border border-[#FFC400]/30 cursor-wait'
                        : isSelected
                        ? 'bg-[#FFC400] text-black shadow-lg hover:bg-[#e6b000] scale-[1.01] cursor-pointer'
                        : 'bg-[#222228] hover:bg-[#FFC400] text-slate-100 hover:text-black border border-[#33333C] hover:border-[#FFC400] cursor-pointer'
                    }`}
                  >
                    {isCalculatingRoute ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>CALCULATING...</span>
                      </>
                    ) : !routeResult?.isValid ? (
                      <span>ENTER ROUTE</span>
                    ) : isSelected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>CONTINUE BOOKING →</span>
                      </>
                    ) : (
                      <span>SELECT VEHICLE</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Carousel Dots Indicator - only on screens with horizontal scroll (<lg) */}
        <div className="flex lg:hidden items-center justify-center gap-1.5 mt-2">
          {carouselVehicles.map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              onClick={() => scrollToSlide(dotIdx)}
              aria-label={`Go to slide ${dotIdx + 1}`}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                activeSlideIndex === dotIdx ? 'w-6 bg-[#FFC400]' : 'w-2 bg-[#27272A] hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>

    </div>
  );
};
