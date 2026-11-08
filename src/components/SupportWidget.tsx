import React, { useState, useRef, useEffect } from 'react';
import { Headphones, MessageCircle, Mail, Phone, Calendar, X, ChevronRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../lib/store';

export const SupportWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const { siteSettings } = useApp();

  const cleanWhatsApp = (siteSettings?.whatsappNumber || '+94771234567').replace(/[^0-9]/g, '');
  const cleanPhone = (siteSettings?.phone || '+94 77 123 4567').replace(/[^0-9+]/g, '');
  const displayPhone = siteSettings?.phone || '+94 77 123 4567';
  const displayEmail = siteSettings?.email || 'support@galletaxi.lk';
  const whatsappPreFilledText = encodeURIComponent(
    'Hello Galle Taxi, I would like 24/7 assistance with a taxi booking / airport transfer.'
  );

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <aside
      ref={widgetRef}
      aria-label="Customer Support"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* Pop-up Support Menu */}
      <div
        className={`absolute bottom-14 right-0 sm:bottom-16 w-[310px] sm:w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-[#141416]/95 backdrop-blur-xl border border-[#27272A] p-4 sm:p-5 shadow-2xl shadow-black/80 transition-all duration-300 origin-bottom-right ${
          isOpen
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 translate-y-3 pointer-events-none'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#27272A]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#F5B91B] to-[#C68A04] flex items-center justify-center text-black shadow-md shadow-[#F5B91B]/20">
              <Headphones className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-white font-['Outfit'] tracking-wide">
                  Galle Taxi Support
                </h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-semibold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live 24/7
                </span>
              </div>
              <p className="text-[11px] text-[#A1A1AA]">Express customer concierge</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close Support Menu"
            className="w-7 h-7 rounded-lg bg-[#1F1F23] hover:bg-[#27272A] text-[#A1A1AA] hover:text-white flex items-center justify-center transition-colors border border-[#27272A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Support Options List */}
        <div className="space-y-2">
          {/* 1. WhatsApp Chat */}
          <a
            href={`https://wa.me/${cleanWhatsApp}?text=${whatsappPreFilledText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-between p-3 rounded-xl bg-[#1C1C20] hover:bg-[#232328] border border-[#27272A] hover:border-[#25D366]/50 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-105 transition-transform">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white group-hover:text-[#25D366] transition-colors">
                    1. WhatsApp Chat
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#25D366]/20 text-[#25D366]">
                    Instant
                  </span>
                </div>
                <p className="text-[11px] text-[#A1A1AA] truncate">
                  Chat with dispatch team
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#25D366] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </a>

          {/* 2. Email Support */}
          <a
            href={`mailto:${displayEmail}?subject=Galle%20Taxi%20Inquiry%20-%20Customer%20Support`}
            onClick={() => setIsOpen(false)}
            className="group flex items-center justify-between p-3 rounded-xl bg-[#1C1C20] hover:bg-[#232328] border border-[#27272A] hover:border-[#F5B91B]/50 transition-all duration-200"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#F5B91B]/15 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B] shrink-0 group-hover:scale-105 transition-transform">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <span className="text-xs font-semibold text-white group-hover:text-[#F5B91B] transition-colors block">
                  2. Email Support
                </span>
                <p className="text-[11px] text-[#A1A1AA] truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#71717A] group-hover:text-[#F5B91B] group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
          </a>

          {/* 3. Booking Assistance */}
          <div className="p-3 rounded-xl bg-gradient-to-b from-[#1C1C20] to-[#18181B] border border-[#27272A] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B91B]" />
                3. Booking Assistance
              </span>
              <span className="text-[10px] text-[#A1A1AA] font-mono">24/7 Dispatch</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              {/* Direct Call */}
              <a
                href={`tel:${cleanPhone}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-[#27272A] hover:bg-[#323238] border border-[#3F3F46] text-[11px] font-semibold text-white hover:text-[#F5B91B] transition-colors"
              >
                <Phone className="w-3 h-3 text-[#F5B91B]" />
                Call Now
              </a>

              {/* Instant Book */}
              <Link
                to="/book"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-gradient-to-r from-[#F5B91B] to-[#D4970B] hover:brightness-110 text-[11px] font-bold text-black transition-all shadow-sm"
              >
                <Calendar className="w-3 h-3" />
                Book Ride
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-3 pt-2.5 border-t border-[#27272A]/70 text-center">
          <p className="text-[10px] text-[#71717A] tracking-tight">
            Airport Transfers & Southern Coast Chauffeurs Available
          </p>
        </div>
      </div>

      {/* Main Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="group relative flex items-center gap-2 sm:gap-2.5 pl-3.5 pr-4 py-2.5 rounded-full bg-gradient-to-r from-[#F5B91B] via-[#E5A812] to-[#D4970B] text-black font-bold text-xs sm:text-sm shadow-xl shadow-black/60 hover:shadow-2xl hover:shadow-[#F5B91B]/20 border border-[#FFE27A]/50 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#F5B91B]/50"
      >
        {/* Notification indicator */}
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 border border-white/50" />
        </span>

        {/* Headset Icon */}
        <div className="w-5 h-5 rounded-full bg-black/10 flex items-center justify-center group-hover:rotate-12 transition-transform shrink-0">
          <Headphones className="w-3.5 h-3.5 text-black" />
        </div>

        {/* Label */}
        <span className="tracking-wide font-['Outfit'] font-bold text-black whitespace-nowrap">
          24/7 Support
        </span>
      </button>
    </aside>
  );
};
