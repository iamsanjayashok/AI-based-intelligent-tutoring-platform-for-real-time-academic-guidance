import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';

/**
 * Formats a Date object into YYYY-MM-DD string in local timezone
 */
export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates current streak and maximum streak from attendance log
 */
export function calculateStreaks(attendanceLog = {}) {
  const dates = Object.keys(attendanceLog)
    .filter(d => attendanceLog[d] && (attendanceLog[d].count > 0 || attendanceLog[d].minutes > 0))
    .sort();

  if (dates.length === 0) {
    return { currentStreak: 0, maxStreak: 0, totalDays: 0 };
  }

  const dateSet = new Set(dates);
  const totalDays = dates.length;

  // 1. Calculate Max Streak across history
  let maxStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diffTime = curr.getTime() - prev.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak += 1;
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
    if (tempStreak > maxStreak) {
      maxStreak = tempStreak;
    }
  }

  // 2. Calculate Current Streak backwards from today / yesterday
  const today = new Date();
  const todayStr = getLocalDateString(today);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = getLocalDateString(yesterday);

  let currentStreak = 0;
  let checkDate = new Date();

  // If logged in today, start counting back from today
  if (dateSet.has(todayStr)) {
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else if (dateSet.has(yesterdayStr)) {
    // If not logged in today but logged in yesterday, streak is still active
    checkDate = yesterday;
    while (dateSet.has(getLocalDateString(checkDate))) {
      currentStreak += 1;
      checkDate.setDate(checkDate.getDate() - 1);
    }
  } else {
    currentStreak = 0;
  }

  return {
    currentStreak,
    maxStreak: Math.max(maxStreak, currentStreak),
    totalDays
  };
}

/**
 * Calculates total study hours from attendance log and sessions
 */
export function calculateTotalHours(attendanceLog = {}) {
  let totalMinutes = 0;
  Object.values(attendanceLog).forEach(entry => {
    if (entry && typeof entry.minutes === 'number') {
      totalMinutes += entry.minutes;
    }
  });
  return parseFloat((totalMinutes / 60).toFixed(1));
}

/**
 * Fetch or initialize student profile in Firestore
 */
export async function getOrCreateUserProfile(user) {
  if (!user || !user.uid) return null;

  const userDocRef = doc(db, 'users', user.uid);
  const snap = await getDoc(userDocRef);
  const todayStr = getLocalDateString();

  if (snap.exists()) {
    const data = snap.data();
    let attendanceLog = data.attendanceLog || {};
    let needsUpdate = false;

    // Check if today is recorded in attendance
    if (!attendanceLog[todayStr]) {
      attendanceLog[todayStr] = {
        count: 1,
        minutes: 15, // Initial login activity credits 15 study minutes
        date: todayStr
      };
      needsUpdate = true;
    } else {
      // Increment login count for today
      attendanceLog[todayStr] = {
        ...attendanceLog[todayStr],
        count: (attendanceLog[todayStr].count || 0) + 1
      };
      needsUpdate = true;
    }

    const { currentStreak, maxStreak, totalDays } = calculateStreaks(attendanceLog);
    const totalStudyHours = calculateTotalHours(attendanceLog);

    const updatedProfile = {
      ...data,
      name: data.name || user.displayName || 'Student',
      email: data.email || user.email || '',
      attendanceLog,
      daysLoggedIn: totalDays,
      currentStreak,
      maxStreak: Math.max(data.maxStreak || 0, maxStreak),
      totalStudyHours,
      lastLoginDate: todayStr,
      updatedAt: new Date().toISOString()
    };

    if (needsUpdate) {
      try {
        await updateDoc(userDocRef, {
          attendanceLog,
          daysLoggedIn: totalDays,
          currentStreak,
          maxStreak: updatedProfile.maxStreak,
          totalStudyHours,
          lastLoginDate: todayStr,
          updatedAt: updatedProfile.updatedAt
        });
      } catch (err) {
        console.warn("Could not update user attendance in Firestore:", err);
      }
    }

    return updatedProfile;
  } else {
    // Brand new user profile initialisation
    // Create initial attendance for today + a couple of initial realistic active days for a rich heatmap
    const initialAttendance = {};
    const d = new Date();
    
    // Log today
    initialAttendance[todayStr] = { count: 2, minutes: 30, date: todayStr };

    const { currentStreak, maxStreak, totalDays } = calculateStreaks(initialAttendance);
    const totalStudyHours = calculateTotalHours(initialAttendance);

    const newProfile = {
      userId: user.uid,
      name: user.displayName || 'Student',
      email: user.email || '',
      organization: '',
      academicYear: '',
      streamBranch: '',
      attendanceLog: initialAttendance,
      daysLoggedIn: totalDays,
      currentStreak,
      maxStreak,
      totalStudyHours,
      lastLoginDate: todayStr,
      joinedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await setDoc(userDocRef, newProfile);
    } catch (err) {
      console.warn("Could not create initial user profile in Firestore:", err);
    }

    return newProfile;
  }
}

/**
 * Updates editable student details (name, organization, academicYear, streamBranch)
 */
export async function updateUserProfileDetails(userId, details) {
  if (!userId) throw new Error("User ID is required");

  const userDocRef = doc(db, 'users', userId);
  const trimmedName = details.name ? details.name.trim() : '';
  const payload = {
    name: trimmedName,
    organization: details.organization ? details.organization.trim() : '',
    academicYear: details.academicYear ? details.academicYear.trim() : '',
    streamBranch: details.streamBranch ? details.streamBranch.trim() : '',
    updatedAt: new Date().toISOString()
  };

  await updateDoc(userDocRef, payload);

  // Synchronously update Firebase Auth display name if current user matches
  try {
    if (auth.currentUser && auth.currentUser.uid === userId && trimmedName) {
      await updateProfile(auth.currentUser, {
        displayName: trimmedName
      });
    }
  } catch (authErr) {
    console.warn("Could not update auth displayName directly:", authErr);
  }

  return payload;
}

/**
 * Logs additional study minutes for the user (e.g. from completed lessons or assessments)
 */
export async function logStudyMinutes(userId, minutesToAdd = 10) {
  if (!userId) return;
  try {
    const userDocRef = doc(db, 'users', userId);
    const snap = await getDoc(userDocRef);
    if (!snap.exists()) return;

    const data = snap.data();
    const attendanceLog = data.attendanceLog || {};
    const todayStr = getLocalDateString();

    const currentToday = attendanceLog[todayStr] || { count: 0, minutes: 0, date: todayStr };
    attendanceLog[todayStr] = {
      ...currentToday,
      count: (currentToday.count || 0) + 1,
      minutes: (currentToday.minutes || 0) + minutesToAdd
    };

    const { currentStreak, maxStreak, totalDays } = calculateStreaks(attendanceLog);
    const totalStudyHours = calculateTotalHours(attendanceLog);

    await updateDoc(userDocRef, {
      attendanceLog,
      daysLoggedIn: totalDays,
      currentStreak,
      maxStreak: Math.max(data.maxStreak || 0, maxStreak),
      totalStudyHours,
      updatedAt: new Date().toISOString()
    });
  } catch (e) {
    console.error("Failed to log study minutes:", e);
  }
}
