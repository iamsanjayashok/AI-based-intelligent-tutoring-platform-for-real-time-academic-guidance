import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { 
  Menu, 
  Plus, 
  Layout as DashboardIcon, 
  Book, 
  BarChart2, 
  User, 
  GraduationCap, 
  Presentation,
  Key
} from 'lucide-react';
import { auth } from '../firebase';

export default function Layout({ children, activeTab, setActiveTab, onCreateNew, onGoToLanding }) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const getPageTitle = (tab) => {
    switch (tab) {
      case 'dashboard': return 'Project Hub';
      case 'courses': return 'My Courses';
      case 'progress': return 'Learning Progress';
      case 'profile': return 'Student Profile';
      default: return 'AI Tutor';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#f8fafc] text-slate-800 antialiased overflow-x-hidden">
      {/* Top Mobile & Tablet App Bar (Visible on screens < lg) */}
      <header className="lg:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors active:scale-95"
            aria-label="Open navigation menu"
          >
            <Menu size={22} />
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={18} />
            </div>
            <div>
              <span className="font-bold text-sm text-slate-900 tracking-tight block leading-tight">AI Tutor</span>
              <span className="text-[10px] font-semibold text-blue-600 tracking-wide uppercase">{getPageTitle(activeTab)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onGoToLanding && (
            <button
              onClick={onGoToLanding}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold hidden sm:flex items-center gap-1 border border-slate-200"
              title="Project Overview & Specs"
            >
              <Presentation size={15} />
              <span>Overview</span>
            </button>
          )}

          <button
            onClick={onCreateNew}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all shadow-xs active:scale-95"
            title="Create new course"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">New Course</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-bold text-xs flex items-center justify-center active:scale-95 transition-transform"
            title="View Profile"
          >
            {auth.currentUser?.photoURL ? (
              <img src={auth.currentUser.photoURL} alt="User" className="w-full h-full rounded-full object-cover" />
            ) : (
              auth.currentUser?.displayName?.[0] || 'U'
            )}
          </button>
        </div>
      </header>

      {/* Main Sidebar (Desktop fixed sticky / Mobile off-canvas drawer) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCreateNew={onCreateNew} 
        onGoToLanding={onGoToLanding}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main App Content Viewport */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto min-w-0 pb-28 md:pb-12">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Bottom Navigation Bar for Mobile Screens (< md) */}
      <nav 
        aria-label="Mobile Bottom Navigation" 
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)] safe-area-bottom"
      >
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'dashboard' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <DashboardIcon size={20} className={activeTab === 'dashboard' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] leading-tight">Hub</span>
        </button>

        <button
          onClick={() => setActiveTab('courses')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'courses' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Book size={20} className={activeTab === 'courses' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] leading-tight">Courses</span>
        </button>

        {/* Central Prominent Add Action */}
        <button
          onClick={onCreateNew}
          className="flex flex-col items-center justify-center w-11 h-11 -mt-5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/35 hover:bg-blue-700 active:scale-95 transition-transform"
          title="Create New Course"
          aria-label="Create New Course"
        >
          <Plus size={22} className="stroke-[2.5]" />
        </button>

        <button
          onClick={() => setActiveTab('progress')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'progress' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart2 size={20} className={activeTab === 'progress' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] leading-tight">Progress</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 py-1 px-2.5 rounded-xl transition-colors ${
            activeTab === 'profile' ? 'text-blue-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <User size={20} className={activeTab === 'profile' ? 'stroke-[2.5]' : ''} />
          <span className="text-[10px] leading-tight">Profile</span>
        </button>
      </nav>
    </div>
  );
}
