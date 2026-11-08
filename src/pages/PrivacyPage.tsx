import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, FileText, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
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
            Compliance & Privacy
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Data Protection & Passenger Privacy
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit']">
            Privacy Policy
          </h1>
          <p className="text-slate-400 text-xs">Last Updated: October 2026</p>
        </div>

        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-8 sm:p-12 space-y-8 text-sm text-slate-300 leading-relaxed shadow-xl">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#F5B91B]" />
              1. Information We Collect
            </h2>
            <p>
              Galle Taxi collects only the personal information required to safely coordinate and execute passenger transportation in Sri Lanka. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-1.5 text-xs text-slate-400">
              <li>Lead passenger full name and contact phone or WhatsApp number.</li>
              <li>Pickup address, hotel villa name, or flight arrival details for airport transfers.</li>
              <li>Drop-off destination in Sri Lanka.</li>
              <li>Passenger and luggage counts to ensure safe vehicle dispatch.</li>
              <li>Optional email addresses provided for invoice receipt delivery.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F5B91B]" />
              2. How We Protect Your Data
            </h2>
            <p>
              We implement industry-standard database access controls and zero-trust security rules. Customer booking records are strictly isolated. We never sell, rent, or trade customer contact information to third-party marketing companies. Chauffeurs are only provided with the trip details necessary to complete your ride.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#F5B91B]" />
              3. Communication Channels
            </h2>
            <p>
              When you submit a booking request, we may communicate via SMS, phone call, or WhatsApp to confirm driver assignment, update flight delays, or share your chauffeur's direct contact.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-white font-['Outfit'] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#F5B91B]" />
              4. Contacting Data Protection
            </h2>
            <p>
              If you wish to review, update, or request the deletion of your booking record after your trip is completed, please reach out to our Galle headquarters at support@galletaxi.lk.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
};
