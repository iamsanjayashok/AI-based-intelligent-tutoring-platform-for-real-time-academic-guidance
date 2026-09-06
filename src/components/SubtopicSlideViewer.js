import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Presentation, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Layers, 
  Lightbulb, 
  Maximize2, 
  Minimize2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Helper function to parse slide content into structured points
export function parseSlidePoints(content) {
  if (!content) return [];
  
  // First, check if split by newlines
  const rawLines = content.split('\n').map(l => l.trim()).filter(Boolean);
  
  const points = [];
  for (const line of rawLines) {
    const cleanLine = line
      .replace(/^[•\-\*]\s*/, '')
      .replace(/^\d+[\.\)]\s*/, '')
      .trim();
      
    if (cleanLine) {
      if (cleanLine.includes('•')) {
        const sub = cleanLine.split('•').map(s => s.trim()).filter(Boolean);
        points.push(...sub);
      } else {
        points.push(cleanLine);
      }
    }
  }

  // If there's only 1 long line without explicit bullets, check if we can break into key sentences
  if (points.length === 1 && points[0].length > 100) {
    const sentences = points[0]
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);
    if (sentences.length >= 2 && sentences.length <= 5) {
      return sentences;
    }
  }

  return points.length > 0 ? points : [content];
}

export default function SubtopicSlideViewer({
  slides = [],
  currentSlideIndex = 0,
  onNext,
  onPrev,
  onSelectSlide,
  onExplain,
  subtopicTitle = "Subtopic",
  topicTitle = "Topic",
  courseTitle = "",
  isExplaining = false
}) {
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  // Keyboard navigation support: Left / Right arrow keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't capture arrows if user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
        return;
      }
      if (e.key === 'ArrowRight' && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev]);

  const currentSlide = slides[currentSlideIndex];
  const points = currentSlide ? parseSlidePoints(currentSlide.content) : [];
  const totalSlides = slides.length;

  return (
    <div className={`flex flex-col h-full bg-[#080d19] text-slate-100 overflow-hidden relative select-none font-['Inter',sans-serif] ${isTheaterMode ? 'fixed inset-0 z-50 p-6 md:p-10 bg-[#060a14]' : 'p-4 md:p-6'}`}>
      
      {/* 1. TOP HEADER TOOLBAR: Well-distributed breadcrumb, step dots & actions */}
      <header className="flex items-center justify-between pb-3.5 border-b border-slate-800/80 shrink-0 gap-3">
        {/* Left: Subtopic Context */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sky-400 shrink-0 shadow-sm">
            <Presentation size={18} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              <span className="truncate max-w-[120px] sm:max-w-[200px]">{topicTitle || "Module"}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400 font-bold truncate max-w-[150px] sm:max-w-[240px]">{subtopicTitle}</span>
            </div>
            <h3 className="text-sm md:text-base font-bold text-white truncate font-['Plus_Jakarta_Sans',sans-serif]">
              {currentSlide?.title || "Slide Presentation"}
            </h3>
          </div>
        </div>

        {/* Center: Interactive Slide Stepper Timeline */}
        {totalSlides > 1 && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-full border border-slate-800/80 shadow-inner">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlideIndex;
              const isPast = idx < currentSlideIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSlide && onSelectSlide(idx)}
                  title={`Slide ${idx + 1}: ${s.title}`}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : isPast
                        ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-750'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <span className="font-mono">{idx + 1}</span>
                  {isActive && <span className="max-w-[100px] truncate">{s.title}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {onExplain && (
            <button
              onClick={() => onExplain(currentSlideIndex)}
              disabled={isExplaining || !currentSlide}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-blue-600/15 hover:bg-blue-600/25 text-sky-300 border border-blue-500/30 transition-all disabled:opacity-50 shadow-xs"
              title="Ask AI Tutor to speak and explain this slide"
            >
              <Sparkles size={14} className={isExplaining ? "animate-spin text-sky-400" : "text-sky-400"} />
              <span className="hidden sm:inline">{isExplaining ? "Explaining..." : "Explain Slide"}</span>
            </button>
          )}

          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 transition-all"
            title={isTheaterMode ? "Exit Theater View" : "Theater View (Expand Slides)"}
          >
            {isTheaterMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </header>

      {/* 2. MAIN SLIDE PRESENTATION CANVAS: Elegant distribution, typography & visual cards */}
      <main className="flex-1 flex flex-col justify-center items-center py-3 md:py-4 min-h-0 relative">
        <div className="w-full h-full max-w-5xl mx-auto flex flex-col min-h-0">
          <AnimatePresence mode="wait">
            {currentSlide ? (
              <motion.article
                key={currentSlideIndex}
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.985 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[#0f172a] via-[#0d1527] to-[#090f1d] rounded-3xl p-6 md:p-9 border border-slate-800/90 shadow-2xl relative overflow-hidden min-h-0"
              >
                {/* Ambient Top Glow Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-sky-400 to-indigo-600" />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* A. Slide Header Zone */}
                <div className="mb-5 shrink-0">
                  <div className="flex items-center justify-between gap-4 mb-2.5">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-widest bg-blue-500/10 text-sky-400 border border-blue-500/20 shadow-xs">
                      <Layers size={12} />
                      Slide {String(currentSlideIndex + 1).padStart(2, '0')} / {String(totalSlides).padStart(2, '0')}
                    </span>
                    <span className="text-xs text-slate-400 font-medium hidden sm:inline truncate max-w-sm">
                      {subtopicTitle}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-['Plus_Jakarta_Sans',sans-serif]">
                    {currentSlide.title}
                  </h2>
                </div>

                {/* B. Slide Body Zone: Structured Points Grid / List with Optimal Distribution */}
                <div className="flex-1 overflow-y-auto pr-1 min-h-0 my-auto flex flex-col justify-center">
                  {points.length > 1 ? (
                    <div className={`grid gap-3.5 ${
                      points.length === 2 
                        ? 'grid-cols-1 md:grid-cols-2' 
                        : points.length === 4 
                          ? 'grid-cols-1 md:grid-cols-2' 
                          : points.length >= 5
                            ? 'grid-cols-1 md:grid-cols-2'
                            : 'grid-cols-1'
                    }`}>
                      {points.map((pointText, pIdx) => {
                        // Check if point has a colon for bold header separation (e.g. "Concept: Details")
                        const hasColon = pointText.includes(':');
                        let head = "";
                        let body = pointText;
                        if (hasColon) {
                          const parts = pointText.split(':');
                          head = parts[0].trim();
                          body = parts.slice(1).join(':').trim();
                        }

                        return (
                          <motion.div
                            key={pIdx}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: pIdx * 0.05 }}
                            className="flex items-start gap-3.5 p-4 md:p-4.5 rounded-2xl bg-slate-800/35 border border-slate-750/60 hover:border-sky-500/40 hover:bg-slate-800/60 transition-all group shadow-xs"
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/25 text-sky-400 font-mono text-xs font-bold shrink-0 mt-0.5 group-hover:bg-blue-500/20 transition-all">
                              {pIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              {head ? (
                                <>
                                  <h4 className="text-sky-300 font-bold text-sm md:text-base mb-1 tracking-wide font-['Plus_Jakarta_Sans',sans-serif]">
                                    {head}
                                  </h4>
                                  <p className="text-slate-200 text-sm md:text-base leading-relaxed font-normal">
                                    {body}
                                  </p>
                                </>
                              ) : (
                                <p className="text-slate-200 text-sm md:text-base leading-relaxed font-normal">
                                  {pointText}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  ) : (
                    // Single point / definition layout: spacious, high-contrast typography
                    <div className="p-6 md:p-8 rounded-2xl bg-slate-800/30 border border-slate-700/50 border-l-4 border-l-blue-500">
                      <p className="text-slate-200 text-lg md:text-xl lg:text-2xl leading-relaxed font-normal">
                        {points[0]}
                      </p>
                    </div>
                  )}
                </div>

                {/* C. Slide Footer Callout: Key Takeaway Banner */}
                <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between shrink-0 gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Lightbulb size={15} className="text-amber-400 shrink-0" />
                    <span className="font-semibold text-slate-300">Key Concept:</span>
                    <span className="truncate max-w-xs md:max-w-md text-slate-400">
                      {currentSlide.title}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
                    Use <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 text-slate-300">→</kbd> to navigate
                  </div>
                </div>
              </motion.article>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 p-12 text-center">
                <Presentation size={48} className="mb-4 text-slate-600" />
                <p className="text-lg font-medium">No slides available for this subtopic.</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* 3. BOTTOM SLIDE STRIP & CONTROLS: Interactive mini cards & navigation */}
      {totalSlides > 0 && (
        <footer className="pt-3 border-t border-slate-800/80 shrink-0 flex items-center justify-between gap-3">
          {/* Previous Button */}
          <button
            onClick={onPrev}
            disabled={currentSlideIndex === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800/90 text-white hover:bg-slate-700/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700 text-xs md:text-sm font-semibold shrink-0 shadow-xs"
            title="Previous slide (Left Arrow)"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Center: Slide Thumbnail Mini-Cards */}
          <div className="flex-1 flex items-center justify-center gap-2 overflow-x-auto py-1 px-2 no-scrollbar">
            {slides.map((s, idx) => {
              const isSelected = idx === currentSlideIndex;
              return (
                <button
                  key={idx}
                  onClick={() => onSelectSlide && onSelectSlide(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all whitespace-nowrap shrink-0 ${
                    isSelected 
                      ? 'bg-blue-600/20 border-blue-500/50 text-white font-bold ring-1 ring-blue-500/30 shadow-lg shadow-blue-900/20' 
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {idx + 1}
                  </span>
                  <span className="max-w-[110px] md:max-w-[140px] truncate">
                    {s.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={currentSlideIndex === totalSlides - 1}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-md shadow-blue-900/20 text-xs md:text-sm font-semibold shrink-0"
            title="Next slide (Right Arrow)"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={16} />
          </button>
        </footer>
      )}
    </div>
  );
}
