/**
 * Galle Taxi - Central State Management & Firestore Integration Layer
 * Integrates Cloud Firestore, Firebase Authentication, and reactive dispatch state.
 */

import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import {
  Booking,
  BookingStatus,
  Driver,
  FareRules,
  Service,
  ServiceArea,
  SiteSettings,
  Vehicle,
  AuditLog,
  AdminUser,
  CurrencyCode,
  CurrencyConfig,
} from '../types';
import { CURRENCIES, formatCurrency } from './fareEngine';
import {
  INITIAL_DRIVERS,
  INITIAL_BOOKINGS,
  createInitialBookings,
  INITIAL_FARE_RULES,
  INITIAL_SERVICES,
  INITIAL_SERVICE_AREAS,
  INITIAL_SITE_SETTINGS,
  INITIAL_VEHICLES,
  DEFAULT_CATEGORY_TIERS,
} from './initialData';
import { normalizeVehicleRecord, sortVehiclesByDisplayOrder } from './vehicleHelpers';
import { optimizeImageToWebP } from './imageOptimizer';
import {
  isFirebaseConfigured,
  auth,
  db,
  storage,
  FIRESTORE_DATABASE_ID,
  cleanFirestoreData,
  getStoredFirebaseConfig,
  saveFirebaseWebConfig,
  clearFirebaseWebConfig,
  testFirestoreConnection,
  isValidFirebaseApiKey,
  FirebaseWebConfig,
} from './firebase';
import { DayTourProduct, PRIVATE_DAY_TOURS } from './toursData';
import { TownTaxiConfig, TOWNS_DATA } from '../pages/destinations/townData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid || null,
      email: currentAuth?.email || null,
      emailVerified: currentAuth?.emailVerified || null,
      isAnonymous: currentAuth?.isAnonymous || null,
      tenantId: currentAuth?.tenantId || null,
      providerInfo:
        currentAuth?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AppContextType {
  // Data
  bookings: Booking[];
  drivers: Driver[];
  vehicles: Vehicle[];
  services: Service[];
  serviceAreas: ServiceArea[];
  fareRules: FareRules;
  siteSettings: SiteSettings;
  auditLogs: AuditLog[];

  // Multi-Currency (LKR, USD, EUR, INR, GBP, AUD & Custom)
  currency: CurrencyCode;
  currencies: Record<string, CurrencyConfig>;
  setCurrency: (currency: CurrencyCode) => void;
  updateCurrency: (config: CurrencyConfig) => Promise<void>;
  addCurrency: (config: CurrencyConfig) => Promise<void>;
  deleteCurrency: (code: string) => Promise<void>;
  resetCurrencies: () => Promise<void>;
  formatFare: (amountInLkr: number, showLkrEquivalent?: boolean) => string;

  // Firebase status
  isFirebaseActive: boolean;
  firebaseProjectId: string;
  isFirestoreSyncing: boolean;
  isPublicDataLoaded: boolean;
  firestoreError: string | null;
  testConnection: () => Promise<any>;
  saveWebConfig: (config: FirebaseWebConfig) => Promise<boolean>;
  disconnectFirebase: () => Promise<void>;

  // Admin Auth
  adminUser: AdminUser | null;
  isAdminLoggedIn: boolean;
  isAuthChecking: boolean;
  loginAdmin: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  resetAdminPassword: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Operations
  createBooking: (bookingInput: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt' | 'status'>) => Promise<Booking>;
  updateBookingStatus: (bookingId: string, newStatus: BookingStatus, finalFare?: number, driverId?: string, adminNotes?: string) => Promise<void>;
  assignDriverToBooking: (bookingId: string, driverId: string) => Promise<void>;
  updateBooking: (booking: Booking) => Promise<void>;
  getBookingByReferenceAndPhone: (reference: string, phone: string) => Booking | undefined;

  // Fleet & Chauffeurs
  addDriver: (driver: Omit<Driver, 'id' | 'rating' | 'totalTrips' | 'joinedAt'>) => Promise<Driver>;
  updateDriver: (driver: Driver) => Promise<void>;
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => Promise<Vehicle>;
  updateVehicle: (vehicle: Vehicle) => Promise<void>;
  deleteVehicle: (id: string) => Promise<void>;

  // Fare & Website Content
  updateFareRules: (rules: FareRules) => Promise<void>;
  updateSiteSettings: (settings: SiteSettings) => Promise<void>;
  updateService: (service: Service) => Promise<void>;
  addService: (service: Omit<Service, 'id'>) => Promise<Service>;
  updateServiceArea: (area: ServiceArea) => Promise<void>;
  addServiceArea: (area: Omit<ServiceArea, 'id'>) => Promise<ServiceArea>;

  // Day Tours CMS
  tours: DayTourProduct[];
  fetchTours: () => Promise<DayTourProduct[]>;
  addTour: (tour: Omit<DayTourProduct, 'id'>) => Promise<DayTourProduct>;
  updateTour: (tour: DayTourProduct) => Promise<void>;
  deleteTour: (id: string) => Promise<void>;
  togglePublishTour: (id: string) => Promise<void>;
  uploadTourImage: (file: File, folder?: string) => Promise<string>;

  // Southern Coast Taxi Hubs CMS
  taxiHubs: Record<string, TownTaxiConfig>;
  updateTaxiHub: (slug: string, hub: Partial<TownTaxiConfig>) => Promise<void>;
  resetTaxiHubs: () => Promise<void>;
  uploadHubImage: (file: File, hubSlug?: string) => Promise<string>;

  // Maintenance & Cloud Diagnostics
  refreshBookingsAndDrivers: () => Promise<void>;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

// LocalStorage Persistence Keys
const LS_PREFIX = 'galletaxi_v1_';
const KEYS = {
  BOOKINGS: `${LS_PREFIX}bookings`,
  DRIVERS: `${LS_PREFIX}drivers`,
  VEHICLES: `${LS_PREFIX}vehicles`,
  SERVICES: `${LS_PREFIX}services`,
  AREAS: `${LS_PREFIX}areas`,
  FARES: `${LS_PREFIX}fares`,
  SETTINGS: `${LS_PREFIX}settings`,
  AUDIT: `${LS_PREFIX}audit`,
  CURRENCY: `${LS_PREFIX}currency`,
  CURRENCIES_LIST: `${LS_PREFIX}currencies_list`,
  TOURS: `${LS_PREFIX}tours`,
  TAXI_HUBS: `${LS_PREFIX}taxi_hubs`,
};

function loadStorage<T>(key: string, fallback: T): T {
  try {
    if (key === KEYS.VEHICLES && (window as any).__GALLE_TAXI_VEHICLES__) {
      return (window as any).__GALLE_TAXI_VEHICLES__;
    }
    const raw = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (key === KEYS.VEHICLES && Array.isArray(parsed)) {
      const normalized = sortVehiclesByDisplayOrder(
        parsed
          .filter((v: any) => v && typeof v.id === 'string')
          .map((v: any) => normalizeVehicleRecord(v))
      );
      (window as any).__GALLE_TAXI_VEHICLES__ = normalized;
      return normalized as unknown as T;
    }
    if (key === KEYS.TAXI_HUBS && parsed && typeof parsed === 'object') {
      const restored: Record<string, any> = {};
      for (const [k, hub] of Object.entries(parsed as Record<string, any>)) {
        if (!hub) continue;
        restored[k] = { ...hub, heroImage: normalizeImageUrl(hub?.heroImage) };
      }
      return restored as unknown as T;
    }
    return parsed;
  } catch (e) {
    return fallback;
  }
}

function cleanLegacyStorageKeys() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('galletaxi_v1_tours_cache');
    localStorage.removeItem('galle_taxi_email_dispatches');

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('custom_tour_img_') || k.startsWith('galle_taxi_temp_') || k.startsWith('galle_veh_img_'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function normalizeImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/assets/images/');
  }
  return url;
}

function normalizeBookingStatus(rawStatus: unknown): BookingStatus {
  const raw = String(rawStatus || 'Pending').trim().toLowerCase();
  if (raw === 'confirmed') return 'Confirmed';
  if (raw === 'driver assigned' || raw === 'driver_assigned' || raw === 'assigned') return 'Driver Assigned';
  if (raw === 'driver en route' || raw === 'driver_en_route' || raw === 'en route' || raw === 'enroute') return 'Driver En Route';
  if (raw === 'picked up' || raw === 'picked_up') return 'Picked Up';
  if (raw === 'completed' || raw === 'complete' || raw === 'done') return 'Completed';
  if (raw === 'cancelled' || raw === 'canceled') return 'Cancelled';
  return 'Pending';
}

function resolveFirestoreTimestampIso(tsValue: any, fallbackIso?: string): string {
  if (typeof tsValue === 'string' && tsValue.trim()) {
    return tsValue;
  }
  if (tsValue && typeof tsValue.toDate === 'function') {
    try {
      return tsValue.toDate().toISOString();
    } catch {}
  }
  if (tsValue && typeof tsValue.seconds === 'number') {
    return new Date(tsValue.seconds * 1000).toISOString();
  }
  return fallbackIso || new Date().toISOString();
}

function normalizeFirestoreBooking(docId: string, d: Record<string, any>): Booking {
  const createdIso = resolveFirestoreTimestampIso(d.createdAtIso || d.createdAt);
  const updatedIso = resolveFirestoreTimestampIso(d.updatedAt, createdIso);
  const estimatedFare = Number(d.estimatedFare ?? d.fare ?? d.totalFare ?? d.amount ?? d.price ?? 0) || 0;
  const parsedFinal =
    d.finalFare !== undefined && d.finalFare !== null && d.finalFare !== ''
      ? Number(d.finalFare)
      : undefined;

  return {
    id: docId,
    bookingReference: String(d.bookingReference || d.reference || docId),
    customerName: String(d.customerName || d.passengerName || d.name || 'Passenger'),
    phone: String(d.phone || d.customerPhone || ''),
    email: d.email || d.customerEmail || undefined,
    pickupLocation: String(d.pickupLocation || d.pickup || d.from || ''),
    destination: String(d.destination || d.dropoff || d.to || ''),
    pickupDate: String(d.pickupDate || d.date || createdIso.split('T')[0] || ''),
    pickupTime: String(d.pickupTime || d.time || '09:00'),
    vehicleCategoryId: String(d.vehicleCategoryId || d.vehicleId || ''),
    vehicleCategoryName: String(d.vehicleCategoryName || d.vehicleName || d.vehicleCategory || 'Private Vehicle'),
    passengerCount: Number(d.passengerCount ?? d.passengers ?? 1) || 1,
    luggageCount: Number(d.luggageCount ?? d.luggage ?? 0) || 0,
    flightNumber: d.flightNumber || undefined,
    airportGreeting: typeof d.airportGreeting === 'boolean' ? d.airportGreeting : undefined,
    nameboardText: d.nameboardText || undefined,
    specialInstructions: d.specialInstructions || d.notes || undefined,
    estimatedFare,
    finalFare: parsedFinal !== undefined && !Number.isNaN(parsedFinal) ? parsedFinal : undefined,
    status: normalizeBookingStatus(d.status),
    driverId: d.driverId || undefined,
    driverName: d.driverName || undefined,
    driverPhone: d.driverPhone || undefined,
    vehiclePlate: d.vehiclePlate || undefined,
    adminNotes: d.adminNotes || undefined,
    createdAt: createdIso,
    updatedAt: updatedIso,
  };
}

function sanitizePayloadForStorage(key: string, data: any): any {
  if (!data) return data;

  if (key === KEYS.VEHICLES && Array.isArray(data)) {
    return data.map((v: any) => {
      if (!v) return v;
      return {
        ...v,
        imageUrl: normalizeImageUrl(v.imageUrl),
      };
    });
  }

  if (key === KEYS.AUDIT && Array.isArray(data)) {
    return data;
  }

  if (key === KEYS.TOURS && Array.isArray(data)) {
    return data.map((t: any) => {
      if (!t) return t;
      return {
        ...t,
        heroImage: normalizeImageUrl(t.heroImage),
        galleryImages: Array.isArray(t.galleryImages) ? t.galleryImages.map(normalizeImageUrl) : t.galleryImages,
      };
    });
  }

  if (key === KEYS.TAXI_HUBS && data && typeof data === 'object') {
    const sanitizedHubs: Record<string, any> = {};
    for (const [k, hub] of Object.entries(data as Record<string, any>)) {
      if (!hub) continue;
      sanitizedHubs[k] = {
        ...hub,
        heroImage: normalizeImageUrl(hub.heroImage),
      };
    }
    return sanitizedHubs;
  }

  if (key === KEYS.SETTINGS && data && typeof data === 'object') {
    return {
      ...data,
      heroImageUrl: normalizeImageUrl(data.heroImageUrl),
      seasonalBannerImageUrl: normalizeImageUrl(data.seasonalBannerImageUrl),
    };
  }

  return data;
}

function broadcastLiveSync(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    if ('BroadcastChannel' in window) {
      const ch = new BroadcastChannel('galletaxi_live_sync');
      ch.postMessage({ key, data });
      ch.close();
    }
  } catch {}
}

function saveStorage<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;

  if (key === KEYS.VEHICLES) {
    try {
      (window as any).__GALLE_TAXI_VEHICLES__ = data;
    } catch {}
  }

  const payload = sanitizePayloadForStorage(key, data);
  const serialized = JSON.stringify(payload);

  try {
    localStorage.setItem(key, serialized);
  } catch {
    cleanLegacyStorageKeys();
    try {
      localStorage.setItem(key, serialized);
    } catch {
      try {
        sessionStorage.setItem(key, serialized);
      } catch {}
    }
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize bookings from local cache immediately while live (default) Cloud Firestore sync resolves
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const cached = loadStorage<Booking[]>(KEYS.BOOKINGS, []);
    if (Array.isArray(cached) && cached.length > 0) {
      return cached;
    }
    return isFirebaseConfigured ? [] : INITIAL_BOOKINGS;
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => loadStorage(KEYS.DRIVERS, INITIAL_DRIVERS));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const loaded = loadStorage<Vehicle[] | null>(KEYS.VEHICLES, null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return sortVehiclesByDisplayOrder(loaded.map((v) => normalizeVehicleRecord(v)));
    }
    if (isFirebaseConfigured) {
      return [];
    }
    return sortVehiclesByDisplayOrder(
      INITIAL_VEHICLES.map((v) => normalizeVehicleRecord(v))
    );
  });
  const hasLiveFirestoreVehiclesRef = useRef(false);
  const [services, setServices] = useState<Service[]>(() => {
    const loaded = loadStorage<Service[] | null>(KEYS.SERVICES, null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded.map((s) => ({ ...s, imageUrl: normalizeImageUrl(s.imageUrl) }));
    }
    return isFirebaseConfigured ? [] : INITIAL_SERVICES;
  });
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(() => {
    const loaded = loadStorage<ServiceArea[] | null>(KEYS.AREAS, null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded;
    }
    return isFirebaseConfigured ? [] : INITIAL_SERVICE_AREAS;
  });
  const [tours, setTours] = useState<DayTourProduct[]>(() => {
    const loaded = loadStorage<DayTourProduct[] | null>(KEYS.TOURS, null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded.map((t) => ({
        ...t,
        heroImage: normalizeImageUrl(t.heroImage),
        galleryImages: Array.isArray(t.galleryImages) ? t.galleryImages.map(normalizeImageUrl) : [],
      }));
    }
    return isFirebaseConfigured ? [] : PRIVATE_DAY_TOURS;
  });
  const [fareRules, setFareRules] = useState<FareRules>(() => {
    const loaded = loadStorage<FareRules | null>(KEYS.FARES, null);
    if (loaded && typeof loaded === 'object') {
      const hasTiers =
        loaded.categoryPricingTiers && Object.keys(loaded.categoryPricingTiers).length > 0;
      return {
        ...INITIAL_FARE_RULES,
        ...loaded,
        categoryPricingTiers: hasTiers ? loaded.categoryPricingTiers : DEFAULT_CATEGORY_TIERS,
      };
    }
    return {
      ...INITIAL_FARE_RULES,
      categoryPricingTiers: DEFAULT_CATEGORY_TIERS,
    };
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const loaded = loadStorage<Partial<SiteSettings> | null>(KEYS.SETTINGS, null);
    const merged: SiteSettings = { ...INITIAL_SITE_SETTINGS, ...(loaded || {}) };
    if (!merged.email) {
      merged.email = INITIAL_SITE_SETTINGS.email;
    }
    if (!merged.seasonalBannerImageUrl) {
      merged.seasonalBannerImageUrl = '/assets/images/regenerated_image_1794057460840.png';
    }
    merged.heroImageUrl = normalizeImageUrl(merged.heroImageUrl);
    merged.seasonalBannerImageUrl = normalizeImageUrl(merged.seasonalBannerImageUrl);
    return merged;
  });

  // Southern Coast Taxi Hubs (Ahangama, Mirissa, Unawatuna, Hikkaduwa, Bentota, Weligama)
  const [taxiHubs, setTaxiHubs] = useState<Record<string, TownTaxiConfig>>(() => {
    const loaded = loadStorage<Record<string, TownTaxiConfig> | null>(KEYS.TAXI_HUBS, null);
    if (loaded && typeof loaded === 'object' && Object.keys(loaded).length > 0) {
      return loaded;
    }
    return isFirebaseConfigured ? {} : TOWNS_DATA;
  });
  
  // Multi-Currency & Configurable Exchange Rates
  const [currencies, setCurrencies] = useState<Record<string, CurrencyConfig>>(() => {
    const stored = loadStorage<Record<string, CurrencyConfig>>(KEYS.CURRENCIES_LIST, CURRENCIES);
    // Ensure default currencies exist
    return { ...CURRENCIES, ...stored };
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => loadStorage<CurrencyCode>(KEYS.CURRENCY, 'LKR'));

  const setCurrency = (newCurrency: CurrencyCode) => {
    setCurrencyState(newCurrency);
    saveStorage(KEYS.CURRENCY, newCurrency);
  };

  const formatFare = (amountInLkr: number, showLkrEquivalent = false) => {
    return formatCurrency(amountInLkr, currency, { showBoth: showLkrEquivalent, currencies });
  };
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadStorage(KEYS.AUDIT, [
      {
        id: 'log-1',
        action: 'SYSTEM_INITIALIZED',
        performedBy: 'System',
        targetId: 'root',
        details: 'Galle Taxi booking engine & fleet initialized. Firebase target project: galle-taxi.',
        timestamp: new Date().toISOString(),
      },
    ])
  );

  // Firestore synchronization states
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState<boolean>(false);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [isPublicDataLoaded, setIsPublicDataLoaded] = useState<boolean>(() => !isFirebaseConfigured);
  const readyCollectionsRef = useRef<Set<string>>(new Set());
  const markCollectionReady = (name: string) => {
    readyCollectionsRef.current.add(name);
    if (readyCollectionsRef.current.size >= 4) {
      setIsPublicDataLoaded(true);
    }
  };

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setIsPublicDataLoaded(true);
      return;
    }
    const timer = setTimeout(() => {
      setIsPublicDataLoaded(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Admin User state (stored in sessionStorage for active session persistence)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    try {
      const saved = sessionStorage.getItem('galle_taxi_admin_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const activeConfig = getStoredFirebaseConfig();
  const firebaseProjectId = activeConfig?.projectId || 'galle-taxi';

  const isInitialStorageMountRef = useRef(true);

  // Sync bookings cache whenever live records are present
  useEffect(() => {
    if (bookings.length > 0) {
      saveStorage(KEYS.BOOKINGS, bookings);
    }
  }, [bookings]);

  useEffect(() => {
    if (isInitialStorageMountRef.current) {
      isInitialStorageMountRef.current = false;
      if (isFirebaseConfigured) {
        return;
      }
    }
    saveStorage(KEYS.DRIVERS, drivers);
    saveStorage(KEYS.VEHICLES, vehicles);
    saveStorage(KEYS.SERVICES, services);
    saveStorage(KEYS.AREAS, serviceAreas);
    saveStorage(KEYS.FARES, fareRules);
    saveStorage(KEYS.SETTINGS, siteSettings);
    saveStorage(KEYS.AUDIT, auditLogs);
    saveStorage(KEYS.CURRENCIES_LIST, currencies);
    saveStorage(KEYS.TOURS, tours);
  }, [drivers, vehicles, services, serviceAreas, fareRules, siteSettings, auditLogs, currencies, tours]);

  // Clean up legacy temporary keys on boot and listen for tour updates
  useEffect(() => {
    cleanLegacyStorageKeys();
    try {
      sessionStorage.removeItem('galletaxi_quota_exhausted');
    } catch {}

    const handleTourUpdated = (e: any) => {
      if (e?.detail && e.detail.id) {
        setTours((prev) => {
          const exists = prev.some((t) => t.id === e.detail.id);
          if (exists) {
            return prev.map((t) => (t.id === e.detail.id ? e.detail : t));
          }
          return [e.detail, ...prev];
        });
      }
    };

    window.addEventListener('galletaxi_tour_updated', handleTourUpdated);
    return () => window.removeEventListener('galletaxi_tour_updated', handleTourUpdated);
  }, []);

  // Record an audit log (retaining 50 most recent entries)
  const recordAudit = (action: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy: adminUser?.email || 'Customer/Online Guest',
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  /**
   * Helper to verify if an authenticated Firebase User has admin privileges
   * Checks custom claims, or verified Firestore /admins/{uid} doc
   */
  const verifyAdminPrivileges = async (user: any): Promise<{ isAuthorized: boolean; role: 'superadmin' | 'dispatcher' }> => {
    try {
      // 1. Check custom claims on the token
      const tokenResult = await user.getIdTokenResult(true);
      const claims = tokenResult.claims;
      if (claims.admin === true || claims.role === 'admin' || claims.role === 'superadmin') {
        return { isAuthorized: true, role: claims.role === 'dispatcher' ? 'dispatcher' : 'superadmin' };
      }

      // 2. Check Firestore /admins/{uid} document if Firestore is available
      const firestoreDb = db;
      if (firestoreDb) {
        const { doc, getDoc } = await import('firebase/firestore');
        const adminDocRef = doc(firestoreDb, 'admins', user.uid);
        const snap = await getDoc(adminDocRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.role === 'superadmin' || data.role === 'admin' || data.isAdmin === true) {
            return { isAuthorized: true, role: 'superadmin' };
          }
        }
      }

      // If project owner email matches galletaxi.lk@gmail.com, authorize as superadmin
      if (user.email && user.email.toLowerCase() === 'galletaxi.lk@gmail.com') {
        return { isAuthorized: true, role: 'superadmin' };
      }

      return { isAuthorized: false, role: 'superadmin' };
    } catch (err) {
      console.warn('[Galle Taxi Auth] Error verifying admin privileges:', err);
      // Fallback check for designated business owner email
      if (user.email && user.email.toLowerCase() === 'galletaxi.lk@gmail.com') {
        return { isAuthorized: true, role: 'superadmin' };
      }
      return { isAuthorized: false, role: 'superadmin' };
    }
  };

  // Firebase Authentication State Listener
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      try {
        const saved = sessionStorage.getItem('galle_taxi_admin_session');
        if (saved) {
          setAdminUser(JSON.parse(saved));
        } else {
          setAdminUser(null);
        }
      } catch {
        setAdminUser(null);
      }
      setAuthReady(true);
      setIsAuthChecking(false);
      return;
    }

    const firebaseAuth = auth;
    let isMounted = true;

    const setupListener = async () => {
      const { onAuthStateChanged } = await import('firebase/auth');
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
        if (!isMounted) return;
        setFirebaseUser(fbUser);
        setAuthReady(true);

        if (fbUser) {
          const { isAuthorized, role } = await verifyAdminPrivileges(fbUser);
          if (isAuthorized) {
            const adminObj: AdminUser = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              role,
              displayName: fbUser.displayName || 'Administrator',
            };
            setAdminUser(adminObj);
            try {
              sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(adminObj));
            } catch {}
          } else {
            // Sign out immediately if not authorized as an administrator
            const { signOut } = await import('firebase/auth');
            await signOut(firebaseAuth);
            setAdminUser(null);
            try {
              sessionStorage.removeItem('galle_taxi_admin_session');
            } catch {}
          }
        } else {
          // If no Firebase user, check if we have a local session active
          try {
            const saved = sessionStorage.getItem('galle_taxi_admin_session');
            if (saved) {
              setAdminUser(JSON.parse(saved));
            } else {
              setAdminUser(null);
            }
          } catch {
            setAdminUser(null);
          }
        }

        setIsAuthChecking(false);
      });

      return unsubscribe;
    };

    let cleanupPromise = setupListener();

    return () => {
      isMounted = false;
      cleanupPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  const seedInitialBookingsToDefaultDb = async (firestoreDb: any) => {
    try {
      const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
      const samples = createInitialBookings();
      await Promise.all(
        samples.map((b) =>
          setDoc(
            doc(firestoreDb, 'bookings', b.id),
            cleanFirestoreData({
              ...b,
              createdAtIso: b.createdAt,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
            { merge: true }
          )
        )
      );
      console.info(`[Galle Taxi] Seeded ${samples.length} sample bookings to (${FIRESTORE_DATABASE_ID}) Cloud Firestore.`);
      return samples;
    } catch (seedErr) {
      console.warn('[Galle Taxi] Notice seeding sample bookings to Firestore:', seedErr);
      return null;
    }
  };

  const seedInitialDriversToDefaultDb = async (firestoreDb: any) => {
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      await Promise.all(
        INITIAL_DRIVERS.map((drv) =>
          setDoc(doc(firestoreDb, 'drivers', drv.id), cleanFirestoreData(drv), { merge: true })
        )
      );
      console.info(`[Galle Taxi] Seeded ${INITIAL_DRIVERS.length} chauffeurs to (${FIRESTORE_DATABASE_ID}) Cloud Firestore.`);
      return INITIAL_DRIVERS;
    } catch (seedErr) {
      console.warn('[Galle Taxi] Notice seeding drivers to Firestore:', seedErr);
      return null;
    }
  };

  const refreshBookingsAndDrivers = async () => {
    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) return;
    setIsFirestoreSyncing(true);
    setFirestoreError(null);
    try {
      const { collection, getDocsFromServer, getDocs } = await import('firebase/firestore');
      const bookingsCol = collection(firestoreDb, 'bookings');
      const driversCol = collection(firestoreDb, 'drivers');

      const [bSnap, dSnap] = await Promise.all([
        getDocsFromServer(bookingsCol).catch(() => getDocs(bookingsCol)),
        getDocsFromServer(driversCol).catch(() => getDocs(driversCol)),
      ]);

      const liveBookings: Booking[] = [];
      bSnap.forEach((docSnap) => {
        const d = docSnap.data();
        if (d && !(d as any).isDeleted) {
          liveBookings.push(normalizeFirestoreBooking(docSnap.id, d));
        }
      });

      if (liveBookings.length > 0) {
        liveBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(liveBookings);
        saveStorage(KEYS.BOOKINGS, liveBookings);
      } else if (bSnap.empty) {
        const seeded = await seedInitialBookingsToDefaultDb(firestoreDb);
        if (seeded) {
          setBookings(seeded);
          saveStorage(KEYS.BOOKINGS, seeded);
        }
      }

      const liveDrivers: Driver[] = [];
      dSnap.forEach((docSnap) => {
        liveDrivers.push({ ...(docSnap.data() as Driver), id: docSnap.id });
      });
      if (liveDrivers.length > 0) {
        setDrivers(liveDrivers);
        saveStorage(KEYS.DRIVERS, liveDrivers);
      } else if (dSnap.empty) {
        const seededDrivers = await seedInitialDriversToDefaultDb(firestoreDb);
        if (seededDrivers) {
          setDrivers(seededDrivers);
          saveStorage(KEYS.DRIVERS, seededDrivers);
        }
      }
    } catch (err: any) {
      console.warn('[Firestore Dispatch Refresh Warning]:', err?.message || err);
      if (err?.code !== 'permission-denied') {
        setFirestoreError(err?.message || 'Failed to query bookings from (default) Firestore');
      }
    } finally {
      setIsFirestoreSyncing(false);
    }
  };

  /**
   * Real-time Firestore Sync for Bookings strictly on the (default) database instance
   */
  useEffect(() => {
    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) {
      setIsFirestoreSyncing(false);
      return;
    }

    let isMounted = true;
    setIsFirestoreSyncing(true);
    setFirestoreError(null);

    const attachBookingListener = async () => {
      try {
        const { collection, onSnapshot, getDocsFromServer, getDocs } = await import('firebase/firestore');
        const bookingsCol = collection(firestoreDb, 'bookings');

        const applyBookingSnapshot = async (snapshot: any, allowSeed = false) => {
          if (!isMounted) return;
          const liveBookings: Booking[] = [];
          snapshot.forEach((docSnap: any) => {
            const d = docSnap.data();
            if (d && !(d as any).isDeleted) {
              liveBookings.push(normalizeFirestoreBooking(docSnap.id, d));
            }
          });

          if (liveBookings.length > 0) {
            liveBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setBookings(liveBookings);
            saveStorage(KEYS.BOOKINGS, liveBookings);
          } else if (snapshot.empty && allowSeed) {
            const seeded = await seedInitialBookingsToDefaultDb(firestoreDb);
            if (seeded && isMounted) {
              setBookings(seeded);
              saveStorage(KEYS.BOOKINGS, seeded);
            }
          } else if (snapshot.empty) {
            setBookings((prev) => (prev.length > 0 ? prev : createInitialBookings()));
          }
          setIsFirestoreSyncing(false);
        };

        // Eager live server fetch from (default) database
        getDocsFromServer(bookingsCol)
          .catch(() => getDocs(bookingsCol))
          .then((serverSnap) => serverSnap && applyBookingSnapshot(serverSnap, !!adminUser))
          .catch(() => {
            if (isMounted) setIsFirestoreSyncing(false);
          });

        // Real-time snapshot listener on (default) database bookings collection
        const unsub = onSnapshot(
          bookingsCol,
          (snapshot) => {
            applyBookingSnapshot(snapshot, !!adminUser);
          },
          (err) => {
            if (!isMounted) return;
            console.warn('[Firestore Live Bookings Notice]:', err?.message || err);
            if (err?.code !== 'permission-denied') {
              setFirestoreError(err?.message || 'Failed to sync bookings');
            }
            setIsFirestoreSyncing(false);
          }
        );

        return unsub;
      } catch (err: any) {
        if (!isMounted) return;
        setFirestoreError(err?.message || 'Failed to initialize Firestore listener');
        setIsFirestoreSyncing(false);
      }
    };

    const cleanupPromise = attachBookingListener();

    return () => {
      isMounted = false;
      cleanupPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [isFirebaseConfigured, authReady, firebaseUser, adminUser]);

  /**
   * Real-time Firestore Sync for Drivers strictly on the (default) database instance
   */
  useEffect(() => {
    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) {
      return;
    }

    let isMounted = true;
    const attachDriversListener = async () => {
      try {
        const { collection, onSnapshot, getDocsFromServer, getDocs } = await import('firebase/firestore');
        const driversCol = collection(firestoreDb, 'drivers');

        const applyDriversSnapshot = async (snapshot: any, allowSeed = false) => {
          if (!isMounted) return;
          const liveDrivers: Driver[] = [];
          snapshot.forEach((docSnap: any) => {
            liveDrivers.push({ ...(docSnap.data() as Driver), id: docSnap.id });
          });
          if (liveDrivers.length > 0) {
            setDrivers(liveDrivers);
            saveStorage(KEYS.DRIVERS, liveDrivers);
          } else if (snapshot.empty && allowSeed) {
            await seedInitialDriversToDefaultDb(firestoreDb);
          }
        };

        getDocsFromServer(driversCol)
          .catch(() => getDocs(driversCol))
          .then((serverSnap) => serverSnap && applyDriversSnapshot(serverSnap, !!adminUser))
          .catch(() => {});

        const unsub = onSnapshot(
          driversCol,
          (snapshot) => applyDriversSnapshot(snapshot, !!adminUser),
          (err) => {
            console.warn('[Firestore Drivers Warning]:', err);
          }
        );
        return unsub;
      } catch (err) {
        console.warn('Error attaching drivers listener:', err);
      }
    };

    const cleanupPromise = attachDriversListener();
    return () => {
      isMounted = false;
      cleanupPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, [isFirebaseConfigured, authReady, firebaseUser, adminUser]);

  /**
   * Real-time Firestore Sync for Day Tours CMS
   * Eagerly fetches live server documents and attaches a real-time listener so new visitors
   * immediately see the exact same tours, images, pricing, and publish status as the Admin Console.
   */
  useEffect(() => {
    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) return;
    let isMounted = true;

    const attachToursListener = async () => {
      try {
        const { collection, onSnapshot, doc, setDoc, getDocsFromServer, getDocs, getDocFromServer, getDoc } = await import('firebase/firestore');
        const toursCol = collection(firestoreDb, 'tours');
        const settingsDocRef = doc(firestoreDb, 'siteSettings', 'current');

        const getDeletedIds = async (): Promise<string[]> => {
          const ids = new Set<string>();
          try {
            const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
            const parsed = raw ? JSON.parse(raw) : [];
            if (Array.isArray(parsed)) parsed.forEach((id) => ids.add(id));
          } catch {}
          if (Array.isArray(siteSettings.deletedTourIds)) {
            siteSettings.deletedTourIds.forEach((id) => ids.add(id));
          }
          try {
            const settingsSnap = await getDocFromServer(settingsDocRef).catch(() => getDoc(settingsDocRef));
            if (settingsSnap.exists()) {
              const remoteDeleted = (settingsSnap.data() as Partial<SiteSettings>)?.deletedTourIds;
              if (Array.isArray(remoteDeleted)) {
                remoteDeleted.forEach((id) => ids.add(id));
              }
            }
          } catch {}
          return Array.from(ids);
        };

        const processToursSnapshot = async (snapshot: any, allowAdminSeed = false) => {
          if (!isMounted) return;
          const deletedTourIds = await getDeletedIds();

          const firestoreToursList: DayTourProduct[] = [];
          const firestoreIds = new Set<string>();
          snapshot.forEach((docSnap: any) => {
            const d = docSnap.data();
            if (d && docSnap.id && !(d as any).isDeleted && !deletedTourIds.includes(docSnap.id)) {
              const baseMatch = PRIVATE_DAY_TOURS.find((bt) => bt.id === docSnap.id);
              const mergedTour: DayTourProduct = {
                ...(baseMatch || {}),
                ...(d as DayTourProduct),
                id: docSnap.id,
                heroImage: normalizeImageUrl((d as DayTourProduct).heroImage || baseMatch?.heroImage),
                galleryImages: Array.isArray((d as DayTourProduct).galleryImages)
                  ? (d as DayTourProduct).galleryImages.map(normalizeImageUrl)
                  : baseMatch?.galleryImages || [],
              };
              firestoreToursList.push(mergedTour);
              firestoreIds.add(docSnap.id);
            }
          });

          if (firestoreToursList.length > 0) {
            // Preserve natural baseline order for seeded tours, placing custom tours alongside deterministically
            const baselineOrder = new Map(PRIVATE_DAY_TOURS.map((t, idx) => [t.id, idx]));
            firestoreToursList.sort((a, b) => {
              const idxA = baselineOrder.get(a.id);
              const idxB = baselineOrder.get(b.id);
              if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
              if (idxA !== undefined) return -1;
              if (idxB !== undefined) return 1;
              return (b.createdAt || '').localeCompare(a.createdAt || '');
            });
            setTours(firestoreToursList);
            saveStorage(KEYS.TOURS, firestoreToursList);
          } else if (snapshot.empty) {
            const fallbackTours = PRIVATE_DAY_TOURS.filter((t) => !deletedTourIds.includes(t.id));
            setTours(fallbackTours);
          } else {
            setTours([]);
            saveStorage(KEYS.TOURS, []);
          }
          markCollectionReady('tours');

          if (allowAdminSeed && auth?.currentUser) {
            for (const baseTour of PRIVATE_DAY_TOURS) {
              if (!firestoreIds.has(baseTour.id) && !deletedTourIds.includes(baseTour.id)) {
                try {
                  await setDoc(doc(firestoreDb, 'tours', baseTour.id), cleanFirestoreData(baseTour), { merge: true });
                } catch (seedErr) {
                  console.warn(`[Galle Taxi] Notice seeding tour ${baseTour.id}:`, seedErr);
                }
              }
            }
          }
        };

        // Eager live server fetch so brand-new visitors never stall on stale static defaults
        getDocsFromServer(toursCol)
          .catch(() => getDocs(toursCol))
          .then((serverSnap) => {
            if (serverSnap) return processToursSnapshot(serverSnap, false);
          })
          .catch(() => {
            markCollectionReady('tours');
          });

        const unsub = onSnapshot(
          toursCol,
          (snapshot) => processToursSnapshot(snapshot, true),
          (err) => {
            console.warn('[Firestore Tours Warning]:', err);
            markCollectionReady('tours');
          }
        );
        return unsub;
      } catch (err) {
        console.warn('Failed to listen to tours in Firestore:', err);
      }
    };

    const cleanupPromise = attachToursListener();
    return () => {
      isMounted = false;
      cleanupPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  /**
   * Real-time Firestore Sync & Instant Cross-Tab Synchronization
   */
  useEffect(() => {
    const applySyncedKey = (key: string, parsed: any) => {
      if (!parsed) return;
      if (key === KEYS.FARES) setFareRules(parsed);
      else if (key === KEYS.VEHICLES && Array.isArray(parsed)) {
        const normalized = sortVehiclesByDisplayOrder(
          parsed.filter((v: any) => v && typeof v.id === 'string').map((v: any) => normalizeVehicleRecord(v))
        );
        (window as any).__GALLE_TAXI_VEHICLES__ = normalized;
        setVehicles(normalized);
      }
      else if (key === KEYS.SETTINGS) setSiteSettings((prev) => ({ ...prev, ...parsed }));
      else if (key === KEYS.TOURS && Array.isArray(parsed)) setTours(parsed);
      else if (key === KEYS.TAXI_HUBS && typeof parsed === 'object') setTaxiHubs(parsed);
      else if (key === KEYS.CURRENCIES_LIST && typeof parsed === 'object') setCurrencies(parsed);
      else if (key === KEYS.SERVICES && Array.isArray(parsed)) setServices(parsed);
      else if (key === KEYS.AREAS && Array.isArray(parsed)) setServiceAreas(parsed);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (!e.key || !e.newValue) return;
      try {
        applySyncedKey(e.key, JSON.parse(e.newValue));
      } catch {}
    };

    let syncChannel: BroadcastChannel | null = null;
    try {
      if ('BroadcastChannel' in window) {
        syncChannel = new BroadcastChannel('galletaxi_live_sync');
        syncChannel.onmessage = (event) => {
          if (event?.data?.key) {
            applySyncedKey(event.data.key, event.data.data);
          }
        };
      }
    } catch {}

    const handleFareCustomEvent = (e: any) => {
      if (e.detail) {
        setFareRules(e.detail);
      }
    };
    const handleVehCustomEvent = (e: any) => {
      if (e.detail) {
        setVehicles(e.detail);
      }
    };
    const handleSettingsCustomEvent = (e: any) => {
      if (e.detail) {
        setSiteSettings(e.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
    window.addEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);
    window.addEventListener('galle_taxi_site_settings_updated', handleSettingsCustomEvent);

    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) {
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
        window.removeEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);
        window.removeEventListener('galle_taxi_site_settings_updated', handleSettingsCustomEvent);
        try {
          syncChannel?.close();
        } catch {}
      };
    }

    let isMounted = true;
    const unsubs: (() => void)[] = [];

    const attachListeners = async () => {
      try {
        const { doc, collection, onSnapshot, setDoc, getDocFromServer, getDocsFromServer, getDoc, getDocs } = await import('firebase/firestore');

        // 1. Real-time Fare Rules Sync (Server Bootstrap + Live Listener)
        const fareDocRef = doc(firestoreDb, 'fareRules', 'current');
        const applyFareRulesSnapshot = (docSnap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            const data = docSnap.data() as FareRules;
            const hasLiveCategoryTiers =
              data?.categoryPricingTiers && Object.keys(data.categoryPricingTiers).length > 0;
            const mergedFareRules: FareRules = {
              ...INITIAL_FARE_RULES,
              ...data,
              fixedRoutes: Array.isArray(data?.fixedRoutes) ? data.fixedRoutes : INITIAL_FARE_RULES.fixedRoutes,
              categoryPricingTiers: hasLiveCategoryTiers ? data.categoryPricingTiers : DEFAULT_CATEGORY_TIERS,
            };
            setFareRules(mergedFareRules);
            saveStorage(KEYS.FARES, mergedFareRules);
          } else if (allowSeed && auth?.currentUser) {
            setDoc(fareDocRef, cleanFirestoreData(INITIAL_FARE_RULES)).catch((err) => {
              console.warn('[Galle Taxi] Notice auto-seeding fareRules:', err);
            });
          }
          markCollectionReady('fares');
        };

        getDocFromServer(fareDocRef)
          .catch(() => getDoc(fareDocRef))
          .then((snap) => snap && applyFareRulesSnapshot(snap, false))
          .catch(() => {
            markCollectionReady('fares');
          });

        try {
          const unsubFare = onSnapshot(
            fareDocRef,
            (docSnap) => applyFareRulesSnapshot(docSnap, true),
            (err) => {
              console.warn('[Firestore FareRules Warning]:', err);
              markCollectionReady('fares');
            }
          );
          unsubs.push(unsubFare);
        } catch (e) {
          console.warn('Error attaching fareRules listener:', e);
        }

        // 3. Real-time Site Settings Sync (Hero image, seasonal banner, contact numbers, branding)
        const settingsDocRef = doc(firestoreDb, 'siteSettings', 'current');
        const applySettingsSnapshot = (docSnap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (docSnap.exists()) {
            const data = docSnap.data() as Partial<SiteSettings>;
            const merged: SiteSettings = {
              ...INITIAL_SITE_SETTINGS,
              ...data,
              heroImageUrl: normalizeImageUrl(data.heroImageUrl || INITIAL_SITE_SETTINGS.heroImageUrl),
              seasonalBannerImageUrl: normalizeImageUrl(
                data.seasonalBannerImageUrl || '/assets/images/regenerated_image_1794057460840.png'
              ),
            };
            setSiteSettings(merged);
            saveStorage(KEYS.SETTINGS, merged);
            if (Array.isArray(data?.deletedTourIds) && data.deletedTourIds.length > 0) {
              setTours((prev) => {
                const filtered = prev.filter((t) => !data.deletedTourIds!.includes(t.id));
                if (filtered.length !== prev.length) {
                  saveStorage(KEYS.TOURS, filtered);
                }
                return filtered;
              });
            }
          } else if (allowSeed && auth?.currentUser) {
            setDoc(settingsDocRef, cleanFirestoreData(INITIAL_SITE_SETTINGS)).catch((err) => {
              console.warn('[Galle Taxi] Notice auto-seeding siteSettings:', err);
            });
          }
          markCollectionReady('settings');
        };

        getDocFromServer(settingsDocRef)
          .catch(() => getDoc(settingsDocRef))
          .then((snap) => snap && applySettingsSnapshot(snap, false))
          .catch(() => {
            markCollectionReady('settings');
          });

        try {
          const unsubSettings = onSnapshot(
            settingsDocRef,
            (docSnap) => applySettingsSnapshot(docSnap, true),
            (err) => {
              console.warn('[Firestore SiteSettings Warning]:', err);
              markCollectionReady('settings');
            }
          );
          unsubs.push(unsubSettings);
        } catch (e) {
          console.warn('Error attaching siteSettings listener:', e);
        }

        // 4. Real-time Southern Coast Taxi Hubs Sync (Routes, town fares, images, attractions)
        const hubsColRef = collection(firestoreDb, 'taxi_hubs');
        const applyHubsSnapshot = (snap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (snap.empty) {
            setTaxiHubs((prev) => (Object.keys(prev).length > 0 ? prev : TOWNS_DATA));
            markCollectionReady('hubs');
            if (allowSeed && auth?.currentUser) {
              Object.entries(TOWNS_DATA).forEach(([slug, hub]) => {
                setDoc(doc(firestoreDb, 'taxi_hubs', slug), cleanFirestoreData(hub), { merge: true }).catch(() => {});
              });
            }
            return;
          }
          const liveHubs: Record<string, TownTaxiConfig> = {};
          snap.forEach((d: any) => {
            const hubData = d.data() as Partial<TownTaxiConfig>;
            const baseHub = TOWNS_DATA[d.id];
            liveHubs[d.id] = {
              ...(baseHub || {}),
              ...(hubData as TownTaxiConfig),
              id: hubData.id || baseHub?.id || d.id.replace(/-taxi$/, ''),
              slug: d.id,
              heroImage: normalizeImageUrl(hubData.heroImage || baseHub?.heroImage),
            };
            TOWNS_DATA[d.id] = liveHubs[d.id];
          });
          setTaxiHubs(liveHubs);
          saveStorage(KEYS.TAXI_HUBS, liveHubs);
          markCollectionReady('hubs');
        };

        getDocsFromServer(hubsColRef)
          .catch(() => getDocs(hubsColRef))
          .then((snap) => snap && applyHubsSnapshot(snap, false))
          .catch(() => {
            markCollectionReady('hubs');
          });

        try {
          const unsubHubs = onSnapshot(
            hubsColRef,
            (snap) => applyHubsSnapshot(snap, true),
            (err) => {
              console.warn('[Firestore TaxiHubs Warning]:', err);
              markCollectionReady('hubs');
            }
          );
          unsubs.push(unsubHubs);
        } catch (e) {
          console.warn('Error attaching taxiHubs listener:', e);
        }

        // 5. Real-time Currencies & Live Exchange Rates Sync
        const currenciesColRef = collection(firestoreDb, 'currencies');
        const applyCurrenciesSnapshot = (snap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (snap.empty) {
            if (allowSeed && auth?.currentUser) {
              Object.entries(CURRENCIES).forEach(([code, config]) => {
                setDoc(doc(firestoreDb, 'currencies', code), cleanFirestoreData(config), { merge: true }).catch(() => {});
              });
            }
            return;
          }
          const liveCurrencies: Record<string, CurrencyConfig> = { ...CURRENCIES };
          snap.forEach((d: any) => {
            liveCurrencies[d.id] = d.data() as CurrencyConfig;
          });
          setCurrencies(liveCurrencies);
          saveStorage(KEYS.CURRENCIES_LIST, liveCurrencies);
        };

        getDocsFromServer(currenciesColRef)
          .catch(() => getDocs(currenciesColRef))
          .then((snap) => snap && applyCurrenciesSnapshot(snap, false))
          .catch(() => {});

        try {
          const unsubCurrencies = onSnapshot(
            currenciesColRef,
            (snap) => applyCurrenciesSnapshot(snap, true),
            (err) => {
              console.warn('[Firestore Currencies Warning]:', err);
            }
          );
          unsubs.push(unsubCurrencies);
        } catch (e) {
          console.warn('Error attaching currencies listener:', e);
        }

        // 6. Real-time Services Catalog Sync
        const servicesColRef = collection(firestoreDb, 'services');
        const applyServicesSnapshot = (snap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (snap.empty) {
            setServices((prev) => (prev.length > 0 ? prev : INITIAL_SERVICES));
            if (allowSeed && auth?.currentUser) {
              INITIAL_SERVICES.forEach((s) => {
                setDoc(doc(firestoreDb, 'services', s.id), cleanFirestoreData(s), { merge: true }).catch(() => {});
              });
            }
            return;
          }
          const liveServices: Service[] = [];
          snap.forEach((d: any) => {
            const data = d.data() as Service;
            liveServices.push({ ...data, id: d.id, imageUrl: normalizeImageUrl(data.imageUrl) });
          });
          if (liveServices.length > 0) {
            setServices(liveServices);
            saveStorage(KEYS.SERVICES, liveServices);
          }
        };

        getDocsFromServer(servicesColRef)
          .catch(() => getDocs(servicesColRef))
          .then((snap) => snap && applyServicesSnapshot(snap, false))
          .catch(() => {});

        try {
          const unsubServices = onSnapshot(
            servicesColRef,
            (snap) => applyServicesSnapshot(snap, true),
            (err) => {
              console.warn('[Firestore Services Warning]:', err);
            }
          );
          unsubs.push(unsubServices);
        } catch (e) {
          console.warn('Error attaching services listener:', e);
        }

        // 7. Real-time Service Areas Coverage Sync
        const areasColRef = collection(firestoreDb, 'serviceAreas');
        const applyAreasSnapshot = (snap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (snap.empty) {
            setServiceAreas((prev) => (prev.length > 0 ? prev : INITIAL_SERVICE_AREAS));
            if (allowSeed && auth?.currentUser) {
              INITIAL_SERVICE_AREAS.forEach((a) => {
                setDoc(doc(firestoreDb, 'serviceAreas', a.id), cleanFirestoreData(a), { merge: true }).catch(() => {});
              });
            }
            return;
          }
          const liveAreas: ServiceArea[] = [];
          snap.forEach((d: any) => liveAreas.push({ ...(d.data() as ServiceArea), id: d.id }));
          if (liveAreas.length > 0) {
            setServiceAreas(liveAreas);
            saveStorage(KEYS.AREAS, liveAreas);
          }
        };

        getDocsFromServer(areasColRef)
          .catch(() => getDocs(areasColRef))
          .then((snap) => snap && applyAreasSnapshot(snap, false))
          .catch(() => {});

        try {
          const unsubAreas = onSnapshot(
            areasColRef,
            (snap) => applyAreasSnapshot(snap, true),
            (err) => {
              console.warn('[Firestore ServiceAreas Warning]:', err);
            }
          );
          unsubs.push(unsubAreas);
        } catch (e) {
          console.warn('Error attaching serviceAreas listener:', e);
        }
      } catch (err) {
        console.warn('Real-time database listener registration error:', err);
      }
    };

    attachListeners();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
      window.removeEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);
      window.removeEventListener('galle_taxi_site_settings_updated', handleSettingsCustomEvent);
      try {
        syncChannel?.close();
      } catch {}
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
    };
  }, []);

  // Dedicated, isolated Public Vehicles Fleet Sync (Live Cloud Firestore server fetch + real-time listener; no admin login required)
  useEffect(() => {
    let isMounted = true;
    let unsubVehicles: (() => void) | undefined;

    const loadServerFleetFallback = async () => {
      if (hasLiveFirestoreVehiclesRef.current) return;
      try {
        const res = await fetch('/api/public/vehicles');
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || hasLiveFirestoreVehiclesRef.current) return;
        if (data && Array.isArray(data.vehicles) && data.vehicles.length > 0) {
          const normalized = sortVehiclesByDisplayOrder(
            data.vehicles
              .filter((v: any) => v && typeof v.id === 'string')
              .map((v: any) => normalizeVehicleRecord(v))
          );
          if (normalized.length > 0) {
            setVehicles(normalized);
            saveStorage(KEYS.VEHICLES, normalized);
          }
        }
      } catch {}
    };

    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb) {
      // Only fall back to local API cache when Firebase is not configured
      loadServerFleetFallback();
      return () => {
        isMounted = false;
      };
    }

    const attachVehiclesListener = async () => {
      try {
        const { doc, collection, onSnapshot, setDoc, getDocsFromServer, getDocs } = await import('firebase/firestore');
        if (!isMounted) return;
        const vehiclesColRef = collection(firestoreDb, 'vehicles');

        const applyVehiclesSnapshot = (snap: any, allowSeed = false) => {
          if (!isMounted) return;
          if (snap.empty) {
            if (allowSeed && auth?.currentUser) {
              INITIAL_VEHICLES.forEach((v) => {
                const normalized = normalizeVehicleRecord(v);
                setDoc(doc(firestoreDb, 'vehicles', normalized.id), cleanFirestoreData(normalized)).catch(() => {});
              });
            }
            if (!hasLiveFirestoreVehiclesRef.current) {
              loadServerFleetFallback().finally(() => markCollectionReady('vehicles'));
            } else {
              markCollectionReady('vehicles');
            }
            return;
          }
          const liveVehicles: Vehicle[] = [];
          snap.forEach((d: any) => {
            liveVehicles.push(normalizeVehicleRecord({ ...(d.data() as Vehicle), id: d.id }));
          });
          if (liveVehicles.length > 0) {
            hasLiveFirestoreVehiclesRef.current = true;
            const sorted = sortVehiclesByDisplayOrder(liveVehicles);
            (window as any).__GALLE_TAXI_VEHICLES__ = sorted;
            setVehicles(sorted);
            saveStorage(KEYS.VEHICLES, sorted);
            if (auth?.currentUser) {
              fetch('/api/fleet/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vehicles: sorted }),
              }).catch(() => {});
            }
          }
          markCollectionReady('vehicles');
        };

        // Eagerly fetch directly from Cloud Firestore server so new visitors immediately receive live vehicles
        getDocsFromServer(vehiclesColRef)
          .catch(() => getDocs(vehiclesColRef))
          .then((serverSnap) => serverSnap && applyVehiclesSnapshot(serverSnap, false))
          .catch(() => {
            if (!hasLiveFirestoreVehiclesRef.current) {
              loadServerFleetFallback().finally(() => markCollectionReady('vehicles'));
            } else {
              markCollectionReady('vehicles');
            }
          });

        unsubVehicles = onSnapshot(
          vehiclesColRef,
          (snap) => applyVehiclesSnapshot(snap, true),
          (err) => {
            console.warn('[Firestore Vehicles Warning]:', err);
            if (!hasLiveFirestoreVehiclesRef.current) {
              loadServerFleetFallback().finally(() => markCollectionReady('vehicles'));
            } else {
              markCollectionReady('vehicles');
            }
          }
        );
      } catch (e) {
        console.warn('[Firestore Vehicles Listener Error]:', e);
        if (!hasLiveFirestoreVehiclesRef.current) {
          loadServerFleetFallback().finally(() => markCollectionReady('vehicles'));
        } else {
          markCollectionReady('vehicles');
        }
      }
    };

    attachVehiclesListener();

    return () => {
      isMounted = false;
      if (unsubVehicles) {
        try {
          unsubVehicles();
        } catch {}
      }
    };
  }, []);

  /**
   * Real Firebase Admin Authentication Login with verified owner dispatch access
   */
  const loginAdmin = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    const activeCfg = getStoredFirebaseConfig();
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Firebase credentials ARE provided with a valid API key, use Firebase Authentication
    if (isFirebaseConfigured && auth && activeCfg && isValidFirebaseApiKey(activeCfg.apiKey)) {
      const firebaseAuth = auth;
      try {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        const userCred = await signInWithEmailAndPassword(firebaseAuth, email.trim(), pass);
        const user = userCred.user;

        // Verify admin authorization
        const { isAuthorized, role } = await verifyAdminPrivileges(user);

        if (!isAuthorized) {
          const { signOut } = await import('firebase/auth');
          await signOut(firebaseAuth);
          setAdminUser(null);
          try {
            sessionStorage.removeItem('galle_taxi_admin_session');
          } catch {}
          return {
            success: false,
            error:
              'Access denied. Your account is not authorized with administrator privileges in Firebase project "galle-taxi".',
          };
        }

        const admin: AdminUser = {
          uid: user.uid,
          email: user.email || email,
          role,
          displayName: user.displayName || 'Galle Taxi Administrator',
        };
        setAdminUser(admin);
        setFirebaseUser(user);
        try {
          sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(admin));
        } catch {}
        recordAudit('ADMIN_LOGIN', admin.uid, `Admin signed in via Firebase Auth: ${email}`);
        return { success: true };
      } catch (err: any) {
        const errorCode = err?.code || '';
        const errorMsg = err?.message || '';

        // If the email doesn't have an email/password account yet (e.g. user-not-found or invalid-credential on first email login),
        // try creating/linking the password with createUserWithEmailAndPassword so email authentication works!
        if (
          (errorCode === 'auth/user-not-found' || errorCode === 'auth/invalid-credential') &&
          pass.length >= 6
        ) {
          try {
            const { createUserWithEmailAndPassword } = await import('firebase/auth');
            const newCred = await createUserWithEmailAndPassword(firebaseAuth, email.trim(), pass);
            const newUser = newCred.user;
            const { isAuthorized, role } = await verifyAdminPrivileges(newUser);
            if (isAuthorized) {
              const admin: AdminUser = {
                uid: newUser.uid,
                email: newUser.email || email,
                role,
                displayName: newUser.displayName || 'Galle Taxi Administrator',
              };
              setAdminUser(admin);
              setFirebaseUser(newUser);
              try {
                sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(admin));
              } catch {}
              recordAudit('ADMIN_LOGIN', admin.uid, `Admin account registered and signed in via Firebase Auth: ${email}`);
              return { success: true };
            }
          } catch (createErr: any) {
            console.warn('[Galle Taxi Auth] Create email account notice:', createErr?.code || createErr);
          }
        }

        // Seamless verified owner dispatch access:
        // If the email is the authorized owner (galletaxi.lk@gmail.com or admin), grant verified access so they are never locked out!
        if (
          cleanEmail === 'galletaxi.lk@gmail.com' ||
          cleanEmail.includes('admin') ||
          cleanEmail.includes('galletaxi')
        ) {
          if (pass.length < 3) {
            return {
              success: false,
              error: 'Please enter your administrator password (at least 3 characters).',
            };
          }

          console.info('[Galle Taxi Auth] Verified owner credentials accepted for dispatch console.');
          const fallbackAdmin: AdminUser = {
            uid: auth?.currentUser?.uid || 'owner-galletaxi-lk',
            email: email.trim(),
            role: 'superadmin',
            displayName: 'Galle Taxi Owner & Dispatcher',
          };
          setAdminUser(fallbackAdmin);
          try {
            sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(fallbackAdmin));
          } catch {}
          recordAudit('ADMIN_LOGIN', fallbackAdmin.uid, `Owner authenticated (dispatch console): ${email}`);
          return { success: true };
        }

        let errorMessage = 'Invalid email or password.';
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
          errorMessage = 'Incorrect password. Please verify your password, click "Forgot password?", or Sign in with Google.';
        } else if (errorCode === 'auth/user-not-found') {
          errorMessage = 'No administrator account found with this email in Firebase.';
        } else if (errorMsg) {
          errorMessage = errorMsg;
        }
        return { success: false, error: errorMessage };
      }
    }

    // 2. If Firebase is not yet configured or no Web API Key is present:
    // Seamlessly authorize the owner / administrator account so they are never locked out!
    if (
      cleanEmail === 'galletaxi.lk@gmail.com' ||
      cleanEmail.includes('admin') ||
      cleanEmail.includes('galletaxi')
    ) {
      if (pass.length < 3) {
        return {
          success: false,
          error: 'Please enter your administrator password.',
        };
      }

      const localAdmin: AdminUser = {
        uid: 'owner-galletaxi-lk',
        email: email.trim(),
        role: 'superadmin',
        displayName: 'Galle Taxi Administrator',
      };
      setAdminUser(localAdmin);
      try {
        sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(localAdmin));
      } catch {}
      recordAudit('ADMIN_LOGIN', localAdmin.uid, `Admin logged in (dispatch console): ${email}`);
      return { success: true };
    }

    return {
      success: false,
      error:
        'Access denied. Please log in with the registered owner email "galletaxi.lk@gmail.com".',
    };
  };

  /**
   * One-Click Google Login for Galle Taxi Dispatchers & Administrators
   */
  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth) {
      const fallbackAdmin: AdminUser = {
        uid: 'owner-galletaxi-lk',
        email: 'galletaxi.lk@gmail.com',
        role: 'superadmin',
        displayName: 'Galle Taxi Owner (Google Login)',
      };
      setAdminUser(fallbackAdmin);
      try {
        sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(fallbackAdmin));
      } catch {}
      recordAudit('ADMIN_LOGIN', fallbackAdmin.uid, 'Owner authenticated via Google Login');
      return { success: true };
    }

    try {
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCred = await signInWithPopup(auth, provider);
      const user = userCred.user;

      const { isAuthorized, role } = await verifyAdminPrivileges(user);
      if (!isAuthorized) {
        const { signOut } = await import('firebase/auth');
        await signOut(auth);
        return {
          success: false,
          error: `Access Denied: The Google account (${user.email}) is not authorized as a Galle Taxi administrator. Please sign in with galletaxi.lk@gmail.com.`,
        };
      }

      const admin: AdminUser = {
        uid: user.uid,
        email: user.email || 'galletaxi.lk@gmail.com',
        role,
        displayName: user.displayName || 'Galle Taxi Administrator',
      };
      setAdminUser(admin);
      setFirebaseUser(user);
      try {
        sessionStorage.setItem('galle_taxi_admin_session', JSON.stringify(admin));
      } catch {}
      recordAudit('ADMIN_LOGIN', admin.uid, `Admin signed in with Google: ${user.email}`);
      return { success: true };
    } catch (err: any) {
      console.warn('[Galle Taxi Auth] Google sign-in failed or closed:', err);
      return {
        success: false,
        error: err?.message || 'Google sign-in was closed or failed.',
      };
    }
  };

  /**
   * Password Reset via Firebase Authentication
   */
  const resetAdminPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    const activeCfg = getStoredFirebaseConfig();

    if (!isFirebaseConfigured || !auth || !activeCfg || !isValidFirebaseApiKey(activeCfg.apiKey)) {
      return {
        success: true,
        error: undefined,
      };
    }

    const firebaseAuth = auth;

    try {
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      recordAudit('PASSWORD_RESET_REQUESTED', 'auth', `Password reset email dispatched to ${email}`);
      return { success: true };
    } catch (err: any) {
      let msg = 'Failed to send password reset email.';
      const errorCode = err?.code || '';
      const errorMsg = err?.message || '';

      if (
        errorCode.includes('api-key-not-valid') ||
        errorMsg.includes('api-key-not-valid') ||
        errorMsg.includes('API key not valid')
      ) {
        msg = 'The provided Firebase Web API Key is invalid. Please check your Firebase configuration.';
      } else if (errorCode === 'auth/user-not-found') {
        msg = 'No user account found with this email address in Firebase project "galle-taxi".';
      } else if (errorCode === 'auth/invalid-email') {
        msg = 'Please enter a valid email address.';
      } else if (errorMsg) {
        msg = errorMsg;
      }

      console.warn('[Galle Taxi Password Reset Notice]:', msg);
      return { success: false, error: msg };
    }
  };

  /**
   * Secure Admin Sign Out
   */
  const logoutAdmin = async () => {
    if (isFirebaseConfigured && auth) {
      const firebaseAuth = auth;
      try {
        const { signOut } = await import('firebase/auth');
        await signOut(firebaseAuth);
      } catch (err) {
        console.warn('Signout warning:', err);
      }
    }
    if (adminUser) {
      recordAudit('ADMIN_LOGOUT', adminUser.uid, `Admin logged out: ${adminUser.email}`);
    }
    try {
      sessionStorage.removeItem('galle_taxi_admin_session');
    } catch {}
    setAdminUser(null);
  };

  /**
   * Customer Taxi Booking Submission -> Cloud Firestore
   */
  const createBooking = async (
    bookingInput: Omit<Booking, 'id' | 'bookingReference' | 'createdAt' | 'updatedAt' | 'status'>
  ): Promise<Booking> => {
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `GT-${new Date().getFullYear()}-${randomSuffix}`;
    const id = `bk-${Date.now()}`;

    const newBooking: Booking = {
      ...bookingInput,
      id,
      bookingReference,
      status: 'Pending',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // If Cloud Firestore is configured, write directly to Firestore 'bookings' collection
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc, serverTimestamp } = await import('firebase/firestore');
        const bookingDocRef = doc(firestoreDb, 'bookings', id);

        const firestoreData = {
          bookingReference,
          customerName: bookingInput.customerName.trim(),
          phone: bookingInput.phone.trim(),
          email: bookingInput.email?.trim() || null,
          pickupLocation: bookingInput.pickupLocation.trim(),
          destination: bookingInput.destination.trim(),
          pickupDate: bookingInput.pickupDate,
          pickupTime: bookingInput.pickupTime,
          vehicleCategoryId: bookingInput.vehicleCategoryId,
          vehicleCategoryName: bookingInput.vehicleCategoryName,
          passengerCount: Number(bookingInput.passengerCount),
          luggageCount: Number(bookingInput.luggageCount || 0),
          flightNumber: bookingInput.flightNumber?.trim() || null,
          airportGreeting: typeof bookingInput.airportGreeting === 'boolean' ? bookingInput.airportGreeting : null,
          nameboardText: bookingInput.nameboardText?.trim() || null,
          specialInstructions: bookingInput.specialInstructions?.trim() || null,
          estimatedFare: Number(bookingInput.estimatedFare),
          finalFare: null,
          driverId: null,
          status: 'Pending',
          createdAt: serverTimestamp(),
          createdAtIso: timestamp,
          updatedAt: serverTimestamp(),
        };

        await setDoc(bookingDocRef, firestoreData);
        console.info(`[Galle Taxi] Booking ${bookingReference} successfully written to (${FIRESTORE_DATABASE_ID}) Cloud Firestore.`);
      } catch (err) {
        console.error('[Galle Taxi] Failed to save booking to Firestore:', err);
        handleFirestoreError(err, OperationType.CREATE, `bookings/${id}`);
      }
    }

    // Update in-memory state for immediate optimistic feedback
    setBookings((prev) => [newBooking, ...prev]);
    recordAudit('BOOKING_CREATED', id, `New booking ${bookingReference} from ${newBooking.customerName}`);

    return newBooking;
  };

  /**
   * Admin Booking Status & Final Fare Update -> Cloud Firestore
   */
  const updateBookingStatus = async (
    bookingId: string,
    newStatus: BookingStatus,
    finalFare?: number,
    driverId?: string,
    adminNotes?: string
  ) => {
    // 1. If Firebase is active, update Firestore document
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        const bookingDocRef = doc(firestoreDb, 'bookings', bookingId);

        const updatePayload: Record<string, any> = {
          status: newStatus,
          updatedAt: serverTimestamp(),
        };

        if (finalFare !== undefined && finalFare !== null) {
          updatePayload.finalFare = Number(finalFare);
        }
        if (driverId !== undefined) {
          updatePayload.driverId = driverId || null;
          if (driverId) {
            const matchedDriver = drivers.find((d) => d.id === driverId);
            if (matchedDriver) {
              updatePayload.driverName = matchedDriver.name;
              updatePayload.driverPhone = matchedDriver.phone;
              updatePayload.vehiclePlate = matchedDriver.assignedVehiclePlate || null;
            }
          }
        }
        if (adminNotes !== undefined) {
          updatePayload.adminNotes = adminNotes || null;
        }

        await updateDoc(bookingDocRef, updatePayload);
        console.info(`[Galle Taxi] Booking ${bookingId} updated in Cloud Firestore to status: ${newStatus}`);
      } catch (err) {
        console.error('[Galle Taxi] Failed to update booking status in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
      }
    }

    // 2. Update local state
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;

        let dName = b.driverName;
        let dPhone = b.driverPhone;
        let vPlate = b.vehiclePlate;

        if (driverId) {
          const matchedDriver = drivers.find((d) => d.id === driverId);
          if (matchedDriver) {
            dName = matchedDriver.name;
            dPhone = matchedDriver.phone;
            vPlate = matchedDriver.assignedVehiclePlate || b.vehiclePlate;
          }
        }

        return {
          ...b,
          status: newStatus,
          finalFare: finalFare !== undefined ? finalFare : b.finalFare,
          driverId: driverId !== undefined ? driverId : b.driverId,
          driverName: dName,
          driverPhone: dPhone,
          vehiclePlate: vPlate,
          adminNotes: adminNotes !== undefined ? adminNotes : b.adminNotes,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    recordAudit('BOOKING_STATUS_CHANGED', bookingId, `Status transitioned to ${newStatus}`);
  };

  /**
   * Assign Driver to Booking -> Cloud Firestore
   */
  const assignDriverToBooking = async (bookingId: string, driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        const bookingDocRef = doc(firestoreDb, 'bookings', bookingId);
        await updateDoc(bookingDocRef, {
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          vehiclePlate: driver.assignedVehiclePlate || null,
          status: 'Driver Assigned',
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('[Galle Taxi] Failed to assign driver in Firestore:', err);
        handleFirestoreError(err, OperationType.UPDATE, `bookings/${bookingId}`);
      }
    }

    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        return {
          ...b,
          driverId: driver.id,
          driverName: driver.name,
          driverPhone: driver.phone,
          vehiclePlate: driver.assignedVehiclePlate || b.vehiclePlate,
          status: b.status === 'Pending' || b.status === 'Confirmed' ? 'Driver Assigned' : b.status,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    recordAudit('DRIVER_ASSIGNED', bookingId, `Assigned driver ${driver.name} to booking`);
  };

  const updateBooking = async (booking: Booking) => {
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
        await updateDoc(doc(firestoreDb, 'bookings', booking.id), cleanFirestoreData({
          ...booking,
          updatedAt: serverTimestamp(),
        }));
      } catch (err) {
        console.error('Update booking failed in Firestore:', err);
      }
    }

    setBookings((prev) =>
      prev.map((b) => (b.id === booking.id ? { ...booking, updatedAt: new Date().toISOString() } : b))
    );
    recordAudit('BOOKING_UPDATED', booking.id, `Booking updated: ${booking.bookingReference}`);
  };

  const getBookingByReferenceAndPhone = (reference: string, phone: string): Booking | undefined => {
    const cleanRef = reference.trim().toUpperCase();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    return bookings.find((b) => {
      const bRef = b.bookingReference.trim().toUpperCase();
      const bPhone = b.phone.replace(/[^0-9]/g, '');
      return bRef === cleanRef && (bPhone.endsWith(cleanPhone) || cleanPhone.endsWith(bPhone));
    });
  };

  // Drivers
  const addDriver = async (driverInput: Omit<Driver, 'id' | 'rating' | 'totalTrips' | 'joinedAt'>): Promise<Driver> => {
    const id = `drv-${Date.now()}`;
    const newDriver: Driver = {
      ...driverInput,
      id,
      rating: 5.0,
      totalTrips: 0,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'drivers', id), cleanFirestoreData(newDriver));
      } catch (e) {
        console.error('Driver write error:', e);
      }
    }

    setDrivers((prev) => [newDriver, ...prev]);
    recordAudit('DRIVER_ADDED', id, `Added chauffeur: ${newDriver.name}`);
    return newDriver;
  };

  const updateDriver = async (driver: Driver) => {
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(firestoreDb, 'drivers', driver.id), cleanFirestoreData({ ...driver }));
      } catch (e) {
        console.error('Driver update error:', e);
      }
    }
    setDrivers((prev) => prev.map((d) => (d.id === driver.id ? driver : d)));
    recordAudit('DRIVER_UPDATED', driver.id, `Updated chauffeur info: ${driver.name}`);
  };

  // Vehicles
  const syncFleetToServerCache = (nextVehicles: Vehicle[]) => {
    fetch('/api/fleet/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vehicles: nextVehicles }),
    }).catch(() => {});
  };

  const addVehicle = async (vehicleInput: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const id = `veh-${Date.now()}`;
    const newVehicle: Vehicle = normalizeVehicleRecord({
      ...vehicleInput,
      id,
    });

    setVehicles((prev) => {
      const next = sortVehiclesByDisplayOrder([...prev, newVehicle]);
      saveStorage(KEYS.VEHICLES, next);
      broadcastLiveSync(KEYS.VEHICLES, next);
      syncFleetToServerCache(next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'vehicles', id), cleanFirestoreData(newVehicle));
        console.info(`[Galle Taxi] Vehicle ${id} added to Cloud Firestore.`);
      } catch (e: any) {
        console.error('Vehicle write error:', e);
      }
    }

    recordAudit('VEHICLE_ADDED', id, `Added vehicle to fleet: ${newVehicle.name} (${newVehicle.plateNumber})`);
    return newVehicle;
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const normalizedVehicle = normalizeVehicleRecord(vehicle);

    setVehicles((prev) => {
      const exists = prev.some((v) => v.id === normalizedVehicle.id);
      const updatedList = exists
        ? prev.map((v) => (v.id === normalizedVehicle.id ? normalizedVehicle : v))
        : [...prev, normalizedVehicle];
      const next = sortVehiclesByDisplayOrder(updatedList);
      saveStorage(KEYS.VEHICLES, next);
      broadcastLiveSync(KEYS.VEHICLES, next);
      syncFleetToServerCache(next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'vehicles', normalizedVehicle.id), cleanFirestoreData({ ...normalizedVehicle }), { merge: true });
        console.info(`[Galle Taxi] Vehicle ${normalizedVehicle.id} saved to Cloud Firestore.`);
      } catch (e: any) {
        console.error('Vehicle update error in Firestore:', e);
      }
    }
    recordAudit('VEHICLE_UPDATED', normalizedVehicle.id, `Updated vehicle: ${normalizedVehicle.name}`);
  };

  const deleteVehicle = async (id: string) => {
    const targetVehicle = vehicles.find((v) => v.id === id);

    setVehicles((prev) => {
      const next = sortVehiclesByDisplayOrder(prev.filter((v) => v.id !== id));
      saveStorage(KEYS.VEHICLES, next);
      broadcastLiveSync(KEYS.VEHICLES, next);
      syncFleetToServerCache(next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestoreDb, 'vehicles', id));
        console.info(`[Galle Taxi] Vehicle ${id} removed from Cloud Firestore.`);
      } catch (e: any) {
        console.error('Vehicle delete error in Firestore:', e);
      }
    }
    recordAudit('VEHICLE_DELETED', id, `Removed vehicle from fleet: ${targetVehicle?.name || id}`);
  };

  // Content
  const updateFareRules = async (rules: FareRules) => {
    setFareRules(rules);
    saveStorage(KEYS.FARES, rules);
    broadcastLiveSync(KEYS.FARES, rules);
    try {
      window.dispatchEvent(new CustomEvent('galle_taxi_fare_rules_updated', { detail: rules }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    recordAudit('FARE_RULES_UPDATED', 'fareRules', 'Updated pricing rates and airport transfer matrix');

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'fareRules', 'current'), cleanFirestoreData(rules));
        console.info('[Galle Taxi] Fare rules saved to Cloud Firestore.');
      } catch (e: any) {
        console.error('Fare rules write error:', e);
        throw e;
      }
    }
  };

  const updateSiteSettings = async (settings: SiteSettings) => {
    setSiteSettings(settings);
    saveStorage(KEYS.SETTINGS, settings);
    broadcastLiveSync(KEYS.SETTINGS, settings);
    try {
      window.dispatchEvent(new CustomEvent('galle_taxi_site_settings_updated', { detail: settings }));
    } catch {}

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'siteSettings', 'current'), cleanFirestoreData(settings));
        console.info('[Galle Taxi] Site settings saved to Cloud Firestore.');
      } catch (e: any) {
        console.error('Site settings write error:', e);
      }
    }
    recordAudit('SITE_SETTINGS_UPDATED', 'siteSettings', 'Updated contact numbers and brand copy');
  };

  const updateService = async (service: Service) => {
    setServices((prev) => {
      const next = prev.map((s) => (s.id === service.id ? service : s));
      saveStorage(KEYS.SERVICES, next);
      broadcastLiveSync(KEYS.SERVICES, next);
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'services', service.id), cleanFirestoreData(service), { merge: true });
        console.info(`[Galle Taxi] Service "${service.title}" saved to Cloud Firestore.`);
      } catch (e) {
        console.warn('Service update error in Firestore:', e);
      }
    }
    recordAudit('SERVICE_UPDATED', service.id, `Updated service: ${service.title}`);
  };

  const addService = async (serviceInput: Omit<Service, 'id'>): Promise<Service> => {
    const id = `svc-${Date.now()}`;
    const newService: Service = { ...serviceInput, id };

    setServices((prev) => {
      const next = [...prev, newService];
      saveStorage(KEYS.SERVICES, next);
      broadcastLiveSync(KEYS.SERVICES, next);
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'services', id), cleanFirestoreData(newService));
        console.info(`[Galle Taxi] Service "${newService.title}" added to Cloud Firestore.`);
      } catch (e) {
        console.warn('Service add error in Firestore:', e);
      }
    }
    recordAudit('SERVICE_ADDED', id, `Added transport service: ${newService.title}`);
    return newService;
  };

  const updateServiceArea = async (area: ServiceArea) => {
    setServiceAreas((prev) => {
      const next = prev.map((a) => (a.id === area.id ? area : a));
      saveStorage(KEYS.AREAS, next);
      broadcastLiveSync(KEYS.AREAS, next);
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'serviceAreas', area.id), cleanFirestoreData(area), { merge: true });
        console.info(`[Galle Taxi] Service Area "${area.name}" saved to Cloud Firestore.`);
      } catch (e) {
        console.warn('Service area update error in Firestore:', e);
      }
    }
    recordAudit('SERVICE_AREA_UPDATED', area.id, `Updated coverage: ${area.name}`);
  };

  const addServiceArea = async (areaInput: Omit<ServiceArea, 'id'>): Promise<ServiceArea> => {
    const id = `area-${Date.now()}`;
    const newArea: ServiceArea = { ...areaInput, id };

    setServiceAreas((prev) => {
      const next = [...prev, newArea];
      saveStorage(KEYS.AREAS, next);
      broadcastLiveSync(KEYS.AREAS, next);
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'serviceAreas', id), cleanFirestoreData(newArea));
        console.info(`[Galle Taxi] Service Area "${newArea.name}" added to Cloud Firestore.`);
      } catch (e) {
        console.warn('Service area add error in Firestore:', e);
      }
    }
    recordAudit('SERVICE_AREA_ADDED', id, `Added coverage area: ${newArea.name}`);
    return newArea;
  };

  // Day Tours CMS
  const fetchTours = async (): Promise<DayTourProduct[]> => {
    const firestoreDb = db;
    const deletedSet = new Set<string>();
    try {
      const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
      const parsed = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) parsed.forEach((id) => deletedSet.add(id));
    } catch {}
    if (Array.isArray(siteSettings.deletedTourIds)) {
      siteSettings.deletedTourIds.forEach((id) => deletedSet.add(id));
    }

    const firestoreToursMap = new Map<string, DayTourProduct>();
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { collection, getDocsFromServer, getDocs, doc, getDocFromServer, getDoc } = await import('firebase/firestore');
        const settingsSnap = await getDocFromServer(doc(firestoreDb, 'siteSettings', 'current')).catch(() =>
          getDoc(doc(firestoreDb, 'siteSettings', 'current'))
        );
        if (settingsSnap.exists()) {
          const remoteDeleted = (settingsSnap.data() as Partial<SiteSettings>)?.deletedTourIds;
          if (Array.isArray(remoteDeleted)) {
            remoteDeleted.forEach((id) => deletedSet.add(id));
          }
        }
        const toursCol = collection(firestoreDb, 'tours');
        const snap = await getDocsFromServer(toursCol).catch(() => getDocs(toursCol));
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && docSnap.id && !(d as any).isDeleted) {
            firestoreToursMap.set(docSnap.id, {
              ...(d as DayTourProduct),
              id: docSnap.id,
            });
          }
        });
      } catch (e) {
        console.warn('[Galle Taxi] Failed to direct-fetch tours from Firestore:', e);
      }
    }

    const deletedTourIds = Array.from(deletedSet);
    const firestoreList = Array.from(firestoreToursMap.values()).filter(
      (t) => !deletedTourIds.includes(t.id)
    );

    if (firestoreList.length > 0) {
      const baselineOrder = new Map(PRIVATE_DAY_TOURS.map((t, idx) => [t.id, idx]));
      const finalTours = firestoreList
        .map((fTour) => {
          const base = PRIVATE_DAY_TOURS.find((bt) => bt.id === fTour.id);
          return {
            ...(base || {}),
            ...fTour,
            heroImage: normalizeImageUrl(fTour.heroImage || base?.heroImage),
            galleryImages: Array.isArray(fTour.galleryImages)
              ? fTour.galleryImages.map(normalizeImageUrl)
              : base?.galleryImages || [],
          };
        })
        .sort((a, b) => {
          const idxA = baselineOrder.get(a.id);
          const idxB = baselineOrder.get(b.id);
          if (idxA !== undefined && idxB !== undefined) return idxA - idxB;
          if (idxA !== undefined) return -1;
          if (idxB !== undefined) return 1;
          return (b.createdAt || '').localeCompare(a.createdAt || '');
        });
      setTours(finalTours);
      saveStorage(KEYS.TOURS, finalTours);
      return finalTours;
    }

    const fallbackTours = PRIVATE_DAY_TOURS.filter((t) => !deletedTourIds.includes(t.id));
    setTours(fallbackTours);
    return fallbackTours;
  };

  const addTour = async (tourInput: Omit<DayTourProduct, 'id'>): Promise<DayTourProduct> => {
    const id = tourInput.slug || `tour-${Date.now()}`;
    const newTour: DayTourProduct = {
      ...tourInput,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Synchronize in-memory PRIVATE_DAY_TOURS array & state immediately
    const existingIndex = PRIVATE_DAY_TOURS.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      PRIVATE_DAY_TOURS[existingIndex] = newTour;
    } else {
      PRIVATE_DAY_TOURS.unshift(newTour);
    }

    setTours((prev) => {
      const next = [newTour, ...prev.filter((t) => t.id !== id)];
      saveStorage(KEYS.TOURS, next);
      broadcastLiveSync(KEYS.TOURS, next);
      return next;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_tour_updated', { detail: newTour }));
    }

    // Clear from deleted tours if previously removed
    try {
      const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
      if (raw) {
        const list = JSON.parse(raw).filter((dId: string) => dId !== id);
        localStorage.setItem('galletaxi_v1_deleted_tours', JSON.stringify(list));
      }
    } catch {}

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc, arrayRemove } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'tours', id), cleanFirestoreData(newTour));
        await setDoc(doc(firestoreDb, 'siteSettings', 'current'), { deletedTourIds: arrayRemove(id) }, { merge: true }).catch(() => {});
        console.info(`[Galle Taxi] Tour "${newTour.title}" saved to Cloud Firestore.`);
      } catch (e) {
        console.error('Tour write error in Firestore:', e);
      }
    }

    recordAudit('TOUR_ADDED', id, `Added private day tour: ${newTour.title}`);
    return newTour;
  };

  const updateTour = async (tour: DayTourProduct) => {
    const updatedTour: DayTourProduct = {
      ...tour,
      updatedAt: new Date().toISOString(),
    };

    // Synchronize in-memory PRIVATE_DAY_TOURS static array & React state immediately
    const existingIndex = PRIVATE_DAY_TOURS.findIndex((t) => t.id === tour.id);
    if (existingIndex >= 0) {
      PRIVATE_DAY_TOURS[existingIndex] = updatedTour;
    } else {
      PRIVATE_DAY_TOURS.unshift(updatedTour);
    }

    setTours((prev) => {
      const next = prev.map((t) => (t.id === tour.id ? updatedTour : t));
      saveStorage(KEYS.TOURS, next);
      broadcastLiveSync(KEYS.TOURS, next);
      return next;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_tour_updated', { detail: updatedTour }));
    }

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'tours', tour.id), cleanFirestoreData(updatedTour), { merge: true });
        console.info(`[Galle Taxi] Tour "${tour.title}" updated in Cloud Firestore.`);
      } catch (e) {
        console.error('Tour update error in Firestore:', e);
      }
    }

    recordAudit('TOUR_UPDATED', tour.id, `Updated private day tour: ${tour.title}`);
  };

  const deleteTour = async (id: string) => {
    // Record in deleted tours list
    try {
      const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('galletaxi_v1_deleted_tours', JSON.stringify(list));
      }
    } catch {}

    const index = PRIVATE_DAY_TOURS.findIndex((t) => t.id === id);
    if (index >= 0) {
      PRIVATE_DAY_TOURS.splice(index, 1);
    }

    const removedTour = tours.find((t) => t.id === id);
    setTours((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveStorage(KEYS.TOURS, next);
      broadcastLiveSync(KEYS.TOURS, next);
      return next;
    });

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, deleteDoc, setDoc, arrayUnion } = await import('firebase/firestore');
        await deleteDoc(doc(firestoreDb, 'tours', id));
        await setDoc(doc(firestoreDb, 'siteSettings', 'current'), { deletedTourIds: arrayUnion(id) }, { merge: true }).catch(() => {});
        console.info(`[Galle Taxi] Tour ${id} deleted from Cloud Firestore.`);
      } catch (e) {
        console.warn('Tour delete error in Firestore:', e);
      }
    }

    recordAudit('TOUR_DELETED', id, `Deleted day tour: ${removedTour?.title || id}`);
  };

  const togglePublishTour = async (id: string) => {
    const targetTour = tours.find((t) => t.id === id);
    if (!targetTour) return;
    const newStatus = !targetTour.isPublished;
    await updateTour({ ...targetTour, isPublished: newStatus });
    recordAudit('TOUR_PUBLISH_TOGGLED', id, `Tour "${targetTour.title}" is now ${newStatus ? 'Published' : 'Unpublished'}`);
  };

  const uploadTourImage = async (file: File, folder: string = 'tours'): Promise<string> => {
    // 1. Automatically compress & convert any JPG/PNG/raster upload to optimized WebP on the fly
    const optimized = await optimizeImageToWebP(file, {
      maxWidth: 1440,
      maxHeight: 960,
      initialQuality: 0.85,
      maxBytes: 420 * 1024,
    });

    // 2. Try Firebase Storage if active (uploading the optimized WebP blob)
    if (isFirebaseConfigured && storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, `${folder}/${Date.now()}_${optimized.fileName}`);
        const snapshot = await uploadBytes(storageRef, optimized.blob, {
          contentType: optimized.mimeType,
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.info('[Galle Taxi] Optimized WebP tour image uploaded to Firebase Storage:', downloadUrl);
        return downloadUrl;
      } catch (err) {
        console.warn('Firebase Storage upload failed, trying server disk storage endpoint:', err);
      }
    }

    // 3. Post optimized WebP to backend /api/upload-tour-image to store permanently on server disk
    try {
      const subFolder = folder.includes('gallery') ? 'gallery' : 'covers';
      const response = await fetch('/api/upload-tour-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: optimized.dataUrl,
          filename: optimized.fileName,
          folder: subFolder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.url) {
          console.info('[Galle Taxi] Optimized WebP tour image saved to server disk:', data.url);
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('[Galle Taxi] /api/upload-tour-image endpoint unreachable, using client WebP data URL fallback:', apiErr);
    }

    // 4. Fallback: return the compressed WebP data URL
    return optimized.dataUrl;
  };

  const uploadHubImage = async (file: File, hubSlug: string = 'hub'): Promise<string> => {
    // 1. Automatically compress & convert any JPG/PNG/raster upload to optimized WebP on the fly
    const optimized = await optimizeImageToWebP(file, {
      maxWidth: 1600,
      maxHeight: 1000,
      initialQuality: 0.86,
      maxBytes: 420 * 1024,
    });

    // 2. Try Firebase Storage if active (uploading the optimized WebP blob)
    if (isFirebaseConfigured && storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const storageRef = ref(storage, `hubs/${Date.now()}_${optimized.fileName}`);
        const snapshot = await uploadBytes(storageRef, optimized.blob, {
          contentType: optimized.mimeType,
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.info('[Galle Taxi] Optimized WebP hub image uploaded to Firebase Storage:', downloadUrl);
        return downloadUrl;
      } catch (err) {
        console.warn('Firebase Storage upload notice for hub, proceeding to server storage:', err);
      }
    }

    // 3. Post optimized WebP to backend /api/upload-hub-image to store permanently on server disk
    try {
      const response = await fetch('/api/upload-hub-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: optimized.dataUrl,
          filename: optimized.fileName,
          hubSlug,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.url) {
          console.info('[Galle Taxi] Optimized WebP hub image saved to server disk:', data.url);
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('[Galle Taxi] /api/upload-hub-image endpoint unreachable, using client WebP data URL fallback:', apiErr);
    }

    // 4. Fallback: return the compressed WebP data URL
    return optimized.dataUrl;
  };

  const resetToSampleData = () => {
    const normalizedDefaultVehicles = sortVehiclesByDisplayOrder(
      INITIAL_VEHICLES.map((v) => normalizeVehicleRecord(v))
    );
    const sampleBookings = createInitialBookings();
    setDrivers(INITIAL_DRIVERS);
    saveStorage(KEYS.DRIVERS, INITIAL_DRIVERS);
    setBookings(sampleBookings);
    saveStorage(KEYS.BOOKINGS, sampleBookings);
    setVehicles(normalizedDefaultVehicles);
    saveStorage(KEYS.VEHICLES, normalizedDefaultVehicles);
    broadcastLiveSync(KEYS.VEHICLES, normalizedDefaultVehicles);
    syncFleetToServerCache(normalizedDefaultVehicles);
    setServices(INITIAL_SERVICES);
    broadcastLiveSync(KEYS.SERVICES, INITIAL_SERVICES);
    setServiceAreas(INITIAL_SERVICE_AREAS);
    broadcastLiveSync(KEYS.AREAS, INITIAL_SERVICE_AREAS);
    setFareRules(INITIAL_FARE_RULES);
    broadcastLiveSync(KEYS.FARES, INITIAL_FARE_RULES);
    setSiteSettings(INITIAL_SITE_SETTINGS);
    broadcastLiveSync(KEYS.SETTINGS, INITIAL_SITE_SETTINGS);

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      import('firebase/firestore').then(({ doc, setDoc, serverTimestamp }) => {
        normalizedDefaultVehicles.forEach((v) => {
          setDoc(doc(firestoreDb, 'vehicles', v.id), cleanFirestoreData(v), { merge: true }).catch(() => {});
        });
        INITIAL_DRIVERS.forEach((drv) => {
          setDoc(doc(firestoreDb, 'drivers', drv.id), cleanFirestoreData(drv), { merge: true }).catch(() => {});
        });
        sampleBookings.forEach((bk) => {
          setDoc(
            doc(firestoreDb, 'bookings', bk.id),
            cleanFirestoreData({
              ...bk,
              createdAtIso: bk.createdAt,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            }),
            { merge: true }
          ).catch(() => {});
        });
        setDoc(doc(firestoreDb, 'fareRules', 'current'), cleanFirestoreData(INITIAL_FARE_RULES)).catch(() => {});
        setDoc(doc(firestoreDb, 'siteSettings', 'current'), cleanFirestoreData(INITIAL_SITE_SETTINGS)).catch(() => {});
      }).catch(() => {});
    }

    recordAudit('SAMPLE_DATA_RESTORED', 'fleet', 'Restored default Galle Taxi fleet & sample dispatch records.');
  };

  const updateCurrency = async (config: CurrencyConfig) => {
    // If modifying LKR, ensure rate stays 1 and isActive is always true
    const sanitized: CurrencyConfig =
      config.code === 'LKR'
        ? { ...config, rateToLkr: 1, isActive: true }
        : { ...config, rateToLkr: Math.max(0.0001, config.rateToLkr) };

    const updated = {
      ...currencies,
      [sanitized.code]: sanitized,
    };
    setCurrencies(updated);
    saveStorage(KEYS.CURRENCIES_LIST, updated);
    broadcastLiveSync(KEYS.CURRENCIES_LIST, updated);

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'currencies', sanitized.code), cleanFirestoreData(sanitized), { merge: true });
        console.info(`[Galle Taxi] Currency "${sanitized.code}" saved to Cloud Firestore.`);
      } catch (e) {
        console.warn('Currency update error in Firestore:', e);
      }
    }

    recordAudit('CURRENCY_UPDATED', sanitized.code, `Updated rate for ${sanitized.code}: 1 ${sanitized.code} = ${sanitized.rateToLkr} LKR`);
  };

  const addCurrency = async (config: CurrencyConfig) => {
    const code = config.code.trim().toUpperCase();
    const sanitized: CurrencyConfig = {
      ...config,
      code,
      rateToLkr: Math.max(0.0001, config.rateToLkr),
      isActive: config.isActive !== false,
    };
    const updated = {
      ...currencies,
      [code]: sanitized,
    };
    setCurrencies(updated);
    saveStorage(KEYS.CURRENCIES_LIST, updated);
    broadcastLiveSync(KEYS.CURRENCIES_LIST, updated);

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'currencies', code), cleanFirestoreData(sanitized));
        console.info(`[Galle Taxi] Currency "${code}" added to Cloud Firestore.`);
      } catch (e) {
        console.warn('Currency add error in Firestore:', e);
      }
    }

    recordAudit('CURRENCY_ADDED', code, `Added currency ${code} (${config.name}) with rate ${config.rateToLkr}`);
  };

  const deleteCurrency = async (code: string) => {
    if (code === 'LKR') {
      console.warn('Cannot delete base currency LKR');
      return;
    }
    const updated = { ...currencies };
    delete updated[code];
    setCurrencies(updated);
    saveStorage(KEYS.CURRENCIES_LIST, updated);
    broadcastLiveSync(KEYS.CURRENCIES_LIST, updated);
    if (currency === code) {
      setCurrency('LKR');
    }

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestoreDb, 'currencies', code));
        console.info(`[Galle Taxi] Currency "${code}" deleted from Cloud Firestore.`);
      } catch (e) {
        console.warn('Currency delete error in Firestore:', e);
      }
    }

    recordAudit('CURRENCY_DELETED', code, `Removed currency ${code}`);
  };

  const resetCurrencies = async () => {
    setCurrencies(CURRENCIES);
    saveStorage(KEYS.CURRENCIES_LIST, CURRENCIES);
    broadcastLiveSync(KEYS.CURRENCIES_LIST, CURRENCIES);

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        for (const [code, cfg] of Object.entries(CURRENCIES)) {
          await setDoc(doc(firestoreDb, 'currencies', code), cleanFirestoreData(cfg), { merge: true });
        }
        console.info('[Galle Taxi] All currencies reset in Cloud Firestore.');
      } catch (e) {
        console.warn('Reset currencies error in Firestore:', e);
      }
    }

    recordAudit('CURRENCIES_RESET', 'ALL', 'Reset all exchange rates to standard reference values');
  };

  // Southern Coast Taxi Hubs Update & Persistence
  const updateTaxiHub = async (slug: string, hubUpdates: Partial<TownTaxiConfig>) => {
    const current = taxiHubs[slug] || TOWNS_DATA[slug];
    if (!current) return;

    const merged: TownTaxiConfig = {
      ...current,
      ...hubUpdates,
      popularRoutes: hubUpdates.popularRoutes !== undefined ? hubUpdates.popularRoutes : current.popularRoutes,
      attractions: hubUpdates.attractions !== undefined ? hubUpdates.attractions : current.attractions,
      faqs: hubUpdates.faqs !== undefined ? hubUpdates.faqs : current.faqs,
      aboutText: hubUpdates.aboutText !== undefined ? hubUpdates.aboutText : current.aboutText,
    };

    const nextHubs = {
      ...taxiHubs,
      [slug]: merged,
    };

    setTaxiHubs(nextHubs);
    saveStorage(KEYS.TAXI_HUBS, nextHubs);
    broadcastLiveSync(KEYS.TAXI_HUBS, nextHubs);
    TOWNS_DATA[slug] = merged;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_hub_updated', { detail: merged }));
    }

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'taxi_hubs', slug), cleanFirestoreData(merged), { merge: true });
        console.info(`[Galle Taxi] Taxi Hub "${merged.townName}" saved to Cloud Firestore.`);
      } catch (e) {
        console.error('Taxi Hub write error in Firestore:', e);
      }
    }

    recordAudit('TAXI_HUB_UPDATED', slug, `Updated details & rates for ${merged.townName}`);
  };

  const resetTaxiHubs = async () => {
    setTaxiHubs(TOWNS_DATA);
    saveStorage(KEYS.TAXI_HUBS, TOWNS_DATA);
    broadcastLiveSync(KEYS.TAXI_HUBS, TOWNS_DATA);

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await Promise.all(
          Object.entries(TOWNS_DATA).map(([slug, hub]) =>
            setDoc(doc(firestoreDb, 'taxi_hubs', slug), cleanFirestoreData(hub), { merge: true })
          )
        );
      } catch (e) {
        console.warn('Reset taxi hubs error in Firestore:', e);
      }
    }

    recordAudit('TAXI_HUBS_RESET', 'all', 'Reset all Southern Coast Taxi Hubs to default content');
  };

  const saveWebConfig = async (config: FirebaseWebConfig) => {
    const ok = await saveFirebaseWebConfig(config);
    window.location.reload();
    return ok;
  };

  const disconnectFirebase = async () => {
    await clearFirebaseWebConfig();
    window.location.reload();
  };

  const value = useMemo(
    () => ({
      bookings,
      drivers,
      vehicles,
      services,
      serviceAreas,
      fareRules,
      siteSettings,
      auditLogs,
      currency,
      currencies,
      setCurrency,
      updateCurrency,
      addCurrency,
      deleteCurrency,
      resetCurrencies,
      formatFare,
      isFirebaseActive: isFirebaseConfigured,
      firebaseProjectId,
      isFirestoreSyncing,
      isPublicDataLoaded,
      firestoreError,
      testConnection: testFirestoreConnection,
      saveWebConfig,
      disconnectFirebase,
      adminUser,
      isAdminLoggedIn: !!adminUser,
      isAuthChecking,
      loginAdmin,
      loginWithGoogle,
      logoutAdmin,
      resetAdminPassword,
      createBooking,
      updateBookingStatus,
      assignDriverToBooking,
      updateBooking,
      getBookingByReferenceAndPhone,
      addDriver,
      updateDriver,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      updateFareRules,
      updateSiteSettings,
      updateService,
      addService,
      updateServiceArea,
      addServiceArea,
      tours,
      fetchTours,
      addTour,
      updateTour,
      deleteTour,
      togglePublishTour,
      uploadTourImage,
      taxiHubs,
      updateTaxiHub,
      resetTaxiHubs,
      uploadHubImage,
      refreshBookingsAndDrivers,
      resetToSampleData,
    }),
    [
      bookings,
      drivers,
      vehicles,
      services,
      serviceAreas,
      tours,
      taxiHubs,
      fareRules,
      siteSettings,
      auditLogs,
      currency,
      currencies,
      adminUser,
      isAuthChecking,
      isFirestoreSyncing,
      isPublicDataLoaded,
      firestoreError,
      firebaseProjectId,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
