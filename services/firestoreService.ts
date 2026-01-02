
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const saveData = async (userId, data) => {
  await setDoc(doc(db, 'userProgress', userId), data, { merge: true });
};

export const loadData = async (userId) => {
  const docRef = doc(db, 'userProgress', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
