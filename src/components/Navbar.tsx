import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu,
  X,
  Phone,
  MessageSquare,
  Car,
  Shield,
  ChevronDown,
  PlaneTakeoff,
  PlaneLanding,
  Navigation,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useApp } from '../lib/store';
import { CurrencySelector } from './CurrencySelector';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [hubsDropdownOpen, setHubsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const hubsDropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { siteSettings, isAdminLoggedIn, taxiHubs } = useApp();

  // Hidden Administrative Direct Route Shortcut (Ctrl+Shift+A or Cmd+Shift+A)
  useEffect(() => {
    const handleAdminHotkey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleAdminHotkey);
    return () => window.removeEventListener('keydown', handleAdminHotkey);
  }, [navigate]);

  const serviceItems = [
    {
      label: 'Airport Drop',
      path: '/airport-drop',
      desc: 'Galle / South Coast to Colombo (CMB) with tolls',
      icon: PlaneTakeoff,
    },
    {
      label: 'Airport Pick Up',
      path: '/airport-pickup',
      desc: 'CMB arrival lobby meet & greet with radar tracking',
      icon: PlaneLanding,
    },
    {
      label: 'General Taxi',
      path: '/general-taxi',
      desc: '24/7 on-demand coastal & inter-city rides',
      icon: Navigation,
    },
  ];

  // Derive taxi hubs dynamically from live CMS state
  const taxiHubItems =
    taxiHubs && Object.keys(taxiHubs).length > 0
      ? Object.values(taxiHubs).map((hub) => ({
          label: `${hub.townName} Taxi`,
          path: `/${hub.slug}`,
          badge: hub.badge,
          desc: hub.tagline,
        }))
      : [
          {
            label: 'Ahangama Taxi',
            path: '/ahangama-taxi',
            badge: 'Surf & Villas',
            desc: 'Kabalana The Rock, Midigama & cafes',
          },
          {
            label: 'Mirissa Taxi',
            path: '/mirissa-taxi',
            badge: 'Whales & Bay',
            desc: 'Whale tours, Coconut Tree Hill & beach',
          },
          {
            label: 'Unawatuna Taxi',
            path: '/unawatuna-taxi',
            badge: 'Jungle Beach',
            desc: 'Peace Pagoda, Dalawella & coral bay',
          },
          {
            label: 'Hikkaduwa Taxi',
            path: '/hikkaduwa-taxi',
            badge: 'Coral & Waves',
            desc: 'Marine sanctuary, sea turtles & surf',
          },
          {
            label: 'Bentota Taxi',
            path: '/bentota-taxi',
            badge: 'River & Luxury',
            desc: 'Bentota river safari & luxury resorts',
          },
          {
            label: 'Weligama Taxi',
            path: '/weligama-taxi',
            badge: 'Surf Bays',
            desc: 'Sand breaks, Marriott & coastal rides',
          },
        ];

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Services', path: '/services', hasDropdown: true },
    { label: 'Taxi Hubs', path: '#taxi-hubs', hasHubsDropdown: true },
    { label: 'Vehicles', path: '/vehicles' },
    { label: 'About', path: '/about' },
    { label: 'Track Booking', path: '/track-booking' },
    { label: 'Contact', path: '/contact' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const isServicesActive =
    location.pathname.startsWith('/services') ||
    location.pathname === '/airport-drop' ||
    location.pathname === '/airport-pickup' ||
    location.pathname === '/general-taxi';

  const isHubsActive =
    location.pathname === '/ahangama-taxi' ||
    location.pathname === '/mirissa-taxi' ||
    location.pathname === '/unawatuna-taxi' ||
    location.pathname === '/hikkaduwa-taxi' ||
    location.pathname === '/bentota-taxi' ||
    location.pathname === '/weligama-taxi';

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesDropdownOpen(false);
      }
      if (hubsDropdownRef.current && !hubsDropdownRef.current.contains(event.target as Node)) {
        setHubsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[#0B0B0D]/95 backdrop-blur-md border-b border-[#27272A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar 3-Zone Contract: Brand — 4-5 single line links — 1 primary action */}
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-8">
          
          {/* Zone 1: Single Brand Wordmark */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 text-left group shrink min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-[#F5B91B] to-[#D4980B] flex items-center justify-center text-black font-black text-lg sm:text-xl shadow-lg shadow-[#F5B91B]/20 group-hover:scale-105 transition-transform shrink-0">
              <Car className="w-4 h-4 sm:w-5 sm:h-5 text-[#0B0B0D]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-base sm:text-xl font-extrabold tracking-tight text-white font-['Outfit'] flex items-center gap-1 truncate">
                GALLE <span className="text-[#F5B91B]">TAXI</span>
              </span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-[#A1A1AA] font-semibold -mt-0.5 sm:-mt-1 truncate">
                Sri Lanka Chauffeur
              </span>
            </div>
          </Link>

          {/* Zone 2: Single-line Text Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium">
            {navLinks.map((link) => {
              if (link.hasDropdown) {
                return (
                  <div
                    key={link.path}
                    ref={dropdownRef}
                    className="relative"
                    onMouseEnter={() => setServicesDropdownOpen(true)}
                    onMouseLeave={() => setServicesDropdownOpen(false)}
                  >
                    <Link
                      to={link.path}
                      className={`whitespace-nowrap transition-colors duration-150 py-1 border-b-2 flex items-center gap-1 ${
                        isServicesActive
                          ? 'text-[#F5B91B] border-[#F5B91B] font-semibold'
                          : 'text-slate-300 border-transparent hover:text-white hover:border-[#F5B91B]/50'
                      }`}
                    >
                      <span>{link.label}</span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          servicesDropdownOpen ? 'rotate-180 text-[#F5B91B]' : 'text-slate-400'
                        }`}
                      />
                    </Link>

                    {/* Desktop Dropdown Panel */}
                    {servicesDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-72 bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl p-2 space-y-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        {serviceItems.map((item) => {
                          const Icon = item.icon;
                          const isCurrent = location.pathname === item.path;
                          return (
                            <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setServicesDropdownOpen(false)}
                              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                                isCurrent
                                  ? 'bg-[#F5B91B]/15 text-[#F5B91B]'
                                  : 'hover:bg-[#1A1A1E] text-slate-200 hover:text-white'
                              }`}
                            >
                              <div className="w-8 h-8 rounded-lg bg-[#0B0B0D] border border-[#27272A] flex items-center justify-center text-[#F5B91B] shrink-0 mt-0.5">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold leading-tight font-['Outfit']">
                                  {item.label}
                                </div>
                                <div className="text-[10px] text-slate-400 line-clamp-1 leading-normal">
                                  {item.desc}
                                </div>
                              </div>
                            </Link>
                          );
                        })}

                        <div className="pt-1.5 mt-1 border-t border-[#27272A]">
                          <Link
                            to="/services"
                            onClick={() => setServicesDropdownOpen(false)}
                            className="block px-3 py-1.5 text-center text-[11px] font-bold text-[#F5B91B] hover:text-[#E5A812] transition-colors"
                          >
                            View All Services & Day Tours →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              if (link.hasHubsDropdown) {
                return (
                  <div
                    key={link.label}
                    ref={hubsDropdownRef}
                    className="relative"
                    onMouseEnter={() => setHubsDropdownOpen(true)}
                    onMouseLeave={() => setHubsDropdownOpen(false)}
                  >
                    <button
                      type="button"
                      onClick={() => setHubsDropdownOpen(!hubsDropdownOpen)}
                      className={`whitespace-nowrap transition-colors duration-150 py-1 border-b-2 flex items-center gap-1 cursor-pointer bg-transparent ${
                        isHubsActive
                          ? 'text-[#F5B91B] border-[#F5B91B] font-semibold'
                          : 'text-slate-300 border-transparent hover:text-white hover:border-[#F5B91B]/50'
                      }`}
                    >
                      <span>{link.label}</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#F5B91B]/20 text-[#F5B91B] font-bold">
                        6 Towns
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform duration-200 ${
                          hubsDropdownOpen ? 'rotate-180 text-[#F5B91B]' : 'text-slate-400'
                        }`}
                      />
                    </button>

                    {/* Desktop Hubs Dropdown Panel */}
                    {hubsDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[440px] bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#27272A] px-1">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#F5B91B] flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Southern Coast Dedicated Hubs</span>
                          </div>
                          <span className="text-[10px] text-slate-400">24/7 Chauffeur Fleet</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          {taxiHubItems.map((hub) => {
                            const isCurrent = location.pathname === hub.path;
                            return (
                              <Link
                                key={hub.path}
                                to={hub.path}
                                onClick={() => setHubsDropdownOpen(false)}
                                className={`p-2.5 rounded-xl border transition-all flex flex-col justify-between group ${
                                  isCurrent
                                    ? 'bg-[#F5B91B]/15 border-[#F5B91B] text-[#F5B91B]'
                                    : 'bg-[#18181B] border-[#27272A] hover:border-[#F5B91B]/40 hover:bg-[#1E1E22] text-slate-200 hover:text-white'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center justify-between gap-1">
                                    <span className="text-xs font-bold font-['Outfit'] group-hover:text-[#F5B91B] transition-colors">
                                      {hub.label}
                                    </span>
                                    <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[#27272A] text-[#F5B91B] font-semibold shrink-0">
                                      {hub.badge}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                    {hub.desc}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>

                        <div className="pt-2 mt-2 border-t border-[#27272A] flex items-center justify-between px-1">
                          <span className="text-[10px] text-slate-400">Door-to-door hotels & villas</span>
                          <Link
                            to="/#taxi-hubs"
                            onClick={() => {
                              setHubsDropdownOpen(false);
                              const el = document.getElementById('taxi-hubs');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-[11px] font-bold text-[#F5B91B] hover:underline"
                          >
                            Explore Coastal Map & Hubs →
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`whitespace-nowrap transition-colors duration-150 py-1 border-b-2 ${
                    isActive(link.path)
                      ? 'text-[#F5B91B] border-[#F5B91B] font-semibold'
                      : 'text-slate-300 border-transparent hover:text-white hover:border-[#F5B91B]/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: Primary Action & Quick Connect */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {/* Currency Selector (LKR, USD, EUR, INR) */}
            <CurrencySelector variant="navbar" />

            <Link
              to="/book"
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-bold text-sm tracking-wide shadow-md shadow-[#F5B91B]/20 transition-all hover:shadow-[#F5B91B]/30 whitespace-nowrap"
            >
              <span>Book a Taxi</span>
            </Link>

            {isAdminLoggedIn && (
              <Link
                to="/admin"
                className="px-3 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-xs text-[#F5B91B] font-medium transition-colors"
                title="Go to Admin Dashboard"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Actions: Currency + Hamburger Toggle */}
          <div className="flex sm:hidden items-center gap-2 shrink-0">
            <CurrencySelector variant="navbar" className="shrink-0" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-[#171719] border border-[#27272A] cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#141416] border-b border-[#27272A] px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/') ? 'bg-[#F5B91B]/10 text-[#F5B91B] font-semibold' : 'text-slate-300 hover:bg-[#1F1F23] hover:text-white'
              }`}
            >
              Home
            </Link>

            {/* Dedicated Service Links on Mobile */}
            <div className="pt-1 pb-1 space-y-1 pl-2 border-l-2 border-[#F5B91B]/30 my-1">
              <Link
                to="/airport-drop"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  location.pathname === '/airport-drop' ? 'bg-[#F5B91B]/15 text-[#F5B91B]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <PlaneTakeoff className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Airport Drop (CMB)</span>
              </Link>
              <Link
                to="/airport-pickup"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  location.pathname === '/airport-pickup' ? 'bg-[#F5B91B]/15 text-[#F5B91B]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <PlaneLanding className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Airport Pick Up (Meet & Greet)</span>
              </Link>
              <Link
                to="/general-taxi"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  location.pathname === '/general-taxi' ? 'bg-[#F5B91B]/15 text-[#F5B91B]' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Navigation className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>General Taxi & Coastal Rides</span>
              </Link>
              <Link
                to="/services"
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-medium ${
                  location.pathname === '/services' ? 'text-[#F5B91B]' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Services & Day Tours →
              </Link>
            </div>

            {/* Southern Coast Taxi Hubs in Mobile Drawer */}
            <div className="pt-2 pb-2 px-1 border-l-2 border-[#F5B91B] my-2 bg-[#18181C]/60 rounded-r-xl">
              <div className="px-2 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#F5B91B] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Southern Coast Taxi Hubs</span>
                </span>
                <span className="text-[9px] font-mono text-slate-400">6 Towns</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 px-1">
                {taxiHubItems.map((hub) => (
                  <Link
                    key={hub.path}
                    to={hub.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-2.5 py-2 rounded-lg text-xs font-semibold flex flex-col transition-all border ${
                      location.pathname === hub.path
                        ? 'bg-[#F5B91B]/20 text-[#F5B91B] border-[#F5B91B]'
                        : 'bg-[#141416] text-slate-200 border-[#27272A] hover:border-[#F5B91B]/40'
                    }`}
                  >
                    <span className="truncate">{hub.label}</span>
                    <span className="text-[9px] text-[#F5B91B] font-mono truncate">{hub.badge}</span>
                  </Link>
                ))}
              </div>
            </div>

            <Link
              to="/vehicles"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/vehicles') ? 'bg-[#F5B91B]/10 text-[#F5B91B] font-semibold' : 'text-slate-300 hover:bg-[#1F1F23] hover:text-white'
              }`}
            >
              Vehicles
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/about') ? 'bg-[#F5B91B]/10 text-[#F5B91B] font-semibold' : 'text-slate-300 hover:bg-[#1F1F23] hover:text-white'
              }`}
            >
              About
            </Link>
            <Link
              to="/track-booking"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/track-booking') ? 'bg-[#F5B91B]/10 text-[#F5B91B] font-semibold' : 'text-slate-300 hover:bg-[#1F1F23] hover:text-white'
              }`}
            >
              Track Booking
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                isActive('/contact') ? 'bg-[#F5B91B]/10 text-[#F5B91B] font-semibold' : 'text-slate-300 hover:bg-[#1F1F23] hover:text-white'
              }`}
            >
              Contact
            </Link>
          </nav>
          
          <div className="pt-3 border-t border-[#27272A] flex flex-col gap-3">
            <CurrencySelector variant="mobile" />

            <a
              href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent('Hello Galle Taxi, I would like to book a ride.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1F1F23] text-slate-200 border border-[#27272A] text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Direct Booking</span>
            </a>
            <a
              href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`}
              className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-[#1F1F23] text-slate-200 border border-[#27272A] text-sm font-medium"
            >
              <Phone className="w-4 h-4 text-[#F5B91B]" />
              <span>{siteSettings.phone}</span>
            </a>
            {isAdminLoggedIn && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 py-2 text-xs text-[#F5B91B] hover:text-white"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
