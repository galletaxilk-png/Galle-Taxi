import React, { useState } from 'react';
import { Users, Plus, Phone, Award, Car, CheckCircle2, XCircle, Edit, Star, ShieldCheck } from 'lucide-react';
import { useApp } from '../../lib/store';
import { Driver } from '../../types';

export const AdminDrivers: React.FC = () => {
  const { drivers, vehicles, addDriver, updateDriver } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [assignedVehicleId, setAssignedVehicleId] = useState('');
  const [isActive, setIsActive] = useState(true);

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setPhone('');
    setNicNumber('');
    setLicenseNumber('');
    setAssignedVehicleId(vehicles[0]?.id || '');
    setIsActive(true);
    setShowAddModal(true);
  };

  const openEditModal = (d: Driver) => {
    setEditingDriver(d);
    setName(d.name);
    setPhone(d.phone);
    setNicNumber(d.nicNumber);
    setLicenseNumber(d.licenseNumber);
    setAssignedVehicleId(d.assignedVehicleId || '');
    setIsActive(d.isActive);
    setShowAddModal(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !nicNumber.trim() || !licenseNumber.trim()) return;

    const matchedVeh = vehicles.find((v) => v.id === assignedVehicleId);

    if (editingDriver) {
      await updateDriver({
        ...editingDriver,
        name: name.trim(),
        phone: phone.trim(),
        nicNumber: nicNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        assignedVehicleId: assignedVehicleId || undefined,
        assignedVehicleName: matchedVeh?.name,
        assignedVehiclePlate: matchedVeh?.plateNumber,
        isActive,
      });
    } else {
      await addDriver({
        name: name.trim(),
        phone: phone.trim(),
        nicNumber: nicNumber.trim(),
        licenseNumber: licenseNumber.trim(),
        assignedVehicleId: assignedVehicleId || undefined,
        assignedVehicleName: matchedVeh?.name,
        assignedVehiclePlate: matchedVeh?.plateNumber,
        isActive,
      });
    }

    setShowAddModal(false);
  };

  const toggleDriverActive = async (d: Driver) => {
    await updateDriver({
      ...d,
      isActive: !d.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Driver & Chauffeur Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Register certified tourism chauffeurs, verify driving licenses & Sri Lankan NICs, and assign fleet vehicles.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chauffeur</span>
        </button>
      </div>

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {drivers.map((drv) => (
          <div
            key={drv.id}
            className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between"
          >
            <div>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-white text-base font-['Outfit']">{drv.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#F5B91B]" />
                    <span>{drv.phone}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleDriverActive(drv)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${
                    drv.isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {drv.isActive ? 'Active Duty' : 'Off-Duty'}
                </button>
              </div>

              {/* Verification & IDs */}
              <div className="space-y-1.5 py-3 border-y border-[#1F1F23] my-4 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">NIC Number:</span>
                  <span className="font-mono text-white">{drv.nicNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Driving License:</span>
                  <span className="font-mono text-white">{drv.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Joined Fleet:</span>
                  <span className="text-slate-300">{drv.joinedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assigned Vehicle:</span>
                  <span className="text-white font-medium truncate max-w-[140px]">
                    {drv.assignedVehiclePlate ? `${drv.assignedVehiclePlate}` : 'None'}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-2.5 bg-[#0B0B0D] rounded-xl border border-[#27272A]">
                  <div className="flex items-center justify-center gap-1 text-[#F5B91B] text-xs font-bold font-mono">
                    <Star className="w-3.5 h-3.5 fill-[#F5B91B]" />
                    <span>{drv.rating.toFixed(2)}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Rating</div>
                </div>
                <div className="p-2.5 bg-[#0B0B0D] rounded-xl border border-[#27272A]">
                  <div className="text-white text-xs font-bold font-mono">{drv.totalTrips}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Completed Trips</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div className="pt-4 border-t border-[#1F1F23]">
              <button
                onClick={() => openEditModal(drv)}
                className="w-full py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5 text-[#F5B91B]" />
                <span>Edit Profile & Assignment</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {editingDriver ? 'Edit Chauffeur Information' : 'Register New Chauffeur'}
            </h2>

            <form onSubmit={handleSaveDriver} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Legal Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ruwan Wickramasinghe"
                  required
                  className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Phone Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    required
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Sri Lankan NIC *</label>
                  <input
                    type="text"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    placeholder="198422304910"
                    required
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Driving License Number *</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="B-893021"
                    required
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assigned Fleet Vehicle</label>
                  <select
                    value={assignedVehicleId}
                    onChange={(e) => setAssignedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  >
                    <option value="">-- No Vehicle Assigned --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.category})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="driverActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded border-[#27272A] text-[#F5B91B] focus:ring-[#F5B91B]"
                />
                <label htmlFor="driverActive" className="text-xs text-slate-300 font-semibold">
                  Driver Active & Ready for Dispatches
                </label>
              </div>

              <div className="pt-4 border-t border-[#27272A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs tracking-wide shadow-md"
                >
                  Save Chauffeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
