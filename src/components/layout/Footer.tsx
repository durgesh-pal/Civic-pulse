import React from 'react';
import { Building2, Shield, Heart, Globe, PhoneCall } from 'lucide-react';

export const Footer: React.FC<{ onNavigate?: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold font-heading">
                CP
              </div>
              <span className="text-white font-extrabold text-base font-heading">
                Civic<span className="text-blue-500">Pulse</span>
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Smart India Hackathon (SIH25031) Crowdsourced Civic Issue Reporting and Resolution System.
              Connecting citizens, AI vision verification, municipal departments, and field personnel.
            </p>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Citizen Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate?.('report_issue')}
                  className="hover:text-blue-400 transition"
                >
                  Report Road Damage / Pothole
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('report_issue')}
                  className="hover:text-blue-400 transition"
                >
                  Report Solid Waste & Garbage
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('map_explore')}
                  className="hover:text-blue-400 transition"
                >
                  Interactive Ward Map
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate?.('my_reports')}
                  className="hover:text-blue-400 transition"
                >
                  Track Grievance SLA Status
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Key Departments */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Participating Wings
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>Public Works Department (PWD Roads)</li>
              <li>Solid Waste Management & Sanitation</li>
              <li>Electricity & Street Lighting Board</li>
              <li>Water Supply & Sewerage Board</li>
              <li>Stormwater Drainage Engineering</li>
            </ul>
          </div>

          {/* Col 4: Emergency Helplines */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <PhoneCall className="w-4 h-4" />
              <span>National Civic Helplines</span>
            </div>
            <p className="text-[11px] text-slate-300 font-mono">
              Municipal Control: <strong>1913</strong>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              Disaster Management: <strong>1077</strong>
            </p>
            <p className="text-[11px] text-slate-300 font-mono">
              National Emergency: <strong>112</strong>
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>© 2026 Smart India Hackathon (SIH25031) - CivicPulse Civic-Tech Platform.</p>
          <div className="flex items-center gap-4">
            <span>Public Open Data</span>
            <span>•</span>
            <span>WCAG 2.1 AA Compliant</span>
            <span>•</span>
            <span>Zero-Tolerance SLA</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
