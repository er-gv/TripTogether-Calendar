import React, { useEffect } from 'react';
import type { Activity, User } from '../../types';
import { MyActivityCard } from './MyActivityCard';
import { Calendar } from 'lucide-react';

interface DashboardProps {
  activities: Activity[];
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  isOwner: boolean;
  onEditActivity?: (activityId: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activities,
  currentUser,
  onToggleOptIn,
  onDeleteActivity,
  isOwner,
  onEditActivity,
}) => {
  const myActivities = activities
    .filter(act => act.optedInUsers.includes(currentUser.id))
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  useEffect(() => {
    const handler = (e: Event) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detail = (e as CustomEvent).detail as { iso: string } | undefined;
        if (!detail || !detail.iso) return;
        const targetIso = new Date(detail.iso).toISOString();

        // Find first activity occurring on that ISO date (compare date portion)
        const targetDate = new Date(detail.iso);
        const targetDayKey = targetDate.toISOString().slice(0, 10); // YYYY-MM-DD

        // Query DOM for element with data-day attribute
        const el = document.querySelector(`[data-day="${targetDayKey}"]`);
        if (el) {
          // Calculate offset to account for fixed header+nav. We'll use 120px as a safe estimate.
          const offset = 120;
          const rect = (el as HTMLElement).getBoundingClientRect();
          const top = window.scrollY + rect.top - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      } catch (err) {
        // ignore
      }
    };

    window.addEventListener('scrollToDay', handler as EventListener);
    return () => window.removeEventListener('scrollToDay', handler as EventListener);
  }, [myActivities]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 pb-8">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Calendar className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Activities</h2>
            <p className="text-sm text-gray-600">
              {myActivities.length} {myActivities.length === 1 ? 'activity' : 'activities'} you're joining
            </p>
          </div>
        </div>

        {myActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No activities yet
            </h3>
            <p className="text-gray-500 mb-6">
              Browse activities to join the fun!
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myActivities.map(activity => {
              const dayKey = new Date(activity.dateTime).toISOString().slice(0, 10);
              return (
                <div key={activity.id} data-day={dayKey}>
                  <MyActivityCard
                    activity={activity}
                    currentUser={currentUser}
                    onToggleOptIn={onToggleOptIn}
                    onDeleteActivity={onDeleteActivity}
                    canEdit={activity.creatorId === currentUser.id || isOwner}
                    onEditActivity={onEditActivity}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};