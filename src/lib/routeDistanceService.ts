/**
 * Galle Taxi - Universal Route & Distance Calculation Service
 * 
 * Provides production-grade route distance and duration calculations:
 * 1. Checks configured fixed-route packages first (e.g., Airport ⇄ Galle Fort).
 * 2. Queries Google Maps DirectionsService when available in browser.
 * 3. Fallback to coordinate-based Haversine with Sri Lankan road network winding factor
 *    (covers all 25 districts, bus terminals, airports, towns, hotels, and attractions).
 * 4. In-memory caching to eliminate redundant network/API hits and prevent quota exhaustion.
 */

import { LocationItem, SRI_LANKA_CURATED_LOCATIONS, calculateLocationDistance } from './locationService';
import { FareRules, FixedRoute } from '../types';

export interface RouteDistanceResult {
  distanceKm: number;
  durationText: string;
  source: 'fixed_route' | 'google_directions' | 'curated_coordinates' | 'osm_geocoding' | 'fallback';
  isFixedRoute: boolean;
  matchedRoute?: FixedRoute;
  isValid: boolean;
  error?: string;
}

// In-memory cache for route calculations
const routeCache = new Map<string, RouteDistanceResult>();

export function clearRouteCache(): void {
  routeCache.clear();
}

if (typeof window !== 'undefined') {
  window.addEventListener('galle_taxi_fare_rules_updated', () => {
    routeCache.clear();
  });
}

/**
 * Normalizes location strings for comparison and caching
 */
function normalizeLocKey(loc: string): string {
  return loc.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Finds matching curated location with exact coordinates
 */
export function findMatchingCuratedLocation(query: string): LocationItem | undefined {
  if (!query || query.trim().length < 2) return undefined;
  const q = query.toLowerCase().trim();

  // 1. Direct or strong name match
  const directMatch = SRI_LANKA_CURATED_LOCATIONS.find((item) => {
    const itemLower = item.name.toLowerCase();
    const secLower = (item.secondary || '').toLowerCase();
    return itemLower === q || q.includes(itemLower) || itemLower.includes(q) || secLower.includes(q);
  });
  if (directMatch) return directMatch;

  // 2. Token keyword matching
  const tokens = q.split(/[\s,/-]+/).filter((t) => t.length > 2);
  const matched = SRI_LANKA_CURATED_LOCATIONS.find((item) => {
    const target = `${item.name} ${item.secondary || ''} ${item.category}`.toLowerCase();
    return tokens.some((token) => target.includes(token));
  });

  return matched;
}

/**
 * Checks if two location strings match a fixed route hub
 */
function isHubMatch(input: string, hub: string): boolean {
  const norm = input.toLowerCase();
  const hubNorm = hub.toLowerCase();

  if (norm.includes(hubNorm) || hubNorm.includes(norm)) return true;

  // Airport aliases
  const isInputAirport = norm.includes('airport') || norm.includes('cmb') || norm.includes('katunayake') || norm.includes('bandaranaike');
  const isHubAirport = hubNorm.includes('airport') || hubNorm.includes('cmb') || hubNorm.includes('katunayake') || hubNorm.includes('bandaranaike');
  if (isInputAirport && isHubAirport) return true;

  // Galle
  const isInputGalle = norm.includes('galle') || norm.includes('amangalla') || norm.includes('fort bazaar');
  const isHubGalle = hubNorm.includes('galle');
  if (isInputGalle && isHubGalle) return true;

  // Colombo
  const isInputColombo = (norm.includes('colombo') && !isInputAirport) || norm.includes('fort railway');
  const isHubColombo = hubNorm.includes('colombo') && !isHubAirport;
  if (isInputColombo && isHubColombo) return true;

  // Negombo (Distinct from Colombo Airport)
  const isInputNegombo = norm.includes('negombo');
  const isHubNegombo = hubNorm.includes('negombo');
  if (isInputNegombo && isHubNegombo) return true;

  // Mirissa / Weligama
  const isInputMirissa = norm.includes('mirissa') || norm.includes('weligama');
  const isHubMirissa = hubNorm.includes('mirissa') || hubNorm.includes('weligama');
  if (isInputMirissa && isHubMirissa) return true;

  // Ella
  const isInputElla = norm.includes('ella') || norm.includes('demodara');
  const isHubElla = hubNorm.includes('ella') || hubNorm.includes('demodara');
  if (isInputElla && isHubElla) return true;

  // Sigiriya
  const isInputSigiriya = norm.includes('sigiriya') || norm.includes('pidurangala');
  const isHubSigiriya = hubNorm.includes('sigiriya') || hubNorm.includes('pidurangala');
  if (isInputSigiriya && isHubSigiriya) return true;

  // Anuradhapura
  const isInputAnuradhapura = norm.includes('anuradhapura') || norm.includes('ruwanwelisaya');
  const isHubAnuradhapura = hubNorm.includes('anuradhapura');
  if (isInputAnuradhapura && isHubAnuradhapura) return true;

  return false;
}

/**
 * Calculates authoritative driving distance and duration for any pickup and destination.
 */
export async function calculateRouteDistance(
  pickup: string,
  destination: string,
  fareRules?: FareRules
): Promise<RouteDistanceResult> {
  const pTrim = pickup?.trim() || '';
  const dTrim = destination?.trim() || '';

  // Validation: both locations must be provided and have minimum length
  if (!pTrim || pTrim.length < 3 || !dTrim || dTrim.length < 3) {
    return {
      distanceKm: 0,
      durationText: '',
      source: 'fallback',
      isFixedRoute: false,
      isValid: false,
      error: 'Please enter both pickup and destination locations.',
    };
  }

  // Check cache
  const cacheKey = `${normalizeLocKey(pTrim)}:::${normalizeLocKey(dTrim)}`;
  if (routeCache.has(cacheKey)) {
    return routeCache.get(cacheKey)!;
  }

  // Step 1: Check Fixed Route packages if fareRules provided
  if (fareRules?.fixedRoutes && fareRules.fixedRoutes.length > 0) {
    const matched = fareRules.fixedRoutes.find((r) => {
      const forwardMatch = isHubMatch(pTrim, r.from) && isHubMatch(dTrim, r.to);
      const returnMatch = isHubMatch(pTrim, r.to) && isHubMatch(dTrim, r.from);
      return forwardMatch || returnMatch;
    });

    if (matched && matched.estimatedDistanceKm > 0) {
      const result: RouteDistanceResult = {
        distanceKm: matched.estimatedDistanceKm,
        durationText: matched.estimatedDuration || `${Math.round(matched.estimatedDistanceKm / 60)}h`,
        source: 'fixed_route',
        isFixedRoute: true,
        matchedRoute: matched,
        isValid: true,
      };
      routeCache.set(cacheKey, result);
      return result;
    }
  }

  // Step 2: Modern Google Routes API (computeRoutes) - avoids legacy DirectionsService errors
  const apiKey =
    (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY) ||
    'AIzaSyCHHstHxGGV9a3B47K6Mj7U71qOmmkJ79A';

  if (apiKey && typeof fetch !== 'undefined') {
    try {
      const originFormatted = pTrim.toLowerCase().includes('sri lanka') ? pTrim : `${pTrim}, Sri Lanka`;
      const destFormatted = dTrim.toLowerCase().includes('sri lanka') ? dTrim : `${dTrim}, Sri Lanka`;

      const routesController = new AbortController();
      const timeoutId = setTimeout(() => routesController.abort(), 2800);

      const routesResponse = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters',
        },
        body: JSON.stringify({
          origin: { address: originFormatted },
          destination: { address: destFormatted },
          travelMode: 'DRIVE',
        }),
        signal: routesController.signal,
      });

      clearTimeout(timeoutId);

      if (routesResponse.ok) {
        const routesData = await routesResponse.json();
        const route = routesData?.routes?.[0];
        if (route?.distanceMeters && route.distanceMeters > 0) {
          const km = Math.max(3, Math.round(route.distanceMeters / 1000));
          const durSec = parseInt(route.duration?.replace('s', '') || '0', 10);
          const hours = Math.floor(durSec / 3600);
          const mins = Math.round((durSec % 3600) / 60);
          const durText = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins} mins`;

          const result: RouteDistanceResult = {
            distanceKm: km,
            durationText: durText || `${Math.round(km / 50)}h`,
            source: 'google_directions',
            isFixedRoute: false,
            isValid: true,
          };
          routeCache.set(cacheKey, result);
          return result;
        }
      }
    } catch {
      // Gracefully continue to coordinate and GIS fallback without console spam
    }
  }

  // Step 3: Resolve coordinates from Curated Sri Lanka Master Locations
  const pCurated = findMatchingCuratedLocation(pTrim);
  const dCurated = findMatchingCuratedLocation(dTrim);

  let pLat = pCurated?.lat;
  let pLng = pCurated?.lng;
  let dLat = dCurated?.lat;
  let dLng = dCurated?.lng;

  // Step 4: If coordinates missing for either, resolve via OpenStreetMap / Nominatim geocoding
  if ((!pLat || !pLng || !dLat || !dLng) && typeof fetch !== 'undefined') {
    try {
      const geocodeLocation = async (query: string): Promise<{ lat: number; lng: number } | null> => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              query
            )}&countrycodes=lk&limit=1`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data[0]?.lat && data[0]?.lon) {
              return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
            }
          }
        } catch {
          clearTimeout(timeoutId);
        }
        return null;
      };

      if (!pLat || !pLng) {
        const pGeo = await geocodeLocation(pTrim);
        if (pGeo) {
          pLat = pGeo.lat;
          pLng = pGeo.lng;
        }
      }

      if (!dLat || !dLng) {
        const dGeo = await geocodeLocation(dTrim);
        if (dGeo) {
          dLat = dGeo.lat;
          dLng = dGeo.lng;
        }
      }
    } catch {
      // Fall through to fallback
    }
  }

  // Step 5: If both coordinates are resolved, calculate driving distance with realistic terrain factor
  if (pLat && pLng && dLat && dLng) {
    const locDistance = calculateLocationDistance(
      { lat: pLat, lng: pLng, name: pTrim },
      { lat: dLat, lng: dLng, name: dTrim }
    );

    const result: RouteDistanceResult = {
      distanceKm: locDistance.distanceKm,
      durationText: locDistance.durationText,
      source: pCurated && dCurated ? 'curated_coordinates' : 'osm_geocoding',
      isFixedRoute: false,
      isValid: true,
    };
    routeCache.set(cacheKey, result);
    return result;
  }

  // Step 6: Name-based heuristic fallback from locationService
  const fallbackCalc = calculateLocationDistance({ name: pTrim }, { name: dTrim });
  const result: RouteDistanceResult = {
    distanceKm: fallbackCalc.distanceKm,
    durationText: fallbackCalc.durationText,
    source: 'fallback',
    isFixedRoute: false,
    isValid: true,
  };
  routeCache.set(cacheKey, result);
  return result;
}
