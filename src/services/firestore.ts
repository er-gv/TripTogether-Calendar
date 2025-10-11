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
import { db } from './firebase';
import type { Trip, Activity, User } from '../types';

// Collections
const TRIPS_COLLECTION = 'trips';
const ACTIVITIES_COLLECTION = 'activities';
const USERS_COLLECTION = 'users';

// Trip Operations
export const createTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const tripRef = await addDoc(collection(db, TRIPS_COLLECTION), {
    ...tripData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return tripRef.id;
};

export const getTrip = async (tripId: string): Promise<Trip | null> => {
  const tripDoc = await getDoc(doc(db, TRIPS_COLLECTION, tripId));
  if (!tripDoc.exists()) return null;
  
  return {
    id: tripDoc.id,
    ...tripDoc.data(),
  } as Trip;
};

export const updateTrip = async (tripId: string, data: Partial<Trip>): Promise<void> => {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const addMemberToTrip = async (tripId: string, userId: string): Promise<void> => {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    memberIds: arrayUnion(userId),
    updatedAt: Timestamp.now(),
  });
};

export const removeMemberFromTrip = async (tripId: string, userId: string): Promise<void> => {
  await updateDoc(doc(db, TRIPS_COLLECTION, tripId), {
    memberIds: arrayRemove(userId),
    updatedAt: Timestamp.now(),
  });
};

// Activity Operations
export const createActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const activityRef = await addDoc(collection(db, ACTIVITIES_COLLECTION), {
    ...activityData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });
  return activityRef.id;
};

export const getActivitiesByTrip = async (tripId: string): Promise<Activity[]> => {
  const q = query(
    collection(db, ACTIVITIES_COLLECTION),
    where('tripId', '==', tripId),
    orderBy('dateTime', 'asc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Activity[];
};

export const updateActivity = async (activityId: string, data: Partial<Activity>): Promise<void> => {
  await updateDoc(doc(db, ACTIVITIES_COLLECTION, activityId), {
    ...data,
    updatedAt: Timestamp.now(),
  });
};

export const deleteActivity = async (activityId: string): Promise<void> => {
  await deleteDoc(doc(db, ACTIVITIES_COLLECTION, activityId));
};

export const toggleActivityOptIn = async (activityId: string, userId: string, optIn: boolean): Promise<void> => {
  await updateDoc(doc(db, ACTIVITIES_COLLECTION, activityId), {
    optedInUsers: optIn ? arrayUnion(userId) : arrayRemove(userId),
    updatedAt: Timestamp.now(),
  });
};

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