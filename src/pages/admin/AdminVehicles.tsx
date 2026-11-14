import React, { useState, useMemo } from 'react';
import {
  Car,
  Plus,
  Users,
  Briefcase,
  DollarSign,
  CheckCircle2,
  Edit,
  Camera,
  Trash2,
  Search,
  Sparkles,
  Tag,
  X,
  AlertTriangle,
  RotateCcw,
  Check,
  Eye,
  Copy,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  ArrowUpDown,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  Layers,
  Image as ImageIcon,
  Upload,
  ExternalLink,
  RefreshCw,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { Vehicle } from '../../types';
import { formatLKR } from '../../lib/fareEngine';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { optimizeImageToWebP } from '../../lib/imageOptimizer';

const STANDARD_CATEGORIES = [
  'SEDAN CAR',
  'SUV CAR',
  'KDH FLAT ROOF',
  'KDH High Roof',
  'Sedan',
  'Van',
  'Mini Van',
  'SUV',
  'Mini Car',
  'Bus',
  'Electric',
];

const POPULAR_AMENITY_PRESETS = [
  'Dual Climate Air-Con',
  'Bluetooth Audio & Phone Charging',
  'Plush Reclining Seats',
  'Surfboard & Multi-Bag Space',
  'High-Roof Walk-in Interior',
  'Bottled Water & Tissues',
  'Complimentary High-Speed Wi-Fi',
  'Child Safety Seat Available',
  'English-Speaking Chauffeur',
  'Expressway Tolls Included',
  'Luggage Assistance',
  'Quiet Executive Cabin',
  'Rear Individual A/C Vents',
  'Tinted Privacy Windows',
];

export const VEHICLE_PHOTO_PRESETS = [
  {
    label: 'Hybrid Sedan (Prius / Premio)',
    category: 'Sedan',
    url: '/assets/images/regenerated_image_1793163512211.png',
  },
  {
    label: 'Toyota KDH High-Roof White Van',
    category: 'KDH High Roof',
    url: '/assets/images/regenerated_image_1793464621511.png',
  },
  {
    label: 'VIP KDH Flat-Roof Executive Van',
    category: 'KDH Flat Roof',
    url: '/assets/images/vehicle_premium_van_1793121943671.jpg',
  },
  {
    label: 'Budget Mini Hatchback (Wagon R / Alto)',
    category: 'Mini Car',
    url: '/assets/images/regenerated_image_1793161723258.png',
  },
  {
    label: 'SUV 4x4 (Prado / CR-V / Fortuner)',
    category: 'SUV',
    url: '/assets/images/regenerated_image_1793464744920.png',
  },
  {
    label: 'Compact Mini Van / Shuttle',
    category: 'Mini Van',
    url: '/assets/images/regenerated_image_1793465213680.png',
  },
  {
    label: 'Luxury Executive Sedan (Mercedes / BMW)',
    category: 'Luxury',
    url: '/assets/images/vehicle_luxury_sedan_1793121944773.jpg',
  },
  {
    label: 'Tourist Mini Coach / Coaster Bus',
    category: 'Bus',
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
  },
  {
    label: 'Modern Eco Electric EV (Tesla / BYD)',
    category: 'Electric',
    url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
  },
];



export const AdminVehicles: React.FC = () => {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, resetToSampleData } = useApp();

  // View mode: Table vs Cards
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [sortBy, setSortBy] = useState<'order' | 'name' | 'rate' | 'pax'>('order');

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showAllPhotosModal, setShowAllPhotosModal] = useState(false);
  const [allPhotosFilterCategory, setAllPhotosFilterCategory] = useState('All');
  const [allPhotosSearch, setAllPhotosSearch] = useState('');
  const [uploadingVehicleId, setUploadingVehicleId] = useState<string | null>(null);
  const [customUrlInputs, setCustomUrlInputs] = useState<Record<string, string>>({});
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [previewVehicle, setPreviewVehicle] = useState<Vehicle | null>(null);
  const [quickPhotoVehicle, setQuickPhotoVehicle] = useState<Vehicle | null>(null);
  const [quickPhotoUrl, setQuickPhotoUrl] = useState('');
  const [deleteConfirmVehicle, setDeleteConfirmVehicle] = useState<Vehicle | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [modelSubtitle, setModelSubtitle] = useState('');
  const [classLabel, setClassLabel] = useState('');
  const [category, setCategory] = useState<string>('Sedan');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [plateNumber, setPlateNumber] = useState('');
  const [passengers, setPassengers] = useState(4);
  const [luggage, setLuggage] = useState(3);
  const [handLuggage, setHandLuggage] = useState(2);
  const [description, setDescription] = useState('');
  const [pricePerKm, setPricePerKm] = useState(240);
  const [baseFare, setBaseFare] = useState(1500);
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [hideCard, setHideCard] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDefaultSelected, setIsDefaultSelected] = useState(false);
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeatureInput, setNewFeatureInput] = useState('');

  // Collect all unique categories present in the system
  const dynamicCategories = useMemo(() => {
    const set = new Set<string>(STANDARD_CATEGORIES);
    vehicles.forEach((v) => {
      if (v.category && v.category.trim()) {
        set.add(v.category.trim());
      }
    });
    return Array.from(set);
  }, [vehicles]);

  // Filtered & Sorted vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          searchQuery.trim() === '' ||
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.modelSubtitle && v.modelSubtitle.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (v.classLabel && v.classLabel.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCat = categoryFilter === 'All' || v.category === categoryFilter;

        const matchesStatus =
          statusFilter === 'All' ||
          (statusFilter === 'Active' && v.isAvailable) ||
          (statusFilter === 'Inactive' && !v.isAvailable);

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'order') {
          return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
        }
        if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'rate') {
          return a.pricePerKm - b.pricePerKm;
        }
        if (sortBy === 'pax') {
          return b.passengers - a.passengers;
        }
        return 0;
      });
  }, [vehicles, searchQuery, categoryFilter, statusFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = vehicles.length;
    const available = vehicles.filter((v) => v.isAvailable).length;
    const categoriesCount = new Set(vehicles.map((v) => v.category)).size;
    const visibleInCarousel = vehicles.filter((v) => !v.hideCard).length;
    return { total, available, categoriesCount, visibleInCarousel };
  }, [vehicles]);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const openAddModal = () => {
    setEditingVehicle(null);
    setName('');
    setSlug('');
    setModelSubtitle('Toyota Premio / Axio / Prius');
    setClassLabel('Executive Business Class');
    setCategory('Sedan');
    setIsCustomCategory(false);
    setCustomCategoryInput('');
    setPlateNumber('WP CAR-' + Math.floor(1000 + Math.random() * 9000));
    setPassengers(4);
    setLuggage(3);
    setHandLuggage(2);
    setDescription('Modern air-conditioned executive vehicle chauffeured by vetted professionals.');
    setPricePerKm(240);
    setBaseFare(1500);
    setImageUrl('/assets/images/regenerated_image_1793163512211.png');
    setIsAvailable(true);
    setHideCard(false);
    setIsFeatured(false);
    setIsDefaultSelected(false);
    setDisplayOrder(vehicles.length + 1);
    setFeatures(['Dual Climate Air-Con', 'Bluetooth Audio & Phone Charging', 'Bottled Water & Tissues', 'Luggage Space']);
    setNewFeatureInput('');
    setShowModal(true);
  };

  const openEditModal = (v: Vehicle) => {
    setEditingVehicle(v);
    setName(v.name);
    setSlug(v.slug || v.id);
    setModelSubtitle(v.modelSubtitle || '');
    setClassLabel(v.classLabel || '');
    
    // Check if category is standard or custom
    if (STANDARD_CATEGORIES.includes(v.category)) {
      setCategory(v.category);
      setIsCustomCategory(false);
      setCustomCategoryInput('');
    } else {
      setCategory('CUSTOM');
      setIsCustomCategory(true);
      setCustomCategoryInput(v.category);
    }

    setPlateNumber(v.plateNumber);
    setPassengers(v.passengers);
    setLuggage(v.luggage);
    setHandLuggage(v.handLuggage ?? 2);
    setDescription(v.description);
    setPricePerKm(v.pricePerKm);
    setBaseFare(v.baseFare);
    setImageUrl(v.imageUrl);
    setIsAvailable(v.isAvailable);
    setHideCard(!!v.hideCard);
    setIsFeatured(!!v.isFeatured);
    setIsDefaultSelected(!!v.isDefaultSelected);
    setDisplayOrder(v.displayOrder ?? 1);
    setFeatures(v.features && v.features.length > 0 ? [...v.features] : ['Dual Climate Air-Con', 'Luggage Space', 'Bottled Water']);
    setNewFeatureInput('');
    setShowModal(true);
  };

  const handleDuplicateVehicle = async (v: Vehicle) => {
    const newId = `veh-${Date.now()}`;
    const duplicated: Omit<Vehicle, 'id'> = {
      ...v,
      name: `${v.name} (Copy)`,
      plateNumber: `${v.plateNumber}-DUP`,
      displayOrder: (v.displayOrder ?? vehicles.length) + 1,
      isDefaultSelected: false,
    };
    const created = await addVehicle(duplicated);
    showNotification(`Duplicated vehicle "${created.name}" created successfully!`);
  };

  const openQuickPhoto = (v: Vehicle) => {
    setQuickPhotoVehicle(v);
    setQuickPhotoUrl(v.imageUrl);
  };

  const handleSaveQuickPhoto = async () => {
    if (!quickPhotoVehicle) return;
    await updateVehicle({
      ...quickPhotoVehicle,
      imageUrl: quickPhotoUrl,
    });
    showNotification(`Photo updated for ${quickPhotoVehicle.name}`);
    setQuickPhotoVehicle(null);
  };

  const handleApplyPhotoToVehicle = async (vehicle: Vehicle, photoUrl: string) => {
    if (!photoUrl) return;
    await updateVehicle({
      ...vehicle,
      imageUrl: photoUrl,
    });
    showNotification(`✓ Photo updated live for ${vehicle.name}! Public website refreshed.`);
  };

  const handleFileUploadForVehicle = async (vehicle: Vehicle, file: File) => {
    setUploadingVehicleId(vehicle.id);
    try {
      const optimized = await optimizeImageToWebP(file, {
        maxWidth: 800,
        maxHeight: 600,
        initialQuality: 0.82,
        maxBytes: 140 * 1024,
      });
      if (optimized.dataUrl) {
        await updateVehicle({
          ...vehicle,
          imageUrl: optimized.dataUrl,
        });
        showNotification(`✓ Photo converted to WebP & saved live for ${vehicle.name}!`);
      } else {
        showNotification('⚠️ Could not process image file. Please try another image.');
      }
    } catch {
      showNotification('⚠️ Image upload error occurred.');
    } finally {
      setUploadingVehicleId(null);
    }
  };

  const handleAutoAssignAllPhotos = async () => {
    let updatedCount = 0;
    for (const v of vehicles) {
      const matchingPreset =
        VEHICLE_PHOTO_PRESETS.find(
          (p) => p.category.toLowerCase() === v.category.toLowerCase()
        ) || VEHICLE_PHOTO_PRESETS[0];

      await updateVehicle({
        ...v,
        imageUrl: matchingPreset.url,
      });
      updatedCount++;
    }
    showNotification(`✓ Successfully refreshed and assigned high-definition photos to all ${updatedCount} vehicles!`);
  };

  const handleAddFeature = () => {
    const trimmed = newFeatureInput.trim();
    if (!trimmed) return;
    if (!features.includes(trimmed)) {
      setFeatures([...features, trimmed]);
    }
    setNewFeatureInput('');
  };

  const handleRemoveFeature = (feat: string) => {
    setFeatures(features.filter((f) => f !== feat));
  };

  const handleTogglePresetAmenity = (preset: string) => {
    if (features.includes(preset)) {
      handleRemoveFeature(preset);
    } else {
      setFeatures([...features, preset]);
    }
  };

  const handleSaveVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showNotification('⚠️ Please enter a Vehicle Name to save!');
      return;
    }

    const safePlate = editingVehicle?.plateNumber || (plateNumber.trim() ? plateNumber.trim().toUpperCase() : `SP CAR-${Math.floor(1000 + Math.random() * 9000)}`);

    // Resolve final category: either custom input or selected preset
    const finalCategory = isCustomCategory && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category === 'CUSTOM' && customCategoryInput.trim()
      ? customCategoryInput.trim()
      : category;

    const vehiclePayload: Omit<Vehicle, 'id'> = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      modelSubtitle: modelSubtitle.trim() || undefined,
      classLabel: classLabel.trim() || undefined,
      category: finalCategory,
      plateNumber: safePlate,
      passengers: Number(passengers),
      luggage: Number(luggage),
      handLuggage: Number(handLuggage),
      description: description.trim(),
      pricePerKm: Number(pricePerKm) || editingVehicle?.pricePerKm || 0,
      baseFare: Number(baseFare) || editingVehicle?.baseFare || 0,
      imageUrl: imageUrl || editingVehicle?.imageUrl || '/assets/images/regenerated_image_1793163512211.png',
      isAvailable,
      hideCard,
      isFeatured,
      isDefaultSelected,
      displayOrder: Number(displayOrder) || 1,
      features: features.length > 0 ? features : ['Dual Climate Air-Con', 'Luggage Space'],
    };

    if (editingVehicle) {
      await updateVehicle({
        ...editingVehicle,
        ...vehiclePayload,
      });
      showNotification(`✓ Vehicle "${name.trim()}" specifications & photo saved live!`);
    } else {
      await addVehicle(vehiclePayload);
      showNotification(`✓ New vehicle "${name.trim()}" added to fleet live!`);
    }

    setShowModal(false);
  };

  const toggleAvailability = async (v: Vehicle) => {
    await updateVehicle({
      ...v,
      isAvailable: !v.isAvailable,
    });
    showNotification(`${v.name} is now ${!v.isAvailable ? 'Active & Available' : 'Inactive / Reserved'}`);
  };

  const toggleHideCard = async (v: Vehicle) => {
    await updateVehicle({
      ...v,
      hideCard: !v.hideCard,
    });
    showNotification(`Public card for "${v.name}" is now ${!v.hideCard ? 'Hidden from carousel' : 'Visible on carousel'}`);
  };

  const handleQuickCategoryChange = async (v: Vehicle, newCat: string) => {
    await updateVehicle({
      ...v,
      category: newCat,
    });
    showNotification(`Category for "${v.name}" changed to ${newCat}`);
  };

  const handleQuickOrderChange = async (v: Vehicle, newOrder: number) => {
    await updateVehicle({
      ...v,
      displayOrder: newOrder,
    });
    showNotification(`Order for "${v.name}" updated to ${newOrder}`);
  };

  const handleDeleteConfirmed = async () => {
    if (!deleteConfirmVehicle) return;
    const vName = deleteConfirmVehicle.name;
    await deleteVehicle(deleteConfirmVehicle.id);
    setDeleteConfirmVehicle(null);
    showNotification(`Vehicle "${vName}" removed from fleet.`);
  };

  const handleResetDefaults = () => {
    resetToSampleData();
    setResetConfirmOpen(false);
    showNotification('Fleet restored to initial standard configuration.');
  };

  return (
    <div className="space-y-6 font-['Outfit']">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#141416] border border-[#F5B91B] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#F5B91B]/20 text-[#F5B91B] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold">{saveSuccessMsg}</span>
        </div>
      )}

      {/* Header & Main Actions (div:nth-of-type(1)) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F5B91B]/10 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B]">
              <Car className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-extrabold text-white">Vehicle Fleet & Booking Management</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Add new vehicles, change names and categories freely, upload photos, manage seating, and synchronize directly with the live booking cards.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setResetConfirmOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#141416] hover:bg-[#1E1E22] border border-[#27272A] hover:border-slate-500 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset fleet to default 6 vehicles"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-lg shadow-[#F5B91B]/15 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ ADD NEW VEHICLE</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner (div:nth-of-type(2)) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Fleet</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{stats.total}</div>
          <span className="text-[10px] text-slate-500">Registered vehicles</span>
        </div>
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Active Online</span>
          <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">{stats.available}</div>
          <span className="text-[10px] text-slate-500">Live for passenger booking</span>
        </div>
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#F5B91B]">Categories</span>
          <div className="text-2xl font-black text-[#F5B91B] mt-1 font-mono">{stats.categoriesCount}</div>
          <span className="text-[10px] text-slate-500">Sedan, Van, SUV & Custom</span>
        </div>
        <div className="bg-[#141416] border border-[#27272A] rounded-xl p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Carousel Active</span>
          <div className="text-2xl font-black text-white mt-1 font-mono">{stats.visibleInCarousel}</div>
          <span className="text-[10px] text-slate-500">Public booking cards</span>
        </div>
      </div>

      {/* Search & Category Filter Bar (div:nth-of-type(3)) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-[#141416] p-3 rounded-2xl border border-[#27272A]">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by vehicle name, model, category..."
            className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F5B91B]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filters and View Toggle */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {['All', ...dynamicCategories].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1.5 rounded-lg font-semibold shrink-0 transition-colors cursor-pointer text-xs ${
                  categoryFilter === cat
                    ? 'bg-[#F5B91B] text-black font-extrabold shadow-sm'
                    : 'bg-[#0B0B0D] text-slate-400 hover:text-white border border-[#27272A]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
          >
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-[#0B0B0D] border border-[#27272A] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-[#F5B91B] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Table View"
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-[#F5B91B] text-black font-bold' : 'text-slate-400 hover:text-white'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="text-[11px] hidden sm:inline">Cards</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Fleet View Container (div:nth-of-type(4)) */}
      <div className="space-y-4">
        {/* View Controls Toolbar (div:nth-of-type(1)) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-bold text-white">
              Showing {filteredVehicles.length} of {vehicles.length} vehicles
            </span>
            {categoryFilter !== 'All' && (
              <span className="px-2 py-0.5 rounded bg-[#F5B91B]/10 text-[#F5B91B] text-[10px] font-bold border border-[#F5B91B]/30">
                Filtered: {categoryFilter}
              </span>
            )}
            {/* Manage All Images / Add Images for All Vehicles Button */}
            <button
              type="button"
              onClick={() => setShowAllPhotosModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#F5B91B] to-[#D4980B] hover:brightness-110 text-black font-extrabold text-xs shadow-md shadow-[#F5B91B]/20 flex items-center gap-1.5 transition-all cursor-pointer border border-[#F5B91B]"
              title="Add or update photos for all vehicles (Upload file, presets, or URLs)"
            >
              <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manage All Images ({vehicles.length})</span>
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] text-slate-500 hidden lg:inline">
              Tip: Click Photo to quickly change vehicle pictures or Edit for full specs.
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0B0B0D] border border-[#27272A] rounded px-2 py-1 text-white text-[11px] focus:outline-none"
              >
                <option value="order">Display Order</option>
                <option value="name">Vehicle Name</option>
                <option value="pax">Passenger Capacity</option>
              </select>
            </div>
          </div>
        </div>

        {/* View Body (div:nth-of-type(2)) */}
        <div className="w-full">
          {filteredVehicles.length === 0 ? (
            <div className="p-12 text-center bg-[#141416] border border-[#27272A] rounded-2xl space-y-3">
              <Car className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No vehicles found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery || categoryFilter !== 'All' || statusFilter !== 'All'
                  ? 'Try adjusting your search query or category filters to find registered vehicles.'
                  : 'Your fleet is currently empty. Click below to add your first vehicle.'}
              </p>
              <button
                type="button"
                onClick={openAddModal}
                className="px-4 py-2 rounded-xl bg-[#F5B91B] text-black font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Add Vehicle Now</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* PROFESSIONAL ADMIN TABLE VIEW (table:nth-of-type(1)) */
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[980px]">
                  <thead>
                    <tr className="border-b border-[#27272A] bg-[#0E0E10] text-[11px] uppercase tracking-wider font-extrabold text-slate-400">
                      {/* th:nth-of-type(1) */}
                      <th className="py-3.5 px-4">Vehicle</th>
                      {/* th:nth-of-type(2) */}
                      <th className="py-3.5 px-3">Category</th>
                      {/* th:nth-of-type(3) */}
                      <th className="py-3.5 px-3">Capacity</th>
                      {/* th:nth-of-type(4) */}
                      <th className="py-3.5 px-3 text-center">Order</th>
                      {/* th:nth-of-type(8) */}
                      <th className="py-3.5 px-3 text-center">Status</th>
                      {/* th:nth-of-type(9) */}
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1F1F24] text-xs">
                    {filteredVehicles.map((veh) => (
                      <tr
                        key={veh.id}
                        className={`hover:bg-[#1A1A1E]/80 transition-colors group ${
                          !veh.isAvailable ? 'opacity-70 bg-black/20' : ''
                        }`}
                      >
                        {/* 1. Vehicle Info & Thumbnail */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-14 h-10 rounded-lg overflow-hidden bg-white border border-[#27272A] shrink-0 group/img flex items-center justify-center p-1 shadow-sm">
                              <img
                                src={veh.imageUrl}
                                alt={veh.name}
                                className="w-full h-full object-contain"
                              />
                              <button
                                type="button"
                                onClick={() => openQuickPhoto(veh)}
                                className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                                title="Change photo"
                              >
                                <Camera className="w-3.5 h-3.5 text-[#F5B91B]" />
                              </button>
                            </div>
                            <div>
                              <div className="font-extrabold text-white text-sm flex items-center gap-1.5">
                                <span>{veh.name}</span>
                                {veh.hideCard && (
                                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-semibold">
                                    Card Hidden
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] text-slate-400">
                                  {veh.modelSubtitle || `${veh.category} Class`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openQuickPhoto(veh)}
                                  className="text-[10px] text-[#F5B91B] hover:underline flex items-center gap-0.5 cursor-pointer font-bold"
                                  title="Quick change image for this vehicle"
                                >
                                  <Camera className="w-2.5 h-2.5" />
                                  <span>Photo</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Category (editable / selector) */}
                        <td className="py-3 px-3">
                          <select
                            value={veh.category}
                            onChange={(e) => handleQuickCategoryChange(veh, e.target.value)}
                            className="bg-[#0B0B0D] border border-[#27272A] hover:border-[#F5B91B] text-[#F5B91B] text-xs font-bold rounded-lg px-2 py-1 focus:outline-none cursor-pointer"
                            title="Click to quickly reassign vehicle category"
                          >
                            {dynamicCategories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* 3. Capacity */}
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3 text-slate-300">
                            <span className="flex items-center gap-1" title="Passengers">
                              <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                              <strong className="font-mono text-white">{veh.passengers}</strong>
                            </span>
                            <span className="flex items-center gap-1" title="Large Luggage">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-mono">{veh.luggage}</span>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 text-[11px]" title="Cabin Bags">
                              <Tag className="w-3 h-3" />
                              <span className="font-mono">{veh.handLuggage ?? 2}</span>
                            </span>
                          </div>
                        </td>



                        {/* 7. Display Order */}
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min={1}
                            max={99}
                            value={veh.displayOrder ?? 1}
                            onChange={(e) => handleQuickOrderChange(veh, parseInt(e.target.value) || 1)}
                            className="w-12 text-center bg-[#0B0B0D] border border-[#27272A] rounded py-0.5 text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                            title="Carousel display order"
                          />
                        </td>

                        {/* 8. Status */}
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleAvailability(veh)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                              veh.isAvailable
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                            }`}
                            title="Click to toggle Active / Reserved"
                          >
                            {veh.isAvailable ? 'Active' : 'Inactive'}
                          </button>
                        </td>

                        {/* 9. Actions (th:nth-of-type(9) matches here!) */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              type="button"
                              onClick={() => setPreviewVehicle(veh)}
                              className="p-1.5 rounded-lg bg-[#1C1C20] hover:bg-[#27272E] text-slate-300 hover:text-white border border-[#27272A] transition-colors cursor-pointer"
                              title="Preview Public Booking Card"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                            </button>

                            {/* Duplicate */}
                            <button
                              type="button"
                              onClick={() => handleDuplicateVehicle(veh)}
                              className="p-1.5 rounded-lg bg-[#1C1C20] hover:bg-[#27272E] text-slate-300 hover:text-white border border-[#27272A] transition-colors cursor-pointer"
                              title="Duplicate Vehicle"
                            >
                              <Copy className="w-3.5 h-3.5 text-[#F5B91B]" />
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => openEditModal(veh)}
                              className="px-2.5 py-1 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Edit Vehicle Details"
                            >
                              <Edit className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmVehicle(veh)}
                              className="p-1.5 rounded-lg bg-red-950/20 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-900/30 transition-colors cursor-pointer"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            /* CARDS GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((veh) => (
                <div
                  key={veh.id}
                  className={`bg-[#141416] border rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between transition-all duration-200 hover:border-[#F5B91B]/50 ${
                    veh.isAvailable ? 'border-[#27272A]' : 'border-red-950/40 opacity-90'
                  }`}
                >
                  <div>
                    {/* Vehicle Photo Container */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-white flex items-center justify-center p-3 border-b border-[#27272A] group/img">
                      <img
                        src={veh.imageUrl}
                        alt={veh.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover/img:scale-105 drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
                      />

                      {/* Category Badge */}
                      <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded bg-black/85 backdrop-blur-md text-[11px] font-bold text-[#F5B91B] border border-[#27272A]">
                        {veh.category}
                      </div>

                      {/* Availability Toggle Pill */}
                      <button
                        type="button"
                        onClick={() => toggleAvailability(veh)}
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md transition-all cursor-pointer shadow-md ${
                          veh.isAvailable
                            ? 'bg-emerald-500/90 hover:bg-emerald-600 text-white border border-emerald-400/40'
                            : 'bg-rose-600/90 hover:bg-rose-700 text-white border border-rose-400/40'
                        }`}
                        title="Click to toggle availability"
                      >
                        {veh.isAvailable ? '● Active' : '○ Inactive'}
                      </button>

                      {/* Class Label / Subtitle Badge */}
                      {veh.classLabel && (
                        <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-slate-300 border border-[#27272A] font-semibold">
                          {veh.classLabel}
                        </div>
                      )}

                      {/* Quick Change Photo Button */}
                      <button
                        type="button"
                        onClick={() => openQuickPhoto(veh)}
                        className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-black/85 hover:bg-[#F5B91B] text-slate-200 hover:text-black text-[11px] font-bold border border-[#27272A] hover:border-[#F5B91B] backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer opacity-95 group-hover/img:opacity-100"
                        title="Quick Change Vehicle Image"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>Photo</span>
                      </button>
                    </div>

                    {/* Details Content */}
                    <div className="p-5 space-y-3.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-extrabold text-white text-base leading-snug">{veh.name}</h3>
                          {veh.modelSubtitle && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{veh.modelSubtitle}</p>
                          )}
                        </div>
                      </div>

                      {/* Passenger & Luggage Limits */}
                      <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#1F1F23] text-xs text-slate-300 bg-[#0B0B0D]/50 rounded-xl px-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span className="font-semibold">{veh.passengers} Seats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-[#F5B91B]" />
                          <span className="font-semibold">{veh.luggage} Bags</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-slate-400">{veh.handLuggage ?? 2} Hand</span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {veh.description}
                      </p>

                      {/* Amenities / Features Tags */}
                      {veh.features && veh.features.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {veh.features.slice(0, 3).map((feat, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#1C1C20] border border-[#27272A] text-[10px] text-slate-300 font-medium"
                            >
                              {feat}
                            </span>
                          ))}
                          {veh.features.length > 3 && (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#1C1C20] border border-[#27272A] text-[10px] text-slate-500 font-mono">
                              +{veh.features.length - 3} more
                            </span>
                          )}
                        </div>
                      )}


                    </div>
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="p-5 pt-0 grid grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewVehicle(veh)}
                      className="py-2 px-2 rounded-xl bg-[#1A1A1E] hover:bg-[#27272E] text-slate-300 hover:text-white border border-[#27272A] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Preview Public Card"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicateVehicle(veh)}
                      className="py-2 px-2 rounded-xl bg-[#1A1A1E] hover:bg-[#27272E] text-slate-300 hover:text-white border border-[#27272A] text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Duplicate Vehicle"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Copy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => openEditModal(veh)}
                      className="py-2 px-2 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Edit Specifications"
                    >
                      <Edit className="w-3.5 h-3.5 text-[#F5B91B]" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmVehicle(veh)}
                      className="py-2 px-2 rounded-xl bg-red-950/30 hover:bg-red-900/60 text-red-300 hover:text-red-100 border border-red-900/40 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      title="Delete Vehicle"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      <span>Del</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Add / Edit Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A] gap-2">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-[#F5B91B]" />
                  <span>{editingVehicle ? 'Edit Vehicle Specifications' : 'Add New Vehicle to Fleet'}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingVehicle ? `Editing ${editingVehicle.name}` : 'Create a new vehicle with custom name, category, and amenities.'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleSaveVehicle(e as any)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs shadow-md cursor-pointer flex items-center gap-1.5 transition-all"
                  title="Save and update live website now"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Live</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-lg bg-[#1E1E22] hover:bg-[#27272A] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveVehicle} className="space-y-5">
              {/* Row 1: Vehicle Name & Model Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Vehicle Name / Headline *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. TOYOTA KDH HIGH-ROOF VAN, BUDGET MINI CAR"
                    required
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Model & Makes Subtitle</label>
                  <input
                    type="text"
                    value={modelSubtitle}
                    onChange={(e) => setModelSubtitle(e.target.value)}
                    placeholder="e.g. Toyota KDH Commuter GL / HiAce 200"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>
              </div>

              {/* Row 2: Category (Standard or Custom!) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#0B0B0D] p-3.5 rounded-xl border border-[#27272A]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>Vehicle Category *</span>
                    <span className="text-[10px] text-[#F5B91B]">Choose preset or custom</span>
                  </label>
                  <select
                    value={isCustomCategory ? 'CUSTOM' : category}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setCategory(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  >
                    {STANDARD_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM">+ Enter Custom Category...</option>
                  </select>
                </div>

                {/* If Custom Category is Selected, show input */}
                {isCustomCategory ? (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#F5B91B]">Type Custom Category Name *</label>
                    <input
                      type="text"
                      value={customCategoryInput}
                      onChange={(e) => setCustomCategoryInput(e.target.value)}
                      placeholder="e.g. Tuk Tuk, VIP Coach, Hybrid Mini"
                      required
                      className="w-full px-3 py-2 bg-[#141416] border border-[#F5B91B] rounded-xl text-xs text-white focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-300">Class Label Badge (Optional)</label>
                    <input
                      type="text"
                      value={classLabel}
                      onChange={(e) => setClassLabel(e.target.value)}
                      placeholder="e.g. Executive Business Class, Economy Class"
                      className="w-full px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                )}
              </div>

              {/* Row 3: Display Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Display Order in Booking Carousel</label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              {/* Row 4: Capacities: Passengers, Luggage, Hand Luggage */}
              <div className="grid grid-cols-3 gap-4 bg-[#0B0B0D] p-3.5 rounded-xl border border-[#27272A]">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>Max Pax</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={passengers}
                    onChange={(e) => setPassengers(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>Suitcases</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    value={luggage}
                    onChange={(e) => setLuggage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cabin Bags</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={30}
                    value={handLuggage}
                    onChange={(e) => setHandLuggage(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Customer Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Spacious vehicle description for guests booking rides..."
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              {/* Amenities / Features Manager */}
              <div className="space-y-2 bg-[#0B0B0D] p-3.5 rounded-xl border border-[#27272A]">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>Included Amenities & Feature Tags</span>
                  </label>
                  <span className="text-[10px] text-slate-500">{features.length} selected</span>
                </div>

                {/* Selected tags */}
                <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg bg-[#141416] border border-[#27272A]">
                  {features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-[#1F1F24] border border-[#2E2E34] text-xs text-slate-200 flex items-center gap-1.5 font-medium"
                    >
                      <span>{feat}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(feat)}
                        className="text-slate-400 hover:text-red-400 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {features.length === 0 && (
                    <span className="text-xs text-slate-500 italic py-0.5">
                      No tags added yet. Choose from presets below or type a custom tag.
                    </span>
                  )}
                </div>

                {/* Custom tag input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureInput}
                    onChange={(e) => setNewFeatureInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    placeholder="Type custom amenity (e.g. WiFi, Surfboard Rack) and click Add..."
                    className="flex-1 px-3 py-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Tag
                  </button>
                </div>

                {/* Popular Presets */}
                <div className="pt-2">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-1.5">
                    Click to add quick presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {POPULAR_AMENITY_PRESETS.map((preset) => {
                      const isAdded = features.includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => handleTogglePresetAmenity(preset)}
                          className={`text-[10px] px-2 py-1 rounded-md border transition-all cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-[#F5B91B]/20 text-[#F5B91B] border-[#F5B91B]/50 font-bold'
                              : 'bg-[#141416] text-slate-400 hover:text-white border-[#27272A]'
                          }`}
                        >
                          {isAdded && <Check className="w-2.5 h-2.5 text-[#F5B91B]" />}
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Vehicle Photo Upload Component */}
              <div className="pt-3 border-t border-[#27272A] space-y-2">
                <ImageUploader
                  value={imageUrl}
                  onChange={(newUrl) => {
                    setImageUrl(newUrl);
                    if (editingVehicle && newUrl) {
                      setEditingVehicle((prev) => (prev ? { ...prev, imageUrl: newUrl } : null));
                    }
                  }}
                  onAutoApply={async (newUrl) => {
                    setImageUrl(newUrl);
                    if (editingVehicle && newUrl) {
                      const updated = {
                        ...editingVehicle,
                        name: name.trim() || editingVehicle.name,
                        imageUrl: newUrl,
                      };
                      setEditingVehicle(updated);
                      await updateVehicle(updated);
                      showNotification(`✓ Image updated live for ${updated.name}! Public website refreshed.`);
                    }
                  }}
                  label="Vehicle Photo (Upload JPG/PNG, Enter URL or Select Preset)"
                  aspectRatio="wide"
                />
              </div>

              {/* Visibility and Display Settings */}
              <div className="space-y-3 pt-2 border-t border-[#27272A]">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="vehAvail"
                    checked={isAvailable}
                    onChange={(e) => setIsAvailable(e.target.checked)}
                    className="w-4 h-4 rounded border-[#27272A] text-[#F5B91B] focus:ring-[#F5B91B] cursor-pointer"
                  />
                  <label htmlFor="vehAvail" className="text-xs text-slate-200 font-bold cursor-pointer">
                    Vehicle Active & Available for Public Online Booking
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="hideCard"
                    checked={hideCard}
                    onChange={(e) => setHideCard(e.target.checked)}
                    className="w-4 h-4 rounded border-[#27272A] text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="hideCard" className="text-xs text-slate-300 cursor-pointer">
                    Hide Card from Homepage Carousel (Keep available for direct admin booking only)
                  </label>
                </div>

                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="defaultSel"
                    checked={isDefaultSelected}
                    onChange={(e) => setIsDefaultSelected(e.target.checked)}
                    className="w-4 h-4 rounded border-[#27272A] text-[#F5B91B] focus:ring-[#F5B91B] cursor-pointer"
                  />
                  <label htmlFor="defaultSel" className="text-xs text-slate-300 cursor-pointer">
                    Default Selected Vehicle on initial page load
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>{editingVehicle ? 'Update Vehicle' : 'Create Vehicle Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Booking Card Preview Modal */}
      {previewVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[#F5B91B]" />
                  <span>Public Booking Card Preview</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How guests see this vehicle card on the live booking page
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVehicle(null)}
                className="w-7 h-7 rounded-lg bg-[#1E1E22] hover:bg-[#27272A] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Render realistic card */}
            <div className="bg-[#18181E] border border-white/20 rounded-xl p-4 space-y-3 relative shadow-2xl">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded bg-black/80 text-[10px] font-bold text-[#F5B91B] border border-[#27272A]">
                  {previewVehicle.category}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                  {previewVehicle.isAvailable ? 'Active for Booking' : 'Reserved'}
                </span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#121214]">
                <img
                  src={previewVehicle.imageUrl}
                  alt={previewVehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-white">{previewVehicle.name}</h4>
                <p className="text-xs text-slate-400">{previewVehicle.modelSubtitle || `${previewVehicle.category} Class`}</p>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 border-y border-[#27272A] text-xs text-slate-300">
                <span className="flex items-center gap-1 font-semibold">
                  <Users className="w-3.5 h-3.5 text-[#F5B91B]" /> {previewVehicle.passengers} Seats
                </span>
                <span className="flex items-center gap-1 font-semibold">
                  <Briefcase className="w-3.5 h-3.5 text-[#F5B91B]" /> {previewVehicle.luggage} Bags
                </span>
                <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                  <Tag className="w-3 h-3" /> {previewVehicle.handLuggage ?? 2} Hand
                </span>
              </div>

            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPreviewVehicle(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewVehicle(null);
                  openEditModal(previewVehicle);
                }}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] text-black font-extrabold text-xs cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Vehicle</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Quick Photo Edit Modal */}
      {quickPhotoVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#F5B91B]" />
                  <span>Update Vehicle Photo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {quickPhotoVehicle.name} • {quickPhotoVehicle.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickPhotoVehicle(null)}
                className="w-7 h-7 rounded-lg bg-[#1E1E22] hover:bg-[#27272A] text-slate-400 hover:text-white flex items-center justify-center text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <ImageUploader
              value={quickPhotoUrl}
              onChange={setQuickPhotoUrl}
              onAutoApply={async (newUrl) => {
                setQuickPhotoUrl(newUrl);
                if (quickPhotoVehicle) {
                  await updateVehicle({
                    ...quickPhotoVehicle,
                    imageUrl: newUrl,
                  });
                  showNotification(`✓ Photo updated live for ${quickPhotoVehicle.name}! Public website refreshed.`);
                }
              }}
              label="Select or Upload New Photo"
              aspectRatio="wide"
            />

            <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setQuickPhotoVehicle(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickPhoto}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141416] border border-red-900/60 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Vehicle?</h3>
                <p className="text-xs text-slate-400">
                  This action removes this vehicle card from the website, carousel, and booking options.
                </p>
              </div>
            </div>

            <div className="bg-[#0B0B0D] p-3 rounded-xl border border-[#27272A] space-y-1">
              <div className="text-xs font-bold text-white">{deleteConfirmVehicle.name}</div>
              <div className="text-[11px] font-mono text-slate-400">
                Category: <span className="text-[#F5B91B] font-bold">{deleteConfirmVehicle.category}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmVehicle(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Keep Vehicle
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirmed}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Confirm Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/15 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B] shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Restore Standard Fleet?</h3>
                <p className="text-xs text-slate-400">
                  This will reload the default set of Galle Taxi vehicles (Budget Mini Car, Executive Sedan, Shuttle Van, VIP KDH, Prado SUV, High-Roof Van).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restore Fleet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* ALL VEHICLES IMAGE GALLERY & BATCH MANAGER MODAL          */}
      {/* (සියලුම වාහන වල Images එකවර කළමනාකරණය)                   */}
      {/* ======================================================== */}
      {showAllPhotosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md overflow-hidden animate-in fade-in">
          <div className="bg-[#121214] border border-[#27272A] rounded-2xl max-w-5xl w-full p-4 sm:p-6 space-y-4 shadow-2xl max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A] shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#F5B91B]/20 text-[#F5B91B] flex items-center justify-center">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <span>Manage All Fleet Images</span>
                      <span className="text-[11px] font-normal text-slate-400 font-mono">
                        ({vehicles.length} Vehicles)
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      Upload photos from your device, choose high-res transparent presets, or paste web image URLs for each vehicle.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleAutoAssignAllPhotos}
                  className="px-3.5 py-1.5 rounded-xl bg-[#1E1E24] hover:bg-[#2A2A32] border border-[#F5B91B]/40 text-[#F5B91B] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-[#F5B91B]"
                  title="Auto-fill high-resolution Sri Lanka fleet cutouts matching each vehicle category"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Auto-Apply Standard Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAllPhotosModal(false)}
                  className="w-8 h-8 rounded-xl bg-[#1E1E24] hover:bg-[#27272A] text-slate-400 hover:text-white flex items-center justify-center text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Presets Showcase Ribbon */}
            <div className="p-3 bg-[#0B0B0D] rounded-xl border border-[#27272A] shrink-0">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-bold uppercase tracking-wider text-[#F5B91B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Available High-Definition Fleet Presets</span>
                </span>
                <span className="text-slate-500">Click any preset inside a vehicle card below to apply it</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {VEHICLE_PHOTO_PRESETS.map((preset) => (
                  <div
                    key={preset.label}
                    className="p-1.5 bg-[#141416] border border-[#27272A] rounded-lg text-center flex flex-col items-center justify-between gap-1 group hover:border-[#F5B91B]/60 transition-colors"
                  >
                    <div className="w-full h-10 bg-white rounded flex items-center justify-center p-0.5 overflow-hidden">
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 truncate w-full">
                      {preset.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pb-2 shrink-0">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                {['All', ...dynamicCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setAllPhotosFilterCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer transition-colors ${
                      allPhotosFilterCategory === cat
                        ? 'bg-[#F5B91B] text-black font-extrabold shadow-sm'
                        : 'bg-[#18181C] text-slate-400 hover:text-white border border-[#27272A]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={allPhotosSearch}
                  onChange={(e) => setAllPhotosSearch(e.target.value)}
                  placeholder="Filter vehicles..."
                  className="w-full pl-8 pr-3 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F5B91B]"
                />
              </div>
            </div>

            {/* Scrollable Vehicle Photo Cards List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3.5">
              {vehicles
                .filter((v) => {
                  const matchCat =
                    allPhotosFilterCategory === 'All' || v.category === allPhotosFilterCategory;
                  const matchSearch =
                    v.name.toLowerCase().includes(allPhotosSearch.toLowerCase()) ||
                    v.category.toLowerCase().includes(allPhotosSearch.toLowerCase()) ||
                    v.plateNumber.toLowerCase().includes(allPhotosSearch.toLowerCase());
                  return matchCat && matchSearch;
                })
                .map((veh) => {
                  const currentUrlInput = customUrlInputs[veh.id] || '';
                  return (
                    <div
                      key={veh.id}
                      className="p-4 bg-[#141416] border border-[#27272A] hover:border-slate-600 rounded-xl flex flex-col md:flex-row gap-4 transition-all"
                    >
                      {/* Left: Thumbnail & Core Specs */}
                      <div className="flex items-center gap-3 md:w-64 shrink-0">
                        <div className="relative w-28 h-20 bg-white rounded-xl border border-[#27272A] flex items-center justify-center p-1.5 shrink-0 overflow-hidden shadow-md">
                          <img
                            src={veh.imageUrl}
                            alt={veh.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-bold text-[#F5B91B] bg-[#0B0B0D] px-2 py-0.5 rounded border border-[#27272A]">
                              {veh.category}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-white text-sm mt-1 truncate">
                            {veh.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 block truncate">
                            {veh.passengers} Pax • {veh.luggage} Bags
                          </span>
                        </div>
                      </div>

                      {/* Right: Image Update Options */}
                      <div className="flex-1 space-y-2.5">
                        {/* Row 1: Direct File Upload & Preset Chips */}
                        <div className="flex flex-wrap items-center gap-2">
                          {/* File Upload from Device */}
                          <label className="px-3 py-1.5 rounded-lg bg-[#24242A] hover:bg-[#F5B91B] hover:text-black text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-colors shadow-sm">
                            <Upload className="w-3.5 h-3.5 text-[#F5B91B] group-hover:text-black" />
                            <span>
                              {uploadingVehicleId === veh.id ? 'Converting WebP...' : 'Upload From Device'}
                            </span>
                            <input
                              type="file"
                              accept="image/*,.png,.jpg,.jpeg,.webp"
                              className="hidden"
                              disabled={uploadingVehicleId === veh.id}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                e.target.value = '';
                                if (file) {
                                  handleFileUploadForVehicle(veh, file);
                                }
                              }}
                            />
                          </label>

                          {/* Quick Preset Selector Chips */}
                          <span className="text-[11px] text-slate-500 font-medium">Or Preset:</span>
                          {VEHICLE_PHOTO_PRESETS.map((p) => {
                            const isCurrent = veh.imageUrl === p.url;
                            return (
                              <button
                                key={p.label}
                                type="button"
                                onClick={() => handleApplyPhotoToVehicle(veh, p.url)}
                                className={`text-[10px] px-2 py-1 rounded-md font-bold transition-all cursor-pointer flex items-center gap-1 ${
                                  isCurrent
                                    ? 'bg-[#F5B91B] text-black shadow-sm'
                                    : 'bg-[#0B0B0D] text-slate-400 hover:text-white border border-[#27272A] hover:border-[#F5B91B]'
                                }`}
                                title={`Apply ${p.label}`}
                              >
                                {isCurrent && <Check className="w-2.5 h-2.5" />}
                                <span>{p.category}</span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Row 2: Paste Custom Web Image URL */}
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={currentUrlInput}
                            onChange={(e) =>
                              setCustomUrlInputs((prev) => ({
                                ...prev,
                                [veh.id]: e.target.value,
                              }))
                            }
                            placeholder="Or paste external image URL (e.g. https://... or /src/assets/...)"
                            className="flex-1 px-3 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#F5B91B]"
                          />
                          <button
                            type="button"
                            disabled={!currentUrlInput.trim()}
                            onClick={async () => {
                              if (!currentUrlInput.trim()) return;
                              await handleApplyPhotoToVehicle(veh, currentUrlInput.trim());
                              setCustomUrlInputs((prev) => ({
                                ...prev,
                                [veh.id]: '',
                              }));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-bold disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
                          >
                            Apply URL
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewVehicle(veh)}
                            className="p-1.5 rounded-lg bg-[#1C1C20] hover:bg-[#27272E] text-slate-400 hover:text-white border border-[#27272A] transition-colors cursor-pointer"
                            title="Preview Public Booking Card"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-[#27272A] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <span className="text-xs text-slate-400">
                All image modifications take effect live immediately across the passenger booking engine and public homepage carousel.
              </span>
              <button
                type="button"
                onClick={() => setShowAllPhotosModal(false)}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer self-end sm:self-auto"
              >
                Done / Close Gallery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
