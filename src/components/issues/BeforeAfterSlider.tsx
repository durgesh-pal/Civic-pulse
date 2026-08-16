import React, { useState } from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage?: string;
  aspectRatio?: string;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  aspectRatio = 'aspect-video',
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // If no after image is available yet, just show single image with badge
  if (!afterImage) {
    return (
      <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md group`}>
        <img
          src={beforeImage}
          alt="Civic Issue Original Proof"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-1 rounded-md border border-white/20">
          Original Grievance Photo
        </div>
      </div>
    );
  }

  const handleMove = (clientX: number, rect: DOMRect) => {
    const x = clientX - rect.left;
    const pos = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(pos);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.touches[0].clientX, rect);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging && e.buttons !== 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    handleMove(e.clientX, rect);
  };

  return (
    <div className="space-y-2">
      <div
        className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden select-none cursor-ew-resize bg-slate-950 border border-slate-300 shadow-lg`}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
      >
        {/* AFTER IMAGE (Bottom Layer) */}
        <img
          src={afterImage}
          alt="After Resolution"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
        <div className="absolute top-3 right-3 bg-emerald-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>AFTER REPAIR</span>
        </div>

        {/* BEFORE IMAGE (Top layer, clipped) */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <img
            src={beforeImage}
            alt="Before Grievance"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
            BEFORE ISSUE
          </div>
        </div>

        {/* DIVIDER HANDLE */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)] pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-800 shadow-xl border border-slate-300 flex items-center justify-center text-xs font-bold">
            ↔
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
        <span>◀ Slide to inspect Before State</span>
        <span className="font-semibold text-blue-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Drag slider to compare resolution quality
        </span>
        <span>Slide to inspect After State ▶</span>
      </div>
    </div>
  );
};
