import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut } from 'firebase/auth';
import { GraduationCap, LogIn, Loader2, AlertCircle, ExternalLink, RefreshCw, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Layout from './components/Layout';
import { getDoc, doc } from 'firebase/firestore';

import Dashboard from './components/Dashboard';
import CourseCreator from './components/CourseCreator';
import CourseView from './components/CourseView';
import PostSession from './components/PostSession';
import Progress from './components/Progress';
import Profile from './components/Profile';
import ProjectDashboard from './components/ProjectDashboard';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="text-center space-y-4">
      <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
      <p className="text-slate-400 font-medium animate-pulse">Loading experience...</p>
    </div>
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreator, setShowCreator] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [postSessionData, setPostSessionData] = useState(null);

  const handleRetake = async (courseId) => {
    try {
      const courseDoc = await getDoc(doc(db, 'courses', courseId));
      if (courseDoc.exists()) {
        setSelectedCourse({ id: courseId, ...courseDoc.data() });
      }
    } catch (error) {
      console.error("Error fetching course for retake:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isGuestLoggingIn, setIsGuestLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const isLoggingInRef = useRef(false);

  const handleLogin = async () => {
    if (isLoggingInRef.current) {
      console.warn("Sign-in already in progress, ignoring extra click.");
      return;
    }
    isLoggingInRef.current = true;
    setIsLoggingIn(true);
    setLoginError(null);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      const code = error?.code || '';
      const message = error?.message || '';

      if (code === 'auth/popup-closed-by-user') {
        console.log("Sign-in popup closed by user.");
      } else if (code === 'auth/cancelled-popup-request') {
        console.log("Concurrent popup request was cancelled.");
      } else if (code === 'auth/popup-blocked') {
        console.warn("Google sign-in popup was blocked by browser:", error);
        setLoginError({
          code: 'popup-blocked',
          title: 'Sign-in popup blocked',
          message: 'Your browser or iframe preview blocked the sign-in popup. Please click "Allow Popups" or open this app directly in a new tab.'
        });
      } else if (message.includes('Pending promise was never set')) {
        console.warn("Firebase Auth internal assertion caught:", message);
        setLoginError({
          code: 'assertion-error',
          title: 'Sign-in attempt interrupted',
          message: 'The sign-in popup was closed or interrupted. Please try again.'
        });
      } else {
        console.error("Login failed:", error);
        setLoginError({
          code: code || 'unknown',
          title: 'Sign-in failed',
          message: message || 'Could not complete Google sign-in. Please try again or continue as guest.'
        });
      }
    } finally {
      isLoggingInRef.current = false;
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = async () => {
    if (isLoggingInRef.current) return;
    isLoggingInRef.current = true;
    setIsGuestLoggingIn(true);
    setLoginError(null);

    try {
      await signInAnonymously(auth);
    } catch (error) {
      console.error("Guest login failed:", error);
      setLoginError({
        code: error?.code || 'guest-error',
        title: 'Guest sign-in unavailable',
        message: 'Guest sign-in is not enabled. Please sign in with Google or open the app in a new tab.'
      });
    } finally {
      isLoggingInRef.current = false;
      setIsGuestLoggingIn(false);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen atmosphere-bg flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-7"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
              <GraduationCap size={40} />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight">AI Learning Companion</h1>
            <p className="text-slate-500 text-base sm:text-lg leading-relaxed">
              Your personal AI tutor that turns any material into a structured, interactive classroom experience.
            </p>
          </div>

          {loginError && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-amber-900 text-sm space-y-3 shadow-xs"
            >
              <div className="flex items-start gap-2.5">
                <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950 text-sm">{loginError.title}</p>
                  <p className="text-amber-850 text-xs leading-relaxed">{loginError.message}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1 pl-7">
                <button
                  type="button"
                  onClick={() => {
                    setLoginError(null);
                    handleLogin();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Retry Sign In
                </button>
                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="px-3 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink size={12} />
                  Open in New Tab
                </button>
              </div>
            </motion.div>
          )}

          <div className="space-y-3 pt-2">
            <button
              id="google-signin-btn"
              onClick={handleLogin}
              disabled={isLoggingIn || isGuestLoggingIn}
              className={`w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-6 py-4 rounded-2xl font-bold transition-all shadow-sm group ${
                isLoggingIn || isGuestLoggingIn 
                  ? 'opacity-70 cursor-not-allowed bg-slate-50' 
                  : 'hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]'
              }`}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 size={20} className="animate-spin text-blue-600" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <LogIn size={20} className="text-blue-600 group-hover:translate-x-0.5 transition-transform" />
                  <span>Sign in with Google to Start Learning</span>
                </>
              )}
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-[#f8fafc] px-3 text-[11px] uppercase tracking-wider text-slate-400 font-semibold absolute">
                or
              </span>
            </div>

            <button
              id="guest-signin-btn"
              onClick={handleGuestLogin}
              disabled={isLoggingIn || isGuestLoggingIn}
              className={`w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold py-3 px-4 rounded-xl transition-colors border border-transparent hover:border-slate-200 hover:bg-slate-50 ${
                isLoggingIn || isGuestLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isGuestLoggingIn ? (
                <>
                  <Loader2 size={16} className="animate-spin text-slate-500" />
                  <span>Signing in as guest...</span>
                </>
              ) : (
                <>
                  <UserCheck size={16} className="text-slate-500" />
                  <span>Continue as Guest Student</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (postSessionData) {
    return (
      <PostSession 
        topic={postSessionData.topic}
        subtopic={postSessionData.subtopic}
        subtopicTitle={postSessionData.subtopicTitle || postSessionData.subtopic?.title || postSessionData.topic}
        courseTitle={postSessionData.courseTitle}
        transcript={postSessionData.transcript}
        onBack={() => setPostSessionData(null)}
      />
    );
  }

  if (selectedCourse) {
    return (
      <CourseView 
        course={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
        onSessionEnd={(data) => setPostSessionData(data)}
      />
    );
  }

  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setShowCreator(false);
      }} 
      onCreateNew={() => setShowCreator(true)}
    >
      <AnimatePresence mode="wait">
        {showCreator ? (
          <motion.div
            key="creator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CourseCreator onComplete={() => setShowCreator(false)} />
          </motion.div>
        ) : activeTab === 'dashboard' ? (
          <ProjectDashboard 
            startLearning={() => setActiveTab('courses')}
            onCreateCourse={() => setShowCreator(true)}
            onViewProgress={() => setActiveTab('progress')}
            onViewProfile={() => setActiveTab('profile')}
          />
        ) : activeTab === 'courses' ? (
          <Dashboard 
            onSelectCourse={(course) => setSelectedCourse(course)}
            onCreateNew={() => setShowCreator(true)}
          />
        ) : activeTab === 'progress' ? (
          <Progress onRetake={handleRetake} />
        ) : activeTab === 'profile' ? (
          <Profile />
        ) : (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-slate-900">Page Not Found</h2>
            <p className="text-slate-500">Please select an option from the navigation menu.</p>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
