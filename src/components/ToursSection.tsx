/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  Star,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Car,
} from 'lucide-react';
import { DayTourProduct } from '../lib/toursData';
import { useApp } from '../lib/store';
import { OptimizedImage } from './OptimizedImage';

export const ToursSection: React.FC = () => {
  const { currency, formatFare, tours, isFirebaseActive, isPublicDataLoaded } = useApp();
  const sliderRef = useRef<HTMLDivElement>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  // Filter only published tours for the public website
  const publishedTours = (tours || []).filter((t) => t.isPublished !== false);
  const isLoadingTours = publishedTours.length === 0 && isFirebaseActive && !isPublicDataLoaded;

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const { scrollLeft, offsetWidth } = sliderRef.current;
    if (offsetWidth > 0) {
      const card = sliderRef.current.firstElementChild as HTMLElement;
      const cardWidth = card ? card.offsetWidth + 20 : 305;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveSlide(Math.min(publishedTours.length - 1, Math.max(0, index)));
    }
  };

  const scrollToSlide = (idx: number) => {
    if (!sliderRef.current) return;
    const container = sliderRef.current;
    const cards = container.children;
    if (cards && cards[idx]) {
      (cards[idx] as HTMLElement).scrollIntoView({
        behavior: 'smooth',
        inline: 'start',
        block: 'nearest',
      });
      setActiveSlide(idx);
    }
  };

  // If loading from Firestore, show clean dark skeleton cards; if loaded and genuinely empty, hide section
  if (isLoadingTours) {
    return (
      <section className="py-16 lg:py-24 bg-[#0E0E10] border-t border-b border-[#1F1F23] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`tour-skeleton-${idx}`}
                className="bg-[#141416] border border-[#27272A] rounded-xl p-4 animate-pulse space-y-4"
              >
                <div className="aspect-[16/10] rounded-lg bg-[#1A1A1E]" />
                <div className="h-5 w-3/4 rounded bg-[#1F1F26]" />
                <div className="h-3 w-full rounded bg-[#1A1A1E]" />
                <div className="h-9 w-full rounded-lg bg-[#1F1F26]" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (publishedTours.length === 0) {
    return null;
  }

  // Convert USD starting price to the user's selected active currency
  const getStartingPrice = (tour: DayTourProduct) => {
    const prices = (tour.vehiclePrices || [])
      .map((v) => Number(v.priceUsd) || 0)
      .filter((p) => p > 0);
    const minUsd = prices.length > 0 ? Math.min(...prices) : 0;
    if (currency === 'USD') {
      return `$${minUsd}`;
    }
    const priceInLkr = minUsd * 310;
    return formatFare(priceInLkr);
  };

  return (
    <section className="py-16 lg:py-24 bg-[#0E0E10] border-t border-b border-[#1F1F23] relative overflow-hidden">
      {/* Subtle gold luxury ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-[#F5B91B]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Private Chauffeur Experiences</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
              Discover Sri Lanka – Private Day Tours from Galle
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              Explore Sri Lanka's most beautiful destinations with private transportation, experienced local drivers and flexible itineraries.
            </p>
          </div>

          {/* Desktop Slider Arrows */}
          <div className="hidden md:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide - 1)}
              disabled={activeSlide === 0}
              className="w-10 h-10 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#F5B91B]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              aria-label="Previous Tour"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSlide(activeSlide + 1)}
              disabled={activeSlide === publishedTours.length - 1}
              className="w-10 h-10 rounded-xl bg-[#141416] border border-[#27272A] flex items-center justify-center text-slate-300 hover:text-white hover:border-[#F5B91B]/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              aria-label="Next Tour"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Tour Carousel (Supports smooth swipe on touch and desktop scrolling) */}
        <div
          ref={sliderRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-6 pt-2 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          {publishedTours.map((tour, idx) => {
            const startingPriceFormatted = getStartingPrice(tour);

            return (
              <div
                key={tour.id}
                className="snap-start shrink-0 w-[70vw] sm:w-[285px] lg:w-[305px] bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/50 rounded-xl overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:-translate-y-1 group"
              >
                <div>
                  {/* Cinematic Photo with overlay badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0B0B0D]">
                    <OptimizedImage
                      src={tour.heroImage || '/assets/images/regenerated_image_1794057460840.webp'}
                      fallbackSrc="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80&fm=webp"
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                      {tour.badge && (
                        <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#F5B91B] border border-[#F5B91B]/40 uppercase tracking-wider">
                          {tour.badge}
                        </span>
                      )}
                      <div className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-white flex items-center gap-1 border border-slate-700 ml-auto">
                        <Star className="w-3 h-3 fill-[#F5B91B] text-[#F5B91B]" />
                        <span>{(tour.rating ?? 5.0).toFixed(2)}</span>
                        <span className="text-slate-400 font-normal">({tour.reviewCount ?? 0})</span>
                      </div>
                    </div>

                    {/* Duration badge at bottom left */}
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded-md bg-black/85 backdrop-blur-md text-[11px] font-semibold text-slate-200 border border-slate-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#F5B91B]" />
                        <span>{tour.duration || 'Full Day'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-4.5 space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <MapPin className="w-3 h-3 text-[#F5B91B] shrink-0" />
                        <span className="truncate">
                          Starts from {(tour.startingLocation || 'Galle, Sri Lanka').split(',')[0]}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white font-['Outfit'] leading-snug group-hover:text-[#F5B91B] transition-colors line-clamp-1">
                        {tour.title}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {tour.shortDescription}
                      </p>
                    </div>

                    {/* Highlights Preview */}
                    <div className="space-y-1 pt-2 border-t border-[#27272A]/70">
                      {(tour.highlights || []).slice(0, 3).map((hl, hlIdx) => (
                        <div key={hlIdx} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                          <CheckCircle2 className="w-3 h-3 text-[#F5B91B] shrink-0" />
                          <span className="truncate">{hl.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Vehicle Pricing Snippet */}
                    <div className="pt-2.5 border-t border-[#27272A]/70 flex items-center justify-between">
                      <div>
                        <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                          Private Vehicle From
                        </div>
                        <div className="text-lg font-extrabold text-[#F5B91B] font-['Outfit']">
                          {startingPriceFormatted}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 block font-medium">Per private car</span>
                        <span className="text-[9px] text-emerald-400 font-semibold flex items-center gap-0.5 justify-end">
                          <ShieldCheck className="w-2.5 h-2.5" />
                          <span>Not per person</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card CTA Actions */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <Link
                    to={`/tours/${tour.slug}`}
                    className="py-2 px-2 rounded-lg bg-[#1C1C20] hover:bg-[#27272A] text-slate-200 hover:text-white font-bold text-[11px] transition-colors flex items-center justify-center gap-1 border border-[#27272A]"
                  >
                    <span>Details</span>
                  </Link>
                  <Link
                    to={`/tours/${tour.slug}#booking`}
                    className="py-2 px-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-[11px] transition-all shadow-md flex items-center justify-center gap-1"
                  >
                    <span>Book Tour</span>
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Swipe Indicators & Arrows */}
        <div className="flex md:hidden items-center justify-between pt-4 px-2">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B91B] animate-pulse" />
            <span className="text-[11px] text-slate-400 font-medium">Swipe tours</span>
            <span className="font-mono text-[10px] text-slate-500">
              ({activeSlide + 1}/{publishedTours.length})
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {publishedTours.map((_, dotIdx) => (
              <button
                key={`tour-dot-${dotIdx}`}
                type="button"
                onClick={() => scrollToSlide(dotIdx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  activeSlide === dotIdx ? 'w-5 bg-[#F5B91B]' : 'w-1.5 bg-[#27272A]'
                }`}
                aria-label={`Slide to tour ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
