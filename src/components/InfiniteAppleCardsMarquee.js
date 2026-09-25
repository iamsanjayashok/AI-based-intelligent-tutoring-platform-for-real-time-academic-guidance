import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Check, 
  Sparkles, 
  Volume2, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Sun, 
  Moon, 
  Mic, 
  FileText, 
  Share2, 
  Upload, 
  FolderUp, 
  Layers, 
  Pause, 
  Zap, 
  Link2, 
  Users, 
  FileCheck2,
  FileCode,
  FileSpreadsheet
} from 'lucide-react';

/* =========================================================================
   APPLE-STYLE ARTWORK COMPONENTS TAILORED TO THE AI TUTOR PLATFORM
   Clean, elegant visuals in simple words — zero developer/UI jargon.
   ========================================================================= */

// Card 1: Works on PC, Mobile & Tablets (Apple device family in sync)
function DevicesArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Trio of Devices (Laptop, iPad Tablet, iPhone) */}
      <div className="relative flex items-end justify-center gap-2 translate-y-1">
        
        {/* Laptop (MacBook style on left) */}
        <div className="flex flex-col items-center">
          <div className="w-28 h-18 bg-slate-900 rounded-t-lg p-1 border border-slate-700 shadow-md flex items-center justify-center relative">
            <div className="w-full h-full bg-slate-950 rounded-sm p-1.5 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 pb-0.5">
                <div className="flex gap-0.5">
                  <div className="w-1 h-1 rounded-full bg-red-400" />
                  <div className="w-1 h-1 rounded-full bg-amber-400" />
                  <div className="w-1 h-1 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[6px] text-slate-400 font-sans">AI Lecture</span>
              </div>
              <div className="space-y-0.5 py-0.5">
                <div className="w-3/4 h-1 bg-blue-500/80 rounded-full" />
                <div className="w-1/2 h-1 bg-slate-600 rounded-full" />
              </div>
              <div className="w-full h-1.5 bg-blue-600/30 rounded flex items-center px-1">
                <div className="w-1/3 h-0.5 bg-blue-400 rounded-full" />
              </div>
            </div>
          </div>
          <div className="w-34 h-2 bg-gradient-to-b from-slate-300 via-slate-200 to-slate-400 rounded-b shadow-sm" />
        </div>

        {/* Tablet (iPad style in center) */}
        <div className="w-16 h-22 bg-slate-900 rounded-xl p-1 border border-slate-700 shadow-lg relative -translate-x-1 -translate-y-1">
          <div className="w-full h-full bg-slate-950 rounded-lg p-1 flex flex-col justify-between overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[6px] text-blue-400 font-bold">Slides</span>
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
            </div>
            <div className="w-full h-8 bg-blue-900/30 rounded border border-blue-500/20 flex items-center justify-center">
              <FileText size={12} className="text-blue-400" />
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full" />
          </div>
        </div>

        {/* Phone (iPhone style on right) */}
        <div className="w-10 h-18 bg-slate-900 rounded-xl p-0.5 border border-slate-700 shadow-md relative -translate-x-2">
          <div className="w-full h-full bg-slate-950 rounded-lg p-1 flex flex-col justify-between items-center overflow-hidden">
            <div className="w-3 h-0.5 bg-slate-700 rounded-full" />
            <div className="w-6 h-6 rounded-full bg-blue-600/40 flex items-center justify-center">
              <Mic size={10} className="text-blue-400 animate-pulse" />
            </div>
            <div className="w-4 h-0.5 bg-slate-600 rounded-full" />
          </div>
        </div>

      </div>

      <div className="absolute top-2 right-6 bg-white/95 px-2 py-0.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-1 text-[10px] font-bold text-slate-700">
        <Check size={11} className="text-emerald-500" strokeWidth={3} />
        <span>Any Browser</span>
      </div>
    </div>
  );
}

// Card 2: 24/7 AI Teacher Support (Sun & Moon Day/Night Companion)
function Support247Artwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Main 24/7 Dial Clock Container */}
      <div className="relative w-36 h-36 rounded-full bg-gradient-to-b from-slate-50 via-white to-slate-100 border border-slate-200 shadow-md flex items-center justify-center p-3">
        <div className="absolute inset-2 rounded-full border border-dashed border-slate-300" />

        {/* Day Sun */}
        <div className="absolute top-2 right-4 w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-sm flex items-center justify-center text-white border border-white">
          <Sun size={14} className="animate-spin-slow" />
        </div>

        {/* Night Moon */}
        <div className="absolute bottom-2 left-4 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-700 shadow-sm flex items-center justify-center text-white border border-white">
          <Moon size={13} />
        </div>

        {/* Center Friendly Teacher Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/25 flex flex-col items-center justify-center relative">
          <GraduationCap size={24} className="text-white drop-shadow-xs" />
          <span className="text-[9px] font-bold font-mono tracking-tighter mt-0.5">24 / 7</span>
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white shadow-xs" />
        </div>
      </div>

      <div className="absolute bottom-1 bg-white/95 px-2.5 py-0.5 rounded-full border border-slate-200 shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Always Ready</span>
      </div>
    </div>
  );
}

// Card 3: Natural Voice Conversations (Talking with your AI tutor)
function VoiceConversationArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Conversational Soundwave Pod */}
      <div className="w-48 h-34 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-bold text-blue-600">
            <Volume2 size={12} />
            <span>Live Voice Audio</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
        </div>

        {/* Center Dynamic Audio Wave Bars */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          {[12, 24, 18, 32, 28, 40, 26, 36, 18, 28, 14].map((height, idx) => (
            <div 
              key={idx}
              style={{ height: `${height}px` }}
              className="w-1.5 bg-gradient-to-t from-blue-600 to-indigo-400 rounded-full shadow-2xs"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-100 pt-1.5">
          <div className="flex items-center gap-1 font-medium text-slate-700">
            <Mic size={11} className="text-blue-600" />
            <span>Talk naturally out loud</span>
          </div>
          <span className="text-emerald-600 font-bold text-[9px]">Active</span>
        </div>
      </div>
    </div>
  );
}

// Card 4: PROPER UPGRADED ARTWORK - Interrupt Anytime (Instant Turn-Taking & Reflex)
function ProperInterruptReflexArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      {/* Soft warm indigo ambient glow */}
      <div className="absolute w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Apple-style Duplex Voice Chamber Stage */}
      <div className="w-50 h-36 bg-gradient-to-b from-white via-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/90 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        {/* Top Channel: AI Tutor Voice Stream with Instant Pause Nexus */}
        <div className="flex items-center justify-between bg-blue-50/80 px-2.5 py-1.5 rounded-xl border border-blue-100">
          <div className="flex items-center gap-1.5">
            <GraduationCap size={13} className="text-blue-600" />
            <span className="text-[10px] font-bold text-slate-800">Teacher Speaking</span>
          </div>

          {/* Instant Pause Nexus Badge */}
          <div className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs">
            <Pause size={9} strokeWidth={3} className="fill-white" />
            <span>Pauses Instantly</span>
          </div>
        </div>

        {/* Center Connection: Instant Reflex Bridge (< 380ms) */}
        <div className="relative py-1 flex items-center justify-center">
          <div className="w-full border-t border-dashed border-slate-200" />
          <div className="absolute bg-white px-2 py-0.5 rounded-full border border-slate-200 shadow-2xs flex items-center gap-1 text-[9px] font-bold text-indigo-700">
            <Zap size={10} className="text-amber-500 fill-amber-500" />
            <span>&lt; 380ms Reflex</span>
          </div>
        </div>

        {/* Bottom Channel: Student Voice Activation */}
        <div className="flex items-center justify-between bg-emerald-50/80 px-2.5 py-1.5 rounded-xl border border-emerald-100">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs">
              <Mic size={10} strokeWidth={2.5} />
            </div>
            <span className="text-[10px] font-bold text-slate-800">You Speak Up</span>
          </div>

          {/* Live Wave Indicator */}
          <div className="flex items-center gap-0.5">
            <span className="w-1 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="w-1 h-4.5 bg-emerald-600 rounded-full" />
            <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
        </div>

      </div>
    </div>
  );
}

// Card 5: NEW CARD 1 - Upload Your Study Material (PDFs, PPTs, Notes)
function UploadMaterialArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Document Ingestion Tray */}
      <div className="w-50 h-36 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
          <div className="flex items-center gap-1.5">
            <FolderUp size={13} className="text-blue-600" />
            <span className="text-[10px] font-bold text-slate-800">Your Documents</span>
          </div>
          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            Auto-Parsed
          </span>
        </div>

        {/* Center: Trio of Floating Document Types (PDF, PPT, DOC) */}
        <div className="flex items-center justify-center gap-2.5 py-1">
          {/* PDF Badge */}
          <div className="w-12 h-14 bg-gradient-to-b from-red-500 to-rose-600 rounded-xl shadow-sm text-white p-1.5 flex flex-col justify-between items-center border border-red-300/40">
            <span className="text-[7px] font-bold uppercase tracking-tight">PDF</span>
            <FileText size={16} strokeWidth={2.2} />
            <div className="w-6 h-0.5 bg-white/70 rounded-full" />
          </div>

          {/* PPT Slides Badge */}
          <div className="w-12 h-14 bg-gradient-to-b from-amber-500 to-orange-600 rounded-xl shadow-sm text-white p-1.5 flex flex-col justify-between items-center border border-amber-300/40 -translate-y-1">
            <span className="text-[7px] font-bold uppercase tracking-tight">PPTX</span>
            <FileSpreadsheet size={16} strokeWidth={2.2} />
            <div className="w-6 h-0.5 bg-white/70 rounded-full" />
          </div>

          {/* Notes / DOC Badge */}
          <div className="w-12 h-14 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-xl shadow-sm text-white p-1.5 flex flex-col justify-between items-center border border-blue-300/40">
            <span className="text-[7px] font-bold uppercase tracking-tight">DOCS</span>
            <FileCode size={16} strokeWidth={2.2} />
            <div className="w-6 h-0.5 bg-white/70 rounded-full" />
          </div>
        </div>

        {/* Dropzone status */}
        <div className="text-[9px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1">
          <span>Drag & drop textbooks or notes</span>
          <span className="text-blue-600 font-bold">Ready</span>
        </div>

      </div>
    </div>
  );
}

// Card 6: NEW CARD 2 - Generate Custom Courses (Curriculum Builder)
function GenerateCourseArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Course Blueprint Stack */}
      <div className="w-50 h-36 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-purple-600" />
            <span className="text-[10px] font-bold text-slate-800">Course Generator</span>
          </div>
          <span className="text-[8px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
            3 Units Ready
          </span>
        </div>

        {/* Structured Course Hierarchy Tree */}
        <div className="space-y-1.5 py-1">
          {/* Chapter 1 */}
          <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[9px] font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold">1</span>
              <span>Foundations & Basics</span>
            </div>
            <Check size={11} className="text-emerald-600" />
          </div>

          {/* Chapter 2 */}
          <div className="flex items-center justify-between bg-purple-50/80 px-2 py-1 rounded-lg border border-purple-100 text-[9px] font-medium text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[8px] font-bold">2</span>
              <span className="font-bold text-purple-900">Core Deep Dive & Audio</span>
            </div>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-ping" />
          </div>

          {/* Chapter 3 */}
          <div className="flex items-center justify-between bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 text-[9px] font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center text-[8px] font-bold">3</span>
              <span>Practice Exam & Rubric</span>
            </div>
            <span className="text-[8px] text-slate-400">Final</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-[8px] text-slate-400 flex items-center justify-between border-t border-slate-100 pt-1">
          <span>Tailored to your syllabus</span>
          <span className="text-purple-600 font-bold">Personalized</span>
        </div>

      </div>
    </div>
  );
}

// Card 7: NEW CARD 3 - Share Courses With Classmates (Link & Collaborate)
function ShareCoursesArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Share / Collaboration Stage */}
      <div className="w-50 h-36 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        
        {/* Header with Share pill */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-1">
          <div className="flex items-center gap-1.5">
            <Share2 size={12} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-slate-800">Share Course</span>
          </div>
          <span className="text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-0.5">
            <Check size={9} strokeWidth={3} />
            <span>Link Copied</span>
          </span>
        </div>

        {/* Center: Share Network with Friends & Classmates */}
        <div className="flex items-center justify-center gap-3 py-2 relative">
          
          {/* Friend 1 Avatar */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs">
              JD
            </div>
            <span className="text-[8px] text-slate-500">Alex</span>
          </div>

          {/* Central Share Hub */}
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 border-2 border-white">
            <Link2 size={18} strokeWidth={2.5} />
          </div>

          {/* Friend 2 Avatar */}
          <div className="flex flex-col items-center gap-0.5">
            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center border-2 border-white shadow-2xs">
              SK
            </div>
            <span className="text-[8px] text-slate-500">Maya</span>
          </div>

        </div>

        {/* Bottom invitation text */}
        <div className="text-[8px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-1">
          <div className="flex items-center gap-1">
            <Users size={10} className="text-emerald-600" />
            <span>Study with friends</span>
          </div>
          <span className="text-emerald-700 font-bold">1-Click Invite</span>
        </div>

      </div>
    </div>
  );
}

// Card 8: Interactive Visual Slides (Presentation blackboard)
function VisualSlidesArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Presentation Slide Canvas */}
      <div className="w-48 h-34 bg-slate-900 rounded-2xl p-2.5 shadow-md border border-slate-700 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-[9px] font-bold text-slate-200">Interactive Slide</span>
          </div>
          <span className="text-[8px] font-mono text-purple-400">Slide 3 of 8</span>
        </div>

        <div className="flex items-center justify-between py-1 px-1">
          <div className="w-14 h-12 bg-purple-950/60 rounded-lg border border-purple-800/60 flex items-center justify-center">
            <BookOpen size={18} className="text-purple-400" />
          </div>

          <div className="flex-1 pl-2.5 space-y-1">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-purple-400" />
              <div className="w-full h-1.5 bg-slate-700 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-purple-400" />
              <div className="w-3/4 h-1.5 bg-slate-700 rounded-full" />
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-emerald-400" />
              <div className="w-5/6 h-1.5 bg-emerald-500/60 rounded-full" />
            </div>
          </div>
        </div>

        <div className="text-[8px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1">
          <span>Auto-created as tutor speaks</span>
          <span className="text-purple-400 font-bold">Live Sync</span>
        </div>
      </div>
    </div>
  );
}

// Card 9: Fair Answer Grading (Understanding-based evaluation & Rubrics)
function GradingFeedbackArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Exam / Assessment Paper */}
      <div className="w-48 h-34 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-800">Concept Assessment</span>
            <p className="text-[8px] text-slate-400">Evaluates reasoning, not keywords</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            A+
          </div>
        </div>

        <div className="space-y-1.5 py-1">
          <div className="flex items-center justify-between text-[9px] font-medium text-slate-600">
            <span className="flex items-center gap-1">
              <Check size={10} className="text-emerald-600" strokeWidth={3} />
              Core Principle Understood
            </span>
            <span className="text-emerald-700 font-bold">100%</span>
          </div>

          <div className="flex items-center justify-between text-[9px] font-medium text-slate-600">
            <span className="flex items-center gap-1">
              <Check size={10} className="text-emerald-600" strokeWidth={3} />
              Clear Real-World Example
            </span>
            <span className="text-emerald-700 font-bold">Great</span>
          </div>
        </div>

        <div className="bg-emerald-50 rounded-lg p-1 text-[8px] text-emerald-800 font-medium text-center border border-emerald-200/60">
          "Excellent explanation of the underlying logic!"
        </div>
      </div>
    </div>
  );
}

// Card 10: Remembers Your Progress & Notes (Attendance & Memory)
function ProgressMemoryArtwork() {
  return (
    <div className="w-full h-44 flex items-center justify-center relative select-none">
      <div className="absolute w-36 h-36 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Progress & Attendance Card */}
      <div className="w-48 h-34 bg-white rounded-2xl border border-slate-200 p-3 shadow-sm flex flex-col justify-between relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-800">
            <Calendar size={12} className="text-teal-600" />
            <span>Learning History</span>
          </div>
          <span className="text-[9px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded-full border border-teal-200">
            Active Streak
          </span>
        </div>

        <div className="py-1">
          <p className="text-[8px] text-slate-400 mb-1">Weekly attendance & lessons completed</p>
          <div className="grid grid-cols-7 gap-1">
            {[true, true, true, true, false, true, true, true, true, true, true, true, true, true].map((active, i) => (
              <div 
                key={i} 
                className={`w-3.5 h-3.5 rounded-xs transition-colors ${
                  active ? 'bg-teal-500 shadow-2xs' : 'bg-slate-100'
                }`} 
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[9px] text-slate-600 border-t border-slate-100 pt-1">
          <span>Past mistakes saved</span>
          <span className="font-bold text-teal-700">Auto-Saved</span>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   10 EDUCATIONAL CARDS EXPLAINING HOW THE PLATFORM WORKS IN SIMPLE WORDS
   ========================================================================= */
const LEARNING_CARDS = [
  {
    id: 'works-anywhere',
    badge: 'Any Device',
    badgeColor: 'text-blue-600',
    title: 'PC, MOBILE & TABLETS',
    description: 'Learn on your laptop, smartphone, or iPad. Your lessons and voice sessions sync automatically in any web browser.',
    artwork: <DevicesArtwork />
  },
  {
    id: 'always-available',
    badge: '24/7 Support',
    badgeColor: 'text-amber-600',
    title: '24/7 AI TEACHER',
    description: 'Get patient, one-on-one help whenever you study—day or night. No scheduling or waiting needed.',
    artwork: <Support247Artwork />
  },
  {
    id: 'live-speech',
    badge: 'Live Voice',
    badgeColor: 'text-blue-600',
    title: 'SPEAK NATURALLY',
    description: 'Talk to your tutor using your microphone. Ask questions out loud and hear clear, friendly spoken explanations.',
    artwork: <VoiceConversationArtwork />
  },
  {
    id: 'instant-interruption',
    badge: 'No Waiting',
    badgeColor: 'text-indigo-600',
    title: 'INTERRUPT ANYTIME',
    description: 'Confused by something? Speak up mid-sentence. Your teacher pauses immediately to answer your doubt.',
    artwork: <ProperInterruptReflexArtwork />
  },
  // NEW CARD 1
  {
    id: 'upload-materials',
    badge: 'Any Document',
    badgeColor: 'text-blue-600',
    title: 'UPLOAD STUDY MATERIAL',
    description: 'Drop in your lecture PDFs, PowerPoint slides, textbook chapters, or class notes to study directly from your curriculum.',
    artwork: <UploadMaterialArtwork />
  },
  // NEW CARD 2
  {
    id: 'generate-course',
    badge: 'Auto Curriculum',
    badgeColor: 'text-purple-600',
    title: 'GENERATE CUSTOM COURSES',
    description: 'Transforms raw notes and syllabus files into organized chapters, subtopics, interactive lectures, and quizzes.',
    artwork: <GenerateCourseArtwork />
  },
  // NEW CARD 3
  {
    id: 'share-courses',
    badge: 'One-Click Share',
    badgeColor: 'text-emerald-600',
    title: 'SHARE WITH CLASSMATES',
    description: 'Send your custom courses, slide decks, and study notes to friends or study groups with a simple shareable link.',
    artwork: <ShareCoursesArtwork />
  },
  {
    id: 'visual-slides',
    badge: 'Auto Slides',
    badgeColor: 'text-purple-600',
    title: 'INTERACTIVE SLIDES',
    description: 'See what you hear. The tutor automatically generates clear visual slides and diagrams as it teaches.',
    artwork: <VisualSlidesArtwork />
  },
  {
    id: 'thoughtful-grading',
    badge: 'Fair Tests',
    badgeColor: 'text-emerald-600',
    title: 'THOUGHTFUL GRADING',
    description: 'Tests your real understanding of concepts, giving helpful personal feedback instead of multiple-choice guessing.',
    artwork: <GradingFeedbackArtwork />
  },
  {
    id: 'progress-memory',
    badge: 'Full Memory',
    badgeColor: 'text-teal-600',
    title: 'REMEMBERS PROGRESS',
    description: 'Tracks your completed topics, attendance streak, and past mistakes so every session builds on your growth.',
    artwork: <ProgressMemoryArtwork />
  }
];

export default function InfiniteAppleCardsMarquee() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const setRef = useRef(null);

  // Hover state: holding movement when cursor is placed on top of cards
  const [isHovered, setIsHovered] = useState(false);

  // Position reference
  const posRef = useRef(0);
  const singleSetWidthRef = useRef(0);
  const isPointerDownRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const requestRef = useRef(null);

  // Smooth ambient sliding velocity (0.95 px per frame)
  const SLIDE_SPEED = 0.95;

  // Measure single set width for seamless infinite looping
  const updateMeasurements = useCallback(() => {
    if (setRef.current) {
      singleSetWidthRef.current = setRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    updateMeasurements();
    window.addEventListener('resize', updateMeasurements);
    return () => window.removeEventListener('resize', updateMeasurements);
  }, [updateMeasurements]);

  // Main animation ticker: Auto-slides continuously, HOLDS STILL when hovered!
  useEffect(() => {
    const animate = () => {
      // When hovered or pointer down: HOLD MOVEMENT!
      // When cursor is somewhere else: SLIDE CONTINUOUSLY!
      if (!isHovered && !isPointerDownRef.current) {
        posRef.current -= SLIDE_SPEED;

        // Infinite loop seamless wrap
        const setWidth = singleSetWidthRef.current;
        if (setWidth > 0) {
          if (posRef.current <= -setWidth) {
            posRef.current += setWidth;
          } else if (posRef.current > 0) {
            posRef.current -= setWidth;
          }
        }

        // Apply hardware-accelerated transform directly
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
        }
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isHovered]);

  // Pointer interactions (Manual swipe / touch drag scrub)
  const handlePointerDown = (e) => {
    isPointerDownRef.current = true;
    lastPointerXRef.current = e.clientX;
    setIsHovered(true);
  };

  const handlePointerMove = (e) => {
    if (!isPointerDownRef.current) return;
    const deltaX = e.clientX - lastPointerXRef.current;
    lastPointerXRef.current = e.clientX;
    posRef.current += deltaX;

    const setWidth = singleSetWidthRef.current;
    if (setWidth > 0) {
      if (posRef.current <= -setWidth) posRef.current += setWidth;
      if (posRef.current > 0) posRef.current -= setWidth;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${posRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  return (
    <div className="w-full relative py-4 select-none overflow-hidden cursor-default">
      
      {/* Infinite Horizontal Sliding Track (Full screen width, Non-button normal display components) */}
      <div 
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isPointerDownRef.current = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full relative cursor-default overflow-visible py-3"
        style={{ touchAction: 'pan-y' }}
      >
        {/* Soft edge gradient masks for seamless aesthetic integration at viewport boundaries */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#f8fafc] to-transparent z-20 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#f8fafc] to-transparent z-20 pointer-events-none" />

        {/* Continuous sliding flex row */}
        <div 
          ref={trackRef} 
          className="flex gap-6 sm:gap-8 will-change-transform items-center cursor-default"
        >
          {/* First set (measured for dynamic width) */}
          <div ref={setRef} className="flex gap-6 sm:gap-8 flex-shrink-0">
            {LEARNING_CARDS.map((card, idx) => (
              <AppleStyleLearningCard 
                key={`set1-${card.id}-${idx}`} 
                card={card} 
              />
            ))}
          </div>

          {/* Second duplicate set for seamless infinite looping */}
          <div className="flex gap-6 sm:gap-8 flex-shrink-0">
            {LEARNING_CARDS.map((card, idx) => (
              <AppleStyleLearningCard 
                key={`set2-${card.id}-${idx}`} 
                card={card} 
              />
            ))}
          </div>

          {/* Third duplicate set for ultra-wide monitors */}
          <div className="flex gap-6 sm:gap-8 flex-shrink-0">
            {LEARNING_CARDS.map((card, idx) => (
              <AppleStyleLearningCard 
                key={`set3-${card.id}-${idx}`} 
                card={card} 
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}

/* =========================================================================
   APPLE-STYLE INDIVIDUAL LEARNING COMPANION CARD (NORMAL NON-BUTTON COMPONENT)
   Treated as a normal static component — no navigation, no buttons.
   ========================================================================= */
function AppleStyleLearningCard({ card }) {
  return (
    <div
      className="relative w-[310px] sm:w-[330px] h-[410px] flex-shrink-0 bg-white rounded-[2.5rem] p-7 border border-slate-200/80 shadow-[0_8px_30px_rgba(15,23,42,0.04)] flex flex-col justify-between overflow-hidden select-none cursor-default"
    >
      {/* Top Bar: Clean Feature Badge (Non-button, no arrow affordance) */}
      <div className="flex items-center justify-between w-full relative z-10">
        <span className={`text-xs font-bold uppercase tracking-wider ${card.badgeColor}`}>
          {card.badge}
        </span>
        <span className="text-[11px] font-medium text-slate-400">
          AI Platform
        </span>
      </div>

      {/* Center Stage: Apple Artwork Visual Tailored to Platform Capability */}
      <div className="my-auto py-2 flex items-center justify-center relative w-full overflow-hidden pointer-events-none">
        {card.artwork}
      </div>

      {/* Bottom Information: Title and Simple Explanation */}
      <div className="pt-2 border-t border-slate-100/90 relative z-10 space-y-1.5">
        <h3 className="text-xs font-bold text-slate-800 tracking-wider uppercase font-sans">
          {card.title}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
          {card.description}
        </p>
      </div>

    </div>
  );
}
