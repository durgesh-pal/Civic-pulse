import React from 'react';
import { IssueTimelineStep } from '../../types';
import { CheckCircle2, Clock, ShieldCheck, HardHat, FileText } from 'lucide-react';
import { formatDate } from '../../lib/utils';

export const StatusTimeline: React.FC<{ timeline: IssueTimelineStep[] }> = ({ timeline }) => {
  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
      {timeline.map((step, idx) => {
        const isLatest = idx === timeline.length - 1;
        
        return (
          <div key={step.id || idx} className="relative flex items-start gap-4 group">
            {/* Step Icon Node */}
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 z-10 transition ${
                isLatest
                  ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md scale-110'
                  : 'bg-emerald-600 text-white shadow-xs'
              }`}
            >
              {isLatest ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            </div>

            {/* Content card */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 p-3.5 shadow-xs transition group-hover:border-blue-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900">{step.title}</h4>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {formatDate(step.timestamp)}
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{step.description}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="font-semibold text-slate-700">{step.actorName}</span>
                  <span className="text-slate-400">({step.actorRole})</span>
                </div>

                {step.proofImageUrl && (
                  <span className="text-blue-600 font-semibold flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Photo Attached
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
