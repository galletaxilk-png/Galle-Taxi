/**
 * Galle Taxi - Authoritative Fare Engine
 * Calculates trusted trip estimates and authoritative billing amounts based on configured rules.
 */

import { FareRules, Vehicle, FixedRoute, CurrencyCode, CurrencyConfig, PricingTier } from '../types';
import { calculateLocationDistance } from './locationService';
import { DEFAULT_CATEGORY_TIERS, DEFAULT_KDH_HIGH_TIERS } from './initialData';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  LKR: {
    code: 'LKR',
    label: 'LKR (Rs)',
    name: 'Sri Lankan Rupee',
    symbol: 'Rs.',
    rateToLkr: 1,
    flag: '🇱🇰',
    isActive: true,
  },
  USD: {
    code: 'USD',
    label: 'USD ($)',
    name: 'US Dollar',
    symbol: '$',
    rateToLkr: 305,
    flag: '🇺🇸',
    isActive: true,
  },
  EUR: {
    code: 'EUR',
    label: 'EUR (€)',
    name: 'Euro',
    symbol: '€',
    rateToLkr: 330,
    flag: '🇪🇺',
    isActive: true,
  },
  GBP: {
    code: 'GBP',
    label: 'GBP (£)',
    name: 'British Pound',
    symbol: '£',
    rateToLkr: 395,
    flag: '🇬🇧',
    isActive: true,
  },
  INR: {
    code: 'INR',
    label: 'INR (₹)',
    name: 'Indian Rupee',
    symbol: '₹',
    rateToLkr: 3.65,
    flag: '🇮🇳',
    isActive: true,
  },
  AUD: {
    code: 'AUD',
    label: 'AUD (A$)',
    name: 'Australian Dollar',
    symbol: 'A$',
    rateToLkr: 200,
    flag: '🇦🇺',
    isActive: true,
  },
};

export function convertLkrTo(
  amountInLkr: number,
  currency: CurrencyCode,
  customCurrencies?: Record<string, CurrencyConfig>
): number {
  const dict = customCurrencies || CURRENCIES;
  const conf = dict[currency] || CURRENCIES[currency] || CURRENCIES.LKR;
  return amountInLkr / (conf.rateToLkr || 1);
}

export function formatCurrency(
  amountInLkr: number,
  currency: CurrencyCode = 'LKR',
  options?: { showBoth?: boolean; currencies?: Record<string, CurrencyConfig> }
): string {
  if (isNaN(amountInLkr) || amountInLkr === null || amountInLkr === undefined) return '-';
  const dict = options?.currencies || CURRENCIES;
  const conf = dict[currency] || CURRENCIES[currency] || CURRENCIES.LKR;
  const converted = convertLkrTo(amountInLkr, currency, dict);

  let formatted = '';
  if (currency === 'LKR') {
    formatted = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(Math.round(converted));
  } else if (currency === 'USD') {
    formatted = `$${Math.round(converted).toLocaleString('en-US')}`;
  } else if (currency === 'EUR') {
    formatted = `€${Math.round(converted).toLocaleString('de-DE')}`;
  } else if (currency === 'GBP') {
    formatted = `£${Math.round(converted).toLocaleString('en-GB')}`;
  } else if (currency === 'INR') {
    formatted = `₹${Math.round(converted).toLocaleString('en-IN')}`;
  } else if (currency === 'AUD') {
    formatted = `A$${Math.round(converted).toLocaleString('en-AU')}`;
  } else {
    formatted = `${conf.symbol}${Math.round(converted).toLocaleString()}`;
  }

  if (options?.showBoth && currency !== 'LKR') {
    const lkrStr = new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      maximumFractionDigits: 0,
    }).format(Math.round(amountInLkr));
    return `${formatted} (${lkrStr})`;
  }

  return formatted;
}

export function formatLKR(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('en-LK', {
    maximumFractionDigits: 0,
  }).format(amount);
}

interface CalculateFareParams {
  pickup: string;
  destination: string;
  vehicleCategoryId: string;
  pickupTime: string; // HH:MM
  stopsCount?: number;
  vehicles: Vehicle[];
  fareRules: FareRules;
  customDistanceKm?: number;
}

export interface FareCalculationResult {
  fare: number;
  isFixedRoute: boolean;
  routeName?: string;
  distanceKm: number;
  matchedTier?: PricingTier;
  tierDescription?: string;
  breakdown: {
    baseFare: number;
    distanceCharge: number;
    nightSurcharge: number;
    additionalStopsCharge: number;
    vehicleCategory: string;
  };
}

/**
 * Checks if two location strings refer to the same hub in Sri Lanka
 */
function isHubMatch(input: string, hub: string): boolean {
  const norm = input.toLowerCase();
  const hubNorm = hub.toLowerCase();

  if (norm.includes(hubNorm) || hubNorm.includes(norm)) return true;

  // Airport aliases
  const isInputAirport = norm.includes('airport') || norm.includes('cmb') || norm.includes('katunayake') || norm.includes('bandaranaike');
  const isHubAirport = hubNorm.includes('airport') || hubNorm.includes('cmb') || hubNorm.includes('katunayake') || hubNorm.includes('bandaranaike');
  if (isInputAirport && isHubAirport) return true;

  // Galle Fort / Galle Town
  const isInputGalle = norm.includes('galle') || norm.includes('amangalla') || norm.includes('fort bazaar');
  const isHubGalle = hubNorm.includes('galle');
  if (isInputGalle && isHubGalle) return true;

  // Colombo City
  const isInputColombo = (norm.includes('colombo') && !isInputAirport) || norm.includes('fort railway');
  const isHubColombo = hubNorm.includes('colombo') && !isHubAirport;
  if (isInputColombo && isHubColombo) return true;

  // Mirissa / Weligama
  const isInputMirissa = norm.includes('mirissa') || norm.includes('weligama');
  const isHubMirissa = hubNorm.includes('mirissa') || hubNorm.includes('weligama');
  if (isInputMirissa && isHubMirissa) return true;

  // Ella
  const isInputElla = norm.includes('ella') || norm.includes('demodara');
  const isHubElla = hubNorm.includes('ella') || hubNorm.includes('demodara');
  if (isInputElla && isHubElla) return true;

  // Unawatuna
  const isInputUna = norm.includes('unawatuna') || norm.includes('rumassala');
  const isHubUna = hubNorm.includes('unawatuna');
  if (isInputUna && isHubUna) return true;

  return false;
}

export function calculateAuthoritativeFare(params: CalculateFareParams): FareCalculationResult {
  const { pickup, destination, vehicleCategoryId, pickupTime, stopsCount = 0, vehicles, fareRules, customDistanceKm } = params;

  const vehicle =
    vehicles.find((v) => v.id === vehicleCategoryId) ||
    vehicles.find((v) => v.category === vehicleCategoryId) ||
    vehicles.find((v) => v.name.toLowerCase() === vehicleCategoryId.toLowerCase()) ||
    (vehicleCategoryId.toLowerCase().includes('high') ? vehicles.find((v) => v.id === 'veh-kdh-high') : undefined) ||
    (vehicleCategoryId.toLowerCase().includes('flat') ? vehicles.find((v) => v.id === 'veh-kdh-flat') : undefined) ||
    (vehicleCategoryId.toLowerCase().includes('van') ? (vehicles.find((v) => v.id === 'veh-kdh-flat') || vehicles.find((v) => v.id === 'veh-kdh-high')) : undefined) ||
    (vehicleCategoryId.toLowerCase().includes('suv') ? vehicles.find((v) => v.id === 'veh-suv-4wd') : undefined) ||
    (vehicleCategoryId.toLowerCase().includes('sedan') ? vehicles.find((v) => v.id === 'veh-sedan-std') : undefined) ||
    vehicles[0];

  // 1. Check if matches any configured route hub (for accurate highway distance & name)
  const matchedRoute = fareRules.fixedRoutes?.find((r) => {
    const forwardMatch = isHubMatch(pickup, r.from) && isHubMatch(destination, r.to);
    const returnMatch = isHubMatch(pickup, r.to) && isHubMatch(destination, r.from);
    return forwardMatch || returnMatch;
  });

  // 2. Determine realistic distance in KM
  let distanceKm = customDistanceKm && customDistanceKm > 0 ? customDistanceKm : (matchedRoute?.estimatedDistanceKm || 0);
  if (!matchedRoute && (!customDistanceKm || customDistanceKm <= 0)) {
    const calculated = calculateLocationDistance({ name: pickup }, { name: destination });
    distanceKm = calculated.distanceKm;
  }
  if (!distanceKm || distanceKm < 3) {
    distanceKm = 15;
  }

  // 3. Priority 1: Configured Vehicle Category Pricing Tiers from Admin Dashboard (fareRules.categoryPricingTiers)
  const catUpper = (vehicle.category || '').toUpperCase();
  const vId = (vehicle.id || '').toLowerCase();
  const vName = (vehicle.name || '').toLowerCase();

  const categoryTiers: PricingTier[] | undefined =
    fareRules.categoryPricingTiers?.[vehicle.category] ||
    (catUpper.includes('SEDAN') ? (fareRules.categoryPricingTiers?.['Sedan'] || fareRules.categoryPricingTiers?.['SEDAN CAR']) : undefined) ||
    (catUpper.includes('SUV') ? (fareRules.categoryPricingTiers?.['SUV'] || fareRules.categoryPricingTiers?.['SUV CAR']) : undefined) ||
    (catUpper.includes('FLAT') || catUpper === 'VAN' || (catUpper.includes('VAN') && !catUpper.includes('MINI')) ? (fareRules.categoryPricingTiers?.['Van'] || fareRules.categoryPricingTiers?.['KDH FLAT ROOF']) : undefined) ||
    (catUpper.includes('HIGH') || catUpper.includes('LUXURY')
      ? (fareRules.categoryPricingTiers?.['KDH High Roof'] || fareRules.categoryPricingTiers?.['KDH HIGH ROOF'] || fareRules.categoryPricingTiers?.['Luxury'] || DEFAULT_KDH_HIGH_TIERS)
      : undefined) ||
    (catUpper.includes('MINI CAR') ? (fareRules.categoryPricingTiers?.['Mini Car'] || fareRules.categoryPricingTiers?.['MINI CAR']) : undefined) ||
    (catUpper.includes('MINI VAN') ? (fareRules.categoryPricingTiers?.['Mini Van'] || fareRules.categoryPricingTiers?.['MINI VAN']) : undefined) ||
    vehicle.pricingTiers ||
    DEFAULT_CATEGORY_TIERS[vehicle.category];

  let baseFare = vehicle.baseFare || fareRules.baseFare || 0;
  let distanceCharge = 0;
  let matchedTier: PricingTier | undefined = undefined;
  let tierDescription: string | undefined = undefined;

  // Check matching tier from configured category tiers
  if (categoryTiers && categoryTiers.length > 0) {
    matchedTier = categoryTiers.find((t) => distanceKm >= t.minKm && distanceKm <= t.maxKm) ||
      categoryTiers[categoryTiers.length - 1];
  }

  if (matchedRoute) {
    // Priority 1: Fixed Corridor Package Rate (Prominent Expressway & Airport routes)
    let routePrice = matchedRoute.sedanPrice;

    if (matchedRoute.categoryPrices?.[vehicle.category] && matchedRoute.categoryPrices[vehicle.category] > 0) {
      routePrice = matchedRoute.categoryPrices[vehicle.category];
    } else if (
      catUpper.includes('HIGH ROOF') ||
      catUpper.includes('LUXURY') ||
      vId === 'veh-kdh-high' ||
      vId === 'veh-luxury-exec' ||
      vName.includes('high roof') ||
      vName.includes('high-roof')
    ) {
      routePrice =
        (matchedRoute.luxuryPrice !== undefined && matchedRoute.luxuryPrice > 0)
          ? matchedRoute.luxuryPrice
          : (matchedRoute.categoryPrices?.['KDH High Roof'] ||
             matchedRoute.categoryPrices?.['KDH HIGH ROOF'] ||
             matchedRoute.categoryPrices?.['Luxury'] ||
             Math.round((matchedRoute.vanPrice || Math.round(matchedRoute.sedanPrice * 1.25)) * 1.15));
    } else if (
      catUpper.includes('FLAT ROOF') ||
      catUpper === 'VAN' ||
      vId === 'veh-kdh-flat' ||
      vName.includes('flat roof') ||
      (vName.includes('van') && !vName.includes('mini'))
    ) {
      routePrice =
        matchedRoute.categoryPrices?.['KDH FLAT ROOF'] ||
        matchedRoute.categoryPrices?.['Van'] ||
        (matchedRoute.vanPrice !== undefined && matchedRoute.vanPrice > 0
          ? matchedRoute.vanPrice
          : Math.round(matchedRoute.sedanPrice * 1.25));
    } else if (
      catUpper.includes('SUV') ||
      vId === 'veh-suv-4wd' ||
      vName.includes('suv') ||
      vName.includes('prado') ||
      vName.includes('fortuner')
    ) {
      routePrice =
        (matchedRoute.suvPrice !== undefined && matchedRoute.suvPrice > 0)
          ? matchedRoute.suvPrice
          : (matchedRoute.categoryPrices?.['SUV CAR'] ||
             matchedRoute.categoryPrices?.['SUV'] ||
             Math.round(matchedRoute.sedanPrice * 1.35));
    } else if (catUpper.includes('MINI CAR') || vId === 'veh-mini-car' || vName.includes('mini car') || vName.includes('alto')) {
      routePrice =
        (matchedRoute.miniCarPrice !== undefined && matchedRoute.miniCarPrice > 0)
          ? matchedRoute.miniCarPrice
          : (matchedRoute.categoryPrices?.['Mini Car'] || Math.round(matchedRoute.sedanPrice * 0.85));
    } else if (catUpper.includes('MINI VAN') || catUpper.includes('SHUTTLE') || vId === 'veh-shuttle' || vName.includes('shuttle') || vId === 'mini_van') {
      routePrice =
        (matchedRoute.mini_van !== undefined && matchedRoute.mini_van > 0)
          ? matchedRoute.mini_van
          : (matchedRoute.miniVanPrice !== undefined && matchedRoute.miniVanPrice > 0)
            ? matchedRoute.miniVanPrice
            : (matchedRoute.categoryPrices?.['mini_van'] ||
               matchedRoute.categoryPrices?.['Mini Van'] ||
               matchedRoute.categoryPrices?.['MINI VAN'] ||
               Math.round(matchedRoute.sedanPrice * 1.15));
    } else if (catUpper.includes('LUXURY') || vId === 'veh-luxury-exec' || vName.includes('mercedes') || vName.includes('luxury')) {
      routePrice =
        (matchedRoute.luxuryPrice !== undefined && matchedRoute.luxuryPrice > 0)
          ? matchedRoute.luxuryPrice
          : (matchedRoute.categoryPrices?.['Luxury'] || Math.round(matchedRoute.sedanPrice * 1.85));
    } else {
      routePrice = matchedRoute.sedanPrice;
    }

    distanceCharge = routePrice;
    baseFare = 0; // Fixed route package is all-inclusive
    tierDescription = `Fixed Corridor Package (${matchedRoute.from} ⇄ ${matchedRoute.to})`;
  } else if (matchedTier && (matchedTier.flatPrice > 0 || matchedTier.ratePerKm > 0)) {
    // Priority 2: Configured Category Pricing Tier is ACTIVE and authoritative
    if (matchedTier.type === 'Flat' && matchedTier.flatPrice > 0) {
      distanceCharge = matchedTier.flatPrice;
      baseFare = 0; // Flat price covers the trip
      tierDescription = `${matchedTier.minKm}–${matchedTier.maxKm} KM Flat Rate (${formatLKR(matchedTier.flatPrice)})`;
    } else {
      distanceCharge = Math.round(distanceKm * matchedTier.ratePerKm);
      tierDescription = `${matchedTier.minKm}–${matchedTier.maxKm} KM @ Rs. ${matchedTier.ratePerKm}/km`;
    }
  } else if (vehicle.pricePerKm && vehicle.pricePerKm > 0) {
    // Priority 3: Direct Vehicle Rate per KM from Admin Dashboard Fleet Management
    distanceCharge = Math.round(distanceKm * vehicle.pricePerKm);
    tierDescription = `Vehicle Rate: Rs. ${vehicle.pricePerKm}/km`;
  } else {
    // Fallback: Default global KM rate scaled by category
    const multiplier =
      vehicle.category === 'SUV CAR' ? 1.4 :
      vehicle.category === 'KDH HIGH ROOF' ? 1.35 :
      vehicle.category === 'KDH FLAT ROOF' ? 1.25 : 1.0;
    distanceCharge = Math.round(distanceKm * (fareRules.perKmRate || 240) * multiplier);
  }


  // 4. Night Surcharge (between 23:00 and 05:00) & Stops Charge
  const hour = parseInt(pickupTime.split(':')[0] || '12', 10);
  const isNight = hour >= 23 || hour < 5;
  const subtotal = Math.max(fareRules.minimumFare || 1000, baseFare + distanceCharge);
  const nightCharge = isNight ? Math.round(subtotal * ((fareRules.nightSurchargePercent || 15) / 100)) : 0;
  const stopsCharge = stopsCount * (fareRules.additionalStopCharge || 1000);

  const totalFare = subtotal + nightCharge + stopsCharge;

  return {
    fare: totalFare,
    isFixedRoute: !!matchedRoute,
    routeName: matchedRoute ? `${matchedRoute.from} ⇄ ${matchedRoute.to}` : undefined,
    distanceKm,
    matchedTier,
    tierDescription,
    breakdown: {
      baseFare,
      distanceCharge,
      nightSurcharge: nightCharge,
      additionalStopsCharge: stopsCharge,
      vehicleCategory: vehicle.name,
    },
  };
}
