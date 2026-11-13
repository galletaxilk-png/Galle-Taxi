import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  Users,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Sparkles,
  PlaneTakeoff,
  PlaneLanding,
  Plane,
  Compass,
  UserCheck,
  Mail,
  Send,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { formatLKR, calculateAuthoritativeFare, CURRENCIES } from '../lib/fareEngine';
import {
  getActivePublicVehicles,
  getCategoryFallbackImage,
  normalizeVehicleImageUrl,
} from '../lib/vehicleHelpers';
import { SERVICE_TABS, ServiceTabType } from './Home';
import { CurrencySelector } from '../components/CurrencySelector';
import { dispatchCustomerEmailVoucher } from '../lib/emailService';
import { GoogleAddressAutocomplete } from '../components/GoogleAddressAutocomplete';
import { calculateRouteDistance, RouteDistanceResult } from '../lib/routeDistanceService';
import { CountryPhoneInput } from '../components/CountryPhoneInput';

export const BookTaxiPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { vehicles, fareRules, createBooking, siteSettings, currency, formatFare } = useApp();

  const [activeTab, setActiveTab] = useState<ServiceTabType>(() => {
    const sParam = searchParams.get('serviceType');
    if (sParam === 'AIRPORT DROP' || sParam === 'AIRPORT PICK UP' || sParam === 'TAXI RIDE' || sParam === 'TOURS') {
      return sParam;
    }
    return 'AIRPORT DROP';
  });

  // Form State initialized from URL query params if present
  const [pickup, setPickup] = useState(() => {
    const pParam = searchParams.get('pickup');
    if (pParam) return pParam;
    const tabConfig = SERVICE_TABS.find((t) => t.id === searchParams.get('serviceType')) || SERVICE_TABS[0];
    return tabConfig.defaultPickup;
  });
  const [destination, setDestination] = useState(() => {
    const dParam = searchParams.get('destination');
    if (dParam) return dParam;
    const tabConfig = SERVICE_TABS.find((t) => t.id === searchParams.get('serviceType')) || SERVICE_TABS[0];
    return tabConfig.defaultDestination;
  });
  const [date, setDate] = useState(() => {
    const fromParam = searchParams.get('date');
    if (fromParam) return fromParam;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [time, setTime] = useState(searchParams.get('time') || '10:00');
  const publicVehicles = useMemo(() => getActivePublicVehicles(vehicles), [vehicles]);

  const [vehicleId, setVehicleId] = useState(
    () =>
      searchParams.get('vehicleId') ||
      (publicVehicles.find((v) => v.isDefaultSelected) || publicVehicles[0] || vehicles[0])?.id ||
      'veh-sedan-std'
  );
  const [passengerCount, setPassengerCount] = useState(2);
  const [luggageCount, setLuggageCount] = useState(2);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [flightNumber, setFlightNumber] = useState(searchParams.get('flight') || '');
  const [airportGreeting, setAirportGreeting] = useState(true);
  const [nameboardText, setNameboardText] = useState(searchParams.get('nameboard') || '');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // UI state: 3-Step Booking Flow
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Synchronize vehicle if query param or public fleet updates
  useEffect(() => {
    const vParam = searchParams.get('vehicleId');
    if (vParam && vehicles.some((v) => v.id === vParam)) {
      setVehicleId(vParam);
      return;
    }
    if (publicVehicles.length > 0 && !publicVehicles.some((v) => v.id === vehicleId)) {
      setVehicleId((publicVehicles.find((v) => v.isDefaultSelected) || publicVehicles[0]).id);
    }
  }, [searchParams, vehicles, publicVehicles, vehicleId]);

  // Listen for real-time live fare rules and vehicle rate updates across admin & website tabs
  const [, setFareTick] = useState(0);
  useEffect(() => {
    const handleFareSync = () => setFareTick((t) => t + 1);
    window.addEventListener('galle_taxi_fare_rules_updated', handleFareSync);
    window.addEventListener('galle_taxi_vehicle_updated', handleFareSync);
    window.addEventListener('storage', handleFareSync);
    return () => {
      window.removeEventListener('galle_taxi_fare_rules_updated', handleFareSync);
      window.removeEventListener('galle_taxi_vehicle_updated', handleFareSync);
      window.removeEventListener('storage', handleFareSync);
    };
  }, []);

  const selectedVehicle =
    publicVehicles.find((v) => v.id === vehicleId) ||
    vehicles.find((v) => v.id === vehicleId) ||
    publicVehicles[0] ||
    vehicles[0];

  // Dynamic Route Distance Calculation
  const [routeResult, setRouteResult] = useState<RouteDistanceResult | null>(null);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

  useEffect(() => {
    const p = pickup?.trim();
    const d = destination?.trim();

    if (!p || p.length < 3 || !d || d.length < 3) {
      setRouteResult(null);
      setIsCalculatingRoute(false);
      return;
    }

    let isMounted = true;
    setIsCalculatingRoute(true);

    const timer = setTimeout(async () => {
      try {
        const res = await calculateRouteDistance(p, d, fareRules);
        if (isMounted) {
          setRouteResult(res);
          setIsCalculatingRoute(false);
        }
      } catch {
        if (isMounted) setIsCalculatingRoute(false);
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [pickup, destination, fareRules]);

  // Authoritative calculation for currently selected vehicle
  const calculated = calculateAuthoritativeFare({
    pickup: pickup || 'Galle Fort',
    destination: destination || 'Colombo Airport',
    vehicleCategoryId: selectedVehicle.id,
    pickupTime: time,
    vehicles,
    fareRules,
    customDistanceKm: routeResult?.distanceKm && routeResult.distanceKm > 0 ? routeResult.distanceKm : undefined,
  });

  // Authoritative calculation for any vehicle category given current pickup/dest/time
  const getVehicleTripFare = (vId: string) => {
    return calculateAuthoritativeFare({
      pickup: pickup || 'Galle Fort',
      destination: destination || 'Colombo Airport',
      vehicleCategoryId: vId,
      pickupTime: time,
      vehicles,
      fareRules,
      customDistanceKm: routeResult?.distanceKm && routeResult.distanceKm > 0 ? routeResult.distanceKm : undefined,
    });
  };

  const handleTabChange = (tabId: ServiceTabType) => {
    setActiveTab(tabId);
    const tabConfig = SERVICE_TABS.find((t) => t.id === tabId);
    if (tabConfig) {
      setPickup(tabConfig.defaultPickup);
      setDestination(tabConfig.defaultDestination);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const validateStep1 = (): boolean => {
    setValidationError(null);

    // Ride Details validation
    if (!pickup.trim() || pickup.length < 3) {
      setValidationError('Please enter a valid pickup address, hotel or airport location (minimum 3 characters).');
      return false;
    }
    if (!destination.trim() || destination.length < 3) {
      setValidationError('Please enter a valid destination in Sri Lanka.');
      return false;
    }
    if (isCalculatingRoute) {
      setValidationError('Please wait a moment while the driving route distance and live fares are calculating...');
      return false;
    }
    if (!date || date < todayStr) {
      setValidationError('Pickup date cannot be in the past. Please choose today or a future date.');
      return false;
    }
    if (!time) {
      setValidationError('Please choose a valid pickup time.');
      return false;
    }
    if (activeTab === 'AIRPORT PICK UP' && (!flightNumber.trim() || flightNumber.trim().length < 2)) {
      setValidationError('Please enter your Arrival Flight Number (e.g. UL 504, EK 652, QR 668) so our chauffeur can track your arrival in real time.');
      return false;
    }

    return true;
  };

  const validateStep2 = (): boolean => {
    setValidationError(null);

    // Vehicle & Passenger validation
    if (passengerCount > selectedVehicle.passengers) {
      setValidationError(
        `Selected vehicle (${selectedVehicle.name}) accommodates up to ${selectedVehicle.passengers} passengers. Please choose a larger vehicle like a VIP Passenger Van.`
      );
      return false;
    }
    if (!customerName.trim() || customerName.trim().length < 2) {
      setValidationError('Please enter your full passenger name.');
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    if (cleanPhone.length < 8) {
      setValidationError('Please enter a valid phone or WhatsApp number with country code (e.g. +94 77 123 4567).');
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid passenger email address (e.g. yourname@example.com) to receive your instant booking confirmation email & voucher.');
      return false;
    }

    return true;
  };

  const handleNextFromStep1 = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  const handleNextFromStep2 = (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 160, behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (currentStep === 1) {
      handleNextFromStep1(e);
      return;
    }
    if (currentStep === 2) {
      handleNextFromStep2(e);
      return;
    }

    if (!validateStep1()) {
      setCurrentStep(1);
      return;
    }
    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const resolvedNameboard = activeTab === 'AIRPORT PICK UP' && airportGreeting
        ? (nameboardText.trim() || customerName.trim() || 'Passenger Name')
        : undefined;

      const specialDetails = [
        `[Category: ${activeTab}]`,
        activeTab === 'AIRPORT PICK UP' && flightNumber.trim() ? `[Flight: ${flightNumber.trim()}]` : '',
        resolvedNameboard ? `[Greeting Nameboard: "${resolvedNameboard}"]` : '',
        specialInstructions.trim(),
      ]
        .filter(Boolean)
        .join(' ');

      // Create booking record authoritatively
      const created = await createBooking({
        customerName: customerName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        pickupLocation: pickup.trim(),
        destination: destination.trim(),
        pickupDate: date,
        pickupTime: time,
        vehicleCategoryId: selectedVehicle.id,
        vehicleCategoryName: selectedVehicle.name,
        passengerCount,
        luggageCount,
        flightNumber: activeTab === 'AIRPORT PICK UP' ? flightNumber.trim() : undefined,
        airportGreeting: activeTab === 'AIRPORT PICK UP' ? airportGreeting : false,
        nameboardText: resolvedNameboard,
        specialInstructions: specialDetails || undefined,
        estimatedFare: calculated.fare,
      });

      // Dispatch automated customer confirmation email voucher
      try {
        await dispatchCustomerEmailVoucher({
          bookingReference: created.bookingReference,
          customerName: customerName.trim(),
          customerEmail: email.trim(),
          phone: phone.trim(),
          pickupLocation: pickup.trim(),
          destination: destination.trim(),
          pickupDate: date,
          pickupTime: time,
          vehicleCategoryName: selectedVehicle.name,
          passengerCount,
          luggageCount,
          flightNumber: activeTab === 'AIRPORT PICK UP' ? flightNumber.trim() : undefined,
          nameboardText: resolvedNameboard,
          estimatedFare: calculated.fare,
          specialInstructions: specialDetails || undefined,
          dispatcherEmail: siteSettings.email,
          dispatcherPhone: siteSettings.phone,
          dispatcherWhatsapp: siteSettings.whatsappNumber,
        });
      } catch (dispatchErr) {
        console.warn('Email voucher dispatch warning:', dispatchErr);
      }

      // Redirect to Confirmation
      const flightQuery = activeTab === 'AIRPORT PICK UP' && flightNumber.trim()
        ? `&flight=${encodeURIComponent(flightNumber.trim())}`
        : '';
      const nameboardQuery = resolvedNameboard
        ? `&nameboard=${encodeURIComponent(resolvedNameboard)}`
        : '';
      const emailQuery = email.trim() ? `&email=${encodeURIComponent(email.trim())}` : '';

      navigate(
        `/booking-success?ref=${created.bookingReference}&id=${created.id}${flightQuery}${nameboardQuery}${emailQuery}`
      );
    } catch (err) {
      console.error('Booking failed:', err);
      setValidationError('An unexpected error occurred while saving your booking. Please try again or book directly via WhatsApp.');
      setIsSubmitting(false);
    }
  };

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-6 sm:py-8 px-4 sm:px-6 lg:px-8 xl:px-10 w-full">
      <div className="w-full space-y-6">
        
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
            Step {currentStep} of 3 · {currentStep === 1 ? 'Ride Details' : currentStep === 2 ? 'Vehicle & Passenger Info' : 'Trip & Fare Summary'}
          </div>
        </div>

        {/* Step Indicator Tabs: 3 Steps */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer ${
              currentStep === 1
                ? 'bg-[#F5B91B] text-black border-[#F5B91B] shadow-lg shadow-[#F5B91B]/20'
                : 'bg-[#141416] text-slate-400 hover:text-white border-[#27272A]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                currentStep === 1 ? 'bg-black text-[#F5B91B]' : 'bg-[#27272A] text-slate-300'
              }`}
            >
              1
            </span>
            <span className="truncate">1. Ride Details</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) {
                handleNextFromStep1();
              } else {
                setCurrentStep(2);
              }
            }}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer ${
              currentStep === 2
                ? 'bg-[#F5B91B] text-black border-[#F5B91B] shadow-lg shadow-[#F5B91B]/20'
                : 'bg-[#141416] text-slate-400 hover:text-white border-[#27272A]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                currentStep === 2 ? 'bg-black text-[#F5B91B]' : 'bg-[#27272A] text-slate-300'
              }`}
            >
              2
            </span>
            <span className="truncate">2. Vehicle & Pax</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (currentStep === 1) {
                if (validateStep1()) {
                  if (validateStep2()) {
                    setCurrentStep(3);
                  } else {
                    setCurrentStep(2);
                  }
                }
              } else if (currentStep === 2) {
                handleNextFromStep2();
              } else {
                setCurrentStep(3);
              }
            }}
            className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center gap-1.5 sm:gap-2 text-xs font-bold transition-all cursor-pointer ${
              currentStep === 3
                ? 'bg-[#F5B91B] text-black border-[#F5B91B] shadow-lg shadow-[#F5B91B]/20'
                : 'bg-[#141416] text-slate-400 hover:text-white border-[#27272A]'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                currentStep === 3 ? 'bg-black text-[#F5B91B]' : 'bg-[#27272A] text-slate-300'
              }`}
            >
              3
            </span>
            <span className="truncate">3. Trip & Fare Summary</span>
          </button>
        </div>

        {/* Header Breadcrumb & Title */}
        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Guaranteed Confirmation · 24/7 Chauffeur Dispatch
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit']">
            Book Your Ride with <span className="text-[#F5B91B]">Galle Taxi</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            Fixed rates, no hidden fees. Complete the details below and receive immediate booking confirmation.
          </p>
        </div>

        {validationError && (
          <div className="p-4 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-3 text-red-200 text-sm">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={currentStep === 3 ? "grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full" : "w-full"}>
          
          {/* Main Form Fields: 7 cols on Step 3, full width across viewport on Step 1 & 2 */}
          <div className={`${currentStep === 3 ? 'lg:col-span-7 space-y-6' : 'w-full space-y-8'}`}>
            {currentStep === 1 ? (
              <>
                {/* Service Category Tabs: AIRPORT DROP | AIRPORT PICK UP | TAXI RIDE | TOURS */}
                <div className="space-y-3 pb-6 border-b border-[#27272A]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5B91B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Select Service Category</span>
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {SERVICE_TABS.find((t) => t.id === activeTab)?.badge}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {SERVICE_TABS.map((tab) => {
                  const isSelected = activeTab === tab.id;
                  const IconComp =
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
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#F5B91B] text-black border-[#F5B91B] font-extrabold shadow-md'
                          : 'bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-300 hover:text-white border-[#27272A]'
                      }`}
                    >
                      <IconComp className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-[#F5B91B]'}`} />
                      <span className="text-[11px] font-bold uppercase tracking-tight">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 1: Ride & Route Details */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#27272A] text-sm font-bold text-white font-['Outfit']">
                <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-extrabold flex items-center justify-center text-xs">
                  1
                </span>
                <span>Trip & Schedule Details</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Pickup Location / Hotel / Airport <span className="text-red-400">*</span>
                  </label>
                  <GoogleAddressAutocomplete
                    value={pickup}
                    onChange={setPickup}
                    placeholder="e.g. Add your location (or Airport / Hotel)"
                    required
                    iconColor="text-[#F5B91B]"
                    className="w-full min-h-[44px] pl-9 pr-9 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>

                {/* Swap Pickup & Destination Button */}
                <div className="sm:col-span-2 flex items-center justify-center -my-1.5 z-10">
                  <button
                    type="button"
                    onClick={() => {
                      const temp = pickup;
                      setPickup(destination);
                      setDestination(temp);
                    }}
                    aria-label="Swap Pickup and Destination locations (ස්ථාන මාරු කරන්න)"
                    className="w-8 h-8 rounded-full bg-[#1A1A20] hover:bg-[#F5B91B] hover:text-black text-slate-300 border border-[#2E2E36] hover:border-[#F5B91B] flex items-center justify-center transition-all shadow-md group cursor-pointer"
                    title="Swap Pickup and Destination locations (ස්ථාන මාරු කරන්න)"
                  >
                    <ArrowUpDown className="w-4 h-4 text-[#F5B91B] group-hover:text-black transition-transform group-hover:rotate-180" />
                  </button>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Destination Address or City <span className="text-red-400">*</span>
                  </label>
                  <GoogleAddressAutocomplete
                    value={destination}
                    onChange={setDestination}
                    placeholder="e.g. Galle Dutch Fort, Mirissa Beach, or Ella"
                    required
                    iconColor="text-emerald-400"
                    className="w-full min-h-[44px] pl-9 pr-9 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>

                {/* Arrival Details ONLY for AIRPORT PICK UP, standard Pickup Date & Time for other categories */}
                {activeTab === 'AIRPORT PICK UP' ? (
                  <div className="sm:col-span-2 p-4 sm:p-5 rounded-xl bg-[#17171C] border border-[#F5B91B]/40 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                      <div className="flex items-center gap-2">
                        <PlaneLanding className="w-4 h-4 text-[#F5B91B]" />
                        <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider font-['Outfit']">
                          Arrival Details
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Free Live Flight Delay Monitoring
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                      {/* Arrival Date */}
                      <div className="space-y-1.5">
                        <label htmlFor="book-arrival-date" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Arrival Date</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-[#F5B91B] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="book-arrival-date"
                            type="date"
                            value={date}
                            min={todayStr}
                            onChange={(e) => setDate(e.target.value)}
                            required
                            className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                          />
                        </div>
                      </div>

                      {/* Arrival Time */}
                      <div className="space-y-1.5">
                        <label htmlFor="book-arrival-time" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Arrival Time</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Clock className="w-4 h-4 text-[#F5B91B] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="book-arrival-time"
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            required
                            className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                          />
                        </div>
                      </div>

                      {/* Flight Number */}
                      <div className="space-y-1.5">
                        <label htmlFor="book-flight-number" className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                          <span>Flight Number</span>
                          <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <Plane className="w-4 h-4 text-[#F5B91B] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="book-flight-number"
                            type="text"
                            value={flightNumber}
                            onChange={(e) => setFlightNumber(e.target.value.toUpperCase())}
                            placeholder="e.g. UL 504 / EK 652"
                            required
                            className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white uppercase placeholder:normal-case font-mono font-bold focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Airport Greeting Service & Customer's Name on Board */}
                    <div className="pt-3 border-t border-[#27272A] space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={airportGreeting}
                            onChange={(e) => setAirportGreeting(e.target.checked)}
                            className="w-4 h-4 rounded text-[#F5B91B] focus:ring-[#F5B91B] focus:ring-offset-0 bg-[#0B0B0D] border-[#3F3F46] accent-[#F5B91B]"
                          />
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Airport Greeting Service (Meet & Greet)
                            </span>
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/70 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                              Included Free
                            </span>
                          </div>
                        </label>
                        <span className="text-[11px] text-slate-400">
                          Chauffeur waits inside Arrival Hall with a Placard
                        </span>
                      </div>

                      {airportGreeting && (
                        <div className="space-y-3.5 pt-1">
                          {/* Name on Board Input */}
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label htmlFor="book-nameboard-text" className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                                <UserCheck className="w-3.5 h-3.5 text-[#F5B91B]" />
                                <span>Customer's Name on Board</span>
                                <span className="text-red-400">*</span>
                              </label>
                              {customerName.trim() && (
                                <button
                                  type="button"
                                  onClick={() => setNameboardText(customerName.trim())}
                                  className="text-[10px] text-[#F5B91B] hover:underline font-mono"
                                >
                                  Use Passenger Name ({customerName.trim()})
                                </button>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                id="book-nameboard-text"
                                type="text"
                                value={nameboardText}
                                onChange={(e) => setNameboardText(e.target.value)}
                                placeholder={customerName.trim() ? `e.g. ${customerName.trim()} & Family` : 'e.g. Mr. John Smith & Family / Alex Turner'}
                                className="w-full min-h-[44px] px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                              />
                            </div>
                            <p className="text-[11px] text-slate-400">
                              Enter the exact customer or family name to be held on the greeting placard by your chauffeur at the airport.
                            </p>
                          </div>

                          {/* Live Chauffeur Nameboard Placard Preview */}
                          <div className="rounded-xl border border-[#F5B91B]/40 bg-gradient-to-b from-[#18181D] via-[#121216] to-[#0A0A0D] p-4 text-center shadow-lg relative overflow-hidden">
                            <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#F5B91B] to-transparent absolute top-0 left-0" />
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-400 font-mono pb-2 border-b border-[#27272A]">
                              <span className="flex items-center gap-1.5 text-slate-300">
                                <Plane className="w-3 h-3 text-[#F5B91B]" />
                                CMB Airport Arrival Placard
                              </span>
                              <span className="text-[#F5B91B] font-bold tracking-widest">GALLE TAXI VIP</span>
                            </div>
                            <div className="py-3 space-y-1">
                              <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                                Welcome to Sri Lanka
                              </div>
                              <div className="text-xl sm:text-2xl font-extrabold text-[#F5B91B] font-['Outfit'] tracking-wide uppercase">
                                {nameboardText.trim() || customerName.trim() || 'PASSENGER NAME / FAMILY'}
                              </div>
                              <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#0B0B0D] border border-[#27272A] text-[11px] font-mono text-slate-300">
                                <span className="text-slate-400">Flight:</span>
                                <span className="text-white font-bold">{flightNumber.trim() || 'UL 504'}</span>
                                <span className="text-emerald-400 font-medium">· Colombo (CMB)</span>
                              </div>
                            </div>
                            <div className="text-[10px] text-slate-400 border-t border-[#27272A] pt-2 flex items-center justify-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span>Chauffeur will display this sign at the Colombo Airport arrival hall outside customs & baggage exit. Zero delay surcharge.</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label htmlFor="book-pickup-date" className="text-xs font-semibold text-slate-300">
                        Pickup Date <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                        <input
                          id="book-pickup-date"
                          type="date"
                          value={date}
                          min={todayStr}
                          onChange={(e) => setDate(e.target.value)}
                          required
                          className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="book-pickup-time" className="text-xs font-semibold text-slate-300">
                        Pickup Time (24h) <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5 pointer-events-none" />
                        <input
                          id="book-pickup-time"
                          type="time"
                          value={time}
                          onChange={(e) => setTime(e.target.value)}
                          required
                          className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Step 1 Authoritative Trip Final Price Card */}
            <div className="rounded-2xl border border-[#27272A] bg-gradient-to-b from-[#191920] via-[#131317] to-[#0A0A0D] p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#F5B91B] to-transparent absolute top-0 left-0" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#F5B91B]/20 border border-[#F5B91B]/40 text-[#F5B91B] flex items-center justify-center font-bold shrink-0">
                    <Sparkles className="w-5 h-5 text-[#F5B91B]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider font-['Outfit']">
                        Trip Final Price
                      </span>
                      <span className="text-[10px] font-extrabold text-black bg-[#F5B91B] px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Guaranteed Fixed Fare
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Authoritative live fare calculated for your selected route & schedule
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto max-w-full overflow-hidden">
                  <span className="text-[11px] text-slate-400 font-mono shrink-0">Currency:</span>
                  <CurrencySelector variant="segmented" className="w-full sm:w-auto" />
                </div>
              </div>

              {/* Highlighted Fare Display Banner */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#0B0B0D] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Selected Vehicle:
                    </span>
                    <span className="text-xs font-bold text-[#F5B91B] bg-[#F5B91B]/15 px-2.5 py-0.5 rounded border border-[#F5B91B]/30 font-mono">
                      {selectedVehicle.name} ({selectedVehicle.category})
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span className="truncate max-w-[240px] sm:max-w-[340px] font-semibold text-white">
                      {pickup || 'Galle'} → {destination || 'Colombo Airport'}
                    </span>
                    <span className="text-[#F5B91B] font-mono font-bold shrink-0 bg-[#1A1A1E] px-2 py-0.5 rounded border border-[#27272A]">
                      ~{calculated.distanceKm} km
                    </span>
                  </div>
                  {calculated.tierDescription && !calculated.isFixedRoute && (
                    <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{calculated.tierDescription} applied</span>
                    </div>
                  )}
                </div>

                <div className="text-left sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#27272A]">
                  <div className="text-[11px] text-slate-400 uppercase tracking-widest font-semibold">
                    Trip Total (All-Inclusive)
                  </div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-[#F5B91B] tracking-tight">
                    {formatFare(calculated.fare)}
                  </div>
                  {currency !== 'LKR' && (
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      ≈ {formatLKR(calculated.fare)}
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Category Pricing Preview (Click to Switch Vehicle directly) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span className="hidden sm:inline">Price by Vehicle Category for this Trip (Click to select)</span>
                    <span className="sm:hidden">Vehicles (Swipe to select)</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Expressway Tolls + Fuel + Driver Included
                  </span>
                </div>

                <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 sm:mx-0 sm:px-0">
                  {publicVehicles.map((v) => {
                    const isSelected = v.id === vehicleId;
                    const vFare = getVehicleTripFare(v.id);
                    const thumbSrc = normalizeVehicleImageUrl(v.imageUrl, v.category, v.id, v.name);
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => setVehicleId(v.id)}
                        className={`shrink-0 w-[145px] sm:w-auto snap-start p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between backdrop-blur-md ${
                          isSelected
                            ? 'bg-[#F5B91B]/20 border-white/40 ring-2 ring-[#F5B91B]/70 shadow-[0_4px_16px_rgba(245,185,27,0.25),inset_0_1px_0_rgba(255,255,255,0.3)]'
                            : 'bg-[#121216]/80 border-white/25 hover:border-white/45 ring-1 ring-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] hover:bg-[#181820]/90'
                        }`}
                      >
                        <div>
                          <div className="h-11 w-full rounded-lg bg-[#0B0B0D]/70 border border-white/10 flex items-center justify-center p-1 mb-2 overflow-hidden">
                            <img
                              src={thumbSrc}
                              alt={v.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (target.dataset.fallbackApplied) return;
                                target.dataset.fallbackApplied = 'true';
                                target.src = getCategoryFallbackImage(v.category, v.id, v.name);
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">
                              {v.name}
                            </span>
                            {isSelected && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">{v.passengers} Pax</span>
                        </div>
                        <div className="mt-2 pt-1.5 border-t border-[#1F1F23]">
                          <div className="font-mono font-extrabold text-sm text-[#F5B91B]">
                            {formatFare(vFare.fare)}
                          </div>
                          {currency !== 'LKR' && (
                            <div className="text-[9px] text-slate-400 font-mono truncate">
                              ≈ {formatLKR(vFare.fare)}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guarantees Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5 bg-[#0B0B0D] p-2 rounded-lg border border-[#27272A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Expressway Tolls Incl.</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0B0B0D] p-2 rounded-lg border border-[#27272A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Fuel & Driver Incl.</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0B0B0D] p-2 rounded-lg border border-[#27272A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Hidden Fees</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#0B0B0D] p-2 rounded-lg border border-[#27272A]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Pay Cash or Card</span>
                </div>
              </div>
            </div>

            {/* Step 1 Next Button -> Goes to Vehicle & Passenger Selection */}
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="w-full sm:w-auto sm:min-w-[260px] max-w-md mx-auto py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-black bg-[#F5B91B] hover:bg-[#E5A812] transition-all shadow-md shadow-[#F5B91B]/20 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              <span>Next: Select Vehicle & Passenger (Step 2)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        ) : currentStep === 2 ? (
          <>
            {/* Step 2 Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5B91B]">Step 2 of 3</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">
                  Vehicle & Passenger Details
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your vehicle category and enter passenger contact details.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="text-xs text-slate-400 hover:text-[#F5B91B] flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Step 1</span>
              </button>
            </div>

            {/* Step 2: Vehicle Selection */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                <div className="flex items-center gap-2 text-sm font-bold text-white font-['Outfit']">
                  <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-extrabold flex items-center justify-center text-xs">
                    2
                  </span>
                  <span>Select Vehicle Category</span>
                </div>
                <span className="sm:hidden text-[10px] text-[#F5B91B] font-mono flex items-center gap-1">
                  Swipe vehicles →
                </span>
              </div>

              <div className="flex sm:grid overflow-x-auto sm:overflow-x-visible pb-2 sm:pb-0 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-1 px-1 sm:mx-0 sm:px-0">
                {publicVehicles.map((v) => {
                  const isSelected = v.id === vehicleId;
                  const vFare = getVehicleTripFare(v.id);
                  const cardImg = normalizeVehicleImageUrl(v.imageUrl, v.category, v.id, v.name);
                  return (
                    <div
                      key={v.id}
                      onClick={() => setVehicleId(v.id)}
                      className={`shrink-0 w-[270px] sm:w-auto snap-start cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between backdrop-blur-xl ${
                        isSelected
                          ? 'bg-[#16161D]/90 border border-white/45 ring-2 ring-[#F5B91B]/70 shadow-[0_14px_40px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.3)] scale-[1.01]'
                          : 'bg-[#121216]/80 hover:bg-[#181820]/85 border border-white/25 hover:border-white/45 ring-1 ring-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_14px_40px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.3)]'
                      }`}
                    >
                      <div>
                        <div className="h-24 w-full rounded-xl bg-[#0D0D10]/80 border border-white/10 flex items-center justify-center p-2 mb-3 overflow-hidden">
                          <img
                            src={cardImg}
                            alt={v.name}
                            className="w-full h-full object-contain drop-shadow-[0_4px_10px_rgba(0,0,0,0.45)]"
                            onError={(e) => {
                              const target = e.currentTarget;
                              if (target.dataset.fallbackApplied) return;
                              target.dataset.fallbackApplied = 'true';
                              target.src = getCategoryFallbackImage(v.category, v.id, v.name);
                            }}
                          />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-white truncate">
                            {v.name}
                          </span>
                          <span className="text-[11px] font-bold text-[#F5B91B] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5B91B]/10 border border-[#F5B91B]/30 shrink-0">
                            {v.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400 mt-2">
                          <div className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-300" />
                            <span>{v.passengers} Pax</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Briefcase className="w-3.5 h-3.5 text-slate-300" />
                            <span>{v.luggage} Bags</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 block">
                            Trip Total Fare
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">Tolls & Fuel incl.</span>
                        </div>
                        <div className="text-right">
                          <span className="font-mono font-black text-sm sm:text-base text-[#F5B91B]">
                            {formatFare(vFare.fare)}
                          </span>
                          {currency !== 'LKR' && (
                            <span className="block text-[10px] text-slate-400 font-mono">
                              ≈ {formatLKR(vFare.fare)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Passengers & Luggage count */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label htmlFor="book-passenger-count" className="text-xs font-semibold text-slate-300">Passenger Count</label>
                  <input
                    id="book-passenger-count"
                    type="number"
                    min={1}
                    max={selectedVehicle.passengers}
                    value={passengerCount}
                    onChange={(e) => setPassengerCount(parseInt(e.target.value) || 1)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="book-luggage-count" className="text-xs font-semibold text-slate-300">Luggage Items</label>
                  <input
                    id="book-luggage-count"
                    type="number"
                    min={0}
                    max={selectedVehicle.luggage}
                    value={luggageCount}
                    onChange={(e) => setLuggageCount(parseInt(e.target.value) || 0)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Passenger & Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#27272A] text-sm font-bold text-white font-['Outfit']">
                <span className="w-6 h-6 rounded-full bg-[#F5B91B] text-black font-extrabold flex items-center justify-center text-xs">
                  3
                </span>
                <span>Passenger Contact Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label htmlFor="book-customer-name" className="text-xs font-semibold text-slate-300">
                    Lead Passenger Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="book-customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone / WhatsApp Number <span className="text-red-400">*</span>
                  </label>
                  <CountryPhoneInput
                    value={phone}
                    onChange={(val) => setPhone(val)}
                    required
                  />
                  <p className="text-[11px] text-slate-400">Select country flag/code & enter WhatsApp number for live driver dispatch</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="book-customer-email" className="text-xs font-semibold text-slate-300">
                      Passenger Email Address <span className="text-red-400">*</span>
                    </label>
                    <span className="text-[10px] text-[#F5B91B] font-mono font-bold">For Instant Confirmation Email</span>
                  </div>
                  <input
                    id="book-customer-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                  <p className="text-[11px] text-slate-400">
                    Official booking reference and chauffeur voucher will be emailed to this address.
                  </p>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300">
                    Flight Number / Special Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Flight QR664 arriving 14:15, need child seat, or surf board storage"
                    className="w-full px-3.5 py-2.5 bg-[#141418]/80 backdrop-blur-md border border-white/25 hover:border-white/40 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B] focus:ring-1 focus:ring-[#F5B91B]/40 shadow-[0_2px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Step 2 Trip Final Price Summary Bar */}
            <div className="p-3.5 sm:p-5 rounded-2xl border border-[#27272A] bg-gradient-to-r from-[#17171C] via-[#121216] to-[#17171C] flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider font-['Outfit']">
                    Trip Final Price
                  </span>
                  <span className="text-[10px] font-extrabold text-black bg-[#F5B91B] px-2 py-0.5 rounded-full uppercase">
                    Trip Total
                  </span>
                </div>
                <div className="text-xs text-slate-300 flex items-center gap-2 flex-wrap">
                  <span className="text-[#F5B91B] font-bold">{selectedVehicle.name}</span>
                  <span>·</span>
                  <span className="font-mono text-slate-200">~{calculated.distanceKm} km</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-medium">Expressway & Fuel Included</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 border-[#27272A] w-full lg:w-auto">
                <div className="w-full sm:w-auto">
                  <CurrencySelector variant="segmented" className="w-full sm:w-auto" />
                </div>
                <div className="flex items-center justify-between sm:flex-col sm:items-end w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#27272A]/60">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold sm:hidden">
                    Net Total (All-Inclusive)
                  </span>
                  <div className="text-right">
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#F5B91B] tracking-tight whitespace-nowrap">
                      {formatFare(calculated.fare)}
                    </div>
                    {currency !== 'LKR' && (
                      <div className="text-xs text-slate-400 font-mono">
                        ≈ {formatLKR(calculated.fare)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2 Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#27272A] hover:border-slate-500 bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back: Step 1 (Ride Details)</span>
              </button>

              <button
                type="button"
                onClick={handleNextFromStep2}
                className="w-full sm:flex-1 py-2.5 sm:py-3 px-5 rounded-xl font-bold text-xs sm:text-sm tracking-wide text-black bg-[#F5B91B] hover:bg-[#E5A812] transition-all shadow-md shadow-[#F5B91B]/20 flex items-center justify-center gap-1.5 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <span>Next: Trip & Fare Summary (Step 3)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          /* Step 3: Passenger & Trip Route Verification (Left Column) */
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5B91B]">Step 3 of 3</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">Passenger & Route Verification</h2>
                <p className="text-xs text-slate-400 mt-0.5">Please review your trip itinerary and passenger details before confirming.</p>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Ready to Confirm
              </span>
            </div>

            {/* Service & Route Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#141418]/80 backdrop-blur-xl border border-white/25 hover:border-white/40 ring-1 ring-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] space-y-3.5 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#F5B91B]">Service Category</span>
                <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F5B91B]/10 text-[#F5B91B] border border-[#F5B91B]/30 font-mono">
                  {activeTab}
                </span>
              </div>

              <div className="space-y-2.5 pt-2 border-t border-[#1F1F23] text-sm">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-[#F5B91B] mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Pickup Location:</span>
                    <div className="font-semibold text-white">{pickup}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">Destination:</span>
                    <div className="font-semibold text-white">{destination}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400">
                      {activeTab === 'AIRPORT PICK UP' ? 'Arrival Schedule:' : 'Date & Time:'}
                    </span>
                    <div className="font-medium text-white">{date} at {time}</div>
                  </div>
                </div>

                {activeTab === 'AIRPORT PICK UP' && flightNumber && (
                  <div className="flex items-start gap-2.5">
                    <Plane className="w-4 h-4 text-[#F5B91B] mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400">Arrival Flight Number:</span>
                      <div className="font-mono font-bold text-[#F5B91B]">{flightNumber}</div>
                    </div>
                  </div>
                )}

                {activeTab === 'AIRPORT PICK UP' && airportGreeting && (
                  <div className="flex items-start gap-2.5 pt-1">
                    <UserCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400">Airport Greeting Placard:</span>
                      <div className="font-bold text-emerald-400">
                        "{nameboardText.trim() || customerName.trim() || 'Passenger Name'}"
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Chauffeur will display this sign at Colombo Airport arrival lounge outside baggage customs exit.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vehicle & Passenger Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#141418]/80 backdrop-blur-xl border border-white/25 hover:border-white/40 ring-1 ring-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] space-y-2 transition-all">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-[#F5B91B]" />
                  <span>Selected Vehicle</span>
                </span>
                <div className="flex items-center gap-3 pt-1">
                  <img
                    src={selectedVehicle.imageUrl}
                    alt={selectedVehicle.name}
                    className="w-16 h-12 object-cover rounded-lg bg-[#1B1B1F]"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <div className="font-bold text-white text-sm">{selectedVehicle.name}</div>
                    <div className="text-xs text-slate-400">
                      {passengerCount} Passengers · {luggageCount} Bags
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#141418]/80 backdrop-blur-xl border border-white/25 hover:border-white/40 ring-1 ring-white/10 shadow-[0_10px_32px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.2)] space-y-2 transition-all">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                  <span>Passenger Information</span>
                </span>
                <div className="pt-1 text-xs space-y-1">
                  <div className="font-semibold text-white text-sm">{customerName}</div>
                  <div className="text-slate-300 font-mono">{phone}</div>
                  {email && <div className="text-slate-400">{email}</div>}
                </div>
              </div>
            </div>

            {specialInstructions && (
              <div className="p-3 bg-[#0B0B0D] rounded-xl border border-[#27272A] text-xs text-slate-300">
                <span className="text-slate-400 font-semibold">Special Instructions: </span>
                {specialInstructions}
              </div>
            )}

            {/* Action Buttons: Return to Edit Steps */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(2);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-white/25 hover:border-white/45 ring-1 ring-white/10 bg-[#141418]/80 hover:bg-[#1c1c22] backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back: Step 2 (Vehicle & Pax)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStep(1);
                  window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-white/25 hover:border-white/45 ring-1 ring-white/10 bg-[#141418]/80 hover:bg-[#1c1c22] backdrop-blur-md shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.18)] text-slate-200 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back: Step 1 (Ride Details)</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 3: Trip & Fare Summary Live Authoritative Card (Right Column) */}
      {currentStep === 3 && (
        <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141418]/85 backdrop-blur-xl border border-white/25 hover:border-white/40 ring-1 ring-white/10 rounded-2xl p-4 sm:p-6 space-y-4 sm:space-y-6 shadow-[0_14px_40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.22)] sticky top-28 transition-all">
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#27272A]">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base font-['Outfit']">Trip Final Price</h3>
                  <div className="text-[11px] text-slate-400">Trip & Final Fare Summary</div>
                </div>
                <span className="text-[11px] font-mono text-[#F5B91B] bg-[#F5B91B]/10 px-2 py-0.5 rounded border border-[#F5B91B]/30 font-bold shrink-0">
                  Fixed Rate
                </span>
              </div>

              {/* Vehicle Preview Card */}
              <div className="flex items-center gap-3 sm:gap-4 p-3.5 bg-[#0D0D10]/80 backdrop-blur-md border border-white/20 hover:border-white/35 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] transition-all">
                <img
                  src={selectedVehicle.imageUrl}
                  alt={selectedVehicle.name}
                  className="w-16 h-14 sm:w-20 sm:h-16 object-cover rounded-lg bg-[#1B1B1F] shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <div className="font-bold text-white text-sm truncate">{selectedVehicle.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {selectedVehicle.passengers} Passengers · {selectedVehicle.luggage} Luggage
                  </div>
                  <div className="text-[11px] text-[#F5B91B] font-semibold mt-1">Air-Conditioned Chauffeur</div>
                </div>
              </div>

              {/* Itinerary Specs */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-start py-1.5 border-b border-[#1F1F23] gap-2">
                  <span className="text-slate-400 shrink-0">Pickup:</span>
                  <span className="text-white font-medium text-right break-words max-w-[65%] sm:max-w-[220px]">{pickup || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-start py-1.5 border-b border-[#1F1F23] gap-2">
                  <span className="text-slate-400 shrink-0">Destination:</span>
                  <span className="text-white font-medium text-right break-words max-w-[65%] sm:max-w-[220px]">{destination || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1F1F23] gap-2">
                  <span className="text-slate-400 shrink-0">
                    {activeTab === 'AIRPORT PICK UP' ? 'Arrival Schedule:' : 'Date & Time:'}
                  </span>
                  <span className="text-white font-medium text-right">{date} at {time}</span>
                </div>
                {activeTab === 'AIRPORT PICK UP' && flightNumber && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1F1F23] gap-2">
                    <span className="text-slate-400 shrink-0">Flight Number:</span>
                    <span className="text-[#F5B91B] font-mono font-bold flex items-center gap-1 text-right">
                      <Plane className="w-3.5 h-3.5" />
                      <span>{flightNumber}</span>
                    </span>
                  </div>
                )}
                {activeTab === 'AIRPORT PICK UP' && airportGreeting && (
                  <div className="flex justify-between items-start py-1.5 border-b border-[#1F1F23] gap-2">
                    <span className="text-slate-400 shrink-0">Greeting Board:</span>
                    <span className="text-emerald-400 font-semibold break-words max-w-[65%] sm:max-w-[200px] text-right">
                      "{nameboardText.trim() || customerName.trim() || 'Passenger Name'}"
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-start py-1.5 border-b border-[#1F1F23] gap-2">
                  <span className="text-slate-400 shrink-0">Confirmation Email:</span>
                  <span className="text-emerald-400 font-mono text-[11px] sm:text-xs font-semibold break-all max-w-[65%] sm:max-w-[220px] text-right flex items-center justify-end gap-1">
                    <Mail className="w-3 h-3 shrink-0" />
                    <span>{email.trim() || 'Required in Step 2'}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-[#1F1F23] gap-2">
                  <span className="text-slate-400 shrink-0">Estimated Distance:</span>
                  <span className="text-white font-mono font-medium text-right">~{calculated.distanceKm} km</span>
                </div>
                {calculated.tierDescription && !calculated.isFixedRoute && (
                  <div className="flex justify-between items-center py-1.5 border-b border-[#1F1F23] gap-2">
                    <span className="text-slate-400 shrink-0">Vehicle Pricing Tier:</span>
                    <span className="text-[#F5B91B] font-mono font-bold text-right text-[11px]">
                      {calculated.tierDescription}
                    </span>
                  </div>
                )}
              </div>

              {/* Currency Selector */}
              <div className="pt-2.5 border-t border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Currency:</span>
                  <span className="text-[11px] text-[#F5B91B] font-mono sm:hidden font-bold">
                    {currency} ({CURRENCIES[currency]?.symbol || currency})
                  </span>
                </div>
                <div className="w-full sm:w-auto overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <CurrencySelector variant="segmented" className="w-full sm:w-auto" />
                </div>
              </div>

              {/* Authoritative Fare Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[#27272A] text-xs text-slate-300">
                <div className="flex justify-between items-center">
                  <span>Base Rate / Distance:</span>
                  <span className="font-mono text-white">{formatFare(calculated.breakdown.baseFare + calculated.breakdown.distanceCharge)}</span>
                </div>
                {calculated.breakdown.nightSurcharge > 0 && (
                  <div className="flex justify-between items-center text-[#F5B91B]">
                    <span>Night Surcharge (11PM - 5AM):</span>
                    <span className="font-mono">+{formatFare(calculated.breakdown.nightSurcharge)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-slate-400">
                  <span>Highway Expressway Tolls:</span>
                  <span className="text-emerald-400 font-medium">Included</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Driver & Fuel Allowance:</span>
                  <span className="text-emerald-400 font-medium">Included</span>
                </div>
              </div>

              {/* Total Authoritative Price */}
              <div className="pt-4 border-t border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-white uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                    <span>Trip Final Price</span>
                  </div>
                  <div className="text-[11px] text-[#F5B91B] font-semibold">Total Final Fare (All-Inclusive)</div>
                  <div className="text-[10px] text-slate-500">Pay cash or card (LKR / USD / EUR / GBP / INR)</div>
                </div>
                <div className="text-left sm:text-right pt-2 sm:pt-0 border-t border-[#27272A]/50 sm:border-t-0 flex items-baseline sm:block justify-between sm:justify-start">
                  <div className="sm:hidden text-xs text-slate-400 font-medium">Final Fare:</div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black font-mono text-[#F5B91B]">
                      {formatFare(calculated.fare)}
                    </div>
                    {currency !== 'LKR' && (
                      <div className="text-[11px] text-slate-400 font-mono">
                        ≈ {formatLKR(calculated.fare)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Step Action in Targeted Card: Confirm Booking & Send Email */}
              <div className="pt-3 border-t border-[#27272A] space-y-3">
                {/* Auto Email Badge Banner */}
                <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-left space-y-1.5 shadow-inner">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>Instant Automated Confirmation Email</span>
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold uppercase tracking-wider shrink-0">
                      Auto-Send Active
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Upon clicking confirm, the official chauffeur voucher with your reservation details will be automatically sent to:
                  </p>
                  <div className="font-mono text-xs text-white font-bold bg-[#0B0B0D] px-2.5 py-1.5 rounded-lg border border-[#27272A] flex items-center justify-between gap-2">
                    <span className="truncate min-w-0 text-slate-100">{email.trim() || 'Passenger Email'}</span>
                    <span className="text-[10px] text-emerald-400 font-normal shrink-0">Inbox Voucher</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 sm:py-3.5 px-4 rounded-xl font-extrabold text-sm sm:text-base tracking-wide text-black bg-[#F5B91B] hover:bg-[#E5A812] transition-all shadow-lg shadow-[#F5B91B]/20 flex items-center justify-center gap-2 cursor-pointer ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.01] active:scale-[0.99]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin shrink-0" />
                      <span className="truncate">Auto-Sending Voucher to {email.trim() || 'Customer'}...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirm Taxi Booking & Send Email</span>
                      <Send className="w-4 h-4 ml-0.5 shrink-0" />
                    </>
                  )}
                </button>
              </div>
              <div className="pt-4 border-t border-[#27272A] space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#F5B91B] shrink-0" />
                  <span>Free cancellation up to 6 hours before departure</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0" />
                  <span>No payment required right now</span>
                </div>
              </div>

              {/* WhatsApp Alternative */}
              <div className="pt-2">
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    `Hello Galle Taxi, I would like to book a taxi from ${pickup || 'Galle'} to ${destination || 'Airport'}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 rounded-lg bg-[#1F1F23] hover:bg-[#25252A] text-slate-200 border border-[#27272A] text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-[#25D366]" />
                  <span>Prefer WhatsApp Booking? Click Here</span>
                </a>
              </div>
            </div>
          </div>
        )}

        </form>

      </div>
    </div>
  );
};
