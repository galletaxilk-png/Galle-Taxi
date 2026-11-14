/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Car,
  DollarSign,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Compass,
  FileText,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  X,
  Navigation,
  Image as ImageIcon,
  Upload,
  Camera,
  Check,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { TownTaxiConfig, TownRoute, TownAttraction, TownFaq } from '../../types';
import { OptimizedImage } from '../../components/OptimizedImage';

export const SOUTHERN_HUB_IMAGE_PRESETS = [
  {
    label: 'Ahangama Surf Coast Hub (Sunset & Surfboards)',
    url: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.webp',
    town: 'Ahangama',
    tag: 'Uploaded Official',
  },
  {
    label: 'Mirissa Sunset Road Trip with Surfboard',
    url: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.webp',
    town: 'Mirissa',
    tag: 'Whales & Bay',
  },
  {
    label: 'Down South Coastal Adventures & Palm Bays',
    url: '/assets/aistudio/Down_South_Season_Coastal_Adventures.webp',
    town: 'Unawatuna / Weligama',
    tag: 'Beach Bay',
  },
  {
    label: 'Galle Fort Coastal & Lighthouse Ocean Road',
    url: '/assets/images/service_galle_tour_1793121943026.webp',
    town: 'Galle / Hikkaduwa',
    tag: 'Heritage Fort',
  },
  {
    label: 'Colombo Highway & Expressway Fleet Transfer',
    url: '/assets/images/service_airport_transfer_1793121941979.webp',
    town: 'Bentota / Highway',
    tag: 'Expressway',
  },
  {
    label: 'Galle Oceanfront Palm Beach Highway',
    url: '/assets/images/hero_galle_taxi_1793121940996.webp',
    town: 'Southern Coast',
    tag: 'Ocean Drive',
  },
];

export const AdminTaxiHubs: React.FC = () => {
  const { taxiHubs, updateTaxiHub, resetTaxiHubs, uploadHubImage, formatFare } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHubKey, setSelectedHubKey] = useState<string | null>(null);
  const [editingHub, setEditingHub] = useState<TownTaxiConfig | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'media' | 'about' | 'routes' | 'attractions' | 'faqs'>('general');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dedicated Hub Image Management States
  const [viewMode, setViewMode] = useState<'grid' | 'media'>('grid');
  const [quickImageHubKey, setQuickImageHubKey] = useState<string | null>(null);
  const [uploadingHubKey, setUploadingHubKey] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<{ hubKey: string; message: string } | null>(null);

  const handleDirectImageUpload = async (hubKey: string, file: File) => {
    if (!file) return;
    setUploadingHubKey(hubKey);
    try {
      const url = await uploadHubImage(file, hubKey);
      await updateTaxiHub(hubKey, { heroImage: url });
      setSaveNotice({ hubKey, message: 'Image successfully uploaded and saved live to Firebase!' });
      setTimeout(() => setSaveNotice(null), 3500);
      if (editingHub && selectedHubKey === hubKey) {
        setEditingHub({ ...editingHub, heroImage: url });
      }
    } catch (err: any) {
      console.error('Failed to upload hub image:', err);
      alert('Failed to upload image. Please check file format.');
    } finally {
      setUploadingHubKey(null);
    }
  };

  const handleApplyPresetImage = async (hubKey: string, imageUrl: string) => {
    setUploadingHubKey(hubKey);
    try {
      await updateTaxiHub(hubKey, { heroImage: imageUrl });
      setSaveNotice({ hubKey, message: 'Preset image saved live to Firebase & website!' });
      setTimeout(() => setSaveNotice(null), 3000);
      if (editingHub && selectedHubKey === hubKey) {
        setEditingHub({ ...editingHub, heroImage: imageUrl });
      }
    } catch (err) {
      console.error('Failed to apply preset image:', err);
    } finally {
      setUploadingHubKey(null);
    }
  };

  const hubsList = Object.entries(taxiHubs || {}).map(([key, data]) => ({
    key,
    ...data,
  }));

  const filteredHubs = hubsList.filter(
    (h) =>
      h.townName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.tagline?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenEdit = (key: string) => {
    const hub = taxiHubs[key];
    if (!hub) return;
    setSelectedHubKey(key);
    // Deep clone to avoid mutating state directly in form
    setEditingHub(JSON.parse(JSON.stringify(hub)));
    setActiveTab('general');
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHubKey || !editingHub) return;

    setIsSaving(true);
    try {
      await updateTaxiHub(selectedHubKey, editingHub);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update hub:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    if (window.confirm('Are you sure you want to restore all Southern Coast Taxi Hubs to default system values? This will overwrite manual rate and description edits.')) {
      await resetTaxiHubs();
      if (selectedHubKey && taxiHubs[selectedHubKey]) {
        setEditingHub(JSON.parse(JSON.stringify(taxiHubs[selectedHubKey])));
      }
    }
  };

  // Route Helpers
  const handleAddRoute = () => {
    if (!editingHub) return;
    const newRoute: TownRoute = {
      from: `${editingHub.townName} Central`,
      to: 'Bandaranaike International Airport (CMB)',
      distanceKm: 160,
      duration: '2h 15m',
      sedanLkr: 22000,
      vanLkr: 26000,
      suvLkr: 30000,
      highlight: 'Expressway tolls included',
    };
    setEditingHub({
      ...editingHub,
      popularRoutes: [...editingHub.popularRoutes, newRoute],
    });
  };

  const handleRemoveRoute = (index: number) => {
    if (!editingHub) return;
    const nextRoutes = editingHub.popularRoutes.filter((_, idx) => idx !== index);
    setEditingHub({
      ...editingHub,
      popularRoutes: nextRoutes,
    });
  };

  const handleRouteFieldChange = (index: number, field: keyof TownRoute, val: any) => {
    if (!editingHub) return;
    const nextRoutes = [...editingHub.popularRoutes];
    nextRoutes[index] = {
      ...nextRoutes[index],
      [field]: val,
    };
    setEditingHub({
      ...editingHub,
      popularRoutes: nextRoutes,
    });
  };

  // Attraction Helpers
  const handleAddAttraction = () => {
    if (!editingHub) return;
    const newAttraction: TownAttraction = {
      name: 'New Attraction',
      category: 'Beach & Sightseeing',
      description: 'Describe this scenic location or popular stop for travelers.',
    };
    setEditingHub({
      ...editingHub,
      attractions: [...(editingHub.attractions || []), newAttraction],
    });
  };

  const handleRemoveAttraction = (index: number) => {
    if (!editingHub) return;
    setEditingHub({
      ...editingHub,
      attractions: editingHub.attractions.filter((_, idx) => idx !== index),
    });
  };

  // FAQ Helpers
  const handleAddFaq = () => {
    if (!editingHub) return;
    const newFaq: TownFaq = {
      question: 'Frequently Asked Question about taxi service?',
      answer: 'Clear and detailed answer with pricing, luggage, and timing info.',
    };
    setEditingHub({
      ...editingHub,
      faqs: [...(editingHub.faqs || []), newFaq],
    });
  };

  const handleRemoveFaq = (index: number) => {
    if (!editingHub) return;
    setEditingHub({
      ...editingHub,
      faqs: editingHub.faqs.filter((_, idx) => idx !== index),
    });
  };

  // About paragraphs helpers
  const handleAboutTextChange = (index: number, val: string) => {
    if (!editingHub) return;
    const next = [...editingHub.aboutText];
    next[index] = val;
    setEditingHub({
      ...editingHub,
      aboutText: next,
    });
  };

  const handleAddAboutParagraph = () => {
    if (!editingHub) return;
    setEditingHub({
      ...editingHub,
      aboutText: [...editingHub.aboutText, 'New description paragraph highlighting chauffeur reliability, vehicle features, or local knowledge.'],
    });
  };

  const handleRemoveAboutParagraph = (index: number) => {
    if (!editingHub) return;
    setEditingHub({
      ...editingHub,
      aboutText: editingHub.aboutText.filter((_, idx) => idx !== index),
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-[#F5B91B]" />
            <h1 className="text-2xl font-extrabold text-white font-['Outfit']">
              Southern Coast Taxi Hubs CMS
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage all town descriptions, page titles, hero headers, vehicle rates (Sedan, VIP Van, SUV), popular routes, and local FAQs for Ahangama, Mirissa, Unawatuna, Hikkaduwa, Bentota, and Weligama.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/#taxi-hubs"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-200 hover:text-white border border-[#27272A] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#F5B91B]" />
            <span>View Hubs on Site</span>
          </Link>
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 rounded-xl bg-[#141416] hover:bg-[#1E1E22] text-slate-400 hover:text-amber-400 border border-[#27272A] text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Restore all default town configs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>
      </div>

      {/* View Mode Toggle & Search Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-xl bg-[#141416] border border-[#27272A] self-start">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Overview & Fares</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('media')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'media'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>Hub Images & Media Studio</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hubs by town, badge, or keyword..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#141416] border border-[#27272A] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B]"
          />
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveNotice.message}</span>
        </div>
      )}

      {/* VIEW MODE 1: STANDARD OVERVIEW & FARES GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHubs.map((hub) => {
            const mainRoute = hub.popularRoutes?.[0];
            return (
              <div
                key={hub.key}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-lg hover:border-[#F5B91B]/40 transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Visual Header with Change Photo Action */}
                  <div className="relative h-40 bg-[#1A1A1E] overflow-hidden group/img">
                    <OptimizedImage
                      src={hub.heroImage}
                      fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                      alt={hub.townName}
                      className="w-full h-full object-cover opacity-85 group-hover/img:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-black/50 pointer-events-none" />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-md bg-[#0B0B0D]/90 backdrop-blur-md border border-[#F5B91B]/40 text-[#F5B91B] text-[10px] font-bold uppercase tracking-wider">
                        {hub.badge}
                      </span>
                    </div>

                    {/* Change Photo Overlay Button */}
                    <button
                      type="button"
                      onClick={() => setQuickImageHubKey(hub.key)}
                      className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-[#0B0B0D]/90 hover:bg-[#F5B91B] hover:text-black text-slate-200 text-[10px] font-bold border border-white/20 transition-all flex items-center gap-1 backdrop-blur-sm cursor-pointer shadow-md"
                      title="Update Hub Photo"
                    >
                      <Camera className="w-3 h-3 text-[#F5B91B] group-hover:text-black" />
                      <span>Change Photo</span>
                    </button>

                    <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300">
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        <MapPin className="w-3 h-3 text-[#F5B91B]" />
                        {hub.distanceToGalle}
                      </span>
                      <span className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                        <Navigation className="w-3 h-3 text-[#F5B91B]" />
                        {hub.distanceToAirport?.split('·')?.[0]?.trim()}
                      </span>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center justify-between">
                        <span>{hub.townName} Taxi</span>
                        <span className="text-[10px] font-mono font-medium text-slate-500">/{hub.slug}</span>
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {hub.tagline}
                      </p>
                    </div>

                    {/* Pricing Overview */}
                    {mainRoute && (
                      <div className="p-2.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
                          <span>{mainRoute.to}</span>
                          <span className="text-emerald-400 font-mono">{mainRoute.duration}</span>
                        </div>
                        <div className="flex items-baseline justify-between pt-0.5">
                          <div className="text-xs font-bold text-white font-mono">
                            {formatFare(mainRoute.sedanLkr)} <span className="text-[9px] font-normal text-slate-400">Sedan</span>
                          </div>
                          <div className="text-xs font-bold text-[#F5B91B] font-mono">
                            {formatFare(mainRoute.vanLkr)} <span className="text-[9px] font-normal text-slate-400">VIP Van</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1F1F23]">
                      <span>{hub.popularRoutes?.length || 0} Routes Configured</span>
                      <span>·</span>
                      <span>{hub.attractions?.length || 0} Sights</span>
                      <span>·</span>
                      <span>{hub.faqs?.length || 0} FAQs</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-4 pt-0 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickImageHubKey(hub.key)}
                    className="py-2 px-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-200 hover:text-white border border-[#27272A] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    title="Change Photo"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(hub.key)}
                    className="py-2 px-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Hub</span>
                  </button>
                  <Link
                    to={`/${hub.slug}`}
                    target="_blank"
                    className="py-2 px-2 rounded-xl bg-[#141416] hover:bg-[#1E1E22] text-slate-300 hover:text-white border border-[#27272A] text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                    <span>Live</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: DEDICATED HUB IMAGES & MEDIA STUDIO */}
      {viewMode === 'media' && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#F5B91B]" />
                <span>Southern Coast Hubs - Image Gallery & Media Studio</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload new photos from device, paste web URLs, or pick from curated Sri Lanka beach presets. All changes save live to Firebase.
              </p>
            </div>
            <span className="text-xs font-mono text-[#F5B91B] bg-[#F5B91B]/10 px-3 py-1 rounded-full border border-[#F5B91B]/30 self-start sm:self-auto">
              Live Website Sync Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHubs.map((hub) => (
              <div
                key={`media-${hub.key}`}
                className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl p-4 sm:p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white font-['Outfit']">
                        {hub.townName} Taxi
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">/{hub.slug}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#0B0B0D] text-[#F5B91B] text-[10px] font-bold border border-[#F5B91B]/30 uppercase">
                      {hub.badge}
                    </span>
                  </div>

                  {/* Large 16:9 Image Preview */}
                  <div className="relative h-44 rounded-xl overflow-hidden bg-[#1A1A1E] border border-[#27272A] group">
                    <OptimizedImage
                      src={hub.heroImage}
                      fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                      alt={hub.townName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between text-xs text-slate-200">
                      <span className="text-[11px] font-bold text-white font-mono truncate max-w-[180px]">
                        {hub.townName} Banner
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuickImageHubKey(hub.key)}
                        className="px-2 py-0.5 rounded bg-[#F5B91B] text-black text-[10px] font-extrabold flex items-center gap-1 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                      >
                        <Camera className="w-3 h-3" />
                        <span>Edit Photo</span>
                      </button>
                    </div>
                  </div>

                  {/* Upload Dropzone */}
                  <div>
                    <label className="border border-dashed border-[#27272A] hover:border-[#F5B91B]/60 bg-[#0B0B0D] hover:bg-[#121216] rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center">
                      {uploadingHubKey === hub.key ? (
                        <div className="flex items-center gap-2 text-xs text-[#F5B91B] font-bold">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading & Saving to Firebase...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-300">
                          <Upload className="w-4 h-4 text-[#F5B91B]" />
                          <span className="font-semibold text-white">Upload New Photo</span>
                          <span className="text-slate-500 text-[10px]">(PNG/JPG/WEBP)</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        disabled={uploadingHubKey === hub.key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file) handleDirectImageUpload(hub.key, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* Quick Coastal Presets */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Quick Coastal Presets:
                    </span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {SOUTHERN_HUB_IMAGE_PRESETS.slice(0, 3).map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => handleApplyPresetImage(hub.key, preset.url)}
                          className={`p-1 rounded-lg border text-left text-[9.5px] truncate transition-colors cursor-pointer ${
                            hub.heroImage === preset.url
                              ? 'bg-[#F5B91B]/15 text-[#F5B91B] border-[#F5B91B]'
                              : 'bg-[#0B0B0D] text-slate-400 border-[#27272A] hover:border-slate-500'
                          }`}
                          title={preset.label}
                        >
                          <span className="block font-bold text-white truncate">{preset.town}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="pt-2 border-t border-[#1F1F23] flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px]">
                    {hub.heroImage}
                  </span>
                  <Link
                    to={`/${hub.slug}`}
                    target="_blank"
                    className="text-xs text-[#F5B91B] hover:underline font-semibold flex items-center gap-1"
                  >
                    <span>Preview Live</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EDIT MODAL DIALOG */}
      {editingHub && selectedHubKey && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#27272A] flex items-center justify-between bg-[#111114]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F5B91B]/15 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B]">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white font-['Outfit']">
                    Edit {editingHub.townName} Taxi Hub
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">
                    /{editingHub.slug} · Real-time Dynamic Sync
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved Live!</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setEditingHub(null);
                    setSelectedHubKey(null);
                  }}
                  className="w-8 h-8 rounded-lg bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="px-5 border-b border-[#27272A] bg-[#0E0E10] flex gap-2 overflow-x-auto [scrollbar-width:none]">
              {[
                { id: 'general', label: 'General & Hero', icon: Sparkles },
                { id: 'media', label: 'Hub Image & Banners', icon: ImageIcon },
                { id: 'about', label: 'About Story', icon: FileText },
                { id: 'routes', label: `Popular Routes & Rates (${editingHub.popularRoutes?.length || 0})`, icon: DollarSign },
                { id: 'attractions', label: `Attractions (${editingHub.attractions?.length || 0})`, icon: Compass },
                { id: 'faqs', label: `FAQs (${editingHub.faqs?.length || 0})`, icon: HelpCircle },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-3 px-3 text-xs font-bold border-b-2 whitespace-nowrap flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'text-[#F5B91B] border-[#F5B91B]'
                        : 'text-slate-400 border-transparent hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              {/* TAB 1: GENERAL & HERO */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Town Name
                      </label>
                      <input
                        type="text"
                        value={editingHub.townName}
                        onChange={(e) => setEditingHub({ ...editingHub, townName: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Category Badge
                      </label>
                      <input
                        type="text"
                        value={editingHub.badge}
                        onChange={(e) => setEditingHub({ ...editingHub, badge: e.target.value })}
                        placeholder="e.g. Sri Lanka Surf Coast Hub"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      SEO Page Title
                    </label>
                    <input
                      type="text"
                      value={editingHub.pageTitle}
                      onChange={(e) => setEditingHub({ ...editingHub, pageTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Hero Headline Intro
                      </label>
                      <input
                        type="text"
                        value={editingHub.heroHeadline}
                        onChange={(e) => setEditingHub({ ...editingHub, heroHeadline: e.target.value })}
                        placeholder="e.g. Reliable Private Taxi in"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Hero Highlighted Gold Text
                      </label>
                      <input
                        type="text"
                        value={editingHub.heroHighlight}
                        onChange={(e) => setEditingHub({ ...editingHub, heroHighlight: e.target.value })}
                        placeholder="e.g. Ahangama & Kabalana"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-[#F5B91B] font-bold focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      Tagline / Lead Summary
                    </label>
                    <textarea
                      rows={2}
                      value={editingHub.tagline}
                      onChange={(e) => setEditingHub({ ...editingHub, tagline: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Distance to Galle Fort
                      </label>
                      <input
                        type="text"
                        value={editingHub.distanceToGalle}
                        onChange={(e) => setEditingHub({ ...editingHub, distanceToGalle: e.target.value })}
                        placeholder="e.g. 21 km · Approx. 30 Mins via coastal A2 road"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Distance to Colombo Airport (CMB)
                      </label>
                      <input
                        type="text"
                        value={editingHub.distanceToAirport}
                        onChange={(e) => setEditingHub({ ...editingHub, distanceToAirport: e.target.value })}
                        placeholder="e.g. 165 km · Approx. 2h 15m via E01 Expressway"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Default Pickup Point
                      </label>
                      <input
                        type="text"
                        value={editingHub.defaultPickup}
                        onChange={(e) => setEditingHub({ ...editingHub, defaultPickup: e.target.value })}
                        placeholder="e.g. Ahangama Beach"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                        Default Destination Point
                      </label>
                      <input
                        type="text"
                        value={editingHub.defaultDestination}
                        onChange={(e) => setEditingHub({ ...editingHub, defaultDestination: e.target.value })}
                        placeholder="e.g. Bandaranaike International Airport (CMB)"
                        className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  {/* Hero Image Field & Quick Presets */}
                  <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-[#F5B91B]" />
                        <span>Hero Banner Image</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setActiveTab('media')}
                        className="text-xs text-[#F5B91B] hover:underline font-semibold cursor-pointer"
                      >
                        Open Full Media Studio →
                      </button>
                    </div>

                    {/* Preview Thumbnail */}
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <div className="relative h-24 w-44 rounded-lg overflow-hidden bg-[#1A1A1E] border border-[#27272A] shrink-0">
                        <OptimizedImage
                          src={editingHub.heroImage}
                          fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                          alt={editingHub.townName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2 w-full">
                        <label className="border border-dashed border-[#27272A] hover:border-[#F5B91B]/60 bg-[#141416] hover:bg-[#18181D] rounded-xl px-3 py-2 flex items-center justify-center gap-2 cursor-pointer transition-colors text-center w-full">
                          {uploadingHubKey === selectedHubKey ? (
                            <div className="flex items-center gap-2 text-xs text-[#F5B91B] font-bold">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Uploading to Firebase...</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-xs text-slate-300">
                              <Upload className="w-3.5 h-3.5 text-[#F5B91B]" />
                              <span className="font-semibold text-white">Upload New Photo</span>
                              <span className="text-slate-500 text-[10px]">(PNG/JPG/WEBP)</span>
                            </div>
                          )}
                          <input
                            type="file"
                            accept="image/*,.png,.jpg,.jpeg,.webp"
                            className="hidden"
                            disabled={uploadingHubKey === selectedHubKey}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (file && selectedHubKey) handleDirectImageUpload(selectedHubKey, file);
                            }}
                          />
                        </label>
                        <input
                          type="text"
                          value={editingHub.heroImage}
                          onChange={(e) => setEditingHub({ ...editingHub, heroImage: e.target.value })}
                          placeholder="Paste image URL here..."
                          className="w-full px-2.5 py-1.5 rounded-lg bg-[#141416] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                        />
                      </div>
                    </div>

                    {/* Presets Grid */}
                    <div className="pt-2 border-t border-[#1F1F23]">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                        Southern Coast Hub Presets:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                        {SOUTHERN_HUB_IMAGE_PRESETS.map((preset) => (
                          <button
                            key={preset.url}
                            type="button"
                            onClick={() => setEditingHub({ ...editingHub, heroImage: preset.url })}
                            className={`p-1.5 rounded-lg border text-left flex items-center gap-2 transition-colors cursor-pointer ${
                              editingHub.heroImage === preset.url
                                ? 'bg-[#F5B91B]/20 text-[#F5B91B] border-[#F5B91B]'
                                : 'bg-[#141416] text-slate-300 border-[#27272A] hover:border-slate-500'
                            }`}
                          >
                            <OptimizedImage
                              src={preset.url}
                              fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                              alt={preset.label}
                              className="w-8 h-8 rounded object-cover shrink-0"
                            />
                            <div className="truncate">
                              <span className="text-[10px] font-bold block truncate">{preset.town}</span>
                              <span className="text-[8.5px] text-slate-400 block truncate">{preset.tag}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: MEDIA & IMAGES */}
              {activeTab === 'media' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-[#F5B91B]" />
                      <span>Hub Hero Banner Image & Media Studio</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      This photo is displayed on the main website Southern Coast Hubs grid, town booking header, and social preview cards for {editingHub.townName}.
                    </p>
                  </div>

                  {/* Large 16:9 Banner Preview */}
                  <div className="relative h-56 sm:h-64 rounded-2xl overflow-hidden bg-[#1A1A1E] border border-[#27272A] shadow-inner">
                    <OptimizedImage
                      src={editingHub.heroImage}
                      fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                      alt={editingHub.townName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded bg-[#0B0B0D]/90 backdrop-blur-md border border-[#F5B91B]/40 text-[#F5B91B] text-xs font-bold uppercase tracking-wider">
                        {editingHub.badge || `${editingHub.townName} Taxi Hub`}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs">
                      <div>
                        <h4 className="font-extrabold text-white text-base font-['Outfit']">
                          {editingHub.townName} Taxi Sri Lanka
                        </h4>
                        <span className="text-slate-300 text-xs">{editingHub.tagline}</span>
                      </div>
                      <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-1 rounded bg-black/70 text-emerald-400 border border-emerald-500/30">
                        Live Preview
                      </span>
                    </div>
                  </div>

                  {/* Upload Dropzone */}
                  <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Upload Custom Photo from Device
                    </label>
                    <label className="border-2 border-dashed border-[#27272A] hover:border-[#F5B91B]/60 bg-[#141416] hover:bg-[#18181D] rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                      <div className="w-12 h-12 rounded-full bg-[#1F1F24] flex items-center justify-center text-[#F5B91B]">
                        {uploadingHubKey === selectedHubKey ? (
                          <Loader2 className="w-6 h-6 animate-spin text-[#F5B91B]" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <span className="text-sm font-bold text-white">Click or drag a photo here to upload</span>
                        <p className="text-xs text-slate-400 mt-1">
                          Supports PNG, JPG, or WEBP up to 25MB. Files are automatically compressed &amp; converted to WebP before saving.
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        disabled={uploadingHubKey === selectedHubKey}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          e.target.value = '';
                          if (file && selectedHubKey) handleDirectImageUpload(selectedHubKey, file);
                        }}
                      />
                    </label>
                  </div>

                  {/* URL Input */}
                  <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Or Set Image URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={editingHub.heroImage}
                        onChange={(e) => setEditingHub({ ...editingHub, heroImage: e.target.value })}
                        placeholder="https://... or /assets/..."
                        className="flex-1 px-3 py-2 rounded-xl bg-[#141416] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  {/* Presets Gallery */}
                  <div className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Curated Southern Coast Presets
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {SOUTHERN_HUB_IMAGE_PRESETS.map((preset) => (
                        <button
                          key={preset.url}
                          type="button"
                          onClick={() => setEditingHub({ ...editingHub, heroImage: preset.url })}
                          className={`rounded-xl overflow-hidden border text-left transition-all cursor-pointer ${
                            editingHub.heroImage === preset.url
                              ? 'border-[#F5B91B] ring-2 ring-[#F5B91B]/40 shadow-lg'
                              : 'border-[#27272A] hover:border-slate-500 bg-[#141416]'
                          }`}
                        >
                          <div className="h-24 w-full overflow-hidden bg-[#1A1A1E]">
                            <OptimizedImage
                              src={preset.url}
                              fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                              alt={preset.label}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-2">
                            <span className="text-xs font-bold text-white block truncate">{preset.town}</span>
                            <span className="text-[10px] text-slate-400 block truncate">{preset.tag}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ABOUT STORY & PARAGRAPHS */}
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                      About Section Title
                    </label>
                    <input
                      type="text"
                      value={editingHub.aboutTitle}
                      onChange={(e) => setEditingHub({ ...editingHub, aboutTitle: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        About Story Paragraphs
                      </label>
                      <button
                        type="button"
                        onClick={handleAddAboutParagraph}
                        className="text-xs text-[#F5B91B] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Paragraph</span>
                      </button>
                    </div>

                    {editingHub.aboutText?.map((p, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-bold text-slate-400">
                            Paragraph #{idx + 1}
                          </span>
                          {editingHub.aboutText.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAboutParagraph(idx)}
                              className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          value={p}
                          onChange={(e) => handleAboutTextChange(idx, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#141416] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: POPULAR ROUTES & RATES */}
              {activeTab === 'routes' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit']">
                        Vehicle Rates & Direct Destination Fares
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Set upfront rates in LKR for Sedans, VIP Vans, and SUVs. These automatically convert for international visitors.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRoute}
                      className="px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Route</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingHub.popularRoutes?.map((route, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-3 hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-center justify-between pb-2 border-b border-[#1F1F23]">
                          <span className="text-xs font-bold text-white flex items-center gap-1.5 font-['Outfit']">
                            <Car className="w-3.5 h-3.5 text-[#F5B91B]" />
                            <span>Route #{idx + 1}: {route.from} ⇄ {route.to}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRoute(idx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              From (Pickup)
                            </label>
                            <input
                              type="text"
                              value={route.from}
                              onChange={(e) => handleRouteFieldChange(idx, 'from', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              To (Destination)
                            </label>
                            <input
                              type="text"
                              value={route.to}
                              onChange={(e) => handleRouteFieldChange(idx, 'to', e.target.value)}
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Distance (KM)
                            </label>
                            <input
                              type="number"
                              value={route.distanceKm}
                              onChange={(e) => handleRouteFieldChange(idx, 'distanceKm', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Estimated Duration
                            </label>
                            <input
                              type="text"
                              value={route.duration}
                              onChange={(e) => handleRouteFieldChange(idx, 'duration', e.target.value)}
                              placeholder="e.g. 2h 15m"
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Fares row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                          <div className="p-2 rounded-lg bg-[#141416] border border-[#27272A]">
                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                              Sedan Rate (LKR)
                            </label>
                            <input
                              type="number"
                              step="500"
                              value={route.sedanLkr}
                              onChange={(e) => handleRouteFieldChange(idx, 'sedanLkr', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0B0B0D] border border-[#27272A] text-xs font-bold text-white font-mono"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Preview: {formatFare(route.sedanLkr)}
                            </div>
                          </div>

                          <div className="p-2 rounded-lg bg-[#141416] border border-[#F5B91B]/30 bg-[#F5B91B]/5">
                            <label className="block text-[10px] font-bold text-[#F5B91B] uppercase mb-1">
                              VIP Van Rate (LKR)
                            </label>
                            <input
                              type="number"
                              step="500"
                              value={route.vanLkr}
                              onChange={(e) => handleRouteFieldChange(idx, 'vanLkr', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0B0B0D] border border-[#27272A] text-xs font-bold text-[#F5B91B] font-mono"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Preview: {formatFare(route.vanLkr)}
                            </div>
                          </div>

                          <div className="p-2 rounded-lg bg-[#141416] border border-[#27272A]">
                            <label className="block text-[10px] font-bold text-slate-300 uppercase mb-1">
                              SUV Rate (LKR)
                            </label>
                            <input
                              type="number"
                              step="500"
                              value={route.suvLkr}
                              onChange={(e) => handleRouteFieldChange(idx, 'suvLkr', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 rounded bg-[#0B0B0D] border border-[#27272A] text-xs font-bold text-white font-mono"
                            />
                            <div className="text-[10px] text-slate-400 font-mono mt-1">
                              Preview: {formatFare(route.suvLkr)}
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Highlight / Tolls Note
                          </label>
                          <input
                            type="text"
                            value={route.highlight}
                            onChange={(e) => handleRouteFieldChange(idx, 'highlight', e.target.value)}
                            placeholder="e.g. Southern Expressway tolls included, meet & greet available"
                            className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: ATTRACTIONS & SIGHTS */}
              {activeTab === 'attractions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit']">
                        Local Attractions & Recommended Stops
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Highlights displayed on the dedicated hub page to attract tourists and surfers.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddAttraction}
                      className="px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Attraction</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingHub.attractions?.map((attr, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-['Outfit']">
                            #{idx + 1} {attr.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttraction(idx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Attraction Name
                            </label>
                            <input
                              type="text"
                              value={attr.name}
                              onChange={(e) => {
                                const next = [...editingHub.attractions];
                                next[idx].name = e.target.value;
                                setEditingHub({ ...editingHub, attractions: next });
                              }}
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                              Category Tag
                            </label>
                            <input
                              type="text"
                              value={attr.category}
                              onChange={(e) => {
                                const next = [...editingHub.attractions];
                                next[idx].category = e.target.value;
                                setEditingHub({ ...editingHub, attractions: next });
                              }}
                              placeholder="e.g. World-Class Surf Break"
                              className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-[#F5B91B]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={attr.description}
                            onChange={(e) => {
                              const next = [...editingHub.attractions];
                              next[idx].description = e.target.value;
                              setEditingHub({ ...editingHub, attractions: next });
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: FAQs */}
              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
                    <div>
                      <h3 className="text-sm font-bold text-white font-['Outfit']">
                        Frequently Asked Questions (FAQ)
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Help travelers answer questions regarding surfboard transport, travel time, and night pickups.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFaq}
                      className="px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add FAQ</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingHub.faqs?.map((faq, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white font-['Outfit']">
                            Q#{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFaq(idx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Remove</span>
                          </button>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Question
                          </label>
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const next = [...editingHub.faqs];
                              next[idx].question = e.target.value;
                              setEditingHub({ ...editingHub, faqs: next });
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                            Answer
                          </label>
                          <textarea
                            rows={2}
                            value={faq.answer}
                            onChange={(e) => {
                              const next = [...editingHub.faqs];
                              next[idx].answer = e.target.value;
                              setEditingHub({ ...editingHub, faqs: next });
                            }}
                            className="w-full px-2.5 py-1.5 rounded bg-[#141416] border border-[#27272A] text-xs text-slate-300"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-[#27272A] flex items-center justify-between bg-[#141416]">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">All edits sync immediately to the live site.</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingHub(null);
                      setSelectedHubKey(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Hub Updates'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* QUICK HUB IMAGE UPDATE MODAL */}
      {quickImageHubKey && taxiHubs[quickImageHubKey] && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#27272A] flex items-center justify-between bg-[#111114]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#F5B91B]/15 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B]">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                    Update Image: {taxiHubs[quickImageHubKey].townName} Taxi
                  </h2>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Saves to Firebase Firestore & updates website live
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickImageHubKey(null)}
                className="w-8 h-8 rounded-lg bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5 max-h-[80vh] overflow-y-auto">
              {/* Current Preview */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Current Hub Image Preview
                </label>
                <div className="relative h-44 rounded-xl overflow-hidden bg-[#1A1A1E] border border-[#27272A] group">
                  <OptimizedImage
                    src={taxiHubs[quickImageHubKey].heroImage}
                    fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                    alt={taxiHubs[quickImageHubKey].townName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="font-bold text-white font-['Outfit']">
                      {taxiHubs[quickImageHubKey].townName} Taxi Hub
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-black/60 text-[#F5B91B] font-mono border border-[#F5B91B]/30">
                      Live on Website
                    </span>
                  </div>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Upload New Photo (From Device)
                </label>
                <label className="border-2 border-dashed border-[#27272A] hover:border-[#F5B91B]/60 bg-[#0E0E11] hover:bg-[#18181D] rounded-xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
                  <div className="w-10 h-10 rounded-full bg-[#1F1F24] flex items-center justify-center text-[#F5B91B]">
                    {uploadingHubKey === quickImageHubKey ? (
                      <Loader2 className="w-5 h-5 animate-spin text-[#F5B91B]" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-center">
                    <span className="text-xs font-bold text-white">Click or drag an image here</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, or WEBP up to 25MB (auto-compressed &amp; converted to WebP)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    disabled={uploadingHubKey === quickImageHubKey}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (file) handleDirectImageUpload(quickImageHubKey, file);
                    }}
                  />
                </label>
              </div>

              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Or Paste Image URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={taxiHubs[quickImageHubKey].heroImage}
                    id="quick-image-url-input"
                    placeholder="https://... or /assets/..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('quick-image-url-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        handleApplyPresetImage(quickImageHubKey, input.value.trim());
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-bold transition-colors cursor-pointer"
                  >
                    Save URL
                  </button>
                </div>
              </div>

              {/* Presets Gallery */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Or Pick Southern Coast Preset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {SOUTHERN_HUB_IMAGE_PRESETS.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => handleApplyPresetImage(quickImageHubKey, preset.url)}
                      className="group relative rounded-lg overflow-hidden border border-[#27272A] hover:border-[#F5B91B] transition-all text-left bg-[#0B0B0D] cursor-pointer"
                    >
                      <div className="h-16 w-full overflow-hidden">
                        <OptimizedImage
                          src={preset.url}
                          fallbackSrc="/assets/images/hero_galle_taxi_1793121940996.webp"
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-1.5">
                        <div className="text-[10px] font-bold text-white truncate">{preset.town}</div>
                        <div className="text-[9px] text-slate-400 truncate">{preset.tag}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {saveNotice && saveNotice.hubKey === quickImageHubKey && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-400 font-semibold animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{saveNotice.message}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#27272A] flex justify-end bg-[#111114]">
              <button
                type="button"
                onClick={() => setQuickImageHubKey(null)}
                className="px-4 py-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-200 text-xs font-bold transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
