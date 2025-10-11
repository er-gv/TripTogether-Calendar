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