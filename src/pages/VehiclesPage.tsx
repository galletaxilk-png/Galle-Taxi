import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Users, Briefcase, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, Sparkles, Wind } from 'lucide-react';
import { useApp } from '../lib/store';
import { formatLKR } from '../lib/fareEngine';
import {
  getActivePublicVehicles,
  getCategoryFallbackImage,
  normalizeVehicleImageUrl,
} from '../lib/vehicleHelpers';

export const VehiclesPage: React.FC = () => {
  const navigate = useNavigate();
  const { vehicles, isFirebaseActive, isPublicDataLoaded } = useApp();
  const publicVehicles = useMemo(() => getActivePublicVehicles(vehicles), [vehicles]);
  const isLoadingVehicles = publicVehicles.length === 0 && isFirebaseActive && !isPublicDataLoaded;

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
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
            Fleet Lineup
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Executive Fleet Standards
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
            Our Luxury Vehicles & Chauffeurs
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Spotless presentation, ice-cool climate control, and certified chauffeurs. Compare capacity and select the perfect vehicle for your journey.
          </p>
        </div>

        {/* Vehicle Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoadingVehicles ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`veh-page-skeleton-${idx}`}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden p-6 animate-pulse space-y-4"
              >
                <div className="aspect-[16/10] rounded-xl bg-[#1B1B1F]" />
                <div className="h-6 w-1/2 rounded bg-[#1F1F26]" />
                <div className="h-4 w-full rounded bg-[#1A1A1E]" />
                <div className="h-10 w-full rounded-xl bg-[#1F1F26]" />
              </div>
            ))
          ) : (
            publicVehicles.map((veh) => (
            <div
              key={veh.id}
              className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden hover:border-[#F5B91B]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-[#1B1B1F] rounded-t-2xl flex items-center justify-center p-4 border-b border-[#27272A]">
                  <img
                    src={normalizeVehicleImageUrl(veh.imageUrl, veh.category, veh.id, veh.name)}
                    alt={veh.name}
                    className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] transition-transform duration-300 hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.dataset.fallbackApplied) return;
                      target.dataset.fallbackApplied = 'true';
                      target.src = getCategoryFallbackImage(veh.category, veh.id, veh.name);
                    }}
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/80 backdrop-blur-md text-xs font-semibold text-[#F5B91B] border border-[#27272A]">
                    {veh.category}
                  </div>
                  <div className="absolute top-4 right-4 px-3 py-1 rounded bg-black/80 backdrop-blur-md text-xs font-mono text-emerald-400 border border-[#27272A]">
                    {veh.isAvailable ? 'Available Now' : 'Reserved'}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white font-['Outfit']">{veh.name}</h2>
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">{veh.description}</p>

                  {/* Capacities */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-[#1F1F23] text-xs text-slate-300">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[#F5B91B]" />
                      <span>{veh.passengers} Passengers</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-[#F5B91B]" />
                      <span>{veh.luggage} Suitcases</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="w-4 h-4 text-[#F5B91B]" />
                      <span>Dual Air-Con</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Included Amenities
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {veh.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Footer */}
              <div className="p-6 sm:p-8 pt-4 border-t border-[#1F1F23]">
                <Link
                  to={`/book?vehicleId=${encodeURIComponent(veh.id)}`}
                  className="w-full py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm tracking-wide shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
                >
                  <span>Book {veh.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
