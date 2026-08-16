import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Map,
  Bell,
  User as UserIcon,
  HelpCircle,
  Sliders,
  Building2,
  Users,
  Clock,
  BarChart3,
  CheckCircle2,
  HardHat,
  ShieldCheck,
  Flame,
  AlertOctagon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  const { role, logout, user } = useAuth();

  // Navigation configurations per role
  const getNavItems = (currentRole: Role) => {
    switch (currentRole) {
      case 'CITIZEN':
        return [
          { id: 'citizen_dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'report_issue', label: 'Report Issue', icon: PlusCircle, badge: 'New', highlight: true },
          { id: 'my_reports', label: 'My Reports', icon: FileText },
          { id: 'nearby_issues', label: 'Nearby Issues', icon: MapPin },
          { id: 'map_explore', label: 'Civic Map', icon: Map },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'profile', label: 'Citizen Profile', icon: UserIcon },
          { id: 'help_support', label: 'Help & FAQ', icon: HelpCircle },
        ];

      case 'AUTHORITY':
        return [
          { id: 'authority_dashboard', label: 'Overview & Triage', icon: LayoutDashboard },
          { id: 'issue_management', label: 'Issue Management', icon: Sliders, badge: 'Active' },
          { id: 'map_explore', label: 'Ward GIS Map', icon: Map },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'sla_monitoring', label: 'SLA Monitoring', icon: Clock, badge: 'Live' },
          { id: 'analytics', label: 'City Analytics', icon: BarChart3 },
          { id: 'notifications', label: 'Dispatches & Alerts', icon: Bell },
          { id: 'profile', label: 'Authority Profile', icon: UserIcon },
        ];

      case 'FIELD_WORKER':
        return [
          { id: 'worker_dashboard', label: 'My Work Orders', icon: HardHat, badge: 'Assigned' },
          { id: 'map_explore', label: 'Navigation Map', icon: MapPin },
          { id: 'my_resolved_tasks', label: 'Work History', icon: CheckCircle2 },
          { id: 'notifications', label: 'Task Alerts', icon: Bell },
          { id: 'profile', label: 'Worker Profile', icon: UserIcon },
        ];

      case 'ADMIN':
        return [
          { id: 'admin_dashboard', label: 'Master Console', icon: ShieldCheck },
          { id: 'authority_dashboard', label: 'Authority View', icon: LayoutDashboard },
          { id: 'issue_management', label: 'All Issues', icon: Sliders },
          { id: 'departments', label: 'Departments', icon: Building2 },
          { id: 'analytics', label: 'Executive Analytics', icon: BarChart3 },
          { id: 'spam_inspection', label: 'Spam / Fraud Filter', icon: AlertOctagon },
          { id: 'notifications', label: 'System Logs', icon: Bell },
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems(role);

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 border-r border-slate-800 min-h-[calc(100vh-4rem)]">
      {/* Current Persona Card */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt="User"
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-blue-500/30"
          />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
            <p className="text-[11px] text-blue-400 font-medium truncate">
              {role === 'CITIZEN'
                ? 'Verified Citizen'
                : role === 'AUTHORITY'
                ? 'Municipal Officer'
                : role === 'FIELD_WORKER'
                ? 'Field Officer'
                : 'System Super Admin'}
            </p>
            <p className="text-[10px] text-slate-400 truncate">
              {user?.departmentName || user?.assignedArea || 'Bengaluru Central'}
            </p>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : item.highlight
                  ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50 border border-blue-700/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.highlight
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Emergency Helpline */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/30 space-y-2">
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/50 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Civic Emergency: 1913</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">24x7 Municipal Control Room</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
