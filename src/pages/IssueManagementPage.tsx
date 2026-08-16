import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { PriorityScoreBadge } from '../components/issues/PriorityScoreBadge';
import { CIVIC_CATEGORIES } from '../lib/constants';
import {
  Search,
  Filter,
  Download,
  Sliders,
  Sparkles,
  ArrowUpDown,
  Building2,
  Clock,
  ThumbsUp,
  MapPin,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../lib/utils';

export const IssueManagementPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [sortBy, setSortBy] = useState<'priority' | 'date' | 'upvotes'>('priority');

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

  // Filter and sort
  const filteredIssues = issues
    .filter((issue) => {
      if (selectedCategory !== 'All' && issue.category !== selectedCategory) return false;
      if (selectedStatus !== 'All' && issue.status !== selectedStatus) return false;
      if (selectedPriority !== 'All' && issue.priority !== selectedPriority) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          issue.ticketNumber.toLowerCase().includes(q) ||
          issue.title.toLowerCase().includes(q) ||
          issue.location.address.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') return b.priorityScore.score - a.priorityScore.score;
      if (sortBy === 'upvotes') return b.upvotes - a.upvotes;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const handleExportCSV = () => {
    const headers = ['Ticket,Category,Priority,Score,Status,Address,Reporter,SLA_Overdue,Created_At'];
    const rows = filteredIssues.map((i) =>
      `"${i.ticketNumber}","${i.category}","${i.priority}",${i.priorityScore.score},"${i.status}","${i.location.address}","${i.reporterName}",${i.sla.isOverdue},"${i.createdAt}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `civicpulse_issues_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('CSV export downloaded successfully', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Master Issue Management & Triage Matrix
          </h1>
          <p className="text-xs text-slate-500">
            Comprehensive audit registry with multi-criteria filtering, priority scoring, and department assignment
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <Download className="w-4 h-4" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ticket #, street address, or title..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-blue-600 font-medium"
            />
          </div>

          {/* Category */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Categories</option>
            {CIVIC_CATEGORIES.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700"
          >
            <option value="priority">Sort: AI Priority Score (High → Low)</option>
            <option value="upvotes">Sort: Citizen Upvotes</option>
            <option value="date">Sort: Most Recent First</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
          <span>Showing <strong>{filteredIssues.length}</strong> matching grievances</span>
          {(searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
                setSelectedStatus('All');
                setSelectedPriority('All');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">AI Score</th>
                <th className="py-3 px-4">Category & Subject</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">SLA Countdown</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIssues.map((issue) => (
                <tr
                  key={issue.id}
                  onClick={() => onNavigate(`issue_detail_${issue.id}`)}
                  className="hover:bg-slate-50/80 cursor-pointer transition"
                >
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {issue.ticketNumber}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <PriorityScoreBadge breakdown={issue.priorityScore} />
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="font-bold text-slate-900 line-clamp-1">{issue.title}</p>
                    <p className="text-[11px] text-slate-500">{issue.category}</p>
                  </td>

                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-slate-700 truncate">{issue.location.address}</p>
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={issue.status} />
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">
                      {issue.departmentName || 'Unassigned'}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`font-mono font-bold text-[11px] ${
                        issue.status === 'Resolved'
                          ? 'text-emerald-600'
                          : issue.sla.isOverdue
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }`}
                    >
                      {issue.status === 'Resolved'
                        ? 'Done'
                        : issue.sla.isOverdue
                        ? 'OVERDUE'
                        : `${Math.round(issue.sla.remainingHours)}h`}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigate(`issue_detail_${issue.id}`);
                      }}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-lg font-bold transition text-xs"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
