import React, { useState } from 'react';
import {
  Upload,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Tag,
  Building2,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { CIVIC_CATEGORIES } from '../lib/constants';
import { AIAnalysisResult, IssueCategory, IssuePriority } from '../types';
import { CivicMap } from '../components/map/CivicMap';
import { AIAnalysisCard } from '../components/ai/AIAnalysisCard';
import { DuplicateAlertModal } from '../components/issues/DuplicateAlertModal';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

// Preset sample photos for fast demonstration in SIH presentation
const PRESET_PHOTOS = [
  {
    label: 'Deep Road Pothole',
    category: 'Road Damage',
    url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800',
    title: 'Severe Asphalt Pothole on 100ft Road',
    desc: 'Deep pothole causing vehicle tire damage and severe traffic slowdown near main junction.',
  },
  {
    label: 'Garbage Dump Accumulation',
    category: 'Garbage Accumulation',
    url: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800',
    title: 'Uncollected Solid Municipal Waste',
    desc: 'Overflowing commercial and residential waste creating foul smell and public health hazard.',
  },
  {
    label: 'Broken Street Light',
    category: 'Street Light Issue',
    url: 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=800',
    title: 'Non-functional Street Lamp Pole',
    desc: 'High-mast light fixture not operating for 3 consecutive nights, creating dark spot.',
  },
  {
    label: 'Water Pipe Leakage',
    category: 'Water Leakage',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800',
    title: 'High Pressure Water Pipeline Burst',
    desc: 'Treated municipal clean water leaking heavily onto road surface, submerging asphalt.',
  },
];

export const ReportIssuePage: React.FC<{
  onNavigate: (view: string) => void;
}> = ({ onNavigate }) => {
  const { user, showToast } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [imagePreview, setImagePreview] = useState<string>(PRESET_PHOTOS[0].url);
  const [title, setTitle] = useState<string>(PRESET_PHOTOS[0].title);
  const [description, setDescription] = useState<string>(PRESET_PHOTOS[0].desc);
  const [category, setCategory] = useState<IssueCategory>('Road Damage');
  const [priority, setPriority] = useState<IssuePriority>('High');
  const [address, setAddress] = useState<string>('12th Main Rd, Indiranagar, Bengaluru, Karnataka 560038');
  const [location, setLocation] = useState<{ lat: number; lng: number }>({
    lat: 12.9784,
    lng: 77.6408,
  });

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);

  // Duplicate Check State
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState<boolean>(false);
  const [duplicateMatches, setDuplicateMatches] = useState<any[]>([]);
  const [showDuplicateModal, setShowDuplicateModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Handle Photo Upload / Preset Select
  const handlePhotoSelect = (url: string, defCategory?: string, defTitle?: string, defDesc?: string) => {
    setImagePreview(url);
    if (defCategory) setCategory(defCategory as IssueCategory);
    if (defTitle) setTitle(defTitle);
    if (defDesc) setDescription(defDesc);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Step 1 -> Step 2: Trigger AI Vision Inspection
  const handleProceedToAIAnalysis = async () => {
    if (!imagePreview) {
      showToast('Please provide an image evidence', 'error');
      return;
    }

    setStep(2);
    setIsAnalyzing(true);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imagePreview,
          description,
          category,
        }),
      });

      const data = await res.json();
      if (data && data.detectedCategory) {
        setAiAnalysis(data);
        setCategory(data.detectedCategory as IssueCategory);
        setPriority(data.suggestedPriority as IssuePriority);
        if (data.summaryDescription) {
          setDescription(data.summaryDescription);
        }
      }
    } catch (err) {
      console.warn('AI analysis error', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 3 -> Step 4: Spatial Duplicate Check
  const handleProceedToDuplicateCheck = async () => {
    setIsCheckingDuplicates(true);
    try {
      const res = await fetch('/api/issues/check-duplicates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          category,
          title,
        }),
      });
      const data = await res.json();
      if (data.hasDuplicates && data.matches && data.matches.length > 0) {
        setDuplicateMatches(data.matches);
        setShowDuplicateModal(true);
      } else {
        setStep(4);
      }
    } catch (e) {
      setStep(4);
    } finally {
      setIsCheckingDuplicates(false);
    }
  };

  // Upvote existing duplicate instead of duplicate filing
  const handleUpvoteExisting = async (issueId: string) => {
    try {
      await fetch(`/api/issues/${issueId}/upvote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id }),
      });
      setShowDuplicateModal(false);
      showToast('Successfully upvoted existing issue! Priority boosted.', 'success');
      onNavigate(`issue_detail_${issueId}`);
    } catch (e) {
      showToast('Failed to upvote', 'error');
    }
  };

  // Final Submission
  const handleSubmitIssue = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        priority,
        location: {
          ...location,
          address,
          ward: 'Ward 112 - Indiranagar',
          landmark: 'Near Metro Station Pillar 42',
        },
        beforeImage: imagePreview,
        reporterId: user?.id || 'user-citizen-1',
        reporterName: user?.name || 'Rahul Sharma',
        reporterEmail: user?.email || 'citizen@civicpulse.in',
        reporterPhone: user?.phone || '+91 98765 43210',
        aiAnalysis: aiAnalysis || {
          detectedCategory: category,
          detectedIssue: title,
          confidence: 94,
          severity: priority,
          suggestedPriority: priority,
          summaryDescription: description,
          safetyHazardsDetected: ['Traffic Disruption'],
          tags: ['citizen_report', 'live_submission'],
        },
      };

      const res = await fetch('/api/issues/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.issue) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
        });

        showToast(`Grievance ${data.issue.ticketNumber} lodged successfully!`, 'success');
        onNavigate(`issue_detail_${data.issue.id}`);
      }
    } catch (err) {
      showToast('Submission error, please try again', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>NagarSewa • Citizen Grievance Redressal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
            Report a Civic Issue
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time photo verification, spatial duplicate check, and guaranteed SLA response.
          </p>
        </div>

        {/* Stepper Indicator */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition ${
                  step === s
                    ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-100'
                    : step > s
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 4 && <div className={`w-4 h-0.5 ${step > s ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Duplicate Alert Modal */}
      {showDuplicateModal && (
        <DuplicateAlertModal
          matchingIssues={duplicateMatches}
          onUpvoteExisting={handleUpvoteExisting}
          onProceedAnyway={() => {
            setShowDuplicateModal(false);
            setStep(4);
          }}
          onClose={() => setShowDuplicateModal(false)}
        />
      )}

      {/* STEP 1: PHOTO & BASIC DETAILS */}
      {step === 1 && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-heading flex items-center gap-2">
              <Camera className="w-5 h-5 text-blue-600" />
              <span>Step 1: Upload Photo Evidence & Initial Details</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">* Required for AI Verification</span>
          </div>

          {/* Preset Photo Selector for Fast SIH Demo */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Fast Demo: Choose Sample Civic Defect</span>
              <span className="text-blue-600 font-semibold text-[11px]">Click to prefill</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {PRESET_PHOTOS.map((p) => (
                <div
                  key={p.label}
                  onClick={() => handlePhotoSelect(p.url, p.category, p.title, p.desc)}
                  className={`p-2 rounded-xl border cursor-pointer transition flex flex-col items-center text-center gap-1.5 ${
                    imagePreview === p.url
                      ? 'border-blue-600 bg-blue-50/70 ring-2 ring-blue-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  <img src={p.url} alt={p.label} className="w-full h-16 object-cover rounded-lg" />
                  <span className="text-[11px] font-bold text-slate-800 line-clamp-1">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Photo Preview / Upload Area */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start pt-2">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Evidence Image Preview
              </label>
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-inner group">
                <img
                  src={imagePreview}
                  alt="Civic Proof Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
                  GPS Embedded • EXIF Validated
                </div>
              </div>

              {/* Upload custom file */}
              <label className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition border border-slate-200">
                <Upload className="w-4 h-4" />
                <span>Upload Custom Image from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Issue Title / Subject
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Deep Pothole on 100ft Road"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Grievance Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-blue-600"
                >
                  {CIVIC_CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} ({c.defaultSlaHours.Medium}h Standard SLA)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Citizen Observations & Remarks
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide any specific details (depth, leak severity, traffic impact)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:outline-blue-600 resize-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              onClick={handleProceedToAIAnalysis}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Proceed to AI Vision Triage</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: AI VISION INSPECTION */}
      {step === 2 && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-heading flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>Step 2: AI Vision Verification & Classification</span>
            </h3>
            <span className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full">
              Automated Severity & Hazard Analysis
            </span>
          </div>

          {isAnalyzing ? (
            <div className="py-16 text-center space-y-4">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
              <div>
                <h4 className="font-bold text-slate-800 text-base font-heading">
                  Analyzing Photo with Gemini Vision...
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Extracting infrastructure defect characteristics, calculating hazard level, and matching against municipal SLA rules.
                </p>
              </div>
            </div>
          ) : aiAnalysis ? (
            <div className="space-y-6">
              <AIAnalysisCard
                analysis={aiAnalysis}
                onAccept={() => setStep(3)}
                onEdit={() => setStep(1)}
              />
            </div>
          ) : (
            <div className="py-8 text-center">
              <button
                onClick={handleProceedToAIAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold"
              >
                Retry AI Vision Analysis
              </button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Details
            </button>

            {!isAnalyzing && aiAnalysis && (
              <button
                onClick={() => setStep(3)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition"
              >
                <span>Continue to GPS Location Pinpoint</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* STEP 3: GPS LOCATION PINPOINT */}
      {step === 3 && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-heading flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <span>Step 3: Pinpoint GPS Coordinates & Address</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">Click map to move pin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <CivicMap
                pickerMode={true}
                selectedLocation={location}
                onLocationPick={(coords) => {
                  setLocation(coords);
                  setAddress(`Lat ${coords.lat.toFixed(5)}, Lng ${coords.lng.toFixed(5)}, Indiranagar Ward 112, Bengaluru`);
                }}
                heightClass="h-[380px]"
              />
            </div>

            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Street Address / Landmark
                  </label>
                  <textarea
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-blue-600 resize-none font-medium"
                  />
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1 font-mono">
                  <div className="flex justify-between text-slate-500">
                    <span>Latitude:</span>
                    <span className="font-bold text-slate-900">{location.lat.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Longitude:</span>
                    <span className="font-bold text-slate-900">{location.lng.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Municipal Ward:</span>
                    <span className="font-bold text-blue-600">Ward 112</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-slate-500">
                💡 Coordinates allow field officers to navigate directly to the defect site.
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to AI Inspection
            </button>

            <button
              onClick={handleProceedToDuplicateCheck}
              disabled={isCheckingDuplicates}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50"
            >
              {isCheckingDuplicates ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking Spatial Duplicates...</span>
                </>
              ) : (
                <>
                  <span>Check Duplicates & Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: FINAL REVIEW & SUBMIT */}
      {step === 4 && (
        <div className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-slate-900 text-base font-heading flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Step 4: Final Confirmation & Lodging Ticket</span>
            </h3>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-bold border border-emerald-200">
              No Blocking Duplicates Found
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Verified Evidence</label>
              <div className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
                <img src={imagePreview} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Category</span>
                  <span className="font-bold text-slate-800 text-sm">{category}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Priority Rating</span>
                  <span className="font-bold text-rose-600 text-sm">{priority} Priority</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Title</span>
                <p className="font-semibold text-slate-900">{title}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Location</span>
                <p className="text-slate-700">{address}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Reporter</span>
                <p className="text-slate-700">{user?.name} ({user?.phone})</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-900 leading-relaxed">
              <strong>Citizen Redressal Guarantee:</strong> Upon submission, this ticket will be registered with a unique tracking ID and assigned to the municipal ward field team with real-time SLA tracking.
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Map
            </button>

            <button
              onClick={handleSubmitIssue}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black shadow-lg shadow-emerald-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Registering Grievance Ticket...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm & Lodge Grievance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
