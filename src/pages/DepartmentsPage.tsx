import React, { useState, useEffect } from 'react';
import { Department } from '../types';
import { Building2, CheckCircle2, Clock, Users, Phone, Mail, TrendingUp, AlertTriangle } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';

export const DepartmentsPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/departments')
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-black text-slate-900 font-heading">
          Municipal Departments & SLA Compliance Benchmarks
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Government departments assigned to resolve crowdsourced civic issues across Bengaluru zones
        </p>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Active Wings"
          value={departments.length}
          subtitle="PWD, Sanitation, Water, Power"
          icon={Building2}
          color="blue"
        />
        <StatCard
          title="Overall SLA Compliance"
          value="94.6%"
          subtitle="City-wide average resolution speed"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Field Officers On Duty"
          value="184 Officers"
          subtitle="Dispatched across 198 wards"
          icon={Users}
          color="indigo"
        />
      </div>

      {/* Department Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div
            key={dept.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold font-mono">
                  {dept.code}
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                    dept.slaComplianceRate >= 95
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {dept.slaComplianceRate}% SLA
                </span>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base font-heading">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{dept.description}</p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>SLA Efficiency Rating:</span>
                  <span className="font-mono text-blue-600">{dept.slaComplianceRate}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${dept.slaComplianceRate}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Officer Contact Info */}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Head Officer:</span>
                <span className="font-bold text-slate-800">{dept.headOfficer}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Control Helpline:</span>
                <a href={`tel:${dept.contactPhone}`} className="text-blue-600 font-mono font-bold hover:underline">
                  {dept.contactPhone}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
