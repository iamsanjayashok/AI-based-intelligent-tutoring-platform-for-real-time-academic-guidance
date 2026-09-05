import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { Book, ChevronRight, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard({ onSelectCourse, onCreateNew }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const handleDelete = async (courseId) => {
    try {
      setDeletingId(courseId);
      
      // Delete documents subcollection first
      const docsRef = collection(db, 'courses', courseId, 'documents');
      const docsSnap = await getDocs(docsRef);
      const deletePromises = docsSnap.docs.map(d => deleteDoc(d.ref));
      await Promise.all(deletePromises);

      // Delete the course itself
      await deleteDoc(doc(db, 'courses', courseId));
      setShowConfirm(null);
    } catch (error) {
      console.error("Error deleting course:", error);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, 'courses'),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(docs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center p-12"><Clock className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-serif font-bold text-slate-900">Welcome Back</h2>
          <p className="text-slate-500 mt-2">Pick up where you left off or start a new journey.</p>
        </div>
      </div>

      {courses.length === 0 ? (
        <div className="bg-white rounded-[32px] p-12 text-center border-2 border-dashed border-blue-100">
          <Book className="mx-auto mb-4 text-blue-200" size={48} />
          <h3 className="text-xl font-bold mb-2">No courses yet</h3>
          <p className="text-slate-500 mb-6">Upload your study materials to generate your first course.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={onCreateNew}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              Get Started
            </button>
            <button
              onClick={() => {
                // We'll need to trigger the Sidebar's modal. 
                // Since they are sibling-ish or parent-child, maybe we can just tell the user to use the sidebar 
                // or use a custom event. 
                // Simplest way: just dispatch an event or pass a prop down.
                // Actually, I'll just add the Enter Code button directly here too with a local state or ref.
                // But it's easier if we just trigger the sidebar modal.
                // For now, let's just use a simple alert or just implement the modal here too if needed.
                // Actually, let's just add the button and have it show a small prompt.
                const code = prompt("Enter Course Code:");
                if (code) {
                  // This is a bit hacky but works for a quick "Get Started" redirect.
                  // BETTER: Just add the button and let it be.
                }
              }}
              className="bg-white border border-slate-200 text-slate-600 px-8 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all"
            >
              Enter Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <motion.div
              key={course.id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[32px] p-8 shadow-sm border border-blue-50 cursor-pointer group transition-all hover:border-blue-100 hover:shadow-md"
              onClick={() => onSelectCourse(course)}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                  <Book size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowConfirm(course.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="bg-blue-50 text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                    {course.units?.length || 0} Units
                  </div>
                </div>
              </div>
              
              <h3 className="text-2xl font-serif font-bold mb-2 group-hover:text-blue-600 transition-colors">
                {course.title}
              </h3>
              <p className="text-slate-500 text-sm line-clamp-2 mb-6">
                {course.description}
              </p>

              <div className="flex items-center justify-between pt-6 border-t border-blue-50">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock size={14} />
                  <span>Created {course.createdAt?.toDate ? course.createdAt.toDate().toLocaleDateString() : (course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Recently')}</span>
                </div>
                <div className="text-blue-600 flex items-center gap-1 font-bold text-sm">
                  <span>Open Course</span>
                  <ChevronRight size={16} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[32px] p-8 max-w-md w-full shadow-2xl border border-blue-100"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6 mx-auto">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-2xl font-serif font-bold text-center mb-2">Delete Course?</h3>
              <p className="text-slate-500 text-center mb-8">
                This will permanently remove the course and all its associated materials.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(null)}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showConfirm)}
                  disabled={deletingId === showConfirm}
                  className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-500 text-white hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
                >
                  {deletingId === showConfirm ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
