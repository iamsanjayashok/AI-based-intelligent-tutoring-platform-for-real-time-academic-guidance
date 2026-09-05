import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { ChevronLeft, ChevronRight, ClipboardCheck, GraduationCap, Loader2, Send, X, Mic, MicOff, Sparkles, ZoomIn, ZoomOut, ExternalLink, User, Presentation, Check, Settings, Volume2, Globe, MessageSquare, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { generateNotes, generateSubtopicAssessment } from '../services/gemini';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';

import LiveTutorChatBox from './LiveTutorChatBox';

const getGenAI = (customKey) => {
  const key = customKey || localStorage.getItem('CUSTOM_GEMINI_API_KEY') || process.env.GEMINI_API_KEY || "";
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. AI features may not function correctly.");
  }
  return new GoogleGenAI({ apiKey: key || "dummy-key" });
};

const AudioWaveform = ({ analyser, isListening }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = isListening ? `rgb(255, 50, 50)` : `rgba(59, 130, 246, 0.6)`;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = canvas.height - (v * canvas.height / 2);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Add a subtle glow/fill
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fillStyle = isListening ? `rgba(255, 50, 50, 0.1)` : `rgba(59, 130, 246, 0.05)`;
      ctx.fill();
    };

    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [analyser, isListening]);

  return <canvas ref={canvasRef} width={320} height={64} className="w-full h-full" />;
};

export default function TutorChat({ topic, subtopic, courseId, courseTitle, onEnd }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [ending, setEnding] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [document, setDocument] = useState(null);
  const [loadingDoc, setLoadingDoc] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [connectionError, setConnectionError] = useState(null);

  // Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [summaryTab, setSummaryTab] = useState('notes');
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [assessmentData, setAssessmentData] = useState({ questions: [] });
  const [userAnswers, setUserAnswers] = useState({});
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [endOptions, setEndOptions] = useState({ notes: true, assessment: true });

  const scrollRef = useRef(null);
  const chatRef = useRef(null);

  // Live API State
  const [isLive, setIsLive] = useState(false);
  const [isConnectingLive, setIsConnectingLive] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [debugLogs, setDebugLogs] = useState([]);
  const [showControls, setShowControls] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(true);
  const [aiSettings, setAiSettings] = useState({
    voice: 'Kore',
    language: 'English',
    volume: 1.0,
    tone: 'Default'
  });
  const liveSessionRef = useRef(null);
  const speechRecognitionRef = useRef(null);

  const addLog = (msg) => {
    console.log(msg);
    setDebugLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`].slice(-5));
  };
  const audioContextRef = useRef(null);
  const audioWorkletNodeRef = useRef(null);
  const audioQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const micStreamRef = useRef(null);
  const analyserRef = useRef(null);
  const currentAudioSourceRef = useRef(null);
  const isLiveRef = useRef(false);
  const isMicOnRef = useRef(false);
  const isMicEnabledRef = useRef(true);
  const isSpeakingRef = useRef(false);
  const ignoreIncomingAudioRef = useRef(false);
  const aiSettingsRef = useRef({ volume: 1.0 });

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isLiveRef.current = isLive;
  }, [isLive]);

  useEffect(() => {
    isMicOnRef.current = isMicOn;
  }, [isMicOn]);

  useEffect(() => {
    isMicEnabledRef.current = isMicEnabled;
  }, [isMicEnabled]);

  useEffect(() => {
    aiSettingsRef.current = aiSettings;
    if (isMicOnRef.current && isLiveRef.current && speechRecognitionRef.current) {
      startSpeechRecognition();
    }
  }, [aiSettings]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const fetchDoc = async () => {
      setLoadingDoc(true);
      try {
        const q = query(collection(db, 'courses', courseId, 'documents'), limit(1));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setDocument(snap.docs[0].data());
        }
      } catch (e) {
        console.error("Error fetching doc:", e);
      } finally {
        setLoadingDoc(false);
      }
    };
    fetchDoc();
  }, [courseId]);

  const audioWorkletCode = `
    class AudioProcessor extends AudioWorkletProcessor {
      constructor() {
        super();
        this.bufferSize = 2048; // Double the buffer for stability
        this.buffer = new Int16Array(this.bufferSize);
        this.bufferIndex = 0;
      }
      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (input && input[0]) {
          const samples = input[0];
          for (let i = 0; i < samples.length; i++) {
            let s = samples[i];
            // High-quality clipping and conversion to 16-bit PCM
            let pcm = s < 0 ? s * 0x8000 : s * 0x7FFF;
            this.buffer[this.bufferIndex++] = Math.max(-32768, Math.min(32767, pcm));
            
            if (this.bufferIndex >= this.bufferSize) {
              this.port.postMessage(this.buffer);
              this.buffer = new Int16Array(this.bufferSize);
              this.bufferIndex = 0;
            }
          }
        }
        return true;
      }
    }
    registerProcessor('audio-processor', AudioProcessor);
  `;

  // Speech-to-Text handler: updates the user transcript in real-time as words are spoken
  // and finalizes the sentence when the speaker completes or pauses.
  const handleUserSpokenSentence = (sentenceText, isFinal) => {
    if (!sentenceText || !sentenceText.trim()) return;
    const clean = sentenceText.trim();

    setMessages(prev => {
      const lastIdx = prev.length - 1;
      const last = lastIdx >= 0 ? prev[lastIdx] : null;

      // 1. If currently updating an active voice draft
      if (last && last.role === 'user' && last.isVoiceDraft) {
        const updated = [...prev];
        updated[lastIdx] = {
          ...last,
          text: clean,
          isVoiceDraft: !isFinal,
          isVoice: true,
          timestamp: Date.now()
        };
        return updated;
      }

      // 2. If the user finished speaking recently (within 4s), and an engine/server refinement arrives
      if (last && last.role === 'user' && last.isVoice && Date.now() - (last.timestamp || 0) < 4000) {
        const cLower = clean.toLowerCase();
        const lLower = last.text.toLowerCase();
        if (cLower === lLower || cLower.startsWith(lLower) || lLower.startsWith(cLower)) {
          const updated = [...prev];
          updated[lastIdx] = {
            ...last,
            text: clean.length >= last.text.length ? clean : last.text,
            isVoiceDraft: !isFinal,
            isVoice: true,
            timestamp: Date.now()
          };
          return updated;
        }
      }

      // 3. New speech utterance: create user message bubble
      return [...prev, {
        role: 'user',
        text: clean,
        isVoiceDraft: !isFinal,
        isVoice: true,
        timestamp: Date.now()
      }];
    });
  };

  // Live Tutor Spoken Words handler: appends words spoken by the AI tutor in real-time
  const handleTutorSpokenText = (chunkText, isFinished) => {
    if (!chunkText && !isFinished) return;
    setMessages(prev => {
      const lastIdx = prev.length - 1;
      const last = lastIdx >= 0 ? prev[lastIdx] : null;

      if (last && last.role === 'model' && last.isDraft) {
        let combined = last.text || '';
        if (chunkText && !combined.endsWith(chunkText)) {
          combined += chunkText;
        }
        const updated = [...prev];
        updated[lastIdx] = {
          ...last,
          text: combined,
          isDraft: !isFinished,
          timestamp: Date.now()
        };
        return updated;
      }

      // Start of a new tutor turn
      if (chunkText) {
        return [...prev, {
          role: 'model',
          text: chunkText,
          isDraft: !isFinished,
          timestamp: Date.now()
        }];
      }

      return prev;
    });
  };

  // Client-side real-time STT listener using SpeechRecognition API
  const startSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionClass) {
      addLog("SpeechRecognition API not available in browser; server STT active.");
      return;
    }

    try {
      if (speechRecognitionRef.current) {
        try { speechRecognitionRef.current.stop(); } catch (e) {}
        speechRecognitionRef.current = null;
      }

      const rec = new SpeechRecognitionClass();
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      const langMap = {
        'English': 'en-US',
        'Spanish': 'es-ES',
        'French': 'fr-FR',
        'German': 'de-DE',
        'Hindi': 'hi-IN',
        'Tamil': 'ta-IN',
        'Japanese': 'ja-JP',
        'Mandarin': 'zh-CN',
        'Arabic': 'ar-SA'
      };
      rec.lang = langMap[aiSettingsRef.current?.language] || 'en-US';

      rec.onresult = (event) => {
        let interim = '';
        let finalStr = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalStr += transcript;
          } else {
            interim += transcript;
          }
        }

        const sentence = (finalStr || interim).trim();
        if (sentence) {
          handleUserSpokenSentence(sentence, Boolean(finalStr));
        }
      };

      rec.onerror = (event) => {
        if (event.error !== 'no-speech') {
          console.warn("Speech recognition notice:", event.error);
        }
      };

      rec.onend = () => {
        if (isMicOnRef.current && isLiveRef.current) {
          try {
            rec.start();
          } catch (e) {}
        }
      };

      rec.start();
      speechRecognitionRef.current = rec;
      addLog("Real-time STT listener active.");
    } catch (err) {
      console.warn("Could not start Speech Recognition:", err);
    }
  };

  const stopSpeechRecognition = () => {
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch (e) {}
      speechRecognitionRef.current = null;
    }
  };

  const startLiveSession = async (stream) => {
    addLog("Initializing Audio Pipeline...");
    try {
      setPermissionError(false);
      setConnectionError(null);
      
      // Cleanup existing session
      if (liveSessionRef.current) {
        addLog("Closing existing session...");
        liveSessionRef.current.close();
        liveSessionRef.current = null;
      }

      setSessionStarted(true);
      micStreamRef.current = stream;

      // 1. Setup Audio Context & Worklet
      if (!audioContextRef.current) {
        addLog("Creating AudioContext...");
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      }

      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // 2. Setup Mic Input if stream provided
      if (stream) {
        addLog("Setting up microphone input...");
        const source = audioContextRef.current.createMediaStreamSource(stream);
        
        // Setup Analyser for visual feedback
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;
        source.connect(analyser);

        try {
          await audioContextRef.current.audioWorklet.addModule(`data:text/javascript;base64,${btoa(audioWorkletCode)}`);
          const workletNode = new AudioWorkletNode(audioContextRef.current, 'audio-processor');
          audioWorkletNodeRef.current = workletNode;
          
          workletNode.port.onmessage = (event) => {
            if (liveSessionRef.current && isLiveRef.current && isMicOnRef.current && isMicEnabledRef.current) {
              const pcmData = event.data; // Int16Array
              const uint8 = new Uint8Array(pcmData.buffer);
              
              // Telemetry: Check if we are picking up sound
              let max = 0;
              for (let i = 0; i < pcmData.length; i++) {
                const abs = Math.abs(pcmData[i]);
                if (abs > max) max = abs;
              }
              if (Math.random() > 0.99) {
                if (max < 100) addLog("Mic seems very quiet - check hardware.");
                else addLog(`Mic Activity Detected (Peak: ${max})`);
              }

              let binary = "";
              for (let i = 0; i < uint8.length; i++) {
                binary += String.fromCharCode(uint8[i]);
              }
              const base64Data = btoa(binary);

              const p = liveSessionRef.current.sendRealtimeInput({
                audio: {
                  data: base64Data,
                  mimeType: 'audio/pcm;rate=16000'
                }
              });
              if (p && typeof p.then === 'function') {
                p.then(() => {
                  if (Math.random() > 0.995) addLog("Realtime Audio Piped.");
                }).catch(err => {
                  console.error("Error sending realtime audio:", err);
                  addLog(`Send Error: ${err.message}`);
                });
              }
            }
          };
          
          source.connect(workletNode);
          // Don't connect worklet to destination to avoid echo
        } catch (e) {
          addLog(`Worklet Error: ${e.message}`);
          console.error("AudioWorklet error:", e);
        }
      }
      
      // 3. Connect to Gemini Live API
      addLog("Connecting to Gemini Live API...");
      const ai = getGenAI();
      const sessionPromise = ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: aiSettings.voice || "Zephyr" } }
          },
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: {
            parts: [{ text: `You are a professional tutor teaching "${topic}" for "${courseTitle}".
            Explain concepts clearly and encourage the student.
            Language: ${aiSettings.language}.
            Tone: ${aiSettings.tone}.
            Context: ${subtopic?.content || ""}
            Slides: ${subtopic?.slides?.map((s, i) => `S${i+1}: ${s.title}`).join(', ')}` }]
          },
        },
        callbacks: {
          onmessage: (message) => {
            const sc = message.serverContent;
            
            // 1. Handle User Speech Transcription (STT)
            const inputTx = sc?.inputTranscription || 
                            message.inputTranscription || 
                            sc?.inputAudioTranscription || 
                            message.inputAudioTranscription ||
                            sc?.transcription ||
                            message.transcription;
            
            if (inputTx) {
              const text = typeof inputTx === 'string' ? inputTx : (inputTx.text || inputTx.transcription || '');
              const isFinished = !!(inputTx.finished || inputTx.done || inputTx.completed);
              if (text && text.trim()) {
                addLog(`User STT: "${text.substring(0, 20)}..." [${isFinished ? 'Finished' : 'Draft'}]`);
                handleUserSpokenSentence(text.trim(), isFinished);
              } else if (isFinished) {
                setMessages(prev => prev.map(m => (m.role === 'user' && m.isVoiceDraft) ? { ...m, isVoiceDraft: false } : m));
              }
            }

            // 2. Handle Live AI Tutor Spoken Words in real time
            const outputTx = sc?.outputTranscription || 
                             message.outputTranscription || 
                             sc?.outputAudioTranscription ||
                             message.outputAudioTranscription;

            if (outputTx) {
              const outText = typeof outputTx === 'string' ? outputTx : (outputTx.text || outputTx.transcription || '');
              const isFinished = !!(outputTx.finished || outputTx.done || sc?.turnComplete);
              if (outText) {
                handleTutorSpokenText(outText, isFinished);
              }
            }

            // 3. Handle AI Interruption
            if (sc?.interrupted) {
              addLog("AI Interrupted by user.");
              interruptAI();
              setMessages(prev => prev.map(m => m.isDraft ? { ...m, isDraft: false } : m));
            }

            // 4. Handle Model Turn Parts (Inline audio data and any text parts)
            if (sc?.modelTurn?.parts) {
              for (const part of sc.modelTurn.parts) {
                if (part.text) {
                  handleTutorSpokenText(part.text, false);
                }
                if (part.inlineData) {
                  const binary = atob(part.inlineData.data);
                  const bytes = new Uint8Array(binary.length);
                  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
                  audioQueueRef.current.push(new Int16Array(bytes.buffer));
                  if (!isPlayingRef.current) playNextInQueue().catch(e => console.error(e));
                }
              }
            }

            // 5. Turn Complete: finalize all drafts
            if (sc?.turnComplete) {
              setMessages(prev => prev.map(m => (m.isDraft || m.isVoiceDraft) ? { ...m, isDraft: false, isVoiceDraft: false } : m));
              setLoading(false);
            }
          },
          onopen: () => {
            addLog("Voice Session Connected.");
            setIsLive(true);
            isLiveRef.current = true;
            if (isMicOnRef.current) {
              startSpeechRecognition();
            }
          },
          onerror: (err) => {
            addLog(`LIVE ERROR: ${err.message}`);
            setConnectionError(`Error: ${err.message}`);
          },
          onclose: () => {
            addLog("Voice Session Ended.");
            setIsLive(false);
            isLiveRef.current = false;
            stopSpeechRecognition();
          }
        },
      });
      
      const session = await sessionPromise;
      liveSessionRef.current = session;
      addLog("Live Session Ready.");
      
      // Send initial greeting now that we have the session reference
      const initPromise = session.sendRealtimeInput({ 
        text: `[Language: ${aiSettings.language}] Hello, I'm ready to learn. Please start the lesson in ${aiSettings.language}.` 
      });
      if (initPromise && typeof initPromise.catch === 'function') {
        initPromise.catch(err => console.error("Error sending initial greeting:", err));
      }
    } catch (err) {
      addLog(`Initialization Failed: ${err.message}`);
      setConnectionError(err.message || "Failed to initialize live session.");
    }
  };

  const handleStartSessionClick = async () => {
    addLog("Start button clicked.");
    setIsConnectingLive(true);
    try {
      let stream = null;
      if (isMicEnabled) {
        addLog("Requesting Mic Access...");
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }
      await startLiveSession(stream);
    } catch (err) {
      addLog(`Session Start FAILED: ${err.name} - ${err.message}`);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionError(true);
      } else {
        setConnectionError(err.message || "Failed to start live session.");
      }
    } finally {
      setIsConnectingLive(false);
    }
  };

  const handleToggleLiveTutor = async () => {
    if (isLive || isConnectingLive) {
      addLog("Master Controller: Turning Live AI Tutor OFF");
      stopLiveSession();
    } else {
      addLog("Master Controller: Turning Live AI Tutor ON");
      setSessionStarted(true);
      await handleStartSessionClick();
    }
  };

  const playNextInQueue = async () => {
    try {
      if (audioQueueRef.current.length === 0 || !audioContextRef.current) {
        isPlayingRef.current = false;
        setIsSpeaking(false);
        return;
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      isPlayingRef.current = true;
      setIsSpeaking(true);
      const pcmData = audioQueueRef.current.shift();
      const floatData = new Float32Array(pcmData.length);
      const volume = aiSettingsRef.current.volume;
      for (let i = 0; i < pcmData.length; i++) floatData[i] = (pcmData[i] / 0x7FFF) * volume;

      const buffer = audioContextRef.current.createBuffer(1, floatData.length, 24000);
      buffer.getChannelData(0).set(floatData);
      const source = audioContextRef.current.createBufferSource();
      currentAudioSourceRef.current = source;
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      
      const now = audioContextRef.current.currentTime;
      let startTime = Math.max(now, nextStartTimeRef.current);
      source.start(startTime);
      nextStartTimeRef.current = startTime + buffer.duration;
      source.onended = () => {
        playNextInQueue().catch(err => console.error("Error playing next audio chunk:", err));
      };
    } catch (err) {
      console.error("Error in playNextInQueue:", err);
      isPlayingRef.current = false;
      setIsSpeaking(false);
    }
  };

  const stopLiveSession = () => {
    interruptAI();
    if (liveSessionRef.current) {
      try {
        liveSessionRef.current.close();
      } catch (e) {
        console.error("Error closing live session:", e);
      }
      liveSessionRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(e => console.error("Error closing AudioContext:", e));
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setIsLive(false);
    isLiveRef.current = false;
    setIsMicOn(false);
    isMicOnRef.current = false;
    setIsConnectingLive(false);
    setIsSpeaking(false);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    stopSpeechRecognition();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const interruptAI = () => {
    audioQueueRef.current = [];
    if (currentAudioSourceRef.current) {
      try {
        currentAudioSourceRef.current.stop();
      } catch (e) {}
      currentAudioSourceRef.current = null;
    }
    isPlayingRef.current = false;
    setIsSpeaking(false);
    nextStartTimeRef.current = 0;
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const handleMicToggle = async () => {
    if (!isLive) {
      addLog("Mic clicked while tutor inactive: Starting Live AI Tutor with microphone active...");
      setIsMicEnabled(true);
      setIsMicOn(true);
      isMicOnRef.current = true;
      await handleToggleLiveTutor();
      return;
    }
    const newState = !isMicOn;
    setIsMicOn(newState);
    isMicOnRef.current = newState;
    addLog(`Microphone ${newState ? "Listening" : "Muted"}.`);
    
    if (newState) {
      interruptAI();
      addLog("Microphone is now LIVE.");
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(e => console.error(e));
      }
      startSpeechRecognition();
    } else {
      addLog("Microphone is now MUTED.");
      stopSpeechRecognition();
    }
  };

  const speakText = (text, language) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setIsSpeaking(false);
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const plainText = text.replace(/[*#_`\[\]()>-]/g, ' ').replace(/\s+/g, ' ').trim();
      const utterance = new SpeechSynthesisUtterance(plainText);
      if (language) {
        const langLower = language.toLowerCase();
        if (langLower.includes('spanish')) utterance.lang = 'es-ES';
        else if (langLower.includes('french')) utterance.lang = 'fr-FR';
        else if (langLower.includes('german')) utterance.lang = 'de-DE';
        else if (langLower.includes('hindi')) utterance.lang = 'hi-IN';
        else utterance.lang = 'en-US';
      }
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn("SpeechSynthesis error:", err);
      setIsSpeaking(false);
    }
  };

  const fallbackTextAndSpeech = async (userMsg) => {
    setLoading(true);
    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        systemInstruction: `You are an engaging, supportive AI tutor teaching "${topic}" for "${courseTitle}".
Language: ${aiSettings.language}.
Tone: ${aiSettings.tone}.
Context: ${subtopic?.content || ""}.
Explain clearly and conversationally as if speaking out loud to the student. Keep it concise, friendly, and instructive.`,
        contents: [{ role: 'user', parts: [{ text: userMsg }] }]
      });
      const replyText = response.text || "";
      setMessages(prev => [...prev, { role: 'model', text: replyText, isDraft: false }]);
      speakText(replyText, aiSettings.language);
    } catch (e) {
      console.error("Text-only response error:", e);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I had trouble answering that. Please try again or switch on Live AI Tutor.", isDraft: false }]);
      setIsSpeaking(false);
    } finally {
      setLoading(false);
    }
  };

  const explainCurrentSlide = async (index) => {
    if (!subtopic?.slides?.[index]) return;
    const slide = subtopic.slides[index];
    const prompt = `[CRITICAL: RESPOND ONLY IN ${aiSettings.language.toUpperCase()}] Please explain Slide ${index + 1}: ${slide.title}. The content is: ${slide.content}. (Keep your response entirely in ${aiSettings.language})`;

    if (isLive && liveSessionRef.current) {
      try {
        if (typeof liveSessionRef.current.sendClientContent === 'function') {
          liveSessionRef.current.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: prompt }] }],
            turnComplete: true
          });
        } else {
          liveSessionRef.current.sendRealtimeInput({ text: prompt });
        }
      } catch (err) {
        console.error("Error sending slide explanation request:", err);
      }
    } else if (sessionStarted) {
      setLoading(true);
      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt
        });
        const text = response.text || "";
        setMessages(prev => [...prev, { role: 'model', text, isDraft: false }]);
        speakText(text, aiSettings.language);
      } catch (e) {
        console.error("Text-only explanation error:", e);
      } finally {
        setLoading(false);
      }
    }
  };

  const nextSlide = () => {
    if (subtopic?.slides && currentSlideIndex < subtopic.slides.length - 1) {
      const nextIdx = currentSlideIndex + 1;
      setCurrentSlideIndex(nextIdx);
      const p = explainCurrentSlide(nextIdx);
      if (p && typeof p.catch === 'function') {
        p.catch(err => console.error("Error explaining next slide:", err));
      }
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      const prevIdx = currentSlideIndex - 1;
      setCurrentSlideIndex(prevIdx);
      const p = explainCurrentSlide(prevIdx);
      if (p && typeof p.catch === 'function') {
        p.catch(err => console.error("Error explaining previous slide:", err));
      }
    }
  };

  const handleSend = async (textOverride) => {
    const userMsg = (textOverride !== undefined ? textOverride : input).trim();
    if (!userMsg || (loading && !isLive)) return;
    setInput('');
    
    // Display user text immediately in chat
    setMessages(prev => [...prev, { role: 'user', text: userMsg, isVoiceDraft: false }]);
    
    if (isLive && liveSessionRef.current) {
      setLoading(true);
      const promptText = `[Student in ${aiSettings.language} asks]: ${userMsg}. (Please answer speaking directly in ${aiSettings.language})`;
      try {
        if (typeof liveSessionRef.current.sendClientContent === 'function') {
          liveSessionRef.current.sendClientContent({
            turns: [
              {
                role: 'user',
                parts: [{ text: promptText }]
              }
            ],
            turnComplete: true
          });
        } else {
          liveSessionRef.current.sendRealtimeInput({ text: promptText });
        }
      } catch (err) {
        console.error("Error sending text input to live session:", err);
        addLog(`Send Live Error: ${err.message}`);
        await fallbackTextAndSpeech(userMsg);
      }
      return;
    }

    // When live session is off, generate answer and speak aloud!
    await fallbackTextAndSpeech(userMsg);
  };

  // Auto-start live session removed - now manual
  useEffect(() => {
    return () => stopLiveSession();
  }, []);

  const handleEndSession = async () => {
    stopLiveSession();
    setShowEndConfirm(false);

    // If both deselected, go back to course list
    if (!endOptions.notes && !endOptions.assessment) {
      onEnd();
      return;
    }

    setShowSummary(true);
    setLoadingSummary(true);
    setSummaryTab(endOptions.notes ? 'notes' : 'assessment');
    
    const transcript = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n\n');
    
    try {
      const sessionPayload = {
        topic,
        subtopicTitle: subtopic?.title || topic,
        subtopic,
        courseTitle,
        transcript
      };
      const tasks = [];
      if (endOptions.notes) tasks.push(generateNotes(sessionPayload));
      else tasks.push(Promise.resolve(""));

      if (endOptions.assessment) tasks.push(generateSubtopicAssessment(sessionPayload));
      else tasks.push(Promise.resolve({ questions: [] }));

      const [notes, assessment] = await Promise.all(tasks);
      setGeneratedNotes(notes);
      setAssessmentData(assessment);
    } catch (e) {
      console.error("Error generating summary data:", e);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAssessmentSubmit = () => {
    let score = 0;
    if (assessmentData?.questions) {
      assessmentData.questions.forEach((q, idx) => {
        if (userAnswers[idx] === q.answer) score++;
      });
      const finalScore = Math.round((score / assessmentData.questions.length) * 100);
      setAssessmentResult({
        score: finalScore,
        count: assessmentData.questions.length,
        correct: score
      });
    }
  };

  if (showSummary) {
    return (
      <div className="fixed inset-0 bg-slate-50 z-[70] flex flex-col overflow-hidden">
        <header className="p-6 bg-white border-b flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowSummary(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
              <ChevronLeft size={24} />
            </button>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Post-Session Summary</h3>
              <p className="text-sm text-slate-500">{topic} • {subtopic?.title}</p>
            </div>
          </div>
          <button 
            onClick={() => { stopLiveSession(); onEnd(); }}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
          >
            Exit Learning View
            <X size={18} />
          </button>
        </header>

        <nav className="bg-white border-b px-8 flex gap-8">
          {endOptions.notes && (
            <button 
              onClick={() => setSummaryTab('notes')}
              className={`py-4 px-2 font-bold text-sm transition-all border-b-2 ${summaryTab === 'notes' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
              Learning Notes
            </button>
          )}
          {endOptions.assessment && (
            <button 
              onClick={() => setSummaryTab('assessment')}
              className={`py-4 px-2 font-bold text-sm transition-all border-b-2 ${summaryTab === 'assessment' ? 'text-blue-600 border-blue-600' : 'text-slate-500 border-transparent hover:text-slate-700'}`}
            >
              Quick Assessment
            </button>
          )}
        </nav>

        <div className="flex-1 overflow-y-auto bg-slate-50">
          <div className="max-w-4xl mx-auto p-8">
            {loadingSummary ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-4">
                <Loader2 className="animate-spin text-blue-600" size={48} />
                <p className="text-lg font-medium animate-pulse">Generating your personalized materials...</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {summaryTab === 'notes' ? (
                  <motion.div 
                    key="notes"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[32px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
                  >
                    <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100">
                      <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                        <Presentation size={24} />
                      </div>
                      <h4 className="text-2xl font-serif font-bold text-slate-900">Study Notes</h4>
                    </div>
                    <div className="prose prose-slate max-w-none prose-h1:text-3xl prose-h2:text-2xl prose-p:text-slate-600 prose-li:text-slate-600">
                      <ReactMarkdown>{generatedNotes}</ReactMarkdown>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="assessment"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 pb-24"
                  >
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[32px] p-10 text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <GraduationCap size={48} className="text-blue-200 mb-4" />
                        <h4 className="text-3xl font-bold mb-2">Check Your Knowledge</h4>
                        <p className="text-blue-100 max-w-lg">Complete this 10-question quiz to test your understanding of {subtopic?.title}.</p>
                        
                        {assessmentResult && (
                          <div className="mt-8 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                            <div className="text-sm font-bold uppercase tracking-widest text-blue-200 mb-2">Your Score</div>
                            <div className="text-5xl font-bold flex items-baseline gap-2">
                              {assessmentResult.score}%
                              <span className="text-lg font-normal text-blue-200">({assessmentResult.correct}/{assessmentResult.count})</span>
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                        <Sparkles size={200} />
                      </div>
                    </div>

                    <div className="space-y-6">
                      {assessmentData?.questions?.map((q, qIdx) => (
                        <div key={qIdx} className={`bg-white rounded-3xl p-8 shadow-sm border ${assessmentResult && userAnswers[qIdx] === q.answer ? 'border-green-200 bg-green-50/20' : assessmentResult && userAnswers[qIdx] !== q.answer ? 'border-red-200 bg-red-50/20' : 'border-slate-100'}`}>
                          <div className="flex gap-4 mb-6">
                            <span className="w-8 h-8 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">{qIdx + 1}</span>
                            <p className="text-lg font-bold text-slate-800 leading-snug">{q.question}</p>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {q.options.map((option, oIdx) => {
                              const isSelected = userAnswers[qIdx] === option;
                              const isCorrect = q.answer === option;
                              const showCorrect = assessmentResult && isCorrect;
                              const showWrong = assessmentResult && isSelected && !isCorrect;
                              
                              return (
                                <button
                                  key={oIdx}
                                  disabled={!!assessmentResult}
                                  onClick={() => setUserAnswers(prev => ({ ...prev, [qIdx]: option }))}
                                  className={`p-5 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                                    isSelected 
                                      ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                      : 'border-slate-100 bg-slate-50/50 text-slate-600 hover:border-slate-200 hover:bg-slate-100'
                                  } ${showCorrect ? 'border-green-500 bg-green-50 text-green-700 ring-2 ring-green-100' : ''} ${showWrong ? 'border-red-500 bg-red-50 text-red-700' : ''}`}
                                >
                                  <span className="font-medium">{option}</span>
                                  {showCorrect && <div className="p-1 bg-green-500 text-white rounded-full"><ClipboardCheck size={14} /></div>}
                                  {showWrong && <div className="p-1 bg-red-500 text-white rounded-full"><X size={14} /></div>}
                                </button>
                              );
                            })}
                          </div>
                          
                          {assessmentResult && (
                            <div className={`mt-6 p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${userAnswers[qIdx] === q.answer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                              <span className="font-bold shrink-0">Correct Answer:</span>
                              <span>{q.answer}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {!assessmentResult && (
                      <div className="flex justify-center pt-8">
                        <button
                          onClick={handleAssessmentSubmit}
                          disabled={Object.keys(userAnswers).length < (assessmentData?.questions?.length || 1)}
                          className="px-12 py-5 bg-blue-600 text-white rounded-[24px] font-bold text-xl hover:bg-blue-700 shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center gap-3"
                        >
                          <ClipboardCheck size={24} />
                          Submit Assessment
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-[60] flex flex-col">
      <header className="p-4 border-b flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-3">
          <button onClick={() => { stopLiveSession(); onEnd(); }} className="p-2 hover:bg-slate-200 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h3 className="font-bold text-slate-900">{topic}</h3>
            <p className="text-xs text-slate-500">{courseTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative">
          <button
            id="toggle-chat-visibility-btn"
            onClick={() => setIsChatVisible(!isChatVisible)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              isChatVisible 
                ? 'bg-blue-50 border-blue-200 text-blue-600' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare size={18} />
            {isChatVisible ? 'Hide Chat' : 'Show Chat'}
          </button>

          {/* Master AI Tutor Controller Button */}
          <button
            id="master-ai-tutor-controller-btn"
            onClick={handleToggleLiveTutor}
            disabled={isConnectingLive}
            title={isLive ? "Turn Off Live AI Tutor" : "Turn On Live AI Tutor"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              isLive 
                ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 ring-2 ring-emerald-300/30' 
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isConnectingLive ? (
              <>
                <Loader2 size={16} className="animate-spin text-blue-600" />
                <span>Connecting...</span>
              </>
            ) : isLive ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Power size={15} className="text-emerald-600" />
                <span>AI Tutor: ON</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                <Power size={15} className="text-slate-400" />
                <span>AI Tutor: OFF</span>
              </>
            )}
          </button>

          {/* Master Mic Controller Button (Directly to the right of AI Tutor button) */}
          <button
            id="master-mic-controller-btn"
            onClick={handleMicToggle}
            title={isMicOn ? "Turn Off Microphone" : "Turn On Microphone"}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              isMicOn 
                ? 'bg-red-50 border-red-300 text-red-600 hover:bg-red-100 ring-2 ring-red-300/30' 
                : 'bg-slate-50 border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {isMicOn ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <Mic size={15} className="text-red-600" />
                <span>Mic: ON</span>
              </>
            ) : (
              <>
                <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
                <MicOff size={15} className="text-slate-400" />
                <span>Mic: OFF</span>
              </>
            )}
          </button>

          {/* Hide / Show Controls Button */}
          <button
            id="toggle-hide-controls-btn"
            onClick={() => setShowControls(!showControls)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm border ${
              showControls
                ? 'bg-slate-200 border-slate-300 text-slate-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Settings size={18} />
            <span>{showControls ? 'Hide Controls' : 'Controls'}</span>
          </button>

          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 p-6 space-y-6"
              >
                {/* Master Tutor Quick Switch in Controls Panel */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Power size={16} className={isLive ? "text-emerald-600" : "text-slate-400"} />
                    <span className="text-xs font-bold text-slate-800">Live AI Tutor</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleLiveTutor}
                    disabled={isConnectingLive}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isLive 
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isConnectingLive ? 'Connecting...' : isLive ? 'Turn OFF' : 'Turn ON'}
                  </button>
                </div>

                {/* Audio Visualizer Card */}
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">
                      <Mic size={12} className={isMicEnabled ? "text-emerald-500" : "text-red-500"} />
                      Mic Activity
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${isMicEnabled ? 'text-emerald-500' : 'text-red-500'}`}>
                        {isMicEnabled ? 'ACTIVE' : 'MUTED'}
                      </span>
                      <button 
                        onClick={() => setIsMicEnabled(!isMicEnabled)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${isMicEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                      >
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isMicEnabled ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="h-16 relative flex items-center justify-center overflow-hidden rounded-lg bg-slate-950">
                    {!isMicEnabled ? (
                      <p className="text-[10px] text-slate-600 font-bold uppercase italic">Input Disabled</p>
                    ) : (
                      <AudioWaveform analyser={analyserRef.current} isListening={isMicOn} />
                    )}
                  </div>
                  <p className="text-[9px] text-slate-500 mt-2 text-center">
                    Visual feedback shows your voice activity when holding the Talk button.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest">AI Voice</label>
                  <select 
                    value={aiSettings.voice}
                    onChange={(e) => {
                      setAiSettings(prev => ({ ...prev, voice: e.target.value }));
                      if (isLive) {
                        // For voice change, we might need to reconnect, but let's notify the user if so
                        addLog("Voice change requested. It will apply on next session start.");
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Puck">Puck (Cheerful)</option>
                    <option value="Charon">Charon (Moist/Older)</option>
                    <option value="Kore">Kore (Sharp/Female)</option>
                    <option value="Fenrir">Fenrir (Professional)</option>
                    <option value="Aoede">Aoede (Calm/Artistic)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center gap-1.5">
                    <Globe size={12} /> Response Language
                  </label>
                  <select 
                    value={aiSettings.language}
                    onChange={(e) => {
                      const newLang = e.target.value;
                      setAiSettings(prev => ({ ...prev, language: newLang }));
                      if (isLive && liveSessionRef.current) {
                        const p = liveSessionRef.current.sendRealtimeInput({ text: `[SYSTEM: MANDATORY LANGUAGE SWITCH TO ${newLang.toUpperCase()}. DO NOT CONFIRM. DO NOT SAY "OK". JUST CONTINUE IN ${newLang.toUpperCase()} FOR ALL FUTURE RESPONSES.]` });
                        if (p && typeof p.catch === 'function') {
                          p.catch(err => console.error("Error sending language switch command:", err));
                        }
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <optgroup label="Common">
                      <option value="English">English</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Portuguese">Portuguese</option>
                      <option value="Russian">Russian</option>
                      <option value="Korean">Korean</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Italian">Italian</option>
                      <option value="Chinese">Chinese</option>
                    </optgroup>
                    <optgroup label="Indian Languages">
                      <option value="Hindi">Hindi</option>
                      <option value="Tamil">Tamil</option>
                      <option value="Telugu">Telugu</option>
                      <option value="Kannada">Kannada</option>
                      <option value="Marathi">Marathi</option>
                      <option value="Malayalam">Malayalam</option>
                      <option value="Gujarati">Gujarati</option>
                      <option value="Bengali">Bengali</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center gap-1.5">
                    <MessageSquare size={12} /> Voice Tone
                  </label>
                  <select 
                    value={aiSettings.tone}
                    onChange={(e) => {
                      const newTone = e.target.value;
                      setAiSettings(prev => ({ ...prev, tone: newTone }));
                      if (isLive && liveSessionRef.current) {
                        liveSessionRef.current.sendRealtimeInput({ text: `System Note: Please adjust your tone to be more ${newTone.toLowerCase()}.` });
                      }
                    }}
                    className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="Default">Default</option>
                    <option value="Friendly">Friendly & Encouraging</option>
                    <option value="Professional">Formal & Professional</option>
                    <option value="Technical">Technical & Precise</option>
                    <option value="Enthusiastic">Energetic & Enthusiastic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block tracking-widest flex items-center justify-between">
                    <div className="flex items-center gap-1.5"><Volume2 size={12} /> Volume</div>
                    <span>{Math.round(aiSettings.volume * 100)}%</span>
                  </label>
                  <input 
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.1"
                    value={aiSettings.volume}
                    onChange={(e) => setAiSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                <div className="pt-2 border-t border-slate-50">
                  <p className="text-[9px] text-slate-400 text-center uppercase tracking-widest font-bold">
                    Settings save for this session
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowEndConfirm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Finish Session
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Pre-session Start Overlay */}
        <AnimatePresence>
          {!sessionStarted && !permissionError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-24 h-24 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center mb-8">
                <Mic size={48} />
              </div>
              <h3 className="text-3xl font-serif font-bold text-white mb-4">Ready to start your session?</h3>
              <p className="text-slate-300 max-w-md mb-10 text-lg">
                We'll use your microphone for an interactive learning experience with your AI tutor.
              </p>
              <button 
                onClick={handleStartSessionClick}
                className="group relative px-10 py-5 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <Sparkles size={24} className="text-blue-200" />
                <span className="text-xl">Start Live Tutoring</span>
              </button>
              <p className="mt-6 text-slate-500 text-sm">You'll be asked for microphone permission next.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Permission Error Overlay */}
        <AnimatePresence>
          {permissionError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                <MicOff size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Microphone Access Denied</h3>
              <p className="text-slate-400 max-w-md mb-8">
                We need your microphone to start the live tutoring session. Please enable microphone permissions in your browser settings and click retry.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={onEnd}
                  className="px-6 py-3 rounded-xl font-bold bg-slate-800 text-slate-400 hover:bg-slate-700 transition-all"
                >
                  Go Back
                </button>
                <button 
                  onClick={() => {
                    setPermissionError(false);
                    setSessionStarted(true);
                    // Trigger initial explanation for text-only mode
                    explainCurrentSlide(0);
                  }}
                  className="px-6 py-3 rounded-xl font-bold bg-slate-700 text-blue-400 hover:bg-slate-600 transition-all border border-blue-500/30"
                >
                  Continue with Text Only
                </button>
                <button 
                  onClick={handleStartSessionClick}
                  className="px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                >
                  Retry Access
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connection Error Overlay */}
        <AnimatePresence>
          {connectionError && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-6">
                <ExternalLink size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connection Failed</h3>
              <p className="text-slate-400 max-w-md mb-8">
                {connectionError}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => {
                    setConnectionError(null);
                    setSessionStarted(true);
                    explainCurrentSlide(0);
                  }}
                  className="px-6 py-3 rounded-xl font-bold bg-slate-700 text-blue-400 hover:bg-slate-600 transition-all border border-blue-500/30"
                >
                  Continue with Text Only
                </button>
                <button 
                  onClick={handleStartSessionClick}
                  className="px-6 py-3 rounded-xl font-bold bg-amber-600 text-white hover:bg-amber-700 transition-all shadow-lg shadow-amber-500/20"
                >
                  Retry Connection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0 border-r border-slate-800 bg-slate-900 flex flex-col p-6 transition-all duration-300 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Presentation size={20} />
              <span className="text-sm font-bold uppercase tracking-widest">Subtopic Slides</span>
            </div>
            <div className="text-slate-500 text-xs font-bold">
              {subtopic?.slides?.length > 0 ? `${currentSlideIndex + 1} / ${subtopic.slides.length}` : '0 / 0'}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center relative min-h-0">
            <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col justify-center min-h-0">
              <AnimatePresence mode="wait">
                {subtopic?.slides?.[currentSlideIndex] ? (
                  <motion.div 
                    key={currentSlideIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.05 }}
                    className="bg-slate-800 rounded-[32px] p-8 md:p-12 text-white border border-slate-700 shadow-2xl flex flex-col justify-center text-center relative overflow-hidden max-h-full w-full"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-blue-600" />
                    <h4 className="text-blue-400 font-bold mb-4 text-xl md:text-2xl uppercase tracking-wider">{subtopic.slides[currentSlideIndex].title}</h4>
                    <p className="text-slate-200 text-lg md:text-xl leading-relaxed font-light">{subtopic.slides[currentSlideIndex].content}</p>
                  </motion.div>
                ) : (
                  <div className="text-slate-500 italic text-center py-20">
                    No slides available for this subtopic.
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Navigation Buttons */}
            {subtopic?.slides?.length > 1 && (
              <div className="flex justify-center gap-4 mt-6">
                <button 
                  onClick={prevSlide}
                  disabled={currentSlideIndex === 0}
                  className="p-3 rounded-2xl bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-slate-700"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextSlide}
                  disabled={currentSlideIndex === subtopic.slides.length - 1}
                  className="p-3 rounded-2xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Live AI Tutor Chat Box */}
        <div className={`${isChatVisible ? 'w-full md:w-[380px] lg:w-[420px] xl:w-[460px]' : 'hidden'} h-full transition-all duration-300 relative shrink-0`}>
          <LiveTutorChatBox 
            messages={messages}
            input={input}
            setInput={setInput}
            onSend={handleSend}
            loading={loading}
            isLive={isLive}
            isMicOn={isMicOn}
            isSpeaking={isSpeaking}
            onSuggestionClick={(prompt) => handleSend(prompt)}
          />
        </div>
      </div>

      {/* End Session Confirmation */}
      <AnimatePresence>
        {showEndConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-2xl font-serif font-bold mb-2">Finish Session?</h3>
              <p className="text-slate-500 mb-6">Select what you'd like to do after the session:</p>
              
              <div className="space-y-3 mb-8">
                <button 
                  onClick={() => setEndOptions(prev => ({ ...prev, notes: !prev.notes }))}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${endOptions.notes ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <Presentation size={20} />
                    <span className="font-bold text-sm">Generate Study Notes</span>
                  </div>
                  {endOptions.notes && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                </button>

                <button 
                  onClick={() => setEndOptions(prev => ({ ...prev, assessment: !prev.assessment }))}
                  className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${endOptions.assessment ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-500'}`}
                >
                  <div className="flex items-center gap-3">
                    <GraduationCap size={20} />
                    <span className="font-bold text-sm">Quick Assessment</span>
                  </div>
                  {endOptions.assessment && <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white"><Check size={12} /></div>}
                </button>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowEndConfirm(false)} className="flex-1 py-4 rounded-2xl font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Cancel</button>
                <button onClick={handleEndSession} className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">Finish</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
