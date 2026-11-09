import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  MapPin,
  ArrowRight,
  Waves,
  Sparkles,
  MessageSquare,
  Car,
  Calendar,
  Settings,
} from 'lucide-react';
import { useApp } from '../lib/store';

export const SeasonalBannerSection: React.FC = () => {
  const { siteSettings, isAdminLoggedIn } = useApp();

  // If admin toggled banner off, do not display
  if (siteSettings.isSeasonalBannerVisible === false) {
    return null;
  }

  const bannerImg =
    siteSettings.seasonalBannerImageUrl &&
    siteSettings.seasonalBannerImageUrl !== '/assets/aistudio/Down_South_Season_Coastal_Adventures.png'
      ? siteSettings.seasonalBannerImageUrl
      : '/assets/images/regenerated_image_1794057460840.png';
  const bannerLink = siteSettings.seasonalBannerLink || '/general-taxi';
  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  const destinations = [
    { name: 'Galle Fort', desc: 'Historic Ramparts & Cafes', route: 'Galle Dutch Fort' },
    { name: 'Unawatuna', desc: 'Golden Beach & Peace Pagoda', route: 'Unawatuna Beach' },
    { name: 'Ahangama', desc: 'Surf Camps & Ocean Sunset', route: 'Ahangama' },
    { name: 'Weligama', desc: 'Surf Bay & Marriott Resort', route: 'Weligama Bay' },
    { name: 'Mirissa', desc: 'Coconut Tree Hill & Whales', route: 'Mirissa Beach / Weligama' },
  ];

  return (
    <section className="py-8 sm:py-12 bg-[#0E0E10] border-t border-b border-[#1F1F23] relative overflow-hidden">
      {/* Ambient tropical warm glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-[#F5B91B]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-10 w-96 h-96 bg-[#008080]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Strip - Centered within max-w-7xl with dark gradient backdrop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-[#141416]/95 via-[#141416]/80 to-[#141416]/60 p-4 sm:p-5 rounded-2xl border border-[#27272A] backdrop-blur-md shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#F5B91B]" />
              <span className="text-[11px] uppercase tracking-widest text-[#F5B91B] font-bold">
                Seasonal Coastal Campaign
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] tracking-tight [text-shadow:_0_2px_10px_rgba(0,0,0,0.9)]">
              {siteSettings.seasonalBannerTitle || 'Sri Lanka Down South Season'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 max-w-2xl leading-relaxed [text-shadow:_0_1px_6px_rgba(0,0,0,0.85)]">
              {siteSettings.seasonalBannerSubtitle ||
                'Sunny Beaches • Surf • Culture • Coastal Adventures — Explore Galle, Unawatuna, Ahangama, Mirissa & Weligama with our private chauffeur fleet.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
            {isAdminLoggedIn && (
              <Link
                to="/admin/content"
                className="px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1f1f23] text-slate-300 hover:text-[#F5B91B] border border-[#27272A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Edit this banner in Admin Dashboard"
              >
                <Settings className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Admin Edit Banner</span>
              </Link>
            )}

            <Link
              to={bannerLink}
              className="px-4 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#F5B91B]/20 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>Explore Coastal Rides</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Full Viewport Edge-to-Edge Banner Image with Gradient Overlays & Crisp Hero Text */}
      <div className="w-full relative overflow-hidden bg-[#141416] group">
        <Link to={bannerLink} className="block relative w-full overflow-hidden">
          <img
            src={bannerImg}
            alt="Down South Season Coastal Adventures Banner"
            className="w-full h-auto max-h-[85vh] min-h-[320px] object-cover object-center group-hover:scale-[1.01] transition-transform duration-700 ease-out"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes('regenerated_image_1794057460840.png')) {
                target.src = '/assets/images/regenerated_image_1794057460840.png';
              }
            }}
          />

          {/* Multi-layered subtle dark gradient overlays for enhanced contrast across the bright beach image */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/50 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

          {/* Hero Content Overlay on the Beach Banner Image */}
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-8 md:p-12 z-10 pointer-events-none">
            {/* Top Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-[#F5B91B]/40 text-[#F5B91B] text-xs font-bold tracking-wider uppercase shadow-xl">
                <Sparkles className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Peak Surf & Beach Weather Active Now</span>
              </div>
            </div>

            {/* Prominent Hero Title & Subtitle with subtle dark gradient backdrop & crisp text shadow */}
            <div className="max-w-2xl my-auto py-4">
              <div className="inline-block p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-black/75 via-black/55 to-black/30 backdrop-blur-sm border border-white/10 shadow-2xl space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white font-['Outfit'] tracking-tight leading-tight [text-shadow:_0_2px_12px_rgba(0,0,0,0.95),_0_4px_24px_rgba(0,0,0,0.85)]">
                  {siteSettings.seasonalBannerTitle || 'Sri Lanka Down South Season'}
                </h3>
                <p className="text-xs sm:text-sm md:text-base text-slate-100 font-medium leading-relaxed [text-shadow:_0_1px_8px_rgba(0,0,0,0.95),_0_2px_16px_rgba(0,0,0,0.85)] max-w-xl">
                  {siteSettings.seasonalBannerSubtitle ||
                    'Sunny Beaches • Surf • Culture • Coastal Adventures — Explore Galle, Unawatuna, Ahangama, Mirissa & Weligama with our private chauffeur fleet.'}
                </p>
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pointer-events-auto pt-2">
              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-white bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15 shadow-lg">
                <Waves className="w-4 h-4 text-[#F5B91B]" />
                <span>Unawatuna · Ahangama · Mirissa · Weligama</span>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <span className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-black/80 transition-transform group-hover:scale-105">
                  <span>Book Private Beach Taxi</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </span>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Interactive Southern Coast Destination Pills (Sliding Carousel on mobile, Grid on tablet/desktop) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative mt-6">
        {/* Mobile Swipe Cue */}
        <div className="flex sm:hidden items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[#F5B91B] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F5B91B] animate-pulse" />
            <span>Popular Beach Hubs</span>
          </div>
          <span className="text-[10px] text-slate-400 flex items-center gap-1">
            <span>Swipe to explore</span>
            <span>➔</span>
          </span>
        </div>

        {/* Sliding row on mobile screens (< sm), 3-col on tablet, 5-col grid on desktop */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 overflow-x-auto sm:overflow-x-visible snap-x snap-mandatory pb-2 sm:pb-0 scroll-smooth [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          {destinations.map((dest, idx) => (
            <Link
              key={idx}
              to={`/book?serviceType=TAXI+RIDE&pickup=Galle+Dutch+Fort&destination=${encodeURIComponent(dest.route)}`}
              className="w-[68vw] max-w-[240px] shrink-0 snap-start sm:w-auto sm:max-w-none sm:shrink p-3.5 sm:p-3 rounded-xl bg-[#141416] hover:bg-[#1A1A1E] border border-[#27272A] hover:border-[#F5B91B]/50 transition-all flex flex-col justify-between group shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white font-['Outfit'] group-hover:text-[#F5B91B] transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />
                  <span>{dest.name}</span>
                </span>
                <ArrowRight className="w-3 h-3 text-slate-500 group-hover:text-[#F5B91B] group-hover:translate-x-0.5 transition-all" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                {dest.desc}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
