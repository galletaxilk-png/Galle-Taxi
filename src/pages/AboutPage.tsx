import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Award, Users, HeartHandshake, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../lib/store';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();
  const { siteSettings } = useApp();

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-12">
        
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
            Heritage & Fleet
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            Heritage & Chauffeur Excellence
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
            About <span className="text-[#F5B91B]">Galle Taxi</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Rooted in the historic ramparts of Galle Fort, delivering international hospitality and safe, comfortable journeys across Sri Lanka.
          </p>
        </div>

        {/* Narrative Section */}
        <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-8 sm:p-12 space-y-6 shadow-2xl">
          <h2 className="text-2xl font-bold text-white font-['Outfit']">
            Our Story & Commitment
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            {siteSettings.aboutStory}
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Traveling through Sri Lanka should be serene, scenic, and completely stress-free. Whether you are landing at Colombo Bandaranaike Airport after an international flight, heading down to the surf breaks of Weligama and Mirissa, or journeying up to the misty tea plantations of Ella, our chauffeurs ensure you travel in absolute comfort.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-[#1F1F23]">
            <div className="space-y-2">
              <div className="text-3xl font-extrabold font-['Outfit'] text-[#F5B91B]">12+</div>
              <div className="text-xs font-semibold text-white uppercase">Years in Southern Tourism</div>
              <p className="text-[11px] text-slate-400">Serving international guests and luxury boutique resorts.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-extrabold font-['Outfit'] text-[#F5B91B]">100%</div>
              <div className="text-xs font-semibold text-white uppercase">Expressway Tolls Included</div>
              <p className="text-[11px] text-slate-400">Zero hidden surcharges upon arrival at your villa or hotel.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-extrabold font-['Outfit'] text-[#F5B91B]">24/7</div>
              <div className="text-xs font-semibold text-white uppercase">Live Dispatch Support</div>
              <p className="text-[11px] text-slate-400">Continuous flight tracking and dedicated customer care.</p>
            </div>
          </div>
        </div>

        {/* 4 Pillars of Standard */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-white text-center font-['Outfit']">
            Our Four Operational Standards
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Passenger Safety First</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                All vehicles undergo strict technical inspections. Our chauffeurs possess commercial passenger endorsements and adhere strictly to island highway speed limits.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Hospitality & Cultural Insight</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our drivers are fluent in English and knowledgeable about local heritage, traditional spice gardens, wildlife viewpoints, and the best beachfront eateries.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Luggage & Family Friendly</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Traveling with children, elderly relatives, or surf equipment? We provide infant car seats upon advance request and large high-roof passenger vans with ample luggage space.
              </p>
            </div>

            <div className="bg-[#141416] border border-[#27272A] p-6 rounded-2xl space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#F5B91B]/10 flex items-center justify-center text-[#F5B91B]">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Upfront Transparent Pricing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                We believe in fair, predictable rates. What you are quoted is your guaranteed fare with no post-trip surprises, highway toll additions, or parking meter add-ons.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm shadow-xl shadow-[#F5B91B]/20 transition-all hover:scale-105"
          >
            <span>Book Your Chauffeur Today</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  );
};
