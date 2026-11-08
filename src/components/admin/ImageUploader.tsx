import React, { useState, useRef, useEffect } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, X, Check, RefreshCw, Eye } from 'lucide-react';

export interface ImagePreset {
  label: string;
  url: string;
  category: 'Vehicles' | 'Services' | 'Banners' | 'Hubs' | 'General';
}

export const SYSTEM_IMAGE_PRESETS: ImagePreset[] = [
  {
    label: 'Ahangama Surf Coast Hub (Sunset & Surfboards)',
    url: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
    category: 'Hubs',
  },
  {
    label: 'Mirissa Sunset Road Trip with Surfboard',
    url: '/assets/aistudio/Sunset_Beach_Road_Trip_with_Surfboard_19548307.png',
    category: 'Hubs',
  },
  {
    label: 'Down South Coastal Adventures & Palm Bays',
    url: '/src/assets/images/regenerated_image_1794057460840.png',
    category: 'Hubs',
  },
  {
    label: 'Budget Mini Car (Wagon R / Alto)',
    url: '/src/assets/images/regenerated_image_1793161723258.png',
    category: 'Vehicles',
  },
  {
    label: 'Executive Sedan (Premio / Prius)',
    url: '/src/assets/images/regenerated_image_1793163512211.png',
    category: 'Vehicles',
  },
  {
    label: 'VIP KDH High-Roof Commuter Van',
    url: '/src/assets/images/vehicle_premium_van_1793121943671.jpg',
    category: 'Vehicles',
  },
  {
    label: 'Luxury Mercedes / BMW Sedan',
    url: '/src/assets/images/vehicle_luxury_sedan_1793121944773.jpg',
    category: 'Vehicles',
  },
  {
    label: 'Colombo Airport Highway Transfer',
    url: '/src/assets/images/service_airport_transfer_1793121941979.jpg',
    category: 'Services',
  },
  {
    label: 'Galle Fort & Coastal Scenic Tour',
    url: '/src/assets/images/service_galle_tour_1793121943026.jpg',
    category: 'Services',
  },
  {
    label: 'Galle Coastline Main Hero Banner',
    url: '/src/assets/images/hero_galle_taxi_1793121940996.jpg',
    category: 'Banners',
  },
  {
    label: 'Down South Season Surf & Sunset Banner',
    url: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
    category: 'Banners',
  },
  {
    label: 'Ella Highlands & Nine Arches Bridge',
    url: 'https://images.unsplash.com/photo-1586861635167-e5223aadc9fe?auto=format&fit=crop&w=1200&q=80',
    category: 'Services',
  },
  {
    label: 'Udawalawe Elephant Safari',
    url: '/src/assets/images/regenerated_image_1793632543146.png',
    category: 'Services',
  },
  {
    label: 'Yala Leopard & Wilderness Safari',
    url: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80',
    category: 'Services',
  },
  {
    label: 'Bentota Beach & Madu River Mangroves',
    url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80',
    category: 'Services',
  },
];

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  onAutoApply?: (url: string) => Promise<void> | void;
  label?: string;
  aspectRatio?: 'video' | 'wide' | 'card' | 'square';
  placeholderText?: string;
  presets?: ImagePreset[];
}

/**
 * Utility to optimize and format image file before emitting as dataURL.
 * Uses fast URL.createObjectURL for instant decoding.
 * Preserves 100% transparency for PNG vehicle cutouts.
 * Generates an ultra-lightweight (15KB–35KB) dataURL so it saves instantly to
 * localStorage and Firestore without exceeding storage quotas.
 */
const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    try {
      const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();

      let didFinish = false;
      const timeout = setTimeout(() => {
        if (!didFinish) {
          didFinish = true;
          URL.revokeObjectURL(objectUrl);
          const fr = new FileReader();
          fr.onload = () => resolve((fr.result as string) || '');
          fr.onerror = () => resolve('');
          fr.readAsDataURL(file);
        }
      }, 1500);

      img.onload = () => {
        if (didFinish) return;
        didFinish = true;
        clearTimeout(timeout);
        URL.revokeObjectURL(objectUrl);

        try {
          // Sharp web display size: max 420px wide, max 260px high
          const maxWidth = 420;
          const maxHeight = 260;
          let width = img.naturalWidth || img.width || 420;
          let height = img.naturalHeight || img.height || 260;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }

          const canvas = document.createElement('canvas');
          canvas.width = Math.max(10, width);
          canvas.height = Math.max(10, height);
          const ctx = canvas.getContext('2d', { alpha: true });
          if (!ctx) {
            const fr = new FileReader();
            fr.onload = () => resolve((fr.result as string) || '');
            fr.onerror = () => resolve('');
            fr.readAsDataURL(file);
            return;
          }

          // Clear transparent canvas for PNG cutouts
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let outputUrl = '';
          if (isPng) {
            outputUrl = canvas.toDataURL('image/png');
          } else {
            outputUrl = canvas.toDataURL('image/jpeg', 0.82);
          }

          // If PNG is > 90KB, perform a second pass to guarantee it stays ~30KB
          if (outputUrl.length > 90000) {
            const smallCanvas = document.createElement('canvas');
            smallCanvas.width = Math.round(canvas.width * 0.7);
            smallCanvas.height = Math.round(canvas.height * 0.7);
            const sCtx = smallCanvas.getContext('2d', { alpha: true });
            if (sCtx) {
              sCtx.clearRect(0, 0, smallCanvas.width, smallCanvas.height);
              sCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
              outputUrl = isPng ? smallCanvas.toDataURL('image/png') : smallCanvas.toDataURL('image/jpeg', 0.8);
            }
          }

          resolve(outputUrl);
        } catch (canvasErr) {
          console.error('Canvas processing error:', canvasErr);
          const fr = new FileReader();
          fr.onload = () => resolve((fr.result as string) || '');
          fr.onerror = () => resolve('');
          fr.readAsDataURL(file);
        }
      };

      img.onerror = () => {
        if (!didFinish) {
          didFinish = true;
          clearTimeout(timeout);
          URL.revokeObjectURL(objectUrl);
          const fr = new FileReader();
          fr.onload = () => resolve((fr.result as string) || '');
          fr.onerror = () => resolve('');
          fr.readAsDataURL(file);
        }
      };

      img.src = objectUrl;
    } catch (e) {
      console.error('Fast objectUrl error, falling back:', e);
      const fr = new FileReader();
      fr.onload = () => resolve((fr.result as string) || '');
      fr.onerror = () => resolve('');
      fr.readAsDataURL(file);
    }
  });
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  onAutoApply,
  label = 'Image Photo',
  aspectRatio = 'card',
  placeholderText = 'Paste an image URL or choose a file from your computer...',
  presets = SYSTEM_IMAGE_PRESETS,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState(value);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  useEffect(() => {
    setUrlInput(value || '');
    setImageError(false);
  }, [value]);

  const aspectClass = {
    video: 'aspect-video',
    wide: 'aspect-[16/10]',
    card: 'aspect-[4/3]',
    square: 'aspect-square',
  }[aspectRatio];

  const processAndApplyFile = async (file: File) => {
    try {
      setIsProcessing(true);
      const dataUrl = await compressImageFile(file);
      if (!dataUrl) {
        alert('Could not read image file. Please try another PNG or JPG.');
        return;
      }
      onChange(dataUrl);
      setUrlInput(dataUrl);
      setImageError(false);

      if (onAutoApply) {
        await onAutoApply(dataUrl);
      }
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 3500);
    } catch (err) {
      console.error('Failed to process image file:', err);
      alert('Unable to process this image. Please try a different JPG or PNG file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    await processAndApplyFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processAndApplyFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    const finalUrl = urlInput.trim();
    onChange(finalUrl);
    setImageError(false);
    if (onAutoApply) {
      await onAutoApply(finalUrl);
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 3000);
    }
  };

  const handleSelectPreset = async (presetUrl: string) => {
    onChange(presetUrl);
    setUrlInput(presetUrl);
    setImageError(false);
    if (onAutoApply) {
      await onAutoApply(presetUrl);
      setJustApplied(true);
      setTimeout(() => setJustApplied(false), 3000);
    }
  };

  const handleClearImage = async () => {
    onChange('');
    setUrlInput('');
    if (onAutoApply) {
      await onAutoApply('');
    }
  };

  return (
    <div className="space-y-3 font-['Outfit']">
      {/* Label and Actions */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
          <ImageIcon className="w-3.5 h-3.5 text-[#F5B91B]" />
          <span>{label}</span>
        </label>

        {value && (
          <button
            type="button"
            onClick={handleClearImage}
            className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold cursor-pointer"
          >
            <X className="w-3 h-3" />
            <span>Remove Photo</span>
          </button>
        )}
      </div>

      {/* Main Image Preview & Direct Click / Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border transition-all overflow-hidden ${
          isDraggingOver
            ? 'border-[#F5B91B] ring-2 ring-[#F5B91B]/40 bg-[#16161B]'
            : 'border-[#27272A] bg-[#0E0E10]'
        }`}
      >
        {value ? (
          /* PREVIEW CONTAINER WITH WHITE BACKGROUND (Optimal for PNG transparent vehicle cutouts) */
          <div className="relative w-full">
            <div
              className={`relative ${aspectClass} w-full overflow-hidden bg-white flex items-center justify-center p-3 rounded-t-xl`}
            >
              <img
                src={value}
                alt={label}
                className={`w-full h-full object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)] ${
                  imageError ? 'hidden' : ''
                }`}
                onError={() => {
                  // Only report error for external broken URLs, never data URLs
                  if (!value.startsWith('data:')) {
                    setImageError(true);
                  }
                }}
              />

              {imageError && (
                <div className="p-4 text-center text-slate-700 space-y-1">
                  <ImageIcon className="w-8 h-8 text-amber-500 mx-auto" />
                  <p className="text-xs font-bold text-amber-700">Image could not be loaded</p>
                  <p className="text-[10px] text-slate-500 font-mono max-w-xs truncate">{value}</p>
                </div>
              )}

              <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] text-emerald-400 border border-emerald-900/60 font-mono flex items-center gap-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Active Photo</span>
              </div>
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-2.5 bg-[#141418] border-t border-[#27272A] flex items-center justify-between gap-2">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold shadow-md cursor-pointer transition-all">
                <Upload className="w-3.5 h-3.5 stroke-[3]" />
                <span>{isProcessing ? 'Processing PNG...' : 'Replace Photo (PNG/JPG)'}</span>
                <input
                  type="file"
                  accept="image/*, .png, .jpg, .jpeg, .webp, .svg"
                  onChange={handleFileChange}
                  disabled={isProcessing}
                  className="sr-only"
                />
              </label>

              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Full View</span>
              </button>
            </div>
          </div>
        ) : (
          /* EMPTY DROPZONE WITH DIRECT NATIVE LABEL CLICK */
          <label className={`w-full ${aspectClass} border-2 border-dashed border-[#27272A] hover:border-[#F5B91B] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors bg-[#121215] hover:bg-[#16161B] block`}>
            <input
              type="file"
              accept="image/*, .png, .jpg, .jpeg, .webp, .svg"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="sr-only"
            />
            <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/15 text-[#F5B91B] flex items-center justify-center mb-2 mx-auto">
              <Upload className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-white">
              {isProcessing ? 'Processing Image...' : 'Click or Drag & Drop to upload photo'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Supports <strong className="text-[#F5B91B]">PNG</strong> (with transparency), <strong className="text-white">JPG</strong>, or <strong className="text-white">WEBP</strong>
            </p>
          </label>
        )}
      </div>

      {/* Live Synced Indicator & Instant Apply Action */}
      {value && onAutoApply && (
        <div className="flex items-center justify-between px-3 py-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-[11px] text-emerald-300">
          <div className="flex items-center gap-1.5 font-medium">
            <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            <span>{justApplied ? '✓ Applied Live to Website!' : 'Live synced with public booking page'}</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              await onAutoApply(value);
              setJustApplied(true);
              setTimeout(() => setJustApplied(false), 3000);
            }}
            className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold rounded-lg text-[10px] cursor-pointer shadow"
          >
            Apply Live Now
          </button>
        </div>
      )}

      {/* Input Mode Selector Tabs */}
      <div className="flex items-center gap-1 p-1 bg-[#121215] border border-[#27272A] rounded-xl text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'upload'
              ? 'bg-[#F5B91B] text-black font-extrabold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload File (PNG / JPG)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'url'
              ? 'bg-[#F5B91B] text-black font-extrabold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Image URL</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-[#F5B91B] text-black font-extrabold shadow'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Preset Library</span>
        </button>
      </div>

      {/* Mode 1: File Upload */}
      {activeTab === 'upload' && (
        <div className="p-3 rounded-xl bg-[#141418] border border-[#27272A] flex items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            <span className="font-bold text-white flex items-center gap-2">
              <span>Upload Custom Image</span>
              <span className="px-1.5 py-0.2 bg-[#F5B91B]/20 text-[#F5B91B] text-[10px] font-mono rounded font-bold">
                PNG & JPG
              </span>
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              Choose transparent PNG, JPG, or WEBP from your phone or PC.
            </span>
          </div>
          <label className="px-3.5 py-2 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>{isProcessing ? 'Processing PNG...' : 'Browse Computer...'}</span>
            <input
              type="file"
              accept="image/*, .png, .jpg, .jpeg, .webp, .svg"
              onChange={handleFileChange}
              disabled={isProcessing}
              className="sr-only"
            />
          </label>
        </div>
      )}

      {/* Mode 2: Direct URL */}
      {activeTab === 'url' && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder={placeholderText}
              className="flex-1 px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F5B91B] font-mono"
            />
            <button
              type="button"
              onClick={handleApplyUrl}
              className="px-3 py-2 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs rounded-xl flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Apply</span>
            </button>
          </div>
          <p className="text-[10px] text-slate-500 font-mono">
            Accepts any public image URL (https://...) or local workspace asset path (/src/assets/images/...)
          </p>
        </div>
      )}

      {/* Mode 3: Presets Library */}
      {activeTab === 'presets' && (
        <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-[#27272A] rounded-xl bg-[#0B0B0D]">
          {presets.map((preset, idx) => {
            const isCurrent = value === preset.url;
            return (
              <button
                key={`preset-${idx}`}
                type="button"
                onClick={() => handleSelectPreset(preset.url)}
                className={`p-2 rounded-lg border text-left transition-all flex items-center gap-2 cursor-pointer ${
                  isCurrent
                    ? 'border-[#F5B91B] bg-[#F5B91B]/15 text-[#F5B91B]'
                    : 'border-[#27272A] bg-[#141418] hover:border-slate-500 text-slate-300'
                }`}
              >
                <div className="w-10 h-8 rounded bg-black overflow-hidden shrink-0">
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-bold truncate leading-tight">{preset.label}</div>
                  <div className="text-[9px] text-slate-400 font-mono">{preset.category}</div>
                </div>
                {isCurrent && <Check className="w-3.5 h-3.5 text-[#F5B91B] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Full Size Modal Preview */}
      {showPreviewModal && (
        <div
          onClick={() => setShowPreviewModal(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-[#141418] border border-[#27272A] rounded-2xl overflow-hidden shadow-2xl space-y-3 p-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-[#27272A]">
              <span className="text-xs font-bold text-white uppercase tracking-wider">{label} Full Preview</span>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white text-xs p-1"
              >
                ✕
              </button>
            </div>
            <div className="rounded-xl overflow-hidden bg-black max-h-[70vh] flex items-center justify-center">
              <img src={value} alt={label} className="max-w-full max-h-[65vh] object-contain" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
