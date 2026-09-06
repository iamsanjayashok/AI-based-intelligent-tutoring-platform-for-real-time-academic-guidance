import React, { useState } from 'react';
import { 
  User, 
  Building2, 
  GraduationCap, 
  GitBranch, 
  ArrowLeft, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Mail,
  Sparkles,
  Pencil,
  RotateCcw
} from 'lucide-react';
import { motion } from 'motion/react';
import { updateUserProfileDetails } from '../services/userService';
import { auth } from '../firebase';

const academicYearOptions = [
  "1st Year (Freshman)",
  "2nd Year (Sophomore)",
  "3rd Year (Junior)",
  "4th Year / Final Year (Senior)",
  "Postgraduate / Master's (1st Year)",
  "Postgraduate / Master's (2nd Year)",
  "PhD / Doctoral Scholar",
  "High School / Pre-University",
  "Independent Learner / Professional"
];

const commonStreams = [
  "Computer Science & Engineering",
  "Artificial Intelligence & Data Science",
  "Information Technology",
  "Electronics & Communication Engineering",
  "Electrical & Electronics Engineering",
  "Mechanical Engineering",
  "Civil & Environmental Engineering",
  "Biotechnology & Bioinformatics",
  "Business Administration & Management",
  "Mathematics & Computing",
  "Physics & Applied Sciences",
  "Medicine & Health Sciences"
];

export default function EditProfile({ profile, onBack, onSaved }) {
  const currentAuthUser = auth.currentUser;
  const [name, setName] = useState(profile?.name || currentAuthUser?.displayName || '');
  const [organization, setOrganization] = useState(profile?.organization || '');
  const [academicYear, setAcademicYear] = useState(profile?.academicYear || '');
  const [streamBranch, setStreamBranch] = useState(profile?.streamBranch || '');
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState({ type: null, message: '' });

  const targetUserId = profile?.userId || currentAuthUser?.uid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatus({ type: 'error', message: 'Student name cannot be empty. Please enter your name.' });
      return;
    }

    if (!targetUserId) {
      setStatus({ type: 'error', message: 'User session not found. Please log in again.' });
      return;
    }

    setIsSaving(true);
    setStatus({ type: null, message: '' });

    try {
      await updateUserProfileDetails(targetUserId, {
        name: name.trim(),
        organization: organization.trim(),
        academicYear: academicYear.trim(),
        streamBranch: streamBranch.trim()
      });

      setStatus({ type: 'success', message: 'Student name and details updated successfully!' });
      
      const updated = {
        ...profile,
        userId: targetUserId,
        name: name.trim(),
        organization: organization.trim(),
        academicYear: academicYear.trim(),
        streamBranch: streamBranch.trim()
      };

      setTimeout(() => {
        if (onSaved) onSaved(updated);
      }, 700);
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatus({ type: 'error', message: err.message || 'Failed to save changes. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2.5 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-xs"
            title="Return to profile"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-bold text-slate-900">
              Edit Student Details
            </h1>
            <p className="text-xs text-slate-500">
              Manage your academic credentials, university affiliation, and profile information.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Notification banner */}
      {status.type && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border ${
            status.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-red-600 shrink-0" />
          )}
          <span>{status.message}</span>
        </motion.div>
      )}

      {/* Main Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Personal & Academic Identity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Name */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Student Full Name</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-200">
                  <Pencil size={10} />
                  Editable
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Johnson"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <p className="text-[11px] text-slate-400">
                  Visible on your certificates, assessments, and tutor sessions.
                </p>
                {currentAuthUser?.displayName && currentAuthUser.displayName !== name && (
                  <button
                    type="button"
                    onClick={() => setName(currentAuthUser.displayName)}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 hover:underline shrink-0"
                    title="Fill with Google account name"
                  >
                    <RotateCcw size={11} />
                    Use Google Name
                  </button>
                )}
              </div>
            </div>

            {/* Email (Read-only verified auth identity) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Registered Account Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-100/70 text-sm font-medium text-slate-500 cursor-not-allowed select-none"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Connected via Google Authentication. User data is strictly isolated to this identity.
              </p>
            </div>
          </div>
        </div>

        {/* Institutional & Academic Details Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Building2 size={18} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Institution & Academic Program</h2>
          </div>

          <div className="space-y-6">
            {/* Organisation Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Student's Organisation / College / University Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Building2 size={18} />
                </div>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Stanford University / National Institute of Technology"
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Your affiliated university, institution, school, or learning organization.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Academic Year */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Current Academic Year
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap size={18} />
                  </div>
                  <input
                    type="text"
                    list="academic-years-list"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    placeholder="e.g. 3rd Year (Junior) or Final Year"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  />
                  <datalist id="academic-years-list">
                    {academicYearOptions.map((opt, i) => (
                      <option key={i} value={opt} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["1st Year", "2nd Year", "3rd Year", "Final Year"].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setAcademicYear(quick)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all font-medium"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>

              {/* Stream / Branch */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Stream / Branch / Major
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <GitBranch size={18} />
                  </div>
                  <input
                    type="text"
                    list="streams-list"
                    value={streamBranch}
                    onChange={(e) => setStreamBranch(e.target.value)}
                    placeholder="e.g. Computer Science & Engineering"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:border-blue-500 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400"
                  />
                  <datalist id="streams-list">
                    {commonStreams.map((stream, i) => (
                      <option key={i} value={stream} />
                    ))}
                  </datalist>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {["Computer Science", "Information Technology", "AI & Data Science", "ECE"].map((quick) => (
                    <button
                      key={quick}
                      type="button"
                      onClick={() => setStreamBranch(quick)}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all font-medium"
                    >
                      {quick}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
