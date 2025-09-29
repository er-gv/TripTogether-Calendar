import { initializeApp } from 'firebase/app';
import firebaseConfig from './config/firebase-config';

const app = initializeApp(firebaseConfig);
// ...existing code...

// Your existing code to interact with Firebase services

// For example, to use Firestore:
// import { getFirestore } from 'firebase/firestore';
// const db = getFirestore(app);
