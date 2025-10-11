import { getFirestore, collection, addDoc, query, where, getDocs } from "firebase/firestore";

const AVAILABLE_TAGS = [
  'flight',
  'hotel',
  'transport',
  'dining',  
  'sightseeing',
  'museum',
  'concert',
  'hike',
  'park',
  'theater',
  'festival',
  'shopping',
  'food',
  'art',
  'culture',
  'cruise',
  'evening',
  'romantic',
  'adventure',
  'landmark',
  'beach',
  'sports',
  'family time',
  'get together',
  'nightlife'
];
/** Script to add AVAILABLE_TAGS to Firestore collection "tags" */



// Function to add tags to Firestore
async function addTagsToFirestore() {
  
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

// Call the function to add your tags
export default addTagsToFirestore;
