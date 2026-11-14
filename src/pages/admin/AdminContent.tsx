import React, { useState, useEffect } from 'react';
import {
  FileEdit,
  Save,
  CheckCircle2,
  MessageSquare,
  Phone,
  MapPin,
  Globe,
  Image as ImageIcon,
  Sun,
  Eye,
  EyeOff,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { SiteSettings } from '../../types';
import { ImageUploader } from '../../components/admin/ImageUploader';

const DEFAULT_SEASONAL_BANNER = '/assets/images/regenerated_image_1794057460840.webp';

export const AdminContent: React.FC = () => {
  const { siteSettings, updateSiteSettings } = useApp();

  const [businessName, setBusinessName] = useState(siteSettings.businessName);
  const [tagline, setTagline] = useState(siteSettings.tagline);
  const [phone, setPhone] = useState(siteSettings.phone);
  const [whatsappNumber, setWhatsappNumber] = useState(siteSettings.whatsappNumber);
  const [email, setEmail] = useState(siteSettings.email);
  const [address, setAddress] = useState(siteSettings.address);
  const [operatingHours, setOperatingHours] = useState(siteSettings.operatingHours);
  const [heroHeadline, setHeroHeadline] = useState(siteSettings.heroHeadline);
  const [heroSubtitle, setHeroSubtitle] = useState(siteSettings.heroSubtitle);
  const [heroImageUrl, setHeroImageUrl] = useState(siteSettings.heroImageUrl);
  const [aboutStory, setAboutStory] = useState(siteSettings.aboutStory);
  const [announcement, setAnnouncement] = useState(siteSettings.announcement || '');

  // Seasonal Campaign Banner state
  const [seasonalBannerImageUrl, setSeasonalBannerImageUrl] = useState(
    siteSettings.seasonalBannerImageUrl && siteSettings.seasonalBannerImageUrl !== '/assets/aistudio/Down_South_Season_Coastal_Adventures.png'
      ? siteSettings.seasonalBannerImageUrl
      : DEFAULT_SEASONAL_BANNER
  );
  const [seasonalBannerTitle, setSeasonalBannerTitle] = useState(
    siteSettings.seasonalBannerTitle || 'Sri Lanka Down South Season'
  );
  const [seasonalBannerSubtitle, setSeasonalBannerSubtitle] = useState(
    siteSettings.seasonalBannerSubtitle ||
      'Sunny Beaches • Surf • Culture • Coastal Adventures — Explore Galle, Unawatuna, Ahangama, Mirissa & Weligama with our private chauffeur fleet.'
  );
  const [seasonalBannerLink, setSeasonalBannerLink] = useState(
    siteSettings.seasonalBannerLink || '/general-taxi'
  );
  const [isSeasonalBannerVisible, setIsSeasonalBannerVisible] = useState(
    siteSettings.isSeasonalBannerVisible !== false
  );

  const [saved, setSaved] = useState(false);

  // Sync form inputs when live Firestore siteSettings updates arrive
  useEffect(() => {
    setBusinessName(siteSettings.businessName);
    setTagline(siteSettings.tagline);
    setPhone(siteSettings.phone);
    setWhatsappNumber(siteSettings.whatsappNumber);
    setEmail(siteSettings.email);
    setAddress(siteSettings.address);
    setOperatingHours(siteSettings.operatingHours);
    setHeroHeadline(siteSettings.heroHeadline);
    setHeroSubtitle(siteSettings.heroSubtitle);
    setHeroImageUrl(siteSettings.heroImageUrl);
    setAboutStory(siteSettings.aboutStory);
    setAnnouncement(siteSettings.announcement || '');
    if (siteSettings.seasonalBannerImageUrl) {
      setSeasonalBannerImageUrl(siteSettings.seasonalBannerImageUrl);
    }
    if (siteSettings.seasonalBannerTitle !== undefined) {
      setSeasonalBannerTitle(siteSettings.seasonalBannerTitle);
    }
    if (siteSettings.seasonalBannerSubtitle !== undefined) {
      setSeasonalBannerSubtitle(siteSettings.seasonalBannerSubtitle);
    }
    if (siteSettings.seasonalBannerLink !== undefined) {
      setSeasonalBannerLink(siteSettings.seasonalBannerLink);
    }
    setIsSeasonalBannerVisible(siteSettings.isSeasonalBannerVisible !== false);
  }, [siteSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated: SiteSettings = {
      businessName,
      tagline,
      phone,
      whatsappNumber,
      email,
      address,
      operatingHours,
      heroHeadline,
      heroSubtitle,
      heroImageUrl,
      aboutStory,
      announcement,
      seasonalBannerImageUrl,
      seasonalBannerTitle,
      seasonalBannerSubtitle,
      seasonalBannerLink,
      isSeasonalBannerVisible,
    };
    await updateSiteSettings(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleResetSeasonalBanner = () => {
    setSeasonalBannerImageUrl(DEFAULT_SEASONAL_BANNER);
    setSeasonalBannerTitle('Sri Lanka Down South Season');
    setSeasonalBannerSubtitle(
      'Sunny Beaches • Surf • Culture • Coastal Adventures — Explore Galle, Unawatuna, Ahangama, Mirissa & Weligama with our private chauffeur fleet.'
    );
    setSeasonalBannerLink('/general-taxi');
    setIsSeasonalBannerVisible(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Website Content Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Modify customer-facing headlines, hero imagery, 24/7 hotline numbers, and company story in real time.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="px-5 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Save className="w-4 h-4" />
          <span>Publish Content</span>
        </button>
      </div>

      {saved && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Website content published successfully! Changes are live across all customer pages.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Homepage & Hero: 7 cols */}
        <div className="lg:col-span-7 bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#F5B91B]" />
            <span>Homepage & Hero Copy</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Hero Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                required
                className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Hero Subtitle</label>
              <textarea
                rows={3}
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
              />
            </div>

            <div className="space-y-1.5 pt-2 border-t border-[#27272A]/70">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Homepage Hero Banner Image</span>
              </label>
              <p className="text-[11px] text-slate-400">
                This image appears prominently across the top of the homepage behind the headline and booking widget.
              </p>
              <div className="mt-2">
                <ImageUploader
                  value={heroImageUrl}
                  onChange={(newUrl) => setHeroImageUrl(newUrl)}
                  label="Homepage Hero Image"
                  aspectRatio="video"
                  placeholderText="Upload or enter hero image URL..."
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Announcement Bar Text</label>
              <input
                type="text"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">About Us Narrative</label>
              <textarea
                rows={4}
                value={aboutStory}
                onChange={(e) => setAboutStory(e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Contact & Channels: 5 cols */}
        <div className="lg:col-span-5 bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#F5B91B]" />
            <span>Contact & Dispatch Channels</span>
          </h2>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">24/7 Telephone Hotline</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">WhatsApp Dispatch Number</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Headquarters Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Operating Hours</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                required
                className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Full-width Column: Seasonal Campaign Banner (Down South Season) */}
        <div className="lg:col-span-12 bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] text-[11px] font-bold">
                <Sparkles className="w-3 h-3 text-[#F5B91B]" />
                <span>Homepage Campaign Feature</span>
              </div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#F5B91B]" />
                <span>Down South Seasonal Campaign Banner</span>
              </h2>
              <p className="text-xs text-slate-400">
                Configure the promotional banner (Sunset, Surf &amp; Beaches) displayed on the homepage to spotlight coastal rides, surf tours, and private transfers.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsSeasonalBannerVisible(!isSeasonalBannerVisible)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  isSeasonalBannerVisible
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {isSeasonalBannerVisible ? (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Banner Visible (Active)</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Banner Hidden</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResetSeasonalBanner}
                className="px-3 py-1.5 rounded-xl bg-[#1A1A1E] hover:bg-[#27272A] text-slate-300 hover:text-white border border-[#27272A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset to uploaded Sri Lanka sunset surf banner"
              >
                <RotateCcw className="w-3 h-3 text-[#F5B91B]" />
                <span>Reset to Default</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Banner Headline</label>
                <input
                  type="text"
                  value={seasonalBannerTitle}
                  onChange={(e) => setSeasonalBannerTitle(e.target.value)}
                  placeholder="e.g. Sri Lanka Down South Season"
                  className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Banner Subtitle / Description</label>
                <textarea
                  rows={3}
                  value={seasonalBannerSubtitle}
                  onChange={(e) => setSeasonalBannerSubtitle(e.target.value)}
                  placeholder="Describe the coastal adventure, surf highlights, and locations..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Call to Action Destination Link</label>
                <input
                  type="text"
                  value={seasonalBannerLink}
                  onChange={(e) => setSeasonalBannerLink(e.target.value)}
                  placeholder="/general-taxi or /tours or /book"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono"
                />
                <span className="text-[11px] text-slate-500 block">
                  Where users are directed when clicking the banner or exploration button (e.g., /general-taxi, /airport-drop, /book).
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Banner Image Artwork (Upload / Presets / URL)</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Upload any new banner image file or select from presets. It immediately reflects on the live site upon publishing.
              </p>
              <div className="mt-2">
                <ImageUploader
                  value={seasonalBannerImageUrl}
                  onChange={(newUrl) => setSeasonalBannerImageUrl(newUrl)}
                  label="Seasonal Campaign Banner Artwork"
                  aspectRatio="wide"
                  placeholderText="Upload your custom banner image, choose preset, or enter URL..."
                />
              </div>
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};
