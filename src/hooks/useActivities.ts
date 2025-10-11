import { useState, useEffect } from 'react';
import type { Activity } from '../types/';
import { 
  getActivitiesByTrip, 
  createActivity as createActivityFS,
  updateActivity as updateActivityFS,
  deleteActivity as deleteActivityFS,
  toggleActivityOptIn 
} from '../services/firestore';

export const useActivities = (tripId: string | null) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const loadActivities = async () => {
    if (!tripId) {
      setActivities([]);
      return;
    }

    setLoading(true);
    try {
      const data = await getActivitiesByTrip(tripId);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, [tripId]);

  const createActivity = async (activityData: Omit<Activity, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createActivityFS(activityData);
      await loadActivities();
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  };

  const updateActivity = async (activityId: string, data: Partial<Activity>) => {
    try {
      await updateActivityFS(activityId, data);
      await loadActivities();
    } catch (error) {
      console.error('Error updating activity:', error);
      throw error;
    }
  };

  const deleteActivity = async (activityId: string) => {
    try {
      await deleteActivityFS(activityId);
      await loadActivities();
    } catch (error) {
      console.error('Error deleting activity:', error);
      throw error;
    }
  };

  const editActivity = async (activityId: string, data: Partial<Activity>) => {
    try {
      await updateActivityFS(activityId, data);
      await loadActivities();
    } catch (error) {
      console.error('Error editing activity:', error);
      throw error;
    }
  };

  const toggleOptIn = async (activityId: string, userId: string, optIn: boolean) => {
    try {
      await toggleActivityOptIn(activityId, userId, optIn);
      await loadActivities();
    } catch (error) {
      console.error('Error toggling opt-in:', error);
      throw error;
    }
  };

  return {
    activities,
    loading,
    createActivity,
    updateActivity,
    editActivity,
    deleteActivity,
    toggleOptIn,
    refresh: loadActivities,
  };
};