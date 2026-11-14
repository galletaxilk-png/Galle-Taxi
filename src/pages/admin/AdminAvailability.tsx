import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Car,
  User,
  Phone,
  MapPin,
  Plane,
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Eye,
  Receipt,
  Printer,
  CalendarDays,
  ShieldAlert,
  Search,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { Booking, BookingStatus } from '../../types';
import { formatLKR, formatCurrency } from '../../lib/fareEngine';
import { BookingReceiptModal } from '../../components/booking/BookingReceiptModal';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatLocalYMD = (dt: Date): string => {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const AdminAvailability: React.FC = () => {
  const { bookings, vehicles, drivers, updateBookingStatus, refreshBookingsAndDrivers } = useApp();

  useEffect(() => {
    refreshBookingsAndDrivers();
  }, []);

  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return formatLocalYMD(new Date());
  });

  // Filters
  const [selectedVehicleCategory, setSelectedVehicleCategory] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<'all' | 'unassigned' | 'assigned'>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected booking for receipt view
  const [receiptBooking, setReceiptBooking] = useState<Booking | null>(null);

  // Month navigation helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(formatLocalYMD(today));
  };

  // Filtered bookings based on criteria
  const filteredBookings = useMemo(() => {
    const selectedVehicleObj =
      selectedVehicleCategory === 'all'
        ? null
        : vehicles.find((v) => v.id === selectedVehicleCategory);
    return bookings.filter((b) => {
      // Vehicle filter
      if (selectedVehicleCategory !== 'all') {
        const matchesId = b.vehicleCategoryId === selectedVehicleCategory;
        const matchesName =
          selectedVehicleObj &&
          b.vehicleCategoryName?.toLowerCase().trim() === selectedVehicleObj.name?.toLowerCase().trim();
        if (!matchesId && !matchesName) {
          return false;
        }
      }
      // Assignment filter
      if (assignmentFilter === 'unassigned' && b.driverId) return false;
      if (assignmentFilter === 'assigned' && !b.driverId) return false;
      // Status filter
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          b.customerName.toLowerCase().includes(q) ||
          b.bookingReference.toLowerCase().includes(q) ||
          b.pickupLocation.toLowerCase().includes(q) ||
          b.destination.toLowerCase().includes(q) ||
          (b.driverName && b.driverName.toLowerCase().includes(q));
        if (!matches) return false;
      }
      return true;
    });
  }, [bookings, selectedVehicleCategory, assignmentFilter, statusFilter, searchQuery]);

  // Group bookings by date (YYYY-MM-DD)
  const bookingsByDate = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const b of filteredBookings) {
      if (!b.pickupDate) continue;
      const list = map.get(b.pickupDate) || [];
      list.push(b);
      map.set(b.pickupDate, list);
    }
    // Sort each day's bookings chronologically by time
    map.forEach((list) => {
      list.sort((a, b) => (a.pickupTime || '').localeCompare(b.pickupTime || ''));
    });
    return map;
  }, [filteredBookings]);

  // Monthly stats
  const monthlyStats = useMemo(() => {
    const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    const thisMonthBookings = bookings.filter((b) => b.pickupDate && b.pickupDate.startsWith(monthPrefix));
    const activeTrips = thisMonthBookings.filter((b) => b.status !== 'Cancelled');
    const unassignedCount = activeTrips.filter((b) => !b.driverId).length;
    const totalRevenue = activeTrips.reduce(
      (sum, b) => sum + Number(b.finalFare && b.finalFare > 0 ? b.finalFare : b.estimatedFare || 0),
      0
    );

    return {
      totalTrips: activeTrips.length,
      unassignedCount,
      totalRevenue,
    };
  }, [bookings, year, month]);

  // Generate calendar grid days (including padding from prev/next months)
  const calendarGrid = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    // Day of week: 0 = Sun, 1 = Mon ... 6 = Sat
    // Convert to Monday = 0, Sunday = 6
    let startingDayIndex = firstDayOfMonth.getDay() - 1;
    if (startingDayIndex === -1) startingDayIndex = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const gridCells: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }[] = [];

    const todayStr = formatLocalYMD(new Date());

    // Previous month padding
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDay - i;
      const prevDate = new Date(year, month - 1, d);
      const dateStr = formatLocalYMD(prevDate);
      gridCells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday: dateStr === todayStr,
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      gridCells.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    // Next month padding to complete 35 or 42 grid cells
    const remainingCells = 42 - gridCells.length;
    if (remainingCells > 0 && remainingCells < 7) {
      for (let d = 1; d <= remainingCells; d++) {
        const nextDate = new Date(year, month + 1, d);
        const dateStr = formatLocalYMD(nextDate);
        gridCells.push({
          dateStr,
          dayNumber: d,
          isCurrentMonth: false,
          isToday: dateStr === todayStr,
        });
      }
    }

    return gridCells;
  }, [year, month]);

  // Bookings for selected date
  const selectedDayBookings = useMemo(() => {
    return bookingsByDate.get(selectedDateStr) || [];
  }, [bookingsByDate, selectedDateStr]);

  const selectedDateFormatted = useMemo(() => {
    try {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return selectedDateStr;
    }
  }, [selectedDateStr]);

  // Quick driver assignment on day inspector
  const handleAssignDriver = async (bookingId: string, driverId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;
    try {
      await updateBookingStatus(bookingId, 'Driver Assigned', booking.finalFare, driverId || undefined);
    } catch (err) {
      console.error('Failed to assign driver:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Fleet Availability & Scheduling</h1>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#F5B91B]/20 text-[#F5B91B] border border-[#F5B91B]/30">
              Monthly Calendar
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visualize upcoming private transfers, chauffeur assignments, and fleet schedule across Galle and Southern Province.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A32] text-slate-200 border border-[#27272A] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Print Schedule Sheet"
          >
            <Printer className="w-3.5 h-3.5 text-[#F5B91B]" />
            <span className="hidden sm:inline">Print Schedule</span>
          </button>
          <Link
            to="/admin/bookings"
            className="px-3.5 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Manage All Bookings</span>
          </Link>
        </div>
      </div>

      {/* Monthly Metrics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/15 text-[#F5B91B] flex items-center justify-center shrink-0 border border-[#F5B91B]/30">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Trips This Month ({currentDate.toLocaleString('en-US', { month: 'short' })})
            </span>
            <span className="text-xl font-black font-mono text-white block mt-0.5">
              {monthlyStats.totalTrips} Scheduled
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] flex items-center gap-3.5 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
            monthlyStats.unassignedCount > 0
              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
          }`}>
            {monthlyStats.unassignedCount > 0 ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 animate-pulse" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Chauffeur Assignment Status
            </span>
            <span className="text-xl font-black font-mono text-white block mt-0.5">
              {monthlyStats.unassignedCount > 0 ? (
                <span className="text-amber-400">{monthlyStats.unassignedCount} Unassigned</span>
              ) : (
                <span className="text-emerald-400">All Chauffeurs Assigned</span>
              )}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#141416] border border-[#27272A] flex items-center gap-3.5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <span className="font-bold text-sm">Rs</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Projected Monthly Revenue
            </span>
            <span className="text-xl font-black font-mono text-[#F5B91B] block mt-0.5">
              {formatLKR(monthlyStats.totalRevenue)}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ≈ {formatCurrency(monthlyStats.totalRevenue, 'USD')} · {formatCurrency(monthlyStats.totalRevenue, 'EUR')}
            </span>
          </div>
        </div>
      </div>

      {/* Filter & Calendar Controls Toolbar */}
      <div className="p-4 bg-[#141416] border border-[#27272A] rounded-2xl flex flex-wrap items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A32] text-slate-300 hover:text-white border border-[#27272A] transition-colors cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="px-3.5 py-1.5 rounded-xl bg-[#0B0B0D] border border-[#27272A] font-extrabold text-white font-['Outfit'] text-sm tracking-wide min-w-[160px] text-center">
            {monthName}
          </div>

          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl bg-[#1F1F24] hover:bg-[#2A2A32] text-slate-300 hover:text-white border border-[#27272A] transition-colors cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={goToToday}
            className="px-3 py-1.5 rounded-xl bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-bold transition-colors cursor-pointer ml-1"
          >
            Today
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Vehicle Category Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0D] px-2.5 py-1.5 rounded-xl border border-[#27272A] text-xs">
            <Car className="w-3.5 h-3.5 text-[#F5B91B]" />
            <select
              value={selectedVehicleCategory}
              onChange={(e) => setSelectedVehicleCategory(e.target.value)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Vehicle Types</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {/* Chauffeur Assignment Filter */}
          <div className="flex items-center gap-1.5 bg-[#0B0B0D] px-2.5 py-1.5 rounded-xl border border-[#27272A] text-xs">
            <User className="w-3.5 h-3.5 text-[#F5B91B]" />
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value as any)}
              className="bg-transparent text-white text-xs focus:outline-none cursor-pointer"
            >
              <option value="all">All Assignments</option>
              <option value="unassigned">⚠ Needs Driver</option>
              <option value="assigned">✓ Driver Assigned</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ride / driver..."
              className="pl-8 pr-3 py-1.5 bg-[#0B0B0D] border border-[#27272A] rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B] w-40 sm:w-48"
            />
          </div>
        </div>
      </div>

      {/* Main Availability Layout: 7-Col Calendar + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Calendar Grid (8 cols on desktop) */}
        <div className="lg:col-span-8 bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 bg-[#18181E] border-b border-[#27272A] text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider py-2.5">
            {DAYS_OF_WEEK.map((d, idx) => (
              <div key={d} className={idx >= 5 ? 'text-[#F5B91B]' : 'text-slate-400'}>
                {d}
              </div>
            ))}
          </div>

          {/* 7-Col Month Days Grid */}
          <div className="grid grid-cols-7 divide-x divide-y divide-[#1F1F24]">
            {calendarGrid.map((cell) => {
              const dayBookings = bookingsByDate.get(cell.dateStr) || [];
              const isSelected = cell.dateStr === selectedDateStr;
              const hasUnassigned = dayBookings.some((b) => !b.driverId && b.status !== 'Cancelled');

              return (
                <div
                  key={cell.dateStr}
                  onClick={() => setSelectedDateStr(cell.dateStr)}
                  className={`min-h-[96px] sm:min-h-[112px] p-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#F5B91B]/10 ring-2 ring-[#F5B91B] ring-inset z-10'
                      : cell.isCurrentMonth
                      ? 'bg-[#141416] hover:bg-[#1A1A1F]'
                      : 'bg-[#0E0E10] opacity-40 hover:opacity-75'
                  }`}
                >
                  {/* Day Header: Number + Badges */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                        cell.isToday
                          ? 'bg-[#F5B91B] text-black font-extrabold shadow-sm'
                          : isSelected
                          ? 'text-[#F5B91B] font-extrabold'
                          : cell.isCurrentMonth
                          ? 'text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Booking Count Badge */}
                    {dayBookings.length > 0 && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                          hasUnassigned
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {dayBookings.length} {dayBookings.length === 1 ? 'ride' : 'rides'}
                      </span>
                    )}
                  </div>

                  {/* Booking Snippets in Cell */}
                  <div className="space-y-1 mt-1 overflow-hidden">
                    {dayBookings.slice(0, 2).map((b) => (
                      <div
                        key={b.id}
                        className={`px-1.5 py-1 rounded text-[10px] truncate font-medium flex items-center gap-1 ${
                          b.status === 'Completed'
                            ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                            : !b.driverId && b.status !== 'Cancelled'
                            ? 'bg-amber-950/70 text-amber-300 border border-amber-800/50'
                            : 'bg-[#1F1F24] text-slate-200 border border-[#2E2E36]'
                        }`}
                        title={`${b.pickupTime} - ${b.customerName} (${b.pickupLocation} ➔ ${b.destination})`}
                      >
                        <Clock className="w-2.5 h-2.5 shrink-0 text-[#F5B91B]" />
                        <span className="font-mono text-[9px]">{b.pickupTime}</span>
                        <span className="truncate">{b.customerName.split(' ')[0]}</span>
                      </div>
                    ))}

                    {dayBookings.length > 2 && (
                      <div className="text-[9px] font-mono text-slate-400 pl-1">
                        +{dayBookings.length - 2} more trips
                      </div>
                    )}
                  </div>

                  {/* Alert marker if unassigned trips on this date */}
                  {hasUnassigned && (
                    <div className="text-[9px] text-amber-400 font-semibold flex items-center gap-1 mt-1 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      <span>Needs Driver</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector Drawer (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-[#141416] border border-[#27272A] rounded-2xl p-5 sm:p-6 space-y-5 shadow-xl sticky top-6">
          {/* Header */}
          <div className="pb-3 border-b border-[#27272A]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F5B91B]">
                Day Dispatch Schedule
              </span>
              <span className="font-mono text-xs text-slate-400">
                {selectedDayBookings.length} {selectedDayBookings.length === 1 ? 'Booking' : 'Bookings'}
              </span>
            </div>
            <h2 className="text-lg font-black text-white font-['Outfit'] mt-1">
              {selectedDateFormatted}
            </h2>
          </div>

          {/* Bookings List for Selected Date */}
          {selectedDayBookings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-300">No bookings scheduled for this date.</p>
              <p className="text-[11px] text-slate-500">
                Vehicle fleet is 100% available for new custom journeys and airport drops.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 max-h-[580px] overflow-y-auto pr-1">
              {selectedDayBookings.map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl bg-[#18181E] border border-[#27272A] space-y-3 text-xs shadow-sm hover:border-[#F5B91B]/40 transition-colors"
                >
                  {/* Top: Reference & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-[#F5B91B]">{b.bookingReference}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : b.status === 'Cancelled'
                          ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                          : !b.driverId
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-[#F5B91B]/15 text-[#F5B91B] border border-[#F5B91B]/30'
                      }`}
                    >
                      {b.status}
                    </span>
                  </div>

                  {/* Passenger & Timing */}
                  <div className="space-y-1">
                    <div className="font-extrabold text-white text-sm flex items-center justify-between">
                      <span>{b.customerName}</span>
                      <span className="text-[#F5B91B] font-mono text-xs font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{b.pickupTime}</span>
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-[#F5B91B]" />
                      <span>{b.phone}</span>
                    </div>
                  </div>

                  {/* Route Itinerary */}
                  <div className="p-2.5 rounded-lg bg-[#0E0E11] border border-[#27272A] space-y-1 text-[11px]">
                    <div className="flex items-start gap-1.5 text-white truncate">
                      <MapPin className="w-3.5 h-3.5 text-[#F5B91B] shrink-0 mt-0.5" />
                      <span className="truncate">{b.pickupLocation}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-slate-300 truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="truncate">→ {b.destination}</span>
                    </div>
                  </div>

                  {/* Flight & Nameboard Info */}
                  {b.flightNumber && (
                    <div className="flex items-center gap-1.5 text-[10px] text-sky-400 font-mono bg-sky-950/40 px-2 py-1 rounded border border-sky-800/40">
                      <Plane className="w-3 h-3" />
                      <span>Flight {b.flightNumber}</span>
                    </div>
                  )}

                  {/* Assigned Chauffeur & Quick Assignment Dropdown */}
                  <div className="space-y-1 pt-1 border-t border-[#27272A]">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Assigned Chauffeur:</span>
                      <span className="font-bold text-white">
                        {b.driverName || (
                          <span className="text-amber-400 flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3" /> Unassigned
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Quick Driver Assign Dropdown */}
                    <div className="mt-1">
                      <select
                        value={b.driverId || ''}
                        onChange={(e) => handleAssignDriver(b.id, e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-[#0B0B0D] border border-[#2E2E36] rounded-lg text-xs text-white focus:outline-none focus:border-[#F5B91B] cursor-pointer"
                      >
                        <option value="">-- Quick Assign Driver --</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.assignedVehiclePlate || 'No Vehicle'})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Action Buttons: Manage in Bookings & View Receipt */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#27272A]">
                    <button
                      type="button"
                      onClick={() => setReceiptBooking(b)}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#F5B91B]/15 hover:bg-[#F5B91B] hover:text-black text-[#F5B91B] border border-[#F5B91B]/30 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>

                    <Link
                      to={`/admin/bookings?focus=${b.id}`}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Manage</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
