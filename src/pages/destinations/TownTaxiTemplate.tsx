/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
  ExternalLink,
  Shield,
  PlaneTakeoff,
  Waves,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { CurrencySelector } from '../../components/CurrencySelector';
import { TownTaxiConfig, TOWNS_DATA } from './townData';
import { OptimizedImage } from '../../components/OptimizedImage';

interface TownTaxiTemplateProps {
  town: TownTaxiConfig;
}

export const TownTaxiTemplate: React.FC<TownTaxiTemplateProps> = ({ town: initialTown }) => {
  const { siteSettings, formatFare, currency, taxiHubs } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const town =
    taxiHubs?.[initialTown.id] ||
    taxiHubs?.[initialTown.slug] ||
    initialTown;

  const normalizedHeroImage = town.heroImage?.startsWith('/src/assets/images/')
    ? town.heroImage.replace('/src/assets/images/', '/assets/images/')
    : town.heroImage;

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  // Calculate pricing conversion if currency is USD
  const renderPrice = (lkrAmount: number) => {
    if (currency === 'USD') {
      const usdAmount = Math.round(lkrAmount / 310);
      return `$${usdAmount}`;
    }
    return formatFare(lkrAmount);
  };

  const otherTowns = Object.values(taxiHubs && Object.keys(taxiHubs).length > 0 ? taxiHubs : TOWNS_DATA).filter((t) => t.id !== town.id);

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-100">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-[#1F1F23]">
        {/* Background photo */}
        <div className="absolute inset-0 z-0">
          <OptimizedImage
            src={normalizedHeroImage}
            fallbackSrc="/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp"
            alt={`${town.townName} Taxi Sri Lanka`}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0D] via-[#0B0B0D]/90 to-[#0B0B0D]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0D] via-transparent to-[#0B0B0D]/80" />
        </div>

        {/* Ambient Warm Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none z-[1]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Breadcrumb & Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="text-xs text-slate-400 hover:text-[#F5B91B] transition-colors">
              Home
            </Link>
            <span className="text-slate-600 text-xs">/</span>
            <Link to="/services" className="text-xs text-slate-400 hover:text-[#F5B91B] transition-colors">
              Services
            </Link>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs text-[#F5B91B] font-semibold">{town.townName} Taxi</span>

            <div className="ml-auto hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{town.badge}</span>
            </div>
          </div>

          <div className="max-w-4xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141416]/90 border border-[#27272A] text-slate-300 text-xs font-mono">
              <MapPin className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span>{town.townName}, Southern Province, Sri Lanka</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] font-['Outfit']">
              {town.heroHeadline}{' '}
              <span className="text-[#F5B91B]">{town.heroHighlight}</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-3xl font-light leading-relaxed">
              {town.tagline}
            </p>

            {/* Distance Chips */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="px-3.5 py-2 rounded-xl bg-[#141416]/90 border border-[#27272A] text-xs text-slate-300 flex items-center gap-2">
                <PlaneTakeoff className="w-4 h-4 text-[#F5B91B]" />
                <span>To CMB Airport: <strong className="text-white">{town.distanceToAirport}</strong></span>
              </div>
              <div className="px-3.5 py-2 rounded-xl bg-[#141416]/90 border border-[#27272A] text-xs text-slate-300 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-[#F5B91B]" />
                <span>To Galle Fort: <strong className="text-white">{town.distanceToGalle}</strong></span>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 pt-4 w-full sm:w-auto">
              <Link
                to={`/book?pickup=${encodeURIComponent(town.defaultPickup)}&destination=${encodeURIComponent(
                  town.defaultDestination
                )}&serviceType=TAXI+RIDE`}
                className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm tracking-wide shadow-lg shadow-[#F5B91B]/20 transition-all flex items-center gap-2 cursor-pointer transform hover:-translate-y-0.5"
              >
                <span>Book {town.townName} Taxi Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  `Hi Galle Taxi, I would like to inquire about taxi service in ${town.townName}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto justify-center px-5 py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#25D366]/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>WhatsApp Dispatch</span>
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* 2. POPULAR ROUTES & FIXED RATES TABLE */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Transparent Fixed Rates
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Popular Taxi Transfers from {town.townName}
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              All quotes are 100% private door-to-door, including vehicle fuel, English-speaking driver allowance, and Southern Expressway (E01) highway tolls where applicable.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-slate-400 font-medium">Currency:</span>
            <CurrencySelector variant="segmented" />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1A1A1E] text-xs uppercase tracking-wider text-slate-400 border-b border-[#27272A]">
                <tr>
                  <th className="py-4 px-4 font-semibold">Route & Destination</th>
                  <th className="py-4 px-3 font-semibold">Distance</th>
                  <th className="py-4 px-3 font-semibold">Duration</th>
                  <th className="py-4 px-3 font-semibold text-right">SEDAN CAR (4 Pax)</th>
                  <th className="py-4 px-3 font-semibold text-right">SUV CAR (4 Pax)</th>
                  <th className="py-4 px-3 font-semibold text-right">KDH FLAT ROOF (8 Pax)</th>
                  <th className="py-4 px-3 font-semibold text-right">KDH HIGH ROOF (10 Pax)</th>
                  <th className="py-4 px-4 text-center">Instant Booking</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F23]">
                {town.popularRoutes.map((r, idx) => (
                  <tr key={idx} className="hover:bg-[#1B1B1F] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">
                        {r.from} <span className="text-[#F5B91B]">⇄</span> {r.to}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{r.highlight}</div>
                    </td>
                    <td className="py-4 px-3 font-mono text-xs text-slate-300">
                      {r.distanceKm} km
                    </td>
                    <td className="py-4 px-3 text-xs text-slate-300">
                      <div className="flex items-center gap-1 text-[#F5B91B]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{r.duration}</span>
                      </div>
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-bold text-white">
                      {renderPrice(r.sedanLkr)}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-bold text-slate-200">
                      {renderPrice(r.suvLkr)}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-bold text-slate-200">
                      {renderPrice(r.vanLkr)}
                    </td>
                    <td className="py-4 px-3 text-right font-mono text-sm font-bold text-slate-200">
                      {renderPrice(Math.round(r.vanLkr * 1.15))}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Link
                        to={`/book?pickup=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(
                          r.to
                        )}&serviceType=TAXI+RIDE`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-semibold transition-colors"
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

        {/* Mobile Route Cards View */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {town.popularRoutes.map((r, idx) => (
            <div
              key={idx}
              className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 space-y-3 shadow-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-extrabold text-white text-base font-['Outfit']">
                  {r.from} <span className="text-[#F5B91B]">⇄</span> {r.to}
                </h3>
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#F5B91B]/15 text-[#F5B91B] border border-[#F5B91B]/30 shrink-0">
                  {r.distanceKm} km
                </span>
              </div>
              <p className="text-xs text-slate-400">{r.highlight}</p>
              
              <div className="flex items-center gap-2 text-xs text-[#F5B91B]">
                <Clock className="w-3.5 h-3.5" />
                <span>{r.duration}</span>
                <span className="text-slate-600">·</span>
                <span className="text-emerald-400 text-[11px]">Highway Tolls Included</span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1F1F23]">
                <div className="p-2 rounded-lg bg-[#0B0B0D] border border-[#27272A] col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-300 font-semibold uppercase">SEDAN CAR</span>
                    <div className="font-mono text-xs font-bold text-white">{renderPrice(r.sedanLkr)}</div>
                  </div>
                </div>
                <div className="p-2 rounded-lg bg-[#0B0B0D] border border-[#27272A]">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">SUV CAR</div>
                  <div className="font-mono text-xs font-bold text-slate-200 mt-0.5">{renderPrice(r.suvLkr)}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0B0B0D] border border-[#27272A]">
                  <div className="text-[10px] text-slate-400 font-semibold uppercase">KDH FLAT ROOF</div>
                  <div className="font-mono text-xs font-bold text-slate-200 mt-0.5">{renderPrice(r.vanLkr)}</div>
                </div>
                <div className="p-2 rounded-lg bg-[#0B0B0D] border border-[#27272A] col-span-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">KDH HIGH ROOF</span>
                    <span className="font-mono text-xs font-bold text-slate-200">{renderPrice(Math.round(r.vanLkr * 1.15))}</span>
                  </div>
                </div>
              </div>

              <Link
                to={`/book?pickup=${encodeURIComponent(r.from)}&destination=${encodeURIComponent(
                  r.to
                )}&serviceType=TAXI+RIDE`}
                className="w-full py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Book This Route</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ABOUT THE SERVICE & LOCAL CONTEXT */}
      <section className="py-16 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-2">
                <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
                  Local Knowledge & Professional Fleet
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                  {town.aboutTitle}
                </h2>
              </div>

              <div className="space-y-4 text-slate-300 text-sm leading-relaxed">
                {town.aboutText.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <div className="text-[#F5B91B] font-extrabold text-lg sm:text-xl font-['Outfit']">24/7</div>
                  <div className="text-xs text-slate-400">On-Demand Dispatch</div>
                </div>
                <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] space-y-1">
                  <div className="text-[#F5B91B] font-extrabold text-lg sm:text-xl font-['Outfit']">E01</div>
                  <div className="text-xs text-slate-400">Expressway Tolls Included</div>
                </div>
                <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] space-y-1 col-span-2 sm:col-span-1">
                  <div className="text-[#F5B91B] font-extrabold text-lg sm:text-xl font-['Outfit']">100%</div>
                  <div className="text-xs text-slate-400">Private Air-Conditioned</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
              <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#F5B91B]" />
                <span>The Galle Taxi Guarantee</span>
              </h3>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Fixed Guaranteed Rates</strong>
                    No meter surprises, surge pricing, or hidden toll surcharges.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Flight Radar Delay Tracking</strong>
                    For CMB airport pickups, we track your incoming flight and adjust pickup time automatically.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Surfboard & Luggage Friendly</strong>
                    Our fleet easily accommodates board bags, dive gear, and international check-in suitcases.
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Licensed English-Speaking Chauffeurs</strong>
                    Courteous, verified drivers trained in safe driving and international hospitality.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to={`/book?pickup=${encodeURIComponent(town.defaultPickup)}&destination=${encodeURIComponent(
                    town.defaultDestination
                  )}&serviceType=TAXI+RIDE`}
                  className="w-full py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md"
                >
                  <span>Book {town.townName} Transfer</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. LOCAL ATTRACTIONS IN THIS DESTINATION */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-2 mb-10 max-w-2xl">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Explore {town.townName}
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Top Attractions & Points of Interest
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            Our chauffeurs know every hidden beach, scenic photo spot, and coastal landmark in and around {town.townName}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {town.attractions.map((att, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/40 transition-all space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#F5B91B]/15 text-[#F5B91B] border border-[#F5B91B]/30 uppercase">
                  {att.category}
                </span>
                <h3 className="text-base font-bold text-white font-['Outfit'] group-hover:text-[#F5B91B] transition-colors">
                  {att.name}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {att.description}
                </p>
              </div>

              <Link
                to={`/book?pickup=${encodeURIComponent(town.defaultPickup)}&destination=${encodeURIComponent(
                  att.name
                )}&serviceType=TAXI+RIDE`}
                className="text-xs font-semibold text-[#F5B91B] hover:underline flex items-center gap-1 pt-2"
              >
                <span>Ride here</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FREQUENTLY ASKED QUESTIONS */}
      <section className="py-16 bg-[#0E0E10] border-t border-b border-[#1F1F23]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Got Questions?
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              {town.townName} Taxi FAQs
            </h2>
          </div>

          <div className="space-y-3">
            {town.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-[#27272A] bg-[#141416] overflow-hidden transition-all"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span className="text-sm font-bold text-white font-['Outfit']">
                      {faq.question}
                    </span>
                    <span className="shrink-0 text-[#F5B91B]">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-slate-300 border-t border-[#1F1F23] pt-3 leading-relaxed">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. OTHER COASTAL TAXI HUBS NAVIGATION */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Explore More Towns
            </div>
            <h3 className="text-xl font-extrabold text-white font-['Outfit']">
              Other Southern Coast Taxi Hubs
            </h3>
          </div>
          <Link
            to="/general-taxi"
            className="text-xs text-[#F5B91B] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>All General Taxi Services</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {otherTowns.map((ot) => (
            <Link
              key={ot.id}
              to={`/${ot.slug}`}
              className="p-4 rounded-xl bg-[#141416] hover:bg-[#1A1A1E] border border-[#27272A] hover:border-[#F5B91B]/50 transition-all space-y-1 group"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white group-hover:text-[#F5B91B] transition-colors font-['Outfit']">
                  {ot.townName} Taxi
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#F5B91B] transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="text-[11px] text-slate-400 truncate">
                {ot.badge}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. BOTTOM STICKY/CALLOUT DISPATCH BAR */}
      <div className="bg-[#141416] border-t border-[#27272A] py-8 px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <h3 className="text-lg sm:text-xl font-extrabold text-white font-['Outfit']">
            Need a Quick Ride in {town.townName}?
          </h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Our 24/7 chauffeur hotline and WhatsApp dispatch are always active. Get confirmed rates and immediate vehicle arrival.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            to={`/book?pickup=${encodeURIComponent(town.defaultPickup)}&destination=${encodeURIComponent(
              town.defaultDestination
            )}&serviceType=TAXI+RIDE`}
            className="px-6 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md"
          >
            Instant Online Booking
          </Link>

          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
              `Hi Galle Taxi, I need a taxi in ${town.townName}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-current" />
            <span>Chat on WhatsApp</span>
          </a>

          <a
            href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`}
            className="px-5 py-2.5 rounded-xl bg-[#0B0B0D] hover:bg-[#1A1A1E] text-slate-200 border border-[#27272A] text-xs font-semibold flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5 text-[#F5B91B]" />
            <span>Call {siteSettings.phone}</span>
          </a>
        </div>
      </div>

    </div>
  );
};
