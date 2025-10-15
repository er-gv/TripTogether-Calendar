export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  timezone: string;
  startDate: string;
  endDate: string;
  ownerId: string;
  memberIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  tripId: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  mapsLink: string;
  dateTime: string;
  location: string;
  tags: string[];
  creatorId: string;
  creatorName: string;
  optedInUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Tag {
  id: string;
  name: string;
}
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  
  signInWithEmail: (email: string, password: string) => Promise<void>;  
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signUpWithGoogle: () => Promise<void>;
  signUpWithApple: () => Promise<void>;
  signUpWithFacebook: () => Promise<void>;
    
  signOut: () => Promise<void>;
}

export interface TripContextType {
  currentTrip: Trip | null;
  members: User[];
  loading: boolean;
  joinTrip: (tripId: string) => Promise<void>;
  createTrip: (tripData: Partial<Trip>) => Promise<string>;
  leaveTrip: () => void;
}



export const AVAILABLE_TAGS = [
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
] as const;

// Call the function to add your tags

export type ActivityTag = (typeof AVAILABLE_TAGS)[number];
