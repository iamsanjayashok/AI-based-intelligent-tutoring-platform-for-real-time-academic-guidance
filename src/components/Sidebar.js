import React, { useState } from 'react';
import { Book, Layout as DashboardIcon, BarChart2, PlusCircle, Settings, LogOut, Key, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { joinCourseByCode } from '../services/sharingService';

export default function Sidebar({ activeTab, setActiveTab, onCreateNew }) {
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [courseCode, setCourseCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState({ type: null, message: '' });

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
    { id: 'courses', label: 'My Courses', icon: Book },
    { id: 'progress', label: 'Progress', icon: BarChart2 },
  ];

  const handleLogout = () => signOut(auth);

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
      }, 2000);
    } catch (error) {
      setJoinStatus({ type: 'error', message: error.message || 'Failed to join course.' });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Book size={20} />
          </div>
          <span className="font-serif font-bold text-xl text-slate-900">AI Tutor</span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-8 pt-8 border-t border-slate-100 space-y-3">
          <button
            onClick={onCreateNew}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
          >
            <PlusCircle size={18} />
            New Course
          </button>
          
          <button
            onClick={() => setShowCodeModal(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
          >
            <Key size={18} />
            Enter Code
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
              <h3 className="text-2xl font-serif font-bold text-slate-900 mb-2">Join a Course</h3>
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
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
            {auth.currentUser?.displayName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{auth.currentUser?.displayName}</p>
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
    </div>
  );
}
