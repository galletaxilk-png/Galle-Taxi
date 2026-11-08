import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CheckCircle2, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-[#F5B91B] bg-[#141416] hover:bg-[#1f1f23] border border-[#27272A] hover:border-[#F5B91B]/40 px-3.5 py-2 rounded-xl transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
          <div className="text-[11px] text-slate-400 font-mono">
            Terms of Service
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Passenger Transportation Agreement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Terms & Conditions
          </h1>
          <p className="text-slate-400 text-xs">Official Passenger Transport Standards · Galle, Sri Lanka</p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-8 sm:p-12 space-y-8 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              1. Fares, Currency & Highway Tolls
            </h2>
            <p>
              Authoritative fares are computed in Sri Lankan Rupees (LKR). Unless explicitly stated otherwise, airport and inter-city rates include Southern Expressway (E01) tolls, fuel, vehicle insurance, and chauffeur allowances. Passengers may pay directly to the chauffeur upon arrival in cash (LKR, USD, EUR, or GBP at current bank rates) or via approved advance arrangements.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              2. Flight Delays & Arrival Protocols
            </h2>
            <p>
              For all airport pickups at Colombo Bandaranaike International Airport (CMB), we provide free flight delay monitoring. Waiting time incurred as a direct consequence of airline delays is complimentary.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              3. Cancellation & Modification
            </h2>
            <p>
              Free cancellation is granted if notice is provided at least 6 hours prior to the scheduled pickup time. Modifications to pickup time or location can be made by messaging our 24/7 WhatsApp dispatch desk with your booking reference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              4. Luggage & Vehicle Capacity
            </h2>
            <p>
              Passengers must adhere to the passenger and luggage capacities stated on the booking form. If a party exceeds the capacity of the booked vehicle, Galle Taxi reserves the right to request an upgrade to a larger vehicle (e.g. VIP High-Roof Van) with the applicable price difference.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              5. Safety, Seatbelts & Island Laws
            </h2>
            <p>
              All passengers are required to wear seatbelts while traversing Sri Lankan highways. Smoking and illicit substances are strictly prohibited inside all fleet vehicles.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
