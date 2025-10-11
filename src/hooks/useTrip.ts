import { useState, useEffect } from 'react';
import type { Trip, User } from '@/types';
import { getTrip, addMemberToTrip, getUsersByIds } from '@/services/firestore';

export const useTrip = (tripId: string | null, userId: string | null) => {
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tripId || !userId) {
      setCurrentTrip(null);
      setMembers([]);
      return;
    }

    const loadTrip = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const trip = await getTrip(tripId);
        
        if (!trip) {
          setError('Trip not found');
          setCurrentTrip(null);
          setMembers([]);
          return;
        }

        // Check if user is a member
        if (!trip.memberIds.includes(userId)) {
          // Add user to trip if not already a member
          await addMemberToTrip(tripId, userId);
          trip.memberIds.push(userId);
        }

        setCurrentTrip(trip);

        // Load members
        const tripMembers = await getUsersByIds(trip.memberIds);
        setMembers(tripMembers);
      } catch (err) {
        console.error('Error loading trip:', err);
        setError('Failed to load trip');
      } finally {
        setLoading(false);
      }
    };

    loadTrip();
  }, [tripId, userId]);

  return { currentTrip, members, loading, error };
};