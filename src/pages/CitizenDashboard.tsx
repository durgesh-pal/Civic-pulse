import React, { useEffect, useState } from 'react';
import { Issue } from '../types';
import { StatCard } from '../components/common/StatCard';
import { IssueCard } from '../components/issues/IssueCard';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  CheckCircle2,
  Clock,
  Award,
  PlusCircle,
  MapPin,
  Flame,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

export const CitizenDashboard: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/issues');
      const data = await res.json();
      if (data.issues) {
        setIssues(data.issues);
      }
    } catch (e) {
      console.warn('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const myReports = issues.filter((i) => i.reporterId === user?.id || i.reporterId === 'user-citizen-1');
  const activeReports = myReports.filter((i) => i.status !== 'Resolved');
  const resolvedReports = myReports.filter((i) => i.status === 'Resolved');
  const nearbyIssues = issues.slice(0, 4);

  const handleUpvote = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues((prev) => prev.map((i) => (i.id === issueId ? data.issue : i)));
        showToast('Upvoted! Priority boosted.', 'success');
      }
    } catch (e) {
      showToast('Failed to upvote', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur">
              <Award className="w-3.5 h-3.5 text-amber-300" />
              <span>Civic Contributor Level: <strong>{user?.badge || 'Civic Hero'}</strong></span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
              Welcome back, {user?.name || 'Rahul Sharma'}!
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              Your active participation has helped resolve {resolvedReports.length + 3} civic issues in Ward 112 (Indiranagar).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('report_issue')}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-slate-100 text-blue-800 rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4 text-blue-600" />
              <span>Report New Grievance</span>
            </button>

            <button
              onClick={() => onNavigate('map_explore')}
              className="flex items-center gap-2 px-4 py-3 bg-blue-600/40 hover:bg-blue-600/60 border border-blue-400/30 text-white rounded-xl text-xs font-bold backdrop-blur transition"
            >
              <MapPin className="w-4 h-4 text-blue-300" />
              <span>Explore Ward Map</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Active Reports"
          value={activeReports.length}
          subtitle="Currently under department triage"
          icon={FileText}
          color="blue"
          onClick={() => onNavigate('my_reports')}
        />
        <StatCard
          title="Resolved for Me"
          value={resolvedReports.length || 2}
          subtitle="Backed by photo proof"
          icon={CheckCircle2}
          color="emerald"
          trend="+100% resolution"
          trendPositive={true}
        />
        <StatCard
          title="Civic Impact Score"
          value={`${user?.civicScore || 185} pts`}
          subtitle="Top 5% in Indiranagar Ward"
          icon={Award}
          color="amber"
          onClick={() => onNavigate('profile')}
        />
        <StatCard
          title="Ward SLA Compliance"
          value="96.4%"
          subtitle="Average 24h turnaround"
          icon={Clock}
          color="indigo"
        />
      </div>

      {/* Main Grid: My Active Grievances + Locality Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: My Submitted Grievances */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading">
                My Grievance Tracking
              </h2>
              <p className="text-xs text-slate-500">Live SLA countdown and department dispatch status</p>
            </div>

            <button
              onClick={() => onNavigate('my_reports')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View all ({myReports.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {myReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-xs text-slate-500">No active complaints filed by your account yet.</p>
              <button
                onClick={() => onNavigate('report_issue')}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                File First Complaint
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myReports.slice(0, 4).map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onSelect={(i) => onNavigate(`issue_detail_${i.id}`)}
                  onUpvote={handleUpvote}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Locality Hotspots & Nearby Issues to Upvote */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Nearby Grievances</span>
              </h2>
              <p className="text-xs text-slate-500">Upvote to prioritize your neighbourhood</p>
            </div>

            <button
              onClick={() => onNavigate('nearby_issues')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800"
            >
              Explore Map
            </button>
          </div>

          <div className="space-y-3">
            {nearbyIssues.map((issue) => (
              <div
                key={issue.id}
                onClick={() => onNavigate(`issue_detail_${issue.id}`)}
                className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex gap-3 items-start"
              >
                <img
                  src={issue.beforeImage}
                  alt={issue.title}
                  className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.2 rounded font-mono">
                      {issue.ticketNumber}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700">
                      👍 {issue.upvotes}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-800 truncate">{issue.title}</h4>
                  <p className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{issue.location.address}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Civic Gamification Card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-300/40 rounded-2xl p-4 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Next Reward: Silver Civic Guardian</span>
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Earn 15 more points by upvoting or verifying resolved issues to unlock the Silver Guardian badge!
            </p>
            <div className="w-full bg-amber-200/80 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-600 h-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
