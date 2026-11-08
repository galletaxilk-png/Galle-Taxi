import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Car,
  Briefcase,
  Globe,
  Upload,
  Search,
  CheckCircle2,
  ExternalLink,
  Edit3,
  Eye,
  RefreshCw,
  Sparkles,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { ImageUploader, SYSTEM_IMAGE_PRESETS } from '../../components/admin/ImageUploader';
import { PRIVATE_DAY_TOURS } from '../../lib/toursData';

interface MediaItem {
  id: string;
  title: string;
  category: 'vehicle' | 'service' | 'banner' | 'hub';
  categoryLabel: string;
  imageUrl: string;
  subtitle: string;
  sourceType: 'Local Asset' | 'Custom Upload' | 'External URL';
}

export const AdminMedia: React.FC = () => {
  const {
    vehicles,
    services,
    siteSettings,
    tours,
    taxiHubs,
    updateVehicle,
    updateService,
    updateSiteSettings,
    updateTour,
    updateTaxiHub,
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'vehicle' | 'service' | 'banner' | 'hub'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Compile all media items across the site
  const mediaItems: MediaItem[] = [
    // Banner / Hero
    {
      id: 'banner_hero',
      title: 'Homepage Main Hero Banner',
      category: 'banner',
      categoryLabel: 'Hero Banner',
      imageUrl: siteSettings.heroImageUrl || '/src/assets/images/hero_galle_taxi_1793121940996.jpg',
      subtitle: 'Primary header visual on the customer homepage',
      sourceType: siteSettings.heroImageUrl?.startsWith('data:')
        ? 'Custom Upload'
        : siteSettings.heroImageUrl?.startsWith('http')
        ? 'External URL'
        : 'Local Asset',
    },
    // Down South Campaign Banner
    {
      id: 'banner_seasonal',
      title: 'Down South Season Campaign Banner',
      category: 'banner',
      categoryLabel: 'Campaign Banner',
      imageUrl: siteSettings.seasonalBannerImageUrl || '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
      subtitle: 'Down South season surf & coastal sunset promotional banner',
      sourceType: siteSettings.seasonalBannerImageUrl?.startsWith('data:')
        ? 'Custom Upload'
        : siteSettings.seasonalBannerImageUrl?.startsWith('http')
        ? 'External URL'
        : 'Local Asset',
    },
    // Vehicles
    ...vehicles.map((v) => ({
      id: `vehicle_${v.id}`,
      title: v.name,
      category: 'vehicle' as const,
      categoryLabel: 'Vehicle Fleet',
      imageUrl: v.imageUrl,
      subtitle: `${v.category} • ${v.passengers} Passengers • ${v.luggage} Luggage`,
      sourceType: v.imageUrl?.startsWith('data:')
        ? ('Custom Upload' as const)
        : v.imageUrl?.startsWith('http')
        ? ('External URL' as const)
        : ('Local Asset' as const),
    })),
    // Services
    ...services.map((s) => ({
      id: `service_${s.id}`,
      title: s.title,
      category: 'service' as const,
      categoryLabel: 'Tour / Service',
      imageUrl: s.imageUrl,
      subtitle: `${s.subtitle} • From LKR ${s.startingFromLkr.toLocaleString()}`,
      sourceType: s.imageUrl?.startsWith('data:')
        ? ('Custom Upload' as const)
        : s.imageUrl?.startsWith('http')
        ? ('External URL' as const)
        : ('Local Asset' as const),
    })),
    // Day Tours (using active tours from store)
    ...tours.map((dt) => ({
      id: `tour_${dt.id}`,
      title: dt.title,
      category: 'service' as const,
      categoryLabel: 'Private Day Tour',
      imageUrl: dt.heroImage,
      subtitle: `${dt.duration} • Starts $${dt.vehiclePrices[0]?.priceUsd || 50}`,
      sourceType: dt.heroImage?.startsWith('data:')
        ? ('Custom Upload' as const)
        : dt.heroImage?.startsWith('http')
        ? ('External URL' as const)
        : ('Local Asset' as const),
    })),
    // Southern Coast Taxi Hubs (Ahangama, Mirissa, Unawatuna, etc.)
    ...Object.entries(taxiHubs || {}).map(([key, hub]) => ({
      id: `hub_${key}`,
      title: `${hub.townName} Taxi Hub`,
      category: 'hub' as const,
      categoryLabel: 'Southern Coast Taxi Hub',
      imageUrl: hub.heroImage,
      subtitle: `${hub.tagline || 'Coast Taxi Hub'} • /${hub.slug}`,
      sourceType: hub.heroImage?.startsWith('data:')
        ? ('Custom Upload' as const)
        : hub.heroImage?.startsWith('http')
        ? ('External URL' as const)
        : ('Local Asset' as const),
    })),
  ];

  const filteredItems = mediaItems.filter((item) => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleOpenEdit = (item: MediaItem) => {
    setEditingItem(item);
    setNewImageUrl(item.imageUrl);
  };

  const handleSaveImage = async () => {
    if (!editingItem) return;

    if (editingItem.category === 'banner') {
      if (editingItem.id === 'banner_seasonal') {
        await updateSiteSettings({ ...siteSettings, seasonalBannerImageUrl: newImageUrl });
        setSuccessMessage('Down South Season campaign banner image updated successfully!');
      } else {
        await updateSiteSettings({ ...siteSettings, heroImageUrl: newImageUrl });
        setSuccessMessage('Homepage Hero banner image updated successfully!');
      }
    } else if (editingItem.category === 'hub') {
      const hubKey = editingItem.id.replace('hub_', '');
      if (taxiHubs && taxiHubs[hubKey]) {
        await updateTaxiHub(hubKey, { heroImage: newImageUrl });
        setSuccessMessage(`Hero photo for "${taxiHubs[hubKey].townName} Taxi Hub" saved to Firebase & updated live!`);
      }
    } else if (editingItem.category === 'vehicle') {
      const vehicleId = editingItem.id.replace('vehicle_', '');
      const vehicle = vehicles.find((v) => v.id === vehicleId);
      if (vehicle) {
        await updateVehicle({ ...vehicle, imageUrl: newImageUrl });
        setSuccessMessage(`Vehicle photo for "${vehicle.name}" updated successfully!`);
      }
    } else if (editingItem.category === 'service') {
      if (editingItem.id.startsWith('tour_')) {
        const tourId = editingItem.id.replace('tour_', '');
        const targetTour = tours.find((t) => t.id === tourId) || PRIVATE_DAY_TOURS.find((t) => t.id === tourId);
        if (targetTour) {
          const gallery = [...(targetTour.galleryImages || [])];
          if (gallery.length > 0) gallery[0] = newImageUrl;
          else gallery.push(newImageUrl);

          await updateTour({
            ...targetTour,
            heroImage: newImageUrl,
            galleryImages: gallery,
          });
          setSuccessMessage(`Tour photo for "${targetTour.title}" updated and synced successfully!`);
        }
      } else {
        const serviceId = editingItem.id.replace('service_', '');
        const service = services.find((s) => s.id === serviceId);
        if (service) {
          await updateService({ ...service, imageUrl: newImageUrl });
          setSuccessMessage(`Service image for "${service.title}" updated successfully!`);
        }
      }
    }

    setEditingItem(null);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B91B]">
            <Sparkles className="w-4 h-4" />
            <span>Digital Asset Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] mt-1">
            Media & Image Manager
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload new photos from your device, choose from curated Sri Lanka presets, or paste high-resolution image URLs.
          </p>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-[#0B0B0D] rounded-xl border border-[#27272A] w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Media ({mediaItems.length})
          </button>
          <button
            onClick={() => setActiveFilter('vehicle')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'vehicle'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>Vehicles ({vehicles.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('service')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'service'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Tours & Services ({services.length})</span>
          </button>
          <button
            onClick={() => setActiveFilter('banner')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'banner'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Banners & Hero (2)</span>
          </button>
          <button
            onClick={() => setActiveFilter('hub')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'hub'
                ? 'bg-[#F5B91B] text-black shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Taxi Hubs ({Object.keys(taxiHubs || {}).length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search images by name or category..."
            className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B]"
          />
        </div>
      </div>

      {/* Grid of Media Assets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-[#141416] border border-[#27272A] hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg flex flex-col transition-all group"
          >
            {/* Image Preview with overlay actions */}
            <div className="relative aspect-[16/10] bg-[#0B0B0D] overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />

              <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#F5B91B] border border-[#F5B91B]/30 uppercase tracking-wider">
                  {item.categoryLabel}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-[10px] font-medium text-slate-300 border border-slate-700">
                  {item.sourceType}
                </span>
              </div>

              {/* Hover Buttons */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(item.imageUrl)}
                  className="px-3 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-lg transition-transform hover:scale-105"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Photo</span>
                </button>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-['Outfit'] truncate">
                  {item.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                  {item.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#27272A] flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[140px]">
                  {item.imageUrl.startsWith('data:') ? 'Base64 Encoded' : item.imageUrl.split('/').pop()}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item)}
                  className="text-xs font-bold text-[#F5B91B] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-12 text-center text-slate-400 space-y-3">
          <ImageIcon className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No images match your filter</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search query or clear the filter to see all website visual assets.
          </p>
        </div>
      )}

      {/* Edit Image Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl relative my-8">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4">
              <div>
                <span className="text-[10px] font-bold text-[#F5B91B] uppercase tracking-wider">
                  {editingItem.categoryLabel} Photo
                </span>
                <h3 className="text-lg font-bold text-white font-['Outfit'] mt-0.5">
                  Update Image: {editingItem.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <ImageUploader
                value={newImageUrl}
                onChange={(url) => setNewImageUrl(url)}
                label="Select or Upload New Photo"
                aspectRatio={editingItem.category === 'banner' ? 'video' : 'wide'}
                placeholderText="Upload file from PC or paste photo URL..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveImage}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply & Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Screen Image Preview Modal */}
      {previewModalUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewModalUrl(null)}
        >
          <div className="relative max-w-4xl w-full bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl p-2">
            <img
              src={previewModalUrl}
              alt="High resolution preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
            />
            <div className="p-3 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono truncate">{previewModalUrl}</span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-3 py-1 rounded bg-[#27272A] text-white hover:bg-slate-700 cursor-pointer text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
