import React, { useState } from 'react';
import {
  Coins,
  Plus,
  RotateCcw,
  Check,
  Trash2,
  Edit3,
  TrendingUp,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../lib/store';
import { CurrencyConfig } from '../../types';
import { CountryFlag } from '../../components/CountryFlag';
import { CURRENCIES, convertLkrTo, formatCurrency } from '../../lib/fareEngine';

export const AdminCurrencies: React.FC = () => {
  const { currencies, updateCurrency, addCurrency, deleteCurrency, resetCurrencies, currency: activeAppCurrency } = useApp();

  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>('');
  const [editSymbol, setEditSymbol] = useState<string>('');
  const [editName, setEditName] = useState<string>('');
  const [savedToast, setSavedToast] = useState<string | null>(null);

  // Modal for new currency
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSymbol, setNewSymbol] = useState('');
  const [newRate, setNewRate] = useState('');
  const [addError, setAddError] = useState('');

  // Simulator test amount in LKR
  const [testAmountLkr, setTestAmountLkr] = useState<number>(18000);

  const currencyList = Object.values(currencies || CURRENCIES);

  const showNotification = (msg: string) => {
    setSavedToast(msg);
    setTimeout(() => {
      setSavedToast(null);
    }, 3500);
  };

  const handleStartEdit = (c: CurrencyConfig) => {
    setEditingCode(c.code);
    setEditRate(String(c.rateToLkr));
    setEditSymbol(c.symbol);
    setEditName(c.name);
  };

  const handleSaveEdit = async (code: string) => {
    const numRate = parseFloat(editRate);
    if (isNaN(numRate) || numRate <= 0) {
      alert('Please enter a valid positive exchange rate.');
      return;
    }

    const existing = currencies[code] || CURRENCIES[code];
    if (!existing) return;

    await updateCurrency({
      ...existing,
      name: editName.trim() || existing.name,
      symbol: editSymbol.trim() || existing.symbol,
      rateToLkr: code === 'LKR' ? 1 : numRate,
    });

    setEditingCode(null);
    showNotification(`Updated exchange rate for ${code} (1 ${code} = ${numRate} LKR)`);
  };

  const handleToggleActive = async (c: CurrencyConfig) => {
    if (c.code === 'LKR') {
      showNotification('LKR is the base currency and cannot be deactivated.');
      return;
    }
    const currentActive = c.isActive !== false;
    await updateCurrency({
      ...c,
      isActive: !currentActive,
    });
    showNotification(`${c.code} is now ${!currentActive ? 'visible' : 'hidden'} in traveler currency selector.`);
  };

  const handleDelete = async (c: CurrencyConfig) => {
    if (c.code === 'LKR') {
      alert('Base currency LKR cannot be removed.');
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${c.code} (${c.name})?`)) {
      await deleteCurrency(c.code);
      showNotification(`Currency ${c.code} removed.`);
    }
  };

  const handleResetToBaseline = async () => {
    if (window.confirm('Reset all currencies and exchange rates to market standard defaults?')) {
      await resetCurrencies();
      showNotification('Reset all exchange rates to standard reference values.');
    }
  };

  const handleAddNewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');

    const code = newCode.trim().toUpperCase();
    if (!code || code.length < 2 || code.length > 5) {
      setAddError('Please enter a valid 3-letter currency code (e.g. CAD, SGD, AED, JPY).');
      return;
    }

    if (currencies[code]) {
      setAddError(`Currency code "${code}" already exists.`);
      return;
    }

    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      setAddError('Please enter a valid exchange rate against 1 LKR.');
      return;
    }

    const config: CurrencyConfig = {
      code,
      label: `${code} (${newSymbol.trim() || '$'})`,
      name: newName.trim() || `${code} Currency`,
      symbol: newSymbol.trim() || code,
      rateToLkr: rate,
      flag: '🌐',
      isActive: true,
    };

    await addCurrency(config);
    setShowAddModal(false);
    setNewCode('');
    setNewName('');
    setNewSymbol('');
    setNewRate('');
    showNotification(`Added new currency ${code} with rate 1 ${code} = ${rate} LKR`);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-['Outfit']">
      {/* Toast Notification */}
      {savedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#F5B91B] text-black font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <Check className="w-5 h-5 shrink-0" />
          <span>{savedToast}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#27272A] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/15 border border-[#F5B91B]/30 flex items-center justify-center text-[#F5B91B]">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                Currency & Exchange Rates
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-[#1E1E24] text-slate-400 border border-[#27272A]">
                  Base: LKR
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Manage exchange rates against Sri Lankan Rupee. Live conversions apply automatically across customer bookings & calculators.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleResetToBaseline}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#141416] hover:bg-[#1E1E22] text-slate-300 hover:text-white border border-[#27272A] text-xs font-bold transition-all cursor-pointer"
            title="Reset to default benchmark rates"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Rates</span>
          </button>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E0A716] text-black font-extrabold text-xs shadow-lg shadow-[#F5B91B]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Currency</span>
          </button>
        </div>
      </div>

      {/* Conversion Simulator Bar */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#141416] via-[#1A1A1E] to-[#141416] border border-[#27272A] space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5B91B]/20 flex items-center justify-center text-[#F5B91B]">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Live Conversion Simulator
                <span className="text-[11px] font-normal text-slate-400">
                  (Test any trip fare to inspect traveler display)
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Calculations dynamically use the rates configured in the table below.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Test Amount:</span>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-[#F5B91B]">Rs.</span>
              <input
                type="number"
                min="0"
                step="500"
                value={testAmountLkr}
                onChange={(e) => setTestAmountLkr(Math.max(0, Number(e.target.value)))}
                className="w-36 pl-9 pr-3 py-1.5 rounded-lg bg-[#0B0B0D] border border-[#27272A] text-white text-xs font-mono font-bold focus:border-[#F5B91B] focus:outline-none"
              />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">LKR</span>
          </div>
        </div>

        {/* Live Simulator Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-[#27272A]/80">
          {currencyList
            .filter((c) => c.isActive !== false)
            .map((c) => {
              const converted = convertLkrTo(testAmountLkr, c.code, currencies);
              const formatted = formatCurrency(testAmountLkr, c.code, { currencies });
              return (
                <div
                  key={`sim-${c.code}`}
                  className="p-3 rounded-xl bg-[#0E0E10] border border-[#27272A] hover:border-[#F5B91B]/40 transition-colors"
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1.5 font-bold text-slate-300">
                      <CountryFlag code={c.code} size="sm" />
                      <span>{c.code}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {c.code === 'LKR' ? 'Base' : `×${c.rateToLkr}`}
                    </span>
                  </div>
                  <div className="text-base font-black text-[#F5B91B] font-mono tracking-tight truncate">
                    {formatted}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">{c.name}</div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Currencies Management Table */}
      <div className="bg-[#141416] border border-[#27272A] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#27272A] bg-[#101012] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#F5B91B]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Configured Currencies & Exchange Rates
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {currencyList.filter((c) => c.isActive !== false).length} Active · {currencyList.length} Total
          </span>
        </div>

        <div className="divide-y divide-[#27272A]">
          {currencyList.map((c) => {
            const isBase = c.code === 'LKR';
            const isEditing = editingCode === c.code;
            const isActive = c.isActive !== false;

            return (
              <div
                key={c.code}
                className={`p-4 transition-colors ${
                  isEditing ? 'bg-[#18181C]' : 'hover:bg-[#18181C]/50'
                } ${!isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Left: Flag & Currency Identity */}
                  <div className="flex items-center gap-3.5 min-w-[240px]">
                    <div className="p-1 rounded-md bg-[#0B0B0D] border border-[#27272A] shrink-0">
                      <CountryFlag code={c.code} size="lg" />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-white font-mono">{c.code}</span>
                        <span className="px-1.5 py-0.5 rounded bg-[#27272A] text-slate-300 text-[10px] font-bold">
                          {c.symbol}
                        </span>
                        {isBase && (
                          <span className="px-2 py-0.5 rounded-full bg-[#F5B91B]/20 text-[#F5B91B] text-[10px] font-black uppercase tracking-wider border border-[#F5B91B]/40">
                            Base Currency
                          </span>
                        )}
                        {!isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold border border-slate-700">
                            Hidden from Users
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{c.name}</div>
                    </div>
                  </div>

                  {/* Center: Exchange Rate Definition */}
                  <div className="flex-1 max-w-md">
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-[#0B0B0D] p-2 rounded-xl border border-[#F5B91B]">
                        <span className="text-xs text-slate-400 shrink-0 font-mono">1 {c.code} =</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0.001"
                          disabled={isBase}
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-24 px-2 py-1 rounded bg-[#1A1A1E] text-white text-xs font-mono font-bold border border-[#333] focus:border-[#F5B91B] focus:outline-none"
                        />
                        <span className="text-xs text-[#F5B91B] font-bold shrink-0">LKR</span>

                        <input
                          type="text"
                          value={editSymbol}
                          onChange={(e) => setEditSymbol(e.target.value)}
                          placeholder="Symbol"
                          className="w-16 px-2 py-1 rounded bg-[#1A1A1E] text-white text-xs border border-[#333] focus:border-[#F5B91B] focus:outline-none text-center"
                          title="Currency Symbol"
                        />

                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          placeholder="Name"
                          className="flex-1 px-2 py-1 rounded bg-[#1A1A1E] text-white text-xs border border-[#333] focus:border-[#F5B91B] focus:outline-none"
                          title="Full Currency Name"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="px-3.5 py-2 rounded-xl bg-[#0E0E10] border border-[#27272A] flex items-center gap-2 font-mono">
                          <span className="text-xs text-slate-400">1 {c.code} =</span>
                          <span className="text-sm font-black text-[#F5B91B]">
                            {isBase ? '1.00' : c.rateToLkr.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-slate-300">LKR</span>
                        </div>

                        {!isBase && (
                          <div className="text-[11px] text-slate-400 hidden sm:block">
                            (10,000 LKR ≈ {(10000 / c.rateToLkr).toFixed(2)} {c.code})
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(c.code)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F5B91B] text-black text-xs font-extrabold hover:bg-[#E0A716] transition-all cursor-pointer shadow-md"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Save</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCode(null)}
                          className="px-3 py-1.5 rounded-lg bg-[#27272A] text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(c)}
                          disabled={isBase}
                          className={`p-2 rounded-lg border transition-all cursor-pointer ${
                            isBase
                              ? 'opacity-30 cursor-not-allowed border-transparent text-slate-600'
                              : isActive
                              ? 'bg-[#1E1E24] hover:bg-[#27272E] text-[#F5B91B] border-[#27272A]'
                              : 'bg-[#18181C] text-slate-500 hover:text-slate-300 border-[#27272A]'
                          }`}
                          title={
                            isBase
                              ? 'Base currency cannot be hidden'
                              : isActive
                              ? 'Click to hide from customer selector'
                              : 'Click to show in customer selector'
                          }
                        >
                          {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(c)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#1E1E24] hover:bg-[#27272E] text-slate-200 hover:text-white border border-[#27272A] text-xs font-semibold transition-all cursor-pointer"
                          title="Edit Exchange Rate"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>

                        {!isBase && (
                          <button
                            type="button"
                            onClick={() => handleDelete(c)}
                            className="p-2 rounded-lg bg-red-950/30 hover:bg-red-900/50 text-red-400 border border-red-900/40 transition-all cursor-pointer"
                            title={`Delete ${c.code}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informative Guidance Card */}
      <div className="p-4 rounded-xl bg-[#141416] border border-[#27272A] flex items-start gap-3 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-[#F5B91B] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">How Multi-Currency Conversion Works in Galle Taxi:</p>
          <p>
            All trip distances, vehicle category rates, airport transfer routes, and toll charges are authoritatively calculated in{' '}
            <strong className="text-white">Sri Lankan Rupees (LKR)</strong>.
            When an international tourist selects USD, EUR, GBP, or another currency from the header or mobile drawer, the booking engine dynamically converts the estimated amount using these exact exchange rates.
          </p>
        </div>
      </div>

      {/* Add Currency Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#141416] border border-[#27272A] rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#27272A] pb-3">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#F5B91B]" />
                <h3 className="text-base font-extrabold text-white">Add New Currency</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-900/50 text-red-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddNewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Currency Code <span className="text-[#F5B91B]">*</span>
                </label>
                <input
                  type="text"
                  maxLength={5}
                  required
                  placeholder="e.g. CAD, SGD, AED, JPY, CHF"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-white font-mono font-bold uppercase focus:border-[#F5B91B] focus:outline-none"
                />
                <p className="text-[10px] text-slate-500 mt-1">Standard 3-letter ISO code.</p>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">
                  Currency Full Name <span className="text-[#F5B91B]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Canadian Dollar, UAE Dirham"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-white focus:border-[#F5B91B] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    Symbol <span className="text-[#F5B91B]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C$, AED, ¥"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-white font-bold focus:border-[#F5B91B] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">
                    1 [CODE] = X LKR <span className="text-[#F5B91B]">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    required
                    placeholder="e.g. 225"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#0B0B0D] border border-[#27272A] text-white font-mono font-bold focus:border-[#F5B91B] focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#1E1E24] text-slate-300 hover:text-white font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#F5B91B] hover:bg-[#E0A716] text-black font-extrabold shadow-lg shadow-[#F5B91B]/20 cursor-pointer"
                >
                  Add Currency
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
