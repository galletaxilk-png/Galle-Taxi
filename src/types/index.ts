/**
 * Galle Taxi - Domain Types & Interfaces
 */

export type BookingStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Driver Assigned'
  | 'Driver En Route'
  | 'Picked Up'
  | 'Completed'
  | 'Cancelled';

export interface Booking {
  id: string;
  bookingReference: string; // e.g. GT-2026-8942
  customerName: string;
  phone: string;
  email?: string;
  pickupLocation: string;
  destination: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // HH:MM
  vehicleCategoryId: string;
  vehicleCategoryName: string;
  passengerCount: number;
  luggageCount: number;
  flightNumber?: string;
  airportGreeting?: boolean;
  nameboardText?: string;
  specialInstructions?: string;
  tourId?: string;
  tourSlug?: string;
  tourTitle?: string;
  isDayTour?: boolean;
  estimatedFare: number; // in LKR
  finalFare?: number; // in LKR, set by admin upon completion
  status: BookingStatus;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehiclePlate?: string;
  adminNotes?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  nicNumber: string; // Sri Lankan National Identity Card
  licenseNumber: string;
  assignedVehicleId?: string;
  assignedVehicleName?: string;
  assignedVehiclePlate?: string;
  rating: number; // 1 to 5
  totalTrips: number;
  isActive: boolean;
  joinedAt: string;
}

export type PricingTierType = 'Flat' | 'Per KM';

export interface PricingTier {
  id: string;
  minKm: number;
  maxKm: number;
  type: PricingTierType;
  flatPrice: number; // Flat (Rs)
  ratePerKm: number; // Rate (Rs/km)
}

export interface Vehicle {
  id: string;
  name: string;
  category: 'Mini Car' | 'Sedan' | 'Van' | 'Luxury' | 'SUV' | 'Mini Van' | string;
  plateNumber: string;
  passengers: number;
  luggage: number;
  description: string;
  pricePerKm: number; // in LKR
  baseFare: number; // in LKR
  imageUrl: string;
  isAvailable: boolean;
  features: string[];
  pricingTiers?: PricingTier[];
  classLabel?: string;
  handLuggage?: number;
  modelSubtitle?: string;
  slug?: string;
  displayOrder?: number;
  isFeatured?: boolean;
  isDefaultSelected?: boolean;
  hideCard?: boolean;
  showFixedFare?: boolean;
  additionalImages?: string[];
}

export interface FixedRoute {
  id: string;
  from: string;
  to: string;
  miniCarPrice?: number; // in LKR (Budget Mini Car)
  mini_van?: number; // in LKR (Compact Mini Van - database ID: mini_van)
  miniVanPrice?: number; // in LKR (Compact Mini Van alias)
  sedanPrice: number; // in LKR (Executive Sedan)
  vanPrice: number; // in LKR (Passenger Van)
  suvPrice?: number; // in LKR (Luxury SUV)
  luxuryPrice: number; // in LKR (VIP Luxury)
  categoryPrices?: Record<string, number>; // in LKR (Custom vehicle category fixed rates)
  estimatedDistanceKm: number;
  estimatedDuration: string;
  description: string;
}

export interface FareRules {
  baseFare: number; // in LKR
  perKmRate: number; // in LKR
  minimumFare: number; // in LKR
  waitingPerHour: number; // in LKR
  nightSurchargePercent: number; // e.g. 15 for 15%
  additionalStopCharge: number; // in LKR
  fixedRoutes: FixedRoute[];
  categoryPricingTiers?: Record<string, PricingTier[]>;
}

export interface Service {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  features: string[];
  startingFromLkr: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  district: string;
  description: string;
  popularHotels: string[];
  typicalPickupTime: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  operatingHours: string;
  heroHeadline: string;
  heroSubtitle: string;
  heroImageUrl: string;
  aboutStory: string;
  announcement?: string;
  seasonalBannerImageUrl?: string;
  seasonalBannerTitle?: string;
  seasonalBannerSubtitle?: string;
  seasonalBannerLink?: string;
  isSeasonalBannerVisible?: boolean;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  targetId: string;
  details: string;
  timestamp: string;
}

export interface AdminUser {
  uid: string;
  email: string;
  role: 'superadmin' | 'dispatcher';
  displayName?: string;
}

export type CurrencyCode = 'LKR' | 'USD' | 'EUR' | 'INR' | 'GBP' | 'AUD' | string;

export interface CurrencyConfig {
  code: string;
  label: string;
  name: string;
  symbol: string;
  rateToLkr: number;
  flag: string;
  isActive?: boolean;
}

export type {
  DayTourProduct,
  TourVehiclePrice,
  TourItineraryItem,
  TourHighlightItem,
} from '../lib/toursData';

export type {
  TownTaxiConfig,
  TownRoute,
  TownAttraction,
  TownFaq,
} from '../pages/destinations/townData';


