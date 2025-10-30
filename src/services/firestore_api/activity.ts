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

export const getTripLocation = async (tripId: string): Promise<string> => {
  const q = query(
    collection(db, TRIPS_COLLECTION),
    where('id', '==', tripId)
  );
  
  const snapshot = await getDocs(q);
  const trip = snapshot.docs[0].data() as Trip;
  return trip.destination;
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