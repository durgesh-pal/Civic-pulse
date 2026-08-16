import React, { useState } from 'react';
import { HelpCircle, PhoneCall, ChevronDown, ChevronUp, Shield, Sparkles, Building2 } from 'lucide-react';

export const HelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does Gemini AI Vision verify uploaded civic issue photos?',
      a: 'Our server-side Gemini 3.7 Flash engine analyzes uploaded photos to classify the problem category (Pothole, Waste, Streetlight), detect hazard severity, and extract EXIF/GPS coordinate consistency to filter out internet stock photos.',
    },
    {
      q: 'How is the Smart Priority Score (0-100) calculated?',
      a: 'Priority is calculated using a weighted multi-factor formula: Severity (30 pts) + Public Impact (25 pts) + Urgency Matrix (20 pts) + Community Upvotes (15 pts) + Age Escalation (10 pts). Higher priority scores guarantee faster SLA dispatch.',
    },
    {
      q: 'What happens when a spatial duplicate is detected?',
      a: 'When an issue is reported within 500 meters of an active complaint in the same category, our system prompts you to upvote the existing ticket instead. This aggregates community weight without creating redundant work orders.',
    },
    {
      q: 'How are resolution photos verified?',
      a: 'Field workers must upload geo-tagged after-repair photos on site. Municipal authorities inspect the before-and-after split comparison before closing the ticket. Citizens can also submit a 5-star satisfaction review.',
    },
    {
      q: 'What are the official municipal SLA response time limits?',
      a: 'Potholes and water pipe bursts have a 24-48 hour resolution SLA. Street light faults have a 24-hour turnaround. Solid waste accumulation is targeted within 12 hours.',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 font-heading">
          Citizen Help Center & SLA Guidelines
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about lodging complaints, AI verification, and municipal escalation
        </p>
      </div>

      {/* Emergency Helplines Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm font-heading">
          <PhoneCall className="w-5 h-5" />
          <span>24x7 Government Civic Control Rooms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Municipal Grievance</span>
            <span className="text-xl font-bold text-white">1913</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Disaster Management</span>
            <span className="text-xl font-bold text-amber-300">1077</span>
          </div>

          <div className="bg-white/10 p-3.5 rounded-xl border border-white/10">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">National Emergency</span>
            <span className="text-xl font-bold text-emerald-300">112</span>
          </div>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 font-heading flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs text-slate-900 hover:text-blue-600 transition"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>

              {openFaq === idx && (
                <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
