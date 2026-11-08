import React, { useState, useRef, useEffect } from 'react';
import { DollarSign, ChevronDown, Check } from 'lucide-react';
import { useApp } from '../lib/store';
import { CurrencyCode, CurrencyConfig } from '../types';
import { CURRENCIES } from '../lib/fareEngine';
import { CountryFlag } from './CountryFlag';

interface CurrencySelectorProps {
  variant?: 'navbar' | 'segmented' | 'mobile';
  className?: string;
}

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({ variant = 'navbar', className = '' }) => {
  const { currency, setCurrency, currencies } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
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

  const allCurrencies = currencies || CURRENCIES;
  const currencyList = Object.values(allCurrencies).filter((c) => c.isActive !== false);
  const activeConfig = allCurrencies[currency] || CURRENCIES[currency] || CURRENCIES.LKR;

  // Segmented Pill Variant (e.g. for booking summaries and calculator)
  if (variant === 'segmented') {
    return (
      <div
        className={`w-full sm:w-auto flex items-center justify-between sm:justify-start p-1 rounded-xl bg-[#0B0B0D] border border-[#27272A] max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-webkit-overflow-scrolling:touch] gap-1 shrink-0 ${className}`}
      >
        {currencyList.map((c) => {
          const isSelected = currency === c.code;
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => setCurrency(c.code)}
              className={`flex-1 sm:flex-initial justify-center shrink-0 px-2 sm:px-2.5 py-1.5 sm:py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#F5B91B] text-black shadow-md font-extrabold'
                  : 'text-slate-400 hover:text-white hover:bg-[#1A1A1E]'
              }`}
              title={`${c.name} (${c.symbol})`}
            >
              <CountryFlag code={c.code} size="sm" />
              <span>{c.code}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // Mobile Drawer Full-Width Variant
  if (variant === 'mobile') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
          <span>Currency</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {currencyList.map((c) => {
            const isSelected = currency === c.code;
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => setCurrency(c.code)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#F5B91B] text-black border-[#F5B91B] font-extrabold shadow-md'
                    : 'bg-[#141416] text-slate-300 hover:text-white border-[#27272A]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CountryFlag code={c.code} size="md" />
                  <div className="text-left">
                    <div className="text-xs font-bold">{c.code}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-black/80' : 'text-slate-400'}`}>
                      {c.symbol}
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-black shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg bg-[#141416] hover:bg-[#1E1E22] text-slate-200 hover:text-white border border-[#27272A] hover:border-[#F5B91B]/40 text-[11px] sm:text-xs font-semibold transition-all cursor-pointer shadow-sm"
        aria-label="Select Currency"
        title={`Current Currency: ${activeConfig.name}`}
      >
        <CountryFlag code={activeConfig.code} size="sm" className="sm:w-5 sm:h-3.5" />
        <span className="font-mono text-[#F5B91B] font-bold">{activeConfig.code}</span>
        <span className="text-[10px] sm:text-[11px] text-slate-400 font-normal">({activeConfig.symbol})</span>
        <ChevronDown className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141416] border border-[#27272A] shadow-2xl py-1.5 z-50 text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-[#27272A] text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Select Currency</span>
            <span className="text-[#F5B91B]">{currencyList.length} Active</span>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">
            {currencyList.map((c) => {
              const isSelected = currency === c.code;
              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCurrency(c.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-3 py-2 flex items-center justify-between text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F5B91B]/15 text-[#F5B91B] font-bold'
                      : 'hover:bg-[#1E1E24] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CountryFlag code={c.code} size="md" />
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{c.code}</span>
                        <span className="text-slate-400 text-[11px] font-normal">({c.symbol})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-[#F5B91B] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
