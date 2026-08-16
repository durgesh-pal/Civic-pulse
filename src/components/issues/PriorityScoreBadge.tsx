import React, { useState } from 'react';
import { PriorityScoreBreakdown } from '../../types';
import { Sparkles, Info, ShieldAlert } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const PriorityScoreBadge: React.FC<{
  breakdown: PriorityScoreBreakdown;
  interactive?: boolean;
}> = ({ breakdown, interactive = true }) => {
  const [showPopover, setShowPopover] = useState(false);

  const getScoreBarColor = (score: number) => {
    if (score >= 81) return 'bg-red-500 text-red-700';
    if (score >= 61) return 'bg-orange-500 text-orange-700';
    if (score >= 31) return 'bg-amber-500 text-amber-700';
    return 'bg-emerald-500 text-emerald-700';
  };

  return (
    <div className="relative inline-block">
      <div
        onClick={() => interactive && setShowPopover(!showPopover)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white shadow-xs ${
          interactive ? 'cursor-pointer hover:border-blue-300 transition' : ''
        }`}
      >
        <div className="flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span className="text-xs font-bold text-slate-700">AI Priority Score:</span>
        </div>

        {/* Score pill */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
            {breakdown.score}/100
          </span>
          <PriorityBadge priority={breakdown.calculatedLevel} />
        </div>

        {interactive && <Info className="w-3 h-3 text-slate-400" />}
      </div>

      {/* Popover explaining the formula: Severity*30 + Public Impact*25 + Urgency*20 + Affected Citizens*15 + Age*10 */}
      {showPopover && (
        <div
          className="absolute z-50 mt-2 left-0 w-80 bg-slate-900 text-white rounded-xl p-4 shadow-2xl border border-slate-800 text-xs animate-in fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-1.5 font-bold text-blue-400">
              <ShieldAlert className="w-4 h-4" />
              <span>Smart Priority Engine Formula</span>
            </div>
            <span className="font-mono font-bold text-emerald-400 text-xs">{breakdown.score} pts</span>
          </div>

          <p className="text-[11px] text-slate-300 mb-3 leading-relaxed">
            Standard SIH municipal priority formula calculated dynamically from real hazard factors:
          </p>

          <div className="space-y-2 font-mono text-[11px]">
            <div className="flex justify-between items-center text-slate-300">
              <span>Severity (Max 30):</span>
              <span className="font-bold text-white">+{breakdown.severityComponent} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full" style={{ width: `${(breakdown.severityComponent / 30) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Public Impact (Max 25):</span>
              <span className="font-bold text-white">+{breakdown.publicImpactComponent} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full" style={{ width: `${(breakdown.publicImpactComponent / 25) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Urgency Matrix (Max 20):</span>
              <span className="font-bold text-white">+{breakdown.urgencyComponent} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full" style={{ width: `${(breakdown.urgencyComponent / 20) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Affected Citizens ({breakdown.upvoteCount} upvotes):</span>
              <span className="font-bold text-white">+{breakdown.affectedCitizensComponent} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: `${(breakdown.affectedCitizensComponent / 15) * 100}%` }} />
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span>Age Escalation Factor (Max 10):</span>
              <span className="font-bold text-white">+{breakdown.ageComponent} pts</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full" style={{ width: `${(breakdown.ageComponent / 10) * 100}%` }} />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
            <span>0-30: Low | 31-60: Med</span>
            <span>61-80: High | 81-100: Critical</span>
          </div>
        </div>
      )}
    </div>
  );
};
