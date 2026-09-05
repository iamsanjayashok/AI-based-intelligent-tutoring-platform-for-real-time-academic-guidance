import React from 'react';
import { motion } from 'motion/react';
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
  ArrowRight
} from 'lucide-react';

export default function ProjectDashboard({ startLearning }) {
  const features = [
    {
      title: "AI Course Designer",
      desc: "Transform static documents or raw text into a 10-week curriculum with units, topics, and subtopics in seconds.",
      icon: <BookOpen className="text-blue-500" />,
      color: "blue"
    },
    {
      title: "Voice-Powered Tutoring",
      desc: "Engage in real-time, zero-latency voice conversations with your tutor. It listens, adapts, and teaches like a human.",
      icon: <Mic className="text-indigo-500" />,
      color: "indigo"
    },
    {
      title: "Intelligent Assessments",
      desc: "Go beyond multiple choice. Our AI evaluates descriptive answers and provides model solutions for deep learning.",
      icon: <Sparkles className="text-amber-500" />,
      color: "amber"
    },
    {
      title: "Performance Analytics",
      desc: "Visualise your improvement with a dedicated progress hub tracking every attempt, score, and growth milestone.",
      icon: <BarChart2 className="text-emerald-500" />,
      color: "emerald"
    },
    {
      title: "Collaborative Learning",
      desc: "Generate unique join codes to share your custom-built knowledge paths with friends, students, or colleagues.",
      icon: <Share2 className="text-purple-500" />,
      color: "purple"
    },
    {
      title: "Multilingual Support",
      desc: "Learn in your native tongue. Supported languages include English, Spanish, Hindi, Tamil, Telugu, and more.",
      icon: <Globe className="text-cyan-500" />,
      color: "cyan"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none">
          <Cpu size={600} />
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-black uppercase tracking-widest mb-4">
              <Zap size={14} className="fill-current" />
              Next-Gen EdTech
            </div>
            
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-slate-900 tracking-tight leading-[0.9]">
              AI based <span className="text-blue-600 italic">intelligent</span> <br />
              tutoring system
            </h1>
            
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Don't just read materials—converse with them. Our AI transforms your content into an interactive, 
              voice-enabled classroom experience tailored strictly to your pace.
            </p>

            <div className="pt-8 flex justify-center gap-4">
              <button 
                onClick={startLearning}
                className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-bold text-xl hover:bg-slate-800 transition-all shadow-2xl flex items-center gap-3 active:scale-95"
              >
                Start Learning
                <ArrowRight size={24} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why it's great section */}
      <section className="px-6 py-24 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-serif font-bold text-slate-900">
                Why this is the <span className="text-indigo-600">future</span> of education.
              </h2>
              <div className="space-y-6">
                {[
                  { title: "Personalized Tempo", text: "Traditional courses follow a fixed schedule. Our system waits for you to understand, reinforcing concepts until they stick." },
                  { title: "Zero Friction Delivery", text: "The transition from 'Raw Data' to 'Interactive Course' is instantaneous, powered by Gemini 3.1 Pro." },
                  { title: "Voice First Interaction", text: "Humans learn best through dialogue. Our low-latency voice API makes the tutor feel present and attentive." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-6 rounded-3xl bg-slate-50 border border-slate-100">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0 font-serif font-bold text-xl text-slate-300">
                      0{i+1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/10 blur-[120px] rounded-full" />
              <div className="relative bg-slate-900 rounded-[40px] p-10 border border-slate-800 shadow-3xl text-white">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="space-y-6 font-mono text-sm">
                  <p className="text-blue-400"># System Initializing...</p>
                  <p className="text-slate-400">Loading Gemini 3.1 Live Pipeline...</p>
                  <p className="text-slate-400">Injecting course context: "Quantum Mechanics"</p>
                  <p className="text-emerald-400">✓ Tutor Voice: Kore (Sharp/Female)</p>
                  <p className="text-emerald-400">✓ Real-time Speech Sync: Enabled</p>
                  <div className="pt-4 border-t border-slate-800">
                    <p className="text-white font-bold">Tutor: "Hello! Ready to dive into the observer effect? Let's look at Slide 1."</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-32 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-4xl font-serif font-bold text-slate-900 italic">The Toolkit for Mastery</h2>
          <p className="text-slate-500">Everything you need to turn information into wisdom.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all group"
            >
              <div className={`w-16 h-16 rounded-3xl bg-${f.color}-50 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                {React.cloneElement(f.icon, { size: 32 })}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm md:text-base">
                {f.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-slate-900 mx-6 rounded-[50px] text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-blue-600/10 blur-[100px]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-white leading-tight">
            Knowledge is a conversation. <br />
            Are you ready to join?
          </h2>
          <button 
            onClick={startLearning}
            className="px-12 py-6 bg-blue-600 text-white rounded-[24px] font-bold text-2xl hover:bg-blue-500 transition-all shadow-2xl flex items-center gap-4 mx-auto active:scale-95"
          >
            Start Learning Now
            <ArrowRight size={28} />
          </button>
        </div>
      </section>
    </div>
  );
}
