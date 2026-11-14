/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Edit3,
  Trash2,
  DollarSign,
  Image as ImageIcon,
  CalendarCheck,
  Globe,
  Clock,
  MapPin,
  Car,
  Users,
  Briefcase,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Upload,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
  ShieldCheck,
  FileText,
  ListOrdered,
  Link as LinkIcon,
  Phone,
  Mail,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { DayTourProduct, TourVehiclePrice, TourItineraryItem, TourHighlightItem } from '../../types';
import { formatCurrency } from '../../lib/fareEngine';
import { OptimizedImage } from '../../components/OptimizedImage';

const DEFAULT_VEHICLE_TEMPLATES: TourVehiclePrice[] = [
  {
    id: 'sedan',
    name: 'Executive Sedan',
    category: 'Toyota Premio / Allion / Prius',
    passengers: '1–3 Passengers',
    maxPassengers: 3,
    luggage: '2 Medium Bags',
    priceUsd: 65,
    highlight: 'Ideal for couples & solo travelers',
  },
  {
    id: 'suv',
    name: 'Comfort SUV',
    category: 'Toyota Rush / Honda Vezel',
    passengers: '1–4 Passengers',
    maxPassengers: 4,
    luggage: '3 Large Bags',
    priceUsd: 85,
    highlight: 'Elevated ride with panoramic windows',
    badge: 'Popular',
  },
  {
    id: 'kdh-flat-roof',
    name: 'KDH Flat Roof Van',
    category: 'Toyota KDH Flat Roof',
    passengers: '4–6 Passengers',
    maxPassengers: 6,
    luggage: '6 Large Bags',
    priceUsd: 95,
    highlight: 'Spacious for families and group day trips',
  },
  {
    id: 'kdh-high-roof',
    name: 'KDH High Roof Van',
    category: 'Toyota KDH High Roof VIP',
    passengers: '6–9 Passengers',
    maxPassengers: 9,
    luggage: '9 Large Bags',
    priceUsd: 115,
    highlight: 'Maximum legroom and luggage capacity',
    badge: 'Spacious VIP',
  },
];

export const AdminTours: React.FC = () => {
  const { tours, bookings, currency, formatFare, addTour, updateTour, deleteTour, togglePublishTour, uploadTourImage, updateBookingStatus, fetchTours } = useApp();

  const [activeTab, setActiveTab] = useState<'tours' | 'bookings'>('tours');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPublish, setFilterPublish] = useState<'all' | 'published' | 'unpublished'>('all');
  const [isSyncing, setIsSyncing] = useState(false);

  // Automatically fetch/sync full tours list on mount
  useEffect(() => {
    if (fetchTours) {
      fetchTours().catch((err) => console.warn('[AdminTours] Initial sync notice:', err));
    }
  }, [fetchTours]);

  // Tour Edit / Add Modal State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<DayTourProduct | null>(null);
  const [editorSubTab, setEditorSubTab] = useState<'general' | 'pricing' | 'images' | 'itinerary' | 'policies' | 'seo'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields State
  const [formTitle, setFormTitle] = useState('');
  const [formShortTitle, setFormShortTitle] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formStartingLocation, setFormStartingLocation] = useState('');
  const [formPickupLocations, setFormPickupLocations] = useState<string[]>([]);
  const [newPickupInput, setNewPickupInput] = useState('');
  const [formBadge, setFormBadge] = useState('');
  const [formRating, setFormRating] = useState(4.95);
  const [formReviewCount, setFormReviewCount] = useState(50);
  const [formIsPublished, setFormIsPublished] = useState(true);
  const [formShortDescription, setFormShortDescription] = useState('');
  const [formFullDescription, setFormFullDescription] = useState('');
  const [formHeroImage, setFormHeroImage] = useState('');
  const [formGalleryImages, setFormGalleryImages] = useState<string[]>([]);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');
  const [formVehiclePrices, setFormVehiclePrices] = useState<TourVehiclePrice[]>(DEFAULT_VEHICLE_TEMPLATES);
  const [formHighlights, setFormHighlights] = useState<TourHighlightItem[]>([]);
  const [formItinerary, setFormItinerary] = useState<TourItineraryItem[]>([]);
  const [formIncluded, setFormIncluded] = useState<string[]>([]);
  const [newIncludedInput, setNewIncludedInput] = useState('');
  const [formExcluded, setFormExcluded] = useState<string[]>([]);
  const [newExcludedInput, setNewExcludedInput] = useState('');
  const [formImportantInfo, setFormImportantInfo] = useState<string[]>([]);
  const [newImportantInput, setNewImportantInput] = useState('');
  const [formCancellationPolicy, setFormCancellationPolicy] = useState('Free cancellation up to 24 hours before pickup with 100% full refund.');
  const [formMapQuery, setFormMapQuery] = useState('Galle+Fort,Sri+Lanka');
  const [formSeoTitle, setFormSeoTitle] = useState('');
  const [formSeoDescription, setFormSeoDescription] = useState('');
  const [formSeoKeywords, setFormSeoKeywords] = useState('');
  const [formOgImage, setFormOgImage] = useState('');

  // Delete Confirmation State
  const [tourToDelete, setTourToDelete] = useState<DayTourProduct | null>(null);

  // Tour Bookings Filter State
  const [selectedTourFilter, setSelectedTourFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');

  // File input ref for image uploads
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const openAddModal = () => {
    setEditingTour(null);
    setFormTitle('');
    setFormShortTitle('');
    setFormSlug('');
    setFormDuration('8–9 Hours');
    setFormStartingLocation('Galle / South Coast');
    setFormPickupLocations(['Galle Fort', 'Unawatuna', 'Ahangama', 'Thalpe / Koggala']);
    setFormBadge('New Private Tour');
    setFormRating(4.95);
    setFormReviewCount(12);
    setFormIsPublished(true);
    setFormShortDescription('');
    setFormFullDescription('');
    setFormHeroImage('https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80&fm=webp');
    setFormGalleryImages([
      'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80&fm=webp',
      'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80&fm=webp',
    ]);
    setFormVehiclePrices(DEFAULT_VEHICLE_TEMPLATES);
    setFormHighlights([
      { title: 'Scenic Coastal Route', description: 'Flexible stops along the southern shoreline.' },
      { title: 'Cultural Landmarks', description: 'Visit historic temples and UNESCO monuments.' },
    ]);
    setFormItinerary([
      { time: '08:30 AM', title: 'Hotel Pickup', description: 'Chauffeur arrives at your hotel in an air-conditioned vehicle.' },
      { time: '12:30 PM', title: 'Lunch & Relaxation', description: 'Lunch at a recommended seaside restaurant.' },
      { time: '05:30 PM', title: 'Hotel Return', description: 'Smooth transfer back to your villa or resort.' },
    ]);
    setFormIncluded([
      'Private air-conditioned vehicle with fuel',
      'Professional English-speaking driver',
      'Highway tolls and vehicle parking',
      'Door-to-door hotel transfers',
    ]);
    setFormExcluded([
      'Lunch and personal beverages',
      'Attraction entry tickets',
      'Gratuities for driver',
    ]);
    setFormImportantInfo([
      'Bring sunscreen, sunglasses, hat, and camera.',
      'Modest clothing required when visiting temple sanctuaries.',
    ]);
    setFormCancellationPolicy('Free cancellation up to 24 hours before your scheduled pickup time with 100% full refund.');
    setFormMapQuery('Galle,Sri+Lanka');
    setFormSeoTitle('Private Day Tour from Galle | Galle Taxi');
    setFormSeoDescription('Book private day tour with Galle Taxi. Executive transport and English chauffeur included.');
    setFormSeoKeywords('Galle day tour, private taxi tour Sri Lanka');
    setFormOgImage('');
    setNewGalleryUrlInput('');
    setEditorSubTab('general');
    setIsEditorOpen(true);
  };

  const openEditModal = (tour: DayTourProduct) => {
    setEditingTour(tour);
    setFormTitle(tour.title);
    setFormShortTitle(tour.shortTitle || tour.title);
    setFormSlug(tour.slug);
    setFormDuration(tour.duration);
    setFormStartingLocation(tour.startingLocation);
    setFormPickupLocations(tour.pickupLocations || ['Galle', 'Unawatuna', 'Ahangama']);
    setFormBadge(tour.badge || '');
    setFormRating(tour.rating);
    setFormReviewCount(tour.reviewCount);
    setFormIsPublished(tour.isPublished !== false);
    setFormShortDescription(tour.shortDescription);
    setFormFullDescription(tour.fullDescription);
    setFormHeroImage(tour.heroImage);
    setFormGalleryImages(tour.galleryImages || []);
    setNewGalleryUrlInput('');
    setFormVehiclePrices(tour.vehiclePrices || DEFAULT_VEHICLE_TEMPLATES);
    setFormHighlights(tour.highlights || []);
    setFormItinerary(tour.itinerary || []);
    setFormIncluded(tour.included || []);
    setFormExcluded(tour.excluded || []);
    setFormImportantInfo(tour.importantInfo || []);
    setFormCancellationPolicy(tour.cancellationPolicy || 'Free cancellation up to 24 hours before pickup.');
    setFormMapQuery(tour.mapQuery || 'Galle,Sri+Lanka');
    setFormSeoTitle(tour.seo?.title || `${tour.title} | Galle Taxi`);
    setFormSeoDescription(tour.seo?.description || tour.shortDescription);
    setFormSeoKeywords(tour.seo?.keywords || '');
    setFormOgImage(tour.seo?.ogImage || '');
    setEditorSubTab('general');
    setIsEditorOpen(true);
  };

  const handleSaveTour = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formDuration) {
      alert('Please fill out the tour title and duration.');
      return;
    }

    try {
      setIsSaving(true);
      const generatedSlug = formSlug.trim() || formTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const payload: DayTourProduct = {
        id: editingTour ? editingTour.id : generatedSlug,
        slug: generatedSlug,
        title: formTitle.trim(),
        shortTitle: formShortTitle.trim() || formTitle.trim(),
        duration: formDuration.trim(),
        startingLocation: formStartingLocation.trim(),
        pickupLocations: formPickupLocations,
        badge: formBadge.trim() || undefined,
        rating: Number(formRating) || 4.95,
        reviewCount: Number(formReviewCount) || 50,
        isPublished: formIsPublished,
        shortDescription: formShortDescription.trim(),
        fullDescription: formFullDescription.trim(),
        heroImage: formHeroImage.trim(),
        galleryImages: formGalleryImages,
        vehiclePrices: formVehiclePrices,
        highlights: formHighlights,
        itinerary: formItinerary,
        included: formIncluded,
        excluded: formExcluded,
        importantInfo: formImportantInfo,
        cancellationPolicy: formCancellationPolicy.trim(),
        mapQuery: formMapQuery.trim(),
        seo: {
          title: formSeoTitle.trim() || `${formTitle} | Galle Taxi`,
          description: formSeoDescription.trim() || formShortDescription,
          keywords: formSeoKeywords.trim(),
          ogImage: formOgImage.trim() || formHeroImage.trim(),
        },
      };

      if (editingTour) {
        await updateTour(payload);
        showToast(`Tour "${payload.title}" updated successfully!`);
      } else {
        await addTour(payload);
        showToast(`Tour "${payload.title}" created successfully!`);
      }

      setIsEditorOpen(false);
    } catch (err: any) {
      console.error('Save tour error:', err);
      alert(err.message || 'Failed to save tour. Please check your inputs.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!tourToDelete) return;
    try {
      await deleteTour(tourToDelete.id);
      showToast(`Tour "${tourToDelete.title}" deleted.`);
      setTourToDelete(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete tour.');
    }
  };

  // Upload Cover Image via Server Disk Upload / Firebase Storage
  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const url = await uploadTourImage(file, 'tours/covers');
      setFormHeroImage(url);
      if (editingTour) {
        setEditingTour((prev) => (prev ? { ...prev, heroImage: url } : null));
      }
      showToast('Cover photo uploaded successfully!');
    } catch (err: any) {
      console.error('Upload hero failed:', err);
      alert('Failed to upload image. Please try again: ' + (err?.message || ''));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Add Direct Image URL(s) to Gallery (Instant, no upload wait)
  const handleAddGalleryUrl = () => {
    const raw = newGalleryUrlInput.trim();
    if (!raw) return;
    const urls = raw
      .split(/[\n,]+/)
      .map((u) => u.trim())
      .filter((u) => u.length > 0);

    if (urls.length === 0) return;

    setFormGalleryImages((prev) => [...prev, ...urls]);
    if (editingTour) {
      setEditingTour((prev) => (prev ? { ...prev, galleryImages: [...(prev.galleryImages || []), ...urls] } : null));
    }
    setNewGalleryUrlInput('');
    showToast(urls.length === 1 ? 'Gallery photo added!' : `${urls.length} gallery photos added!`);
  };

  // Upload Additional Gallery Image(s) via Server Disk Upload / Firebase Storage
  const handleUploadGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = await uploadTourImage(file, 'tours/gallery');
        newUrls.push(url);
      }
      setFormGalleryImages((prev) => [...prev, ...newUrls]);
      if (editingTour) {
        setEditingTour((prev) => (prev ? { ...prev, galleryImages: [...(prev.galleryImages || []), ...newUrls] } : null));
      }
      showToast(newUrls.length === 1 ? 'Gallery photo uploaded!' : `${newUrls.length} gallery photos uploaded!`);
    } catch (err: any) {
      console.error('Upload gallery failed:', err);
      alert('Failed to upload image: ' + (err?.message || ''));
    } finally {
      setIsUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  // Reorder Gallery Images
  const moveGalleryImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...formGalleryImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    setFormGalleryImages(newImages);
  };

  const removeGalleryImage = (index: number) => {
    setFormGalleryImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Vehicle Price Change
  const handleVehiclePriceChange = (vehId: string, newPrice: number) => {
    setFormVehiclePrices((prev) =>
      prev.map((v) => (v.id === vehId ? { ...v, priceUsd: Math.max(1, newPrice) } : v))
    );
  };

  // Filtered Tours
  const filteredTours = tours.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.duration.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPublish =
      filterPublish === 'all' ||
      (filterPublish === 'published' && t.isPublished !== false) ||
      (filterPublish === 'unpublished' && t.isPublished === false);
    return matchesSearch && matchesPublish;
  });

  // Filtered Tour Bookings
  const tourBookings = bookings.filter((b) => {
    const isTour =
      b.bookingReference?.startsWith('GT-TOUR') ||
      b.destination.toLowerCase().includes('tour') ||
      b.vehicleCategoryName.toLowerCase().includes('tour') ||
      (b.specialInstructions && b.specialInstructions.toLowerCase().includes('tour'));
    if (!isTour) return false;

    if (selectedTourFilter !== 'all') {
      const matchTour = tours.find((t) => t.id === selectedTourFilter);
      if (matchTour) {
        const matchesName =
          b.destination.toLowerCase().includes(matchTour.shortTitle.toLowerCase()) ||
          (b.specialInstructions && b.specialInstructions.toLowerCase().includes(matchTour.title.toLowerCase())) ||
          b.vehicleCategoryName.toLowerCase().includes(matchTour.shortTitle.toLowerCase());
        if (!matchesName) return false;
      }
    }

    if (bookingSearch.trim()) {
      const q = bookingSearch.toLowerCase();
      return (
        b.customerName.toLowerCase().includes(q) ||
        b.bookingReference.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 bg-emerald-950/80 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in sticky top-2 z-50 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#F5B91B]">
            <Compass className="w-4 h-4" />
            <span>Tour Management CMS</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit'] mt-1">
            Private Day Tours & Dynamic Pricing
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage packages, live vehicle rates (Sedan, SUV, KDH Van), media galleries, itineraries, and customer reservations in real time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={isSyncing}
            onClick={async () => {
              setIsSyncing(true);
              try {
                const refreshed = await fetchTours();
                showToast(`Synced ${refreshed.length} day tours from Firestore database!`);
              } catch {
                showToast('Tour catalog refreshed.');
              } finally {
                setIsSyncing(false);
              }
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[#141416] hover:bg-[#1E1E22] border border-[#27272A] hover:border-[#F5B91B]/50 text-slate-300 hover:text-white font-bold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            title="Refetch all tours from Firestore"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-[#F5B91B]' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Tours'}</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Tour</span>
          </button>
        </div>
      </div>

      {/* Main Tabs (Tours CMS vs Tour Bookings) */}
      <div className="flex items-center gap-2 border-b border-[#27272A] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('tours')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-1 cursor-pointer flex items-center gap-2 ${
            activeTab === 'tours'
              ? 'border-[#F5B91B] text-[#F5B91B]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Tour Catalog & Pricing ({tours.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 -mb-1 cursor-pointer flex items-center gap-2 ${
            activeTab === 'bookings'
              ? 'border-[#F5B91B] text-[#F5B91B]'
              : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <CalendarCheck className="w-3.5 h-3.5" />
          <span>Tour Bookings ({tourBookings.length})</span>
        </button>
      </div>

      {/* TAB 1: TOUR CATALOG & PRICING */}
      {activeTab === 'tours' && (
        <div className="space-y-5">
          {/* Filter & Search Bar */}
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-1.5 p-1 bg-[#0B0B0D] rounded-xl border border-[#27272A] w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFilterPublish('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterPublish === 'all' ? 'bg-[#F5B91B] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Tours ({tours.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterPublish('published')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterPublish === 'published' ? 'bg-[#F5B91B] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Eye className="w-3 h-3 text-emerald-400" />
                <span>Published ({tours.filter((t) => t.isPublished !== false).length})</span>
              </button>
              <button
                type="button"
                onClick={() => setFilterPublish('unpublished')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filterPublish === 'unpublished' ? 'bg-[#F5B91B] text-black shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <EyeOff className="w-3 h-3 text-slate-400" />
                <span>Unpublished ({tours.filter((t) => t.isPublished === false).length})</span>
              </button>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tours by title or slug..."
                className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B]"
              />
            </div>
          </div>

          {/* Tours Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTours.map((tour) => {
              const isPublished = tour.isPublished !== false;
              const startingPriceUsd = Math.min(...tour.vehiclePrices.map((v) => v.priceUsd));

              return (
                <div
                  key={tour.id}
                  className={`bg-[#141416] border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all group ${
                    isPublished ? 'border-[#27272A] hover:border-slate-600' : 'border-dashed border-slate-700 opacity-80'
                  }`}
                >
                  <div>
                    {/* Visual */}
                    <div className="relative aspect-[16/10] bg-[#0B0B0D] overflow-hidden">
                      <OptimizedImage
                        src={tour.heroImage}
                        fallbackSrc="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80&fm=webp"
                        alt={tour.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#141416] via-transparent to-black/40" />

                      {/* Status Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => togglePublishTour(tour.id)}
                          className={`px-2.5 py-1 rounded-md text-[10px] font-bold backdrop-blur-md border cursor-pointer flex items-center gap-1 transition-all ${
                            isPublished
                              ? 'bg-emerald-950/80 border-emerald-600/50 text-emerald-300 hover:bg-emerald-900'
                              : 'bg-slate-900/90 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {isPublished ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
                          <span>{isPublished ? 'Live on Site' : 'Draft (Unpublished)'}</span>
                        </button>

                        {tour.badge && (
                          <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-bold text-[#F5B91B] border border-[#F5B91B]/30 uppercase">
                            {tour.badge}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2.5 left-2.5">
                        <span className="px-2.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#F5B91B]" />
                          <span>{tour.duration}</span>
                        </span>
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      <div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#F5B91B]" />
                          <span>{tour.startingLocation.split(',')[0]}</span>
                          <span className="text-slate-600">•</span>
                          <span className="font-mono text-[10px] text-slate-500">/tours/{tour.slug}</span>
                        </div>
                        <h3 className="text-base font-bold text-white font-['Outfit'] mt-1 leading-snug">
                          {tour.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {tour.shortDescription}
                        </p>
                      </div>

                      {/* Vehicle Pricing Matrix Snippet */}
                      <div className="pt-2 border-t border-[#27272A] space-y-1.5">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          Vehicle Pricing (Per Car)
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {tour.vehiclePrices.map((veh) => (
                            <div
                              key={veh.id}
                              className="p-1.5 rounded-lg bg-[#0B0B0D] border border-[#27272A] flex items-center justify-between text-[11px]"
                            >
                              <span className="text-slate-400 truncate max-w-[85px]">{veh.name.split(' ')[0]}</span>
                              <span className="font-mono font-bold text-[#F5B91B]">${veh.priceUsd}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-[#27272A]/70 mt-2">
                    <Link
                      to={`/tours/${tour.slug}`}
                      target="_blank"
                      className="px-3 py-1.5 rounded-lg bg-[#0B0B0D] hover:bg-[#1C1C20] border border-[#27272A] text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Preview public customer tour page"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Preview</span>
                    </Link>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(tour)}
                        className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Tour</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTourToDelete(tour)}
                        className="p-1.5 rounded-lg bg-[#27272A]/50 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Delete Tour"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredTours.length === 0 && (
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-12 text-center text-slate-400 space-y-3">
              <Compass className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No tours match your filter</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try adjusting your search query or clear the filter to view all tours.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TOUR BOOKINGS MANAGEMENT */}
      {activeTab === 'bookings' && (
        <div className="space-y-5">
          {/* Tour Booking Filters */}
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-400 whitespace-nowrap">Filter by Tour:</label>
              <select
                value={selectedTourFilter}
                onChange={(e) => setSelectedTourFilter(e.target.value)}
                className="px-3 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
              >
                <option value="all">All Day Tours</option>
                {tours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={bookingSearch}
                onChange={(e) => setBookingSearch(e.target.value)}
                placeholder="Search booking by customer or ref..."
                className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B]"
              />
            </div>
          </div>

          {/* Bookings List */}
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#1A1A1E] text-slate-400 border-b border-[#27272A] uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4 font-semibold">Reference & Tour</th>
                    <th className="py-3.5 px-4 font-semibold">Customer Details</th>
                    <th className="py-3.5 px-4 font-semibold">Schedule & Pickup</th>
                    <th className="py-3.5 px-4 font-semibold">Vehicle & Fare</th>
                    <th className="py-3.5 px-4 font-semibold">Status</th>
                    <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1F1F23]">
                  {tourBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#1B1B1F] transition-colors">
                      <td className="py-3.5 px-4 space-y-1">
                        <div className="font-mono font-bold text-[#F5B91B]">{b.bookingReference}</div>
                        <div className="text-white font-medium truncate max-w-[200px]">{b.destination}</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-white">{b.customerName}</div>
                        <div className="text-slate-400 font-mono text-[11px]">{b.phone}</div>
                        {b.email && <div className="text-slate-500 text-[10px] truncate max-w-[150px]">{b.email}</div>}
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-bold text-white flex items-center gap-1">
                          <CalendarCheck className="w-3 h-3 text-[#F5B91B]" />
                          <span>{b.pickupDate} at {b.pickupTime}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] truncate max-w-[220px]">
                          {b.pickupLocation}
                        </div>
                        <div className="text-[10px] text-slate-500">{b.passengerCount} Passengers</div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <div className="font-semibold text-slate-300">{b.vehicleCategoryName}</div>
                        <div className="font-mono font-extrabold text-[#F5B91B] text-xs">
                          {formatFare(b.estimatedFare)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={b.status}
                          onChange={(e) => updateBookingStatus(b.id, e.target.value as any)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none cursor-pointer ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                              : b.status === 'Driver Assigned'
                              ? 'bg-blue-950/80 border-blue-600 text-blue-300'
                              : b.status === 'Completed'
                              ? 'bg-purple-950/80 border-purple-600 text-purple-300'
                              : b.status === 'Cancelled'
                              ? 'bg-rose-950/80 border-rose-600 text-rose-300'
                              : 'bg-amber-950/80 border-amber-600 text-amber-300'
                          }`}
                        >
                          <option value="Pending" className="bg-[#141416] text-white">Pending</option>
                          <option value="Confirmed" className="bg-[#141416] text-white">Confirmed</option>
                          <option value="Driver Assigned" className="bg-[#141416] text-white">Driver Assigned</option>
                          <option value="Completed" className="bg-[#141416] text-white">Completed</option>
                          <option value="Cancelled" className="bg-[#141416] text-white">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <a
                          href={`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${b.customerName}, regarding your Galle Taxi tour reservation (${b.bookingReference}) for ${b.pickupDate}...`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366]/15 hover:bg-[#25D366]/30 text-[#25D366] text-[11px] font-bold transition-colors"
                        >
                          <Phone className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {tourBookings.length === 0 && (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <CalendarCheck className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">No tour bookings match the selected filter.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FULL TOUR EDITOR MODAL (Multi-Tab CMS) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-6 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#27272A] pb-4 shrink-0">
              <div className="space-y-0.5">
                <div className="text-[10px] font-bold text-[#F5B91B] uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>{editingTour ? 'Edit Private Tour' : 'Create New Private Tour'}</span>
                </div>
                <h2 className="text-xl font-bold text-white font-['Outfit']">
                  {formTitle || 'New Day Tour Package'}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer bg-[#0B0B0D] px-3 py-1.5 rounded-xl border border-[#27272A]">
                  <input
                    type="checkbox"
                    checked={formIsPublished}
                    onChange={(e) => setFormIsPublished(e.target.checked)}
                    className="w-4 h-4 accent-[#F5B91B]"
                  />
                  <span className={`text-xs font-bold ${formIsPublished ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {formIsPublished ? 'Published (Live)' : 'Draft (Hidden)'}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Editor Sub-Tabs Navigation */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-[#27272A] shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setEditorSubTab('general')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                  editorSubTab === 'general' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                1. General & Overview
              </button>
              <button
                type="button"
                onClick={() => setEditorSubTab('pricing')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  editorSubTab === 'pricing' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>2. Vehicle Rates</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorSubTab('images')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  editorSubTab === 'images' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>3. Photos & Gallery</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorSubTab('itinerary')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  editorSubTab === 'itinerary' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ListOrdered className="w-3.5 h-3.5" />
                <span>4. Itinerary & Stops</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorSubTab('policies')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  editorSubTab === 'policies' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>5. Inclusions & Policies</span>
              </button>
              <button
                type="button"
                onClick={() => setEditorSubTab('seo')}
                className={`px-3 py-2 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  editorSubTab === 'seo' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>6. SEO & Metadata</span>
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveTour} className="flex-1 overflow-y-auto space-y-6 pr-1">
              
              {/* SUBTAB 1: GENERAL & OVERVIEW */}
              {editorSubTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Full Tour Title *</label>
                      <input
                        type="text"
                        required
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        placeholder="e.g. Galle & South Coast Discovery"
                        className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Short Subtitle / Nav Name</label>
                      <input
                        type="text"
                        value={formShortTitle}
                        onChange={(e) => setFormShortTitle(e.target.value)}
                        placeholder="e.g. Galle & South Coast"
                        className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Duration *</label>
                      <input
                        type="text"
                        required
                        value={formDuration}
                        onChange={(e) => setFormDuration(e.target.value)}
                        placeholder="e.g. 8–9 Hours"
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Starting Location</label>
                      <input
                        type="text"
                        value={formStartingLocation}
                        onChange={(e) => setFormStartingLocation(e.target.value)}
                        placeholder="e.g. Galle, Unawatuna, or Ahangama"
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Badge Tag</label>
                      <input
                        type="text"
                        value={formBadge}
                        onChange={(e) => setFormBadge(e.target.value)}
                        placeholder="e.g. Signature Tour, Mountain Scenic"
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  {/* Pickup Locations Tags */}
                  <div className="space-y-2 pt-2 border-t border-[#27272A]">
                    <label className="text-xs font-semibold text-slate-300">Free Hotel Pickup Coverage Areas</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formPickupLocations.map((loc, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#0B0B0D] border border-[#27272A] text-xs text-slate-300 flex items-center gap-1.5"
                        >
                          <span>{loc}</span>
                          <button
                            type="button"
                            onClick={() => setFormPickupLocations(formPickupLocations.filter((_, i) => i !== idx))}
                            className="text-slate-500 hover:text-rose-400 cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newPickupInput}
                        onChange={(e) => setNewPickupInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (newPickupInput.trim()) {
                              setFormPickupLocations([...formPickupLocations, newPickupInput.trim()]);
                              setNewPickupInput('');
                            }
                          }
                        }}
                        placeholder="Add area (e.g. Weligama Bay) and press Enter..."
                        className="flex-1 px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (newPickupInput.trim()) {
                            setFormPickupLocations([...formPickupLocations, newPickupInput.trim()]);
                            setNewPickupInput('');
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#27272A] hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                      >
                        Add Area
                      </button>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#27272A]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Verified Rating (1.0 to 5.0)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="1"
                        max="5"
                        value={formRating}
                        onChange={(e) => setFormRating(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Review Count</label>
                      <input
                        type="number"
                        min="0"
                        value={formReviewCount}
                        onChange={(e) => setFormReviewCount(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Card Short Description (Max 200 chars)</label>
                    <textarea
                      rows={2}
                      value={formShortDescription}
                      onChange={(e) => setFormShortDescription(e.target.value)}
                      placeholder="Brief teaser displayed on tour cards..."
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Comprehensive Tour Description (Tour Page)</label>
                    <textarea
                      rows={5}
                      value={formFullDescription}
                      onChange={(e) => setFormFullDescription(e.target.value)}
                      placeholder="Full immersive story, scenery, and journey overview..."
                      className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                </div>
              )}

              {/* SUBTAB 2: VEHICLE PRICING (USD RATES) */}
              {editorSubTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#0B0B0D] rounded-xl border border-[#27272A] text-xs text-slate-300">
                    <span className="font-bold text-[#F5B91B]">Pricing Model: </span>
                    All day tour prices are charged <strong>per private vehicle</strong> (not per person), including air-conditioned car/van, experienced English chauffeur, vehicle fuel, and highway toll clearances.
                  </div>

                  <div className="space-y-3">
                    {formVehiclePrices.map((veh) => (
                      <div
                        key={veh.id}
                        className="p-4 bg-[#0B0B0D] border border-[#27272A] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{veh.name}</h4>
                            {veh.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded bg-[#F5B91B]/20 text-[#F5B91B] font-bold">
                                {veh.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{veh.category}</p>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span>{veh.passengers}</span>
                            <span>•</span>
                            <span>{veh.luggage}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 self-end sm:self-auto">
                          <div className="text-right">
                            <label className="text-[10px] text-slate-400 font-semibold block uppercase">
                              USD Price ($)
                            </label>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-sm font-mono text-[#F5B91B] font-bold">$</span>
                              <input
                                type="number"
                                min="10"
                                value={veh.priceUsd}
                                onChange={(e) => handleVehiclePriceChange(veh.id, Number(e.target.value))}
                                className="w-24 px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-sm text-white font-mono font-bold focus:outline-none focus:border-[#F5B91B]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SUBTAB 3: PHOTOS & GALLERY (FIREBASE STORAGE INTEGRATION) */}
              {editorSubTab === 'images' && (
                <div className="space-y-6">
                  {/* Cover Photo */}
                  <div className="space-y-3 p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-[#F5B91B]" />
                        <span>Primary Cover Photo (Hero Image)</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => heroFileInputRef.current?.click()}
                        disabled={isUploading}
                        className="px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploading ? 'Uploading...' : 'Upload from Device'}</span>
                      </button>
                      <input
                        ref={heroFileInputRef}
                        type="file"
                        accept="image/*,.png,.jpg,.jpeg,.webp"
                        onChange={handleUploadHeroImage}
                        className="hidden"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative aspect-[16/10] w-full sm:w-56 rounded-xl overflow-hidden bg-[#141416] border border-[#27272A] flex items-center justify-center">
                        {formHeroImage ? (
                          <OptimizedImage
                            src={formHeroImage}
                            fallbackSrc="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80&fm=webp"
                            alt="Cover preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-center p-3 text-slate-500 text-xs flex flex-col items-center gap-1">
                            <ImageIcon className="w-6 h-6 text-slate-600" />
                            <span>No cover image</span>
                          </div>
                        )}
                        {isUploading && (
                          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-[#F5B91B] animate-spin" />
                            <span className="text-[11px] text-[#F5B91B] font-bold">Uploading...</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 w-full space-y-1.5">
                        <label className="text-[11px] text-slate-400">Or paste direct Image URL</label>
                        <input
                          type="text"
                          value={formHeroImage}
                          onChange={(e) => setFormHeroImage(e.target.value)}
                          placeholder="https://images.unsplash.com/... or /assets/images/..."
                          className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Multi-Photo Gallery */}
                  <div className="space-y-4 p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A]">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                          <ImageIcon className="w-4 h-4 text-[#F5B91B]" />
                          <span>Tour Gallery Photos ({formGalleryImages.length})</span>
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Upload from device or paste direct image URLs below for instant addition. Reorder with up/down controls.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => galleryFileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span>{isUploading ? 'Uploading...' : 'Upload from Device'}</span>
                        </button>
                        <input
                          ref={galleryFileInputRef}
                          type="file"
                          accept="image/*,.png,.jpg,.jpeg,.webp"
                          multiple
                          onChange={handleUploadGalleryImage}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Direct Image URL Quick-Add Bar (Instant addition, no upload lag) */}
                    <div className="p-3 bg-[#141416] rounded-xl border border-[#27272A] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                          <LinkIcon className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span>Paste direct Image URL (Instant add)</span>
                        </label>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">
                          Supports web URLs, CDNs, or assets (comma or enter separated)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newGalleryUrlInput}
                          onChange={(e) => setNewGalleryUrlInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddGalleryUrl();
                            }
                          }}
                          placeholder="https://images.unsplash.com/... or /assets/... (press Enter to add)"
                          className="flex-1 px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B] placeholder-slate-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleAddGalleryUrl}
                          disabled={!newGalleryUrlInput.trim()}
                          className="px-3.5 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Add URL</span>
                        </button>
                      </div>
                    </div>

                    {/* Gallery Photos Grid / Empty State */}
                    {formGalleryImages.length === 0 ? (
                      <div className="p-8 border border-dashed border-[#27272A] rounded-xl text-center space-y-2 bg-[#141416]/40">
                        <ImageIcon className="w-8 h-8 text-slate-600 mx-auto" />
                        <p className="text-xs font-medium text-slate-300">No gallery photos added yet</p>
                        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                          Paste an image URL into the field above for instant zero-wait addition, or click Upload from Device.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {formGalleryImages.map((img, idx) => (
                          <div
                            key={idx}
                            className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#141416] border border-[#27272A] group shadow-sm"
                          >
                            <OptimizedImage
                              src={img}
                              fallbackSrc="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80&fm=webp"
                              alt={`Gallery ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                              #{idx + 1}
                            </div>

                            {/* Hover Controls */}
                            <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                              <button
                                type="button"
                                onClick={() => moveGalleryImage(idx, 'up')}
                                disabled={idx === 0}
                                className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white disabled:opacity-30 cursor-pointer transition-colors"
                                title="Move left / earlier"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => moveGalleryImage(idx, 'down')}
                                disabled={idx === formGalleryImages.length - 1}
                                className="p-1.5 rounded-lg bg-black/80 hover:bg-black text-white disabled:opacity-30 cursor-pointer transition-colors"
                                title="Move right / later"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeGalleryImage(idx)}
                                className="p-1.5 rounded-lg bg-rose-950/90 hover:bg-rose-900 text-rose-300 cursor-pointer transition-colors"
                                title="Delete photo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SUBTAB 4: ITINERARY & STOPS */}
              {editorSubTab === 'itinerary' && (
                <div className="space-y-6">
                  {/* Experience Highlights */}
                  <div className="space-y-3 p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Key Experience Highlights ({formHighlights.length})
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormHighlights([
                            ...formHighlights,
                            { title: 'New Highlight Point', description: 'Scenic vantage or experience detail.' },
                          ])
                        }
                        className="px-3 py-1 rounded-lg bg-[#27272A] hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                      >
                        + Add Highlight
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formHighlights.map((hl, idx) => (
                        <div key={idx} className="p-3 bg-[#141416] border border-[#27272A] rounded-xl space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <input
                              type="text"
                              value={hl.title}
                              onChange={(e) => {
                                const updated = [...formHighlights];
                                updated[idx].title = e.target.value;
                                setFormHighlights(updated);
                              }}
                              placeholder="Highlight headline..."
                              className="w-full px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#F5B91B]"
                            />
                            <button
                              type="button"
                              onClick={() => setFormHighlights(formHighlights.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={hl.description}
                            onChange={(e) => {
                              const updated = [...formHighlights];
                              updated[idx].description = e.target.value;
                              setFormHighlights(updated);
                            }}
                            placeholder="Description..."
                            className="w-full px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hourly Itinerary Timeline */}
                  <div className="space-y-3 p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A]">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        Suggested Timeline Itinerary ({formItinerary.length} stops)
                      </h4>
                      <button
                        type="button"
                        onClick={() =>
                          setFormItinerary([
                            ...formItinerary,
                            { time: '02:00 PM', title: 'Sightseeing Activity', description: 'Explore scenic landmark.' },
                          ])
                        }
                        className="px-3 py-1 rounded-lg bg-[#27272A] hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                      >
                        + Add Stop
                      </button>
                    </div>

                    <div className="space-y-3">
                      {formItinerary.map((stop, idx) => (
                        <div key={idx} className="p-3 bg-[#141416] border border-[#27272A] rounded-xl space-y-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={stop.time}
                              onChange={(e) => {
                                const updated = [...formItinerary];
                                updated[idx].time = e.target.value;
                                setFormItinerary(updated);
                              }}
                              placeholder="Time (e.g. 08:30 AM)"
                              className="w-32 px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs font-mono font-bold text-[#F5B91B] focus:outline-none focus:border-[#F5B91B]"
                            />
                            <input
                              type="text"
                              value={stop.title}
                              onChange={(e) => {
                                const updated = [...formItinerary];
                                updated[idx].title = e.target.value;
                                setFormItinerary(updated);
                              }}
                              placeholder="Stop title..."
                              className="flex-1 px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs font-bold text-white focus:outline-none focus:border-[#F5B91B]"
                            />
                            <button
                              type="button"
                              onClick={() => setFormItinerary(formItinerary.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400 p-1 cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          <textarea
                            rows={2}
                            value={stop.description}
                            onChange={(e) => {
                              const updated = [...formItinerary];
                              updated[idx].description = e.target.value;
                              setFormItinerary(updated);
                            }}
                            placeholder="Details regarding this stop..."
                            className="w-full px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-slate-300 focus:outline-none focus:border-[#F5B91B]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 5: INCLUSIONS & POLICIES */}
              {editorSubTab === 'policies' && (
                <div className="space-y-6">
                  {/* Included / Excluded side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* What's Included */}
                    <div className="p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A] space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>What's Included</span>
                      </h4>
                      <div className="space-y-1.5">
                        {formIncluded.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-[#141416] p-2 rounded-lg">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => setFormIncluded(formIncluded.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newIncludedInput}
                          onChange={(e) => setNewIncludedInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newIncludedInput.trim()) {
                                setFormIncluded([...formIncluded, newIncludedInput.trim()]);
                                setNewIncludedInput('');
                              }
                            }
                          }}
                          placeholder="Add inclusion..."
                          className="flex-1 px-2.5 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newIncludedInput.trim()) {
                              setFormIncluded([...formIncluded, newIncludedInput.trim()]);
                              setNewIncludedInput('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#27272A] text-xs font-bold text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* What's Excluded */}
                    <div className="p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A] space-y-3">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <X className="w-3.5 h-3.5" />
                        <span>What's Excluded</span>
                      </h4>
                      <div className="space-y-1.5">
                        {formExcluded.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs text-slate-300 bg-[#141416] p-2 rounded-lg">
                            <span>{item}</span>
                            <button
                              type="button"
                              onClick={() => setFormExcluded(formExcluded.filter((_, i) => i !== idx))}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newExcludedInput}
                          onChange={(e) => setNewExcludedInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (newExcludedInput.trim()) {
                                setFormExcluded([...formExcluded, newExcludedInput.trim()]);
                                setNewExcludedInput('');
                              }
                            }
                          }}
                          placeholder="Add exclusion..."
                          className="flex-1 px-2.5 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (newExcludedInput.trim()) {
                              setFormExcluded([...formExcluded, newExcludedInput.trim()]);
                              setNewExcludedInput('');
                            }
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#27272A] text-xs font-bold text-white cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Policy & Google Map Query */}
                  <div className="p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A] space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Cancellation Policy</label>
                      <input
                        type="text"
                        value={formCancellationPolicy}
                        onChange={(e) => setFormCancellationPolicy(e.target.value)}
                        className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-300">Google Maps Query Location</label>
                      <input
                        type="text"
                        value={formMapQuery}
                        onChange={(e) => setFormMapQuery(e.target.value)}
                        placeholder="e.g. Ella,Sri+Lanka or Yala+National+Park,Sri+Lanka"
                        className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SUBTAB 6: SEO & METADATA */}
              {editorSubTab === 'seo' && (
                <div className="space-y-4 p-4 bg-[#0B0B0D] rounded-2xl border border-[#27272A]">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">URL Slug * (Unique URL)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500">/tours/</span>
                      <input
                        type="text"
                        required
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="galle-south-coast-discovery"
                        className="flex-1 px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs font-mono text-[#F5B91B] focus:outline-none focus:border-[#F5B91B]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">SEO Page Title</label>
                    <input
                      type="text"
                      value={formSeoTitle}
                      onChange={(e) => setFormSeoTitle(e.target.value)}
                      placeholder="e.g. Galle & South Coast Discovery Private Day Tour | Galle Taxi"
                      className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Meta Description</label>
                    <textarea
                      rows={3}
                      value={formSeoDescription}
                      onChange={(e) => setFormSeoDescription(e.target.value)}
                      placeholder="Brief search engine meta snippet under 160 characters..."
                      className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">SEO Target Keywords (Comma separated)</label>
                    <input
                      type="text"
                      value={formSeoKeywords}
                      onChange={(e) => setFormSeoKeywords(e.target.value)}
                      placeholder="Galle day tour, private taxi Galle, Sri Lanka safari"
                      className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">OpenGraph Social Share Image URL</label>
                    <input
                      type="text"
                      value={formOgImage}
                      onChange={(e) => setFormOgImage(e.target.value)}
                      placeholder="Leave blank to use primary cover photo"
                      className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                </div>
              )}

              {/* Form Bottom Save Action */}
              <div className="flex items-center justify-between pt-4 border-t border-[#27272A] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving to Firestore...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Save & Sync Tour</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {tourToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#141416] border border-rose-900/60 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Day Tour Package?</h3>
                <p className="text-xs text-slate-400">This action will remove the tour from the public website.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 p-3 bg-[#0B0B0D] rounded-xl border border-[#27272A]">
              Are you sure you want to delete <strong>"{tourToDelete.title}"</strong> ({tourToDelete.duration})?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setTourToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                Yes, Delete Tour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
