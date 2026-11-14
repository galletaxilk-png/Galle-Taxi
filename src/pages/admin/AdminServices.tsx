import React, { useState } from 'react';
import { Briefcase, Plus, Edit, CheckCircle2, Trash2, Camera, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../../lib/store';
import { Service } from '../../types';
import { formatLKR } from '../../lib/fareEngine';
import { ImageUploader } from '../../components/admin/ImageUploader';
import { OptimizedImage } from '../../components/OptimizedImage';

export const AdminServices: React.FC = () => {
  const { services, updateService, addService } = useApp();
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [quickPhotoService, setQuickPhotoService] = useState<Service | null>(null);
  const [quickPhotoUrl, setQuickPhotoUrl] = useState('');

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [startingFromLkr, setStartingFromLkr] = useState(25000);
  const [featuresStr, setFeaturesStr] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const openAddModal = () => {
    setEditingService(null);
    setTitle('');
    setSubtitle('');
    setDescription('');
    setStartingFromLkr(25000);
    setFeaturesStr('Expressway Tolls Included, Flight Monitoring, Chauffeur Meet & Greet');
    setImageUrl('/assets/images/service_airport_transfer_1793121941979.webp');
    setShowModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setTitle(s.title);
    setSubtitle(s.subtitle);
    setDescription(s.description);
    setStartingFromLkr(s.startingFromLkr);
    setFeaturesStr(s.features.join(', '));
    setImageUrl(s.imageUrl);
    setShowModal(true);
  };

  const openQuickPhoto = (s: Service) => {
    setQuickPhotoService(s);
    setQuickPhotoUrl(s.imageUrl);
  };

  const handleSaveQuickPhoto = async () => {
    if (!quickPhotoService) return;
    await updateService({
      ...quickPhotoService,
      imageUrl: quickPhotoUrl,
    });
    setQuickPhotoService(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const features = featuresStr
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean);

    if (editingService) {
      await updateService({
        ...editingService,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        startingFromLkr,
        features,
        imageUrl,
      });
    } else {
      await addService({
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        startingFromLkr,
        features,
        imageUrl,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Services Catalog Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Add or edit transport packages displayed publicly on the customer website.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-[#1B1B1F] group/srvimg">
                <OptimizedImage
                  src={srv.imageUrl}
                  fallbackSrc="/assets/images/service_airport_transfer_1793121941979.webp"
                  alt={srv.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover/srvimg:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-3 right-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-mono text-[#F5B91B] border border-[#27272A]">
                  From {formatLKR(srv.startingFromLkr)}
                </div>

                {/* Quick Change Photo Button */}
                <button
                  type="button"
                  onClick={() => openQuickPhoto(srv)}
                  className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/85 hover:bg-[#F5B91B] text-slate-200 hover:text-black text-[11px] font-bold border border-[#27272A] hover:border-[#F5B91B] backdrop-blur-md shadow-lg flex items-center gap-1.5 transition-all cursor-pointer opacity-90 group-hover/srvimg:opacity-100"
                  title="Change Service Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Change Photo</span>
                </button>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-lg font-bold text-white font-['Outfit']">{srv.title}</h3>
                <div className="text-xs text-[#A1A1AA]">{srv.subtitle}</div>
                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{srv.description}</p>

                <div className="pt-2 border-t border-[#1F1F23] space-y-1">
                  {srv.features.slice(0, 3).map((f, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3 h-3 text-[#F5B91B] shrink-0" />
                      <span className="truncate">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 pt-0 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => openQuickPhoto(srv)}
                className="py-2 px-3 rounded-lg bg-[#1A1A1E] hover:bg-[#27272E] text-slate-300 hover:text-white border border-[#27272A] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Photo</span>
              </button>
              <button
                type="button"
                onClick={() => openEditModal(srv)}
                className="py-2 px-3 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Edit Specs</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Service Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Airport Transfers"
                  required
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Subtitle</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Colombo Airport to Galle & South Coast"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Starting Price (LKR)</label>
                <input
                  type="number"
                  step={500}
                  value={startingFromLkr}
                  onChange={(e) => setStartingFromLkr(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Features (comma-separated)</label>
                <input
                  type="text"
                  value={featuresStr}
                  onChange={(e) => setFeaturesStr(e.target.value)}
                  placeholder="Expressway Tolls Included, Free Flight Tracking"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
                />
              </div>

              {/* Service Visual / Image Uploader */}
              <div className="pt-2 border-t border-[#27272A]">
                <ImageUploader
                  value={imageUrl}
                  onChange={setImageUrl}
                  label="Service Visual (Upload File or Select Preset)"
                  aspectRatio="wide"
                />
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs cursor-pointer shadow-md"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Service Photo Modal */}
      {quickPhotoService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#F5B91B]" />
                  <span>Update Service Photo</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">{quickPhotoService.title}</p>
              </div>
              <button
                type="button"
                onClick={() => setQuickPhotoService(null)}
                className="text-slate-400 hover:text-white text-xs p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <ImageUploader
              value={quickPhotoUrl}
              onChange={setQuickPhotoUrl}
              label="Select or Upload New Service Photo"
              aspectRatio="wide"
            />

            <div className="pt-3 border-t border-[#27272A] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setQuickPhotoService(null)}
                className="px-4 py-2 rounded-xl bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveQuickPhoto}
                className="px-5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Photo</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
