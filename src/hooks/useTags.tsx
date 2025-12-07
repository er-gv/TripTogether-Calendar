import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import type { Tag } from '@/types';

const AVAILABLE_TAGS = [
  'Adventure',
  'Art',
  'Beach',
  'Concert',
  'Cruise',
  'Culture',
  'Dining',
  'Evening',
  'Family time',
  'Festival',
  'Flight',
  'Food',
  'Get together',
  'Hike',
  'Hotel',
  'Landmark',
  'Museum',
  'Nightlife',
  'Park',
  'Romantic',
  'Shopping',
  'Sightseeing',
  'Sports',
  'Theater',
  'Transport'
];
/** Script to add AVAILABLE_TAGS to Firestore collection "tags" */


// Function to add tags to Firestoreexort 
export async function readTagsFromFirestore() {
  try {
    // Initialize Firestore (assuming Firebase app is already initialized)
    const db = getFirestore();

    // Your list of strings  
    const tagsCollectionRef = collection(db, "tags");
  
  
    console.log("Reading tags from Firestore...");
    const querySnapshot = await getDocs(query(tagsCollectionRef));
    console.log(`Retrieved ${querySnapshot.size} tags from Firestore.`);
    const listOfTags = querySnapshot.docs.map(doc => ({id: doc.id, name: String(doc.data().name)}));
    console.log("Tags retrieved:", listOfTags);
    for (const tag of listOfTags) {
      console.log(`Reading tag "${tag.id}: ${tag.name}".`); 
    } 
    return listOfTags as Tag[];

  } catch (error) {
    console.error(`Error reading tags: `, error);
    return [];
  }
}



// Function to add tags to Firestore
export async function addTagsToFirestore() {
  
// Initialize Firestore (assuming Firebase app is already initialized)
    const db = getFirestore();

// Your list of strings
    const listOfTags = AVAILABLE_TAGS;
    const tagsCollectionRef = collection(db, "tags");

  for (const tagName of listOfTags) {
    try {
      const querySnapshot = await getDocs(query(tagsCollectionRef, where("name", "==", tagName)));
      if (querySnapshot.empty) {
        await addDoc(tagsCollectionRef, { name: tagName });
        console.log(`Tag "${tagName}" added to Firestore.`);
      } else {
        console.log(`Tag "${tagName}" already exists.`);
        continue;
      }      

    } catch (error) {
      console.error(`Error adding tag "${tagName}": `, error);
    }
  }
}

