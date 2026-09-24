import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue } from 'motion/react';
import { 
  GraduationCap, 
  Sparkles, 
  Mic, 
  BookOpen, 
  Layers, 
  BarChart2, 
  Share2, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  Pause,
  Volume2, 
  Award, 
  ShieldCheck, 
  Cpu, 
  Globe, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Zap, 
  BrainCircuit, 
  Check, 
  Copy, 
  Plus, 
  Search, 
  Users, 
  Flame, 
  Clock, 
  Compass, 
  HelpCircle, 
  LogIn, 
  UserCheck, 
  RefreshCw, 
  AlertCircle, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Presentation, 
  FileText, 
  Headphones, 
  Keyboard, 
  Lightbulb, 
  Server, 
  Activity,
  Code,
  Radio,
  BookMarked,
  Shield,
  FileCheck,
  CheckCircle,
  FolderTree,
  Maximize2,
  Minimize2,
  Sliders,
  Eye,
  ArrowUpRight,
  User as UserIcon,
  MousePointer,
  Waves,
  Disc,
  Boxes,
  Compass as CompassIcon,
  CircleDot,
  RotateCcw
} from 'lucide-react';
import Interactive3DObject from './Interactive3DObject';

/* =========================================================================
   1. INTERACTIVE PARTICLE CONSTELLATION CANVAS (Particle & WebGL-style effect)
   ========================================================================= */
function ParticleNetworkCanvas({ mousePos }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle nodes
    const particleCount = Math.min(Math.floor((width * height) / 18000), 55);
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1.2,
      baseAlpha: Math.random() * 0.35 + 0.15
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Update & Draw particles
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Subtle mouse attraction
        if (mousePos.current.x !== null && mousePos.current.y !== null) {
          const dx = mousePos.current.x - p.x;
          const dy = mousePos.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const force = (180 - dist) / 180;
            p.x += (dx / dist) * force * 0.6;
            p.y += (dy / dist) * force * 0.6;
          }
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${p.baseAlpha})`;
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 130) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            const alpha = (1 - dist / 130) * 0.18;
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mousePos]);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60 z-0" 
    />
  );
}

/* =========================================================================
   2. 3D CARD POP-FRONT WITH HIGH-VISIBILITY CURSOR SPOTLIGHT
   ========================================================================= */
function TiltSpotlightCard({ children, className = '', glowColor = 'rgba(59, 130, 246, 0.35)' }) {
  const cardRef = useRef(null);
  const [spotlightPos, setSpotlightPos] = useState({ x: -1000, y: -1000 });
  const [isHovered, setIsHovered] = useState(false);

  // Separate space-y-* / space-x-* from container so they apply to the content wrapper,
  // preventing Tailwind's `> * + *` from distorting absolute decorative spotlight layers
  const spaceClassMatches = className.match(/\bspace-[xy]-\S+/g) || [];
  const spaceClasses = spaceClassMatches.join(' ');
  const containerClasses = className.replace(/\bspace-[xy]-\S+/g, '').trim();

  const updateSpotlight = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    // Correct for CSS scale transform (scale: 1.038) to keep spotlight exactly aligned with cursor
    const scaleX = rect.width / (cardRef.current.offsetWidth || 1) || 1;
    const scaleY = rect.height / (cardRef.current.offsetHeight || 1) || 1;
    setSpotlightPos({
      x: (e.clientX - rect.left) / scaleX,
      y: (e.clientY - rect.top) / scaleY,
    });
  };

  const handleMouseMove = (e) => {
    updateSpotlight(e);
  };

  const handleMouseEnter = (e) => {
    updateSpotlight(e);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? 1.038 : 1,
      }}
      whileTap={{ scale: 0.985 }}
      transition={{ 
        type: 'spring', 
        stiffness: 420, 
        damping: 25, 
        mass: 0.6 
      }}
      className={`relative rounded-3xl bg-white/90 backdrop-blur-2xl border transition-all duration-300 ${
        isHovered 
          ? 'border-blue-400/80 shadow-[0_25px_60px_-10px_rgba(37,99,235,0.20),0_0_35px_rgba(59,130,246,0.12)] z-20' 
          : 'border-white/95 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.07)] z-10'
      } ${containerClasses}`}
    >
      {/* Background Decorative Layer Stack (Isolated from space-y and child layout) */}
      <div className="!m-0 pointer-events-none absolute inset-0 rounded-3xl overflow-hidden z-0">
        {/* 3D Pop-Front Specular Sheen (Top Lip Light Reflection) */}
        <div 
          className={`absolute inset-x-0 top-0 h-[2.5px] transition-opacity duration-300 ${
            isHovered ? 'bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-100' : 'opacity-0'
          }`} 
        />

        {/* Focused Card Spotlight Beam - Smooth Gaussian roll-off without banding rings */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(
              520px circle at ${spotlightPos.x}px ${spotlightPos.y}px,
              rgba(59, 130, 246, 0.20) 0%,
              rgba(59, 130, 246, 0.13) 25%,
              rgba(99, 102, 241, 0.07) 50%,
              rgba(99, 102, 241, 0.02) 75%,
              transparent 100%
            )`
          }}
        />

        {/* Card Border Luminous Highlight that traces cursor location */}
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: isHovered ? 1 : 0,
            borderRadius: 'inherit',
            padding: '1.5px',
            background: `radial-gradient(380px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(59, 130, 246, 0.65), transparent 70%)`,
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        />

        {/* Soft ambient glass highlight */}
        <div className="absolute inset-0 rounded-3xl border border-white/60 pointer-events-none" />
      </div>

      {/* Card Content (Strictly in front of spotlight) */}
      <div className={`relative z-10 w-full h-full ${spaceClasses}`}>{children}</div>
    </motion.div>
  );
}

/* =========================================================================
   3. MAGNETIC ELASTIC BUTTON WITH 3D POP-FRONT
   ========================================================================= */
function MagneticButton({ children, onClick, className = '', id }) {
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [ripples, setRipples] = useState([]);

  const handleMouseMove = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = (e.clientX - (rect.left + rect.width / 2)) * 0.28;
    const y = (e.clientY - (rect.top + rect.height / 2)) * 0.28;
    setPos({ x, y });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setPos({ x: 0, y: 0 });
    setIsHovered(false);
  };

  const handleClick = (e) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const newRipple = { x, y, id: Date.now() };
    setRipples((prev) => [...prev, newRipple]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) onClick(e);
  };

  return (
    <motion.button
      ref={btnRef}
      id={id}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ 
        x: pos.x, 
        y: pos.y, 
        scale: isHovered ? 1.055 : 1,
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 20 }}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden cursor-pointer select-none transition-all duration-200 ${
        isHovered ? 'shadow-2xl shadow-blue-500/35 ring-2 ring-blue-400/50 z-20' : 'z-10'
      } ${className}`}
    >
      {/* Ripple elements */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/40 pointer-events-none animate-ping"
          style={{
            left: ripple.x - 12,
            top: ripple.y - 12,
            width: 24,
            height: 24
          }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  );
}

/* =========================================================================
   4. ANIMATED PROGRESS RING (Animated Progress Rings)
   ========================================================================= */
function AnimatedProgressRing({ percentage, size = 96, strokeWidth = 8, color = '#2563eb', label = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated fill circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-bold font-mono text-slate-800 tracking-tight">
          {percentage}%
        </span>
      </div>
      {label && <span className="text-[11px] font-semibold text-slate-500 mt-2">{label}</span>}
    </div>
  );
}

/* =========================================================================
   5. MULTI-STATE ANIMATED AI ORB (Thinking, Listening, Speaking, Idle)
   ========================================================================= */
function AnimatedAiOrb({ orbState = 'speaking', onClickState }) {
  // States: 'speaking' | 'listening' | 'thinking' | 'idle'
  const stateConfigs = {
    speaking: {
      gradient: 'from-blue-600 via-indigo-500 to-cyan-400',
      label: 'AI Tutor Speaking',
      subtext: 'Synthesizing voice response over 16kHz WebSocket stream',
      glow: 'rgba(59, 130, 246, 0.45)',
      ringColor: 'border-blue-400/40'
    },
    listening: {
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      label: 'AI Listening to You',
      subtext: 'Continuous voice activity detection with instant interrupt',
      glow: 'rgba(16, 185, 129, 0.45)',
      ringColor: 'border-emerald-400/40'
    },
    thinking: {
      gradient: 'from-purple-600 via-violet-500 to-pink-500',
      label: 'AI Reasoning & Synthesizing',
      subtext: 'Multimodal query resolution and slide sync preparation',
      glow: 'rgba(168, 85, 247, 0.45)',
      ringColor: 'border-purple-400/40'
    },
    idle: {
      gradient: 'from-slate-400 via-blue-400 to-indigo-300',
      label: 'Tutor Armed & Standby',
      subtext: 'Click or speak anytime to awaken personal companion',
      glow: 'rgba(99, 102, 241, 0.25)',
      ringColor: 'border-slate-300/40'
    }
  };

  const activeConfig = stateConfigs[orbState] || stateConfigs.speaking;

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-6">
      
      {/* Orb Stage with Multi-layered Liquid Ripple Rings */}
      <div className="relative flex items-center justify-center w-56 h-56">
        
        {/* Ring 3 (Outer Radar Ripple) */}
        <motion.div
          animate={{
            scale: orbState === 'listening' ? [1, 1.35, 1] : [1, 1.15, 1],
            opacity: orbState === 'idle' ? 0.2 : [0.2, 0.6, 0.2]
          }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          className={`absolute inset-0 rounded-full border-2 ${activeConfig.ringColor} pointer-events-none`}
        />

        {/* Ring 2 (Middle Resonator) */}
        <motion.div
          animate={{
            scale: orbState === 'thinking' ? [1, 1.25, 1] : [1, 1.18, 1],
            rotate: orbState === 'thinking' ? [0, 360] : 0,
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: orbState === 'thinking' ? 4 : 2.5, 
            ease: 'easeInOut' 
          }}
          className={`absolute w-44 h-44 rounded-full border border-dashed ${activeConfig.ringColor} pointer-events-none`}
        />

        {/* Central Luminous Liquid Orb */}
        <motion.div
          animate={{
            scale: orbState === 'speaking' ? [1, 1.08, 0.98, 1.05, 1] : [1, 1.04, 1],
            rotate: orbState === 'thinking' ? [0, 180, 360] : [0, 10, -10, 0]
          }}
          transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          style={{ boxShadow: `0 0 60px ${activeConfig.glow}, inset 0 0 25px rgba(255,255,255,0.6)` }}
          className={`w-32 h-32 rounded-full bg-gradient-to-tr ${activeConfig.gradient} flex items-center justify-center text-white relative cursor-pointer shadow-2xl transition-all duration-700`}
        >
          {/* Internal Iris Shimmer */}
          <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md flex items-center justify-center shadow-inner">
            {orbState === 'speaking' && <Volume2 size={24} className="animate-pulse" />}
            {orbState === 'listening' && <Mic size={24} className="animate-bounce" />}
            {orbState === 'thinking' && <BrainCircuit size={24} className="animate-spin-slow" />}
            {orbState === 'idle' && <Sparkles size={24} />}
          </div>
        </motion.div>
      </div>

      {/* Dynamic Status Text & Subtitle */}
      <div className="space-y-1.5 max-w-sm">
        <h4 className="text-base font-bold text-slate-800 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>{activeConfig.label}</span>
        </h4>
        <p className="text-xs text-slate-500 leading-relaxed">
          {activeConfig.subtext}
        </p>
      </div>

      {/* Interactive State Toggle Buttons (Micro-interactions) */}
      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
        {[
          { id: 'speaking', label: 'Speaking', icon: Volume2 },
          { id: 'listening', label: 'Listening', icon: Mic },
          { id: 'thinking', label: 'Thinking', icon: BrainCircuit },
          { id: 'idle', label: 'Standby', icon: Sparkles }
        ].map((s) => {
          const Icon = s.icon;
          const isActive = orbState === s.id;
          return (
            <button
              key={s.id}
              onClick={() => onClickState(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-2xs ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 scale-105' 
                  : 'bg-white/80 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <Icon size={12} />
              <span>{s.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
}

/* =========================================================================
   6. INTERACTIVE TIMELINE COMPONENT (Interactive Timelines & Staggered Reveal)
   ========================================================================= */
function InteractiveTimeline() {
  const [activeStep, setActiveStep] = useState(1);

  const steps = [
    {
      step: 1,
      tag: "STEP 01",
      title: "Multimodal Syllabus Synthesis",
      summary: "Upload any textbook PDF, paste a YouTube lecture link, or type a topic prompt. Gemini generates a 10-week structured curriculum organized into Units and Subtopics.",
      duration: "4.2s runtime",
      pill: "Gemini 2.5 Pro"
    },
    {
      step: 2,
      tag: "STEP 02",
      title: "Dual-Coding Slide Generation",
      summary: "For each subtopic, the visual engine crafts a 4-8 slide deck featuring mathematical formulas, architectural diagrams, and concise retention summaries.",
      duration: "Instant cache",
      pill: "SVG & LaTeX Decks"
    },
    {
      step: 3,
      tag: "STEP 03",
      title: "Full-Duplex Socratic Voice Lecture",
      summary: "The AI tutor walks through the slides verbally via 16kHz PCM audio stream. You can interrupt mid-sentence to ask for analogies, real-world examples, or language translations.",
      duration: "<380ms reflex",
      pill: "WebSocket Audio"
    },
    {
      step: 4,
      tag: "STEP 04",
      title: "Subjective Diagnostic Testing",
      summary: "Rather than simplistic multiple choice, you complete structured open-ended essays, mathematical derivations, or voice-recorded responses.",
      duration: "Adaptive difficulty",
      pill: "Semantic Rubrics"
    },
    {
      step: 5,
      tag: "STEP 05",
      title: "Targeted Weakness Remediation",
      summary: "Detailed diagnostic feedback isolates exact misconceptions (e.g. confusing variance vs bias) and generates targeted corrective follow-up drills.",
      duration: "Continuous loop",
      pill: "Mastery Progression"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Step milestone tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 overflow-x-auto gap-2">
        {steps.map((s) => {
          const isActive = activeStep === s.step;
          return (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive 
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                  : 'bg-white/60 hover:bg-white text-slate-600 border border-slate-200'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                isActive ? 'bg-white text-blue-600' : 'bg-slate-200 text-slate-700'
              }`}>
                {s.step}
              </span>
              <span>{s.tag}</span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="p-8 rounded-3xl bg-white/90 backdrop-blur-xl border border-white shadow-[0_20px_50px_-10px_rgba(15,23,42,0.06)] space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {steps[activeStep - 1].tag}
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
                {steps[activeStep - 1].pill}
              </span>
              <span>&bull;</span>
              <span>{steps[activeStep - 1].duration}</span>
            </div>
          </div>

          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
            {steps[activeStep - 1].title}
          </h3>

          <p className="text-base text-slate-600 leading-relaxed max-w-3xl">
            {steps[activeStep - 1].summary}
          </p>

          <div className="pt-4 flex items-center gap-3">
            <button
              onClick={() => setActiveStep((prev) => (prev > 1 ? prev - 1 : 5))}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition-colors"
            >
              &larr; Previous Stage
            </button>
            <button
              onClick={() => setActiveStep((prev) => (prev < 5 ? prev + 1 : 1))}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors flex items-center gap-1"
            >
              <span>Next Stage</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* =========================================================================
   7. SKELETON SHIMMER PREVIEW TOGGLE (Skeleton Loading & Shimmer Effect)
   ========================================================================= */
function ShimmerSkeletonDemo({ isSkeletonActive }) {
  if (!isSkeletonActive) {
    return (
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              AI
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Advanced Neural Architectures</h4>
              <p className="text-xs text-slate-500">Unit 3: Graph Attention Networks</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            Live Stream
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Aggregating neighbor node feature projections via learned permutation-invariant attention matrices.
        </p>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-600 rounded-full w-3/4" />
        </div>
      </div>
    );
  }

  // Skeleton shimmer state
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4 relative overflow-hidden">
      {/* Shimmer sweep bar */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer-sweep bg-gradient-to-r from-transparent via-white/70 to-transparent pointer-events-none" />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
          <div className="space-y-1.5">
            <div className="w-36 h-3.5 bg-slate-200 rounded animate-pulse" />
            <div className="w-24 h-2.5 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-16 h-5 bg-slate-200 rounded-full animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="w-full h-3 bg-slate-100 rounded animate-pulse" />
        <div className="w-4/5 h-3 bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full animate-pulse" />
    </div>
  );
}

/* =========================================================================
   MAIN PRESENTATION LANDING PAGE COMPONENT (LIGHT LUXURY THEME)
   ========================================================================= */
export default function PresentationLandingPage({
  user,
  onGoToDashboard,
  onOpenSignIn,
  isLoggingIn,
  isGuestLoggingIn,
  loginError,
  onRetryLogin,
  onGuestLogin
}) {
  // Navigation & Scroll state
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  // Global mouse coordinates for background cursor spotlight & particle canvas
  const mousePos = useRef({ x: null, y: null });
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);

  // 1. Voice Chamber State
  const [voicePersonality, setVoicePersonality] = useState('Aoede');
  const [orbState, setOrbState] = useState('speaking');
  const [isSpeaking, setIsSpeaking] = useState(true);
  const [simulatedTranscript, setSimulatedTranscript] = useState(
    "Welcome to your private classroom. We're breaking down Transformer Attention mechanisms today. Feel free to speak anytime to interrupt me."
  );
  const [interruptionTriggered, setInterruptionTriggered] = useState(false);
  const voiceTimeoutRef = useRef(null);

  // 2. Synced Slide Theatre State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const sampleSlides = [
    {
      number: "01",
      tag: "FOUNDATION",
      title: "Self-Attention Mechanism",
      body: "Instead of processing words sequentially like RNNs, self-attention calculates dynamic pairwise relevance scores across all tokens simultaneously.",
      voiceQuote: "Notice the query-key matrix multiplication. Each word dynamically attends to every other word in the entire sentence regardless of distance.",
      formula: "Attention(Q, K, V) = softmax(Q·Kᵀ / √dₖ) V",
      takeaway: "Eliminates recurrent bottlenecks; parallelizes training across thousands of GPU tensor cores."
    },
    {
      number: "02",
      tag: "ARCHITECTURE",
      title: "Multi-Head Projection",
      body: "Projecting queries, keys, and values into multiple subspaces allows the network to co-attend to information from different representation aspects.",
      voiceQuote: "Think of multi-head attention like having eight different linguists analyzing the same paragraph at once—one studies syntax, another tone, another references.",
      formula: "MultiHead(Q, K, V) = Concat(head₁...headₕ) Wᴼ",
      takeaway: "Prevents a single dominant token from overshadowing nuanced grammatical relationships."
    },
    {
      number: "03",
      tag: "POSITIONAL ENCODING",
      title: "Sinusoidal Geometric Vectors",
      body: "Because Transformers discard recurrence, sequential order must be injected via deterministic sinusoidal trigonometric wave vectors added to embeddings.",
      voiceQuote: "Without positional encodings, the model would treat 'cat eats fish' and 'fish eats cat' identically. Frequency oscillations provide relative coordinates.",
      formula: "PE(pos, 2i) = sin(pos / 10000^{2i/d})",
      takeaway: "Allows the model to generalize to sequence lengths beyond what was seen during training."
    },
    {
      number: "04",
      tag: "SCALING DYNAMICS",
      title: "Feed-Forward & Layer Norm",
      body: "Residual skip connections and RMSNorm prevent gradient vanishing during deep backpropagation across dozens of attention blocks.",
      voiceQuote: "Residual pathways provide an unhindered highway for gradients to flow backwards, allowing networks to scale to hundreds of layers.",
      formula: "x' = LayerNorm(x + SubLayer(x))",
      takeaway: "Maintains numeric stability and permits stable convergence across hundreds of billions of parameters."
    }
  ];

  // 3. Curriculum Architect State
  const [activeCoursePreview, setActiveCoursePreview] = useState('mit_algorithms');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesisProgress, setSynthesisProgress] = useState(100);

  // 4. Semantic Rubric Evaluation State
  const [answerTier, setAnswerTier] = useState('mastery'); // 'shallow' | 'partial' | 'mastery'

  // 5. Skeleton Shimmer Toggle State
  const [isSkeletonActive, setIsSkeletonActive] = useState(false);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Global mouse tracker for background cursor spotlight & particles
  const handleGlobalMouseMove = (e) => {
    mousePos.current = { x: e.clientX, y: e.clientY };
    mouseX.set(e.clientX);
    mouseY.set(e.clientY);
  };

  const triggerVoiceSample = (text, userQuery = null) => {
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    if (userQuery) {
      setInterruptionTriggered(true);
      setTimeout(() => setInterruptionTriggered(false), 2200);
    }
    setOrbState('speaking');
    setIsSpeaking(true);
    setSimulatedTranscript(text);
    voiceTimeoutRef.current = setTimeout(() => {
      setIsSpeaking(false);
      setOrbState('idle');
    }, 4500);
  };

  const handleSynthesizeDemo = (sourceKey) => {
    setActiveCoursePreview(sourceKey);
    setIsSynthesizing(true);
    setSynthesisProgress(15);
    setTimeout(() => setSynthesisProgress(50), 280);
    setTimeout(() => setSynthesisProgress(85), 600);
    setTimeout(() => {
      setSynthesisProgress(100);
      setIsSynthesizing(false);
    }, 900);
  };

  const rubricData = {
    shallow: {
      score: 38,
      grade: "D+",
      color: "#ef4444",
      tag: "Surface Recall",
      studentText: "Overfitting means the model learned too much. Underfitting means it didn't learn enough. To fix it, you just train it longer.",
      rubric: [
        { label: "Conceptual Distinction", score: 40, status: "Vague definitions; missed generalization error on validation data." },
        { label: "Mathematical Foundation", score: 20, status: "Failed to mention high variance vs high bias tradeoff." },
        { label: "Mitigation Technique", score: 25, status: "Fatal misconception: training longer increases overfitting." }
      ],
      aiFeedback: "The response demonstrates elementary intuition but contains a critical remediation error. Training longer increases model capacity and exacerbates variance rather than curing it.",
      modelAnswer: "Overfitting occurs when a high-capacity hypothesis captures sample noise (high variance), failing out-of-sample generalization. Regularization (L1/L2) penalizes large weight vectors to constrain capacity."
    },
    partial: {
      score: 74,
      grade: "B",
      color: "#f59e0b",
      tag: "Functional Understanding",
      studentText: "Overfitting is when your training loss is very low but validation loss increases because it memorized noise. Underfitting is when neither loss converges. You can fix overfitting with dropout.",
      rubric: [
        { label: "Conceptual Distinction", score: 85, status: "Accurately noted train vs validation loss curve divergence." },
        { label: "Mathematical Foundation", score: 68, status: "Understood noise memorization; lacked mathematical formulation." },
        { label: "Mitigation Technique", score: 80, status: "Correctly identified dropout; missing activation de-coadaptation proof." }
      ],
      aiFeedback: "Strong qualitative grasp. To attain full mastery, articulate how randomly zeroing activations breaks weight co-adaptation, forcing independent feature representation.",
      modelAnswer: "Overfitting corresponds to excessive hypothesis variance. Dropout resolves this by randomly dropping neurons with probability p, effectively training an exponential ensemble of sparse sub-networks."
    },
    mastery: {
      score: 98,
      grade: "A+",
      color: "#10b981",
      tag: "Exemplary Synthesis",
      studentText: "Underfitting represents high bias where model capacity cannot resolve the true data manifold. Overfitting is high variance where the parameter space models stochastic training noise, deteriorating test loss. Mitigation: L2 weight decay introduces a penalty λ||w||² to the loss function, pulling parameters toward zero and smoothing the decision boundary.",
      rubric: [
        { label: "Conceptual Distinction", score: 100, status: "Exemplary bias-variance decomposition and distribution alignment." },
        { label: "Mathematical Foundation", score: 98, status: "Accurately formulated the regularization loss term with coefficient λ." },
        { label: "Mitigation Technique", score: 96, status: "Rigorous geometric intuition of decision boundary curvature control." }
      ],
      aiFeedback: "Flawless mastery. Demonstrates doctoral-level technical precision, proper mathematical notation, and crystal-clear geometric intuition of loss landscape smoothing.",
      modelAnswer: "Model answer achieved. Student demonstrated comprehensive theoretical and applied mastery."
    }
  };

  const currentRubric = rubricData[answerTier];

  return (
    <div 
      onMouseMove={handleGlobalMouseMove}
      className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-blue-600 selection:text-white antialiased overflow-x-hidden relative"
    >
      {/* =========================================================================
          AURORA BACKGROUND & LIQUID GRADIENT MESH (LIGHT THEME)
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        
        {/* Pastel Aurora Blob 1 (Sapphire Sky) */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[850px] h-[850px] rounded-full bg-gradient-to-br from-blue-300/35 via-indigo-200/25 to-transparent blur-[140px] animate-aurora"
        />

        {/* Pastel Aurora Blob 2 (Amethyst Lilac) */}
        <div 
          className="absolute top-[30%] -right-[15%] w-[750px] h-[750px] rounded-full bg-gradient-to-bl from-purple-200/35 via-violet-100/20 to-transparent blur-[150px] animate-aurora"
          style={{ animationDelay: '-7s' }}
        />

        {/* Pastel Aurora Blob 3 (Cyan Lagoon) */}
        <div 
          className="absolute bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full bg-gradient-to-tr from-cyan-200/30 via-sky-100/25 to-transparent blur-[140px] animate-aurora"
          style={{ animationDelay: '-14s' }}
        />

        {/* Subtle porcelain grid texture */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#1e293b 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Dynamic Background Cursor Spotlight (Strictly behind cards and text elements) */}
        <motion.div
          className="pointer-events-none absolute -top-[300px] -left-[300px] w-[600px] h-[600px] rounded-full z-0"
          style={{
            x: mouseX,
            y: mouseY,
            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.16) 0%, rgba(99, 102, 241, 0.08) 35%, transparent 70%)',
          }}
        />

        {/* Interactive Constellation Particle Network */}
        <ParticleNetworkCanvas mousePos={mousePos} />
      </div>

      {/* =========================================================================
          1. APPLE-STYLE TRANSLUCENT GLASS NAVIGATION HEADER
          ========================================================================= */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/75 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)] py-3.5' 
          : 'bg-transparent border-b border-slate-200/40 py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Logo Brand with Soft Neumorphic Glow */}
          <div 
            className="flex items-center gap-3 cursor-pointer group" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-b from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap size={22} className="stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                  AI Tutor
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/70">
                  Multimodal
                </span>
              </div>
            </div>
          </div>

          {/* Center Navigation Links (Apple Style Micro-text) */}
          <nav className="hidden md:flex items-center gap-7 text-[13px] font-semibold tracking-wide text-slate-600">
            <a href="#voice-chamber" className="hover:text-blue-600 transition-colors">Voice Engine</a>
            <a href="#theatre-mode" className="hover:text-blue-600 transition-colors">Slide Theatre</a>
            <a href="#curriculum-architect" className="hover:text-blue-600 transition-colors">Curriculum</a>
            <a href="#rubric-evaluation" className="hover:text-blue-600 transition-colors">Rubric Grading</a>
            <a href="#interactive-timeline" className="hover:text-blue-600 transition-colors">Progression</a>
            <a href="#specifications" className="hover:text-blue-600 transition-colors">Specifications</a>
          </nav>

          {/* User Sign-In / Dashboard CTA */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <button
                  id="landing-user-badge"
                  onClick={onGoToDashboard}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 hover:scale-105 active:scale-95 group"
                  title="Open your personal dashboard"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold overflow-hidden shadow-2xs">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt={user.displayName || 'Student'} className="w-full h-full object-cover" />
                    ) : (
                      user.displayName?.[0] || <UserIcon size={12} />
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors hidden sm:inline max-w-[110px] truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Student'}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </button>

                <MagneticButton
                  id="landing-header-dashboard-cta"
                  onClick={onGoToDashboard}
                  className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold tracking-wide shadow-md shadow-blue-500/25 transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </MagneticButton>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <button
                  id="landing-header-signin-btn"
                  onClick={onOpenSignIn}
                  className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 bg-white/80 hover:bg-white border border-slate-200/90 shadow-2xs transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
                >
                  <LogIn size={13} className="text-blue-600" />
                  <span>Sign In</span>
                </button>

                <MagneticButton
                  id="landing-header-start-btn"
                  onClick={onOpenSignIn}
                  className="px-5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold tracking-wide shadow-md shadow-slate-900/15 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight size={14} />
                </MagneticButton>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* =========================================================================
          2. CINEMATIC HERO SECTION (Light Keynote Aesthetic with Gradient Text)
          ========================================================================= */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Keynote Typography and Controls */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-8">
              {/* Eyebrow Hardware Pill with Animated Glow */}
              <motion.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/80 border border-white shadow-[0_4px_20px_rgba(37,99,235,0.08)] backdrop-blur-xl text-blue-700 text-xs font-bold tracking-wider uppercase"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                <span>Gemini Live Multimodal Voice Classroom</span>
                <span className="text-slate-300">&bull;</span>
                <span className="text-slate-500 lowercase">sub-400ms reflex</span>
              </motion.div>

              {/* Grand Keynote Display Heading with Iridescent Gradient Text */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="space-y-6"
              >
                <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-serif font-bold text-slate-950 tracking-tight leading-[1.08]">
                  AI-based intelligent tutoring platform <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-flow">
                    for realtime academic guidance.
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                  The autonomous learning companion that lectures with you over real-time bi-directional audio, projects synchronized slide decks, and evaluates deep subjective reasoning.
                </p>
              </motion.div>

              {/* Primary Action Buttons */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2"
              >
                {user ? (
                  <MagneticButton
                    id="hero-enter-dashboard"
                    onClick={onGoToDashboard}
                    className="w-full sm:w-auto px-9 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 transition-all"
                  >
                    <span>Enter Your Learning Dashboard</span>
                    <ArrowRight size={17} />
                  </MagneticButton>
                ) : (
                  <MagneticButton
                    id="hero-start-free-btn"
                    onClick={onOpenSignIn}
                    className="w-full sm:w-auto px-9 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 transition-all"
                  >
                    <span>Start Learning Free</span>
                    <ArrowRight size={17} />
                  </MagneticButton>
                )}

                <a
                  href="#voice-chamber"
                  className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/80 hover:bg-white text-slate-700 hover:text-slate-950 font-bold text-sm tracking-wide border border-slate-200/90 shadow-sm transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-md flex items-center justify-center gap-2.5 backdrop-blur-xl"
                >
                  <Play size={15} className="fill-blue-600 text-blue-600" />
                  <span>Explore Interactive Sandbox</span>
                </a>
              </motion.div>
            </div>

            {/* Right Column: 3D Interactive Object (Matching Image 2) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="lg:col-span-5 flex items-center justify-center relative w-full"
            >
              <Interactive3DObject className="w-full max-w-[480px] h-[340px] sm:h-[420px] lg:h-[480px]" />
            </motion.div>
          </div>

          {/* Floating Academic Badges (Parallax & 3D Floating Objects) */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Bloom’s Taxonomy Evaluation', icon: Award, color: 'text-blue-600 bg-blue-50 border-blue-200' },
              { label: 'Full-Duplex 16kHz PCM', icon: Waves, color: 'text-indigo-600 bg-indigo-50 border-indigo-200' },
              { label: 'LaTeX & Formula Render', icon: Code, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
              { label: 'Real-time Interruption', icon: Zap, color: 'text-amber-600 bg-amber-50 border-amber-200' }
            ].map((b, i) => {
              const Icon = b.icon;
              return (
                <motion.div
                  key={i}
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 4 + i, ease: 'easeInOut' }}
                  className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-2xs backdrop-blur-md ${b.color}`}
                >
                  <Icon size={13} />
                  <span>{b.label}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Light-theme Key Metric Cards (Neumorphic & 3D Card Pop-Up) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="pt-12 max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6"
          >
            <TiltSpotlightCard className="p-6 text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">16<span className="text-blue-600">kHz</span></span>
              <p className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-wider">Uncompressed Audio</p>
              <p className="text-xs text-slate-500 mt-1">Raw PCM bi-directional WebSockets</p>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-6 text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">&lt; 380<span className="text-indigo-600">ms</span></span>
              <p className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-wider">Interruption Reflex</p>
              <p className="text-xs text-slate-500 mt-1">Stops instantly when you speak</p>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-6 text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">100<span className="text-cyan-600">%</span></span>
              <p className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-wider">Semantic Rubrics</p>
              <p className="text-xs text-slate-500 mt-1">Subjective answer evaluation</p>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-6 text-left">
              <span className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 tracking-tight">10<span className="text-purple-600">+</span></span>
              <p className="text-xs font-bold text-slate-700 mt-2 uppercase tracking-wider">Global Dialects</p>
              <p className="text-xs text-slate-500 mt-1">Multilingual speech coaching</p>
            </TiltSpotlightCard>
          </motion.div>

        </div>
      </section>

      {/* =========================================================================
          3. FEATURE 01: THE ACOUSTIC VOICE CHAMBER & ANIMATED AI ORB
          ========================================================================= */}
      <section id="voice-chamber" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-blue-100 text-blue-800 border border-blue-200">
              Interactive Showcase 01
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              The Acoustic Voice Chamber. <br />
              <span className="text-slate-500">Conversational latency that feels human.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Traditional chatbots force you to type back and forth. Our voice engine streams continuous 16kHz audio over full-duplex WebSockets. Speak naturally, interrupt mid-sentence, or ask for an analogy in another language.
            </p>
          </div>

          {/* Main Voice Chamber Stage with 3D Card Pop-Up */}
          <TiltSpotlightCard className="p-6 sm:p-10 space-y-8 overflow-hidden">
            
            {/* Header Telemetry Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200/80">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                    Live Channel Active &bull; Tutor {voicePersonality}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">Full-Duplex PCM &bull; Sub-400ms Gemini 2.5 Multimodal</p>
                </div>
              </div>

              {/* Persona Selector Tabs */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">Voice Model:</span>
                <div className="flex gap-1 p-1 rounded-xl bg-slate-100/90 border border-slate-200">
                  {['Aoede', 'Kore', 'Fenrir', 'Puck', 'Charon'].map((v) => (
                    <button
                      key={v}
                      onClick={() => setVoicePersonality(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 ${
                        voicePersonality === v 
                          ? 'bg-blue-600 text-white shadow-sm' 
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Central Stage: Animated AI Orb + Spoken Commentary + Waveforms */}
            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Animated AI Orb Display */}
              <div className="md:col-span-5 rounded-2xl bg-gradient-to-b from-slate-50 to-blue-50/40 border border-slate-200/80">
                <AnimatedAiOrb 
                  orbState={orbState} 
                  onClickState={(newState) => {
                    setOrbState(newState);
                    setIsSpeaking(newState === 'speaking');
                  }} 
                />

                {/* AI Voice Equalizer Waveform Bars (AI Voice Waveform) */}
                <div className="px-8 pb-6 flex items-center justify-center gap-1.5 h-10 w-full">
                  {[25, 60, 95, 45, 85, 100, 70, 90, 40, 65, 80, 35, 90, 50, 30].map((h, i) => (
                    <span
                      key={i}
                      className={`w-1.5 rounded-full transition-all duration-150 ${
                        isSpeaking 
                          ? 'bg-blue-600 opacity-90' 
                          : 'bg-slate-300 opacity-40'
                      }`}
                      style={{ height: isSpeaking ? `${h}%` : '15%' }}
                    />
                  ))}
                </div>
              </div>

              {/* Spoken Telemetry & Interruption Reflex Tester */}
              <div className="md:col-span-7 space-y-6">
                
                {/* Spoken Output Container (Glassmorphic Neumorph-inset) */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-inner space-y-2 relative">
                  <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Volume2 size={13} className="text-blue-600" />
                      Synchronized Spoken Output
                    </span>
                    {interruptionTriggered && (
                      <span className="text-amber-600 font-bold flex items-center gap-1 animate-pulse">
                        <Zap size={12} /> Interruption Cutoff (&lt; 240ms)
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 text-base sm:text-lg leading-relaxed font-normal">
                    &ldquo;{simulatedTranscript}&rdquo;
                  </p>
                </div>

                {/* Interruption Trigger Sandbox (Micro-interactions) */}
                <div className="space-y-3">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Test Interruption Reflex (Click any prompt to cut the tutor off):
                  </p>

                  <div className="grid sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => triggerVoiceSample(
                        "Think of it like a spotlight in an orchestra—the spotlight shines only on the cellist when the melody demands it, highlighting relevant context!",
                        "Analogy request"
                      )}
                      className="p-3 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:shadow-md group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1 mb-1">
                        <Lightbulb size={13} /> Socratic Analogy
                      </span>
                      <p className="text-xs text-slate-700 group-hover:text-slate-950 leading-snug">
                        &ldquo;Wait, can you explain attention with an everyday analogy?&rdquo;
                      </p>
                    </button>

                    <button
                      onClick={() => triggerVoiceSample(
                        "Because language has sequential grammar! If words aren't tagged with wave coordinates, the model can't tell whether you wrote 'dog bites man' or 'man bites dog'.",
                        "Conceptual doubt"
                      )}
                      className="p-3 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:shadow-md group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-cyan-700 flex items-center gap-1 mb-1">
                        <HelpCircle size={13} /> Conceptual Doubt
                      </span>
                      <p className="text-xs text-slate-700 group-hover:text-slate-950 leading-snug">
                        &ldquo;Why doesn't standard self-attention know word order?&rdquo;
                      </p>
                    </button>

                    <button
                      onClick={() => triggerVoiceSample(
                        "Absolument! L'attention capture les dépendances globales entre les mots sans dépendre de calculs récurrents lents.",
                        "Multilingual translation"
                      )}
                      className="p-3 rounded-xl bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 text-left transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] hover:shadow-md group shadow-2xs"
                    >
                      <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1 mb-1">
                        <Globe size={13} /> Multilingual Shift
                      </span>
                      <p className="text-xs text-slate-700 group-hover:text-slate-950 leading-snug">
                        &ldquo;Can you explain that last sentence in French?&rdquo;
                      </p>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </TiltSpotlightCard>

        </div>
      </section>

      {/* =========================================================================
          4. FEATURE 02: SYNCHRONIZED SLIDE THEATRE (Dual-Coding Visual Pedagogy)
          ========================================================================= */}
      <section id="theatre-mode" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
              Interactive Showcase 02
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              Synchronized Slide Theatre. <br />
              <span className="text-slate-500">Dual-coding visual pedagogy for deep retention.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Listening alone causes cognitive drift. Every lesson subtopic generates an interactive, high-contrast visual slide deck. As the AI tutor lectures, slides advance in lockstep, spotlighting formulas, diagrams, and key takeaways.
            </p>
          </div>

          {/* Interactive Slide Theatre Screen */}
          <TiltSpotlightCard className="overflow-hidden">
            
            {/* Theatre Control Bar */}
            <div className="px-6 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 font-mono text-xs font-bold">
                  Deck: Transformers &amp; Attention
                </span>
                <span className="text-xs text-slate-500 hidden sm:inline">&bull; 4 Concept Slides</span>
              </div>

              {/* Theater Navigation Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentSlideIndex((prev) => (prev > 0 ? prev - 1 : sampleSlides.length - 1))}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-2xs"
                  title="Previous slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="font-mono text-xs text-slate-700 font-bold px-2">
                  {currentSlideIndex + 1} / {sampleSlides.length}
                </span>
                <button
                  onClick={() => setCurrentSlideIndex((prev) => (prev < sampleSlides.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-all duration-150 hover:scale-110 active:scale-95 shadow-2xs"
                  title="Next slide"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="h-4 w-px bg-slate-300 mx-1" />

                <button
                  onClick={() => setIsTheaterMode(!isTheaterMode)}
                  className={`p-1.5 rounded-lg transition-all duration-150 hover:scale-110 active:scale-95 border ${
                    isTheaterMode 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                  title="Toggle Fullscreen Focus"
                >
                  {isTheaterMode ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
              </div>
            </div>

            {/* Active Slide Stage (Shared Element Transitions) */}
            <div className={`p-8 sm:p-12 transition-all ${isTheaterMode ? 'bg-slate-900 text-white' : 'bg-white'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlideIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Slide Tag & Number */}
                  <div className="flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold tracking-widest ${
                      isTheaterMode 
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {sampleSlides[currentSlideIndex].tag}
                    </span>
                    <span className={`text-4xl sm:text-5xl font-mono font-bold ${isTheaterMode ? 'text-white/10' : 'text-slate-200'}`}>
                      {sampleSlides[currentSlideIndex].number}
                    </span>
                  </div>

                  {/* Slide Title & Core Explanation */}
                  <div className="space-y-3">
                    <h3 className={`text-2xl sm:text-4xl font-serif font-bold ${isTheaterMode ? 'text-white' : 'text-slate-950'}`}>
                      {sampleSlides[currentSlideIndex].title}
                    </h3>
                    <p className={`text-base sm:text-lg leading-relaxed max-w-3xl ${isTheaterMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {sampleSlides[currentSlideIndex].body}
                    </p>
                  </div>

                  {/* Mathematical Formula / Core Concept Display */}
                  <div className={`p-5 rounded-2xl font-mono text-sm sm:text-base shadow-inner border ${
                    isTheaterMode 
                      ? 'bg-black/60 border-white/10 text-cyan-300' 
                      : 'bg-slate-50 border-slate-200 text-blue-800'
                  }`}>
                    <p className={`text-[10px] uppercase tracking-wider mb-1 font-sans font-bold ${isTheaterMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Mathematical Formulation
                    </p>
                    <code>{sampleSlides[currentSlideIndex].formula}</code>
                  </div>

                  {/* Bottom Strip: Key Takeaway + Voice Commentary */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200/80">
                    <div className={`p-4 rounded-xl border space-y-1 ${
                      isTheaterMode ? 'bg-white/5 border-white/10' : 'bg-emerald-50/60 border-emerald-200'
                    }`}>
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                        <CheckCircle2 size={13} /> Essential Takeaway
                      </span>
                      <p className={`text-xs ${isTheaterMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {sampleSlides[currentSlideIndex].takeaway}
                      </p>
                    </div>

                    <div className={`p-4 rounded-xl border space-y-1 ${
                      isTheaterMode ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50/60 border-blue-200'
                    }`}>
                      <span className="text-[11px] font-bold text-blue-700 flex items-center gap-1.5">
                        <Volume2 size={13} /> Spoken Tutor Commentary
                      </span>
                      <p className={`text-xs italic ${isTheaterMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        &ldquo;{sampleSlides[currentSlideIndex].voiceQuote}&rdquo;
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Slide Pagination Indicator Dots */}
            <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-center gap-2">
              {sampleSlides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlideIndex === idx ? 'w-8 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

          </TiltSpotlightCard>

        </div>
      </section>

      {/* =========================================================================
          5. FEATURE 03: CURRICULUM ARCHITECT & SKELETON SHIMMER PREVIEW
          ========================================================================= */}
      <section id="curriculum-architect" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-cyan-100 text-cyan-800 border border-cyan-200">
                Interactive Showcase 03
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
                Curriculum Architect. <br />
                <span className="text-slate-500">Transform any source into an academic syllabus.</span>
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Feed in a textbook PDF, a YouTube lecture URL, or a simple topic prompt. The multimodal synthesis engine designs a complete 10-week curriculum organized into Units, Topics, and Subtopics.
              </p>
            </div>

            {/* Skeleton Shimmer Preview Toggle Button */}
            <div className="shrink-0">
              <button
                onClick={() => setIsSkeletonActive(!isSkeletonActive)}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold border transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs ${
                  isSkeletonActive 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <Sliders size={14} />
                <span>{isSkeletonActive ? 'Previewing Shimmer Skeleton' : 'Toggle Skeleton Loading'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Source Synthesizer Sandbox */}
          <TiltSpotlightCard className="p-6 sm:p-10 space-y-8">
            
            {/* Input Source Selector Pills */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleSynthesizeDemo('mit_algorithms')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs ${
                  activeCoursePreview === 'mit_algorithms'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <FileText size={15} />
                <span>PDF: &ldquo;MIT Algorithms &amp; Complexity.pdf&rdquo;</span>
              </button>

              <button
                onClick={() => handleSynthesizeDemo('youtube_lecture')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs ${
                  activeCoursePreview === 'youtube_lecture'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Radio size={15} className="text-rose-500" />
                <span>YouTube: Stanford CS229 Machine Learning</span>
              </button>

              <button
                onClick={() => handleSynthesizeDemo('quantum_prompt')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 shadow-2xs ${
                  activeCoursePreview === 'quantum_prompt'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                <Sparkles size={15} className="text-amber-500" />
                <span>Prompt: &ldquo;Quantum Cryptography&rdquo;</span>
              </button>
            </div>

            {/* Live Progress Bar Simulation */}
            {isSynthesizing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-slate-600 font-bold">
                  <span>Synthesizing syllabus via Gemini 2.5 Pro...</span>
                  <span>{synthesisProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${synthesisProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generated Curriculum Stream / Shimmer Skeleton */}
            <div className="space-y-4">
              <ShimmerSkeletonDemo isSkeletonActive={isSkeletonActive} />

              <div className="grid md:grid-cols-2 gap-6 pt-2">
                
                {/* Unit 01 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-xs font-bold">Unit 01</span>
                      <h4 className="text-sm font-bold text-slate-900">Foundational Algorithmic Paradigms</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Weeks 1-3</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">1.1 Asymptotic Complexity &amp; Master Theorem</p>
                        <p className="text-[11px] text-slate-500">Recurrences, bounding divide-and-conquer loops</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">6 Slides</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">1.2 Self-Balancing Red-Black Trees</p>
                        <p className="text-[11px] text-slate-500">Rotations, invariants, O(log N) lookup proofs</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">8 Slides</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">1.3 Dynamic Programming &amp; Memoization</p>
                        <p className="text-[11px] text-slate-500">DAG shortest paths, optimal substructure</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold">7 Slides</span>
                    </div>
                  </div>
                </div>

                {/* Unit 02 */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-mono text-xs font-bold">Unit 02</span>
                      <h4 className="text-sm font-bold text-slate-900">Graph Theory &amp; Network Flows</h4>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">Weeks 4-7</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">2.1 Dijkstra &amp; Bellman-Ford Negative Cycles</p>
                        <p className="text-[11px] text-slate-500">Priority queues, edge relaxation matrices</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">8 Slides</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">2.2 Ford-Fulkerson Max-Flow Min-Cut</p>
                        <p className="text-[11px] text-slate-500">Residual capacities, augmenting paths</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">9 Slides</span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-800">2.3 NP-Completeness &amp; Reductions</p>
                        <p className="text-[11px] text-slate-500">Cook-Levin theorem, 3-SAT to Vertex Cover</p>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">6 Slides</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </TiltSpotlightCard>

        </div>
      </section>

      {/* =========================================================================
          6. FEATURE 04: SEMANTIC RUBRIC EVALUATOR (Animated Progress Rings)
          ========================================================================= */}
      <section id="rubric-evaluation" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Interactive Showcase 04
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              Semantic Rubric Evaluator. <br />
              <span className="text-slate-500">Grading subjective reasoning beyond multiple choice.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Standard automated tests rely on trivia quizzes. AI Tutor assesses conceptual depth, mathematical rigor, and nuanced trade-offs through multi-dimensional analytical rubrics.
            </p>
          </div>

          {/* Evaluation Sandbox Card */}
          <TiltSpotlightCard className="p-6 sm:p-10 space-y-8">
            
            {/* Answer Tier Selector */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Test Question:</p>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  &ldquo;Distinguish between Overfitting and Underfitting, and formulate one regularization mechanism.&rdquo;
                </h3>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 shrink-0">
                <button
                  onClick={() => setAnswerTier('shallow')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 ${
                    answerTier === 'shallow' 
                      ? 'bg-rose-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Surface (D+)
                </button>
                <button
                  onClick={() => setAnswerTier('partial')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 ${
                    answerTier === 'partial' 
                      ? 'bg-amber-500 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Partial (B)
                </button>
                <button
                  onClick={() => setAnswerTier('mastery')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:scale-105 active:scale-95 ${
                    answerTier === 'mastery' 
                      ? 'bg-emerald-600 text-white shadow-xs' 
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mastery (A+)
                </button>
              </div>
            </div>

            {/* Student Answer & Live Animated Progress Ring */}
            <div className="grid md:grid-cols-12 gap-8 items-center">
              
              {/* Left: Student Submission */}
              <div className="md:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                    <span>Simulated Student Answer</span>
                    <span className="font-mono text-slate-400">Word count: ~50</span>
                  </div>
                  <p className="text-sm text-slate-800 leading-relaxed font-mono">
                    &ldquo;{currentRubric.studentText}&rdquo;
                  </p>
                </div>

                {/* Dimension Breakdown Bars */}
                <div className="space-y-3 pt-2">
                  <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                    Graded Dimensions:
                  </p>
                  {currentRubric.rubric.map((r, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                      <div className="flex justify-between text-xs font-bold text-slate-800">
                        <span>{r.label}</span>
                        <span className="font-mono text-blue-600">{r.score} / 100</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-blue-600 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${r.score}%` }}
                          transition={{ duration: 0.8, delay: i * 0.15 }}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">{r.status}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Score Ring & Feedback Callout */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 text-center space-y-5">
                <AnimatedProgressRing 
                  percentage={currentRubric.score} 
                  color={currentRubric.color} 
                  label="Mastery Index"
                />

                <div className="space-y-1">
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold font-mono uppercase tracking-wider bg-slate-100 text-slate-700">
                    Grade: {currentRubric.grade} ({currentRubric.tag})
                  </span>
                  <p className="text-xs text-slate-600 pt-2 leading-relaxed italic">
                    &ldquo;{currentRubric.aiFeedback}&rdquo;
                  </p>
                </div>
              </div>

            </div>

          </TiltSpotlightCard>

        </div>
      </section>

      {/* =========================================================================
          7. FEATURE 05: INTERACTIVE TIMELINE (Interactive Timelines & Staggered Reveal)
          ========================================================================= */}
      <section id="interactive-timeline" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-purple-100 text-purple-800 border border-purple-200">
              Pedagogical Engine
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              The 5-Stage Learning Loop. <br />
              <span className="text-slate-500">Engineered around Bloom&apos;s Cognitive Taxonomy.</span>
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Explore how every learning milestone systematically elevates comprehension from surface-level memorization to doctoral-level synthesis.
            </p>
          </div>

          <InteractiveTimeline />

        </div>
      </section>

      {/* =========================================================================
          8. SPECIFICATIONS & ARCHITECTURE (Apple Bento Grid)
          ========================================================================= */}
      <section id="specifications" className="py-24 md:py-32 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          
          <div className="max-w-3xl space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-slate-100 text-slate-800 border border-slate-300">
              Technical Specifications
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              Engineered with extreme precision.
            </h2>
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
              Every layer of the AI Tutor platform is designed for zero friction, high fidelity, and enduring data sovereignty.
            </p>
          </div>

          {/* Apple Bento Grid Specs */}
          <div className="grid md:grid-cols-3 gap-6">
            
            <TiltSpotlightCard className="p-8 space-y-4 md:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Cpu size={26} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                Full-Duplex Multimodal Gemini 2.5 Architecture
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Bi-directional WebSockets transport uncompressed 16kHz linear PCM audio packets to and from Gemini 2.5 Flash and Pro endpoints. Integrated client-side Voice Activity Detection (VAD) stops audio playback within 380 milliseconds the moment you speak.
              </p>
              <div className="pt-4 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">WebSocket /live</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">16,000 Hz Mono</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">&lt;380ms Interrupt VAD</span>
              </div>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <Server size={26} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                Cloud Firestore Persistence
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Atomic real-time synchronization of courses, enrolled cohort codes, slide decks, and test attempts across all your mobile and desktop devices.
              </p>
              <div className="pt-4 flex flex-wrap gap-2 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">Firebase Firestore</span>
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">OAuth 2.0</span>
              </div>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-8 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
                <FileCheck size={26} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                Document Parsing
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                High-density optical character recognition and layout decomposition for PDFs, markdown files, academic papers, and YouTube transcripts.
              </p>
            </TiltSpotlightCard>

            <TiltSpotlightCard className="p-8 space-y-4 md:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <ShieldCheck size={26} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-slate-900">
                Cohort Collaboration &amp; 6-Character Join Codes
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Educators and peer study groups can generate instant 6-character cohort codes. Students join instantly with zero friction, preserving shared curricula while maintaining private evaluation transcripts.
              </p>
            </TiltSpotlightCard>

          </div>

        </div>
      </section>

      {/* =========================================================================
          9. FREQUENTLY ASKED QUESTIONS (Expandable Accordion)
          ========================================================================= */}
      <section className="py-24 md:py-32 relative z-10 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold tracking-widest uppercase bg-blue-100 text-blue-800 border border-blue-200">
              Clear Answers
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
              Frequently Asked Questions.
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Do I need an external microphone or headset?",
                a: "No. Any standard built-in laptop or smartphone microphone works effortlessly. Our client-side echo cancellation and noise suppression algorithms keep 16kHz audio pristine."
              },
              {
                q: "Can I use AI Tutor completely free?",
                a: "Yes. You can explore courses, generate slide decks, and test student evaluation features immediately as a Guest Student or with your Google account."
              },
              {
                q: "How does the tutor handle interruptions mid-lecture?",
                a: "When you speak while the tutor is talking, client-side Voice Activity Detection cuts playback in under 380ms, buffers your query, and seamlessly redirects the lecture flow."
              },
              {
                q: "Can professors create and assign courses to entire classes?",
                a: "Absolutely. Every course generated includes a unique 6-character Join Code. Instructors share this code with students, who enroll with a single click."
              }
            ].map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl bg-white border border-slate-200/80 shadow-2xs overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  >
                    <span className="text-base font-bold text-slate-900">{faq.q}</span>
                    <span className={`p-1 rounded-full bg-slate-100 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </span>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3"
                      >
                        {faq.a}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          10. GRAND FINALE CALL TO ACTION (Apple Keynote Light Mode)
          ========================================================================= */}
      <section className="py-24 md:py-36 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <TiltSpotlightCard className="p-10 sm:p-16 text-center space-y-8 relative overflow-hidden">
            
            {/* Luminous Inner Glow */}
            <div className="!m-0 absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 max-w-2xl mx-auto relative z-10">
              <h2 className="text-3xl sm:text-5xl font-serif font-bold text-slate-950 tracking-tight">
                Experience the next frontier of human learning.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                Step inside your personalized multimodal classroom. No installation required.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              {user ? (
                <MagneticButton
                  onClick={onGoToDashboard}
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 transition-all"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight size={17} />
                </MagneticButton>
              ) : (
                <MagneticButton
                  onClick={onOpenSignIn}
                  className="w-full sm:w-auto px-9 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm tracking-wide shadow-xl shadow-blue-500/25 transition-all"
                >
                  <span>Get Started Free</span>
                  <ArrowRight size={17} />
                </MagneticButton>
              )}
            </div>

            <p className="text-xs text-slate-400 pt-4">
              Supported on Chrome, Safari, Edge, and mobile browsers &bull; Sub-400ms audio
            </p>

          </TiltSpotlightCard>

        </div>
      </section>

      {/* =========================================================================
          11. MINIMALIST APPLE FOOTER
          ========================================================================= */}
      <footer className="py-12 border-t border-slate-200/80 text-xs text-slate-500 relative z-10 bg-white/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <GraduationCap size={18} className="text-blue-600" />
            <span className="font-serif font-bold text-sm text-slate-800">AI Learning Companion</span>
            <span>&bull;</span>
            <span>Multimodal Autonomous Classroom</span>
          </div>

          <div className="flex items-center gap-6">
            <a href="#voice-chamber" className="hover:text-slate-900 transition-colors">Voice Engine</a>
            <a href="#theatre-mode" className="hover:text-slate-900 transition-colors">Slide Theatre</a>
            <a href="#specifications" className="hover:text-slate-900 transition-colors">Specifications</a>
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Back to top</span>
              <ArrowUpRight size={12} />
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
