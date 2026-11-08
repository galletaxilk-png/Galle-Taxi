import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  TrendingUp,
  DollarSign,
  Users,
  Car,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { formatLKR, formatNumber } from '../../lib/fareEngine';

export const AdminOverview: React.FC = () => {
  const { bookings, drivers, vehicles } = useApp();
  const [dateFilter, setDateFilter] = useState<'all' | '30days' | '7days'>('all');

  // Filter bookings based on selected period
  const filteredBookings = React.useMemo(() => {
    if (dateFilter === 'all') return bookings;
    const now = new Date();
    const daysAgo = dateFilter === '7days' ? 7 : 30;
    const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    return bookings.filter((b) => new Date(b.createdAt) >= cutoff);
  }, [bookings, dateFilter]);

  // Real statistics
  const totalBookings = filteredBookings.length;
  const pendingBookings = filteredBookings.filter((b) => b.status === 'Pending').length;
  const confirmedBookings = filteredBookings.filter(
    (b) => b.status === 'Confirmed' || b.status === 'Driver Assigned' || b.status === 'Driver En Route'
  ).length;
  const completedTrips = filteredBookings.filter((b) => b.status === 'Completed').length;
  const cancelledBookings = filteredBookings.filter((b) => b.status === 'Cancelled').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter((b) => b.pickupDate === todayStr).length;

  // Real revenue calculated strictly from COMPLETED trips as mandated by requirements
  const completedRevenue = filteredBookings
    .filter((b) => b.status === 'Completed')
    .reduce((sum, b) => sum + (b.finalFare || b.estimatedFare), 0);

  // Status breakdown percentages
  const statusCounts = {
    Pending: filteredBookings.filter((b) => b.status === 'Pending').length,
    Confirmed: filteredBookings.filter((b) => b.status === 'Confirmed').length,
    Assigned: filteredBookings.filter((b) => b.status === 'Driver Assigned' || b.status === 'Driver En Route').length,
    Completed: completedTrips,
    Cancelled: cancelledBookings,
  };

  // Top destination breakdown
  const destinationMap: Record<string, number> = {};
  filteredBookings.forEach((b) => {
    const d = b.destination.split(',')[0].trim();
    destinationMap[d] = (destinationMap[d] || 0) + 1;
  });
  const topDestinations = Object.entries(destinationMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Top Bar with Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Operations Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time fleet performance and passenger dispatch metrics in Galle, Sri Lanka.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-[#141416] border border-[#27272A] rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dateFilter === 'all' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setDateFilter('30days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dateFilter === '30days' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('7days')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dateFilter === '7days' ? 'bg-[#F5B91B] text-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Total Bookings */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Bookings</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">{totalBookings}</div>
          <div className="text-[10px] text-slate-500">All recorded trips</div>
        </div>

        {/* Pending */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending</span>
          <div className="text-2xl font-black font-mono text-amber-400 tabular-nums">{pendingBookings}</div>
          <div className="text-[10px] text-slate-500">Awaiting dispatch</div>
        </div>

        {/* Confirmed / Assigned */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-sky-400 uppercase tracking-wider">Confirmed</span>
          <div className="text-2xl font-black font-mono text-sky-400 tabular-nums">{confirmedBookings}</div>
          <div className="text-[10px] text-slate-500">Scheduled / En Route</div>
        </div>

        {/* Completed */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Completed</span>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">{completedTrips}</div>
          <div className="text-[10px] text-slate-500">Successfully ended</div>
        </div>

        {/* Cancelled */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Cancelled</span>
          <div className="text-2xl font-black font-mono text-red-400 tabular-nums">{cancelledBookings}</div>
          <div className="text-[10px] text-slate-500">Cancelled by guest</div>
        </div>

        {/* Today's Rides */}
        <div className="bg-[#141416] border border-[#27272A] p-4 rounded-xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">Today's Schedule</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">{todayBookings}</div>
          <div className="text-[10px] text-slate-500">{todayStr}</div>
        </div>

        {/* Revenue */}
        <div className="bg-[#141416] border border-[#F5B91B]/30 p-4 rounded-xl space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-[#F5B91B] uppercase tracking-wider">Completed Revenue</span>
          <div className="text-xl font-black font-mono text-[#F5B91B] tabular-nums truncate">
            {formatLKR(completedRevenue)}
          </div>
          <div className="text-[10px] text-slate-500">From verified trips</div>
        </div>
      </div>

      {/* Visual Analytics & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Status Distribution: 6 cols */}
        <div className="lg:col-span-6 bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <h2 className="font-bold text-white text-sm font-['Outfit']">Booking Status Breakdown</h2>
            <span className="text-xs text-slate-400">{totalBookings} Total Records</span>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(statusCounts).map(([status, count]) => {
              const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium">{status}</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0B0D] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        status === 'Completed'
                          ? 'bg-emerald-500'
                          : status === 'Pending'
                          ? 'bg-amber-400'
                          : status === 'Cancelled'
                          ? 'bg-red-500'
                          : 'bg-[#F5B91B]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Popular Destinations: 6 cols */}
        <div className="lg:col-span-6 bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
            <h2 className="font-bold text-white text-sm font-['Outfit']">Top Passenger Destinations</h2>
            <span className="text-xs text-[#F5B91B] font-semibold">Galle Region Hubs</span>
          </div>

          <div className="space-y-3 pt-2">
            {topDestinations.map(([dest, count]) => {
              const pct = totalBookings > 0 ? Math.round((count / totalBookings) * 100) : 0;
              return (
                <div key={dest} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 font-medium truncate max-w-[280px]">{dest}</span>
                    <span className="text-slate-400 font-mono tabular-nums">
                      {count} rides ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#0B0B0D] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#F5B91B] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Recent Bookings Queue */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div>
            <h2 className="font-bold text-white text-base font-['Outfit']">Recent Bookings Queue</h2>
            <p className="text-xs text-slate-400">Incoming online reservations and active dispatches</p>
          </div>
          <Link
            to="/admin/bookings"
            className="text-xs text-[#F5B91B] hover:underline font-semibold flex items-center gap-1"
          >
            <span>Manage All Bookings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1E] uppercase text-slate-400 font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-4">Ref</th>
                <th className="py-3 px-4">Passenger</th>
                <th className="py-3 px-4">Pickup → Drop</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Fare</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {bookings.slice(0, 5).map((b) => (
                <tr key={b.id} className="hover:bg-[#1A1A1E] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-[#F5B91B]">{b.bookingReference}</td>
                  <td className="py-3 px-4 font-medium text-white">{b.customerName}</td>
                  <td className="py-3 px-4 text-slate-300 max-w-[200px] truncate">
                    {b.pickupLocation} → {b.destination}
                  </td>
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {b.pickupDate} {b.pickupTime}
                  </td>
                  <td className="py-3 px-4 text-slate-300">{b.vehicleCategoryName}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {formatLKR(b.finalFare || b.estimatedFare)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        b.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : b.status === 'Cancelled'
                          ? 'bg-red-500/10 text-red-400'
                          : b.status === 'Pending'
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-[#F5B91B]/10 text-[#F5B91B]'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link
                      to={`/admin/bookings?focus=${b.id}`}
                      className="px-2.5 py-1 rounded bg-[#27272A] hover:bg-[#3F3F46] text-white font-semibold text-[11px]"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
