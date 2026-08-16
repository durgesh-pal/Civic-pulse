import React from 'react';
import { Issue } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { MapPin, ThumbsUp, Clock, ArrowRight, MessageSquare, ShieldAlert } from 'lucide-react';
import { timeAgo } from '../../lib/utils';

interface IssueCardProps {
  issue: Issue;
  onSelect: (issue: Issue) => void;
  onUpvote?: (issueId: string) => void;
  showAssignee?: boolean;
}

export const IssueCard: React.FC<IssueCardProps> = ({
  issue,
  onSelect,
  onUpvote,
  showAssignee = true,
}) => {
  return (
    <div
      onClick={() => onSelect(issue)}
      className="bg-white rounded-2xl border border-slate-200 hover:border-blue-400 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer group"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              {issue.ticketNumber}
            </span>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
          </div>

          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {timeAgo(issue.createdAt)}
          </span>
        </div>

        {/* Thumbnail & Title */}
        <div className="flex gap-3.5 items-start mb-3">
          <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
            <img
              src={issue.beforeImage}
              alt={issue.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            {issue.status === 'Resolved' && (
              <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center text-white font-bold text-[9px] uppercase tracking-wider">
                Resolved
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm text-slate-900 line-clamp-2 group-hover:text-blue-600 transition leading-snug">
              {issue.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{issue.location.address}</span>
            </p>
          </div>
        </div>

        {/* Priority Score Engine Bar */}
        <div className="mb-3">
          <PriorityScoreBadge breakdown={issue.priorityScore} interactive={false} />
        </div>
      </div>

      {/* Footer Info: Department, SLA & Upvotes */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          {/* Upvote button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpvote?.(issue.id);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 font-bold transition active:scale-95"
            title="Upvote to boost priority"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{issue.upvotes}</span>
          </button>

          {/* Comments count */}
          <span className="flex items-center gap-1 text-slate-400">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{issue.comments.length}</span>
          </span>
        </div>

        {/* SLA remaining */}
        <div className="flex items-center gap-1">
          {issue.status === 'Resolved' ? (
            <span className="text-emerald-600 font-semibold text-[11px]">✔ Completed</span>
          ) : (
            <span
              className={`font-semibold text-[11px] flex items-center gap-1 ${
                issue.sla.isOverdue
                  ? 'text-rose-600 font-bold'
                  : issue.sla.breachRisk === 'Warning'
                  ? 'text-amber-600'
                  : 'text-slate-600'
              }`}
            >
              <Clock className="w-3 h-3" />
              {issue.sla.isOverdue
                ? 'OVERDUE'
                : `${Math.max(0, Math.round(issue.sla.remainingHours))}h SLA`}
            </span>
          )}

          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
        </div>
      </div>
    </div>
  );
};
