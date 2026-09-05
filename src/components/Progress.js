import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  deleteDoc, 
  doc,
  onSnapshot
} from 'firebase/firestore';
import { 
  BarChart2, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  RotateCcw, 
  Trash2, 
  ChevronRight, 
  Award,
  Clock,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Progress({ onRetake }) {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAttempts: 0,
    bestScore: 0,
    averageScore: 0,
    coursesAttempted: 0
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'assessment_attempts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const attemptsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAttempts(attemptsData);
      calculateStats(attemptsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attempts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const calculateStats = (data) => {
    if (data.length === 0) return;

    const total = data.reduce((acc, curr) => acc + (curr.scores?.total || 0), 0);
    const best = Math.max(...data.map(d => d.scores?.total || 0));
    const courses = new Set(data.map(d => d.courseId)).size;

    setStats({
      totalAttempts: data.length,
      bestScore: Math.round(best),
      averageScore: Math.round(total / data.length),
      coursesAttempted: courses
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this attempt from your history?")) return;
    try {
      await deleteDoc(doc(db, 'assessment_attempts', id));
    } catch (error) {
      console.error("Error deleting attempt:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-slate-500 font-medium">Loading your academic history...</p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto mb-6">
          <BarChart2 size={40} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">No attempts found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Complete a final assessment in any of your courses to see your progress tracking here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Award className="text-amber-500" />} 
          label="Best Score" 
          value={`${stats.bestScore}%`}
          color="amber"
        />
        <StatCard 
          icon={<TrendingUp className="text-blue-500" />} 
          label="Avg Score" 
          value={`${stats.averageScore}%`}
          color="blue"
        />
        <StatCard 
          icon={<Calendar className="text-emerald-500" />} 
          label="Total Attempts" 
          value={stats.totalAttempts}
          color="emerald"
        />
        <StatCard 
          icon={<BookOpen className="text-purple-500" />} 
          label="Courses" 
          value={stats.coursesAttempted}
          color="purple"
        />
      </div>

      {/* History Table/List */}
      <div className="bg-white rounded-[32px] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-serif italic">Assessment History</h3>
            <p className="text-sm text-slate-500">Track your performance across all courses.</p>
          </div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full border border-slate-200">
            {attempts.length} Records Found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Course & Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Section 1 (MCQ)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Section 2 (MSQ)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Section 3 (Desc)</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Total Score</th>
                <th className="px-8 py-5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {attempts.map((attempt) => (
                  <motion.tr 
                    key={attempt.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-slate-50 transition-all cursor-default"
                  >
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight text-sm">
                        {attempt.courseTitle || 'Unknown Course'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1 font-mono">
                        <Clock size={12} />
                        {attempt.createdAt?.toDate ? attempt.createdAt.toDate().toLocaleString() : (attempt.createdAt ? new Date(attempt.createdAt).toLocaleString() : 'Recently')}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <ScoreBadge score={attempt.scores?.mcq} max={40} color="blue" />
                    </td>
                    <td className="px-8 py-6">
                      <ScoreBadge score={attempt.scores?.msq} max={20} color="indigo" />
                    </td>
                    <td className="px-8 py-6">
                      <ScoreBadge score={attempt.scores?.descriptive} max={40} color="purple" />
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden max-w-[80px]">
                          <div 
                            className={`h-full rounded-full ${parseFloat(attempt.scores?.total) >= 70 ? 'bg-green-500' : parseFloat(attempt.scores?.total) >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${attempt.scores?.total}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-800">{Math.round(attempt.scores?.total)}%</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onRetake(attempt.courseId)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Retake Assessment"
                        >
                          <RotateCcw size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(attempt.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-200 shadow-sm relative overflow-hidden group">
      <div className={`p-3 rounded-2xl border ${colorMap[color]} w-fit mb-4 transition-transform group-hover:scale-110`}>
        {React.cloneElement(icon, { size: 24 })}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        {React.cloneElement(icon, { size: 80 })}
      </div>
    </div>
  );
}

function ScoreBadge({ score, max, color }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-bold border ${colorMap[color]}`}>
      {Math.round(score)}
      <span className="opacity-40 font-normal mx-0.5">/</span>
      <span className="opacity-40 font-normal">{max}</span>
    </span>
  );
}
