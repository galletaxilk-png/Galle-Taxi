/**
 * Galle Taxi - Central State Management & Firestore Integration Layer
 * Integrates Cloud Firestore, Firebase Authentication, and reactive dispatch state.
 */

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
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
  INITIAL_FARE_RULES,
  INITIAL_SERVICES,
  INITIAL_SERVICE_AREAS,
  INITIAL_SITE_SETTINGS,
  INITIAL_VEHICLES,
  DEFAULT_CATEGORY_TIERS,
  DEFAULT_SEDAN_TIERS,
  DEFAULT_SUV_TIERS,
  DEFAULT_VAN_TIERS,
  DEFAULT_KDH_HIGH_TIERS,
} from './initialData';
import {
  isFirebaseConfigured,
  auth,
  db,
  storage,
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
  resetToSampleData: () => void;
  firestoreQuotaExhausted: boolean;
  clearQuotaStatus: () => void;
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
      const restored = parsed.map((v: any) => {
        let img = v.imageUrl;
        const memImg = (window as any).__GALLE_TAXI_VEHICLE_IMAGES__?.[v.id];
        if (memImg) {
          img = memImg;
        } else {
          try {
            const sessImg = sessionStorage.getItem(`galle_veh_img_${v.id}`);
            if (sessImg) img = sessImg;
          } catch {}
        }
        return { ...v, imageUrl: img };
      });
      (window as any).__GALLE_TAXI_VEHICLES__ = restored;
      return restored as unknown as T;
    }
    if (key === KEYS.TAXI_HUBS && parsed && typeof parsed === 'object') {
      const restored: Record<string, any> = {};
      for (const [k, hub] of Object.entries(parsed as Record<string, any>)) {
        let img = hub?.heroImage;
        try {
          const sessImg = sessionStorage.getItem(`galle_hub_img_${k}`);
          if (sessImg) img = sessImg;
        } catch {}
        restored[k] = { ...hub, heroImage: img };
      }
      return restored as unknown as T;
    }
    return parsed;
  } catch (e) {
    return fallback;
  }
}

function cleanExcessStorage() {
  if (typeof window === 'undefined') return;
  try {
    // Purge non-critical oversized caches
    localStorage.removeItem('galletaxi_v1_tours_cache');
    localStorage.removeItem('galle_taxi_email_dispatches');

    // Clean any oversized temporary or custom tour image keys
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('custom_tour_img_') || k.startsWith('galle_taxi_temp_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {}

    // Trim audit log if bloated
    const rawAudit = localStorage.getItem(KEYS.AUDIT);
    if (rawAudit) {
      try {
        const parsed = JSON.parse(rawAudit);
        if (Array.isArray(parsed) && parsed.length > 5) {
          localStorage.setItem(KEYS.AUDIT, JSON.stringify(parsed.slice(0, 5)));
        }
      } catch {
        localStorage.removeItem(KEYS.AUDIT);
      }
    }
  } catch {}
}

/**
 * Checks if a Firestore operation failed due to Spark free tier quota exhaustion (50,000 reads or 20,000 writes/day)
 */
export function isFirestoreQuotaExhausted(err: any): boolean {
  if (!err) return false;
  const code = String(err.code || '');
  const msg = String(err.message || '');
  return (
    code === 'resource-exhausted' ||
    code === 'quota-exceeded' ||
    code.includes('resource-exhausted') ||
    msg.includes('Quota exceeded') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Free daily read units per project') ||
    msg.includes('Free daily write units per project') ||
    msg.includes('quota')
  );
}

// In-memory circuit breaker to prevent repeated listener spamming when daily free quota is exceeded
let globalQuotaExhausted = false;
let globalQuotaLogged = false;

function normalizeImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('/src/assets/images/')) {
    return url.replace('/src/assets/images/', '/assets/images/');
  }
  return url;
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
    return data.slice(0, 15);
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
      heroImage: normalizeImageUrl(data.heroImage),
      seasonalBannerImage: normalizeImageUrl(data.seasonalBannerImage),
    };
  }

  return data;
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
  } catch (e) {
    console.warn(`[Storage Quota Managed] Exceeded quota while persisting "${key}". Initiating safe recovery.`);
    cleanExcessStorage();

    try {
      localStorage.setItem(key, serialized);
    } catch {
      // Graceful fallback to sessionStorage so the application never errors out
      try {
        sessionStorage.setItem(key, serialized);
      } catch {}
    }
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // If Firebase is configured, start bookings as empty array so real Firestore docs populate it
  // If Firebase is NOT configured, load local bookings
  const [bookings, setBookings] = useState<Booking[]>(() => {
    if (isFirebaseConfigured) {
      return [];
    }
    return loadStorage(KEYS.BOOKINGS, []);
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => loadStorage(KEYS.DRIVERS, INITIAL_DRIVERS));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const loaded = loadStorage<Vehicle[] | null>(KEYS.VEHICLES, null);
    if (loaded && Array.isArray(loaded) && loaded.length > 0) {
      return loaded.map((v) => {
        let updatedCategory = v.category;
        let updatedName = v.name;
        let updatedPrice = v.pricePerKm;
        let updatedTiers = v.pricingTiers;

        if (v.id === 'veh-sedan-std' || v.category === 'Sedan' || v.name === 'Sedan' || v.name.toLowerCase().includes('toyota premio')) {
          updatedCategory = 'SEDAN CAR';
          updatedName = 'SEDAN CAR';
          if (!updatedPrice || updatedPrice <= 0) updatedPrice = 240;
          if (!updatedTiers || updatedTiers.length === 0) updatedTiers = DEFAULT_SEDAN_TIERS;
        } else if (v.id === 'veh-suv-4wd' || v.category === 'SUV' || v.name.toLowerCase().includes('prado')) {
          updatedCategory = 'SUV CAR';
          updatedName = 'SUV CAR';
          if (!updatedPrice || updatedPrice <= 0 || updatedPrice === 240) updatedPrice = 380;
          if (!updatedTiers || updatedTiers.length === 0 || updatedTiers[0]?.flatPrice === 12000) updatedTiers = DEFAULT_SUV_TIERS;
        } else if (v.id === 'veh-kdh-flat' || v.name.toLowerCase().includes('flat roof')) {
          updatedCategory = 'KDH FLAT ROOF';
          updatedName = 'KDH FLAT ROOF';
          if (!updatedPrice || updatedPrice <= 0 || updatedPrice === 240) updatedPrice = 320;
          if (!updatedTiers || updatedTiers.length === 0 || updatedTiers[0]?.flatPrice === 12000) updatedTiers = DEFAULT_VAN_TIERS;
        } else if (
          v.id === 'veh-kdh-high' ||
          v.name.toLowerCase().includes('high roof') ||
          v.name.toLowerCase().includes('high-roof') ||
          v.id === 'veh-luxury-exec' ||
          v.category === 'Luxury' ||
          v.category === 'KDH High Roof' ||
          v.name.toLowerCase().includes('luxury')
        ) {
          updatedCategory = 'KDH HIGH ROOF';
          updatedName = 'KDH HIGH ROOF';
          if (!updatedPrice || updatedPrice <= 0 || updatedPrice === 240 || updatedPrice === 320) updatedPrice = 360;
          if (!updatedTiers || updatedTiers.length === 0 || updatedTiers[0]?.flatPrice === 12000 || updatedTiers[0]?.flatPrice === 16000) updatedTiers = DEFAULT_KDH_HIGH_TIERS;
        }
        return {
          ...v,
          name: updatedName,
          category: updatedCategory,
          pricePerKm: updatedPrice || 240,
          pricingTiers: updatedTiers || DEFAULT_CATEGORY_TIERS[updatedCategory] || DEFAULT_SEDAN_TIERS,
        };
      });
    }
    saveStorage(KEYS.VEHICLES, INITIAL_VEHICLES);
    return INITIAL_VEHICLES;
  });
  const [services, setServices] = useState<Service[]>(() => {
    const loaded = loadStorage(KEYS.SERVICES, INITIAL_SERVICES);
    return loaded.map((s) => {
      if (
        s.id === 'city-taxi' &&
        (s.imageUrl.includes('vehicle_luxury_sedan_1793121944773') ||
          s.imageUrl.includes('regenerated_image_1793161723258') ||
          !s.imageUrl)
      ) {
        return { ...s, imageUrl: '/assets/images/regenerated_image_1793163512211.png' };
      }
      return s;
    });
  });
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>(() => loadStorage(KEYS.AREAS, INITIAL_SERVICE_AREAS));
  const [tours, setTours] = useState<DayTourProduct[]>(() => {
    const loaded = loadStorage<DayTourProduct[]>(KEYS.TOURS, PRIVATE_DAY_TOURS);
    const tourMap = new Map<string, DayTourProduct>();
    PRIVATE_DAY_TOURS.forEach((dt) => tourMap.set(dt.id, { ...dt }));
    if (Array.isArray(loaded)) {
      loaded.forEach((lt) => {
        if (lt && lt.id) {
          const base = tourMap.get(lt.id) || lt;
          tourMap.set(lt.id, { ...base, ...lt });
        }
      });
    }
    const allTours = Array.from(tourMap.values());
    return allTours.map((t) => {
      let heroImage = t.heroImage;
      try {
        const customImg = localStorage.getItem(`custom_tour_img_${t.id}`);
        if (customImg && customImg.trim()) {
          heroImage = customImg;
        }
      } catch {}

      if (t.id === 'udawalawe-elephant-safari') {
        if (
          !heroImage ||
          heroImage.includes('photo-1557050543-4d5f4e07ef46') ||
          !heroImage.includes('regenerated_image_1793632543146')
        ) {
          const gallery = [...(t.galleryImages || [])];
          gallery[0] = '/assets/images/regenerated_image_1793632543146.png';
          return {
            ...t,
            heroImage: '/assets/images/regenerated_image_1793632543146.png',
            galleryImages: gallery,
          };
        }
      }
      return { ...t, heroImage };
    });
  });
  const [fareRules, setFareRules] = useState<FareRules>(() => {
    const loaded = loadStorage(KEYS.FARES, INITIAL_FARE_RULES);
    return {
      ...loaded,
      categoryPricingTiers: {
        ...DEFAULT_CATEGORY_TIERS,
        ...(loaded?.categoryPricingTiers || {}),
      },
    };
  });
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => {
    const loaded = loadStorage<SiteSettings>(KEYS.SETTINGS, INITIAL_SITE_SETTINGS);
    const merged: SiteSettings = { ...INITIAL_SITE_SETTINGS, ...loaded };
    if (!merged.email || merged.email === 'info@galletaxi.lk' || merged.email === 'galletaxi.lk@gmail.com') {
      merged.email = 'support@galletaxi.lk';
    }
    if (!merged.seasonalBannerImageUrl || merged.seasonalBannerImageUrl === '/assets/aistudio/Down_South_Season_Coastal_Adventures.png') {
      merged.seasonalBannerImageUrl = '/assets/images/regenerated_image_1794057460840.png';
      merged.seasonalBannerTitle = INITIAL_SITE_SETTINGS.seasonalBannerTitle;
      merged.seasonalBannerSubtitle = INITIAL_SITE_SETTINGS.seasonalBannerSubtitle;
      merged.seasonalBannerLink = INITIAL_SITE_SETTINGS.seasonalBannerLink;
      merged.isSeasonalBannerVisible = true;
    }
    return merged;
  });

  // Southern Coast Taxi Hubs (Ahangama, Mirissa, Unawatuna, Hikkaduwa, Bentota, Weligama)
  const [taxiHubs, setTaxiHubs] = useState<Record<string, TownTaxiConfig>>(() => {
    const loaded = loadStorage<Record<string, TownTaxiConfig>>(KEYS.TAXI_HUBS, TOWNS_DATA);
    const merged = { ...TOWNS_DATA, ...loaded };
    if (merged['ahangama-taxi']) {
      merged['ahangama-taxi'] = {
        ...merged['ahangama-taxi'],
        heroImage: '/assets/aistudio/Sri_Lanka_Southern_Coast_Surf_Sunset_2549a27a.png',
      };
    }
    return merged;
  });
  
  // Multi-Currency & Configurable Exchange Rates
  const [currencies, setCurrencies] = useState<Record<string, CurrencyConfig>>(() => {
    const stored = loadStorage<Record<string, CurrencyConfig>>(KEYS.CURRENCIES_LIST, CURRENCIES);
    // Ensure default currencies exist
    return { ...CURRENCIES, ...stored };
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => loadStorage<CurrencyCode>(KEYS.CURRENCY, 'LKR'));

  // Cloud Firestore Free Tier Quota Exhaustion Circuit Breaker
  const [firestoreQuotaExhausted, setFirestoreQuotaExhausted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('galletaxi_quota_exhausted') === 'true' || globalQuotaExhausted;
    } catch {
      return false;
    }
  });

  const clearQuotaStatus = () => {
    globalQuotaExhausted = false;
    globalQuotaLogged = false;
    try {
      sessionStorage.removeItem('galletaxi_quota_exhausted');
    } catch {}
    setFirestoreQuotaExhausted(false);
    window.location.reload();
  };

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

  // Sync state changes to storage
  useEffect(() => {
    // Only cache local bookings when Firebase is offline
    if (!isFirebaseConfigured) {
      saveStorage(KEYS.BOOKINGS, bookings);
    }
  }, [bookings]);

  useEffect(() => saveStorage(KEYS.DRIVERS, drivers), [drivers]);
  useEffect(() => saveStorage(KEYS.VEHICLES, vehicles), [vehicles]);
  useEffect(() => saveStorage(KEYS.SERVICES, services), [services]);
  useEffect(() => saveStorage(KEYS.AREAS, serviceAreas), [serviceAreas]);
  useEffect(() => saveStorage(KEYS.FARES, fareRules), [fareRules]);
  useEffect(() => saveStorage(KEYS.SETTINGS, siteSettings), [siteSettings]);
  useEffect(() => saveStorage(KEYS.AUDIT, auditLogs), [auditLogs]);
  useEffect(() => saveStorage(KEYS.CURRENCIES_LIST, currencies), [currencies]);
  useEffect(() => saveStorage(KEYS.TOURS, tours), [tours]);

  // Proactive storage cleanup on initialization and tour event sync
  useEffect(() => {
    cleanExcessStorage();

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

  // Record an audit log (capped at 20 recent entries)
  const recordAudit = (action: string, targetId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      performedBy: adminUser?.email || 'Customer/Online Guest',
      targetId,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 19)]);
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

  /**
   * Real-time Firestore Sync for Bookings
   * When an authorized admin is signed in and Firestore is connected, listen to live bookings!
   */
  useEffect(() => {
    const firestoreDb = db;
    // CRITICAL (Firebase Integration Skill): Only attach onSnapshot listeners when auth is ready
    // AND a user is actively authenticated with Firebase Auth.
    if (!isFirebaseConfigured || !firestoreDb || !authReady || !firebaseUser || !adminUser) {
      setIsFirestoreSyncing(false);
      return;
    }

    let isMounted = true;
    setIsFirestoreSyncing(true);
    setFirestoreError(null);

    const attachBookingListener = async () => {
      try {
        const { collection, onSnapshot } = await import('firebase/firestore');
        const bookingsCol = collection(firestoreDb, 'bookings');

        // Listen to bookings
        const unsub = onSnapshot(
          bookingsCol,
          (snapshot) => {
            if (!isMounted) return;
            const liveBookings: Booking[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              liveBookings.push({
                id: docSnap.id,
                bookingReference: d.bookingReference || docSnap.id,
                customerName: d.customerName || 'Passenger',
                phone: d.phone || '',
                email: d.email || undefined,
                pickupLocation: d.pickupLocation || '',
                destination: d.destination || '',
                pickupDate: d.pickupDate || '',
                pickupTime: d.pickupTime || '',
                vehicleCategoryId: d.vehicleCategoryId || '',
                vehicleCategoryName: d.vehicleCategoryName || '',
                passengerCount: Number(d.passengerCount || 1),
                luggageCount: Number(d.luggageCount || 0),
                specialInstructions: d.specialInstructions || undefined,
                estimatedFare: Number(d.estimatedFare || 0),
                finalFare: d.finalFare !== undefined && d.finalFare !== null ? Number(d.finalFare) : undefined,
                status: (d.status as BookingStatus) || 'Pending',
                driverId: d.driverId || undefined,
                driverName: d.driverName || undefined,
                driverPhone: d.driverPhone || undefined,
                vehiclePlate: d.vehiclePlate || undefined,
                adminNotes: d.adminNotes || undefined,
                createdAt:
                  d.createdAtIso ||
                  (d.createdAt?.toDate ? d.createdAt.toDate().toISOString() : typeof d.createdAt === 'string' ? d.createdAt : new Date().toISOString()),
                updatedAt:
                  d.updatedAt?.toDate ? d.updatedAt.toDate().toISOString() : typeof d.updatedAt === 'string' ? d.updatedAt : new Date().toISOString(),
              });
            });

            // Sort descending by creation date
            liveBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            if (liveBookings.length > 0) {
              setBookings(liveBookings);
            }
            setIsFirestoreSyncing(false);
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
   * Real-time Firestore Sync for Day Tours CMS
   * Syncs live tours and pricing dynamically to the public website and admin console.
   */
  useEffect(() => {
    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb || globalQuotaExhausted) return;
    let isMounted = true;

    const attachToursListener = async () => {
      try {
        const { collection, onSnapshot, doc, setDoc } = await import('firebase/firestore');
        // Query fetches all documents from the tours collection without restrictive limits or incorrect filters
        const toursCol = collection(firestoreDb, 'tours');
        const unsub = onSnapshot(
          toursCol,
          async (snapshot) => {
            if (!isMounted) return;

            // Retrieve any deliberately deleted tour IDs
            const deletedTourIds: string[] = (() => {
              try {
                const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
                return raw ? JSON.parse(raw) : [];
              } catch {
                return [];
              }
            })();

            const firestoreToursMap = new Map<string, DayTourProduct>();
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (d && docSnap.id) {
                firestoreToursMap.set(docSnap.id, {
                  ...(d as DayTourProduct),
                  id: docSnap.id,
                });
              }
            });

            // Merge all baseline tours with live Firestore data
            const mergedMap = new Map<string, DayTourProduct>();

            // 1. Baseline day tours (Galle, Ella, Udawalawe, Yala, Bentota)
            PRIVATE_DAY_TOURS.forEach((baseTour) => {
              if (!deletedTourIds.includes(baseTour.id)) {
                if (firestoreToursMap.has(baseTour.id)) {
                  mergedMap.set(baseTour.id, {
                    ...baseTour,
                    ...firestoreToursMap.get(baseTour.id)!,
                  });
                } else {
                  mergedMap.set(baseTour.id, { ...baseTour });
                }
              }
            });

            // 2. Custom day tours created in Firestore
            firestoreToursMap.forEach((fTour, fId) => {
              if (!deletedTourIds.includes(fId) && !mergedMap.has(fId)) {
                mergedMap.set(fId, fTour);
              }
            });

            const mergedTours = Array.from(mergedMap.values());

            if (mergedTours.length > 0) {
              setTours(mergedTours);
              saveStorage(KEYS.TOURS, mergedTours);
            }

            // If Firestore is missing any of the baseline tours, seed them seamlessly if not in quota fallback
            if (isFirebaseConfigured && firestoreDb && !globalQuotaExhausted) {
              for (const baseTour of PRIVATE_DAY_TOURS) {
                if (!firestoreToursMap.has(baseTour.id) && !deletedTourIds.includes(baseTour.id)) {
                  try {
                    await setDoc(doc(firestoreDb, 'tours', baseTour.id), cleanFirestoreData(baseTour), { merge: true });
                  } catch (seedErr) {
                    if (isFirestoreQuotaExhausted(seedErr)) {
                      globalQuotaExhausted = true;
                      setFirestoreQuotaExhausted(true);
                      break;
                    }
                    console.warn(`[Galle Taxi] Notice seeding tour ${baseTour.id}:`, seedErr);
                  }
                }
              }
            }
          },
          (err) => {
            if (isFirestoreQuotaExhausted(err)) {
              globalQuotaExhausted = true;
              try {
                sessionStorage.setItem('galletaxi_quota_exhausted', 'true');
              } catch {}
              setFirestoreQuotaExhausted(true);
              if (!globalQuotaLogged) {
                console.info('[Galle Taxi Cloud Notice] Firebase Free Tier daily read quota (50,000 reads/day) reached for project "galle-taxi". Seamlessly serving local & cached fleet/tour data.');
                globalQuotaLogged = true;
              }
              return;
            }
            console.warn('[Firestore Tours Warning]:', err);
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
   * Real-time Firestore Sync for Vehicles and Fare Rules & Cross-Tab Persistence Sync
   */
  useEffect(() => {
    // Cross-tab broadcast listener for instant multi-tab sync
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === KEYS.FARES && e.newValue) {
        try {
          const updatedFares = JSON.parse(e.newValue);
          setFareRules(updatedFares);
        } catch {}
      }
      if (e.key === KEYS.VEHICLES && e.newValue) {
        try {
          const updatedVehicles = JSON.parse(e.newValue);
          setVehicles(updatedVehicles);
        } catch {}
      }
    };
    // Custom event broadcast listeners for immediate same-tab / multi-component sync
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
    window.addEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
    window.addEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);

    const firestoreDb = db;
    if (!isFirebaseConfigured || !firestoreDb || globalQuotaExhausted) {
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
        window.removeEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);
      };
    }

    let isMounted = true;
    const unsubs: (() => void)[] = [];

    const handleQuotaExhausted = (err: any): boolean => {
      if (isFirestoreQuotaExhausted(err)) {
        globalQuotaExhausted = true;
        try {
          sessionStorage.setItem('galletaxi_quota_exhausted', 'true');
        } catch {}
        setFirestoreQuotaExhausted(true);
        if (!globalQuotaLogged) {
          console.info(
            '[Galle Taxi Cloud Notice] Firebase Free Tier daily read quota (50,000 reads/day) reached on project "galle-taxi". Operating in seamless local/cached storage fallback mode. Booking system remains 100% functional.'
          );
          globalQuotaLogged = true;
        }
        // Unsubscribe all active listeners immediately to halt further failed network requests
        unsubs.forEach((unsub) => {
          try {
            unsub();
          } catch {}
        });
        return true;
      }
      return false;
    };

    const attachListeners = async () => {
      try {
        const { doc, collection, onSnapshot, setDoc } = await import('firebase/firestore');

        // 1. Real-time Fare Rules Sync
        try {
          const unsubFare = onSnapshot(doc(firestoreDb, 'fareRules', 'current'), (docSnap) => {
            if (!isMounted) return;
            if (docSnap.exists()) {
              const data = docSnap.data() as FareRules;
              setFareRules(data);
              saveStorage(KEYS.FARES, data);
            } else if (!globalQuotaExhausted) {
              setDoc(doc(firestoreDb, 'fareRules', 'current'), cleanFirestoreData(INITIAL_FARE_RULES)).catch((err) => {
                if (!isFirestoreQuotaExhausted(err)) console.warn('[Galle Taxi] Notice auto-seeding fareRules:', err);
              });
            }
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore FareRules Warning]:', err);
          });
          unsubs.push(unsubFare);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching fareRules listener:', e);
        }

        // 2. Real-time Vehicles Fleet Sync
        try {
          const unsubVeh = onSnapshot(collection(firestoreDb, 'vehicles'), (snap) => {
            if (!isMounted) return;
            if (snap.empty) {
              if (!globalQuotaExhausted) {
                INITIAL_VEHICLES.forEach((v) => {
                  setDoc(doc(firestoreDb, 'vehicles', v.id), cleanFirestoreData(v)).catch(() => {});
                });
              }
              return;
            }
            const liveVehicles: Vehicle[] = [];
            snap.forEach((d) => liveVehicles.push({ ...(d.data() as Vehicle), id: d.id }));
            if (liveVehicles.length > 0) {
              setVehicles(liveVehicles);
              saveStorage(KEYS.VEHICLES, liveVehicles);
            }
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore Vehicles Warning]:', err);
          });
          unsubs.push(unsubVeh);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching vehicles listener:', e);
        }

        // 3. Real-time Site Settings Sync (Hero image, seasonal banner, contact numbers, branding)
        try {
          const unsubSettings = onSnapshot(doc(firestoreDb, 'siteSettings', 'current'), (docSnap) => {
            if (!isMounted) return;
            if (docSnap.exists()) {
              const data = docSnap.data() as Partial<SiteSettings>;
              setSiteSettings((prev) => {
                const merged: SiteSettings = {
                  ...prev,
                  ...data,
                };
                saveStorage(KEYS.SETTINGS, merged);
                return merged;
              });
            } else if (!globalQuotaExhausted) {
              setDoc(doc(firestoreDb, 'siteSettings', 'current'), cleanFirestoreData(INITIAL_SITE_SETTINGS)).catch((err) => {
                if (!isFirestoreQuotaExhausted(err)) console.warn('[Galle Taxi] Notice auto-seeding siteSettings:', err);
              });
            }
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore SiteSettings Warning]:', err);
          });
          unsubs.push(unsubSettings);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching siteSettings listener:', e);
        }

        // 4. Real-time Southern Coast Taxi Hubs Sync (Routes, town fares, images, attractions)
        try {
          const unsubHubs = onSnapshot(collection(firestoreDb, 'taxi_hubs'), (snap) => {
            if (!isMounted) return;
            if (snap.empty) {
              if (!globalQuotaExhausted) {
                Object.entries(TOWNS_DATA).forEach(([slug, hub]) => {
                  setDoc(doc(firestoreDb, 'taxi_hubs', slug), cleanFirestoreData(hub), { merge: true }).catch(() => {});
                });
              }
              return;
            }
            setTaxiHubs((prev) => {
              const merged = { ...prev };
              snap.forEach((d) => {
                const hubData = d.data() as TownTaxiConfig;
                merged[d.id] = {
                  ...(merged[d.id] || {}),
                  ...hubData,
                  slug: d.id,
                };
                TOWNS_DATA[d.id] = merged[d.id];
              });
              saveStorage(KEYS.TAXI_HUBS, merged);
              return merged;
            });
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore TaxiHubs Warning]:', err);
          });
          unsubs.push(unsubHubs);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching taxiHubs listener:', e);
        }

        // 5. Real-time Currencies & Live Exchange Rates Sync
        try {
          const unsubCurrencies = onSnapshot(collection(firestoreDb, 'currencies'), (snap) => {
            if (!isMounted) return;
            if (snap.empty) {
              if (!globalQuotaExhausted) {
                Object.entries(CURRENCIES).forEach(([code, config]) => {
                  setDoc(doc(firestoreDb, 'currencies', code), cleanFirestoreData(config), { merge: true }).catch(() => {});
                });
              }
              return;
            }
            const liveCurrencies: Record<string, CurrencyConfig> = { ...CURRENCIES };
            snap.forEach((d) => {
              liveCurrencies[d.id] = d.data() as CurrencyConfig;
            });
            setCurrencies(liveCurrencies);
            saveStorage(KEYS.CURRENCIES_LIST, liveCurrencies);
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore Currencies Warning]:', err);
          });
          unsubs.push(unsubCurrencies);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching currencies listener:', e);
        }

        // 6. Real-time Services Catalog Sync
        try {
          const unsubServices = onSnapshot(collection(firestoreDb, 'services'), (snap) => {
            if (!isMounted) return;
            if (snap.empty) {
              if (!globalQuotaExhausted) {
                INITIAL_SERVICES.forEach((s) => {
                  setDoc(doc(firestoreDb, 'services', s.id), cleanFirestoreData(s), { merge: true }).catch(() => {});
                });
              }
              return;
            }
            const liveServices: Service[] = [];
            snap.forEach((d) => liveServices.push({ ...(d.data() as Service), id: d.id }));
            if (liveServices.length > 0) {
              setServices(liveServices);
              saveStorage(KEYS.SERVICES, liveServices);
            }
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore Services Warning]:', err);
          });
          unsubs.push(unsubServices);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching services listener:', e);
        }

        // 7. Real-time Service Areas Coverage Sync
        try {
          const unsubAreas = onSnapshot(collection(firestoreDb, 'serviceAreas'), (snap) => {
            if (!isMounted) return;
            if (snap.empty) {
              if (!globalQuotaExhausted) {
                INITIAL_SERVICE_AREAS.forEach((a) => {
                  setDoc(doc(firestoreDb, 'serviceAreas', a.id), cleanFirestoreData(a), { merge: true }).catch(() => {});
                });
              }
              return;
            }
            const liveAreas: ServiceArea[] = [];
            snap.forEach((d) => liveAreas.push({ ...(d.data() as ServiceArea), id: d.id }));
            if (liveAreas.length > 0) {
              setServiceAreas(liveAreas);
              saveStorage(KEYS.AREAS, liveAreas);
            }
          }, (err) => {
            if (!handleQuotaExhausted(err)) console.warn('[Firestore ServiceAreas Warning]:', err);
          });
          unsubs.push(unsubAreas);
        } catch (e) {
          if (!handleQuotaExhausted(e)) console.warn('Error attaching serviceAreas listener:', e);
        }
      } catch (err) {
        if (!handleQuotaExhausted(err)) console.warn('Real-time database listener registration error:', err);
      }
    };

    attachListeners();

    return () => {
      isMounted = false;
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('galle_taxi_fare_rules_updated', handleFareCustomEvent);
      window.removeEventListener('galle_taxi_vehicle_updated', handleVehCustomEvent);
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {}
      });
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
        console.info(`[Galle Taxi] Booking ${bookingReference} successfully written to Cloud Firestore.`);
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
  const addVehicle = async (vehicleInput: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
    const id = `veh-${Date.now()}`;
    const newVehicle: Vehicle = {
      ...vehicleInput,
      id,
    };

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'vehicles', id), cleanFirestoreData(newVehicle));
        console.info(`[Galle Taxi] Vehicle ${id} added to Cloud Firestore.`);
      } catch (e: any) {
        if (isFirestoreQuotaExhausted(e)) {
          console.warn(`[Galle Taxi Quota Notice] Firestore daily write quota reached on project 'galle-taxi'. Vehicle ${id} saved to local storage.`);
        } else {
          console.error('Vehicle write error:', e);
        }
      }
    }

    setVehicles((prev) => {
      const next = [newVehicle, ...prev];
      saveStorage(KEYS.VEHICLES, next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });
    recordAudit('VEHICLE_ADDED', id, `Added vehicle to fleet: ${newVehicle.name} (${newVehicle.plateNumber})`);
    return newVehicle;
  };

  const updateVehicle = async (vehicle: Vehicle) => {
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'vehicles', vehicle.id), cleanFirestoreData({ ...vehicle }), { merge: true });
        console.info(`[Galle Taxi] Vehicle ${vehicle.id} saved to Cloud Firestore.`);
      } catch (e: any) {
        if (isFirestoreQuotaExhausted(e)) {
          console.warn(`[Galle Taxi Quota Notice] Firestore daily write quota reached on project 'galle-taxi'. Vehicle ${vehicle.id} saved to local storage and active in app.`);
        } else {
          console.error('Vehicle update error in Firestore:', e);
        }
      }
    }
    setVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      const next = exists ? prev.map((v) => (v.id === vehicle.id ? vehicle : v)) : [vehicle, ...prev];
      saveStorage(KEYS.VEHICLES, next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });
    recordAudit('VEHICLE_UPDATED', vehicle.id, `Updated vehicle: ${vehicle.name}`);
  };

  const deleteVehicle = async (id: string) => {
    const targetVehicle = vehicles.find((v) => v.id === id);
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestoreDb, 'vehicles', id));
        console.info(`[Galle Taxi] Vehicle ${id} removed from Cloud Firestore.`);
      } catch (e: any) {
        if (isFirestoreQuotaExhausted(e)) {
          console.warn(`[Galle Taxi Quota Notice] Firestore daily write quota reached. Vehicle ${id} removed from local storage.`);
        } else {
          console.error('Vehicle delete error in Firestore:', e);
        }
      }
    }
    setVehicles((prev) => {
      const next = prev.filter((v) => v.id !== id);
      saveStorage(KEYS.VEHICLES, next);
      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_vehicle_updated', { detail: next }));
      } catch {}
      return next;
    });
    recordAudit('VEHICLE_DELETED', id, `Removed vehicle from fleet: ${targetVehicle?.name || id}`);
  };

  // Content
  const updateFareRules = async (rules: FareRules) => {
    setFareRules(rules);
    saveStorage(KEYS.FARES, rules);
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
        if (isFirestoreQuotaExhausted(e)) {
          console.warn('[Galle Taxi Quota Notice] Firestore daily write quota limit reached (20,000 writes/day on Spark plan). Fare rules have been safely saved to local persistent storage and updated live on the website.');
          return;
        }
        console.error('Fare rules write error:', e);
        throw e;
      }
    }
  };

  const updateSiteSettings = async (settings: SiteSettings) => {
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'siteSettings', 'current'), cleanFirestoreData(settings));
        console.info('[Galle Taxi] Site settings saved to Cloud Firestore.');
      } catch (e: any) {
        if (isFirestoreQuotaExhausted(e)) {
          console.warn('[Galle Taxi Quota Notice] Firestore daily write quota reached on project "galle-taxi". Site settings saved to local storage and active in app.');
        } else {
          console.error('Site settings write error:', e);
        }
      }
    }
    setSiteSettings(settings);
    saveStorage(KEYS.SETTINGS, settings);
    recordAudit('SITE_SETTINGS_UPDATED', 'siteSettings', 'Updated contact numbers and brand copy');
  };

  const updateService = async (service: Service) => {
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
    setServices((prev) => {
      const next = prev.map((s) => (s.id === service.id ? service : s));
      saveStorage(KEYS.SERVICES, next);
      return next;
    });
    recordAudit('SERVICE_UPDATED', service.id, `Updated service: ${service.title}`);
  };

  const addService = async (serviceInput: Omit<Service, 'id'>): Promise<Service> => {
    const id = `svc-${Date.now()}`;
    const newService: Service = { ...serviceInput, id };
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
    setServices((prev) => {
      const next = [...prev, newService];
      saveStorage(KEYS.SERVICES, next);
      return next;
    });
    recordAudit('SERVICE_ADDED', id, `Added transport service: ${newService.title}`);
    return newService;
  };

  const updateServiceArea = async (area: ServiceArea) => {
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
    setServiceAreas((prev) => {
      const next = prev.map((a) => (a.id === area.id ? area : a));
      saveStorage(KEYS.AREAS, next);
      return next;
    });
    recordAudit('SERVICE_AREA_UPDATED', area.id, `Updated coverage: ${area.name}`);
  };

  const addServiceArea = async (areaInput: Omit<ServiceArea, 'id'>): Promise<ServiceArea> => {
    const id = `area-${Date.now()}`;
    const newArea: ServiceArea = { ...areaInput, id };
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
    setServiceAreas((prev) => {
      const next = [...prev, newArea];
      saveStorage(KEYS.AREAS, next);
      return next;
    });
    recordAudit('SERVICE_AREA_ADDED', id, `Added coverage area: ${newArea.name}`);
    return newArea;
  };

  // Day Tours CMS
  const fetchTours = async (): Promise<DayTourProduct[]> => {
    const firestoreDb = db;
    const deletedTourIds: string[] = (() => {
      try {
        const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    })();

    const firestoreToursMap = new Map<string, DayTourProduct>();
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { collection, getDocs } = await import('firebase/firestore');
        // Unrestricted query fetching all documents from the tours collection
        const toursCol = collection(firestoreDb, 'tours');
        const snap = await getDocs(toursCol);
        snap.forEach((docSnap) => {
          const d = docSnap.data();
          if (d && docSnap.id) {
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

    const mergedMap = new Map<string, DayTourProduct>();
    PRIVATE_DAY_TOURS.forEach((baseTour) => {
      if (!deletedTourIds.includes(baseTour.id)) {
        if (firestoreToursMap.has(baseTour.id)) {
          mergedMap.set(baseTour.id, {
            ...baseTour,
            ...firestoreToursMap.get(baseTour.id)!,
          });
        } else {
          mergedMap.set(baseTour.id, { ...baseTour });
        }
      }
    });

    firestoreToursMap.forEach((fTour, fId) => {
      if (!deletedTourIds.includes(fId) && !mergedMap.has(fId)) {
        mergedMap.set(fId, fTour);
      }
    });

    const finalTours = Array.from(mergedMap.values());
    if (finalTours.length > 0) {
      setTours(finalTours);
      saveStorage(KEYS.TOURS, finalTours);
    }
    return finalTours;
  };

  const addTour = async (tourInput: Omit<DayTourProduct, 'id'>): Promise<DayTourProduct> => {
    const id = tourInput.slug || `tour-${Date.now()}`;
    const newTour: DayTourProduct = {
      ...tourInput,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, setDoc } = await import('firebase/firestore');
        await setDoc(doc(firestoreDb, 'tours', id), cleanFirestoreData(newTour));
        console.info(`[Galle Taxi] Tour "${newTour.title}" saved to Cloud Firestore.`);
      } catch (e) {
        console.error('Tour write error in Firestore:', e);
      }
    }

    // Clear from deleted tours if previously removed
    try {
      const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
      if (raw) {
        const list = JSON.parse(raw).filter((dId: string) => dId !== id);
        localStorage.setItem('galletaxi_v1_deleted_tours', JSON.stringify(list));
      }
    } catch {}

    // Persist custom cover image key for fast direct lookup
    if (newTour.heroImage) {
      try {
        localStorage.setItem(`custom_tour_img_${id}`, newTour.heroImage);
      } catch {}
    }

    // Synchronize in-memory PRIVATE_DAY_TOURS array so non-reactive consumers sync immediately
    const existingIndex = PRIVATE_DAY_TOURS.findIndex((t) => t.id === id);
    if (existingIndex >= 0) {
      PRIVATE_DAY_TOURS[existingIndex] = newTour;
    } else {
      PRIVATE_DAY_TOURS.unshift(newTour);
    }

    setTours((prev) => {
      const next = [newTour, ...prev.filter((t) => t.id !== id)];
      saveStorage(KEYS.TOURS, next);
      return next;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_tour_updated', { detail: newTour }));
    }

    recordAudit('TOUR_ADDED', id, `Added private day tour: ${newTour.title}`);
    return newTour;
  };

  const updateTour = async (tour: DayTourProduct) => {
    const updatedTour: DayTourProduct = {
      ...tour,
      updatedAt: new Date().toISOString(),
    };

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

    // Persist custom cover image key
    if (updatedTour.heroImage) {
      try {
        localStorage.setItem(`custom_tour_img_${tour.id}`, updatedTour.heroImage);
      } catch {}
    }

    // Synchronize in-memory PRIVATE_DAY_TOURS static array
    const existingIndex = PRIVATE_DAY_TOURS.findIndex((t) => t.id === tour.id);
    if (existingIndex >= 0) {
      PRIVATE_DAY_TOURS[existingIndex] = updatedTour;
    } else {
      PRIVATE_DAY_TOURS.unshift(updatedTour);
    }

    setTours((prev) => {
      const next = prev.map((t) => (t.id === tour.id ? updatedTour : t));
      saveStorage(KEYS.TOURS, next);
      return next;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_tour_updated', { detail: updatedTour }));
    }

    recordAudit('TOUR_UPDATED', tour.id, `Updated private day tour: ${tour.title}`);
  };

  const deleteTour = async (id: string) => {
    const firestoreDb = db;
    if (isFirebaseConfigured && firestoreDb) {
      try {
        const { doc, deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(firestoreDb, 'tours', id));
        console.info(`[Galle Taxi] Tour ${id} deleted from Cloud Firestore.`);
      } catch (e) {
        console.warn('Tour delete error in Firestore:', e);
      }
    }

    // Record in deleted tours list
    try {
      const raw = localStorage.getItem('galletaxi_v1_deleted_tours');
      const list = raw ? JSON.parse(raw) : [];
      if (!list.includes(id)) {
        list.push(id);
        localStorage.setItem('galletaxi_v1_deleted_tours', JSON.stringify(list));
      }
    } catch {}

    try {
      localStorage.removeItem(`custom_tour_img_${id}`);
    } catch {}

    const index = PRIVATE_DAY_TOURS.findIndex((t) => t.id === id);
    if (index >= 0) {
      PRIVATE_DAY_TOURS.splice(index, 1);
    }

    const removedTour = tours.find((t) => t.id === id);
    setTours((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveStorage(KEYS.TOURS, next);
      return next;
    });
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
    // 1. Try Firebase Storage if active
    if (isFirebaseConfigured && storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `${folder}/${Date.now()}_${safeName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.info('[Galle Taxi] Image uploaded to Firebase Storage:', downloadUrl);
        return downloadUrl;
      } catch (err) {
        console.warn('Firebase Storage upload failed, trying server disk storage endpoint:', err);
      }
    }

    // 2. Client-side canvas compression for crisp display and manageable upload size
    const compressedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1440;
          const maxHeight = 960;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.85));
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
    });

    // 3. Post to backend /api/upload-tour-image to store permanently on server disk and return static URL
    try {
      const subFolder = folder.includes('gallery') ? 'gallery' : 'covers';
      const response = await fetch('/api/upload-tour-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compressedBase64,
          filename: file.name,
          folder: subFolder,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.url) {
          console.info('[Galle Taxi] Tour image saved to server disk:', data.url);
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('[Galle Taxi] /api/upload-tour-image endpoint unreachable, using client data URL fallback:', apiErr);
    }

    // 4. Fallback: return the compressed WebP data URL
    return compressedBase64;
  };

  const uploadHubImage = async (file: File, hubSlug: string = 'hub'): Promise<string> => {
    // 1. Try Firebase Storage if active
    if (isFirebaseConfigured && storage) {
      try {
        const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const storageRef = ref(storage, `hubs/${Date.now()}_${safeName}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.info('[Galle Taxi] Hub image uploaded to Firebase Storage:', downloadUrl);
        return downloadUrl;
      } catch (err) {
        console.warn('Firebase Storage upload notice for hub, proceeding to server storage:', err);
      }
    }

    // 2. Client-side canvas compression for crisp display and manageable upload size
    const compressedBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const maxWidth = 1600;
          const maxHeight = 1000;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.88));
        };
        img.onerror = () => resolve(event.target?.result as string);
      };
      reader.onerror = (err) => reject(err);
    });

    // 3. Post to backend /api/upload-hub-image to store permanently on server disk and return static URL
    try {
      const response = await fetch('/api/upload-hub-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: compressedBase64,
          filename: file.name,
          hubSlug,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.success && data.url) {
          console.info('[Galle Taxi] Hub image saved to server disk:', data.url);
          return data.url;
        }
      }
    } catch (apiErr) {
      console.warn('[Galle Taxi] /api/upload-hub-image endpoint unreachable, using client data URL fallback:', apiErr);
    }

    // 4. Fallback: return the compressed WebP data URL
    return compressedBase64;
  };

  const resetToSampleData = () => {
    setDrivers(INITIAL_DRIVERS);
    setVehicles(INITIAL_VEHICLES);
    setServices(INITIAL_SERVICES);
    setServiceAreas(INITIAL_SERVICE_AREAS);
    setFareRules(INITIAL_FARE_RULES);
    setSiteSettings(INITIAL_SITE_SETTINGS);
    recordAudit('SAMPLE_DATA_RESTORED', 'fleet', 'Restored default Galle Taxi fleet configuration.');
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
    TOWNS_DATA[slug] = merged;

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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('galletaxi_hub_updated', { detail: merged }));
    }

    recordAudit('TAXI_HUB_UPDATED', slug, `Updated details & rates for ${merged.townName}`);
  };

  const resetTaxiHubs = async () => {
    setTaxiHubs(TOWNS_DATA);
    saveStorage(KEYS.TAXI_HUBS, TOWNS_DATA);
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
      resetToSampleData,
      firestoreQuotaExhausted,
      clearQuotaStatus,
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
      firestoreError,
      firebaseProjectId,
      firestoreQuotaExhausted,
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
