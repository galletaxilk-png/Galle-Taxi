import React, { useState } from 'react';
import { MapPin, Plus, Edit, Clock, Building } from 'lucide-react';
import { useApp } from '../../lib/store';
import { ServiceArea } from '../../types';

export const AdminServiceAreas: React.FC = () => {
  const { serviceAreas, updateServiceArea, addServiceArea } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editingArea, setEditingArea] = useState<ServiceArea | null>(null);

  const [name, setName] = useState('');
  const [district, setDistrict] = useState('');
  const [description, setDescription] = useState('');
  const [typicalPickupTime, setTypicalPickupTime] = useState('10-15 mins');
  const [hotelsStr, setHotelsStr] = useState('');

  const openAdd = () => {
    setEditingArea(null);
    setName('');
    setDistrict('Southern Province');
    setDescription('');
    setTypicalPickupTime('10-15 mins');
    setHotelsStr('Local Villas, Beach Resorts');
    setShowModal(true);
  };

  const openEdit = (a: ServiceArea) => {
    setEditingArea(a);
    setName(a.name);
    setDistrict(a.district);
    setDescription(a.description);
    setTypicalPickupTime(a.typicalPickupTime);
    setHotelsStr(a.popularHotels.join(', '));
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const popularHotels = hotelsStr
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean);

    if (editingArea) {
      await updateServiceArea({
        ...editingArea,
        name: name.trim(),
        district: district.trim(),
        description: description.trim(),
        typicalPickupTime,
        popularHotels,
      });
    } else {
      await addServiceArea({
        name: name.trim(),
        district: district.trim(),
        description: description.trim(),
        typicalPickupTime,
        popularHotels,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Service Areas & Coverage</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure designated pickup zones, partner resorts, and typical dispatch response times.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service Area</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serviceAreas.map((area) => (
          <div
            key={area.id}
            className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base font-['Outfit']">{area.name}</h3>
                  <div className="text-xs text-[#F5B91B] font-semibold">{area.district}</div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-[#0B0B0D] px-2 py-0.5 rounded border border-[#27272A]">
                  <Clock className="w-3 h-3 text-[#F5B91B]" />
                  <span>{area.typicalPickupTime}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{area.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-[#1F1F23]">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Partner Resorts & Landmarks
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {area.popularHotels.map((h, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-[#1F1F23] text-slate-300 px-2 py-0.5 rounded border border-[#27272A]"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#1F1F23]">
              <button
                onClick={() => openEdit(area)}
                className="w-full py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Edit Zone Details</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {editingArea ? 'Edit Coverage Zone' : 'Add New Coverage Zone'}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Area Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Unawatuna & Talpe"
                  required
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">District / Region</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="Southern Coast"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Response Time</label>
                  <input
                    type="text"
                    value={typicalPickupTime}
                    onChange={(e) => setTypicalPickupTime(e.target.value)}
                    placeholder="10-15 mins"
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Key Hotels & Hubs (comma-separated)</label>
                <input
                  type="text"
                  value={hotelsStr}
                  onChange={(e) => setHotelsStr(e.target.value)}
                  placeholder="Amangalla, Fort Bazaar, Jetwing Lighthouse"
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
