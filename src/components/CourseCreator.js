import React, { useState } from 'react';
import { analyzeMaterials } from '../services/gemini';
import { db, auth } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { 
  FileText, 
  GraduationCap, 
  Loader2, 
  Sparkles, 
  Upload, 
  AlertCircle, 
  Youtube, 
  ExternalLink, 
  RotateCcw, 
  CheckCircle2,
  FileCode,
  Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('permission') || message.includes('insufficient')) {
    throw new Error(`Permission Denied: You don't have access to ${path}. Please check security rules.`);
  }
  throw new Error(message);
}

export default function CourseCreator({ onComplete }) {
  const [mode, setMode] = useState('text'); // 'text' | 'file' | 'youtube'
  const [materials, setMaterials] = useState('');
  const [file, setFile] = useState(null);
  
  // YouTube specific state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeData, setYoutubeData] = useState(null);
  const [extractingYoutube, setExtractingYoutube] = useState(false);
  const [youtubeError, setYoutubeError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  const handleExtractYoutube = async (urlToFetch) => {
    const targetUrl = (urlToFetch || youtubeUrl).trim();
    if (!targetUrl) {
      setYoutubeError("Please enter a YouTube video URL or Video ID.");
      return;
    }

    setExtractingYoutube(true);
    setYoutubeError(null);
    setError(null);

    try {
      const res = await fetch('/api/process-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to extract transcript from YouTube video.');
      }

      setYoutubeData(data);
      setMaterials(data.transcript);
    } catch (err) {
      console.error("YouTube Extraction Error:", err);
      setYoutubeError(err instanceof Error ? err.message : String(err));
    } finally {
      setExtractingYoutube(false);
    }
  };

  const handleClearYoutube = () => {
    setYoutubeData(null);
    setYoutubeUrl('');
    setMaterials('');
    setYoutubeError(null);
  };

  const handleCreate = async () => {
    if (!materials.trim() && !file) return;
    setLoading(true);
    setError(null);
    try {
      let courseData;
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to create a course.");
        return;
      }

      if (mode === 'file' && file) {
        setStatus('Uploading and processing document...');
        const formData = new FormData();
        formData.append('file', file);
        
        let endpoint = '/api/process-doc';
        if (file.name.endsWith('.pdf')) {
          endpoint = '/api/process-pdf';
        }
        
        const res = await fetch(endpoint, { method: 'POST', body: formData });
        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(isJson ? JSON.parse(errorText).error : errorText);
        }

        const docData = await res.json();
        setStatus('Analyzing content with AI...');
        const fullText = docData.pages.map(p => p.text).join('\n');
        courseData = await analyzeMaterials(fullText);
        
        setStatus('Saving your course...');
        const courseRef = await addDoc(collection(db, 'courses'), {
          ...courseData,
          ownerId: user.uid,
          sourceType: 'file',
          createdAt: serverTimestamp(),
        });

        await addDoc(collection(db, 'courses', courseRef.id, 'documents'), {
          ...docData,
          courseId: courseRef.id,
          createdAt: new Date().toISOString()
        });
      } else if (mode === 'youtube' && youtubeData) {
        setStatus('Analyzing YouTube lecture transcript with AI...');
        courseData = await analyzeMaterials(materials);

        setStatus('Saving your course...');
        const courseRef = await addDoc(collection(db, 'courses'), {
          ...courseData,
          ownerId: user.uid,
          sourceType: 'youtube',
          youtubeInfo: {
            videoId: youtubeData.videoId,
            url: youtubeData.url,
            title: youtubeData.title,
            author: youtubeData.author,
            thumbnail: youtubeData.thumbnail,
            source: youtubeData.source
          },
          createdAt: serverTimestamp(),
        });

        if (youtubeData.pages && youtubeData.pages.length > 0) {
          await addDoc(collection(db, 'courses', courseRef.id, 'documents'), {
            title: youtubeData.title,
            type: 'youtube',
            url: youtubeData.url,
            thumbnail: youtubeData.thumbnail,
            pages: youtubeData.pages,
            courseId: courseRef.id,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setStatus('Analyzing content with AI...');
        courseData = await analyzeMaterials(materials);
        
        setStatus('Saving your course...');
        await addDoc(collection(db, 'courses'), {
          ...courseData,
          ownerId: user.uid,
          sourceType: 'text',
          createdAt: serverTimestamp(),
        });
      }
      
      onComplete();
    } catch (error) {
      console.error('Failed to create course:', error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const wordCount = materials.trim() ? materials.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-serif font-bold mb-4 text-slate-900">Create a New Course</h2>
        <p className="text-slate-500">
          Paste your syllabus, upload lecture notes, or paste a YouTube video link. 
          Our AI will extract the transcript and build a personalized learning path with reading materials and slides.
        </p>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-blue-50 p-8">
        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => {
              setMode('text');
              setFile(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              mode === 'text' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCode size={16} />
            <span>Text Input</span>
          </button>

          <label 
            className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer transition-all flex items-center gap-2 ${
              mode === 'file' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload size={16} />
            <input 
              type="file" 
              accept=".pdf,.ppt,.pptx,.doc,.docx" 
              className="hidden" 
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setMode('file');
                  setMaterials('');
                  setYoutubeData(null);
                }
              }} 
            />
            <span>{file ? `File: ${file.name}` : 'Upload PDF / PPT / Word'}</span>
          </label>

          <button 
            type="button"
            onClick={() => {
              setMode('youtube');
              setFile(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              mode === 'youtube' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Youtube size={16} className={mode === 'youtube' ? 'text-white' : 'text-slate-600'} />
            <span>YouTube Video Link</span>
          </button>
        </div>

        {/* Content Area Based on Mode */}
        {mode === 'text' && (
          <div className="space-y-2">
            <textarea
              value={materials}
              onChange={(e) => setMaterials(e.target.value)}
              placeholder="Paste your course syllabus, lecture transcript, or textbook chapters here..."
              className="w-full h-64 p-6 rounded-2xl bg-blue-50/30 border border-blue-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none font-sans text-slate-700 leading-relaxed"
            />
            {wordCount > 0 && (
              <p className="text-xs text-slate-400 text-right">{wordCount.toLocaleString()} words</p>
            )}
          </div>
        )}

        {mode === 'file' && (
          <div className="w-full h-64 flex flex-col items-center justify-center bg-blue-50/30 border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center">
            {file ? (
              <>
                <FileText size={48} className="text-blue-600 mb-3" />
                <p className="font-bold text-slate-800 text-base">{file.name}</p>
                <p className="text-xs text-slate-400 mt-1">Ready for document processing and AI curriculum extraction</p>
                <button 
                  onClick={() => {
                    setFile(null);
                    setMode('text');
                  }} 
                  className="mt-4 text-xs font-semibold text-slate-500 hover:text-slate-700 underline"
                >
                  Remove file & switch to Text
                </button>
              </>
            ) : (
              <>
                <Upload size={48} className="text-blue-400 mb-3" />
                <p className="font-bold text-slate-700">Choose a document to upload</p>
                <p className="text-xs text-slate-400 mt-1">Supports PDF, PowerPoint (.ppt, .pptx), and Word (.doc, .docx)</p>
                <label className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-700 shadow-sm">
                  Browse File
                  <input 
                    type="file" 
                    accept=".pdf,.ppt,.pptx,.doc,.docx" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setFile(e.target.files[0]);
                      }
                    }} 
                  />
                </label>
              </>
            )}
          </div>
        )}

        {mode === 'youtube' && (
          <div className="space-y-6">
            {!youtubeData ? (
              <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl space-y-4">
                <div className="flex items-center gap-3 text-slate-800 font-semibold text-sm">
                  <Youtube size={20} className="text-slate-700" />
                  <span>Extract Transcript from YouTube Video</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => {
                        setYoutubeUrl(e.target.value);
                        setYoutubeError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleExtractYoutube();
                        }
                      }}
                      placeholder="Paste link: https://www.youtube.com/watch?v=... or https://youtu.be/..."
                      className="w-full pl-4 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-sm text-slate-800 transition-all shadow-sm"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExtractYoutube()}
                    disabled={extractingYoutube || !youtubeUrl.trim()}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {extractingYoutube ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Extracting Transcript...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Extract Transcript</span>
                      </>
                    )}
                  </button>
                </div>

                {youtubeError && (
                  <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600" />
                    <span>{youtubeError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* YouTube Video Information Card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-28 h-20 sm:w-36 sm:h-24 rounded-xl overflow-hidden shadow-sm shrink-0 bg-slate-900 border border-slate-200">
                      <img 
                        src={youtubeData.thumbnail} 
                        alt={youtubeData.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-slate-900/80 text-white flex items-center justify-center shadow-md">
                          <Play size={14} className="ml-0.5" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        <CheckCircle2 size={12} />
                        {youtubeData.source === 'official_transcript' ? 'Official Video Transcript' : 'AI Lecture Extraction'}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-2">
                        {youtubeData.title}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        Channel: <span className="text-slate-800">{youtubeData.author}</span> • {wordCount.toLocaleString()} words
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center gap-2 self-stretch sm:self-center shrink-0">
                    <a
                      href={youtubeData.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all shadow-xs"
                    >
                      <span>Watch</span>
                      <ExternalLink size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={handleClearYoutube}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all"
                    >
                      <RotateCcw size={12} />
                      <span>Change</span>
                    </button>
                  </div>
                </div>

                {/* Editable Transcript Area */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Extracted Transcript (Review or Edit Before Course Generation)
                    </label>
                    <span className="text-xs text-slate-400 font-mono">
                      {wordCount.toLocaleString()} words
                    </span>
                  </div>
                  <textarea
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                    placeholder="Transcript text will appear here..."
                    className="w-full h-56 p-4 rounded-2xl bg-blue-50/20 border border-blue-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none font-mono text-xs text-slate-700 leading-relaxed"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Tip: You can add specific focus topics or notes directly to the transcript above to guide the AI curriculum generator.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Controls & Feedback */}
        <div className="mt-8 flex flex-col items-end gap-4 border-t border-slate-100 pt-6">
          {status && (
            <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold animate-pulse">
              <Loader2 className="animate-spin" size={16} />
              <span>{status}</span>
            </div>
          )}
          
          {error && (
            <div className="w-full p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onComplete}
              disabled={loading}
              className="px-8 py-4 rounded-2xl font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || (!materials.trim() && !file) || (mode === 'youtube' && !youtubeData && !materials.trim())}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-2xl font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              <span>{mode === 'youtube' ? 'Generate Course from Video' : 'Generate Learning Path'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Explanations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={<Youtube className="text-blue-500" />}
          title="YouTube & Docs"
          desc="Paste any YouTube video link, paste syllabus notes, or upload PDF/Word files."
        />
        <FeatureCard 
          icon={<Sparkles className="text-amber-500" />}
          title="Transcript Extraction"
          desc="We extract video transcripts and analyze key concepts with Gemini AI."
        />
        <FeatureCard 
          icon={<GraduationCap className="text-emerald-500" />}
          title="Structured Path"
          desc="Get units, lecture slides, comprehensive reading notes, and tutoring."
        />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-blue-50 shadow-sm hover:border-blue-100 transition-all">
      <div className="mb-4">{icon}</div>
      <h4 className="font-bold mb-1 text-slate-800">{title}</h4>
      <p className="text-sm text-slate-500">{desc}</p>
    </div>
  );
}

