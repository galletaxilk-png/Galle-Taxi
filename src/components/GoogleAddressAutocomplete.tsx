// Source: Google Maps Platform Code Assist & Universal GIS Geocoding
/// <reference types="@types/google.maps" />
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import {
  MapPin,
  Loader2,
  X,
  Plane,
  Waves,
  Landmark,
  Building2,
  Building,
  Compass,
  Train,
  Navigation,
  Sparkles,
} from 'lucide-react';
import { searchAllLocations, LocationItem, SRI_LANKA_CURATED_LOCATIONS } from '../lib/locationService';

interface GoogleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  iconColor?: string;
  onPlaceSelect?: (place: any, item?: LocationItem) => void;
  id?: string;
}

export const GoogleAddressAutocomplete: React.FC<GoogleAddressAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Search any location, hotel, or address in Sri Lanka...',
  required = false,
  className = '',
  iconColor = 'text-[#F5B91B]',
  onPlaceSelect,
  id,
}) => {
  const placesLib = useMapsLibrary('places');
  const [inputValue, setInputValue] = useState(value);
  const [results, setResults] = useState<LocationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick popular recommendations shown when input is focused and empty or minimal
  const popularPresets = SRI_LANKA_CURATED_LOCATIONS.slice(0, 6);

  // Universal search handler
  useEffect(() => {
    const trimmed = inputValue.trim();

    // If query is empty or 1 char, don't trigger online search; show popular suggestions if focused
    if (trimmed.length < 2) {
      setResults([]);
      return;
    }

    // Only search if input doesn't already exactly match the selected value
    if (trimmed === value.trim() && !isOpen) {
      return;
    }

    let active = true;

    // First, show instant curated matches immediately without debounce lag
    const instantMatches = SRI_LANKA_CURATED_LOCATIONS.filter((item) => {
      const q = trimmed.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.secondary && item.secondary.toLowerCase().includes(q)) ||
        (q.includes('cmb') && item.category === 'Airport')
      );
    });

    if (instantMatches.length > 0 && active) {
      setResults(instantMatches.slice(0, 8));
      setIsOpen(true);
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);

      try {
        // 1. Query Universal GIS / OpenStreetMap / Curated Engine
        const unifiedResults = await searchAllLocations(trimmed);

        // 2. If Google Maps Places library is loaded, attempt Google Autocomplete as well
        let googleItems: LocationItem[] = [];
        if (placesLib) {
          try {
            if (!sessionTokenRef.current && placesLib.AutocompleteSessionToken) {
              sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
            }

            const { AutocompleteSuggestion } = placesLib;
            if (AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
              const request: google.maps.places.AutocompleteRequest = {
                input: trimmed,
                sessionToken: sessionTokenRef.current || undefined,
                includedRegionCodes: ['lk'],
                region: 'lk',
              };

              const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request);
              if (response?.suggestions?.length) {
                googleItems = response.suggestions.map((s, idx) => {
                  const pred = s.placePrediction;
                  const main = pred?.mainText?.text || pred?.text?.text || trimmed;
                  const sec = pred?.secondaryText?.text || 'Sri Lanka';
                  return {
                    id: `gmap-${pred?.placeId || idx}`,
                    name: main,
                    secondary: sec,
                    category: (main.toLowerCase().includes('airport') ? 'Airport' : 'Place') as LocationItem['category'],
                    source: 'google' as const,
                  };
                });
              }
            }
          } catch {
            // Silently suppress Google API quota limits or network errors
            // The unifiedResults already cover all Sri Lankan & global locations!
          }
        }

        if (active) {
          // Merge Google items with unified results (prioritize exact matches)
          const combined: LocationItem[] = [];
          const seen = new Set<string>();

          // Add Google items first if any
          for (const g of googleItems) {
            const key = g.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(g);
            }
          }

          // Add unified results
          for (const u of unifiedResults) {
            const key = u.name.toLowerCase();
            if (!seen.has(key)) {
              seen.add(key);
              combined.push(u);
            }
          }

          setResults(combined.slice(0, 10));
          setIsOpen(combined.length > 0);
          setSelectedIndex(-1);
        }
      } catch {
        if (active && instantMatches.length > 0) {
          setResults(instantMatches);
          setIsOpen(true);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }, 200);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [inputValue, placesLib, value, isOpen]);

  const handleSelectLocation = useCallback(
    (item: LocationItem) => {
      const selectedName = item.name;
      setInputValue(selectedName);
      onChange(selectedName);
      setIsOpen(false);
      setResults([]);
      sessionTokenRef.current = null;

      if (onPlaceSelect) {
        onPlaceSelect(
          {
            displayName: item.name,
            formattedAddress: item.secondary ? `${item.name}, ${item.secondary}` : item.name,
            location: item.lat && item.lng ? { lat: () => item.lat!, lng: () => item.lng! } : undefined,
          },
          item
        );
      }
    },
    [onChange, onPlaceSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const listToNavigate = results.length > 0 ? results : popularPresets;
    if (!isOpen || listToNavigate.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < listToNavigate.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < listToNavigate.length) {
        e.preventDefault();
        handleSelectLocation(listToNavigate[selectedIndex]);
      } else if (inputValue.trim()) {
        // Direct enter accepts current input
        e.preventDefault();
        const customItem: LocationItem = {
          id: `custom-${Date.now()}`,
          name: inputValue.trim(),
          category: 'Custom',
          source: 'custom',
        };
        handleSelectLocation(customItem);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setInputValue('');
    onChange('');
    setResults([]);
    setIsOpen(false);
    sessionTokenRef.current = null;
    inputRef.current?.focus();
  };

  const getCategoryIcon = (category: LocationItem['category']) => {
    switch (category) {
      case 'Airport':
        return <Plane className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />;
      case 'Beach':
        return <Waves className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />;
      case 'Heritage':
        return <Landmark className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />;
      case 'Hotel':
        return <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />;
      case 'City':
        return <Building className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />;
      case 'Wildlife':
        return <Compass className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
      case 'Station':
        return <Train className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />;
      case 'Custom':
        return <Navigation className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />;
      default:
        return <MapPin className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />;
    }
  };

  const getBadgeStyle = (category: LocationItem['category']) => {
    switch (category) {
      case 'Airport':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'Beach':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40';
      case 'Heritage':
        return 'bg-amber-950/40 text-[#F5B91B] border-[#F5B91B]/30';
      case 'Hotel':
        return 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40';
      case 'City':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
      case 'Wildlife':
        return 'bg-emerald-950/70 text-emerald-400 border-emerald-700/40';
      case 'Station':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      default:
        return 'bg-zinc-800/80 text-zinc-300 border-zinc-700/50';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        <MapPin className={`w-4 h-4 ${iconColor} absolute left-3 top-3.5 pointer-events-none`} />

        <input
          ref={inputRef}
          id={id}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
            if (!isOpen) {
              setIsOpen(true);
            }
          }}
          onFocus={() => {
            setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
          className={
            className ||
            'w-full pl-9 pr-9 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#F5B91B] transition-colors shadow-inner'
          }
        />

        <div className="absolute right-3 top-3 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-[#F5B91B] animate-spin" />}
          {!isLoading && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-slate-300 focus:outline-none cursor-pointer p-0.5 rounded"
              aria-label="Clear address"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-[#141416] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden backdrop-blur-md">
          {/* If user hasn't typed enough yet, show popular suggestions */}
          {results.length === 0 && inputValue.trim().length < 2 && (
            <div>
              <div className="px-3.5 py-2 bg-[#0E0E11] border-b border-[#27272A]/70 flex items-center gap-1.5 text-[11px] font-semibold text-[#F5B91B] uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-[#F5B91B]" />
                <span>Popular Destinations</span>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-[#27272A]/40">
                {popularPresets.map((item, index) => {
                  const isSelected = index === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectLocation(item)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`px-3.5 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#1E1E24] text-white' : 'hover:bg-[#1A1A1E] text-slate-200'
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-white truncate">{item.name}</p>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${getBadgeStyle(
                              item.category
                            )}`}
                          >
                            {item.category}
                          </span>
                        </div>
                        {item.secondary && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.secondary}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Active Search Results */}
          {results.length > 0 && (
            <div className="max-h-72 overflow-y-auto divide-y divide-[#27272A]/50">
              {results.map((item, index) => {
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectLocation(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`px-3.5 py-2.5 flex items-start gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#1E1E24] text-white' : 'hover:bg-[#1A1A1E] text-slate-200'
                    }`}
                  >
                    {getCategoryIcon(item.category)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs sm:text-sm font-semibold text-white truncate">{item.name}</p>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase shrink-0 ${getBadgeStyle(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                      {item.secondary && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{item.secondary}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No matches fallback -> allow custom entry */}
          {results.length === 0 && inputValue.trim().length >= 2 && !isLoading && (
            <div
              onClick={() =>
                handleSelectLocation({
                  id: `custom-${Date.now()}`,
                  name: inputValue.trim(),
                  category: 'Custom',
                  source: 'custom',
                })
              }
              className="px-3.5 py-3 hover:bg-[#1A1A1E] cursor-pointer text-slate-300 flex items-center gap-3 transition-colors"
            >
              <Navigation className="w-4 h-4 text-[#F5B91B] shrink-0" />
              <div>
                <p className="text-xs sm:text-sm font-semibold text-white">
                  Use &ldquo;<span className="text-[#F5B91B]">{inputValue.trim()}</span>&rdquo;
                </p>
                <p className="text-[11px] text-slate-400">Door-to-door custom address / landmark</p>
              </div>
            </div>
          )}

          {/* Footer Attribution */}
          <div className="px-3 py-1.5 bg-[#0D0D10] border-t border-[#27272A]/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-slate-300">All Sri Lanka & Global Locations</span>
            </span>
            <span className="font-sans font-medium text-slate-400">
              powered by <span className="text-slate-200 font-semibold">Google Maps & GIS</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
