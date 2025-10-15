import {
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import type { Tag } from '@/types';

// Collections

const TAGS_COLLECTION = 'tags';
export const readTagsCollection = async (): Promise<Tag[]> => {

  const q = query(collection(db, TAGS_COLLECTION), orderBy('name', 'asc'));
  const tagDocs = await getDocs(q);
  if (tagDocs.empty) return [];

  return tagDocs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tag));
};
