import React, { useState } from 'react';
import { ChevronLeft, BookOpen, Presentation, FileText, CheckCircle, Play, Sparkles, Mic, Share2, Copy, Check, Loader2, Youtube, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TutorChat from './TutorChat';
import FinalAssessment from './FinalAssessment';
import { parseSlidePoints } from './SubtopicSlideViewer';
import { shareCourse } from '../services/sharingService';

export default function CourseView({ course, onBack, onSessionEnd }) {
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const allTopics = course.units?.flatMap(u => u.topics) || [];
  const allSubtopics = allTopics.flatMap(t => t.subtopics) || [];

  const handleShare = async () => {
    try {
      setIsSharing(true);
      setShowShareModal(true);
      const code = await shareCourse(course.id);
      setShareCode(code);
    } catch (error) {
      console.error("Failed to share course:", error);
    } finally {
      setIsSharing(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (activeSession) {
    return (
      <TutorChat 
        topic={activeSession.topic}
        subtopic={activeSession.subtopic}
        courseId={course.id}
        courseTitle={course.title}
        onEnd={(data) => {
          setActiveSession(null);
          if (data && data.transcript) {
            onSessionEnd(data);
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl font-serif font-bold text-slate-900">{course.title}</h1>
              <p className="text-xs text-slate-500">Course Overview & Learning Materials</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm"
            >
              <Share2 size={18} />
              Share Course
            </button>
            <button
              onClick={() => setShowAssessment(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
            >
              <CheckCircle size={18} />
              Final Assessment
            </button>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-blue-50"
            >
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Share Course</h3>
              <p className="text-slate-500 text-sm mb-6">Give this code to others so they can copy this course to their dashboard.</p>
              
              <div className="space-y-6">
                <div className="relative group overflow-hidden">
                  <button 
                    onClick={copyToClipboard}
                    disabled={isSharing || !shareCode}
                    className="w-full p-6 text-center text-3xl font-mono font-bold tracking-[0.5em] rounded-2xl border-2 border-slate-100 bg-slate-50 text-blue-600 flex items-center justify-center min-h-[80px] hover:bg-white hover:border-blue-200 transition-all group-hover:scale-[1.02] active:scale-95 disabled:scale-100"
                  >
                    {isSharing ? (
                      <Loader2 className="animate-spin text-blue-400" size={32} />
                    ) : (
                      shareCode
                    )}
                  </button>
                  {!isSharing && shareCode && (
                    <div className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-100 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[9px] font-black uppercase text-slate-400">Click to copy</span>
                      {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} className="text-slate-400" />}
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    disabled={isSharing || !shareCode}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </button>
                  <button
                    onClick={() => setShowShareModal(false)}
                    className="flex-1 px-6 py-4 rounded-xl font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Subtopics List */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Course Content</h3>
            <div className="space-y-2">
              {course.units?.map((unit, uIdx) => (
                <div key={uIdx} className="space-y-2">
                  <p className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg inline-block mb-2">
                    Unit {uIdx + 1}: {unit.title}
                  </p>
                  {unit.topics?.map((topic, tIdx) => (
                    <div key={tIdx} className="space-y-1 ml-2">
                      <p className="text-sm font-bold text-slate-700 mb-1">{topic.title}</p>
                      {topic.subtopics?.map((sub, sIdx) => (
                        <button
                          key={sIdx}
                          onDoubleClick={() => {
                            setActiveSession({ topic: sub.title, subtopic: sub });
                          }}
                          onClick={() => {
                            setSelectedSubtopic(sub);
                            setShowAssessment(false);
                          }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3 ${
                            selectedSubtopic?.title === sub.title
                              ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${selectedSubtopic?.title === sub.title ? 'bg-white' : 'bg-blue-400'}`} />
                          <span className="truncate">{sub.title}</span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {showAssessment ? (
              <motion.div
                key="assessment-intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-[32px] p-12 shadow-sm border border-slate-200 text-center"
              >
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-8">
                  <CheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-serif font-bold mb-6 text-slate-900">Final Course Assessment</h2>
                <div className="max-w-2xl mx-auto space-y-6 mb-12">
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Ready to validate your journey? This comprehensive assessment is worth <span className="font-bold text-slate-800">100 Marks</span> and covers all units in <span className="italic">"{course.title}"</span>.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Section 1</p>
                      <p className="text-xs font-bold text-slate-800">20 MCQs (40m)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-indigo-600 mb-1">Section 2</p>
                      <p className="text-xs font-bold text-slate-800">10 MSQs (20m)</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-black uppercase text-purple-600 mb-1">Section 3</p>
                      <p className="text-xs font-bold text-slate-800">8 Descriptive (40m)</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setAssessmentStarted(true)}
                  className="bg-blue-600 text-white px-12 py-5 rounded-[24px] font-bold text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95 flex items-center gap-3 mx-auto"
                >
                  <Play size={24} fill="currentColor" />
                  Start Final Exam
                </button>
              </motion.div>
            ) : selectedSubtopic ? (
              <motion.div
                key={selectedSubtopic.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Reading Material */}
                <section className="bg-white rounded-[32px] p-10 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-2xl font-serif font-bold text-slate-900">{selectedSubtopic.title}</h2>
                  </div>
                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                    {selectedSubtopic.content}
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                    <button 
                      onClick={() => setActiveSession({ topic: selectedSubtopic.title, subtopic: selectedSubtopic })}
                      className="flex items-center gap-2 text-blue-600 font-bold hover:gap-3 transition-all"
                    >
                      <Sparkles size={18} />
                      Start AI Tutoring Session
                    </button>
                  </div>
                </section>

                {/* Slides for this Subtopic */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Presentation size={16} className="text-blue-600" />
                      Subtopic Slide Deck ({selectedSubtopic.slides?.length || 0} Slides)
                    </h3>
                    <span className="text-xs text-slate-500 font-medium hidden sm:inline">Interactive presentation view available in AI Tutoring</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {selectedSubtopic.slides?.map((slide, idx) => {
                      const slidePoints = parseSlidePoints(slide.content);
                      return (
                        <div 
                          key={idx} 
                          onClick={() => setActiveSession({ topic: selectedSubtopic.title, subtopic: selectedSubtopic })}
                          className="bg-gradient-to-b from-[#0b1222] to-[#080d19] rounded-3xl p-6 text-white flex flex-col justify-between border border-slate-800/80 shadow-xl hover:border-sky-500/40 hover:shadow-2xl hover:shadow-blue-950/20 transition-all cursor-pointer group relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-sky-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                          
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-500/10 text-sky-400 border border-blue-500/20">
                                Slide {String(idx + 1).padStart(2, '0')}
                              </span>
                              <span className="text-[11px] text-slate-500 flex items-center gap-1 group-hover:text-sky-400 transition-colors">
                                Open in Live Tutor →
                              </span>
                            </div>
                            
                            <h4 className="text-white font-bold mb-3 text-base md:text-lg tracking-tight font-sans group-hover:text-sky-300 transition-colors">
                              {slide.title}
                            </h4>
                            
                            <div className="space-y-2 mb-4">
                              {slidePoints.slice(0, 3).map((pt, pIdx) => {
                                const hasColon = pt.includes(':');
                                const head = hasColon ? pt.split(':')[0].trim() : '';
                                const body = hasColon ? pt.split(':').slice(1).join(':').trim() : pt;
                                return (
                                  <div key={pIdx} className="flex items-start gap-2 text-xs md:text-sm text-slate-300 leading-relaxed">
                                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-1.5 shrink-0" />
                                    <span>
                                      {head && <strong className="text-slate-100 mr-1">{head}:</strong>}
                                      {body}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="truncate max-w-[200px]">{selectedSubtopic.title}</span>
                            <span className="font-semibold text-sky-400">Click to study slide</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </motion.div>
            ) : (
              <div className="space-y-6">
                {course.youtubeInfo && (
                  <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-200 overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                        <Youtube size={20} className="text-slate-600" />
                        <span>Source Lecture Video</span>
                      </div>
                      <a 
                        href={course.youtubeInfo.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
                      >
                        <span>Open in YouTube</span>
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    
                    {course.youtubeInfo.videoId && (
                      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md mb-4">
                        <iframe
                          src={`https://www.youtube-nocookie.com/embed/${course.youtubeInfo.videoId}`}
                          title={course.youtubeInfo.title || "YouTube video player"}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full border-0"
                        />
                      </div>
                    )}

                    <h3 className="font-bold text-slate-900 text-lg">{course.youtubeInfo.title || course.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Channel / Instructor: <span className="text-slate-800 font-medium">{course.youtubeInfo.author}</span></p>
                  </div>
                )}

                <div className="p-10 bg-white rounded-[32px] border border-dashed border-slate-200 text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-4">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Select a subtopic to start learning</h3>
                  <p className="text-slate-500 max-w-sm mx-auto text-sm mb-6">
                    Choose a topic from the course curriculum on the left to explore contextual slides, comprehensive notes, and AI tutoring.
                  </p>
                  {allSubtopics.length > 0 && (
                    <button
                      onClick={() => setSelectedSubtopic(allSubtopics[0])}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 inline-flex items-center gap-2"
                    >
                      <Play size={14} />
                      <span>Start First Topic: {allSubtopics[0].title}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {assessmentStarted && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100]"
          >
            <FinalAssessment 
              course={course} 
              onBack={() => {
                setAssessmentStarted(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
