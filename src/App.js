import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { GraduationCap, LogIn, Loader2 } from 'lucide-react';
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

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) return <LoadingScreen />;

  if (!user) {
    return (
      <div className="min-h-screen atmosphere-bg flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-8"
        >
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-blue-600 rounded-[24px] flex items-center justify-center text-white shadow-2xl shadow-blue-200">
              <GraduationCap size={40} />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-serif font-bold text-slate-900 tracking-tight">AI Learning Companion</h1>
            <p className="text-slate-500 text-lg leading-relaxed">
              Your personal AI tutor that turns any material into a structured, interactive classroom experience.
            </p>
          </div>
          <button
            onClick={handleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 text-slate-700 px-8 py-4 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm group"
          >
            <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
            Sign in with Google to Start Learning
          </button>
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
