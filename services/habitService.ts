import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc,
  doc,
  query,
  where,
  serverTimestamp
} from 'firebase/firestore';
import { Habit } from '../types';
import { deleteCompletionsForHabit } from './completionService';

// Skapa en ny vana
export const createHabit = async (name: string, category: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Ingen användare inloggad');

  const docRef = await addDoc(collection(db, 'habits'), {
    name,
    category,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
};

// Hämta alla vanor för inloggad användare
export const getHabits = async (): Promise<Habit[]> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Ingen användare inloggad');

  const q = query(collection(db, 'habits'), where('userId', '==', user.uid));
  const snapshot = await getDocs(q);

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Habit));
};

// Ta bort en vana
export const deleteHabit = async (habitId: string) => {
  await deleteDoc(doc(db, 'habits', habitId));
  await deleteCompletionsForHabit(habitId);
};