import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signInAnonymously, signOut } from 'firebase/auth';
import { GraduationCap, LogIn, Loader2, AlertCircle, ExternalLink, RefreshCw, UserCheck, X } from 'lucide-react';
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
import PresentationLandingPage from './components/PresentationLandingPage';

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
    <div className="text-center space-y-4">
      <Loader2 className="animate-spin text-blue-600 mx-auto" size={40} />
      <p className="text-slate-400 font-medium animate-pulse">Loading experience...</p>
    </div>
  </div>
);

function SignInModal({
  isOpen,
  onClose,
  handleLogin,
  handleGuestLogin,
  isLoggingIn,
  isGuestLoggingIn,
  loginError,
  setLoginError
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="max-w-md w-full bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-2xl relative space-y-6"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          title="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="text-center space-y-3 pt-1">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center text-white shadow-xl shadow-blue-200">
            <GraduationCap size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-950 tracking-tight">Sign In to AI Tutor</h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto mt-1">
              Access your personalized courses, multimodal voice tutor sessions, slide decks, and test records.
            </p>
          </div>
        </div>

        {loginError && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-left text-amber-900 text-xs space-y-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950 text-xs">{loginError.title}</p>
                <p className="text-amber-850 leading-relaxed">{loginError.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1 pl-6">
              <button
                type="button"
                onClick={() => {
                  setLoginError(null);
                  handleLogin();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors flex items-center gap-1"
              >
                <RefreshCw size={11} />
                Retry
              </button>
              <button
                type="button"
                onClick={() => window.open(window.location.href, '_blank')}
                className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-1"
              >
                <ExternalLink size={11} />
                Open in New Tab
              </button>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-1">
          <button
            id="modal-google-signin-btn"
            onClick={handleLogin}
            disabled={isLoggingIn || isGuestLoggingIn}
            className={`w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-5 py-3.5 rounded-2xl font-bold transition-all shadow-sm ${
              isLoggingIn || isGuestLoggingIn 
                ? 'opacity-70 cursor-not-allowed bg-slate-50' 
                : 'hover:bg-slate-50 hover:border-slate-300 active:scale-[0.99]'
            }`}
          >
            {isLoggingIn ? (
              <>
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <span className="text-sm">Connecting to Google...</span>
              </>
            ) : (
              <>
                <LogIn size={18} className="text-blue-600" />
                <span className="text-sm">Sign in with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center py-1">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] uppercase tracking-wider text-slate-400 font-semibold absolute">
              or
            </span>
          </div>

          <button
            id="modal-guest-signin-btn"
            onClick={handleGuestLogin}
            disabled={isLoggingIn || isGuestLoggingIn}
            className={`w-full flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 text-xs font-semibold py-2.5 px-4 rounded-xl transition-colors border border-transparent hover:border-slate-200 hover:bg-slate-50 ${
              isLoggingIn || isGuestLoggingIn ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isGuestLoggingIn ? (
              <>
                <Loader2 size={14} className="animate-spin text-slate-500" />
                <span>Signing in as guest...</span>
              </>
            ) : (
              <>
                <UserCheck size={14} className="text-slate-500" />
                <span>Continue as Guest Student</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [showSignInModal, setShowSignInModal] = useState(false);
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
      if (user && showSignInModal) {
        setShowSignInModal(false);
      }
    });
    return () => unsubscribe();
  }, [showSignInModal]);

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
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        setShowSignInModal(false);
        setCurrentView('app');
      }
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
      const result = await signInAnonymously(auth);
      if (result?.user) {
        setShowSignInModal(false);
        setCurrentView('app');
      }
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

  // 1. MAIN PRESENTATION LANDING PAGE (Default launch experience)
  if (currentView === 'landing') {
    return (
      <>
        <PresentationLandingPage 
          user={user}
          onGoToDashboard={() => {
            if (user) {
              setCurrentView('app');
              setActiveTab('dashboard');
            } else {
              setShowSignInModal(true);
            }
          }}
          onOpenSignIn={() => setShowSignInModal(true)}
          isLoggingIn={isLoggingIn}
          isGuestLoggingIn={isGuestLoggingIn}
          loginError={loginError}
          onRetryLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
        />

        <AnimatePresence>
          {showSignInModal && (
            <SignInModal 
              isOpen={showSignInModal}
              onClose={() => setShowSignInModal(false)}
              handleLogin={handleLogin}
              handleGuestLogin={handleGuestLogin}
              isLoggingIn={isLoggingIn}
              isGuestLoggingIn={isGuestLoggingIn}
              loginError={loginError}
              setLoginError={setLoginError}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // If in 'app' view but somehow user is null, bounce back to landing with modal
  if (!user) {
    return (
      <>
        <PresentationLandingPage 
          user={null}
          onGoToDashboard={() => setShowSignInModal(true)}
          onOpenSignIn={() => setShowSignInModal(true)}
          isLoggingIn={isLoggingIn}
          isGuestLoggingIn={isGuestLoggingIn}
          loginError={loginError}
          onRetryLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
        />
        <SignInModal 
          isOpen={true}
          onClose={() => setCurrentView('landing')}
          handleLogin={handleLogin}
          handleGuestLogin={handleGuestLogin}
          isLoggingIn={isLoggingIn}
          isGuestLoggingIn={isGuestLoggingIn}
          loginError={loginError}
          setLoginError={setLoginError}
        />
      </>
    );
  }

  // 2. ACTIVE SESSION VIEWS
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

  // 3. MAIN APPLICATION DASHBOARD (With Sidebar & Layout)
  return (
    <Layout 
      activeTab={activeTab} 
      setActiveTab={(tab) => {
        setActiveTab(tab);
        setShowCreator(false);
      }} 
      onCreateNew={() => setShowCreator(true)}
      onGoToLanding={() => setCurrentView('landing')}
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
