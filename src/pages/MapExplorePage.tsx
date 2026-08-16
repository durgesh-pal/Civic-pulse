import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { CivicMap } from '../components/map/CivicMap';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { PriorityScoreBadge } from '../components/issues/PriorityScoreBadge';
import { MapPin, ThumbsUp, ArrowRight, X, Clock, Layers, Filter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MapExplorePage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/issues')
      .then((r) => r.json())
      .then((d) => {
        setIssues(d.issues || []);
        if (d.issues && d.issues.length > 0) {
          setSelectedIssue(d.issues[0]);
        }
      })
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
        if (selectedIssue?.id === issueId) {
          setSelectedIssue(data.issue);
        }
        showToast('Upvoted! Civic priority boosted.', 'success');
      }
    } catch (e) {
      showToast('Upvote failed', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
            Ward GIS Civic Map Explorer
          </h1>
          <p className="text-xs text-slate-500">
            Real-time geospatial visualization of active infrastructure defects and resolved repairs
          </p>
        </div>

        <button
          onClick={() => onNavigate('report_issue')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          + Report Defect at Location
        </button>
      </div>

      {/* Main Map Container with Side Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Interactive Map with Layers */}
        <div className="lg:col-span-2">
          <CivicMap
            issues={issues}
            selectedIssueId={selectedIssue?.id}
            onSelectIssue={(issue) => setSelectedIssue(issue)}
            heightClass="h-[600px]"
            showFilters={true}
          />
        </div>

        {/* Right 1 Col: Selected Issue Detail Card */}
        <div className="space-y-4">
          {selectedIssue ? (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4 animate-in fade-in">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {selectedIssue.ticketNumber}
                  </span>
                  <StatusBadge status={selectedIssue.status} />
                  <PriorityBadge priority={selectedIssue.priority} />
                </div>
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 relative">
                <img
                  src={selectedIssue.beforeImage}
                  alt={selectedIssue.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {selectedIssue.title}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{selectedIssue.location.address}</span>
                </p>
              </div>

              {/* Priority Engine Score */}
              <PriorityScoreBadge breakdown={selectedIssue.priorityScore} />

              {/* Department & SLA */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Assigned Wing:</span>
                  <span className="font-bold text-slate-900">
                    {selectedIssue.departmentName || 'Pending Triage'}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>SLA Countdown:</span>
                  <span
                    className={`font-bold font-mono ${
                      selectedIssue.sla.isOverdue ? 'text-rose-600' : 'text-slate-900'
                    }`}
                  >
                    {selectedIssue.status === 'Resolved'
                      ? 'Completed'
                      : selectedIssue.sla.isOverdue
                      ? 'OVERDUE'
                      : `${Math.round(selectedIssue.sla.remainingHours)} Hours`}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
                <button
                  onClick={() => handleUpvote(selectedIssue.id)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Upvote ({selectedIssue.upvotes})</span>
                </button>

                <button
                  onClick={() => onNavigate(`issue_detail_${selectedIssue.id}`)}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                >
                  <span>View Full Case Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-xs text-slate-400">
              Click on any map pin to inspect defect details
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-slate-900 text-white rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[10px]">
              Ward Summary
            </h4>
            <div className="flex justify-between">
              <span className="text-slate-400">Active Map Pins:</span>
              <span className="font-bold font-mono">{issues.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Critical Red Pins:</span>
              <span className="font-bold text-rose-400 font-mono">
                {issues.filter((i) => i.priority === 'Critical').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
