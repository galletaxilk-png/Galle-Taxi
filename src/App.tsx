/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from 'react-router-dom';
import { APIProvider } from '@vis.gl/react-google-maps';
import { AppProvider, useApp } from './lib/store';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SupportWidget } from './components/SupportWidget';

// Customer Pages
import { Home } from './pages/Home';
import { ServicesPage } from './pages/ServicesPage';
import { AirportDropPage } from './pages/AirportDropPage';
import { AirportPickupPage } from './pages/AirportPickupPage';
import { GeneralTaxiPage } from './pages/GeneralTaxiPage';
import { AhangamaTaxiPage } from './pages/destinations/AhangamaTaxiPage';
import { MirissaTaxiPage } from './pages/destinations/MirissaTaxiPage';
import { UnawatunaTaxiPage } from './pages/destinations/UnawatunaTaxiPage';
import { HikkaduwaTaxiPage } from './pages/destinations/HikkaduwaTaxiPage';
import { BentotaTaxiPage } from './pages/destinations/BentotaTaxiPage';
import { WeligamaTaxiPage } from './pages/destinations/WeligamaTaxiPage';
import { TourDetailPage } from './pages/TourDetailPage';
import { VehiclesPage } from './pages/VehiclesPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { BookTaxiPage } from './pages/BookTaxiPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { TrackBookingPage } from './pages/TrackBookingPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

// Admin Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminOverview } from './pages/admin/AdminOverview';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminDrivers } from './pages/admin/AdminDrivers';
import { AdminVehicles } from './pages/admin/AdminVehicles';
import { AdminMedia } from './pages/admin/AdminMedia';
import { AdminFares } from './pages/admin/AdminFares';
import { AdminCurrencies } from './pages/admin/AdminCurrencies';
import { AdminTours } from './pages/admin/AdminTours';
import { AdminServices } from './pages/admin/AdminServices';
import { AdminServiceAreas } from './pages/admin/AdminServiceAreas';
import { AdminTaxiHubs } from './pages/admin/AdminTaxiHubs';
import { AdminContent } from './pages/admin/AdminContent';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';
import { AdminAvailability } from './pages/admin/AdminAvailability';

/**
 * ScrollToTop helper for route transitions
 */
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

/**
 * Customer Layout with Navbar and Footer
 */
const CustomerLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-[#0B0B0D] text-slate-100">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <SupportWidget />
    </div>
  );
};

/**
 * Protected Admin Route Guard
 */
const ProtectedAdminRoute: React.FC = () => {
  const { isAdminLoggedIn, isAuthChecking } = useApp();

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#0B0B0D] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#F5B91B] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-mono">Verifying authorization...</span>
        </div>
      </div>
    );
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/admin/login" replace />;
  }
  return <AdminLayout />;
};

const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyCHHstHxGGV9a3B47K6Mj7U71qOmmkJ79A';

export default function App() {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']} region="LK" language="en">
      <AppProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Customer Facing Routes */}
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/airport-drop" element={<AirportDropPage />} />
              <Route path="/airport-pickup" element={<AirportPickupPage />} />
              <Route path="/general-taxi" element={<GeneralTaxiPage />} />
              <Route path="/ahangama-taxi" element={<AhangamaTaxiPage />} />
              <Route path="/mirissa-taxi" element={<MirissaTaxiPage />} />
              <Route path="/unawatuna-taxi" element={<UnawatunaTaxiPage />} />
              <Route path="/hikkaduwa-taxi" element={<HikkaduwaTaxiPage />} />
              <Route path="/bentota-taxi" element={<BentotaTaxiPage />} />
              <Route path="/weligama-taxi" element={<WeligamaTaxiPage />} />
              <Route path="/tours/:slug" element={<TourDetailPage />} />
              <Route path="/vehicles" element={<VehiclesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/book" element={<BookTaxiPage />} />
              <Route path="/booking-success" element={<BookingSuccessPage />} />
              <Route path="/track-booking" element={<TrackBookingPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Route>

            {/* Direct Admin & Dispatcher Secure Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/login" element={<Navigate to="/admin/login" replace />} />
            <Route path="/dispatcher" element={<Navigate to="/admin/login" replace />} />

            {/* Protected Admin Console Routes */}
            <Route path="/admin" element={<ProtectedAdminRoute />}>
              <Route index element={<AdminOverview />} />
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="availability" element={<AdminAvailability />} />
              <Route path="tours" element={<AdminTours />} />
              <Route path="drivers" element={<AdminDrivers />} />
              <Route path="vehicles" element={<AdminVehicles />} />
              <Route path="media" element={<AdminMedia />} />
              <Route path="fares" element={<AdminFares />} />
              <Route path="currencies" element={<AdminCurrencies />} />
              <Route path="services" element={<AdminServices />} />
              <Route path="taxi-hubs" element={<AdminTaxiHubs />} />
              <Route path="service-areas" element={<AdminServiceAreas />} />
              <Route path="content" element={<AdminContent />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>

            {/* Fallback 404 Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </APIProvider>
  );
}
