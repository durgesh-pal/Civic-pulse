import React, { useState, useEffect } from 'react';
import { Issue } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';
import {
  HardHat,
  MapPin,
  Clock,
  CheckCircle2,
  Navigation,
  Upload,
  ArrowRight,
  Sparkles,
  Phone,
  FileText,
} from 'lucide-react';
import { timeAgo } from '../lib/utils';
import confetti from 'canvas-confetti';

export const FieldWorkerDashboard: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  // Resolution modal state
  const [activeTask, setActiveTask] = useState<Issue | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState(
    'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800'
  );
  const [notes, setNotes] = useState(
    'Pothole filled with rapid hardening concrete and hot bitumen seal. Surface compacted with 2-ton roller.'
  );

  const fetchWorkerTasks = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/issues');
      const data = await res.json();
      if (data.issues) {
        setIssues(data.issues);
      }
    } catch (e) {
      console.warn('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkerTasks();
  }, []);

  // Filter tasks assigned to worker or show sample active assigned tasks
  const myTasks = issues.filter(
    (i) => i.assignedWorkerId === user?.id || i.status === 'Assigned' || i.status === 'In Progress'
  );

  const completedTasks = issues.filter((i) => i.status === 'Resolved');

  const handleStartWork = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'In Progress',
          remarks: `Field worker ${user?.name} arrived on site and commenced physical repair.`,
          actorName: user?.name,
          actorRole: 'FIELD_WORKER',
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues((prev) => prev.map((i) => (i.id === issueId ? data.issue : i)));
        showToast('Work started! Status updated to In Progress.', 'info');
      }
    } catch (e) {
      showToast('Status update failed', 'error');
    }
  };

  const handleSubmitResolution = async () => {
    if (!activeTask) return;
    try {
      const res = await fetch(`/api/issues/${activeTask.id}/resolve-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterImage: afterImageUrl,
          resolutionNotes: notes,
          workerName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssues((prev) => prev.map((i) => (i.id === activeTask.id ? data.issue : i)));
        setActiveTask(null);
        confetti({ particleCount: 80, spread: 50 });
        showToast('Work evidence uploaded! Sent for Authority Verification.', 'success');
      }
    } catch (e) {
      showToast('Resolution submission failed', 'error');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Worker Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold border border-emerald-400/30">
            <HardHat className="w-3.5 h-3.5" />
            <span>Field Personnel Portal • PWD Engineering Wing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-heading">
            Field Work Orders & Dispatch
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100">
            Field Officer: <strong>{user?.name}</strong> • Assigned Sector: <strong>Indiranagar Zone</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-3 border border-white/20 text-center px-5">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">Pending Orders</span>
            <span className="text-2xl font-black text-white font-heading">{myTasks.length}</span>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 font-heading flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Active Dispatched Work Orders ({myTasks.length})</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Prioritized by SLA remaining</span>
        </div>

        {myTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-xs text-slate-600 font-bold">All assigned tasks completed for today!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-emerald-400 transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {task.ticketNumber}
                      </span>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <span
                      className={`text-[11px] font-bold font-mono ${
                        task.sla.isOverdue ? 'text-rose-600' : 'text-slate-600'
                      }`}
                    >
                      {task.sla.isOverdue ? 'OVERDUE' : `${Math.round(task.sla.remainingHours)}h SLA`}
                    </span>
                  </div>

                  <div className="flex gap-3 items-start">
                    <img
                      src={task.beforeImage}
                      alt={task.title}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs leading-snug">{task.title}</h3>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{task.location.address}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Worker Controls */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${task.location.lat},${task.location.lng}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Open Navigation</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {task.status === 'Assigned' && (
                      <button
                        onClick={() => handleStartWork(task.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
                      >
                        Start Work
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setActiveTask(task);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Upload Proof & Complete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RESOLUTION PROOF UPLOAD MODAL */}
      {activeTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-heading">
                Upload After-Repair Proof for {activeTask.ticketNumber}
              </h3>
              <button
                onClick={() => setActiveTask(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  After-Repair Photo URL
                </label>
                <input
                  type="text"
                  value={afterImageUrl}
                  onChange={(e) => setAfterImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={afterImageUrl}
                  alt="Resolution Evidence Preview"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Engineering Completion Notes & Material Details
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setActiveTask(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitResolution}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Submit Resolution for Authority Approval
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
