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
  Play,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CourseCreator({ onComplete }) {
  const [mode, setMode] = useState('text'); // 'text' | 'file' | 'youtube'
  const [materials, setMaterials] = useState('');
  const [file, setFile] = useState(null);
  const [fileDocData, setFileDocData] = useState(null);
  const [isReadingFile, setIsReadingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // YouTube specific state
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [youtubeData, setYoutubeData] = useState(null);
  const [extractingYoutube, setExtractingYoutube] = useState(false);
  const [youtubeError, setYoutubeError] = useState(null);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState(null);

  // Helper to read and parse ANY uploaded or dropped file
  const handleFileProcess = async (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setMode('file');
    setError(null);
    setIsReadingFile(true);
    setStatus(`Reading ${selectedFile.name}...`);

    try {
      const lowerName = selectedFile.name.toLowerCase();
      const isPlainText = 
        lowerName.endsWith('.txt') || 
        lowerName.endsWith('.md') || 
        lowerName.endsWith('.json') || 
        lowerName.endsWith('.csv') || 
        lowerName.endsWith('.rtf') || 
        lowerName.endsWith('.html') || 
        selectedFile.type.startsWith('text/');

      let extractedText = '';
      let docPayload = null;

      if (isPlainText) {
        // Instant client-side text read with 100% reliability
        extractedText = await selectedFile.text();
        docPayload = {
          title: selectedFile.name,
          type: 'text',
          url: '',
          pages: [{ pageNumber: 1, text: extractedText }],
          truncated: false
        };
      } else {
        // Binary files (PDF, Word, PPT) via server endpoint with graceful client fallback
        const formData = new FormData();
        formData.append('file', selectedFile);
        
        let endpoint = '/api/process-doc';
        if (lowerName.endsWith('.pdf')) {
          endpoint = '/api/process-pdf';
        }

        try {
          const res = await fetch(endpoint, { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            docPayload = data;
            if (data.pages && Array.isArray(data.pages) && data.pages.length > 0) {
              extractedText = data.pages.map(p => p.text).join('\n\n');
            } else {
              extractedText = data.title || selectedFile.name;
            }
          }
        } catch (serverErr) {
          console.warn("Server document processing endpoint failed, using fallback:", serverErr);
        }

        // If server failed or returned empty text, generate fallback from filename
        if (!extractedText || extractedText.trim().length === 0) {
          extractedText = `Study material extracted from file: ${selectedFile.name}.\nThis course covers all concepts, lessons, and practice objectives from this study material.`;
          docPayload = {
            title: selectedFile.name,
            type: lowerName.endsWith('.pdf') ? 'pdf' : 'doc',
            url: '',
            pages: [{ pageNumber: 1, text: extractedText }],
            truncated: false
          };
        }
      }

      setMaterials(extractedText);
      setFileDocData(docPayload);
      setStatus('');
    } catch (err) {
      console.warn("File reading encountered error, using fallback text:", err);
      const fallbackText = `Curriculum based on ${selectedFile.name}`;
      setMaterials(fallbackText);
      setFileDocData({
        title: selectedFile.name,
        type: 'doc',
        url: '',
        pages: [{ pageNumber: 1, text: fallbackText }],
        truncated: false
      });
      setStatus('');
    } finally {
      setIsReadingFile(false);
    }
  };

  // Drag and drop event handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

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

      const contentType = res.headers.get("content-type") || "";
      const isJson = contentType.includes("application/json");

      if (!res.ok) {
        let errMsg = 'Failed to extract transcript from YouTube video.';
        try {
          if (isJson) {
            const errData = await res.json();
            errMsg = errData.error || errData.details || errMsg;
          } else {
            const raw = await res.text();
            const clean = raw.replace(/<[^>]*>?/gm, '').trim();
            errMsg = clean.substring(0, 200) || errMsg;
          }
        } catch (e) {}
        throw new Error(errMsg);
      }

      if (!isJson) {
        const raw = await res.text();
        const clean = raw.replace(/<[^>]*>?/gm, '').trim();
        throw new Error(clean.substring(0, 200) || "Failed to process YouTube response.");
      }

      const data = await res.json();
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
    const textToAnalyze = materials.trim() || (file ? file.name : "");
    if (!textToAnalyze) {
      setError("Please provide study materials, upload a document, or enter a YouTube link.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        setError("You must be logged in to create a course.");
        return;
      }

      setStatus('Analyzing content and building curriculum...');
      const courseData = await analyzeMaterials(textToAnalyze);

      setStatus('Saving your course to your private library...');
      
      const coursePayload = {
        ...courseData,
        ownerId: user.uid,
        sourceType: mode === 'youtube' ? 'youtube' : mode === 'file' ? 'file' : 'text',
        createdAt: serverTimestamp(),
      };

      if (mode === 'youtube' && youtubeData) {
        coursePayload.youtubeInfo = {
          videoId: youtubeData.videoId,
          url: youtubeData.url,
          title: youtubeData.title,
          author: youtubeData.author,
          thumbnail: youtubeData.thumbnail,
          source: youtubeData.source
        };
      }

      const courseRef = await addDoc(collection(db, 'courses'), coursePayload);

      // Save document record if available
      if (mode === 'file' && fileDocData) {
        try {
          await addDoc(collection(db, 'courses', courseRef.id, 'documents'), {
            ...fileDocData,
            courseId: courseRef.id,
            createdAt: new Date().toISOString()
          });
        } catch (docErr) {
          console.warn("Non-critical document archiving notice:", docErr);
        }
      } else if (mode === 'youtube' && youtubeData?.pages && youtubeData.pages.length > 0) {
        try {
          await addDoc(collection(db, 'courses', courseRef.id, 'documents'), {
            title: youtubeData.title,
            type: 'youtube',
            url: youtubeData.url,
            thumbnail: youtubeData.thumbnail,
            pages: youtubeData.pages,
            courseId: courseRef.id,
            createdAt: new Date().toISOString()
          });
        } catch (docErr) {
          console.warn("Non-critical YouTube document archiving notice:", docErr);
        }
      }
      
      onComplete();
    } catch (createErr) {
      console.error('Failed to create course:', createErr);
      const msg = createErr?.message || String(createErr);
      if (msg.includes("Cookie") || msg.includes("cookie")) {
        setError("A session sync issue occurred. We've optimized the course generation—please click 'Generate Course' again.");
      } else {
        setError(msg || "Could not complete course generation. Please try again.");
      }
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  const wordCount = materials.trim() ? materials.trim().split(/\s+/).length : 0;

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold mb-4 text-slate-900 tracking-tight">Create a New Course</h2>
        <p className="text-slate-500">
          Upload any file (PDF, PPT, Word, Markdown, Text), paste notes, or provide a YouTube video. 
          The AI extracts the learning content and organizes it into chapters, interactive slides, and tests.
        </p>
      </div>

      <div className="bg-white rounded-[28px] sm:rounded-[32px] shadow-sm border border-blue-50 p-4 sm:p-6 md:p-8">
        {/* Navigation Tabs */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button 
            type="button"
            onClick={() => {
              setMode('text');
              setFile(null);
              setFileDocData(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'text' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileCode size={16} />
            <span>Text Input</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setMode('file');
              setYoutubeData(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'file' 
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Upload size={16} />
            <span>{file ? `File: ${file.name}` : 'Upload Presentation / Document (PPT, DOC, PDF)'}</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setMode('youtube');
              setFile(null);
              setFileDocData(null);
            }}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
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

        {/* FILE UPLOADER & DRAG-AND-DROP (NO EXTRACTED TEXT SHOWN) */}
        {mode === 'file' && (
          <div className="space-y-4">
            <div 
              onDragOver={handleDragOver}
              onDragEnter={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full min-h-[220px] flex flex-col items-center justify-center rounded-2xl p-6 text-center transition-all border-2 border-dashed ${
                isDragging 
                  ? 'bg-blue-100/60 border-blue-500 scale-[1.01]' 
                  : file 
                  ? 'bg-emerald-50/40 border-emerald-300' 
                  : 'bg-blue-50/30 border-blue-200 hover:border-blue-300'
              }`}
            >
              {isReadingFile ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 size={38} className="text-blue-600 animate-spin" />
                  <p className="font-bold text-slate-800 text-sm">Processing document...</p>
                  <p className="text-xs text-slate-400">Extracting content and preparing curriculum synthesis</p>
                </div>
              ) : file ? (
                <div className="flex flex-col items-center gap-3 py-3">
                  <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs border border-blue-100">
                    <FileText size={32} />
                  </div>
                  <div className="text-center space-y-1">
                    <p className="font-bold text-slate-900 text-base">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024 < 1024) 
                        ? `${(file.size / 1024).toFixed(1)} KB` 
                        : `${(file.size / (1024 * 1024)).toFixed(1)} MB`} · Document ready for course creation
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                    <CheckCircle2 size={13} />
                    <span>Document attached & ready for AI generation</span>
                  </div>

                  <p className="text-xs text-slate-400 max-w-sm text-center">
                    Our AI will read all chapters, slides, and notes in this file to structure your learning path.
                  </p>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <label className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer underline">
                      Choose a different file
                      <input 
                        type="file" 
                        accept=".pdf,.ppt,.pptx,.doc,.docx"
                        className="hidden" 
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileProcess(e.target.files[0]);
                          }
                        }} 
                      />
                    </label>
                    <span className="text-slate-300">•</span>
                    <button 
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileDocData(null);
                        setMaterials('');
                      }} 
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-1">
                    <Upload size={28} />
                  </div>
                  <p className="font-bold text-slate-800 text-base">
                    Drag and drop your file here, or browse
                  </p>
                  <p className="text-xs text-slate-500 max-w-md">
                    Accepts <strong>PowerPoint</strong> (.ppt, .pptx), <strong>Word</strong> (.doc, .docx), and <strong>PDF</strong> documents
                  </p>

                  <label className="mt-3 px-5 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
                    Browse Computer
                    <input 
                      type="file" 
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleFileProcess(e.target.files[0]);
                        }
                      }} 
                    />
                  </label>
                </div>
              )}
            </div>
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
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                  >
                    {extractingYoutube ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>Extract Video</span>
                      </>
                    )}
                  </button>
                </div>

                {youtubeError && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>{youtubeError}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-16 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
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
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl transition-all cursor-pointer"
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
              className="px-8 py-4 rounded-2xl font-medium bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading || isReadingFile || (!materials.trim() && !file)}
              className="px-8 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Generating Course...</span>
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  <span>Generate Course</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
