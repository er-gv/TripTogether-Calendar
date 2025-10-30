import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { db } from '@/services/firebase';   
import type { Trip, Activity, User } from '@/types';

// Collections
const TRIPS_COLLECTION = 'trips';
const ACTIVITIES_COLLECTION = 'activities';
const USERS_COLLECTION = 'users';

// User Operations
export const createOrUpdateUser = async (userData: User): Promise<void> => {
  await setDoc(doc(db, USERS_COLLECTION, userData.id), userData);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userDoc = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!userDoc.exists()) return null;
  
  return userDoc.data() as User;
};

export const getUsersByIds = async (userIds: string[]): Promise<User[]> => {
  if (userIds.length === 0) return [];
  
  const users: User[] = [];
  for (const userId of userIds) {
    const user = await getUser(userId);
    if (user) users.push(user);
  }
  return users;
};