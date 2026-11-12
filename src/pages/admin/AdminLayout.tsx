import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  Users,
  Car,
  DollarSign,
  Briefcase,
  MapPin,
  FileEdit,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  Database,
  Coins,
  Image as ImageIcon,
  Compass,
} from 'lucide-react';
import { useApp } from '../../lib/store';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminUser, logoutAdmin, isFirebaseActive } = useApp();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { label: 'Fleet Availability', path: '/admin/availability', icon: Calendar },
    { label: 'Day Tours CMS', path: '/admin/tours', icon: Compass },
    { label: 'Drivers', path: '/admin/drivers', icon: Users },
    { label: 'Vehicle Management', path: '/admin/vehicles', icon: Car },
    { label: 'Media & Images', path: '/admin/media', icon: ImageIcon },
    { label: 'Fare Management', path: '/admin/fares', icon: DollarSign },
    { label: 'Currencies', path: '/admin/currencies', icon: Coins },
    { label: 'Services', path: '/admin/services', icon: Briefcase },
    { label: 'Southern Coast Hubs', path: '/admin/taxi-hubs', icon: MapPin },
    { label: 'Service Areas', path: '/admin/service-areas', icon: MapPin },
    { label: 'Website Content', path: '/admin/content', icon: FileEdit },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logoutAdmin();
    navigate('/admin/login');
  };

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  const currentNavItem = navItems.find((item) => isActive(item.path)) || navItems[0];

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-slate-100 flex">
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex w-64 bg-[#121214] border-r border-[#27272A] flex-col justify-between shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 space-y-6">
          {/* Brand Wordmark */}
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#F5B91B] to-[#D4980B] flex items-center justify-center text-black font-black text-lg shadow-md">
              <Car className="w-4 h-4 text-[#0B0B0D]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white font-['Outfit']">
                GALLE <span className="text-[#F5B91B]">TAXI</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-[#F5B91B] font-semibold -mt-1">
                Admin Console
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-[#F5B91B] text-black shadow-md shadow-[#F5B91B]/20 font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-[#1A1A1E]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-black' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Status */}
        <div className="p-4 border-t border-[#1F1F23] space-y-3">
          {/* Connection status badge */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-[#0B0B0D] border border-[#27272A]">
            <div className="flex items-center gap-2">
              <Database className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span className="text-slate-400">Database:</span>
            </div>
            <span className={`font-semibold ${isFirebaseActive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isFirebaseActive ? 'Firestore Live' : 'Persistent Storage'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-[#27272A] border border-[#3F3F46] flex items-center justify-center text-xs font-bold text-[#F5B91B]">
                {adminUser?.email ? adminUser.email[0].toUpperCase() : 'A'}
              </div>
              <div className="truncate text-left">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {adminUser?.displayName || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{adminUser?.email}</div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#1F1F23] transition-colors"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-[#0E0E10]/95 backdrop-blur-md border-b border-[#27272A] h-16 px-4 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1A1A1E]"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
              <span>Admin</span>
              <span>/</span>
              <span className="text-white font-semibold">{currentNavItem.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141416] hover:bg-[#1F1F23] border border-[#27272A] text-xs font-medium text-slate-300 hover:text-white transition-colors"
            >
              <span>View Customer Website</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#F5B91B]" />
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-[#121214] border-r border-[#27272A] flex flex-col justify-between h-full p-5 z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-lg font-black text-white font-['Outfit']">
                  GALLE <span className="text-[#F5B91B]">TAXI</span>
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isActive(item.path);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                        active ? 'bg-[#F5B91B] text-black font-bold' : 'text-slate-400 hover:bg-[#1A1A1E]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#1F1F23]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
