import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Car,
  Clock,
  Eye,
  X,
  AlertCircle,
  Database,
  Radio,
  Loader2,
  RefreshCw,
  ExternalLink,
  Plane,
  UserCheck,
  Receipt,
  Printer,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { Booking, BookingStatus } from '../../types';
import { formatLKR } from '../../lib/fareEngine';
import { BookingReceiptModal } from '../../components/booking/BookingReceiptModal';

const ALL_STATUSES: BookingStatus[] = [
  'Pending',
  'Confirmed',
  'Driver Assigned',
  'Driver En Route',
  'Picked Up',
  'Completed',
  'Cancelled',
];

export const AdminBookings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const focusedId = searchParams.get('focus');

  const {
    bookings,
    drivers,
    vehicles,
    updateBookingStatus,
    refreshBookingsAndDrivers,
    isFirebaseActive,
    firebaseProjectId,
    isFirestoreSyncing,
    firestoreError,
  } = useApp();

  useEffect(() => {
    refreshBookingsAndDrivers();
  }, []);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(() => {
    if (focusedId) {
      return bookings.find((b) => b.id === focusedId) || null;
    }
    return null;
  });
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Modal edit state for selected booking
  const [modalStatus, setModalStatus] = useState<BookingStatus>('Pending');
  const [modalDriverId, setModalDriverId] = useState<string>('');
  const [modalFinalFare, setModalFinalFare] = useState<number>(0);
  const [modalAdminNotes, setModalAdminNotes] = useState<string>('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync modal when selected booking changes
  const openDetailsModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setModalStatus(booking.status);
    setModalDriverId(booking.driverId || '');
    setModalFinalFare(booking.finalFare || booking.estimatedFare);
    setModalAdminNotes(booking.adminNotes || '');
    setActionSuccess(null);
    setActionError(null);
  };

  // Resolve focusedId once async Firestore bookings arrive
  useEffect(() => {
    if (focusedId && !selectedBooking) {
      const match = bookings.find((b) => b.id === focusedId);
      if (match) {
        openDetailsModal(match);
      }
    }
  }, [focusedId, bookings]);

  // Dynamic category filter options from live fleet + booking records
  const categoryOptions = useMemo(() => {
    const map = new Map<string, string>();
    vehicles.forEach((v) => {
      if (v.id && v.name) map.set(v.id, v.name);
    });
    bookings.forEach((b) => {
      if (b.vehicleCategoryId && b.vehicleCategoryName && !map.has(b.vehicleCategoryId)) {
        map.set(b.vehicleCategoryId, b.vehicleCategoryName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [vehicles, bookings]);

  // Filter & Search logic
  const filteredBookings = useMemo(() => {
    const selectedOpt =
      categoryFilter === 'all' ? null : categoryOptions.find((c) => c.id === categoryFilter);
    return bookings.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        b.bookingReference.toLowerCase().includes(q) ||
        b.customerName.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.pickupLocation.toLowerCase().includes(q) ||
        b.destination.toLowerCase().includes(q);

      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchCategory =
        categoryFilter === 'all' ||
        b.vehicleCategoryId === categoryFilter ||
        (selectedOpt != null &&
          b.vehicleCategoryName?.toLowerCase().trim() === selectedOpt.name.toLowerCase().trim());

      return matchSearch && matchStatus && matchCategory;
    });
  }, [bookings, searchQuery, statusFilter, categoryFilter, categoryOptions]);

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;

    setIsSaving(true);
    setActionSuccess(null);
    setActionError(null);

    try {
      await updateBookingStatus(
        selectedBooking.id,
        modalStatus,
        modalFinalFare,
        modalDriverId || undefined,
        modalAdminNotes.trim() || undefined
      );

      // Update local modal state
      setSelectedBooking({
        ...selectedBooking,
        status: modalStatus,
        finalFare: modalFinalFare,
        driverId: modalDriverId || undefined,
        adminNotes: modalAdminNotes.trim() || undefined,
      });

      setActionSuccess('Booking status and dispatch record successfully saved to Cloud Firestore!');
      setTimeout(() => setActionSuccess(null), 3500);
    } catch (err: any) {
      console.error('Failed to update booking status:', err);
      setActionError(err?.message || 'Failed to update booking status in Cloud Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Booking Management</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage passenger reservations, assign chauffeurs, track trip status, and update Cloud Firestore records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isFirebaseActive ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Firestore Live ({firebaseProjectId})</span>
            </span>
          ) : (
            <Link
              to="/admin/settings"
              className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 hover:bg-amber-500/20 transition-colors"
            >
              <span>Connect Firebase ({firebaseProjectId})</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )}

          <div className="text-xs font-mono text-slate-400">
            {filteredBookings.length} of {bookings.length} reservations
          </div>
        </div>
      </div>

      {/* Connection Notice if Not Configured */}
      {!isFirebaseActive && (
        <div className="p-4 bg-[#141416] border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-start gap-2.5 text-amber-300">
            <Database className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Cloud Firestore Integration Pending</div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Connect your Firebase Web credentials for project <strong className="text-white">galle-taxi</strong> in{' '}
                <Link to="/admin/settings" className="text-[#F5B91B] underline">
                  Admin Settings
                </Link>{' '}
                to enable real-time Cloud Firestore synchronization.
              </p>
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="px-3 py-1.5 bg-[#F5B91B] text-black font-bold rounded-lg shrink-0 text-xs hover:bg-[#D4980B] transition-colors"
          >
            Configure Firebase
          </Link>
        </div>
      )}

      {firestoreError && (
        <div className="p-3 bg-red-950/40 border border-red-800 rounded-xl text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>Firestore listener error: {firestoreError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference, Customer Name, Phone, or Route..."
            className="w-full pl-9 pr-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
          />
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
          >
            <option value="all">All Statuses ({bookings.length})</option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({bookings.filter((b) => b.status === st).length})
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div className="md:col-span-3">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
          >
            <option value="all">All Vehicle Categories</option>
            {categoryOptions.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1E] text-slate-400 uppercase font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer & Contact</th>
                <th className="py-3.5 px-4">Route (Pickup → Drop)</th>
                <th className="py-3.5 px-4">Schedule</th>
                <th className="py-3.5 px-4">Vehicle Category</th>
                <th className="py-3.5 px-4 text-right">Est. Fare</th>
                <th className="py-3.5 px-4 text-right">Final Fare</th>
                <th className="py-3.5 px-4">Driver</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-semibold text-slate-300">No booking records found.</p>
                    <p className="text-[11px] text-slate-500">
                      {isFirebaseActive
                        ? 'No bookings currently in Cloud Firestore "bookings" collection. New customer submissions via /book will arrive here in real time.'
                        : 'No bookings found. Submit a test ride on the customer website or connect Firebase.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#1A1A1E] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#F5B91B] whitespace-nowrap">
                      <div>{b.bookingReference}</div>
                      {b.flightNumber && (
                        <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          <Plane className="w-3 h-3" />
                          <span>{b.flightNumber}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{b.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{b.phone}</div>
                      {b.nameboardText && (
                        <div className="text-[10px] text-emerald-400 font-mono truncate max-w-[150px] flex items-center gap-1 mt-0.5">
                          <UserCheck className="w-3 h-3 shrink-0" />
                          <span>"{b.nameboardText}"</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="text-white truncate font-medium">{b.pickupLocation}</div>
                      <div className="text-slate-400 text-[11px] truncate">→ {b.destination}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-white">{b.pickupDate}</div>
                      <div className="text-slate-400 text-[11px]">{b.pickupTime}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                      {b.vehicleCategoryName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatLKR(b.estimatedFare)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-white">
                      {b.finalFare ? formatLKR(b.finalFare) : '-'}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {b.driverName ? (
                        <div>
                          <div className="font-semibold text-white">{b.driverName}</div>
                          <div className="text-[10px] font-mono text-slate-400">{b.vehiclePlate}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          b.status === 'Completed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'Cancelled'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                            : b.status === 'Pending'
                            ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                            : b.status === 'Driver En Route' || b.status === 'Picked Up'
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30 animate-pulse'
                            : 'bg-[#F5B91B]/10 text-[#F5B91B] border border-[#F5B91B]/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDetailsModal(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#27272A] hover:bg-[#F5B91B] hover:text-black text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                          title="Manage Dispatch"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Manage</span>
                        </button>
                        <button
                          onClick={() => setReceiptBooking(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#F5B91B]/15 hover:bg-[#F5B91B] hover:text-black text-[#F5B91B] border border-[#F5B91B]/30 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                          title="View & Print Official Receipt / Tax Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Details & Dispatch Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#141416] border border-[#27272A] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#27272A]">
              <div>
                <span className="text-xs text-slate-400 uppercase font-semibold">Dispatch Control</span>
                <div className="text-xl font-extrabold font-mono text-[#F5B91B]">
                  {selectedBooking.bookingReference}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReceiptBooking(selectedBooking)}
                  className="px-3 py-1.5 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  <Receipt className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>View / Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#27272A] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {actionSuccess && (
              <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {actionError && (
              <div className="p-3 bg-red-950/70 border border-red-800 rounded-xl text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400">Passenger</span>
                <div className="text-white font-semibold text-sm">{selectedBooking.customerName}</div>
                <div className="text-slate-300 font-mono">{selectedBooking.phone}</div>
                {selectedBooking.email && <div className="text-slate-400">{selectedBooking.email}</div>}
              </div>

              <div className="space-y-1">
                <span className="text-slate-400">Route & Timing</span>
                <div className="text-white font-medium">{selectedBooking.pickupLocation}</div>
                <div className="text-slate-400 text-[11px]">Drop: {selectedBooking.destination}</div>
                <div className="text-[#F5B91B] font-mono">
                  {selectedBooking.pickupDate} at {selectedBooking.pickupTime}
                </div>
                {selectedBooking.flightNumber && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-[#F5B91B]/10 border border-[#F5B91B]/30 text-[#F5B91B] font-mono font-bold text-[11px]">
                    <Plane className="w-3.5 h-3.5" />
                    <span>Arrival Flight: {selectedBooking.flightNumber}</span>
                  </div>
                )}
                {selectedBooking.nameboardText && (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-medium text-[11px]">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Greeting Board: "{selectedBooking.nameboardText}"</span>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 pt-4 border-t border-[#27272A]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Trip Status</label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as BookingStatus)}
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  >
                    {ALL_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Assign Chauffeur</label>
                  <select
                    value={modalDriverId}
                    onChange={(e) => setModalDriverId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  >
                    <option value="">No Driver Assigned</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.assignedVehiclePlate || 'No Vehicle'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Final Fare (LKR)</label>
                  <input
                    type="number"
                    value={modalFinalFare}
                    onChange={(e) => setModalFinalFare(Number(e.target.value))}
                    min={0}
                    step={100}
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white font-mono focus:outline-none focus:border-[#F5B91B]"
                  />
                  <div className="text-[10px] text-slate-500">
                    Calculated Estimate: {formatLKR(selectedBooking.estimatedFare)}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Dispatch Notes</label>
                  <input
                    type="text"
                    value={modalAdminNotes}
                    onChange={(e) => setModalAdminNotes(e.target.value)}
                    placeholder="Terminal 1 arrival, child seat..."
                    className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#27272A]">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#F5B91B] hover:bg-[#D4980B] text-black text-xs font-bold rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>Save to Firestore</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Booking Receipt Modal */}
      {receiptBooking && (
        <BookingReceiptModal
          booking={receiptBooking}
          onClose={() => setReceiptBooking(null)}
        />
      )}
    </div>
  );
};
