import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { IssueCard } from '../components/issues/IssueCard';
import { MapPin, ThumbsUp, Flame, Navigation } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NearbyIssuesPage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((d) => setIssues(d.issues || []))
      .finally(() => setLoading(false));
  }, []);

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
        showToast('Upvoted! Locality issue priority boosted.', 'success');
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full mb-1">
            <Flame className="w-3.5 h-3.5" />
            <span>Community Locality Feed</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 font-heading">
            Nearby Grievances in Indiranagar Ward 112
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upvoting increases municipal priority scores and accelerates department dispatch without duplicate filings
          </p>
        </div>

        <button
          onClick={() => onNavigate('map_explore')}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
        >
          <Navigation className="w-4 h-4 text-blue-600" />
          <span>Switch to Map View</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {issues.map((issue) => (
          <IssueCard
            key={issue.id}
            issue={issue}
            onSelect={(i) => onNavigate(`issue_detail_${i.id}`)}
            onUpvote={handleUpvote}
          />
        ))}
      </div>
    </div>
  );
};
