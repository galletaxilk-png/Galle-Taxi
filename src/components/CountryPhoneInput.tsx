import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, Phone } from 'lucide-react';

export interface CountryOption {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: CountryOption[] = [
  // Primary Sri Lanka & Top Incoming Tourism Markets
  { code: 'LK', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', placeholder: '77 123 4567' },
  { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', placeholder: '7911 123456' },
  { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪', placeholder: '151 23456789' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷', placeholder: '6 12 34 56 78' },
  { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳', placeholder: '98765 43210' },
  { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺', placeholder: '912 345 6789' },
  { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺', placeholder: '412 345 678' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', placeholder: '202 555 0123' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', placeholder: '416 555 0123' },
  { code: 'AE', name: 'United Arab Emirates', dialCode: '+971', flag: '🇦🇪', placeholder: '50 123 4567' },
  { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', placeholder: '50 123 4567' },
  { code: 'QA', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', placeholder: '3312 3456' },
  { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳', placeholder: '138 0013 8000' },
  { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵', placeholder: '90 1234 5678' },
  { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', placeholder: '10 1234 5678' },
  { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', placeholder: '8123 4567' },
  { code: 'MY', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', placeholder: '12 345 6789' },
  { code: 'TH', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', placeholder: '81 234 5678' },
  { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', placeholder: '812 3456 7890' },
  { code: 'NL', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', placeholder: '6 12345678' },
  { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹', placeholder: '312 345 6789' },
  { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸', placeholder: '612 34 56 78' },
  { code: 'CH', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', placeholder: '79 123 45 67' },
  { code: 'SE', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', placeholder: '70 123 45 67' },
  { code: 'NO', name: 'Norway', dialCode: '+47', flag: '🇳🇴', placeholder: '412 34 567' },
  { code: 'DK', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', placeholder: '20 12 34 56' },
  { code: 'PL', name: 'Poland', dialCode: '+48', flag: '🇵🇱', placeholder: '512 345 678' },
  { code: 'CZ', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', placeholder: '601 123 456' },
  { code: 'AT', name: 'Austria', dialCode: '+43', flag: '🇦🇹', placeholder: '664 1234567' },
  { code: 'BE', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', placeholder: '470 12 34 56' },
  { code: 'IE', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', placeholder: '85 123 4567' },
  { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', placeholder: '21 123 4567' },
  { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', placeholder: '71 123 4567' },
  { code: 'IL', name: 'Israel', dialCode: '+972', flag: '🇮🇱', placeholder: '50 123 4567' },
  { code: 'MV', name: 'Maldives', dialCode: '+960', flag: '🇲🇻', placeholder: '771 2345' },
  { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', placeholder: '917 123 4567' },
  { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', placeholder: '91 234 56 78' },
  { code: 'TR', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', placeholder: '532 123 45 67' },
  { code: 'GR', name: 'Greece', dialCode: '+30', flag: '🇬🇷', placeholder: '691 234 5678' },
  { code: 'PT', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', placeholder: '912 345 678' },
  { code: 'FI', name: 'Finland', dialCode: '+358', flag: '🇫🇮', placeholder: '40 1234567' },
  { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', placeholder: '11 91234 5678' },
  { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', placeholder: '55 1234 5678' },
  { code: 'KW', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', placeholder: '5001 2345' },
  { code: 'OM', name: 'Oman', dialCode: '+968', flag: '🇴🇲', placeholder: '9123 4567' },
  { code: 'BH', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', placeholder: '3600 1234' },
];

interface CountryPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

export const CountryPhoneInput: React.FC<CountryPhoneInputProps> = ({
  value,
  onChange,
  required = false,
  disabled = false,
  id,
  name,
  className = '',
}) => {
  // Parse incoming value into matching country and national number
  const parsed = useMemo(() => {
    const trimmed = (value || '').trim();
    if (!trimmed) {
      return { country: COUNTRIES[0], nationalNumber: '' };
    }

    // Check if the value starts with any known country dial code
    // Sort by dialCode length descending so +971 matched before +97, +420 before +42, etc.
    const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
    for (const c of sortedCountries) {
      if (trimmed.startsWith(c.dialCode)) {
        const remainder = trimmed.slice(c.dialCode.length).trim();
        return { country: c, nationalNumber: remainder };
      }
    }

    // If starts with +, but unrecognized or not matched, default to LK
    return { country: COUNTRIES[0], nationalNumber: trimmed };
  }, [value]);

  const [selectedCountry, setSelectedCountry] = useState<CountryOption>(parsed.country);
  const [nationalNumber, setNationalNumber] = useState<string>(parsed.nationalNumber);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    setSelectedCountry(parsed.country);
    setNationalNumber(parsed.nationalNumber);
  }, [parsed]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter countries by search query
  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dialCode.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleCountrySelect = (country: CountryOption) => {
    setSelectedCountry(country);
    setIsOpen(false);
    setSearchQuery('');

    // Emit updated full phone
    const cleanNum = nationalNumber.trim();
    const fullPhone = cleanNum ? `${country.dialCode} ${cleanNum}` : `${country.dialCode} `;
    onChange(fullPhone);

    setTimeout(() => {
      numberInputRef.current?.focus();
    }, 50);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputVal = e.target.value;

    // Check if user pasted a full international number with +
    if (inputVal.startsWith('+')) {
      const sortedCountries = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
      for (const c of sortedCountries) {
        if (inputVal.startsWith(c.dialCode)) {
          setSelectedCountry(c);
          inputVal = inputVal.slice(c.dialCode.length).trim();
          setNationalNumber(inputVal);
          onChange(`${c.dialCode} ${inputVal}`.trim());
          return;
        }
      }
    }

    setNationalNumber(inputVal);
    const fullPhone = inputVal.trim() ? `${selectedCountry.dialCode} ${inputVal.trim()}` : '';
    onChange(fullPhone);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center rounded-lg border border-[#27272A] bg-[#0B0B0D] focus-within:border-[#F5B91B] focus-within:ring-1 focus-within:ring-[#F5B91B] transition-colors overflow-visible">
        {/* Country Selector Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-2.5 bg-[#141416] hover:bg-[#1C1C20] border-r border-[#27272A] text-slate-200 text-sm font-medium transition-colors shrink-0 cursor-pointer select-none rounded-l-lg group focus:outline-none"
          title={`Selected country: ${selectedCountry.name} (${selectedCountry.dialCode})`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="text-lg leading-none" role="img" aria-label={selectedCountry.name}>
            {selectedCountry.flag}
          </span>
          <span className="font-mono text-xs font-bold text-white group-hover:text-[#F5B91B]">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 group-hover:text-[#F5B91B] transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-[#F5B91B]' : ''
            }`}
          />
        </button>

        {/* National Number Input */}
        <div className="relative flex-1 flex items-center">
          <input
            ref={numberInputRef}
            type="tel"
            id={id}
            name={name}
            value={nationalNumber}
            onChange={handleNumberChange}
            placeholder={selectedCountry.placeholder}
            required={required}
            disabled={disabled}
            className="w-full px-3 py-2.5 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none font-mono"
            autoComplete="tel-national"
          />
          {nationalNumber && (
            <span className="pr-3 text-[11px] font-mono text-emerald-400 hidden sm:inline-flex items-center gap-1 select-none">
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{selectedCountry.code}</span>
            </span>
          )}
        </div>
      </div>

      {/* Country Dropdown Popover */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-72 sm:w-80 max-h-72 bg-[#141416] border border-[#27272A] rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2.5 border-b border-[#27272A] bg-[#111113]">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search country or code..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#0B0B0D] border border-[#27272A] rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-[#F5B91B]"
              />
            </div>
          </div>

          {/* Country List */}
          <div className="overflow-y-auto flex-1 divide-y divide-[#1F1F24] py-1">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">
                No matching countries found
              </div>
            ) : (
              filteredCountries.map((c) => {
                const isSelected = c.code === selectedCountry.code;
                return (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => handleCountrySelect(c)}
                    className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-[#1D1D22] transition-colors cursor-pointer text-xs ${
                      isSelected ? 'bg-[#F5B91B]/10 text-white font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-base leading-none" role="img" aria-label={c.name}>
                        {c.flag}
                      </span>
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-slate-400">
                      <span className={isSelected ? 'text-[#F5B91B] font-bold' : ''}>
                        {c.dialCode}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#F5B91B]" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
