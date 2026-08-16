import React, { useState, useEffect } from 'react';
import { Issue, Department, User, Role } from '../types';
import { StatusBadge, PriorityBadge } from '../components/common/Badge';
import { PriorityScoreBadge } from '../components/issues/PriorityScoreBadge';
import { StatusTimeline } from '../components/issues/StatusTimeline';
import { BeforeAfterSlider } from '../components/issues/BeforeAfterSlider';
import { AIAnalysisCard } from '../components/ai/AIAnalysisCard';
import { useAuth } from '../context/AuthContext';
import {
  MapPin,
  Clock,
  ThumbsUp,
  Share2,
  Building2,
  HardHat,
  Send,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Star,
  FileText,
  User as UserIcon,
  Phone,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { formatDate, timeAgo } from '../lib/utils';
import confetti from 'canvas-confetti';

export const IssueDetailPage: React.FC<{
  issueId: string;
  onNavigate: (view: string) => void;
}> = ({ issueId, onNavigate }) => {
  const { user, role, showToast } = useAuth();

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [workers, setWorkers] = useState<User[]>([]);

  // Comment input
  const [commentText, setCommentText] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);

  // Authority Assignment Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // Worker Resolution Upload Modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [afterImageInput, setAfterImageInput] = useState(
    'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=800'
  );
  const [resolutionNotesInput, setResolutionNotesInput] = useState(
    'Asphalt compaction completed using hot-mix bitumen. Road levelled and opened for traffic.'
  );

  // Citizen Feedback state
  const [citizenRating, setCitizenRating] = useState(5);
  const [feedbackNotes, setFeedbackNotes] = useState('Satisfied with quick repair turnaround!');
  const [hasSubmittedFeedback, setHasSubmittedFeedback] = useState(false);

  // Fetch issue details
  const fetchIssue = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/issues/${issueId}`);
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
      }
    } catch (e) {
      console.warn('Failed to load issue', e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch departments & workers
  useEffect(() => {
    fetchIssue();
    fetch('/api/departments')
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []));
    fetch('/api/workers')
      .then((r) => r.json())
      .then((w) => setWorkers(w.workers || []));
  }, [issueId]);

  // Handle Upvote
  const handleUpvote = async () => {
    if (!issue) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
        showToast('Upvoted! Civic priority boosted.', 'success');
      }
    } catch (e) {
      showToast('Failed to upvote', 'error');
    }
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !issue) return;

    try {
      const res = await fetch(`/api/issues/${issue.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: commentText,
          userId: user?.id,
          userName: user?.name,
          userRole: role,
          isInternal: isInternalComment,
        }),
      });
      const data = await res.json();
      if (data.comments) {
        setIssue({ ...issue, comments: data.comments });
        setCommentText('');
        showToast('Comment posted', 'info');
      }
    } catch (e) {
      showToast('Failed to post comment', 'error');
    }
  };

  // Authority Assigns Worker
  const handleAssignWorker = async () => {
    if (!issue) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          departmentId: selectedDeptId || departments[0]?.id,
          workerId: selectedWorkerId || workers[0]?.id,
          authorityName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
        setShowAssignModal(false);
        showToast('Work order successfully dispatched to field officer!', 'success');
      }
    } catch (e) {
      showToast('Assignment failed', 'error');
    }
  };

  // Worker Submits Resolution Proof
  const handleWorkerSubmitResolution = async () => {
    if (!issue) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/resolve-submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          afterImage: afterImageInput,
          resolutionNotes: resolutionNotesInput,
          workerName: user?.name,
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
        setShowResolveModal(false);
        showToast('Repair evidence uploaded! Sent for Authority Verification.', 'success');
      }
    } catch (e) {
      showToast('Resolution submission failed', 'error');
    }
  };

  // Authority Approves Resolution -> Mark RESOLVED
  const handleVerifyResolution = async (approved: boolean) => {
    if (!issue) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/verify-resolution`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approved,
          authorityName: user?.name,
          remarks: approved
            ? 'Physical remediation verified. Quality standards approved.'
            : 'Rework requested. Surface requires further compaction.',
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
        if (approved) {
          confetti({ particleCount: 100, spread: 60 });
          showToast('Ticket marked RESOLVED! Notification sent to citizen.', 'success');
        } else {
          showToast('Rework notice sent back to field worker', 'info');
        }
      }
    } catch (e) {
      showToast('Verification failed', 'error');
    }
  };

  // Citizen Submits Feedback
  const handleSubmitFeedback = async () => {
    if (!issue) return;
    try {
      const res = await fetch(`/api/issues/${issue.id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: citizenRating,
          comment: feedbackNotes,
          citizenName: user?.name,
          userId: user?.id,
        }),
      });
      const data = await res.json();
      if (data.issue) {
        setIssue(data.issue);
        setHasSubmittedFeedback(true);
        showToast('Feedback submitted! You earned +5 Civic Points.', 'success');
      }
    } catch (e) {
      showToast('Feedback failed', 'error');
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Fetching grievance master record...</p>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="py-24 text-center space-y-4">
        <p className="text-slate-700 font-bold">Issue record not found</p>
        <button
          onClick={() => onNavigate('citizen_dashboard')}
          className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => onNavigate('citizen_dashboard')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Grievances</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Upvote button */}
          <button
            onClick={handleUpvote}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>Upvote ({issue.upvotes})</span>
          </button>

          {/* Share link */}
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href);
              showToast('Ticket URL copied to clipboard!', 'info');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Ticket Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
              {issue.ticketNumber}
            </span>
            <StatusBadge status={issue.status} />
            <PriorityBadge priority={issue.priority} />
            <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {issue.category}
            </span>
          </div>

          {/* SLA countdown tag */}
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                issue.status === 'Resolved'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : issue.sla.isOverdue
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {issue.status === 'Resolved'
                  ? 'Resolution Completed'
                  : issue.sla.isOverdue
                  ? `SLA OVERDUE (${Math.abs(Math.round(issue.sla.remainingHours))}h late)`
                  : `${Math.round(issue.sla.remainingHours)} Hours Remaining`}
              </span>
            </div>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-heading leading-snug">
          {issue.title}
        </h1>

        <p className="text-xs text-slate-600 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{issue.location.address}</span>
          <span className="text-slate-400 font-mono text-[11px]">
            ({issue.location.lat.toFixed(4)}, {issue.location.lng.toFixed(4)})
          </span>
        </p>

        {/* Priority Engine Breakdown Bar */}
        <div className="pt-2">
          <PriorityScoreBadge breakdown={issue.priorityScore} />
        </div>
      </div>

      {/* Stakeholder Action Control Bar */}
      {(role === 'AUTHORITY' || role === 'ADMIN' || role === 'FIELD_WORKER') && (
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h4 className="font-bold text-xs uppercase tracking-wider text-blue-300">
                {role === 'AUTHORITY'
                  ? 'Authority Action Center (Triage & Dispatch)'
                  : role === 'FIELD_WORKER'
                  ? 'Field Worker Task Controls'
                  : 'Super Admin Override'}
              </h4>
            </div>
            <span className="text-[11px] font-mono text-slate-400">Persona: {user?.name}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {/* AUTHORITY: Assign Department / Worker */}
            {(role === 'AUTHORITY' || role === 'ADMIN') && (
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <HardHat className="w-4 h-4" />
                <span>
                  {issue.assignedWorkerName ? 'Reassign Field Officer' : 'Assign Department & Officer'}
                </span>
              </button>
            )}

            {/* AUTHORITY: Verify Resolution Photo */}
            {(role === 'AUTHORITY' || role === 'ADMIN') && issue.afterImage && issue.status !== 'Resolved' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerifyResolution(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verify Proof & Mark Resolved</span>
                </button>

                <button
                  onClick={() => handleVerifyResolution(false)}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reject (Request Rework)</span>
                </button>
              </div>
            )}

            {/* FIELD WORKER: Upload Resolution Photo */}
            {role === 'FIELD_WORKER' && issue.status !== 'Resolved' && (
              <button
                onClick={() => setShowResolveModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Upload After-Repair Photo & Complete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grid: Left Column (Images, AI, Feedback) & Right Column (Timeline, Assignee, Comments) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols: Before/After Photos + AI Report */}
        <div className="lg:col-span-2 space-y-6">
          {/* Before / After Split Slider */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Visual Resolution Evidence</span>
              </h3>
              <span className="text-xs font-bold text-slate-500">
                {issue.afterImage ? 'Before vs After Comparison' : 'Original Grievance Photo'}
              </span>
            </div>

            <BeforeAfterSlider
              beforeImage={issue.beforeImage}
              afterImage={issue.afterImage}
            />

            {issue.resolutionNotes && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 mt-2 space-y-0.5">
                <span className="font-bold uppercase text-[10px] text-emerald-700 tracking-wider block">
                  Field Worker Completion Notes:
                </span>
                <p>{issue.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* AI Vision Inspection Intelligence Card */}
          <AIAnalysisCard analysis={issue.aiAnalysis} />

          {/* Citizen Feedback Card (when resolved) */}
          {issue.status === 'Resolved' && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Citizen Grievance Feedback</span>
                </h3>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                  Resolved Ticket
                </span>
              </div>

              {issue.feedback ? (
                <div className="bg-amber-50/60 border border-amber-200/80 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= issue.feedback!.rating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-900">
                      {issue.feedback.rating}/5 Stars
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 italic">"{issue.feedback.comment}"</p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Rated by {issue.feedback.citizenName} on {formatDate(issue.feedback.createdAt)}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-600">
                    How satisfied are you with the municipal repair quality and turnaround time?
                  </p>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setCitizenRating(star)}
                        className="p-1 hover:scale-125 transition"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= citizenRating
                              ? 'text-amber-500 fill-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-2">
                      {citizenRating} Stars
                    </span>
                  </div>

                  <input
                    type="text"
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="Share feedback on resolution quality..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />

                  <button
                    onClick={handleSubmitFeedback}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
                  >
                    Submit Citizen Review (+5 Points)
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Dispatch Team, Timeline, Comments */}
        <div className="space-y-6">
          {/* Dispatch Assignment Info Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Assigned Department & Team</span>
            </h4>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Department</span>
                <span className="font-bold text-slate-800">{issue.departmentName || 'Triage Queue'}</span>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Officer</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="font-semibold text-slate-900">
                    {issue.assignedWorkerName || 'Pending Assignment'}
                  </span>
                  {issue.assignedWorkerPhone && (
                    <a
                      href={`tel:${issue.assignedWorkerPhone}`}
                      className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{issue.assignedWorkerPhone}</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Reported By</span>
                <span className="text-slate-700">{issue.reporterName}</span>
              </div>
            </div>
          </div>

          {/* Chronological Status Progression Timeline */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Status Progression Timeline
            </h4>
            <StatusTimeline timeline={issue.timeline} />
          </div>

          {/* Public & Internal Comment Thread */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400 border-b border-slate-100 pb-2">
              Activity & Comments ({issue.comments.length})
            </h4>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {issue.comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl text-xs space-y-1 ${
                    c.isInternal ? 'bg-amber-50/70 border border-amber-200' : 'bg-slate-50 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{c.userName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{timeAgo(c.createdAt)}</span>
                  </div>
                  {c.isInternal && (
                    <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded inline-block">
                      Internal Department Note
                    </span>
                  )}
                  <p className="text-slate-600 leading-relaxed">{c.message}</p>
                </div>
              ))}
            </div>

            {/* Comment Box */}
            <form onSubmit={handleAddComment} className="space-y-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Post a question or status update..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-blue-600"
              />

              <div className="flex items-center justify-between">
                {role !== 'CITIZEN' && (
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Internal officer note only</span>
                  </label>
                )}

                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition ml-auto flex items-center gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AUTHORITY ASSIGN MODAL */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 font-heading">
              Dispatch Grievance to Department
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">Target Department</label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.slaComplianceRate}% SLA rate)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">Assign Field Officer</label>
                <select
                  value={selectedWorkerId}
                  onChange={(e) => setSelectedWorkerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-semibold"
                >
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} - {w.assignedArea || 'Central Zone'} ({w.phone})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignWorker}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FIELD WORKER RESOLUTION MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-4 animate-in fade-in">
            <h3 className="font-bold text-base text-slate-900 font-heading">
              Upload After-Repair Resolution Evidence
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  After-Repair Photo Proof URL
                </label>
                <input
                  type="text"
                  value={afterImageInput}
                  onChange={(e) => setAfterImageInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800"
                />
              </div>

              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={afterImageInput}
                  alt="After Repair Proof"
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <label className="text-slate-600 font-bold block mb-1">
                  Engineering Completion Remarks
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotesInput}
                  onChange={(e) => setResolutionNotesInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleWorkerSubmitResolution}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Submit for Authority Verification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
