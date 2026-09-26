import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mic, 
  Presentation, 
  MessageSquare, 
  BookOpen, 
  Award, 
  Volume2, 
  Pause, 
  Play, 
  Send, 
  Check, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Layers,
  HelpCircle,
  Code,
  GraduationCap,
  Clock,
  Maximize2,
  SlidersHorizontal,
  ThumbsUp,
  Cpu,
  BarChart3,
  Bot,
  User,
  Radio,
  FileCode2,
  ShieldCheck,
  ChevronDown,
  Target
} from 'lucide-react';

/* =========================================================================
   5 IN-PLATFORM CARDS — CRISP & MODERN LIGHT THEME
   Tuned with 25% taller viewport, high-contrast typography, and real UI.
   ========================================================================= */

// -------------------------------------------------------------------------
// CARD 1: LIVE 1-ON-1 VOICE CLASSROOM (Light Theme)
// -------------------------------------------------------------------------
function VoiceClassroomCard() {
  const [voiceModel, setVoiceModel] = useState('Aoede');
  const [orbState, setOrbState] = useState('speaking');
  const [isMicOn, setIsMicOn] = useState(false);
  const [spokenText, setSpokenText] = useState(
    "Welcome to your private session. Today we are breaking down Transformer Attention Mechanisms. Whenever you want to ask a question, simply speak out loud to interrupt me."
  );
  const [activeDoubt, setActiveDoubt] = useState(null);

  const doubts = [
    {
      id: 'analogy',
      label: 'Everyday Analogy',
      question: "Can you explain attention with an everyday analogy?",
      answer: "Imagine reading an article with a highlighter pen. Rather than memorizing every single word, your brain naturally highlights the few crucial words that connect the main idea."
    },
    {
      id: 'simple',
      label: 'Simplify In 1 Sentence',
      question: "Can you summarize it in simple terms?",
      answer: "Attention calculates dynamic relevance scores between every pair of words so the AI understands words in their exact surrounding context."
    },
    {
      id: 'example',
      label: 'Real-Life Application',
      question: "Where is this used in practice?",
      answer: "In automated translation! When translating the ambiguous word 'bank', attention scans context words like 'river' or 'deposit' to select the correct meaning instantly."
    }
  ];

  const handleDoubtClick = (item) => {
    setActiveDoubt(item.id);
    setOrbState('thinking');
    setTimeout(() => {
      setSpokenText(item.answer);
      setOrbState('speaking');
    }, 450);
  };

  return (
    <div className="flex flex-col h-full min-h-[580px] sm:min-h-[620px] bg-white text-slate-900">
      {/* Top Session Status Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
          </span>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            LIVE 1-ON-1 CLASSROOM
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">|</span>
          <span className="text-xs text-slate-600 font-medium hidden sm:inline truncate max-w-xs">
            Unit 2: Transformer Attention Mechanisms
          </span>
        </div>

        {/* Voice Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500">Tutor Voice:</span>
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            {['Aoede', 'Kore', 'Fenrir', 'Puck'].map((v) => (
              <button
                key={v}
                onClick={() => setVoiceModel(v)}
                className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                  voiceModel === v ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Classroom Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 p-6 gap-6 items-center">
        {/* Left Column: Visual Equalizer & Tutor Avatar */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-2xl bg-blue-50/40 border border-blue-100 space-y-6 text-center">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Glowing Soundwaves */}
            <div className={`absolute inset-0 rounded-full transition-all duration-700 ${
              orbState === 'speaking' 
                ? 'bg-blue-400/20 scale-110 animate-pulse' 
                : orbState === 'listening' 
                ? 'bg-emerald-400/20 scale-105' 
                : 'bg-purple-400/10'
            }`} />
            
            {/* Core Neural Sphere */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_10px_35px_rgba(37,99,235,0.3)]">
              <Volume2 size={36} className="text-white animate-bounce" />
            </div>
          </div>

          {/* Equalizer Frequency Bars */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            {[40, 75, 55, 90, 65, 80, 45, 95, 60, 85, 50].map((h, i) => (
              <span
                key={i}
                style={{ height: orbState === 'speaking' ? `${h}%` : '20%' }}
                className="w-1.5 rounded-full bg-gradient-to-t from-blue-600 to-indigo-500 transition-all duration-300"
              />
            ))}
          </div>

          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-900 tracking-wide">AI Professor Speaking</h4>
            <p className="text-xs text-slate-500">Low-latency live bidirectional speech</p>
          </div>

          {/* State & Mic Controls */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                isMicOn 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              <Mic size={14} />
              <span>{isMicOn ? 'Mic Active' : 'Unmute Mic'}</span>
            </button>
            <button
              onClick={() => {
                setOrbState('listening');
                setSpokenText("I'm listening. Please speak out your question or clarify any doubt.");
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 cursor-pointer"
            >
              Interrupt Tutor
            </button>
          </div>
        </div>

        {/* Right Column: Live Transcription Stream & Quick Doubts */}
        <div className="lg:col-span-7 flex flex-col justify-between h-full space-y-4">
          {/* Live Transcript Bubble */}
          <div className="flex-1 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <span className="text-[11px] font-mono text-blue-600 font-bold uppercase flex items-center gap-1.5">
                <Radio size={12} className="animate-pulse" />
                Live Spoken Transcript
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Realtime Speech Engine</span>
            </div>
            <p className="text-sm sm:text-base text-slate-800 leading-relaxed font-sans font-normal">
              "{spokenText}"
            </p>
          </div>

          {/* Interactive Doubt Chips */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Instant Questions (Click to Hear Tutor Answer):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {doubts.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleDoubtClick(d)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    activeDoubt === d.id 
                      ? 'bg-blue-50/80 border-blue-500 text-blue-900 shadow-2xs' 
                      : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>{d.label}</span>
                    <ArrowRight size={12} className="text-blue-600" />
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    "{d.question}"
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// CARD 2: SYNCHRONIZED INTERACTIVE SLIDE VIEWER (Light Theme)
// -------------------------------------------------------------------------
function SlideViewerCard() {
  const [slideNum, setSlideNum] = useState(2);

  const slides = [
    {
      step: 1,
      title: "Query, Key, and Value Projections",
      formula: "Q = X · W_Q,   K = X · W_K,   V = X · W_V",
      bullets: [
        "Each input token embedding X is projected into three distinct dense vectors.",
        "Query (Q) represents what the current word is looking for.",
        "Key (K) represents what the word can offer to other tokens."
      ],
      concept: "Projection Stage"
    },
    {
      step: 2,
      title: "Scaled Dot-Product Formula",
      formula: "Attention(Q, K, V) = softmax((Q · Kᵀ) / √dₖ) · V",
      bullets: [
        "Compute dot products between Query and all Key vectors.",
        "Scale by √dₖ to maintain variance = 1 and avoid saturated softmax gradients.",
        "Apply Softmax across row dimensions to yield normalized attention weights."
      ],
      concept: "Mathematical Foundation"
    },
    {
      step: 3,
      title: "Multi-Head Parallel Attention",
      formula: "MultiHead(Q,K,V) = Concat(head₁, ..., head_h) · W_O",
      bullets: [
        "Runs h independent attention projections simultaneously.",
        "Enables the model to focus on information from different positions and subspaces at once.",
        "Final heads are concatenated and linearly projected back to model dimension."
      ],
      concept: "Parallel Subspaces"
    }
  ];

  const current = slides[slideNum - 1];

  return (
    <div className="flex flex-col h-full min-h-[580px] sm:min-h-[620px] bg-white text-slate-900">
      {/* Slide Deck Top Header Bar */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Presentation size={14} />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            SYNCHRONIZED SLIDE STAGE
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-blue-600 font-mono font-bold">
            Slide {slideNum} of {slides.length}
          </span>
        </div>

        {/* Slide Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSlideNum((prev) => Math.max(1, prev - 1))}
            disabled={slideNum === 1}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="px-2 text-xs font-mono text-slate-600 font-bold">{slideNum}/{slides.length}</span>
          <button
            onClick={() => setSlideNum((prev) => Math.min(slides.length, prev + 1))}
            disabled={slideNum === slides.length}
            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Slide Canvas */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
        {/* Slide Content Box */}
        <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-100 text-blue-700 border border-blue-200 uppercase">
              {current.concept}
            </span>
            <span className="text-xs text-slate-400 font-mono">Lecture Synchronization Active</span>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {current.step}. {current.title}
          </h3>

          {/* Formula Display Banner (High Contrast Slate) */}
          <div className="p-4 rounded-xl bg-slate-900 text-center font-mono text-sm sm:text-base text-cyan-300 font-semibold shadow-xs">
            {current.formula}
          </div>

          {/* Bulleted Points */}
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700">
            {current.bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span className="leading-relaxed">{b}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Slide Selector Mini Rail */}
        <div className="grid grid-cols-3 gap-3">
          {slides.map((s) => (
            <button
              key={s.step}
              onClick={() => setSlideNum(s.step)}
              className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                slideNum === s.step 
                  ? 'bg-blue-50 border-blue-500 text-slate-900 shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono text-blue-600 font-bold">SLIDE 0{s.step}</div>
              <div className="text-xs font-semibold truncate text-slate-900 mt-0.5">{s.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// CARD 3: AI TUTOR CHAT WINDOW (Light Theme)
// -------------------------------------------------------------------------
function TutorChatCard() {
  const [messages, setMessages] = useState([
    {
      sender: 'user',
      text: 'Why do we divide by √dₖ in the attention formula?'
    },
    {
      sender: 'tutor',
      text: 'Great question! For large dimension values dₖ, dot products grow substantially in magnitude, pushing the softmax function into regions with near-zero gradients. Scaling by 1/√dₖ stabilizes the variance to 1.0, ensuring healthy gradient flow.'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const sendPrompt = (text) => {
    setMessages((prev) => [
      ...prev,
      { sender: 'user', text },
      { sender: 'tutor', text: `Here is the key breakdown for "${text}": In practice, this guarantees numerical stability during backpropagation through thousands of attention layers.` }
    ]);
  };

  return (
    <div className="flex flex-col h-full min-h-[580px] sm:min-h-[620px] bg-white text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Bot size={15} />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            AI TUTOR COMPANION
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-emerald-700 font-medium">Online · Ready for Q&A</span>
        </div>
        <span className="text-xs text-slate-400 font-mono">Gemini 2.5 Flash</span>
      </div>

      {/* Message History Thread */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex gap-3 max-w-xl ${m.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
          >
            {m.sender === 'tutor' && (
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-2xs">
                AI
              </div>
            )}
            <div
              className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-xs'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none shadow-2xs'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-700 font-bold text-xs">
                You
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Prompt Pills & Input Bar */}
      <div className="p-4 bg-slate-50 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] text-slate-400 font-mono shrink-0">Quick prompts:</span>
          {["Explain in 2 sentences", "Show code snippet", "Quiz me on this"].map((p, idx) => (
            <button
              key={idx}
              onClick={() => sendPrompt(p)}
              className="px-2.5 py-1 rounded-lg text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && inputValue.trim()) {
                sendPrompt(inputValue);
                setInputValue('');
              }
            }}
            placeholder="Ask your tutor any question about the current topic..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 focus:border-blue-500 outline-none text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 shadow-2xs"
          />
          <button
            onClick={() => {
              if (inputValue.trim()) {
                sendPrompt(inputValue);
                setInputValue('');
              }
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200"
          >
            <Send size={14} />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// CARD 4: CUSTOM COURSE CREATOR (Light Theme)
// -------------------------------------------------------------------------
function CourseCreatorCard() {
  const [selectedUnit, setSelectedUnit] = useState(1);

  const units = [
    {
      num: 1,
      title: "Foundations & Vector Representations",
      status: "100% Completed",
      topics: ["Word Embeddings & Cosine Distance", "Recurrent Bottlenecks", "Seq2Seq Encoder-Decoder"]
    },
    {
      num: 2,
      title: "Transformer Attention Architecture",
      status: "In Progress (65%)",
      topics: ["Self-Attention Mechanics", "Multi-Head Scaled Dot Product", "Positional Encodings & RoPE"]
    },
    {
      num: 3,
      title: "Pre-training & Generative LLMs",
      status: "Upcoming",
      topics: ["Causal Masking in Decoders", "Instruction Tuning & RLHF", "KV Caching & Optimization"]
    }
  ];

  return (
    <div className="flex flex-col h-full min-h-[580px] sm:min-h-[620px] bg-white text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
            <BookOpen size={14} />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            SYLLABUS & CURRICULUM ARCHITECTURE
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-slate-500">Synthesized from study notes</span>
        </div>
        <span className="text-xs text-indigo-600 font-mono font-bold">3 Units · 9 Topics · 36 Slides</span>
      </div>

      {/* Main Course Structure Canvas */}
      <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                Modern Deep Learning & Transformer Engineering
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Personalized study path with interactive slides, voice tutoring, and comprehension exams
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              Active Course
            </span>
          </div>

          {/* Unit Accordion Cards */}
          <div className="space-y-3 pt-2">
            {units.map((u) => (
              <div
                key={u.num}
                onClick={() => setSelectedUnit(u.num)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedUnit === u.num 
                    ? 'bg-blue-50/50 border-blue-400 shadow-2xs' 
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center text-xs font-mono font-bold shadow-2xs">
                      0{u.num}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{u.title}</h4>
                      <p className="text-xs text-slate-500">{u.topics.length} Subtopics · 4 Practice Quizzes</p>
                    </div>
                  </div>
                  <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                    u.status.includes('100%') 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : u.status.includes('Progress') 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {u.status}
                  </span>
                </div>

                {selectedUnit === u.num && (
                  <div className="mt-4 pt-3 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {u.topics.map((t, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 flex items-center gap-2 shadow-2xs">
                        <CheckCircle2 size={13} className="text-blue-600 shrink-0" />
                        <span className="truncate font-medium">{t}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Button Bar */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-xs text-slate-600">
            Current Module: <strong className="text-slate-900">Unit 2 · Multi-Head Attention</strong>
          </span>
          <button className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-200">
            <span>Continue Lesson</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// CARD 5: UNDERSTANDING-BASED EXAM EVALUATION (Light Theme)
// -------------------------------------------------------------------------
function ExamEvaluationCard() {
  const [selectedScore, setSelectedScore] = useState('mastery');

  const scores = {
    basic: {
      pct: 48,
      answer: "Attention connects words in a sentence by looking at embeddings.",
      feedback: "You identified that embeddings are connected, but missed the dynamic calculation of Query, Key, and Value dot products.",
      rubric: [
        { label: "Defines Query & Key Dot Products", pass: false },
        { label: "Explains √dₖ Scaling Factor", pass: false },
        { label: "Articulates Context Weighting", pass: true }
      ]
    },
    good: {
      pct: 78,
      answer: "Attention computes weights between words using dot products so words attend to relevant context.",
      feedback: "Solid grasp of the core concept! To reach full mastery, explain why the √dₖ scaling factor is mandatory to prevent vanishing gradients in softmax.",
      rubric: [
        { label: "Defines Query & Key Dot Products", pass: true },
        { label: "Explains √dₖ Scaling Factor", pass: false },
        { label: "Articulates Context Weighting", pass: true }
      ]
    },
    mastery: {
      pct: 98,
      answer: "Attention computes compatibility scores between Query and Key vectors via dot product, scales by 1/√dₖ to avoid softmax saturation, and calculates a weighted sum over Value vectors.",
      feedback: "Outstanding response! You demonstrated rigorous conceptual depth, correct mathematical grounding, and clear operational understanding.",
      rubric: [
        { label: "Defines Query & Key Dot Products", pass: true },
        { label: "Explains √dₖ Scaling Factor", pass: true },
        { label: "Articulates Context Weighting", pass: true }
      ]
    }
  };

  const active = scores[selectedScore];

  return (
    <div className="flex flex-col h-full min-h-[580px] sm:min-h-[620px] bg-white text-slate-900">
      {/* Top Header */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Award size={14} />
          </div>
          <span className="text-xs font-mono font-bold tracking-wider text-slate-800 uppercase">
            CONCEPTUAL MASTERY ASSESSMENT
          </span>
          <span className="text-xs text-slate-300">|</span>
          <span className="text-xs text-amber-700 font-mono font-bold">Graded via Real-Time Rubric</span>
        </div>

        {/* Answer Tier Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          {[
            { id: 'basic', label: 'Basic (48%)' },
            { id: 'good', label: 'Good (78%)' },
            { id: 'mastery', label: 'Mastery (98%)' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedScore(t.id)}
              className={`px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer transition-all ${
                selectedScore === t.id 
                  ? 'bg-amber-500 text-white shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Rubric Canvas */}
      <div className="p-6 sm:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Question & Student Submission */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[10px] font-mono text-blue-600 uppercase font-bold tracking-wider">
              Examination Question
            </span>
            <p className="text-sm font-bold text-slate-900 leading-snug">
              "Explain the role of Queries, Keys, and Values in Attention, and why scaling by √dₖ is required."
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">
              Student Submitted Response
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-sans">
              "{active.answer}"
            </p>
          </div>

          {/* Teacher Feedback Card */}
          <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
            <span className="text-[11px] font-bold text-amber-800 flex items-center gap-1.5">
              <Bot size={13} />
              AI Evaluator Diagnosis
            </span>
            <p className="text-xs text-slate-700 leading-relaxed">
              {active.feedback}
            </p>
          </div>
        </div>

        {/* Right: Score Gauge & Criteria Breakdown */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-5 text-center shadow-2xs">
          <div className="space-y-1">
            <div className="text-4xl font-extrabold text-amber-600 font-mono tracking-tight">
              {active.pct}%
            </div>
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Comprehension Score
            </div>
          </div>

          {/* Evaluation Criteria Checklist */}
          <div className="space-y-2 text-left pt-2 border-t border-slate-200">
            {active.rubric.map((r, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs shadow-2xs">
                <span className="text-slate-700 text-[11px] font-medium">{r.label}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                  r.pass ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {r.pass ? 'Pass' : 'Incomplete'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-slate-400 font-mono">
            Graded against university-level conceptual rubrics
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   VERTICAL 3D FLIP CARDS DECK
   Positions card at viewport center first, then executes smooth 3D flips.
   ========================================================================= */
export default function VerticalFlipCardsDeck() {
  const deckContainerRef = useRef(null);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const activeCardIndexRef = useRef(0);
  const [direction, setDirection] = useState(1);
  const isFlippingRef = useRef(false);
  const touchStartYRef = useRef(0);

  const CARDS = [
    {
      id: 'voice-classroom',
      num: '01',
      title: 'Live Voice Classroom',
      subtitle: 'Talk naturally to your AI tutor with live bidirectional speech and interactive doubts',
      component: <VoiceClassroomCard />
    },
    {
      id: 'slide-deck',
      num: '02',
      title: 'Synchronized Slide Stage',
      subtitle: 'Visual lecture slides and diagrams advance automatically with interactive navigation',
      component: <SlideViewerCard />
    },
    {
      id: 'tutor-chat',
      num: '03',
      title: 'AI Tutor Chat Window',
      subtitle: 'Ask written questions, get formula breakdowns, and request practice examples',
      component: <TutorChatCard />
    },
    {
      id: 'course-creator',
      num: '04',
      title: 'Custom Course Syllabus',
      subtitle: 'Uploaded documents auto-synthesize into structured units, topics, and lessons',
      component: <CourseCreatorCard />
    },
    {
      id: 'understanding-exams',
      num: '05',
      title: 'Understanding-Based Exams',
      subtitle: 'Evaluated against multi-point academic rubrics with personalized tutor diagnosis',
      component: <ExamEvaluationCard />
    }
  ];

  const isAligningRef = useRef(false);

  // Keep ref in sync
  useEffect(() => {
    activeCardIndexRef.current = activeCardIndex;
  }, [activeCardIndex]);

  // Flip navigation handler with fluid transition
  const flipTo = (newIndex) => {
    if (newIndex === activeCardIndexRef.current || isFlippingRef.current) return;
    isFlippingRef.current = true;
    setDirection(newIndex > activeCardIndexRef.current ? 1 : -1);
    setActiveCardIndex(newIndex);
    activeCardIndexRef.current = newIndex;
    setTimeout(() => {
      isFlippingRef.current = false;
    }, 700);
  };

  const flipNext = () => {
    if (activeCardIndexRef.current < CARDS.length - 1) {
      flipTo(activeCardIndexRef.current + 1);
    }
  };

  const flipPrev = () => {
    if (activeCardIndexRef.current > 0) {
      flipTo(activeCardIndexRef.current - 1);
    }
  };

  // SMART CENTER-ALIGNMENT & RELIABLE SCROLL FLIP HANDLER:
  // 1. Checks real-time physical offsetFromCenter: cards CANNOT flip unless strictly fixed to center.
  // 2. Both scrolling down and scrolling up: first fixes the card to exact viewport center.
  // 3. ONLY once physically centered, subsequent scroll gestures trigger flips.
  // 4. Direction: Scrolling DOWN flips UPWARDS. Scrolling UP flips DOWNWARDS.
  useEffect(() => {
    const handleWheel = (e) => {
      const container = deckContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const cardCenter = rect.top + rect.height / 2;
      const viewportCenter = window.innerHeight / 2;
      const offsetFromCenter = cardCenter - viewportCenter;

      // If completely outside the viewport, allow free window scroll
      if (rect.bottom < 0 || rect.top > window.innerHeight) {
        return;
      }

      // Check if showcase is in the active viewport zone
      const inActiveZone = rect.top < window.innerHeight * 0.9 && rect.bottom > window.innerHeight * 0.1;
      if (!inActiveZone) {
        return;
      }

      const delta = e.deltaY;

      // 1. ABSOLUTE ANIMATION LOCK:
      // While any card is flipping or aligning to center, lock all scroll events
      if (isFlippingRef.current || isAligningRef.current) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // 2. PHYSICAL CENTERING VERIFICATION:
      // A card is considered centered only if within 30px of exact viewport center
      const isCardCentered = Math.abs(offsetFromCenter) <= 30;

      // SCROLLING DOWN
      if (delta > 0) {
        // If not physically centered yet and we haven't passed the deck
        if (!isCardCentered && activeCardIndexRef.current < CARDS.length - 1) {
          // If within range to smoothly snap to center
          if (Math.abs(offsetFromCenter) < window.innerHeight * 0.65) {
            e.preventDefault();
            e.stopPropagation();

            if (!isAligningRef.current) {
              isAligningRef.current = true;
              window.scrollTo({
                top: window.scrollY + offsetFromCenter,
                behavior: 'smooth'
              });
              setTimeout(() => {
                isAligningRef.current = false;
              }, 480);
            }
            // RETURN IMMEDIATELY — NEVER FLIP UNTIL CENTERED!
            return;
          }
          return;
        }

        // STEP 2: CARD IS CENTERED! FLIP TO NEXT SLIDE (Cards 1 -> 2 -> 3 -> 4 -> 5)
        if (activeCardIndexRef.current < CARDS.length - 1) {
          e.preventDefault();
          e.stopPropagation();

          if (delta > 6) {
            isFlippingRef.current = true;
            const nextIdx = activeCardIndexRef.current + 1;
            setDirection(1); // Flip UPWARDS
            activeCardIndexRef.current = nextIdx;
            setActiveCardIndex(nextIdx);

            setTimeout(() => {
              isFlippingRef.current = false;
            }, 750);
          }
          return;
        }

        // STEP 3: On Card 5 and animation is complete: allow natural page scroll down
      } 
      // SCROLLING UP
      else if (delta < 0) {
        // If not physically centered yet and we haven't scrolled all the way back up
        if (!isCardCentered && activeCardIndexRef.current > 0) {
          if (Math.abs(offsetFromCenter) < window.innerHeight * 0.65) {
            e.preventDefault();
            e.stopPropagation();

            if (!isAligningRef.current) {
              isAligningRef.current = true;
              window.scrollTo({
                top: window.scrollY + offsetFromCenter,
                behavior: 'smooth'
              });
              setTimeout(() => {
                isAligningRef.current = false;
              }, 480);
            }
            // RETURN IMMEDIATELY — NEVER FLIP UNTIL CENTERED!
            return;
          }
          return;
        }

        // STEP 2: CARD IS CENTERED! FLIP BACKWARDS (Cards 5 -> 4 -> 3 -> 2 -> 1)
        if (activeCardIndexRef.current > 0) {
          e.preventDefault();
          e.stopPropagation();

          if (delta < -6) {
            isFlippingRef.current = true;
            const prevIdx = activeCardIndexRef.current - 1;
            setDirection(-1); // Flip DOWNWARDS
            activeCardIndexRef.current = prevIdx;
            setActiveCardIndex(prevIdx);

            setTimeout(() => {
              isFlippingRef.current = false;
            }, 750);
          }
          return;
        }

        // On Card 1 and animation is complete: allow natural page scroll up
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [CARDS.length]);

  // Touch gesture support for mobile
  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e) => {
    if (e.changedTouches && e.changedTouches[0]) {
      const diffY = touchStartYRef.current - e.changedTouches[0].clientY;
      if (Math.abs(diffY) > 30) {
        if (diffY > 0 && activeCardIndexRef.current < CARDS.length - 1) {
          flipNext();
        } else if (diffY < 0 && activeCardIndexRef.current > 0) {
          flipPrev();
        }
      }
    }
  };

  // 3D VERTICAL FLIP VARIANTS:
  // - When scrolling DOWN (dir >= 0): flips UPWARDS
  // - When scrolling UP (dir < 0): flips DOWNWARDS
  const flipVariants = {
    initial: (dir) => ({
      rotateX: dir >= 0 ? -65 : 65,
      opacity: 0,
      scale: 0.96,
      y: dir >= 0 ? 35 : -35,
      transformOrigin: dir >= 0 ? 'bottom center' : 'top center'
    }),
    animate: {
      rotateX: 0,
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.72,
        ease: [0.16, 1, 0.3, 1]
      }
    },
    exit: (dir) => ({
      rotateX: dir >= 0 ? 65 : -65,
      opacity: 0,
      scale: 0.96,
      y: dir >= 0 ? -35 : 35,
      transformOrigin: dir >= 0 ? 'top center' : 'bottom center',
      transition: {
        duration: 0.58,
        ease: [0.16, 1, 0.3, 1]
      }
    })
  };

  return (
    <div 
      ref={deckContainerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* 3D Vertical Flip Card Stage (Clean, immersive, zero UI instructions) */}
      <div 
        className="relative w-full min-h-[580px] sm:min-h-[620px] rounded-3xl select-none"
        style={{ perspective: '1600px', transformStyle: 'preserve-3d' }}
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={CARDS[activeCardIndex].id}
            custom={direction}
            variants={flipVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ 
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden'
            }}
            className="w-full rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,0.08)] will-change-transform border border-slate-200/90 bg-white"
          >
            {CARDS[activeCardIndex].component}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
