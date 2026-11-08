import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  MapPin,
  Sparkles,
  PlaneTakeoff,
  PlaneLanding,
  Navigation,
  Car,
  Clock,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { formatLKR } from '../lib/fareEngine';
import { ToursSection } from '../components/ToursSection';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const { services, siteSettings, formatFare } = useApp();
  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-14">
        
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
            Premier Services
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Comprehensive Sri Lankan Travel
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
            Tailored Chauffeur & Taxi Services
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            From punctual Colombo airport transfers to bespoke hill country excursions, Galle Taxi provides premier chauffeur services across the entire island.
          </p>
        </div>

        {/* 3 CORE PILLARS: Airport Drop, Airport Pick Up, General Taxi */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Core Specialized Services
            </h2>
            <span className="text-xs text-slate-400">Dedicated Transfer Channels</span>
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
                    Departure Expressway Direct
                  </span>
                  <h3 className="text-xl font-bold text-white font-['Outfit']">
                    Airport Drop Service
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Door-to-door transfer from Galle & southern villas to Colombo Airport (CMB) via the Southern Expressway (E01) with prepaid toll clearance and luggage assistance.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#27272A] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>1h 45m – 2h 15m Highway Transit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>E01 Expressway Tolls Included</span>
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
                  Quick Reserve Drop
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
                  <h3 className="text-xl font-bold text-white font-['Outfit']">
                    Airport Pick Up Service
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1">
                    Warm arrival greeting inside the CMB airport terminal with a personalized nameboard. Includes live flight radar tracking with zero delay surcharge.
                  </p>
                </div>

                <div className="pt-2 space-y-2 border-t border-[#27272A] text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Automated Flight Radar Tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                    <span>Terminal Nameboard Welcome</span>
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
                  Quick Reserve Pick Up
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
                  <h3 className="text-xl font-bold text-white font-['Outfit']">
                    General Taxi & Rides
                  </h3>
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
                  Quick Reserve Taxi Ride
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section Heading for All Island Services */}
        <div className="pt-4 border-t border-[#1F1F23]">
          <div className="space-y-1 mb-8">
            <span className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Island-Wide Portfolio
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              All Chauffeur & Excursion Packages
            </h2>
          </div>
        </div>

        {/* Services List with Editorial Detail */}
        <div className="space-y-12">
          {services.map((srv, index) => {
            const isEven = index % 2 === 0;
            return (
              <div
                key={srv.id}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center hover:border-[#F5B91B]/40 transition-all p-6 sm:p-8"
              >
                {/* Visual */}
                <div className={`lg:col-span-5 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                  <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#1A1A1E] border border-[#27272A]">
                    <img
                      src={srv.imageUrl}
                      alt={srv.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-mono text-[#F5B91B] border border-[#27272A]">
                      Starting from {formatFare(srv.startingFromLkr)}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`lg:col-span-7 space-y-4 ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                  <div className="text-xs font-semibold text-[#F5B91B] uppercase tracking-wider">
                    Service 0{index + 1}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                    {srv.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#A1A1AA]">{srv.subtitle}</p>
                  <p className="text-slate-300 text-sm leading-relaxed">{srv.description}</p>

                  {/* Features */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                    {srv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to={`/book?service=${encodeURIComponent(srv.id)}`}
                      className="px-6 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-2 shadow-md transition-all"
                    >
                      <span>Book This Service</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <a
                      href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                        `Hello Galle Taxi, I'd like more details regarding your ${srv.title} service.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 rounded-xl bg-[#1F1F23] hover:bg-[#27272A] text-slate-200 border border-[#27272A] text-xs font-semibold transition-colors"
                    >
                      Inquire on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Private Day Tours Showcase */}
        <div className="pt-6">
          <ToursSection />
        </div>

      </div>
    </div>
  );
};
