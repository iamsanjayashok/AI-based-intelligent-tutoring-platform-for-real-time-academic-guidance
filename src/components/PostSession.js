import React, { useState } from 'react';
import { FileText, ClipboardCheck, Loader2, ChevronLeft, Sparkles, CheckCircle, X, ArrowRight, Copy, Check, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateNotes, generateSubtopicAssessment, generateAssessment, gradeAssessment } from '../services/gemini';

export default function PostSession({ topic, subtopic, subtopicTitle, courseTitle, transcript, onBack }) {
  const [view, setView] = useState('menu'); // 'menu', 'notes', 'quiz', 'assessment', 'results'
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [copiedNotes, setCopiedNotes] = useState(false);
  
  // Interactive 10-Question MCQ Quiz
  const [quizData, setQuizData] = useState({ questions: [] });
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);

  // Conceptual/Written Assessment
  const [assessment, setAssessment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const displayTopic = topic || "Learning Session";
  const displaySubtopic = subtopicTitle || subtopic?.title || displayTopic;

  const sessionContext = {
    topic: displayTopic,
    subtopicTitle: displaySubtopic,
    subtopic,
    courseTitle: courseTitle || "",
    transcript: transcript || ""
  };

  const handleGenerateNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const generatedNotes = await generateNotes(sessionContext);
      setNotes(generatedNotes);
      setView('notes');
    } catch (e) {
      console.error(e);
      setError("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    setLoading(true);
    setError(null);
    setQuizAnswers({});
    setQuizResult(null);
    try {
      const data = await generateSubtopicAssessment(sessionContext);
      if (data && data.questions && data.questions.length > 0) {
        setQuizData(data);
        setView('quiz');
      } else {
        // Fallback to conceptual assessment
        const genAssessment = await generateAssessment(sessionContext);
        setAssessment(genAssessment);
        setView('assessment');
      }
    } catch (e) {
      console.error(e);
      setError("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!quizData?.questions?.length) return;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answer) score++;
    });
    const finalScore = Math.round((score / quizData.questions.length) * 100);
    setQuizResult({
      score: finalScore,
      count: quizData.questions.length,
      correct: score
    });
  };

  const handleSubmitAssessment = async () => {
    setLoading(true);
    setError(null);
    try {
      const grading = await gradeAssessment(displayTopic, assessment, answers);
      setResults(grading);
      setView('results');
    } catch (e) {
      console.error(e);
      setError("Failed to grade assessment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyNotesToClipboard = () => {
    navigator.clipboard.writeText(notes);
    setCopiedNotes(true);
    setTimeout(() => setCopiedNotes(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-12 bg-slate-50">
        <div className="bg-white p-12 rounded-[32px] border border-slate-200 shadow-xl text-center max-w-md w-full">
          <Loader2 className="animate-spin text-blue-600 mb-6 mx-auto" size={48} />
          <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Crafting Your Materials</h3>
          <p className="text-slate-500 text-sm">
            AI is analyzing your session on <span className="font-semibold text-slate-700">"{displaySubtopic}"</span> to generate structured study resources.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <header className="p-4 border-b flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{displaySubtopic}</h3>
            <p className="text-xs text-slate-500">{displayTopic}{courseTitle ? ` • ${courseTitle}` : ''}</p>
          </div>
        </div>
        {view !== 'menu' && (
          <button 
            onClick={() => setView('menu')} 
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Post-Session Menu
          </button>
        )}
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center justify-between">
            <p className="text-sm font-medium">{error}</p>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-lg">
              <X size={16} />
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-2 py-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider">
                  <Sparkles size={14} /> Session Completed
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-slate-900">Post-Session Activities</h2>
                <p className="text-slate-500 max-w-lg mx-auto">
                  Solidify your learning with personalized study notes and interactive assessments generated for <span className="font-semibold text-slate-700">"{displaySubtopic}"</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <FileText size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-3 text-slate-900">Generate Study Notes</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      Get structured notes covering core concepts, definitions, formulas, worked examples, and rapid revision takeaways.
                    </p>
                  </div>
                  <button 
                    onClick={handleGenerateNotes}
                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
                  >
                    <FileText size={18} />
                    Create Notes
                  </button>
                </div>

                <div className="bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                      <ClipboardCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold mb-3 text-slate-900">Take Quick Quiz</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-8">
                      Test your understanding with a customized 10-question assessment with instant scoring and explanations.
                    </p>
                  </div>
                  <button 
                    onClick={handleStartQuiz}
                    className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                  >
                    <ClipboardCheck size={18} />
                    Start Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[32px] shadow-sm border border-slate-200"
            >
              <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">Study Notes</h2>
                  <p className="text-sm text-slate-500">{displaySubtopic}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={copyNotesToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-bold transition-all border border-slate-200"
                  >
                    {copiedNotes ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                    {copiedNotes ? 'Copied!' : 'Copy Notes'}
                  </button>
                  <button 
                    onClick={handleGenerateNotes}
                    title="Regenerate notes"
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
                  >
                    <RefreshCw size={18} />
                  </button>
                  <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={22} />
                  </button>
                </div>
              </div>
              <div className="prose prose-slate max-w-none prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-slate-700 prose-li:text-slate-700">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </motion.div>
          )}

          {view === 'quiz' && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto space-y-6 pb-20"
            >
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">Quick Assessment</h2>
                  <p className="text-sm text-slate-500">10-Question Knowledge Check for {displaySubtopic}</p>
                </div>
                {quizResult && (
                  <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 px-6 py-3 rounded-2xl">
                    <span className="text-xs font-black uppercase text-blue-600">Your Score:</span>
                    <span className="text-2xl font-bold text-blue-900">{quizResult.score}% ({quizResult.correct}/{quizResult.count})</span>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {quizData?.questions?.map((q, qIdx) => (
                  <div 
                    key={qIdx} 
                    className={`bg-white rounded-[28px] p-6 md:p-8 border shadow-sm transition-all ${
                      quizResult && quizAnswers[qIdx] === q.answer 
                        ? 'border-green-200 bg-green-50/20' 
                        : quizResult && quizAnswers[qIdx] !== q.answer 
                        ? 'border-red-200 bg-red-50/20' 
                        : 'border-slate-100'
                    }`}
                  >
                    <div className="flex gap-4 mb-6">
                      <span className="w-8 h-8 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center font-bold text-sm shrink-0">
                        {qIdx + 1}
                      </span>
                      <p className="text-lg font-bold text-slate-800 leading-snug">{q.question}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.options.map((option, oIdx) => {
                        const isSelected = quizAnswers[qIdx] === option;
                        const isCorrect = q.answer === option;
                        const showCorrect = quizResult && isCorrect;
                        const showWrong = quizResult && isSelected && !isCorrect;

                        return (
                          <button
                            key={oIdx}
                            disabled={!!quizResult}
                            onClick={() => setQuizAnswers(prev => ({ ...prev, [qIdx]: option }))}
                            className={`p-4 rounded-2xl text-left border-2 transition-all flex items-center justify-between text-sm ${
                              isSelected
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                                : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-200'
                            } ${showCorrect ? 'border-green-500 bg-green-50 text-green-800' : ''} ${
                              showWrong ? 'border-red-500 bg-red-50 text-red-800' : ''
                            }`}
                          >
                            <span>{option}</span>
                            {showCorrect && <div className="p-1 bg-green-500 text-white rounded-full"><ClipboardCheck size={14} /></div>}
                            {showWrong && <div className="p-1 bg-red-500 text-white rounded-full"><X size={14} /></div>}
                          </button>
                        );
                      })}
                    </div>

                    {quizResult && (
                      <div className={`mt-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${quizAnswers[qIdx] === q.answer ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        <span className="font-bold">Correct Answer:</span>
                        <span>{q.answer}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-center pt-4">
                {!quizResult ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < (quizData?.questions?.length || 1)}
                    className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center gap-2"
                  >
                    <ClipboardCheck size={20} />
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={() => setView('menu')}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
                  >
                    Back to Menu
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {view === 'assessment' && (
            <motion.div
              key="assessment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-4xl mx-auto bg-white p-8 md:p-10 rounded-[32px] shadow-sm border border-slate-200"
            >
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-slate-900">Written Assessment</h2>
                  <p className="text-sm text-slate-500">{displaySubtopic}</p>
                </div>
                <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-8">
                {assessment?.conceptual?.map((q, i) => (
                  <div key={i} className="space-y-3">
                    <p className="font-bold text-slate-800 text-base">{i + 1}. {q}</p>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none h-28 text-sm"
                      placeholder="Your answer..."
                      value={answers[`conceptual_${i}`] || ''}
                      onChange={(e) => setAnswers({...answers, [`conceptual_${i}`]: e.target.value})}
                    />
                  </div>
                ))}

                {assessment?.problemSolving?.map((q, i) => (
                  <div key={i} className="space-y-3">
                    <p className="font-bold text-slate-800 text-base">Problem {i + 1}: {q}</p>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 outline-none h-28 text-sm"
                      placeholder="Show your work and answer..."
                      value={answers[`problem_${i}`] || ''}
                      onChange={(e) => setAnswers({...answers, [`problem_${i}`]: e.target.value})}
                    />
                  </div>
                ))}

                {assessment?.challenge && (
                  <div className="space-y-3 p-6 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="font-bold text-amber-900 text-base flex items-center gap-2">
                      <Sparkles size={18} />
                      Challenge Question
                    </p>
                    <p className="text-amber-800 text-sm">{assessment.challenge}</p>
                    <textarea 
                      className="w-full p-4 rounded-xl border border-amber-200 focus:ring-2 focus:ring-amber-500/20 outline-none h-32 bg-white text-sm"
                      placeholder="Deep dive into your answer..."
                      value={answers[`challenge`] || ''}
                      onChange={(e) => setAnswers({...answers, [`challenge`]: e.target.value})}
                    />
                  </div>
                )}

                <button 
                  onClick={handleSubmitAssessment}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2"
                >
                  Submit for Grading
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {view === 'results' && (
            <motion.div
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto bg-white p-10 rounded-[32px] shadow-sm border border-slate-200 text-center"
            >
              <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl font-bold">{results?.score}%</span>
              </div>
              <h2 className="text-3xl font-serif font-bold mb-4">Assessment Results</h2>
              <div className="bg-slate-50 p-6 rounded-2xl text-left mb-8">
                <h4 className="font-bold text-slate-900 mb-2">Feedback:</h4>
                <p className="text-slate-600">{results?.feedback}</p>
              </div>
              
              <div className="space-y-4 text-left mb-10">
                <h4 className="font-bold text-slate-900">Correct Concepts:</h4>
                <ul className="space-y-2">
                  {results?.correctAnswers?.map((ans, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-600">
                      <CheckCircle size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                      {ans}
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => setView('menu')}
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all"
              >
                Back to Menu
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
