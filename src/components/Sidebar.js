import React, { useState } from 'react';
import { Book, Layout as DashboardIcon, BarChart2, User, PlusCircle, Settings, LogOut, Key, Loader2, AlertCircle, CheckCircle, Presentation, X } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { joinCourseByCode } from '../services/sharingService';

export default function Sidebar({ activeTab, setActiveTab, onCreateNew, onGoToLanding, isOpen, onClose }) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ type: null, message: '' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'courses', label: 'My Courses', icon: Book },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const handleLogout = () => {
    signOut(auth).catch(err => console.warn("Sign-out completed with notice:", err));
  };

  const handleItemClick = (tabId) => {
    setActiveTab(tabId);
    if (onClose) onClose();
  };

  const handleCreateNewClick = () => {
    onCreateNew();
    if (onClose) onClose();
  };

  const handleGoToLandingClick = () => {
    if (onGoToLanding) onGoToLanding();
    if (onClose) onClose();
  };

  const handleJoinCourse = async (e) => {
    e.preventDefault();
    if (!courseCode.trim()) return;

    try {
      setIsJoining(true);
      setJoinStatus({ type: null, message: '' });
      await joinCourseByCode(courseCode);
      setJoinStatus({ type: 'success', message: 'Course joined successfully! Check your dashboard.' });
      setTimeout(() => {
        setShowCodeModal(false);
        setCourseCode('');
        setJoinStatus({ type: null, message: '' });
        setActiveTab('courses');
        if (onClose) onClose();
      }, 2000);
    } catch (error) {
      setJoinStatus({ type: 'error', message: error.message || 'Failed to join course.' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-64 bg-white border-r border-slate-200 flex flex-col h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:sticky lg:top-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200 shrink-0">
                <Book size={20} />
              </div>
              <span className="font-bold text-xl text-slate-900 tracking-tight">AI Tutor</span>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors lg:hidden"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600 font-bold'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="mt-6 pt-6 border-t border-slate-100 space-y-2.5">
            <button
              onClick={handleCreateNewClick}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-98"
            >
              <PlusCircle size={18} />
              <span>New Course</span>
            </button>
            
            <button
              onClick={() => setShowCodeModal(true)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all active:scale-98"
            >
              <Key size={18} />
              <span>Enter Code</span>
            </button>
          </div>
        </div>

      <AnimatePresence>
        {showCodeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-sm w-full shadow-2xl border border-blue-50"
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight">Join a Course</h3>
              <p className="text-slate-500 text-sm mb-6">Enter the 6-digit access code to copy the course to your dashboard.</p>
              
              <form onSubmit={handleJoinCourse} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                    placeholder="E.g. AX79K2"
                    className="w-full p-4 text-center text-2xl font-mono font-bold tracking-[0.5em] rounded-2xl border-2 border-slate-100 bg-slate-50 focus:outline-none focus:border-blue-500 transition-all uppercase placeholder:text-slate-200 placeholder:tracking-normal"
                    autoFocus
                  />
                </div>

                {joinStatus.type && (
                  <div className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
                    joinStatus.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {joinStatus.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                    <span className="font-medium">{joinStatus.message}</span>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCodeModal(false);
                      setJoinStatus({ type: null, message: '' });
                      setCourseCode('');
                    }}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isJoining || courseCode.length < 6}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isJoining ? <Loader2 size={18} className="animate-spin" /> : 'Join'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="mt-auto p-6 border-t border-slate-100">
        {onGoToLanding && (
          <button
            onClick={onGoToLanding}
            className="w-full flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 hover:border-blue-200 transition-all shadow-2xs"
            title="View Full Project Presentation & Specifications"
          >
            <Presentation size={16} className="text-blue-600" />
            <span>Project Overview</span>
          </button>
        )}
        <div 
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all border border-transparent hover:border-slate-200"
          title="View Student Profile"
        >
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {auth.currentUser?.displayName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{auth.currentUser?.displayName || 'Student'}</p>
            <p className="text-xs text-slate-500 truncate">{auth.currentUser?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
    </>
  );
}
