import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, MessageSquare, CheckCircle2, Send, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useApp } from '../lib/store';

export const ContactPage: React.FC = () => {
  const navigate = useNavigate();
  const { siteSettings } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const cleanWhatsApp = siteSettings.whatsappNumber.replace(/[^0-9]/g, '');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does airport pickup work at Colombo Bandaranaike Airport (CMB)?',
      a: 'Your designated chauffeur will track your flight number in real-time. Once you clear customs and baggage claim, look for your chauffeur in the main arrival lobby holding a clear Galle Taxi nameboard with your name. They will assist with your luggage and escort you directly to your air-conditioned vehicle.',
    },
    {
      q: 'Are Southern Expressway (E01) highway toll tickets included in the price?',
      a: 'Yes! All our airport transfers and inter-city rates include expressway toll charges, parking fees, and driver allowances. You will never be asked to pay extra for toll booths.',
    },
    {
      q: 'What happens if my flight is delayed?',
      a: 'We monitor flight arrivals continuously. Delayed flights incur zero waiting charges. Your chauffeur will automatically adjust pickup timing to match your actual landing time.',
    },
    {
      q: 'Can you provide baby / infant car seats?',
      a: 'Yes, certified European-standard child seats are available upon advance request at no additional charge. Please indicate this in the special instructions during booking.',
    },
    {
      q: 'What is your cancellation policy?',
      a: 'We offer free cancellation up to 6 hours before your scheduled pickup time. Simply message our dispatch team on WhatsApp or reply to your confirmation.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B0B0D] py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-12">
        
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
            Support Desk & HQ
          </div>
        </div>

        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="text-xs uppercase tracking-widest text-[#F5B91B] font-bold">
            24/7 Southern Chauffeur Support
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white font-['Outfit']">
            Contact <span className="text-[#F5B91B]">Galle Taxi</span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Have questions about custom itineraries, group airport transfers, or corporate accounts? Reach our 24/7 Galle control desk.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Office & 24/7 Hotlines: 5 cols */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
              <h2 className="text-xl font-bold text-white font-['Outfit']">Headquarters & Dispatch Desk</h2>
              
              <div className="space-y-4 text-sm text-slate-300">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">Office Location:</span>
                    <span className="font-semibold text-white">{siteSettings.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">24/7 Telephone Hotline:</span>
                    <a href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`} className="font-semibold text-white hover:text-[#F5B91B]">
                      {siteSettings.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MessageSquare className="w-5 h-5 text-[#25D366] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">WhatsApp Support:</span>
                    <a
                      href={`https://wa.me/${cleanWhatsApp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-[#25D366] hover:underline"
                    >
                      {siteSettings.whatsappNumber}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">Inquiries Email:</span>
                    <span className="font-semibold text-white">{siteSettings.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#F5B91B] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs text-slate-400 block">Operating Hours:</span>
                    <span className="font-semibold text-white">{siteSettings.operatingHours}</span>
                  </div>
                </div>
              </div>

              {/* Fast WhatsApp CTA */}
              <div className="pt-4 border-t border-[#1F1F23]">
                <a
                  href={`https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
                    'Hello Galle Taxi, I would like to speak with a dispatcher.'
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-[#25D366] hover:bg-[#20BA5A] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-950/40"
                >
                  <MessageSquare className="w-4 h-4 fill-white" />
                  <span>Start WhatsApp Conversation</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form: 7 cols */}
          <div className="lg:col-span-7 bg-[#141416] border border-[#27272A] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
            <h2 className="text-xl font-bold text-white font-['Outfit']">Send Us an Inquiry</h2>

            {submitted ? (
              <div className="p-8 text-center space-y-3 bg-[#0B0B0D] border border-emerald-800/60 rounded-xl">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Thank You for Reaching Out</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Our dispatch operations team has received your message and will respond within 30 minutes via email or WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-4 py-2 rounded-lg bg-[#27272A] text-xs font-semibold text-white"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Your Full Name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      required
                      className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                      className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Your Message or Custom Tour Itinerary *</label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your dates, flight details, destinations in Sri Lanka, or specific vehicle preferences..."
                    required
                    className="w-full px-3 py-2.5 bg-[#0B0B0D] border border-[#27272A] rounded-lg text-sm text-white focus:outline-none focus:border-[#F5B91B]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#F5B91B] hover:bg-[#E5A812] text-black font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#F5B91B]/20"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>

        {/* FAQs Accordion */}
        <div className="space-y-6 pt-10 border-t border-[#1F1F23]">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-slate-400">Everything you need to know about taxi travel in Galle & Southern Sri Lanka</p>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-[#141416] border border-[#27272A] rounded-xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 text-white font-semibold text-sm hover:text-[#F5B91B]"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#F5B91B] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-[#1F1F23] pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
