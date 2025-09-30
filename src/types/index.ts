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

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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

export type ActivityTag = (typeof AVAILABLE_TAGS)[number];
