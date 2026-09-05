import { db, auth } from '../firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  serverTimestamp,
  query,
  where,
  limit
} from 'firebase/firestore';

/**
 * Generates a random alphanumeric code of specified length.
 */
export const generateRandomCode = (length = 6) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Shares a course by generating or retrieving a share code.
 */
export const shareCourse = async (courseId) => {
  try {
    // Check if code already exists for this course
    const q = query(collection(db, 'shared_codes'), where('courseId', '==', courseId), limit(1));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }

    // Generate new unique code
    let code;
    let isUnique = false;
    while (!isUnique) {
      code = generateRandomCode();
      const codeRef = doc(db, 'shared_codes', code);
      const codeSnap = await getDoc(codeRef);
      if (!codeSnap.exists()) {
        isUnique = true;
      }
    }

    await setDoc(doc(db, 'shared_codes', code), {
      courseId,
      createdAt: serverTimestamp()
    });

    return code;
  } catch (error) {
    console.error("Error sharing course:", error);
    throw error;
  }
};

/**
 * Joins a course using a share code by copying it to the current user's profile.
 */
export const joinCourseByCode = async (code) => {
  const user = auth.currentUser;
  if (!user) throw new Error("User must be logged in to join a course.");

  try {
    const codeRef = doc(db, 'shared_codes', code.toUpperCase());
    const codeSnap = await getDoc(codeRef);

    if (!codeSnap.exists()) {
      throw new Error("Invalid or expired course code.");
    }

    const { courseId } = codeSnap.data();
    const courseSnap = await getDoc(doc(db, 'courses', courseId));

    if (!courseSnap.exists()) {
      throw new Error("Original course no longer exists.");
    }

    const originalData = courseSnap.data();
    
    // Check if user already owns this course (by title) - optional safeguard
    // But better to just copy it.

    // 1. Create the new course document
    const newCourseData = {
      ...originalData,
      ownerId: user.uid,
      createdAt: serverTimestamp(),
      title: `${originalData.title} (Shared)`, // Mark as shared
      sharedFrom: courseId // Track origin
    };

    const newCourseRef = await addDoc(collection(db, 'courses'), newCourseData);
    const newCourseId = newCourseRef.id;

    // 2. Copy documents subcollection
    const docsRef = collection(db, 'courses', courseId, 'documents');
    const docsSnap = await getDocs(docsRef);
    
    for (const d of docsSnap.docs) {
      await addDoc(collection(db, 'courses', newCourseId, 'documents'), {
        ...d.data(),
        courseId: newCourseId
      });
    }

    return { id: newCourseId, ...newCourseData };
  } catch (error) {
    console.error("Error joining course:", error);
    throw error;
  }
};
