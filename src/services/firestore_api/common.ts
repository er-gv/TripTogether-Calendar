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
