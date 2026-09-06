import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  GraduationCap, 
  Mic, 
  BookOpen, 
  BarChart2, 
  Share2, 
  Zap,
  Globe,
  Cpu,
  ArrowRight,
  CheckCircle2,
  Layers,
  Presentation,
  FileText,
  Volume2,
  Play,
  Flame,
  Clock,
  Key,
  Award,
  HelpCircle,
  ShieldCheck,
  Terminal,
  ChevronRight,
  PlusCircle,
  Radio,
  BookMarked,
  Sliders,
  Check,
  Copy,
  ExternalLink,
  User,
  ChevronDown,
  Headphones,
  Keyboard,
  Lightbulb,
  Compass,
  BrainCircuit,
  Server,
  Activity
} from 'lucide-react';
import { joinCourseByCode } from '../services/sharingService';

export default function ProjectDashboard({ 
  startLearning, 
  onCreateCourse, 
  onViewProgress,
  onViewProfile
}) {
  const [activePreviewTab, setActivePreviewTab] = useState('voice');
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ type: null, message: '' });
  const [openFaq, setOpenFaq] = useState(0);

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    if (!courseCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinStatus({ type: null, message: '' });
      await joinCourseByCode(courseCode);
      setJoinStatus({ type: 'success', message: 'Course joined successfully! Redirecting to your courses...' });
      setTimeout(() => {
        setShowCodeModal(false);
        setCourseCode('');
        setJoinStatus({ type: null, message: '' });
        if (startLearning) startLearning();
      }, 1500);
    } catch (error) {
      setJoinStatus({ type: 'error', message: error.message || 'Failed to join course with this code.' });
    } finally {
      setIsJoining(false);
    }
  };

  const corePillars = [
    {
      id: "voice",
      title: "Real-Time Voice AI Tutor",
      badge: "Gemini Live API",
      badgeColor: "bg-blue-50 text-blue-600 border-blue-200",
      desc: "Engage in natural, low-latency bi-directional voice conversations. The tutor streams 16kHz PCM audio, pauses the moment you speak, and explains complex nuances verbally.",
      icon: <Mic className="text-blue-600" size={24} />,
      highlights: [
        "Sub-second response via Gemini Live WebSockets",
        "Instant voice interruption (speech silencing)",
        "Real-time synchronized speech-to-text transcript",
        "Multiple distinct voice personalities (Kore, Aoede, Fenrir, etc.)"
      ]
    },
    {
      id: "curriculum",
      title: "Doc-to-Curriculum Generator",
      badge: "Instant Syllabus",
      badgeColor: "bg-indigo-50 text-indigo-600 border-indigo-200",
      desc: "Transform static textbook PDFs, raw notes, or simple topic prompts into an adaptive 10-week curriculum organized cleanly into Units, Topics, and Subtopics.",
      icon: <BookOpen className="text-indigo-600" size={24} />,
      highlights: [
        "Direct PDF and document file uploads",
        "Structured topic and subtopic generation",
        "Beginner, Intermediate, and Advanced pacing",
        "Permanent cloud persistence in Firestore"
      ]
    },
    {
      id: "slides",
      title: "Interactive Subtopic Slide Decks",
      badge: "Visual Learning",
      badgeColor: "bg-sky-50 text-sky-600 border-sky-200",
      desc: "Every subtopic includes structured visual presentation slides designed for maximum retention with numbered concept cards, key takeaways, and theater mode.",
      icon: <Presentation className="text-sky-600" size={24} />,
      highlights: [
        "Automatic breakdown into key numbered concepts",
        "Distraction-free Theater / Fullscreen presentation view",
        "Keyboard arrow navigation (← / →)",
        "One-click 'Explain Slide' live voice prompt"
      ]
    },
    {
      id: "assessment",
      title: "Intelligent Subjective Grading",
      badge: "Semantic Rubrics",
      badgeColor: "bg-amber-50 text-amber-600 border-amber-200",
      desc: "Go beyond simplistic multiple-choice. The AI evaluates open-ended conceptual explanations, assigns partial credit, and provides step-by-step model solutions.",
      icon: <Sparkles className="text-amber-600" size={24} />,
      highlights: [
        "Dynamically generated tests from course content",
        "Qualitative semantic rubric evaluations",
        "Specific breakdown of strengths & improvement areas",
        "Comprehensive model answers for every question"
      ]
    },
    {
      id: "debrief",
      title: "Post-Session Mastery Debrief",
      badge: "Session Recap",
      badgeColor: "bg-emerald-50 text-emerald-600 border-emerald-200",
      desc: "Conclude each tutoring session with an executive summary containing a complete verbatim dialogue transcript, concept mastery rating, and key takeaway pointers.",
      icon: <Award className="text-emerald-600" size={24} />,
      highlights: [
        "Full conversation transcript archival",
        "Instant conceptual mastery percentage",
        "Key takeaways summarized for revision",
        "Personalized recommendations for next sessions"
      ]
    },
    {
      id: "progress",
      title: "Learning Analytics Hub",
      badge: "Growth Metrics",
      badgeColor: "bg-purple-50 text-purple-600 border-purple-200",
      desc: "Track your academic journey with visual metrics including daily study streaks, cumulative hours spent, quiz score trends, and assessment retake logs.",
      icon: <BarChart2 className="text-purple-600" size={24} />,
      highlights: [
        "Daily active study streak counters",
        "Historical test attempts with retake capabilities",
        "Course completion percentages and milestones",
        "Visual progress charts for continuous motivation"
      ]
    },
    {
      id: "languages",
      title: "Global Multilingual Support",
      badge: "10+ Languages",
      badgeColor: "bg-cyan-50 text-cyan-600 border-cyan-200",
      desc: "Learn in whatever language feels natural. The tutor speaks, listens, and explains in English, Spanish, French, German, Hindi, Tamil, Telugu, Mandarin, Arabic, and more.",
      icon: <Globe className="text-cyan-600" size={24} />,
      highlights: [
        "Real-time voice and text in native tongue",
        "Bilingual explanations for complex vocabulary",
        "Accent-tuned natural speech output",
        "Seamless language switching mid-course"
      ]
    },
    {
      id: "sharing",
      title: "Course Sharing & Cohort Codes",
      badge: "Collaborative",
      badgeColor: "bg-rose-50 text-rose-600 border-rose-200",
      desc: "Generate 6-character access codes for any generated curriculum. Share with friends, study groups, or students to instantly replicate the syllabus.",
      icon: <Share2 className="text-rose-600" size={24} />,
      highlights: [
        "One-click 6-digit access code generation",
        "Zero-friction course duplication for peers",
        "Ideal for study groups, teachers, and classrooms",
        "Secure cloud cloning without overwriting original progress"
      ]
    }
  ];

  const workflowSteps = [
    {
      step: "01",
      title: "Upload or Prompt",
      subtitle: "Material Ingestion",
      desc: "Drop lecture notes, syllabi, or enter any subject topic. The AI organizes everything into an interactive 10-week roadmap."
    },
    {
      step: "02",
      title: "Converse with Live AI",
      subtitle: "Bi-directional Dialogue",
      desc: "Enter the classroom where the tutor speaks out loud, presents visual slides, and responds to your voice questions in real time."
    },
    {
      step: "03",
      title: "Evaluate & Master",
      subtitle: "Semantic Assessment",
      desc: "Take adaptive exams with qualitative grading. Review model solutions and receive constructive, rubric-based feedback."
    },
    {
      step: "04",
      title: "Track Growth & Share",
      subtitle: "Analytics & Collaboration",
      desc: "Check study streaks, review transcripts in your progress hub, and share join codes with peers for collaborative study."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24 font-['Inter',sans-serif]">
      
      {/* 1. HERO SECTION: Visionary Introduction */}
      <section className="relative pt-12 md:pt-20 pb-20 md:pb-28 px-6 overflow-hidden">
        {/* Ambient background decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-gradient-to-b from-blue-100/60 to-transparent blur-3xl -z-10 pointer-events-none" />
        <div className="absolute top-10 right-10 opacity-[0.03] pointer-events-none hidden lg:block">
          <Cpu size={500} />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-bold uppercase tracking-wider shadow-xs">
            <Zap size={14} className="fill-blue-600 text-blue-600" />
            <span>Next-Generation Intelligent Tutoring System</span>
          </div>

          {/* Display Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-950 tracking-tight leading-[1.08] font-['Plus_Jakarta_Sans',sans-serif]">
            Turn any knowledge into an <br />
            <span className="text-blue-600 underline decoration-blue-200 underline-offset-8">interactive voice classroom</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-normal">
            Don’t just read static documents—speak with them. Our AI transforms study materials into a structured, 
            multi-week curriculum with subtopic slides, conversational voice tutoring, and deep qualitative assessments.
          </p>

          {/* Action Launchpad Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3.5">
            <button 
              onClick={startLearning}
              className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold text-base hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2.5 active:scale-95"
            >
              <BookOpen size={20} />
              <span>Explore My Courses</span>
              <ArrowRight size={18} />
            </button>

            <button 
              onClick={onCreateCourse || startLearning}
              className="px-8 py-4 bg-white text-slate-800 border border-slate-200 rounded-2xl font-bold text-base hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2.5 active:scale-95"
            >
              <PlusCircle size={20} className="text-blue-600" />
              <span>Create New Course</span>
            </button>

            <button 
              onClick={onViewProgress || startLearning}
              className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-base hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95"
            >
              <BarChart2 size={18} className="text-slate-600" />
              <span>Progress</span>
            </button>

            {onViewProfile && (
              <button 
                onClick={onViewProfile}
                className="px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold text-base hover:bg-slate-200 transition-all flex items-center gap-2 active:scale-95"
              >
                <User size={18} className="text-blue-600" />
                <span>Profile & Attendance</span>
              </button>
            )}
          </div>

          {/* Quick Stats / Tech Badges */}
          <div className="pt-8 border-t border-slate-200/80 max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase mb-1">
                <Mic size={14} />
                <span>Live Voice</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">Gemini Live API</p>
              <p className="text-xs text-slate-500">16kHz PCM streaming</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase mb-1">
                <Presentation size={14} />
                <span>Slides Deck</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">Auto Subtopics</p>
              <p className="text-xs text-slate-500">Theater presentation</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase mb-1">
                <Sparkles size={14} />
                <span>Examiner</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">Semantic Rubrics</p>
              <p className="text-xs text-slate-500">Subjective grading</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-2xs">
              <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase mb-1">
                <Share2 size={14} />
                <span>Collaboration</span>
              </div>
              <p className="text-sm font-semibold text-slate-800">6-Digit Codes</p>
              <p className="text-xs text-slate-500">Peer course sharing</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE FEATURE PLAYGROUND / PREVIEW TAB SECTION */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
            <Radio size={12} className="text-blue-600 animate-pulse" />
            <span>Interactive Experience Preview</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Experience the system in action
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
            Click across the interactive previews below to see how each module operates inside the learning environment.
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-4 no-scrollbar">
          {[
            { id: 'voice', label: '1. Live Voice Classroom', icon: Mic },
            { id: 'slides', label: '2. Subtopic Slides Engine', icon: Presentation },
            { id: 'quiz', label: '3. Intelligent Assessment', icon: Sparkles },
            { id: 'debrief', label: '4. Session Debrief & Stats', icon: Award }
          ].map((tab) => {
            const isActive = activePreviewTab === tab.id;
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePreviewTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all shrink-0 ${
                  isActive 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <IconComponent size={16} className={isActive ? 'text-sky-400' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Preview Frame */}
        <div className="mt-4 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 md:p-8 text-white min-h-[380px] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* TAB 1: VOICE CLASSROOM PREVIEW */}
          {activePreviewTab === 'voice' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-sm font-bold text-slate-200">Gemini Live Bi-Directional Audio Session</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-sky-400 bg-sky-950/60 border border-sky-800/60 px-3 py-1 rounded-full font-mono">
                  <span>Voice: Kore (Natural Female)</span>
                </div>
              </div>

              <div className="space-y-4 font-mono text-sm max-w-3xl">
                {/* User voice */}
                <div className="flex items-start gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/50">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                    You
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-0.5">Spoken via Microphone:</span>
                    <p className="text-slate-200">"Could you explain why the wave function collapses upon observation in quantum mechanics?"</p>
                  </div>
                </div>

                {/* AI Tutor voice */}
                <div className="flex items-start gap-3 bg-blue-950/40 p-4 rounded-2xl border border-blue-800/40">
                  <div className="w-6 h-6 rounded-full bg-sky-400 text-slate-950 flex items-center justify-center shrink-0 text-xs font-bold">
                    AI
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sky-300 font-sans">AI Tutor (Speaking Out Loud)</span>
                      <div className="flex items-center gap-0.5 ml-1">
                        <span className="w-1 h-3 bg-sky-400 rounded-full animate-pulse" />
                        <span className="w-1 h-5 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                        <span className="w-1 h-2 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                        <span className="w-1 h-4 bg-sky-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                    <p className="text-slate-200 font-sans leading-relaxed text-sm">
                      "Great question! Before observation, the particle exists in a superposition of states described by Schrödinger's equation. When an measurement occurs, the physical system interacts with the macroscopic apparatus, forcing the probability distribution to collapse to a single eigenvalue."
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400 gap-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  <span>Instant voice interrupt: Talking into the mic halts the tutor immediately</span>
                </span>
                <span className="font-mono text-sky-400">Sample Rate: 16,000 Hz PCM</span>
              </div>
            </div>
          )}

          {/* TAB 2: SLIDE PRESENTATION PREVIEW */}
          {activePreviewTab === 'slides' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-sky-400">
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 border border-blue-500/30">Slide 03 / 08</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300">Unit 2: Quantum States & Measurement</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-xl text-slate-300 border border-slate-700">Theater View Enabled</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-white font-['Plus_Jakarta_Sans',sans-serif]">
                  The Copenhagen Interpretation vs. Many-Worlds
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-300 font-mono">
                      <span className="w-5 h-5 rounded bg-blue-500/20 flex items-center justify-center">1</span>
                      <span>Copenhagen Model</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      Physical reality is fundamentally probabilistic until an act of measurement forces the wavefunction to collapse.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                    <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs font-mono">
                      <span className="w-5 h-5 rounded bg-indigo-500/20 flex items-center justify-center">2</span>
                      <span>Many-Worlds Formulation</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      No wavefunction collapse occurs; every possible outcome of a quantum decision branches into separate universal timelines.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-sky-400" />
                  <span>Click 'Explain Slide' at any moment to have the tutor walk through the content verbally.</span>
                </div>
                <div className="font-mono text-slate-500">Keyboard: ← / →</div>
              </div>
            </div>
          )}

          {/* TAB 3: QUIZ & EVALUATION PREVIEW */}
          {activePreviewTab === 'quiz' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold font-mono">
                    Assessment Evaluation
                  </span>
                  <span className="text-xs text-slate-400">Question 2 of 5 (Subjective)</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-3 py-1 rounded-full">
                  Score: 9.5 / 10 (Mastery Achieved)
                </div>
              </div>

              <div className="space-y-3 font-sans">
                <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-700/60">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Student Answer:</span>
                  <p className="text-sm text-slate-200 italic">
                    "Wave-particle duality means matter displays both wavelike interference patterns (like in the double-slit experiment) and localized particle impacts depending on the observation apparatus."
                  </p>
                </div>

                <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-800/50 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                    <CheckCircle2 size={15} />
                    <span>AI Feedback & Qualitative Rubric Analysis:</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    "Excellent articulation of the de Broglie relationship and the role of experimental apparatus in establishing complimentary observables. To achieve full marks, note that the de Broglie wavelength λ = h/p illustrates the exact mathematical link."
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs text-slate-400">
                <span>Model answers & feedback are generated dynamically based on actual course content.</span>
                <span className="text-sky-400 font-bold">Retake Anytime</span>
              </div>
            </div>
          )}

          {/* TAB 4: DEBRIEF & ANALYTICS PREVIEW */}
          {activePreviewTab === 'debrief' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                  <Award size={16} />
                  <span>Session Completion Debrief & Analytics</span>
                </div>
                <div className="text-xs font-mono text-slate-400">Duration: 18m 42s • 14 Dialogue Exchanges</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <div className="text-2xl font-extrabold text-emerald-400 font-mono">92%</div>
                  <div className="text-xs text-slate-300 font-semibold">Concept Retention</div>
                  <div className="text-[11px] text-slate-500">Based on dialogue verification</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <div className="text-2xl font-extrabold text-blue-400 font-mono">5 Days</div>
                  <div className="text-xs text-slate-300 font-semibold">Active Study Streak</div>
                  <div className="text-[11px] text-slate-500">+1 day toward weekly badge</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-center space-y-1">
                  <div className="text-2xl font-extrabold text-amber-400 font-mono">CODE: QTM912</div>
                  <div className="text-xs text-slate-300 font-semibold">Shareable Course Code</div>
                  <div className="text-[11px] text-slate-500">Ready for cohort replication</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50 space-y-1.5">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block">Recommended Next Steps:</span>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Proceed to Unit 3: "Heisenberg's Uncertainty Principle & Wavepacket Dispersion". Review the 4 archived dialogue cards in your Progress Hub.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 3. COMPLETE FEATURE MATRIX: The 8 Pillars of the System */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider border border-blue-100">
            <Layers size={13} />
            <span>Complete Capability Matrix</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Everything engineered for deeper mastery
          </h2>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto">
            Explore the core architectural components that make this tutoring system intuitive, responsive, and academically rigorous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {corePillars.map((pillar) => (
            <motion.div
              key={pillar.id}
              whileHover={{ y: -5 }}
              className="bg-white p-7 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:shadow-slate-200/60 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                {/* Header Icon & Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {pillar.icon}
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${pillar.badgeColor}`}>
                    {pillar.badge}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                {/* Feature Bullet Points */}
                <ul className="pt-3 border-t border-slate-100 space-y-2">
                  {pillar.highlights.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-600">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. WORKFLOW JOURNEY: How learning works in 4 steps */}
      <section className="px-6 py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
              How the learning journey works
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto">
              From uploading your lecture notes to earning certified mastery, here is the end-to-end loop.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="flex flex-col space-y-3 relative">
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 font-mono font-bold text-sm flex items-center justify-center">
                    {step.step}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {step.subtitle}
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                  {step.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TECH ARCHITECTURE HIGHLIGHT */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 rounded-3xl p-8 md:p-12 text-white border border-slate-800 shadow-2xl space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-sky-400 text-xs font-mono font-bold uppercase">
              <Terminal size={14} />
              <span>Full-Stack Engineering & Scalability</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
              Built with state-of-the-art AI infrastructure
            </h3>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl">
              This application interfaces directly with Google's newest Gemini models using specialized streaming WebSockets, low-latency audio capture, and resilient cloud storage.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="text-sky-400 font-mono font-bold text-xs">AUDIO STREAMING</div>
              <div className="text-white font-bold text-sm">AudioWorklet PCM</div>
              <p className="text-xs text-slate-400">Raw 16kHz audio captured natively in browser worklets, eliminating browser codec latency.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="text-emerald-400 font-mono font-bold text-xs">MODEL BACKEND</div>
              <div className="text-white font-bold text-sm">Gemini Live API</div>
              <p className="text-xs text-slate-400">WebSocket bi-directional real-time communication for natural human-like pacing.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
              <div className="text-indigo-400 font-mono font-bold text-xs">PERSISTENCE</div>
              <div className="text-white font-bold text-sm">Cloud Firestore</div>
              <p className="text-xs text-slate-400">Instant cross-device sync of courses, assessment attempts, transcripts, and join codes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="px-6 max-w-5xl mx-auto text-center space-y-6">
        <div className="p-10 md:p-14 rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-500/20 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif]">
            Ready to experience personalized AI education?
          </h3>
          <p className="text-blue-100 text-base max-w-xl mx-auto">
            Create your first course from any document, or explore your existing course library now.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={startLearning}
              className="px-8 py-4 bg-white text-blue-600 rounded-2xl font-bold text-base hover:bg-blue-50 transition-all shadow-md active:scale-95 flex items-center gap-2"
            >
              <BookOpen size={18} />
              <span>Launch Courses</span>
            </button>

            <button
              onClick={onCreateCourse || startLearning}
              className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white border border-blue-500 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center gap-2"
            >
              <PlusCircle size={18} />
              <span>Build a New Course</span>
            </button>

            <button
              onClick={() => setShowCodeModal(true)}
              className="px-6 py-4 bg-blue-750 hover:bg-blue-800 text-white/90 border border-blue-400/40 rounded-2xl font-bold text-base transition-all active:scale-95 flex items-center gap-2"
            >
              <Key size={18} />
              <span>Enter Join Code</span>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION: Cognitive Scaffolding & Pedagogical Framework */}
      <section className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 uppercase tracking-wider">
            <BrainCircuit size={14} />
            Learning Science
          </span>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight">
            How Cognitive Scaffolding Accelerates Retention
          </h2>
          <p className="text-sm text-slate-500">
            Engineered around cognitive load theory and deliberate practice, our learning loop replaces passive video lectures with active, low-latency dialogue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-blue-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Mic size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">
              Socratic Inquiry
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI never delivers monotonous monologue. Instead, it poses targeted questions that guide you to articulate principles in your own words.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-emerald-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Presentation size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">
              Dual-Coding Slides
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Verbal explanation is synchronously paired with structured slide visuals and key takeaways, activating both verbal and visual memory channels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-amber-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">
              Retrieval Checks
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Micro-assessments immediately follow each subtopic session to test conceptual comprehension before you proceed to advanced units.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs hover:border-purple-200 transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <h3 className="font-bold text-slate-900 text-base font-['Plus_Jakarta_Sans',sans-serif]">
              Qualitative Rubrics
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Final exams assess both multiple-choice precision and free-form descriptive depth, returning actionable feedback and model solutions.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION: Voice Tips & Keyboard Shortcuts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Voice Session Recommendations */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Headphones size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Voice Session Best Practices
              </h3>
              <p className="text-xs text-slate-500">How to get the most natural dialogue with your AI tutor</p>
            </div>
          </div>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
              <span><strong className="text-slate-900">Use headphones:</strong> Prevents computer speaker audio from feeding back into the microphone stream during live dialogue.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
              <span><strong className="text-slate-900">Interrupt freely:</strong> You don't have to wait for the tutor to finish long explanations; interrupt naturally whenever you have a doubt or clarification.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
              <span><strong className="text-slate-900">Ask for analogies or code:</strong> Say &quot;give me an intuitive real-world analogy&quot; or &quot;walk through an edge-case example&quot; to alter teaching modalities.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">4</span>
              <span><strong className="text-slate-900">Generate notes upon completion:</strong> When ready to finish, select &quot;Generate Summary Notes&quot; to produce downloadable markdown study cards.</span>
            </li>
          </ul>
        </div>

        {/* Keyboard Shortcuts Cheatsheet */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Keyboard size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
                Productivity & Keyboard Controls
              </h3>
              <p className="text-xs text-slate-500">Quick shortcuts to navigate slides and manage audio</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Toggle Microphone Mute</span>
              <kbd className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold shadow-2xs">
                Space / Click Mic
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Previous / Next Slide</span>
              <kbd className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold shadow-2xs">
                ← Left / Right Arrow →
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Exit Fullscreen Theater Mode</span>
              <kbd className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold shadow-2xs">
                Esc / Back Button
              </kbd>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-700 font-medium">Submit Chat Prompt or Quiz Answer</span>
              <kbd className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-800 font-mono text-[11px] font-bold shadow-2xs">
                Enter ↵
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION: Frequently Asked Questions (FAQ) */}
      <section className="bg-white rounded-3xl p-6 md:p-10 border border-slate-200 shadow-xs space-y-6 pt-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-bold tracking-wider uppercase">
              <HelpCircle size={14} />
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl font-serif font-bold text-slate-900 tracking-tight mt-1">
              Everything You Need to Know
            </h2>
          </div>
          <p className="text-xs text-slate-500 max-w-sm">
            Answers to common questions about voice tutoring, study hour calculation, custom courses, and cohort codes.
          </p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "How does the Voice AI adapt to my personal knowledge level?",
              a: "The AI companion listens in real-time using bidirectional 16kHz PCM audio streaming. Rather than reading a static script, it asks targeted questions, measures your understanding from your vocal explanations, identifies specific misconceptions, and adjusts the depth and pace of the subtopic dynamically."
            },
            {
              q: "How is daily attendance, study streaks, and study time calculated?",
              a: "Whenever you log in and engage with your courses, a daily attendance record is timestamped in your isolated Firestore account. Consecutive active days build your streak counter, and time spent in voice tutoring sessions, lecture slide review, and final exams automatically accumulates toward your total verified study hours."
            },
            {
              q: "What materials can I use to build a custom curriculum?",
              a: "You can create a structured course from any text, syllabus outline, research paper, PDF notes, or curriculum prompt. The system uses Gemini to decompose your materials into logical hierarchical units, subtopics, key learning milestones, slide decks, and comprehensive study notes."
            },
            {
              q: "How does the subjective grading engine evaluate open-ended answers?",
              a: "For descriptive, short-answer, and coding problems, the AI performs multi-dimensional evaluation based on conceptual accuracy, completeness, depth, and reasoning. It provides both a quantitative score and qualitative feedback with model solutions and suggestions for improvement."
            },
            {
              q: "Can I access and review my notes and slides after a voice session?",
              a: "Yes! At the end of every tutoring session, you can generate comprehensive Markdown study notes with key takeaways and formulas, as well as review the slide carousel in theater mode anytime from your course dashboard."
            },
            {
              q: "How do cohort share codes work with study groups and professors?",
              a: "Every course you create has a unique 6-digit access code (e.g. 'CS101A'). You can share this code with classmates or professors, who can enter it in the 'Join Course' dialog on their dashboard to instantly clone and start studying the shared curriculum."
            }
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className={`rounded-2xl border transition-all ${
                  isOpen ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200/80 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900"
                >
                  <span className="font-['Plus_Jakarta_Sans',sans-serif]">{item.q}</span>
                  <ChevronDown 
                    size={18} 
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-blue-100/60 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION: Technical Architecture & System Diagnostics */}
      <section className="bg-slate-900 rounded-3xl p-6 md:p-8 text-white space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Server size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base font-['Plus_Jakarta_Sans',sans-serif] text-white">
                Platform Architecture & Specifications
              </h3>
              <p className="text-xs text-slate-400">High-concurrency multimodal infrastructure</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
            <Activity size={13} className="animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Live Audio Pipeline</span>
            <p className="text-sm font-bold text-white font-mono">16 kHz Linear PCM</p>
            <p className="text-[11px] text-slate-400">Low-latency AudioWorklet streaming via WebSockets</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Intelligence Engine</span>
            <p className="text-sm font-bold text-white font-mono">Gemini Multimodal</p>
            <p className="text-[11px] text-slate-400">Real-time reasoning, question grading & syllabus synthesis</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Database & Storage</span>
            <p className="text-sm font-bold text-white font-mono">Firebase Firestore</p>
            <p className="text-[11px] text-slate-400">Isolated user tenancy, attendance records & progress state</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Frontend Framework</span>
            <p className="text-sm font-bold text-white font-mono">React 18 + Tailwind</p>
            <p className="text-[11px] text-slate-400">Responsive SPA with motion transitions & Lucide icons</p>
          </div>
        </div>
      </section>

      {/* SECTION: Comprehensive Dashboard Footer */}
      <footer className="pt-6 pb-2 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold font-serif shadow-xs">
            <GraduationCap size={16} />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">AI Learning Companion</span>
            <span className="text-[11px] text-slate-400">Interactive voice tutor & curriculum mastery engine</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-5 text-slate-600 font-medium">
          <button onClick={startLearning} className="hover:text-blue-600 transition-colors">
            All Courses
          </button>
          <button onClick={onViewProgress} className="hover:text-blue-600 transition-colors">
            Analytics
          </button>
          {onViewProfile && (
            <button onClick={onViewProfile} className="hover:text-blue-600 transition-colors">
              Student Profile
            </button>
          )}
          <button onClick={() => setShowCodeModal(true)} className="hover:text-blue-600 transition-colors">
            Join Code
          </button>
        </div>

        <div className="text-[11px] text-slate-400">
          v2.4.0 • Enterprise Academic Edition
        </div>
      </footer>

      {/* MODAL: Join Course By Code */}
      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-slate-100 space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">Join a Course</h3>
                  <p className="text-xs text-slate-500">Enter a 6-digit access code</p>
                </div>
              </div>

              <form onSubmit={handleJoinCourse} className="space-y-4">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. AB12CD"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-center text-lg tracking-widest uppercase font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  autoFocus
                />

                {joinStatus.message && (
                  <p className={`text-xs ${joinStatus.type === 'error' ? 'text-red-500' : 'text-emerald-600'} font-medium text-center`}>
                    {joinStatus.message}
                  </p>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeModal(false);
                      setCourseCode('');
                      setJoinStatus({ type: null, message: '' });
                    }}
                    className="flex-1 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining || courseCode.trim().length < 3}
                    className="flex-1 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-all shadow-sm"
                  >
                    {isJoining ? "Joining..." : "Access Course"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
