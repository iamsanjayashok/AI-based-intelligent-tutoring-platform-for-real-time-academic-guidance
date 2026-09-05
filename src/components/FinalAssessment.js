import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, CheckCircle, Loader2, ClipboardCheck, Sparkles, X, Info, HelpCircle, Presentation, Clock, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateFinalAssessment } from '../services/gemini';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function FinalAssessment({ course, onBack }) {
  const [loading, setLoading] = useState(true);
  const [assessment, setAssessment] = useState(null);
  const [activeTab, setActiveTab] = useState('mcq');
  const [userAnswers, setUserAnswers] = useState({
    mcqs: {},
    msqs: {},
    descriptive: {}
  });
  const [evaluated, setEvaluated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [scores, setScores] = useState({
    mcq: 0,
    msq: 0,
    descriptive: 0,
    total: 0
  });

  // Timer State: 2 hours in seconds
  const [timeLeft, setTimeLeft] = useState(7200);

  const calculateScore = () => {
    let mcqScore = 0;
    let msqScore = 0;
    
    // MCQ Score: 2 marks each
    assessment.mcqs.forEach((q, i) => {
      if (userAnswers.mcqs[i] === q.answer) {
        mcqScore += 2;
      }
    });

    // MSQ Score: Partial marking (each option counts)
    // Marks = (correctly matched options / total options) * 2
    assessment.msqs.forEach((q, i) => {
      const userSelects = userAnswers.msqs[i] || [];
      const correctSelects = q.answers || [];
      let matches = 0;
      q.options.forEach(opt => {
        const isUserSelected = userSelects.includes(opt);
        const isCorrectOption = correctSelects.includes(opt);
        if (isUserSelected === isCorrectOption) {
          matches++;
        }
      });
      msqScore += (matches / q.options.length) * 2;
    });

    const finalScores = {
      mcq: mcqScore,
      msq: msqScore,
      descriptive: 0, // Descriptive is self-view based on model answer
      total: mcqScore + msqScore
    };

    setScores(finalScores);
    setEvaluated(true);
    saveAttempt(finalScores);
  };

  const saveAttempt = async (finalScores) => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      await addDoc(collection(db, 'assessment_attempts'), {
        userId: user.uid,
        courseId: course.id,
        courseTitle: course.title,
        scores: finalScores,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error saving assessment attempt:", error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (loading || evaluated || !assessment) return;

    if (timeLeft <= 0) {
      calculateScore();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, evaluated, assessment]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const fetchAssessment = async () => {
      const cacheKey = `final_assessment_${course.title}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (data && data.mcqs?.length > 0) {
            setAssessment(data);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error("Cache corrupted:", e);
        }
      }

      setLoading(true);
      try {
        const topics = course.units?.flatMap(u => u.topics.map(t => t.title)) || [];
        const data = await generateFinalAssessment(course.title, topics);
        setAssessment(data);
        localStorage.setItem(cacheKey, JSON.stringify(data));
      } catch (error) {
        console.error("Error loading assessment:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessment();
  }, [course.title]);

  const handleMcqSelect = (idx, option) => {
    if (evaluated) return;
    setUserAnswers(prev => ({
      ...prev,
      mcqs: { ...prev.mcqs, [idx]: option }
    }));
  };

  const handleMsqToggle = (idx, option) => {
    if (evaluated) return;
    const current = userAnswers.msqs[idx] || [];
    const updated = current.includes(option)
      ? current.filter(o => o !== option)
      : [...current, option];
    setUserAnswers(prev => ({
      ...prev,
      msqs: { ...prev.msqs, [idx]: updated }
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-[80] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="text-slate-500 animate-pulse font-medium">Preparing your final exam questions...</p>
      </div>
    );
  }

  if (!assessment) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 z-[80] flex flex-col overflow-hidden">
      {/* Fixed Sticky Header */}
      <header className="p-4 md:p-6 bg-white border-b flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
            <ChevronLeft size={24} />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-none mb-1">Final Course Assessment</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1.5">
              <span className="truncate max-w-[200px] md:max-w-md">{course.title}</span>
            </p>
          </div>
        </div>
        
        {evaluated ? (
          <div className="flex items-center gap-4 bg-blue-600 text-white px-4 md:px-6 py-2 rounded-2xl shadow-lg transition-all scale-animation">
            <div className="hidden md:block">
              <p className="text-[10px] font-black uppercase text-blue-200 leading-none mb-1">Your Total Score</p>
              <p className="text-xs font-medium text-blue-100">*Exc. Descriptive</p>
            </div>
            <span className="text-2xl font-bold">{Math.round(scores.total)}<span className="text-sm font-normal opacity-70 ml-1">/100</span></span>
          </div>
        ) : (
          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">100 Marks Total</span>
              <span className="text-xs text-slate-500">3 Sections • 38 Questions</span>
            </div>
            <button
              onClick={calculateScore}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <ClipboardCheck size={18} />
              Finish & Evaluate
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold text-lg ${timeLeft < 300 ? 'bg-red-50 border-red-200 text-red-600 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-700'}`}>
              <Clock size={20} className={timeLeft < 300 ? 'text-red-500' : 'text-slate-400'} />
              {formatTime(timeLeft)}
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8">
          <div className="bg-slate-900 rounded-[32px] md:rounded-[40px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4 text-blue-400">
                <Sparkles size={24} />
                <span className="font-bold uppercase tracking-widest text-xs md:text-sm">Comprehensive Final Assessment</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 italic">{course.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-8 text-slate-300">
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="text-sm font-medium">Sec 1: 20 MCQs</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                  <span className="text-sm font-medium">Sec 2: 10 MSQs</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                  <span className="text-sm font-medium">Sec 3: 8 Descriptive</span>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
              <HelpCircle size={300} />
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-200 flex flex-wrap sticky top-4 z-20">
            {[
              { id: 'mcq', label: 'Section 1: MCQs', color: 'blue' },
              { id: 'msq', label: 'Section 2: MSQs', color: 'indigo' },
              { id: 'descriptive', label: 'Section 3: Descriptive', color: 'purple' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[120px] px-4 md:px-8 py-3 md:py-4 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === tab.id 
                    ? `bg-${tab.color}-600 text-white shadow-lg shadow-${tab.color}-100` 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="space-y-8 pb-32">
            <AnimatePresence mode="wait">
              {activeTab === 'mcq' && (
                <motion.div
                  key="mcq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 bg-blue-50 border border-blue-100 rounded-[24px] flex gap-4 items-start">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-blue-600">
                      <Info size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-blue-900">Multiple Choice Questions</p>
                      <p className="text-sm text-blue-700/80 leading-relaxed">Select the single correct answer from the choices. Each question contributes 2 marks to your total score.</p>
                    </div>
                  </div>
                  
                  {assessment.mcqs.map((q, idx) => (
                    <div key={idx} className={`bg-white rounded-[32px] p-6 md:p-10 border shadow-sm transition-all ${
                      evaluated 
                        ? userAnswers.mcqs[idx] === q.answer 
                          ? 'border-green-200 bg-green-50/10' 
                          : 'border-red-200 bg-red-50/10' 
                        : 'border-slate-100'
                    }`}>
                      <div className="flex gap-4 mb-8">
                        <span className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-100">{idx + 1}</span>
                        <h4 className="text-xl md:text-2xl font-serif font-bold text-slate-800 leading-tight">{q.question}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => {
                          const isSelected = userAnswers.mcqs[idx] === opt;
                          const isCorrect = evaluated && q.answer === opt;
                          const isWrong = evaluated && isSelected && q.answer !== opt;
                          
                          return (
                            <button
                              key={oIdx}
                              disabled={evaluated}
                              onClick={() => handleMcqSelect(idx, opt)}
                              className={`p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                                isSelected 
                                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                  : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-blue-200 hover:bg-white'
                              } ${isCorrect ? 'border-green-500 bg-green-50 text-green-800' : ''} ${isWrong ? 'border-red-500 bg-red-50 text-red-800' : ''}`}
                            >
                              <span className="font-semibold text-sm md:text-base">{opt}</span>
                              {isCorrect && <CheckCircle size={22} className="text-green-500 shrink-0" />}
                              {isWrong && <X size={22} className="text-red-500 shrink-0" />}
                              {!evaluated && <div className={`w-6 h-6 rounded-full border-2 shrink-0 transition-all ${isSelected ? 'bg-blue-600 border-blue-600 shadow-inner' : 'border-slate-200 group-hover:border-blue-400'}`} />}
                            </button>
                          );
                        })}
                      </div>
                      {evaluated && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-8 p-4 rounded-2xl bg-slate-900 text-white text-sm font-bold flex items-center gap-3"
                        >
                           <div className="p-1.5 bg-green-500 rounded-lg text-white">
                            <CheckCircle size={16} />
                           </div>
                           <span className="text-slate-400">Correct Answer:</span> {q.answer}
                        </motion.div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'msq' && (
                <motion.div
                  key="msq"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-[24px] flex gap-4 items-start">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600">
                      <Info size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-indigo-900">Multiple Select Questions</p>
                      <p className="text-sm text-indigo-700/80 leading-relaxed">Identify all correct options. Partial marks are awarded for every correctly identified choice (both chosen correct and avoided incorrect).</p>
                    </div>
                  </div>

                  {assessment.msqs.map((q, idx) => (
                    <div key={idx} className="bg-white rounded-[32px] p-6 md:p-10 border border-slate-100 shadow-sm transition-all hover:shadow-md">
                      <div className="flex gap-4 mb-8">
                        <span className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">{idx + 1}</span>
                        <h4 className="text-xl md:text-2xl font-serif font-bold text-slate-800 leading-tight">{q.question}</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((opt, oIdx) => {
                          const selected = userAnswers.msqs[idx]?.includes(opt);
                          const isCorrect = evaluated && q.answers.includes(opt);
                          const isSelectedButWrong = evaluated && selected && !isCorrect;
                          const isNotSelectedButCorrect = evaluated && !selected && isCorrect;

                          return (
                            <button
                              key={oIdx}
                              disabled={evaluated}
                              onClick={() => handleMsqToggle(idx, opt)}
                              className={`p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                                selected 
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                  : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-indigo-200'
                              } ${isCorrect ? 'border-green-500 bg-green-50 text-green-800' : ''} ${isSelectedButWrong ? 'border-red-500 bg-red-50 text-red-800' : ''} ${isNotSelectedButCorrect ? 'ring-2 ring-amber-400 ring-offset-4' : ''}`}
                            >
                              <span className="font-semibold text-sm md:text-base">{opt}</span>
                              <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${selected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white group-hover:border-indigo-400'}`}>
                                {selected && <CheckCircle size={14} />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      {evaluated && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-8 p-6 rounded-2xl bg-indigo-900 border border-indigo-800 text-white shadow-xl shadow-indigo-900/10"
                        >
                          <p className="text-indigo-300 font-bold mb-4 flex items-center gap-2 uppercase tracking-widest text-xs">
                            <ClipboardCheck size={18} />
                            Answer Key
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {q.answers.map((ans, aIdx) => (
                              <span key={aIdx} className="bg-white/10 px-4 py-2 rounded-xl text-sm font-bold text-white border border-white/10 backdrop-blur-sm">{ans}</span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === 'descriptive' && (
                <motion.div
                  key="descriptive"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div className="p-5 bg-purple-50 border border-purple-100 rounded-[24px] flex gap-4 items-start">
                    <div className="p-2 bg-white rounded-xl shadow-sm text-purple-600">
                      <Info size={20} />
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-purple-900">Descriptive Section</p>
                      <p className="text-sm text-purple-700/80 leading-relaxed">Provide detailed academic responses. Each question is worth 5 marks. Reference solutions are provided post-submission for self-audit.</p>
                    </div>
                  </div>

                  {assessment.descriptive.map((q, idx) => (
                    <div key={idx} className="bg-white rounded-[32px] p-8 md:p-12 border border-slate-100 shadow-sm overflow-hidden">
                      <div className="flex gap-4 mb-8">
                        <span className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xl shrink-0 border border-purple-100">{idx + 1}</span>
                        <h4 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 leading-tight">{q.question}</h4>
                      </div>
                      
                      <textarea
                        disabled={evaluated}
                        value={userAnswers.descriptive[idx] || ""}
                        onChange={(e) => setUserAnswers(prev => ({
                          ...prev,
                          descriptive: { ...prev.descriptive, [idx]: e.target.value }
                        }))}
                        placeholder="Structure your answer with clear points and logical flow..."
                        className="w-full min-h-[220px] p-8 rounded-[32px] bg-slate-50 border-2 border-slate-100 focus:border-purple-300 focus:outline-none transition-all text-slate-700 leading-relaxed text-lg"
                      />

                      {evaluated && (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-12 bg-slate-900 rounded-[40px] p-10 text-white relative overflow-hidden"
                        >
                          <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6 text-purple-400">
                              <CheckCircle size={24} />
                              <span className="font-bold uppercase tracking-widest text-sm">Model Solution Guide</span>
                            </div>
                            <div className="prose prose-invert max-w-none prose-p:text-slate-300 prose-p:text-lg prose-p:leading-relaxed">
                              <p>{q.modelAnswer}</p>
                            </div>
                          </div>
                          <div className="absolute -bottom-12 -right-12 opacity-5 pointer-events-none">
                            <Presentation size={240} />
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
}
