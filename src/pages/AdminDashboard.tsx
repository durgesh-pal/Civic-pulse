import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import {
  ShieldCheck,
  AlertOctagon,
  Users,
  Database,
  RotateCcw,
  Sparkles,
  Server,
  Activity,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminDashboard: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    fetch('/api/users')
      .then((r) => r.json())
      .then((d) => setUsersList(d.users || []));
  }, []);

  const handleResetDatabase = async () => {
    if (!window.confirm('Re-seed the entire civic database with original SIH demo records?')) return;

    setIsResetting(true);
    try {
      const res = await fetch('/api/system/reset-demo-data', { method: 'POST' });
      const data = await res.json();
      showToast(data.message || 'Database re-seeded with demo records', 'success');
      setTimeout(() => window.location.reload(), 800);
    } catch (e) {
      showToast('Database reset failed', 'error');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-purple-800/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Administrator Root Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            Smart City Governance & System Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Admin: <strong>Dr. Meenakshi Sundaram</strong> • Master telemetry, spam heuristics, and database controls.
          </p>
        </div>

        <button
          onClick={handleResetDatabase}
          disabled={isResetting}
          className="flex items-center gap-2 px-5 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95 disabled:opacity-50"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo Database</span>
        </button>
      </div>

      {/* System Infrastructure Health */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Gemini Vision AI Engine</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-base font-bold text-slate-900">gemini-3.7-flash</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Operational (Latency: 380ms)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">GIS Spatial Cluster</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-base font-bold text-slate-900">Leaflet OpenStreetMap</p>
          <p className="text-[11px] text-emerald-600 font-semibold">198 Ward Boundaries Loaded</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">SLA Escalation Engine</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-base font-bold text-slate-900">Active Monitoring</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Auto-breach trigger 24/7</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase">Prisma Relational DB</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          </div>
          <p className="text-base font-bold text-slate-900">PostgreSQL Schema</p>
          <p className="text-[11px] text-emerald-600 font-semibold">Synchronized with in-memory store</p>
        </div>
      </div>

      {/* Spam & Fraud Inspector */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              AI Anti-Spam & Fraud Filter Inspector
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
            Zero False Positives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Photo EXIF Metadata Check</span>
            <p className="font-bold text-slate-800">100% Verified Camera Timestamps</p>
            <p className="text-slate-500 text-[11px]">Prevents recycled internet photos</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Spatial Deduplication Filter</span>
            <p className="font-bold text-slate-800">Haversine 500m Geo-Fencing</p>
            <p className="text-slate-500 text-[11px]">Redirects duplicate filings to upvotes</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Rate Limiting Safeguard</span>
            <p className="font-bold text-slate-800">Max 5 Reports / Citizen / Hour</p>
            <p className="text-slate-500 text-[11px]">Mitigates automated DDoS flooding</p>
          </div>
        </div>
      </div>

      {/* Stakeholder Directory */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm font-heading flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-600" />
          <span>Provisioned Platform Users & Roles ({usersList.length})</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Department / Area</th>
                <th className="py-2.5 px-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 px-3 text-slate-600">{u.email}</td>
                  <td className="py-3 px-3">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{u.departmentName || u.assignedArea || 'Citizen Locality'}</td>
                  <td className="py-3 px-3 font-mono text-slate-500">{u.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
