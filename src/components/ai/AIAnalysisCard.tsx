import React from 'react';
import { AIAnalysisResult } from '../../types';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck, Tag } from 'lucide-react';
import { PriorityBadge } from '../common/Badge';

export const AIAnalysisCard: React.FC<{
  analysis: AIAnalysisResult;
  onAccept?: () => void;
  onEdit?: () => void;
}> = ({ analysis, onAccept, onEdit }) => {
  return (
    <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-xl border border-blue-500/30 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Sparkles className="w-4 h-4 text-blue-300 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold tracking-tight font-heading text-white">
              AI Vision Inspection Intelligence
            </h4>
            <p className="text-[11px] text-blue-200">
              Powered by Google Gemini 3.7 Flash Model
            </p>
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="text-right">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{analysis.confidence}% Confidence</span>
          </div>
        </div>
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Detected Civic Category
          </span>
          <span className="text-base font-bold text-white font-heading">
            {analysis.detectedCategory}
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Specific Infrastructure Defect
          </span>
          <span className="text-sm font-bold text-blue-200">
            {analysis.detectedIssue}
          </span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Assessed Hazard Severity
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={analysis.severity} />
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block mb-1">
            Suggested Municipal Priority
          </span>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={analysis.suggestedPriority} />
          </div>
        </div>
      </div>

      {/* Technical Summary */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1">
        <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">
          AI Auto-Generated Technical Description
        </span>
        <p className="text-xs text-slate-200 leading-relaxed">
          {analysis.summaryDescription}
        </p>
      </div>

      {/* Detected Safety Hazards */}
      {analysis.safetyHazardsDetected && analysis.safetyHazardsDetected.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-amber-400 text-[11px] font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Safety Hazards Identified:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {analysis.safetyHazardsDetected.map((hazard, i) => (
              <span
                key={i}
                className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded font-medium"
              >
                ⚠ {hazard}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Keywords Tags */}
      {analysis.tags && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <Tag className="w-3 h-3 text-slate-400" />
          {analysis.tags.map((tag, idx) => (
            <span
              key={idx}
              className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      {(onAccept || onEdit) && (
        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-xs text-blue-300 hover:text-white underline font-medium"
            >
              Edit Category / Details Manually
            </button>
          )}

          {onAccept && (
            <button
              onClick={onAccept}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition ml-auto flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Accept AI Diagnosis & Continue
            </button>
          )}
        </div>
      )}
    </div>
  );
};
