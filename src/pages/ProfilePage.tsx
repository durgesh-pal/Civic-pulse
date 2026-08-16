import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Award, User as UserIcon, Shield, CheckCircle2, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { RoleBadge } from '../components/common/Badge';

export const ProfilePage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, role } = useAuth();

  const badges = [
    { title: 'Civic Hero', desc: 'Reported 5+ verified hazards', unlocked: true, icon: '🛡️' },
    { title: 'Pothole Spotter', desc: 'Resolved 3 PWD road damages', unlocked: true, icon: '🚧' },
    { title: 'Clean City Champion', desc: 'Sanitation report verified', unlocked: true, icon: '🌱' },
    { title: 'Ward Guardian', desc: 'Earned 100+ community upvotes', unlocked: false, icon: '👑' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <img
          src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt="Avatar"
          className="w-24 h-24 rounded-2xl object-cover border-2 border-blue-500/20 shadow-md"
        />

        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900 font-heading">{user?.name}</h1>
            <RoleBadge role={role} />
          </div>

          <p className="text-xs text-slate-500 font-mono flex items-center justify-center sm:justify-start gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{user?.email}</span>
            <span className="mx-1">•</span>
            <Phone className="w-3.5 h-3.5" />
            <span>{user?.phone}</span>
          </p>

          <p className="text-xs text-slate-600 flex items-center justify-center sm:justify-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{user?.assignedArea || user?.departmentName || 'Ward 112 - Indiranagar, Bengaluru'}</span>
          </p>
        </div>

        {/* Civic Score Counter */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center min-w-[140px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
            Civic Score
          </span>
          <span className="text-3xl font-black text-amber-900 font-heading">
            {user?.civicScore || 185}
          </span>
          <span className="text-[11px] font-semibold text-amber-700 block mt-0.5">
            {user?.badge || 'Civic Hero'}
          </span>
        </div>
      </div>

      {/* Badges & Gamification Showcase */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Civic Contribution Badges</span>
          </h2>
          <p className="text-xs text-slate-500">
            Earn civic points and unlock recognition for keeping your neighborhood clean and safe
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((b) => (
            <div
              key={b.title}
              className={`p-4 rounded-2xl border flex items-center gap-4 transition ${
                b.unlocked
                  ? 'bg-amber-50/50 border-amber-200/80 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div className="text-3xl">{b.icon}</div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
                  {b.unlocked && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      Unlocked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
