import React, { useEffect, useState } from 'react';
import { StatCard } from '../components/common/StatCard';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

export const AnalyticsPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { showToast } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => r.json())
      .then((d) => setAnalytics(d))
      .finally(() => setLoading(false));
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#6366f1', '#ec4899', '#8b5cf6'];

  if (loading || !analytics) {
    return <div className="py-24 text-center text-xs text-slate-500">Loading civic analytics...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Smart City Civic Intelligence & SLA Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time telemetry, turnaround metrics, and municipal performance benchmarks for SIH25031
          </p>
        </div>

        <button
          onClick={() => showToast('Analytics report downloaded', 'info')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Intelligence Brief</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Reports"
          value={analytics.summary.totalReports}
          subtitle="Registered in system"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Resolution Rate"
          value={`${analytics.summary.resolutionRate}%`}
          subtitle="Verified by authorities"
          icon={CheckCircle2}
          color="emerald"
          trend="+4.2%"
          trendPositive={true}
        />
        <StatCard
          title="Avg Turnaround"
          value={`${analytics.summary.averageResolutionHours} hrs`}
          subtitle="From filing to physical fix"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Citizen Trust Score"
          value={`${analytics.summary.citizenSatisfactionScore} / 5.0`}
          subtitle="Based on 4,800+ ratings"
          icon={TrendingUp}
          color="indigo"
        />
      </div>

      {/* Graphs Row 1: 7-Day Trend + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm font-heading">
                7-Day Complaint Inflow vs Resolution Throughput
              </h3>
              <p className="text-xs text-slate-500">Daily volume of reported and resolved civic tickets</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">
              Stable Velocity
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.dailyTrends}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="reported"
                  name="Grievances Logged"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorReported)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Repairs Completed"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              Grievance Domain Share
            </h3>
            <p className="text-xs text-slate-500">Distribution across major civic categories</p>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="category"
                >
                  {analytics.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-semibold text-slate-600">
            {analytics.categoryDistribution.map((c: any, idx: number) => (
              <span key={c.category} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                {c.category} ({c.count})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Department SLA Compliance Performance */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm font-heading">
              Municipal Wing Resolution Compliance Rates (%)
            </h3>
            <p className="text-xs text-slate-500">Percentage of complaints resolved strictly within guaranteed SLA hours</p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.departmentStats}>
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[70, 100]} />
              <Tooltip />
              <Bar dataKey="complianceRate" name="SLA Compliance %" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
