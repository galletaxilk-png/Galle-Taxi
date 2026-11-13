import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Phone, Mail, MapPin, Clock, MessageSquare, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../lib/store';

export const Footer: React.FC = () => {
  const { siteSettings, isAdminLoggedIn, taxiHubs } = useApp();
  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  const CORE_HUB_ORDER = [
    'ahangama-taxi',
    'mirissa-taxi',
    'unawatuna-taxi',
    'hikkaduwa-taxi',
    'bentota-taxi',
    'weligama-taxi',
  ];

  const liveHubLinks = Object.values(taxiHubs || {})
    .sort((a, b) => {
      const aIdx = CORE_HUB_ORDER.indexOf(a.id || a.slug);
      const bIdx = CORE_HUB_ORDER.indexOf(b.id || b.slug);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return (a.townName || '').localeCompare(b.townName || '');
    })
    .map((hub) => ({
      name: `${hub.townName} Taxi`,
      path: `/${hub.slug}`,
    }));

  const hubLinksToRender =
    liveHubLinks.length > 0
      ? liveHubLinks
      : [
          { name: 'Ahangama Taxi', path: '/ahangama-taxi' },
          { name: 'Mirissa Taxi', path: '/mirissa-taxi' },
          { name: 'Unawatuna Taxi', path: '/unawatuna-taxi' },
          { name: 'Hikkaduwa Taxi', path: '/hikkaduwa-taxi' },
          { name: 'Bentota Taxi', path: '/bentota-taxi' },
          { name: 'Weligama Taxi', path: '/weligama-taxi' },
        ];

  return (
    <footer className="bg-[#070709] border-t border-[#1F1F23] text-slate-400 text-sm">
      {/* Top Banner Accent */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Col 1 & 2: Brand Information */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5 text-left">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#F5B91B] to-[#D4980B] flex items-center justify-center text-black font-black text-xl shadow-md">
                <Car className="w-5 h-5 text-[#0B0B0D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white font-['Outfit']">
                  GALLE <span className="text-[#F5B91B]">TAXI</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#A1A1AA] font-semibold -mt-1">
                  Southern Chauffeur Services
                </span>
              </div>
            </Link>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Sri Lanka's premier private taxi and executive chauffeur network. Operating 24/7 from historic Galle Fort, connecting visitors and locals with comfortable airport transfers, scenic tours, and island-wide travel.
            </p>

            <div className="pt-2 flex flex-col gap-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#F5B91B] shrink-0" />
                <span>{siteSettings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#F5B91B] shrink-0" />
                <span>{siteSettings.operatingHours}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#F5B91B] shrink-0" />
                <span>Government Licensed & Insured Fleet</span>
              </div>
            </div>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              Quick Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/book" className="hover:text-[#F5B91B] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#F5B91B]" />
                  <span>Book a Taxi</span>
                </Link>
              </li>
              <li>
                <Link to="/track-booking" className="hover:text-[#F5B91B] transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3 h-3 text-[#F5B91B]" />
                  <span>Track Your Ride</span>
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#F5B91B] transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/vehicles" className="hover:text-[#F5B91B] transition-colors">
                  Fleet & Vehicles
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#F5B91B] transition-colors">
                  About Our Team
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#F5B91B] transition-colors">
                  Contact & Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Popular Services */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              Transfers & Services
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/airport-drop" className="hover:text-[#F5B91B] transition-colors">
                  Airport Drop (To CMB)
                </Link>
              </li>
              <li>
                <Link to="/airport-pickup" className="hover:text-[#F5B91B] transition-colors">
                  Airport Pick Up (Meet & Greet)
                </Link>
              </li>
              <li>
                <Link to="/general-taxi" className="hover:text-[#F5B91B] transition-colors">
                  General Taxi & Coastal Rides
                </Link>
              </li>
              <li>
                <Link to="/tours/galle-south-coast-discovery" className="hover:text-[#F5B91B] transition-colors">
                  Galle Dutch Fort Heritage Tour
                </Link>
              </li>
              <li>
                <Link to="/general-taxi" className="hover:text-[#F5B91B] transition-colors">
                  Mirissa & Weligama Surf Transfers
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-[#F5B91B] transition-colors">
                  Ella & Hill Country Private Tours
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: 24/7 Dispatch */}
          <div className="space-y-3">
            <h4 className="text-white font-bold text-sm tracking-wider uppercase font-['Outfit']">
              24/7 Dispatch
            </h4>
            <p className="text-xs text-slate-400">
              Need immediate pickup in Galle or airport coordination? Reach our dispatcher directly:
            </p>
            <div className="space-y-2 pt-1">
              <a
                href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] hover:border-[#F5B91B]/60 text-white text-xs font-semibold transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>{siteSettings.phone}</span>
              </a>

              <a
                href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                  'Hello Galle Taxi, I need an immediate pickup or booking in Galle.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] hover:border-[#25D366]/60 text-white text-xs font-semibold transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp: {siteSettings.whatsappNumber}</span>
              </a>

              <a
                href={`mailto:${siteSettings.email}`}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] hover:border-[#EA4335]/60 text-white text-xs font-semibold transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-[#EA4335]" />
                <span className="truncate">{siteSettings.email}</span>
              </a>

              {isAdminLoggedIn && (
                <div className="pt-2">
                  <Link
                    to="/admin"
                    className="text-[11px] text-[#F5B91B] hover:text-white transition-colors underline underline-offset-4 flex items-center gap-1"
                  >
                    <span>Dispatcher Console</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Coastal Hubs & Dedicated Town Taxis */}
        <div className="mt-12 pt-8 border-t border-[#1F1F23]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <span className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
              Southern Coast Taxi Hubs
            </span>
            <span className="text-xs text-slate-500">
              24/7 Door-to-Door Hotel, Villa & Beach Surf Chauffeurs
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            {hubLinksToRender.map((hubLink) => (
              <Link
                key={hubLink.path}
                to={hubLink.path}
                className="p-2.5 rounded-lg bg-[#141416] hover:bg-[#1E1E22] border border-[#27272A] hover:border-[#F5B91B]/40 text-slate-300 hover:text-white transition-all flex items-center justify-between group"
              >
                <span>{hubLink.name}</span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-[#F5B91B] transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-8 border-t border-[#1F1F23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} Galle Taxi. All rights reserved. Sri Lanka Tourism Chauffeur Network.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors py-1">
              Privacy Policy
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/terms" className="hover:text-white transition-colors py-1">
              Terms & Conditions
            </Link>
            <span aria-hidden="true">·</span>
            <Link to="/track-booking" className="hover:text-white transition-colors py-1">
              Track Ride
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
