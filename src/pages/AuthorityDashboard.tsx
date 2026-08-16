import React, { useEffect, useState } from 'react';
import { Issue, Department, User } from '../types';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { PriorityScoreBadge } from '../components/issues/PriorityScoreBadge';
import {
  AlertTriangle,
  Building2,
  Clock,
  CheckCircle2,
  HardHat,
  Sliders,
  Sparkles,
  ArrowRight,
  Filter,
  ShieldAlert,
  MapPin,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { formatDate, timeAgo } from '../lib/utils';

export const AuthorityDashboard: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();

  const [issues, setIssues] = useState<Issue[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Quick Dispatch modal state
  const [dispatchIssue, setDispatchIssue] = useState<Issue | null>(null);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [issuesRes, deptsRes, workersRes] = await Promise.all([
        fetch('/api/issues'),
        fetch('/api/departments'),
        fetch('/api/workers'),
      ]);

      const issuesData = await issuesRes.json();
      const deptsData = await deptsRes.json();
      const workersData = await workersRes.json();

      setIssues(issuesData.issues || []);
      setDepartments(deptsData.departments || []);
      setWorkers(workersData.workers || []);
    } catch (e) {
      console.warn('Failed to load authority data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // Filter issues by priority score high to low for triage queue
  const triageQueue = [...issues]
    .filter((i) => i.status === 'Submitted' || i.status === 'Under Review' || i.status === 'Verified')
    .sort((a, b) => b.priorityScore.score - a.priorityScore.score);

  const pendingVerification = issues.filter(
    (i) => i.afterImage && i.status !== 'Resolved'
  );

  const criticalHazards = issues.filter(
    (i) => i.priority === 'Critical' && i.status !== 'Resolved'
  );

  const overdueBreaches = issues.filter(
    (i) => i.sla.isOverdue && i.status !== 'Resolved'
  );

  // Recharts data
  const categoryData = [
    { name: 'Roads', value: issues.filter((i) => i.category === 'Road Damage').length, color: '#3b82f6' },
    { name: 'Garbage', value: issues.filter((i) => i.category === 'Garbage Accumulation').length, color: '#10b981' },
    { name: 'Lights', value: issues.filter((i) => i.category === 'Street Light Issue').length, color: '#f59e0b' },
    { name: 'Water', value: issues.filter((i) => i.category === 'Water Leakage').length, color: '#6366f1' },
    { name: 'Drainage', value: issues.filter((i) => i.category === 'Drainage & Sewerage').length, color: '#ec4899' },
  ];

  const handleQuickDispatch = async () => {
    if (!dispatchIssue) return;
    try {
      const res = await fetch(`/api/issues/${dispatchIssue.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId || departments[0]?.id,
          workerId: selectedWorkerId || workers[0]?.id,
          authorityName: user?.name || 'Rajesh Verma (IAS)',
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues((prev) => prev.map((i) => (i.id === dispatchIssue.id ? data.issue : i)));
        setDispatchIssue(null);
        showToast(`Dispatched ${dispatchIssue.ticketNumber} to field officer!`, 'success');
      }
    } catch (e) {
      showToast('Dispatch failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-400/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Municipal Command & Control Center • Bengaluru Central</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">
            Authority Triage & Dispatch Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Logged in as <strong>{user?.name}</strong>. Monitor incoming civic grievances, AI hazard priority ranks, and field worker work orders.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('issue_management')}
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition active:scale-95"
          >
            <Sliders className="w-4 h-4" />
            <span>Master Issue Table</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Triage Queue"
          value={triageQueue.length}
          subtitle="Awaiting department dispatch"
          icon={Sliders}
          color="blue"
        />
        <StatCard
          title="Critical P0 Hazards"
          value={criticalHazards.length}
          subtitle="Immediate public safety risk"
          icon={ShieldAlert}
          color="rose"
        />
        <StatCard
          title="Live SLA Overdue"
          value={overdueBreaches.length}
          subtitle="Exceeded guaranteed hours"
          icon={Clock}
          color="amber"
          trend="Escalated to Zonal Head"
          trendPositive={false}
        />
        <StatCard
          title="Resolution Proofs"
          value={pendingVerification.length}
          subtitle="Awaiting IAS verification"
          icon={CheckCircle2}
          color="emerald"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Category Grievance Volume
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-semibold text-slate-600">
            {categoryData.map((c) => (
              <span key={c.name} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name} ({c.value})
              </span>
            ))}
          </div>
        </div>

        {/* Department SLA Benchmark Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
              Department SLA Compliance Benchmarks (%)
            </h3>
            <span className="text-xs text-blue-600 font-bold">Target &gt; 90%</span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departments.map((d) => ({
                  name: d.code,
                  compliance: d.slaComplianceRate,
                }))}
              >
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} domain={[70, 100]} />
                <Tooltip />
                <Bar dataKey="compliance" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Priority Triage Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-black text-slate-900 font-heading flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Smart AI Triage Queue (Sorted by Priority Score 100 → 0)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ranked dynamically by severity, citizen upvotes, traffic density, and age
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            {triageQueue.length} Pending Triage
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Ticket / Priority</th>
                <th className="py-2.5 px-3">AI Score</th>
                <th className="py-2.5 px-3">Subject & Category</th>
                <th className="py-2.5 px-3">Ward Location</th>
                <th className="py-2.5 px-3">SLA Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {triageQueue.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-3">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {issue.ticketNumber}
                      </span>
                      <div>
                        <PriorityBadge priority={issue.priority} />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    <PriorityScoreBadge breakdown={issue.priorityScore} />
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <p className="font-bold text-slate-900 line-clamp-1">{issue.title}</p>
                    <p className="text-[11px] text-slate-500">{issue.category}</p>
                  </td>

                  <td className="py-3 px-3 max-w-xs">
                    <p className="text-slate-700 truncate">{issue.location.address}</p>
                    <p className="text-[10px] text-slate-400 font-mono">👍 {issue.upvotes} upvotes</p>
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`font-bold font-mono text-[11px] ${
                        issue.sla.isOverdue ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      {issue.sla.isOverdue
                        ? 'OVERDUE'
                        : `${Math.round(issue.sla.remainingHours)}h Left`}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => setDispatchIssue(issue)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition"
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={() => onNavigate(`issue_detail_${issue.id}`)}
                      className="px-2.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK DISPATCH MODAL */}
      {dispatchIssue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 font-heading">
              Dispatch {dispatchIssue.ticketNumber}
            </h3>
            <p className="text-xs text-slate-600">{dispatchIssue.title}</p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Target Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.slaComplianceRate}% SLA compliance)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Assign Field Officer</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.assignedArea || 'Central Zone'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setDispatchIssue(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickDispatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
