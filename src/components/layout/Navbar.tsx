import React, { useState } from 'react';
import {
  Bell,
  Shield,
  User as UserIcon,
  Search,
  Award,
  ChevronDown,
  LogOut,
  RotateCcw,
  CheckCheck,
  Building2,
  HardHat,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';
import { RoleBadge } from '../common/Badge';
import { timeAgo } from '../../lib/utils';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, onOpenSearch }) => {
  const {
    user,
    role,
    loginAsRole,
    logout,
    notifications,
    unreadCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    showToast,
  } = useAuth();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleResetData = async () => {
    try {
      await fetch('/api/system/reset-demo-data', { method: 'POST' });
      showToast('Database reset with fresh demo civic data', 'success');
      setTimeout(() => window.location.reload(), 600);
    } catch (e) {
      showToast('Failed to reset data', 'error');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-slate-900 tracking-tight text-lg font-heading">
                  Civic<span className="text-blue-600">Pulse</span>
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-200">
                  SIH25031
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium tracking-wide">
                NagarSewa & Grievance Resolution
              </p>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-100/80 hover:bg-slate-200/80 text-slate-500 text-xs font-medium rounded-lg border border-slate-200 transition"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-400" />
              <span>Search complaints by ID (e.g. CIV-2026-00101), location, or category...</span>
            </span>
            <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-600 rounded border border-slate-200 shadow-xs">
              /
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Persona Switcher & Notifications */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Demo Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold border border-slate-200 transition"
              title="Switch demo persona"
            >
              <span className="text-slate-400 font-normal hidden sm:inline">Role:</span>
              <RoleBadge role={role} />
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showRoleMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowRoleMenu(false)}
              >
                <div className="px-3 py-1.5 border-b border-slate-100">
                  <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">
                    SIH Demo Persona Switcher
                  </p>
                </div>
                <button
                  onClick={() => {
                    loginAsRole('CITIZEN');
                    onNavigate('citizen_dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-blue-50 transition ${
                    role === 'CITIZEN' ? 'bg-blue-50 font-bold text-blue-700' : 'text-slate-700'
                  }`}
                >
                  <UserIcon className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="font-semibold">Rahul Sharma</p>
                    <p className="text-[10px] text-slate-400">Citizen (Indiranagar Ward)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    loginAsRole('AUTHORITY');
                    onNavigate('authority_dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-indigo-50 transition ${
                    role === 'AUTHORITY' ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <p className="font-semibold">Rajesh Verma (IAS)</p>
                    <p className="text-[10px] text-slate-400">Municipal Authority & Triage Officer</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    loginAsRole('FIELD_WORKER');
                    onNavigate('worker_dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-emerald-50 transition ${
                    role === 'FIELD_WORKER' ? 'bg-emerald-50 font-bold text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  <HardHat className="w-4 h-4 text-emerald-600" />
                  <div>
                    <p className="font-semibold">Ramesh Kumar</p>
                    <p className="text-[10px] text-slate-400">Field Worker (PWD Roads Team)</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    loginAsRole('ADMIN');
                    onNavigate('admin_dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2.5 text-xs hover:bg-purple-50 transition ${
                    role === 'ADMIN' ? 'bg-purple-50 font-bold text-purple-700' : 'text-slate-700'
                  }`}
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="font-semibold">Dr. Meenakshi Sundaram</p>
                    <p className="text-[10px] text-slate-400">Smart City Super Admin</p>
                  </div>
                </button>

                <div className="pt-2 mt-1 border-t border-slate-100 px-3">
                  <button
                    onClick={handleResetData}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded font-medium transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Demo Database
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Citizen Civic Score Badge */}
          {role === 'CITIZEN' && user && (
            <button
              onClick={() => onNavigate('profile')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-full text-xs font-bold text-amber-800 transition"
              title="Civic Contribution Score"
            >
              <Award className="w-3.5 h-3.5 text-amber-600" />
              <span>{user.civicScore || 185} pts</span>
              <span className="text-[10px] text-amber-600 bg-amber-200/60 px-1.5 py-0.2 rounded-full font-medium">
                {user.badge || 'Civic Hero'}
              </span>
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.2 rounded-full font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-400">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.issueId) {
                            onNavigate(`issue_detail_${notif.issueId}`);
                          }
                          setShowNotifs(false);
                        }}
                        className={`p-3 text-left hover:bg-slate-50 cursor-pointer transition flex items-start gap-3 ${
                          !notif.isRead ? 'bg-blue-50/50' : ''
                        }`}
                      >
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                            !notif.isRead ? 'bg-blue-600' : 'bg-transparent'
                          }`}
                        />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-slate-800">{notif.title}</p>
                          <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">{timeAgo(notif.createdAt)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-slate-100 text-center">
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setShowNotifs(false);
                    }}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    View All Notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-blue-500/20 transition"
            >
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-300"
              />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="font-semibold text-xs text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                </div>

                <button
                  onClick={() => onNavigate('profile')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  My Profile & Contributions
                </button>

                <button
                  onClick={() => onNavigate('landing')}
                  className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-slate-400" />
                  Civic Portal Homepage
                </button>

                <div className="pt-2 mt-1 border-t border-slate-100">
                  <button
                    onClick={logout}
                    className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
