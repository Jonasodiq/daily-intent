import { db, auth } from './firebase';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { HabitCompletion } from '../types';

// Markera vana som genomförd
export const completeHabit = async (habitId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Ingen användare inloggad');

  const today = new Date().toISOString().split('T')[0]; // "2024-01-15"

  await addDoc(collection(db, 'completions'), {
    habitId,
    userId: user.uid,
    date: today,
    completed: true,
    createdAt: serverTimestamp(),
  });
};

// Hämta alla genomförda vanor
export const getCompletions = async (): Promise<HabitCompletion[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Ingen användare inloggad');

  const q = query(
    collection(db, 'completions'),
    where('userId', '==', user.uid)
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as HabitCompletion));
};

// Kolla om en vana är genomförd idag
export const isCompletedToday = async (habitId: string): Promise<boolean> => {
  const user = auth.currentUser;
  if (!user) return false;

  const today = new Date().toISOString().split('T')[0];

  const q = query(
    collection(db, 'completions'),
    where('userId', '==', user.uid),
    where('habitId', '==', habitId),
    where('date', '==', today)
  );
  const snapshot = await getDocs(q);
  return !snapshot.empty;
};

// Beräkna streak för en vana
export const calculateStreak = (completions: HabitCompletion[]): number => {
  if (completions.length === 0) return 0;

  const dates = completions
    .map(c => c.date)
    .sort()
    .reverse();

  let streak = 0;
  let currentDate = new Date();

  for (const date of dates) {
    const completionDate = new Date(date);
    const diffDays = Math.floor(
      (currentDate.getTime() - completionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === streak) {
      streak++;
      currentDate = completionDate;
    } else {
      break;
    }
  }
  
  return streak;
};

// Ta bort alla completions för en vana
export const deleteCompletionsForHabit = async (habitId: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Ingen användare inloggad');

  const q = query(
    collection(db, 'completions'),
    where('habitId', '==', habitId)
  );
  const snapshot = await getDocs(q);
  
  const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'completions', d.id)));
  await Promise.all(deletePromises);
};