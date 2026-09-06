import React, { useState, useEffect } from 'react';
import { 
  User, 
  Building2, 
  GraduationCap, 
  GitBranch, 
  Mail, 
  Calendar, 
  Flame, 
  Trophy, 
  Clock, 
  Pencil, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  BookOpen, 
  ShieldCheck,
  Plus,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { getOrCreateUserProfile, logStudyMinutes } from '../services/userService';
import AttendanceHeatmap from './AttendanceHeatmap';
import EditProfile from './EditProfile';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('display'); // 'display' | 'edit'
  const [loggingTime, setLoggingTime] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const userProfile = await getOrCreateUserProfile(user);
        setProfile(userProfile);
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogTime = async (minutes) => {
    if (!profile?.userId) return;
    try {
      setLoggingTime(true);
      await logStudyMinutes(profile.userId, minutes);
      await loadProfile();
    } catch (err) {
      console.error("Error logging study minutes:", err);
    } finally {
      setLoggingTime(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading student profile...</p>
      </div>
    );
  }

  // If in edit mode, render the Edit page
  if (view === 'edit') {
    return (
      <EditProfile
        profile={profile}
        onBack={() => setView('display')}
        onSaved={(updated) => {
          setProfile(updated);
          setView('display');
        }}
      />
    );
  }

  const currentUser = auth.currentUser;
  const userPhoto = currentUser?.photoURL;
  const userInitial = profile?.name?.[0] || currentUser?.displayName?.[0] || 'S';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      {/* Top Banner / Student Details Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        {/* Subtle decorative background accent */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-5">
            {/* Avatar / Photo */}
            <div className="relative">
              {userPhoto ? (
                <img
                  src={userPhoto}
                  alt={profile?.name || 'Student'}
                  referrerPolicy="no-referrer"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-200"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-2xl font-bold font-serif shadow-md shadow-blue-200">
                  {userInitial}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" title="Online & Active">
                <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </div>

            {/* Main Identity */}
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>{profile?.name || currentUser?.displayName || 'Student'}</span>
                  <button
                    onClick={() => setView('edit')}
                    className="text-slate-400 hover:text-blue-600 p-1.5 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center"
                    title="Edit student name & details"
                  >
                    <Pencil size={16} />
                  </button>
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                  <ShieldCheck size={13} />
                  Verified Learner
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-1.5 font-medium">
                <span className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  {profile?.email || currentUser?.email}
                </span>
                {profile?.joinedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    Member since {new Date(profile.joinedAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Edit Profile Action Button */}
          <button
            onClick={() => setView('edit')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-sm font-bold transition-all shadow-xs group"
          >
            <Pencil size={16} className="text-blue-600 group-hover:scale-110 transition-transform" />
            Edit Profile
          </button>
        </div>

        {/* Academic Details Breakdown Grid */}
        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Student Name */}
          <div 
            onClick={() => setView('edit')}
            className="p-4 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-100 hover:border-blue-200 space-y-1 cursor-pointer transition-all group"
            title="Click to edit your name"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>Full Name</span>
              </div>
              <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-blue-600 transition-opacity" />
            </div>
            <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 truncate">
              {profile?.name || 'Not provided'}
            </p>
          </div>

          {/* Organisation Name */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <Building2 size={14} />
              <span>Organisation / College</span>
            </div>
            <p className={`text-sm font-bold truncate ${profile?.organization ? 'text-slate-900' : 'text-slate-400 italic'}`}>
              {profile?.organization || 'Not specified (Edit to set)'}
            </p>
          </div>

          {/* Current Academic Year */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <GraduationCap size={14} />
              <span>Academic Year</span>
            </div>
            <p className={`text-sm font-bold truncate ${profile?.academicYear ? 'text-slate-900' : 'text-slate-400 italic'}`}>
              {profile?.academicYear || 'Not specified (Edit to set)'}
            </p>
          </div>

          {/* Stream / Branch */}
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-100 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
              <GitBranch size={14} />
              <span>Stream / Branch</span>
            </div>
            <p className={`text-sm font-bold truncate ${profile?.streamBranch ? 'text-slate-900' : 'text-slate-400 italic'}`}>
              {profile?.streamBranch || 'Not specified (Edit to set)'}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Quantitative Metrics (Prompt Requirements) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Days Logged In */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Days Logged In
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {profile?.daysLoggedIn || 0}
            </span>
            <span className="text-xs font-medium text-slate-400">days active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Total distinct calendar days logged into your companion.
          </p>
        </div>

        {/* Metric 2: Login Days Streak */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Current Streak
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <Flame size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-amber-600">
              {profile?.currentStreak || 0}
            </span>
            <span className="text-xs font-medium text-amber-600 font-bold">
              day{(profile?.currentStreak || 0) === 1 ? '' : 's'} streak
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Consecutive days studied without missing a session.
          </p>
        </div>

        {/* Metric 3: Max Streak */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Max Streak
            </span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Trophy size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {profile?.maxStreak || 0}
            </span>
            <span className="text-xs font-medium text-slate-400">days record</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Your all-time highest continuous study attendance streak.
          </p>
        </div>

        {/* Metric 4: Total Study Hours */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Study Hours
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono text-slate-900">
              {profile?.totalStudyHours !== undefined ? profile.totalStudyHours : 0}
            </span>
            <span className="text-xs font-medium text-slate-400">hours</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Accumulated time spent conversing, reading, and learning.
          </p>
        </div>
      </div>

      {/* LeetCode-style Attendance Heatmap */}
      <AttendanceHeatmap attendanceLog={profile?.attendanceLog || {}} />

      {/* Attendance Log Table / Quick Study Action */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Recent Attendance Log
            </h3>
            <p className="text-xs text-slate-500">
              Detailed breakdown of active study dates and session durations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleQuickLogTime(30)}
              disabled={loggingTime}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              title="Log 30 study minutes for today"
            >
              {loggingTime ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Log +30 Min Study Session
            </button>
          </div>
        </div>

        {/* Log Entries */}
        {profile?.attendanceLog && Object.keys(profile.attendanceLog).length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Activity Count</th>
                  <th className="px-5 py-3.5">Study Duration</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(profile.attendanceLog)
                  .sort(([a], [b]) => b.localeCompare(a))
                  .slice(0, 10)
                  .map(([dateKey, entry]) => (
                    <tr key={dateKey} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-slate-900 flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400" />
                        {new Date(dateKey + 'T00:00:00').toLocaleDateString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-medium">{entry?.count || 1} interaction(s)</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-xs border border-emerald-100">
                          {entry?.minutes || 15} mins logged
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 size={13} />
                          Recorded
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm">
            No attendance entries logged yet.
          </div>
        )}
      </div>
    </div>
  );
}
