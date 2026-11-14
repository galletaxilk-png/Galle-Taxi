import { Vehicle } from '../types';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  'mini car': '/assets/images/regenerated_image_1793161723258.webp',
  sedan: '/assets/images/regenerated_image_1793163512211.webp',
  'sedan car': '/assets/images/regenerated_image_1793163512211.webp',
  suv: '/assets/images/regenerated_image_1793464744920.webp',
  'suv car': '/assets/images/regenerated_image_1793464744920.webp',
  'kdh flat roof': '/assets/images/vehicle_premium_van_1793121943671.webp',
  van: '/assets/images/vehicle_premium_van_1793121943671.webp',
  'kdh high roof': '/assets/images/regenerated_image_1793464621511.webp',
  'mini van': '/assets/images/regenerated_image_1793465213680.webp',
  shuttle: '/assets/images/regenerated_image_1793465213680.webp',
  luxury: '/assets/images/vehicle_luxury_sedan_1793121944773.webp',
};

const DEFAULT_FALLBACK_VEHICLE_IMAGE = '/assets/images/regenerated_image_1793163512211.webp';

/**
 * Resolves a reliable fallback vehicle image based on category, ID, or name
 * without mixing up sedans, SUVs, and high-roof/flat-roof vans.
 */
export function getCategoryFallbackImage(category?: string, id?: string, name?: string): string {
  const catLower = (category || '').trim().toLowerCase();
  const idLower = (id || '').trim().toLowerCase();
  const nameLower = (name || '').trim().toLowerCase();

  if (CATEGORY_FALLBACK_IMAGES[catLower]) {
    return CATEGORY_FALLBACK_IMAGES[catLower];
  }

  if (idLower === 'veh-mini-car' || catLower.includes('mini car') || nameLower.includes('mini car') || nameLower.includes('alto') || nameLower.includes('wagon')) {
    return CATEGORY_FALLBACK_IMAGES['mini car'];
  }
  if (idLower === 'veh-shuttle' || catLower.includes('mini van') || catLower.includes('shuttle') || nameLower.includes('shuttle')) {
    return CATEGORY_FALLBACK_IMAGES['mini van'];
  }
  if (idLower === 'veh-kdh-high' || catLower.includes('high roof') || nameLower.includes('high roof') || nameLower.includes('high-roof')) {
    return CATEGORY_FALLBACK_IMAGES['kdh high roof'];
  }
  if (idLower === 'veh-kdh-flat' || catLower.includes('flat roof') || catLower.includes('van') || nameLower.includes('kdh') || nameLower.includes('hiace')) {
    return CATEGORY_FALLBACK_IMAGES['kdh flat roof'];
  }
  if (idLower === 'veh-suv-4wd' || catLower.includes('suv') || nameLower.includes('suv') || nameLower.includes('prado') || nameLower.includes('fortuner')) {
    return CATEGORY_FALLBACK_IMAGES['suv car'];
  }
  if (idLower === 'veh-luxury-exec' || catLower.includes('luxury') || nameLower.includes('mercedes') || nameLower.includes('luxury')) {
    return CATEGORY_FALLBACK_IMAGES['luxury'];
  }

  return DEFAULT_FALLBACK_VEHICLE_IMAGE;
}

/**
 * Normalizes stored vehicle image URLs and corrects known broken/mismatched legacy defaults.
 */
export function normalizeVehicleImageUrl(
  url?: string,
  category?: string,
  id?: string,
  name?: string
): string {
  const fallback = getCategoryFallbackImage(category, id, name);
  if (!url || typeof url !== 'string') return fallback;

  let trimmed = url.trim();
  if (!trimmed) return fallback;

  if (trimmed.startsWith('/src/assets/images/')) {
    trimmed = trimmed.replace('/src/assets/images/', '/assets/images/');
  }

  // Fix legacy bug where KDH High Roof van (veh-kdh-high) pointed to the black Mercedes sedan photo
  const idLower = (id || '').toLowerCase();
  const catLower = (category || '').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  if (
    trimmed.includes('vehicle_luxury_sedan_1793121944773') &&
    (idLower === 'veh-kdh-high' || catLower.includes('high roof') || nameLower.includes('high roof') || nameLower.includes('high-roof'))
  ) {
    return CATEGORY_FALLBACK_IMAGES['kdh high roof'];
  }

  return trimmed;
}

/**
 * Safely normalizes a Vehicle record from Firestore, localStorage, or API
 * while strictly preserving admin-configured names, categories, ordering, and visibility.
 */
export function normalizeVehicleRecord(raw: Partial<Vehicle> & { id: string }): Vehicle {
  const name = (raw.name || 'Private Vehicle').trim();
  const category = (raw.category || 'Sedan').trim();

  return {
    ...raw,
    id: raw.id,
    name,
    category,
    plateNumber: raw.plateNumber || 'SP CAR-2026',
    passengers: typeof raw.passengers === 'number' && !Number.isNaN(raw.passengers) ? raw.passengers : 4,
    luggage: typeof raw.luggage === 'number' && !Number.isNaN(raw.luggage) ? raw.luggage : 3,
    handLuggage: typeof raw.handLuggage === 'number' && !Number.isNaN(raw.handLuggage) ? raw.handLuggage : 2,
    description: raw.description || `${name} with professional English-speaking chauffeur.`,
    pricePerKm: typeof raw.pricePerKm === 'number' && !Number.isNaN(raw.pricePerKm) ? raw.pricePerKm : 240,
    baseFare: typeof raw.baseFare === 'number' && !Number.isNaN(raw.baseFare) ? raw.baseFare : 1500,
    imageUrl: normalizeVehicleImageUrl(raw.imageUrl, category, raw.id, name),
    isAvailable: raw.isAvailable !== false,
    hideCard: Boolean(raw.hideCard),
    isFeatured: Boolean(raw.isFeatured),
    isDefaultSelected: Boolean(raw.isDefaultSelected),
    displayOrder: typeof raw.displayOrder === 'number' && !Number.isNaN(raw.displayOrder) ? raw.displayOrder : 999,
    features: Array.isArray(raw.features) && raw.features.length > 0 ? raw.features : ['Fully Air-Conditioned', 'Luggage Space'],
  };
}

/**
 * Sorts vehicles deterministically by Admin displayOrder (then name).
 */
export function sortVehiclesByDisplayOrder(list: Vehicle[]): Vehicle[] {
  return [...list].sort((a, b) => {
    const orderDiff = (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
    if (orderDiff !== 0) return orderDiff;
    return (a.name || '').localeCompare(b.name || '');
  });
}

/**
 * Returns the canonical public fleet list: active (isAvailable !== false),
 * visible (!hideCard), normalized, and sorted by Admin displayOrder.
 */
export function getActivePublicVehicles(list: Vehicle[]): Vehicle[] {
  if (!Array.isArray(list) || list.length === 0) return [];
  const normalized = list.map((v) => normalizeVehicleRecord(v));
  const activeVisible = normalized.filter((v) => v.isAvailable !== false && !v.hideCard);
  if (activeVisible.length > 0) {
    return sortVehiclesByDisplayOrder(activeVisible);
  }
  const activeAny = normalized.filter((v) => v.isAvailable !== false);
  if (activeAny.length > 0) {
    return sortVehiclesByDisplayOrder(activeAny);
  }
  return sortVehiclesByDisplayOrder(normalized);
}
