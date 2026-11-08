import React, { useState, useMemo } from 'react';
import { BarChart3, Download, Calendar, Filter, Users, DollarSign, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../lib/store';
import { formatLKR, formatNumber } from '../../lib/fareEngine';

export const AdminReports: React.FC = () => {
  const { bookings, drivers } = useApp();

  const [dateRange, setDateRange] = useState<'30' | '90' | '365' | 'all'>('30');
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filter bookings by selected date range
  const filteredBookings = useMemo(() => {
    if (dateRange === 'all') return bookings;
    const days = parseInt(dateRange, 10);
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return bookings.filter((b) => new Date(b.createdAt) >= cutoff);
  }, [bookings, dateRange]);

  // Aggregate numbers
  const totalCount = filteredBookings.length;
  const completedTrips = filteredBookings.filter((b) => b.status === 'Completed');
  const cancelledTrips = filteredBookings.filter((b) => b.status === 'Cancelled');
  const confirmedTrips = filteredBookings.filter((b) => b.status === 'Confirmed' || b.status === 'Driver Assigned');
  const pendingTrips = filteredBookings.filter((b) => b.status === 'Pending');

  // Revenue strictly from COMPLETED trips
  const completedRevenue = completedTrips.reduce((acc, b) => acc + (b.finalFare || b.estimatedFare), 0);
  const avgTripValue = completedTrips.length > 0 ? Math.round(completedRevenue / completedTrips.length) : 0;
  const completionRate = totalCount > 0 ? Math.round((completedTrips.length / totalCount) * 100) : 0;

  // Driver performance metrics
  const driverStats = drivers.map((d) => {
    const driverTrips = filteredBookings.filter((b) => b.driverId === d.id);
    const driverCompleted = driverTrips.filter((b) => b.status === 'Completed');
    const driverRevenue = driverCompleted.reduce((acc, b) => acc + (b.finalFare || b.estimatedFare), 0);
    return {
      driver: d,
      assignedCount: driverTrips.length,
      completedCount: driverCompleted.length,
      revenue: driverRevenue,
    };
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Booking Reference',
      'Customer Name',
      'Phone',
      'Pickup Location',
      'Destination',
      'Date',
      'Time',
      'Vehicle Category',
      'Status',
      'Driver Name',
      'Estimated Fare (LKR)',
      'Final Fare (LKR)',
      'Created At',
    ];

    const rows = filteredBookings.map((b) => [
      `"${b.bookingReference}"`,
      `"${b.customerName}"`,
      `"${b.phone}"`,
      `"${b.pickupLocation.replace(/"/g, '""')}"`,
      `"${b.destination.replace(/"/g, '""')}"`,
      b.pickupDate,
      b.pickupTime,
      `"${b.vehicleCategoryName}"`,
      b.status,
      `"${b.driverName || 'Unassigned'}"`,
      b.estimatedFare,
      b.finalFare || b.estimatedFare,
      b.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `galle_taxi_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportNotice('CSV report generated and downloaded successfully!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white font-['Outfit']">Financial & Dispatch Reports</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit trip completion, driver revenue performance, and export detailed CSV records.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="px-3 py-2 bg-[#141416] border border-[#27272A] rounded-xl text-xs text-white focus:outline-none focus:border-[#F5B91B]"
          >
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last 365 Days</option>
            <option value="all">All Time</option>
          </select>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* High-Level Report Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#141416] border border-[#27272A] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Revenue</span>
          <div className="text-2xl font-black font-mono text-[#F5B91B] tabular-nums">
            {formatLKR(completedRevenue)}
          </div>
          <div className="text-[10px] text-slate-500">Only verified completed rides</div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Completed Trips</span>
          <div className="text-2xl font-black font-mono text-emerald-400 tabular-nums">
            {completedTrips.length}
          </div>
          <div className="text-[10px] text-slate-500">{completionRate}% completion rate</div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Fare / Trip</span>
          <div className="text-2xl font-black font-mono text-white tabular-nums">
            {formatLKR(avgTripValue)}
          </div>
          <div className="text-[10px] text-slate-500">Average ticket size</div>
        </div>

        <div className="bg-[#141416] border border-[#27272A] p-5 rounded-2xl space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cancellations</span>
          <div className="text-2xl font-black font-mono text-red-400 tabular-nums">
            {cancelledTrips.length}
          </div>
          <div className="text-[10px] text-slate-500">
            {totalCount > 0 ? Math.round((cancelledTrips.length / totalCount) * 100) : 0}% of all bookings
          </div>
        </div>
      </div>

      {/* Driver Performance Report Table */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 space-y-4 shadow-xl">
        <h2 className="text-base font-bold text-white font-['Outfit']">Chauffeur Performance & Payout Ledger</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1E] text-slate-400 uppercase font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-4">Chauffeur Name</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Vehicle Plate</th>
                <th className="py-3 px-4 text-center">Assigned Trips</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-right">Generated Revenue (LKR)</th>
                <th className="py-3 px-4 text-center">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {driverStats.map((ds) => (
                <tr key={ds.driver.id} className="hover:bg-[#1A1A1E]">
                  <td className="py-3 px-4 font-semibold text-white">{ds.driver.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{ds.driver.phone}</td>
                  <td className="py-3 px-4 font-mono text-[#F5B91B]">{ds.driver.assignedVehiclePlate || 'N/A'}</td>
                  <td className="py-3 px-4 text-center font-mono">{ds.assignedCount}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{ds.completedCount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-white">
                    {formatLKR(ds.revenue)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-[#F5B91B]">★ {ds.driver.rating.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
