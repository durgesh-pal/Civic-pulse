import React from 'react';
import {
  PlusCircle,
  MapPin,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  Building2,
  HardHat,
  Users,
  Award,
  CheckCircle2,
  PhoneCall,
  Search,
} from 'lucide-react';
import { CIVIC_CATEGORIES } from '../lib/constants';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  const { loginAsRole } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        {/* Glow and grid effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/20 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Smart India Hackathon SIH25031 • Next-Gen Civic Resolution Engine</span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight font-heading max-w-4xl mx-auto leading-[1.15]">
            Empowering Citizens. <br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Resolving Civic Issues in Record Time.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Report potholes, garbage dumps, street lighting failures, and water leakages with 
            instant <strong>AI vision verification</strong>, strict <strong>SLA timelines</strong>, and 
            transparent <strong>before-and-after resolution proof</strong>.
          </p>

          {/* Primary Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => onNavigate('report_issue')}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 hover:scale-105 active:scale-95 transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Report a Civic Issue Now</span>
            </button>

            <button
              onClick={() => onNavigate('map_explore')}
              className="flex items-center gap-2 px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition"
            >
              <MapPin className="w-5 h-5 text-blue-400" />
              <span>Explore Ward GIS Map</span>
            </button>

            <button
              onClick={() => onNavigate('citizen_dashboard')}
              className="flex items-center gap-2 px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl backdrop-blur transition"
            >
              <span>Citizen Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time KPI Stats Counter Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-[11px] font-bold text-blue-300 uppercase tracking-wider">Reports Logged</p>
              <h3 className="text-2xl sm:text-3xl font-black text-white mt-0.5 font-heading">14,892+</h3>
              <p className="text-[10px] text-slate-400 mt-1">Across 198 municipal wards</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Resolved Cases</p>
              <h3 className="text-2xl sm:text-3xl font-black text-emerald-400 mt-0.5 font-heading">94.8%</h3>
              <p className="text-[10px] text-slate-400 mt-1">Backed by photo evidence</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">Average SLA Turnaround</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-300 mt-0.5 font-heading">28.4 hrs</h3>
              <p className="text-[10px] text-slate-400 mt-1">Guaranteed response protocol</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur">
              <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">Citizen Trust Score</p>
              <h3 className="text-2xl sm:text-3xl font-black text-indigo-300 mt-0.5 font-heading">4.8 / 5.0</h3>
              <p className="text-[10px] text-slate-400 mt-1">Over 8,200 public reviews</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Four-Step Resolution Lifecycle */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            End-to-End Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            How CivicPulse Resolves Complaints
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            A transparent 4-stage pipeline connecting citizen reports directly to municipal action.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-lg mb-4 font-heading">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Citizen Photo & GPS</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload a live photo with one click. GPS coordinates are automatically tagged to pinpoint the exact pothole or defect.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-lg mb-4 font-heading">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">AI Vision & Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini Vision classifies category, calculates hazard severity (0-100), checks spatial duplicates, and maps SLA deadline.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg mb-4 font-heading">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Department Dispatch</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Work order is automatically routed to the responsible department (PWD, Waste, BESCOM) and assigned to nearby field officers.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative group hover:border-blue-500 transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-lg mb-4 font-heading">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5">Proof Verification & Rating</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Field worker submits after-repair photo. Authority verifies quality, and the citizen receives a before/after split view to rate.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Problem Categories Grid with SLAs */}
      <section className="bg-slate-100/70 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Grievance Domains
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading mt-1">
                Reported Civic Categories & SLAs
              </h2>
            </div>
            <button
              onClick={() => onNavigate('report_issue')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Submit a complaint now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CIVIC_CATEGORIES.map((cat) => (
              <div
                key={cat.name}
                onClick={() => onNavigate('report_issue')}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{cat.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-medium">Standard SLA</span>
                  <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {cat.defaultSlaHours.Medium}h SLA
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SIH Demo Persona Portals */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            SIH Demonstration Mode
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Experience All Stakeholder Perspectives
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Switch between different government and citizen roles instantly to test the full resolution loop.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Persona 1: Citizen */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Citizen Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Report issues with camera photos, check duplicate alerts, track real-time SLA progress, and earn civic badges.
              </p>
            </div>
            <button
              onClick={() => {
                loginAsRole('CITIZEN');
                onNavigate('citizen_dashboard');
              }}
              className="mt-6 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Launch Citizen View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persona 2: Authority */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Municipal Authority</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Triage incoming complaints with priority scoring, assign field officers, monitor SLA breaches, and approve resolution photos.
              </p>
            </div>
            <button
              onClick={() => {
                loginAsRole('AUTHORITY');
                onNavigate('authority_dashboard');
              }}
              className="mt-6 w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Launch Authority Triage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persona 3: Field Worker */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Field Officer App</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive dispatched work orders, navigate to site coordinates, start repair jobs, and submit after-photos for verification.
              </p>
            </div>
            <button
              onClick={() => {
                loginAsRole('FIELD_WORKER');
                onNavigate('worker_dashboard');
              }}
              className="mt-6 w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Launch Field Worker App</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Persona 4: Super Admin */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-lg transition">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Super Admin Console</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                City-wide analytics, department compliance benchmarks, anti-spam filters, and master system settings.
              </p>
            </div>
            <button
              onClick={() => {
                loginAsRole('ADMIN');
                onNavigate('admin_dashboard');
              }}
              className="mt-6 w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>Launch Super Admin</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
