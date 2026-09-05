import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { Send, Loader2, User, Sparkles, Volume2, Mic, CheckCircle2, Lightbulb } from 'lucide-react';

export default function LiveTutorChatBox({ 
  messages, 
  input, 
  setInput, 
  onSend, 
  loading, 
  isLive,
  isMicOn,
  isSpeaking,
  onSuggestionClick
}) {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages or incoming text stream
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const quickPrompts = [
    "Explain this slide in simple terms",
    "Give me a real-world example",
    "Quiz me on this concept"
  ];

  return (
    <div className="flex flex-col h-full bg-slate-50/70 border-l border-slate-200/80 shadow-inner relative overflow-hidden transition-all duration-300">
      {/* Chat Header */}
      <div className="px-5 py-4 border-b border-slate-200/80 bg-white/90 backdrop-blur-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800 leading-tight">Live AI Tutor Chat</h3>
            <p className="text-[11px] text-slate-500 font-medium">Real-time speech & text conversation</p>
          </div>
        </div>

        {/* Live Status Pill */}
        <div className="flex items-center gap-1.5">
          {isLive ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{isSpeaking ? 'Speaking' : isMicOn ? 'Listening' : 'Live'}</span>
              {isSpeaking && (
                <div className="flex items-center gap-0.5 ml-1">
                  <span className="w-0.5 h-2.5 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <span className="w-0.5 h-3.5 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <span className="w-0.5 h-2 bg-emerald-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Messages Feed */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-5 space-y-6 scroll-smooth"
      >
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Sparkles size={28} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-800">Your conversation starts here</h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Speak into your mic or type a message. The live AI tutor responds out loud with real-time voice and interactive text.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full max-w-xs pt-2 space-y-2">
              <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider justify-center">
                <Lightbulb size={12} />
                <span>Suggested Questions</span>
              </div>
              <div className="flex flex-col gap-1.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSuggestionClick ? onSuggestionClick(prompt) : onSend(prompt)}
                    className="w-full text-left text-xs bg-white hover:bg-blue-50/70 border border-slate-200 hover:border-blue-200 text-slate-700 hover:text-blue-700 px-3 py-2 rounded-xl transition-all shadow-xs"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.15 }}
              className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              {/* Role Header */}
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {m.role === 'user' ? (
                  <>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {m.isVoiceDraft ? 'You (Speaking...)' : 'You'}
                    </span>
                    <div className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      {m.isVoiceDraft ? <Mic size={10} className="animate-pulse" /> : <User size={10} />}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Sparkles size={10} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      AI Tutor
                    </span>
                    {m.isDraft && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-blue-500 font-semibold ml-1">
                        <Volume2 size={11} className="animate-pulse" />
                        Speaking...
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`relative max-w-[90%] sm:max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed transition-all shadow-sm ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-xs shadow-blue-600/10' 
                  : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-slate-100'
              }`}>
                {/* Streaming pulse indicator if draft */}
                {(m.isDraft || m.isVoiceDraft) && (
                  <div className="flex items-center gap-1 mb-1.5 opacity-70">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    <span className="text-[10px] font-medium ml-1">
                      {m.role === 'user' ? 'Transcribing your voice...' : 'Generating live response...'}
                    </span>
                  </div>
                )}

                <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert prose-p:text-white' : 'text-slate-800'}`}>
                  <ReactMarkdown>{m.text || "..."}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {/* Thinking Indicator */}
        {loading && !messages.find(m => m.isDraft) && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs px-4 py-2.5 shadow-sm flex items-center gap-2.5">
              <Loader2 className="animate-spin text-blue-600" size={15} />
              <span className="text-xs font-semibold text-slate-500">Live AI Tutor is thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* User Text Input Area */}
      <div className="p-4 bg-white border-t border-slate-200/80 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
          className="flex flex-col gap-2"
        >
          <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
            <textarea
              id="tutor-chat-input-textarea"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  onSend();
                }
              }}
              placeholder="Ask a question or reply... (Enter to send)"
              className="w-full px-3 py-2 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none max-h-28 scroll-smooth"
              style={{ minHeight: '38px' }}
            />
            
            <button 
              id="tutor-chat-send-btn"
              type="submit"
              disabled={!input.trim() || (loading && !isLive)}
              title="Send message"
              className="w-9 h-9 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center shrink-0 shadow-sm shadow-blue-200"
            >
              <Send size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-500" />
              <span>Voice responses enabled</span>
            </span>
            <span>Shift+Enter for newline</span>
          </div>
        </form>
      </div>
    </div>
  );
}
