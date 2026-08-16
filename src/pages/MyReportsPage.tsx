import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { IssueCard } from '../components/issues/IssueCard';
import { PlusCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MyReportsPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [activeTab, setActiveTab] = useState<'All' | 'Active' | 'Resolved'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((d) => setIssues(d.issues || []))
      .finally(() => setLoading(false));
  }, []);

  const myReports = issues.filter(
    (i) => i.reporterId === user?.id || i.reporterId === 'user-citizen-1'
  );

  const displayedReports = myReports.filter((i) => {
    if (activeTab === 'Active') return i.status !== 'Resolved';
    if (activeTab === 'Resolved') return i.status === 'Resolved';
    return true;
  });

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
      showToast('Upvote failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            My Submitted Grievances
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track live SLA countdown, department progress, and rate resolved repair quality
          </p>
        </div>

        <button
          onClick={() => onNavigate('report_issue')}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Grievance</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {(['All', 'Active', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab} Reports ({myReports.filter((i) => tab === 'All' || (tab === 'Active' ? i.status !== 'Resolved' : i.status === 'Resolved')).length})
          </button>
        ))}
      </div>

      {/* Cards Grid */}
      {displayedReports.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No grievances in this view</h3>
          <p className="text-xs text-slate-500">You have no reports matching the selected filter.</p>
          <button
            onClick={() => onNavigate('report_issue')}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
          >
            Lodge a Complaint
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedReports.map((issue) => (
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
  );
};
