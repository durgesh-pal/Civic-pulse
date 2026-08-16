import React from 'react';
import { Issue } from '../../types';
import { AlertTriangle, ThumbsUp, ArrowRight, X, MapPin } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';

interface DuplicateAlertModalProps {
  matchingIssues: {
    issue: Issue;
    similarityScore: number;
    distanceMeters: number;
    reason: string;
  }[];
  onUpvoteExisting: (issueId: string) => void;
  onProceedAnyway: () => void;
  onClose: () => void;
}

export const DuplicateAlertModal: React.FC<DuplicateAlertModalProps> = ({
  matchingIssues,
  onUpvoteExisting,
  onProceedAnyway,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-200 p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-950 font-heading">
                Potential Duplicate Issue Detected Nearby!
              </h3>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Our spatial AI detected similar civic grievances already registered within 500 meters.
                Upvoting helps increase municipal priority without creating redundant tickets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-amber-800 hover:text-amber-950 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Issues List */}
        <div className="p-5 max-h-96 overflow-y-auto space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Similar Active Reports Found ({matchingIssues.length}):
          </p>

          {matchingIssues.map(({ issue, distanceMeters, similarityScore, reason }) => (
            <div
              key={issue.id}
              className="bg-slate-50 rounded-xl border border-slate-200 p-3.5 flex flex-col sm:flex-row gap-3.5 items-start justify-between hover:border-blue-300 transition"
            >
              <img
                src={issue.beforeImage}
                alt={issue.title}
                className="w-full sm:w-28 h-24 rounded-lg object-cover border border-slate-200 shrink-0"
              />

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                    {issue.ticketNumber}
                  </span>
                  <StatusBadge status={issue.status} />
                  <PriorityBadge priority={issue.priority} />
                </div>

                <h4 className="text-xs font-bold text-slate-900 leading-snug">{issue.title}</h4>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{issue.location.address}</span>
                  <strong className="text-amber-700 font-semibold shrink-0">
                    ({distanceMeters}m away)
                  </strong>
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-600">
                    👍 {issue.upvotes} Citizens Supported
                  </span>

                  <button
                    onClick={() => onUpvoteExisting(issue.id)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Upvote & Boost Priority
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Go Back & Edit
          </button>

          <button
            onClick={onProceedAnyway}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <span>My issue is different (Submit as New Ticket)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
