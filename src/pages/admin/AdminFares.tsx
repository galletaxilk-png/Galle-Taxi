/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  DollarSign,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Calculator,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Layers,
  Car,
  HelpCircle,
  TrendingUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { FareRules, FixedRoute, PricingTier, PricingTierType } from '../../types';
import { formatLKR, calculateAuthoritativeFare } from '../../lib/fareEngine';
import {
  DEFAULT_CATEGORY_TIERS,
  DEFAULT_SEDAN_TIERS,
  DEFAULT_SUV_TIERS,
  DEFAULT_VAN_TIERS,
  DEFAULT_KDH_HIGH_TIERS,
} from '../../lib/initialData';

export const AdminFares: React.FC = () => {
  const { fareRules, vehicles, updateFareRules, updateVehicle } = useApp();

  // Global Fare Parameters State
  const [baseFare, setBaseFare] = useState(fareRules.baseFare);
  const [perKmRate, setPerKmRate] = useState(fareRules.perKmRate);
  const [minimumFare, setMinimumFare] = useState(fareRules.minimumFare);
  const [waitingPerHour, setWaitingPerHour] = useState(fareRules.waitingPerHour);
  const [nightSurchargePercent, setNightSurchargePercent] = useState(fareRules.nightSurchargePercent);
  const [additionalStopCharge, setAdditionalStopCharge] = useState(fareRules.additionalStopCharge);
  const [fixedRoutes, setFixedRoutes] = useState<FixedRoute[]>(fareRules.fixedRoutes);

  // Vehicle Category Pricing Tiers State
  const [activeCategory, setActiveCategory] = useState<string>('Sedan');
  const [categoryTiers, setCategoryTiers] = useState<Record<string, PricingTier[]>>(() => {
    return fareRules.categoryPricingTiers && Object.keys(fareRules.categoryPricingTiers).length > 0
      ? fareRules.categoryPricingTiers
      : DEFAULT_CATEGORY_TIERS;
  });

  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Helper to reliably retrieve tiers for any category and its aliases
  const getCategoryTiersFor = (
    cat: string,
    source: Record<string, PricingTier[]> = categoryTiers
  ): PricingTier[] => {
    if (source[cat] && source[cat].length > 0) return source[cat];
    const catNorm = cat.toUpperCase();
    if (catNorm.includes('SEDAN')) return source['SEDAN CAR'] || source['Sedan'] || DEFAULT_SEDAN_TIERS;
    if (catNorm.includes('SUV')) return source['SUV CAR'] || source['SUV'] || DEFAULT_SUV_TIERS;
    if (catNorm.includes('FLAT') || catNorm === 'VAN') return source['KDH FLAT ROOF'] || source['Van'] || DEFAULT_VAN_TIERS;
    if (catNorm.includes('HIGH') || catNorm.includes('LUXURY')) return source['KDH HIGH ROOF'] || source['KDH High Roof'] || source['Luxury'] || DEFAULT_KDH_HIGH_TIERS;
    if (catNorm.includes('MINI CAR')) return source['Mini Car'] || source['MINI CAR'] || DEFAULT_CATEGORY_TIERS['Mini Car'];
    if (catNorm.includes('MINI VAN')) return source['Mini Van'] || source['MINI VAN'] || DEFAULT_CATEGORY_TIERS['Mini Van'];
    return source[cat] || DEFAULT_SEDAN_TIERS;
  };

  // Current active category tiers array
  const currentTiers = getCategoryTiersFor(activeCategory, categoryTiers);

  // Live Simulator State
  const [simPickup, setSimPickup] = useState('Colombo Airport');
  const [simDestination, setSimDestination] = useState('Galle');
  const [simVehicleId, setSimVehicleId] = useState(vehicles[0]?.id || 'veh-sedan-std');
  const [simTime, setSimTime] = useState('14:00');
  const [simStops, setSimStops] = useState(0);
  const [testCustomKm, setTestCustomKm] = useState<number>(75);

  const currentRules: FareRules = {
    baseFare,
    perKmRate,
    minimumFare,
    waitingPerHour,
    nightSurchargePercent,
    additionalStopCharge,
    fixedRoutes,
    categoryPricingTiers: categoryTiers,
  };

  // Synchronized vehicles for simulation
  const syncedVehicles = vehicles.map((v) => ({
    ...v,
    pricingTiers: getCategoryTiersFor(v.category, categoryTiers) || v.pricingTiers || DEFAULT_SEDAN_TIERS,
  }));

  const simResult = calculateAuthoritativeFare({
    pickup: simPickup,
    destination: simDestination,
    vehicleCategoryId: simVehicleId,
    pickupTime: simTime,
    stopsCount: simStops,
    vehicles: syncedVehicles,
    fareRules: currentRules,
  });

  // Keep categoryTiers & fixedRoutes in sync if fareRules update from store/Firestore (only when not actively editing)
  React.useEffect(() => {
    if (!hasUnsavedChanges && fareRules.categoryPricingTiers && Object.keys(fareRules.categoryPricingTiers).length > 0) {
      setCategoryTiers(fareRules.categoryPricingTiers);
    }
    if (fareRules.fixedRoutes && fareRules.fixedRoutes.length > 0) {
      setFixedRoutes(fareRules.fixedRoutes);
    }
  }, [fareRules.categoryPricingTiers, fareRules.fixedRoutes, hasUnsavedChanges]);

  // Comprehensive alias normalizer ensuring all variants are updated synchronously
  const synchronizeAllTierAliases = (
    source: Record<string, PricingTier[]>,
    changedCategory?: string
  ): Record<string, PricingTier[]> => {
    const result: Record<string, PricingTier[]> = { ...source };

    // 1. Sedan Family
    const sedanTiers =
      (changedCategory === 'Sedan' ? source['Sedan'] : undefined) ||
      (changedCategory === 'SEDAN CAR' ? source['SEDAN CAR'] : undefined) ||
      source['Sedan'] ||
      source['SEDAN CAR'] ||
      DEFAULT_SEDAN_TIERS;
    result['Sedan'] = sedanTiers;
    result['SEDAN CAR'] = sedanTiers;

    // 2. SUV Family
    const suvTiers =
      (changedCategory === 'SUV' ? source['SUV'] : undefined) ||
      (changedCategory === 'SUV CAR' ? source['SUV CAR'] : undefined) ||
      source['SUV'] ||
      source['SUV CAR'] ||
      DEFAULT_SUV_TIERS;
    result['SUV'] = suvTiers;
    result['SUV CAR'] = suvTiers;

    // 3. Van Family (matches 'Van', 'KDH FLAT ROOF')
    const vanTiers =
      (changedCategory === 'Van' ? source['Van'] : undefined) ||
      (changedCategory === 'KDH FLAT ROOF' ? source['KDH FLAT ROOF'] : undefined) ||
      source['Van'] ||
      source['KDH FLAT ROOF'] ||
      DEFAULT_VAN_TIERS;
    result['Van'] = vanTiers;
    result['KDH FLAT ROOF'] = vanTiers;

    // 4. KDH High Roof Family (matches 'KDH High Roof', 'KDH HIGH ROOF', 'Luxury')
    const kdhHighTiers =
      (changedCategory === 'KDH High Roof' ? source['KDH High Roof'] : undefined) ||
      (changedCategory === 'KDH HIGH ROOF' ? source['KDH HIGH ROOF'] : undefined) ||
      (changedCategory === 'Luxury' ? source['Luxury'] : undefined) ||
      source['KDH High Roof'] ||
      source['KDH HIGH ROOF'] ||
      source['Luxury'] ||
      DEFAULT_KDH_HIGH_TIERS;
    result['KDH High Roof'] = kdhHighTiers;
    result['KDH HIGH ROOF'] = kdhHighTiers;
    result['Luxury'] = kdhHighTiers;

    // 5. Mini Car
    const miniCarTiers =
      (changedCategory === 'Mini Car' ? source['Mini Car'] : undefined) ||
      source['Mini Car'] ||
      source['MINI CAR'] ||
      DEFAULT_CATEGORY_TIERS['Mini Car'];
    result['Mini Car'] = miniCarTiers;
    result['MINI CAR'] = miniCarTiers;

    // 6. Mini Van
    const miniVanTiers =
      (changedCategory === 'Mini Van' ? source['Mini Van'] : undefined) ||
      source['Mini Van'] ||
      source['MINI VAN'] ||
      DEFAULT_CATEGORY_TIERS['Mini Van'];
    result['Mini Van'] = miniVanTiers;
    result['MINI VAN'] = miniVanTiers;

    return result;
  };

  // Real-time synchronization helper for Category Pricing Tiers
  const saveAndApplyCategoryTiers = async (
    nextTiers: Record<string, PricingTier[]>,
    categoryToSync?: string
  ) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      const targetCat = categoryToSync || activeCategory;
      const synchronizedTiers = synchronizeAllTierAliases(nextTiers, targetCat);
      setCategoryTiers(synchronizedTiers);

      const updatedRules: FareRules = {
        baseFare,
        perKmRate,
        minimumFare,
        waitingPerHour,
        nightSurchargePercent,
        additionalStopCharge,
        fixedRoutes,
        categoryPricingTiers: synchronizedTiers,
      };

      await updateFareRules(updatedRules);

      // Update vehicles state with their respective synchronized tiers
      for (const v of vehicles) {
        const catNorm = (v.category || '').toUpperCase();
        let tiers: PricingTier[] | undefined = undefined;
        if (catNorm.includes('SEDAN')) tiers = synchronizedTiers['SEDAN CAR'] || synchronizedTiers['Sedan'];
        else if (catNorm.includes('SUV')) tiers = synchronizedTiers['SUV CAR'] || synchronizedTiers['SUV'];
        else if (catNorm.includes('FLAT') || catNorm === 'VAN') tiers = synchronizedTiers['KDH FLAT ROOF'] || synchronizedTiers['Van'];
        else if (catNorm.includes('HIGH') || catNorm.includes('LUXURY')) tiers = synchronizedTiers['KDH HIGH ROOF'] || synchronizedTiers['KDH High Roof'] || synchronizedTiers['Luxury'];
        else if (catNorm.includes('MINI CAR')) tiers = synchronizedTiers['Mini Car'] || synchronizedTiers['MINI CAR'];
        else if (catNorm.includes('MINI VAN')) tiers = synchronizedTiers['Mini Van'] || synchronizedTiers['MINI VAN'];
        else tiers = synchronizedTiers[v.category];

        if (tiers && tiers.length > 0) {
          const isChanged = JSON.stringify(v.pricingTiers) !== JSON.stringify(tiers);
          if (isChanged) {
            await updateVehicle({
              ...v,
              pricingTiers: tiers,
            });
          }
        }
      }

      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_fare_rules_updated', { detail: updatedRules }));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setSaveMessage(`Pricing rates for "${targetCat}" category saved successfully to Firebase & live website!`);
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveMessage(null);
      }, 4500);
    } catch (err: any) {
      console.error('Failed to save category pricing tiers:', err);
      setSaveError(err?.message || 'Failed to save rates to Firebase. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Tier Mutation Handlers
  const handleAddTier = async () => {
    const lastTier = currentTiers[currentTiers.length - 1];
    const newMin = lastTier ? lastTier.maxKm : 0;
    const newMax = newMin + 50;

    const newTier: PricingTier = {
      id: `tier-${Date.now()}`,
      minKm: newMin,
      maxKm: newMax,
      type: 'Per KM',
      flatPrice: 0,
      ratePerKm: 250,
    };

    const nextList = [...currentTiers, newTier];
    const next = {
      ...categoryTiers,
      [activeCategory]: nextList,
    };
    const synchronized = synchronizeAllTierAliases(next, activeCategory);
    setCategoryTiers(synchronized);
    await saveAndApplyCategoryTiers(synchronized, activeCategory);
  };

  const handleUpdateTierField = (
    index: number,
    field: keyof PricingTier,
    value: any
  ) => {
    const list = [...currentTiers];
    const updated = { ...list[index], [field]: value };

    // If switching to Flat, reset ratePerKm or set reasonable flat
    if (field === 'type') {
      if (value === 'Flat') {
        updated.ratePerKm = 0;
        if (updated.flatPrice === 0) updated.flatPrice = 12000;
      } else {
        updated.flatPrice = 0;
        if (updated.ratePerKm === 0) updated.ratePerKm = 280;
      }
    }

    list[index] = updated;
    const next = {
      ...categoryTiers,
      [activeCategory]: list,
    };
    const synchronized = synchronizeAllTierAliases(next, activeCategory);
    setCategoryTiers(synchronized);
    setHasUnsavedChanges(true);
  };

  const handleDeleteTier = async (index: number) => {
    const nextList = [...currentTiers];
    nextList.splice(index, 1);
    const next = {
      ...categoryTiers,
      [activeCategory]: nextList,
    };
    const synchronized = synchronizeAllTierAliases(next, activeCategory);
    setCategoryTiers(synchronized);
    await saveAndApplyCategoryTiers(synchronized, activeCategory);
  };

  const handleLoadScreenshotTemplate = async () => {
    const templateTiers: PricingTier[] = [
      { id: `tier-tpl-1-${Date.now()}`, minKm: 0, maxKm: 20, type: 'Flat', flatPrice: 12000, ratePerKm: 0 },
      { id: `tier-tpl-2-${Date.now()}`, minKm: 20, maxKm: 40, type: 'Flat', flatPrice: 15000, ratePerKm: 0 },
      { id: `tier-tpl-3-${Date.now()}`, minKm: 40, maxKm: 100, type: 'Per KM', flatPrice: 0, ratePerKm: 300 },
      { id: `tier-tpl-4-${Date.now()}`, minKm: 100, maxKm: 140, type: 'Per KM', flatPrice: 0, ratePerKm: 280 },
      { id: `tier-tpl-5-${Date.now()}`, minKm: 140, maxKm: 200, type: 'Per KM', flatPrice: 0, ratePerKm: 250 },
      { id: `tier-tpl-6-${Date.now()}`, minKm: 200, maxKm: 9999, type: 'Per KM', flatPrice: 0, ratePerKm: 230 },
    ];
    const next = {
      ...categoryTiers,
      [activeCategory]: templateTiers,
    };
    const synchronized = synchronizeAllTierAliases(next, activeCategory);
    setCategoryTiers(synchronized);
    await saveAndApplyCategoryTiers(synchronized, activeCategory);
  };

  const handleCopyTiersToAllCategories = async () => {
    const sourceTiers = currentTiers;
    const updated: Record<string, PricingTier[]> = {
      Sedan: sourceTiers.map((t) => ({ ...t, id: `tier-s-${Math.random().toString(36).slice(2, 7)}` })),
      'SEDAN CAR': sourceTiers.map((t) => ({ ...t, id: `tier-sc-${Math.random().toString(36).slice(2, 7)}` })),
      Van: sourceTiers.map((t) => ({
        ...t,
        id: `tier-v-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.3) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.25) : 0,
      })),
      'KDH FLAT ROOF': sourceTiers.map((t) => ({
        ...t,
        id: `tier-kf-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.3) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.25) : 0,
      })),
      SUV: sourceTiers.map((t) => ({
        ...t,
        id: `tier-suv-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.4) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.35) : 0,
      })),
      'SUV CAR': sourceTiers.map((t) => ({
        ...t,
        id: `tier-suvc-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.4) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.35) : 0,
      })),
      'KDH High Roof': sourceTiers.map((t) => ({
        ...t,
        id: `tier-lux-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.8) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.7) : 0,
      })),
      'KDH HIGH ROOF': sourceTiers.map((t) => ({
        ...t,
        id: `tier-luxh-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.8) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.7) : 0,
      })),
      Luxury: sourceTiers.map((t) => ({
        ...t,
        id: `tier-luxx-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.8) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.7) : 0,
      })),
      'Mini Car': sourceTiers.map((t) => ({
        ...t,
        id: `tier-mc-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 0.85) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 0.85) : 0,
      })),
      'Mini Van': sourceTiers.map((t) => ({
        ...t,
        id: `tier-mv-${Math.random().toString(36).slice(2, 7)}`,
        flatPrice: t.flatPrice ? Math.round(t.flatPrice * 1.15) : 0,
        ratePerKm: t.ratePerKm ? Math.round(t.ratePerKm * 1.15) : 0,
      })),
    };
    setCategoryTiers(updated);
    await saveAndApplyCategoryTiers(updated, activeCategory);
  };

  // Real-time synchronization helper for Fixed Corridor Rates
  const saveAndApplyFixedRoutes = async (updatedRoutes: FixedRoute[]) => {
    setFixedRoutes(updatedRoutes);

    const updatedRules: FareRules = {
      baseFare,
      perKmRate,
      minimumFare,
      waitingPerHour,
      nightSurchargePercent,
      additionalStopCharge,
      fixedRoutes: updatedRoutes,
      categoryPricingTiers: categoryTiers,
    };
    await updateFareRules(updatedRules);

    try {
      window.dispatchEvent(new CustomEvent('galle_taxi_fare_rules_updated', { detail: updatedRules }));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // Fixed Routes Handlers
  const handleAddFixedRoute = () => {
    const newRoute: FixedRoute = {
      id: `route-${Date.now()}`,
      from: 'Galle Fort',
      to: 'New Destination',
      miniCarPrice: 12500,
      sedanPrice: 15000,
      vanPrice: 22000,
      mini_van: 18000,
      miniVanPrice: 18000,
      suvPrice: 20000,
      luxuryPrice: 32000,
      estimatedDistanceKm: 60,
      estimatedDuration: '1 hour 15 mins',
      description: 'Standard expressway transfer including tolls',
    };
    const next = [newRoute, ...fixedRoutes];
    setFixedRoutes(next);
    saveAndApplyFixedRoutes(next);
  };

  const updateRouteField = (index: number, field: keyof FixedRoute, val: any) => {
    const next = [...fixedRoutes];
    const updated: FixedRoute = { ...next[index], [field]: val };
    if (field === 'mini_van' || field === 'miniVanPrice') {
      updated.mini_van = val;
      updated.miniVanPrice = val;
      updated.categoryPrices = {
        ...(updated.categoryPrices || {}),
        mini_van: val,
        'Mini Van': val,
        'MINI VAN': val,
      };
    }
    next[index] = updated;
    setFixedRoutes(next);
    saveAndApplyFixedRoutes(next);
  };

  const deleteRoute = (id: string) => {
    const next = fixedRoutes.filter((r) => r.id !== id);
    setFixedRoutes(next);
    saveAndApplyFixedRoutes(next);
  };

  // Save All Changes to Server & Fleet State
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      const synchronizedTiers = synchronizeAllTierAliases(categoryTiers, activeCategory);
      setCategoryTiers(synchronizedTiers);

      const updatedRules: FareRules = {
        baseFare,
        perKmRate,
        minimumFare,
        waitingPerHour,
        nightSurchargePercent,
        additionalStopCharge,
        fixedRoutes,
        categoryPricingTiers: synchronizedTiers,
      };
      await updateFareRules(updatedRules);

      // Update vehicles state with their respective synchronized tiers
      for (const v of vehicles) {
        const catNorm = (v.category || '').toUpperCase();
        let tiers: PricingTier[] | undefined = undefined;
        if (catNorm.includes('SEDAN')) tiers = synchronizedTiers['SEDAN CAR'] || synchronizedTiers['Sedan'];
        else if (catNorm.includes('SUV')) tiers = synchronizedTiers['SUV CAR'] || synchronizedTiers['SUV'];
        else if (catNorm.includes('FLAT') || catNorm === 'VAN') tiers = synchronizedTiers['KDH FLAT ROOF'] || synchronizedTiers['Van'];
        else if (catNorm.includes('HIGH') || catNorm.includes('LUXURY')) tiers = synchronizedTiers['KDH HIGH ROOF'] || synchronizedTiers['KDH High Roof'] || synchronizedTiers['Luxury'];
        else if (catNorm.includes('MINI CAR')) tiers = synchronizedTiers['Mini Car'] || synchronizedTiers['MINI CAR'];
        else if (catNorm.includes('MINI VAN')) tiers = synchronizedTiers['Mini Van'] || synchronizedTiers['MINI VAN'];
        else tiers = synchronizedTiers[v.category];

        if (tiers && tiers.length > 0) {
          const isChanged = JSON.stringify(v.pricingTiers) !== JSON.stringify(tiers);
          if (isChanged) {
            await updateVehicle({
              ...v,
              pricingTiers: tiers,
            });
          }
        }
      }

      try {
        window.dispatchEvent(new CustomEvent('galle_taxi_fare_rules_updated', { detail: updatedRules }));
        window.dispatchEvent(new Event('storage'));
      } catch {}

      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setSaveMessage('All Vehicle Category Pricing Tiers & Fare Rules saved to Firebase & updated live on website!');
      setTimeout(() => {
        setSaveSuccess(false);
        setSaveMessage(null);
      }, 4500);
    } catch (err: any) {
      console.error('Failed to save all fare rules:', err);
      setSaveError(err?.message || 'Failed to save fare rules to Firebase. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#27272A]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-wider text-[#F5B91B] font-bold">
              Fare Engine & Tiered Rates
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit'] mt-1">
            Vehicle Category Pricing & Tiers Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Configure vehicle category tiered pricing (Min KM, Max KM, Flat vs. Per KM rates), global parameters, and fixed expressway routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {hasUnsavedChanges && (
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold animate-pulse">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Unsaved Changes in {activeCategory}</span>
            </span>
          )}
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-[#F5B91B]/20 flex items-center gap-2 self-start sm:self-auto cursor-pointer transition-transform hover:scale-[1.02] disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin text-black" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Saving to Firebase...' : 'Save Changes to Server'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <span className="font-bold">
              {saveMessage || 'Pricing Tiers & Fare Rules Saved Successfully!'}
            </span>{' '}
            All online customer booking calculations (Home, Quick Calculator, and Booking Forms) are now actively using these rates in real time.
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-950/80 border border-rose-500/50 rounded-xl text-rose-300 text-xs sm:text-sm flex items-center gap-3 shadow-lg animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          <div>
            <span className="font-bold">Save Error:</span> {saveError}
          </div>
        </div>
      )}

      {/* 1. VEHICLE CATEGORY PRICING TIERS SECTION (MATCHES USER SCREENSHOT) */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        
        {/* Category Switcher Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272A]">
          <div className="space-y-1">
            <span className="text-xs uppercase font-bold text-[#F5B91B] tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              <span>Select Vehicle Category to Configure</span>
            </span>
            <p className="text-xs text-slate-400">
              Each category maintains its own separate Min KM, Max KM, Flat (Rs), and Per KM rates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-[#0B0B0D] p-1.5 rounded-xl border border-[#27272A]">
            {['Mini Car', 'Sedan', 'Van', 'Mini Van', 'SUV', 'KDH High Roof'].map((cat) => {
              const isActive = activeCategory === cat;
              const tiers = getCategoryTiersFor(cat);
              const tiersCount = tiers.length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'bg-[#F5B91B] text-black shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-[#1E1E22]'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>{cat}</span>
                  <span className="text-[10px] font-mono opacity-80">
                    ({tiersCount} Tiers)
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Card Header matching Screenshot */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white font-['Outfit']">
              Configured Pricing Tiers — <span className="text-[#F5B91B]">{activeCategory} Category</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Defines the exact fare calculation rules applied for {activeCategory} trips across Sri Lanka.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live on Website & Carousel</span>
            </div>

            <button
              type="button"
              disabled={isSaving}
              onClick={() => saveAndApplyCategoryTiers(categoryTiers, activeCategory)}
              className="px-3.5 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-extrabold shadow-md flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105 disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-black" />
              ) : (
                <Save className="w-3.5 h-3.5 text-black" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Rates Now'}</span>
            </button>

            <button
              type="button"
              disabled={isSaving}
              onClick={handleLoadScreenshotTemplate}
              className="px-3 py-2 rounded-lg bg-[#1F1F24] hover:bg-[#2A2A30] text-slate-300 text-xs font-semibold border border-[#27272A] flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
              title="Reset to uploaded screenshot values"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span className="hidden sm:inline">Load Image Values</span>
            </button>

            {/* Black button matching uploaded screenshot */}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleAddTier}
              className="px-4 py-2 rounded-lg bg-black hover:bg-[#1E1E22] text-white text-xs font-bold border border-slate-700 shadow flex items-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5 text-white" />
              <span>+ Add New Tier</span>
            </button>
          </div>
        </div>

        {/* TABLE MATCHING USER'S UPLOADED SCREENSHOT */}
        <div className="overflow-x-auto rounded-xl border border-[#27272A] bg-[#0E0E10]">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#18181B] text-slate-300 font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-4 w-[16%]">Min KM</th>
                <th className="py-3 px-4 w-[16%]">Max KM</th>
                <th className="py-3 px-4 w-[20%]">Type</th>
                <th className="py-3 px-4 w-[22%]">Flat (Rs)</th>
                <th className="py-3 px-4 w-[22%]">Rate (Rs/km)</th>
                <th className="py-3 px-3 text-center w-[4%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272A] bg-[#0B0B0D]">
              {currentTiers.map((tier, idx) => {
                const isFlat = tier.type === 'Flat';
                return (
                  <tr key={tier.id || idx} className="hover:bg-[#141418] transition-colors">
                    {/* Min KM */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        value={tier.minKm}
                        onChange={(e) =>
                          handleUpdateTierField(idx, 'minKm', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </td>

                    {/* Max KM */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        min={0}
                        value={tier.maxKm}
                        onChange={(e) =>
                          handleUpdateTierField(idx, 'maxKm', parseInt(e.target.value) || 0)
                        }
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      />
                    </td>

                    {/* Type: Flat or Per KM */}
                    <td className="py-3 px-4">
                      <select
                        value={tier.type}
                        onChange={(e) =>
                          handleUpdateTierField(idx, 'type', e.target.value as PricingTierType)
                        }
                        className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer"
                      >
                        <option value="Flat">Flat</option>
                        <option value="Per KM">Per KM</option>
                      </select>
                    </td>

                    {/* Flat (Rs) */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step={500}
                        min={0}
                        disabled={!isFlat}
                        value={tier.flatPrice}
                        onChange={(e) =>
                          handleUpdateTierField(idx, 'flatPrice', parseInt(e.target.value) || 0)
                        }
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-mono shadow-sm focus:outline-none ${
                          isFlat
                            ? 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        }`}
                      />
                    </td>

                    {/* Rate (Rs/km) */}
                    <td className="py-3 px-4">
                      <input
                        type="number"
                        step={10}
                        min={0}
                        disabled={isFlat}
                        value={tier.ratePerKm}
                        onChange={(e) =>
                          handleUpdateTierField(idx, 'ratePerKm', parseInt(e.target.value) || 0)
                        }
                        className={`w-full px-3 py-2 border rounded-lg text-sm font-mono shadow-sm focus:outline-none ${
                          !isFlat
                            ? 'bg-white text-slate-900 border-slate-300 focus:ring-2 focus:ring-blue-500 font-bold text-blue-600'
                            : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                        }`}
                      />
                    </td>

                    {/* Delete Action (red cross like screenshot) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteTier(idx)}
                        className="w-7 h-7 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-950/30 flex items-center justify-center text-lg font-bold transition-colors cursor-pointer"
                        title="Delete this pricing tier"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Helper & Copy Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400 pt-2">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-[#F5B91B] shrink-0" />
            <span>
              If <strong>Flat</strong> is chosen, the ride is billed at the fixed amount. If <strong>Per KM</strong> is chosen, distance is multiplied by the rate (Rs/km).
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTiersToAllCategories}
              className="text-[#F5B91B] hover:underline text-xs font-semibold cursor-pointer"
            >
              Copy & Scale Tiers to All Categories
            </button>
          </div>
        </div>
      </div>

      {/* 2. INTERACTIVE TIER SIMULATOR & VERIFICATION */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#27272A]">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#F5B91B]" />
            <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
              Live Fare Engine Simulator (Test Any Distance)
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Authoritative Engine Verification
          </span>
        </div>

        {/* Quick KM Distance Tester */}
        <div className="p-5 rounded-xl bg-[#0B0B0D] border border-[#27272A] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-white font-['Outfit']">
                1. Test Distance in Kilometers
              </span>
              <p className="text-[11px] text-slate-400">
                Slide or type distance to see which tier is matched and the calculated fare.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Distance:</span>
              <span className="text-base font-black text-[#F5B91B] font-mono bg-[#18181B] px-3 py-1 rounded border border-[#27272A]">
                {testCustomKm} KM
              </span>
            </div>
          </div>

          <input
            type="range"
            min={1}
            max={300}
            value={testCustomKm}
            onChange={(e) => setTestCustomKm(parseInt(e.target.value) || 1)}
            className="w-full accent-[#F5B91B] cursor-pointer"
          />

          <div className="flex flex-wrap gap-2 text-xs">
            {[10, 25, 50, 75, 120, 160, 220].map((km) => (
              <button
                key={km}
                type="button"
                onClick={() => setTestCustomKm(km)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold transition-colors ${
                  testCustomKm === km
                    ? 'bg-[#F5B91B] text-black'
                    : 'bg-[#18181B] text-slate-300 hover:bg-[#27272A]'
                }`}
              >
                {km} km
              </button>
            ))}
          </div>

          {/* Result Calculation Card for Custom KM */}
          {(() => {
            const tiers = categoryTiers[activeCategory] || DEFAULT_SEDAN_TIERS;
            const matched =
              tiers.find((t) => testCustomKm >= t.minKm && testCustomKm <= t.maxKm) ||
              tiers[tiers.length - 1];

            let charge = 0;
            let explanation = '';
            if (matched) {
              if (matched.type === 'Flat') {
                charge = matched.flatPrice;
                explanation = `Flat Rate of ${formatLKR(matched.flatPrice)} for distances between ${matched.minKm}–${matched.maxKm} KM.`;
              } else {
                charge = testCustomKm * matched.ratePerKm;
                explanation = `${testCustomKm} KM × Rs. ${matched.ratePerKm}/km = ${formatLKR(charge)} (Tier: ${matched.minKm}–${matched.maxKm} KM).`;
              }
            }

            return (
              <div className="mt-3 p-4 rounded-xl bg-[#141418] border border-[#F5B91B]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white font-['Outfit']">
                      Category: {activeCategory}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      Tier Matched: {matched?.minKm}–{matched?.maxKm} KM ({matched?.type})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{explanation}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Calculated Trip Fare</span>
                  <span className="text-2xl font-black text-[#F5B91B] font-mono">
                    {formatLKR(charge)}
                  </span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Hub-to-Hub Route Simulator */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-bold text-white font-['Outfit']">
            2. Or Test Specific Sri Lankan Route (Hub Simulator)
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Pickup</label>
              <input
                type="text"
                value={simPickup}
                onChange={(e) => setSimPickup(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Destination</label>
              <input
                type="text"
                value={simDestination}
                onChange={(e) => setSimDestination(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Vehicle</label>
              <select
                value={simVehicleId}
                onChange={(e) => setSimVehicleId(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.category})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-400 font-semibold">Time</label>
              <input
                type="time"
                value={simTime}
                onChange={(e) => setSimTime(e.target.value)}
                className="w-full px-2.5 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-xs text-white"
              />
            </div>
            <div className="p-2.5 bg-[#0B0B0D] rounded-lg border border-[#27272A] text-right">
              <div className="text-[10px] text-slate-400">Total Calculated Fare:</div>
              <div className="text-base font-extrabold font-mono text-[#F5B91B]">
                {formatLKR(simResult.fare)}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. FIXED AIRPORT & EXPRESSWAY ROUTES TABLE */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#27272A]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
                Fixed Corridor Rates (Expressway & Airport)
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Synced
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pre-negotiated fixed rates for prominent corridors (includes highway toll tickets). Updates dynamically apply live to website & booking calculator.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                saveAndApplyFixedRoutes(fixedRoutes);
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#F5B91B] hover:bg-[#E5A812] text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-[#F5B91B]/10 transition-transform active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Corridor Rates</span>
            </button>
            <button
              onClick={handleAddFixedRoute}
              className="px-3.5 py-2 rounded-lg bg-[#27272A] hover:bg-[#3F3F46] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-[#F5B91B]" />
              <span>Add Route</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1A1E] text-slate-400 uppercase font-semibold border-b border-[#27272A]">
              <tr>
                <th className="py-3 px-3">From</th>
                <th className="py-3 px-3">To</th>
                <th className="py-3 px-2">Dist.</th>
                <th className="py-3 px-2">Duration</th>
                <th className="py-3 px-2 text-right">Mini Car (LKR)</th>
                <th className="py-3 px-2 text-right">Sedan (LKR)</th>
                <th className="py-3 px-2 text-right">Van (LKR)</th>
                <th className="py-3 px-2 text-right">Mini Van (LKR)</th>
                <th className="py-3 px-2 text-right">SUV (LKR)</th>
                <th className="py-3 px-2 text-right">KDH High Roof (LKR)</th>
                <th className="py-3 px-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1F1F23]">
              {fixedRoutes.map((r, idx) => (
                <tr key={r.id} className="hover:bg-[#1A1A1E]">
                  <td className="py-2.5 px-3 min-w-[140px]">
                    <input
                      type="text"
                      value={r.from}
                      onChange={(e) => updateRouteField(idx, 'from', e.target.value)}
                      className="w-full px-2 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-3 min-w-[140px]">
                    <input
                      type="text"
                      value={r.to}
                      onChange={(e) => updateRouteField(idx, 'to', e.target.value)}
                      className="w-full px-2 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-2">
                    <input
                      type="number"
                      value={r.estimatedDistanceKm}
                      onChange={(e) =>
                        updateRouteField(idx, 'estimatedDistanceKm', parseInt(e.target.value) || 0)
                      }
                      className="w-14 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-center text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-2 min-w-[110px]">
                    <input
                      type="text"
                      value={r.estimatedDuration}
                      onChange={(e) => updateRouteField(idx, 'estimatedDuration', e.target.value)}
                      className="w-full px-2 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white text-xs"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={r.miniCarPrice !== undefined ? r.miniCarPrice : Math.round(r.sedanPrice * 0.85)}
                      onChange={(e) =>
                        updateRouteField(idx, 'miniCarPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-xs"
                      title="Budget Mini Car (Suzuki Alto / Wagon R)"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={r.sedanPrice}
                      onChange={(e) =>
                        updateRouteField(idx, 'sedanPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-xs"
                      title="Executive Sedan"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={r.vanPrice}
                      onChange={(e) =>
                        updateRouteField(idx, 'vanPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-[#F5B91B] text-xs font-bold"
                      title="VIP Passenger Van (KDH Commuter)"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={
                        r.mini_van !== undefined
                          ? r.mini_van
                          : r.miniVanPrice !== undefined
                          ? r.miniVanPrice
                          : r.categoryPrices?.['mini_van'] !== undefined
                          ? r.categoryPrices['mini_van']
                          : r.categoryPrices?.['Mini Van'] !== undefined
                          ? r.categoryPrices['Mini Van']
                          : Math.round(r.sedanPrice * 1.15)
                      }
                      onChange={(e) =>
                        updateRouteField(idx, 'mini_van', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-xs"
                      title="Compact Mini Van (Suzuki Every / Spacia)"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={r.suvPrice !== undefined ? r.suvPrice : Math.round(r.sedanPrice * 1.35)}
                      onChange={(e) =>
                        updateRouteField(idx, 'suvPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-xs"
                      title="Toyota Prado / 4WD SUV"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-right">
                    <input
                      type="number"
                      step={500}
                      value={r.luxuryPrice}
                      onChange={(e) =>
                        updateRouteField(idx, 'luxuryPrice', parseInt(e.target.value) || 0)
                      }
                      className="w-20 px-1.5 py-1 bg-[#0B0B0D] border border-[#27272A] rounded text-white font-mono text-right text-xs"
                      title="Toyota KDH High-Roof Commuter VIP"
                    />
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={() => deleteRoute(r.id)}
                      className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/20 cursor-pointer"
                      title="Delete Route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. GLOBAL SURCHARGES & WAITING TIME */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
        <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">
          Global Surcharges & Baseline Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Minimum Trip Charge (LKR)</label>
            <input
              type="number"
              step={100}
              value={minimumFare}
              onChange={(e) => setMinimumFare(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Hourly Waiting Charge (LKR)</label>
            <input
              type="number"
              step={100}
              value={waitingPerHour}
              onChange={(e) => setWaitingPerHour(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Night Surcharge Percentage (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={nightSurchargePercent}
              onChange={(e) => setNightSurchargePercent(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
            />
            <p className="text-[10px] text-slate-500">Applies between 23:00 and 05:00</p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Additional Stop Charge (LKR)</label>
            <input
              type="number"
              step={100}
              value={additionalStopCharge}
              onChange={(e) => setAdditionalStopCharge(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white font-mono focus:outline-none focus:border-[#F5B91B]"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
