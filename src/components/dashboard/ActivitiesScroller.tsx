import React, { useRef, useState, useEffect } from 'react';
import type { Activity, User } from '@/types';
import EventsContainer from '@/components/activities/EventsContainer';
import ActivityCard from '@/components/activities/ActivityCard';
import { Calendar } from 'lucide-react';

interface ActivitiesScrollerProps {
  activities: Activity[];
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  isOwner: boolean;
  onEditActivity?: (activityId: string) => void;
}

const ActivitiesScroller: React.FC<ActivitiesScrollerProps> = ({
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

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [stickyLabel, setStickyLabel] = useState<string | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handler = () => {
      // find the first child with data-day whose top is >= container top
      const items = Array.from(container.querySelectorAll('[data-day]')) as HTMLElement[];
      const containerRect = container.getBoundingClientRect();
      let foundLabel: string | null = null;
      for (const item of items) {
        const rect = item.getBoundingClientRect();
        if (rect.bottom > containerRect.top + 10) {
          // pick this item's day
          const day = item.getAttribute('data-day');
          if (day) {
            const d = new Date(day + 'T00:00:00');
            foundLabel = d.toLocaleDateString('en-US', { weekday: 'long', day: '2-digit', month: '2-digit', year: undefined as any });
          }
          break;
        }
      }
      setStickyLabel(foundLabel);
    };

    handler();
    container.addEventListener('scroll', handler, { passive: true });
    window.addEventListener('resize', handler);
    return () => {
      container.removeEventListener('scroll', handler);
      window.removeEventListener('resize', handler);
    };
  }, [containerRef, activities]);

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
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No activities yet</h3>
            <p className="text-gray-500 mb-6">Browse activities to join the fun!</p>
          </div>
        ) : (
          <EventsContainer
            ref={containerRef}
            stickyLabel={stickyLabel}
            items={myActivities}
            getKey={(a) => a.id}
            getDayKey={(a) => new Date(a.dateTime).toISOString().slice(0, 10)}
            renderItem={(activity: Activity) => (
              <ActivityCard
                activity={activity}
                currentUser={currentUser}
                onToggleOptIn={onToggleOptIn}
                onDeleteActivity={onDeleteActivity}
                canEdit={isOwner || activity.creatorId === currentUser.id}
                canDelete={isOwner || activity.creatorId === currentUser.id}
                isActive={false}
                onSelect={undefined}
              />
            )}
          />
        )}
      </div>
    </div>
  );
};

export default ActivitiesScroller;
