import React from 'react';
import { Users, Trash2, FilePen, Check } from 'lucide-react';
import type { Activity, User, Trip } from '@/types';

import { ActivityHeader} from '@/components/activities/ActivityHeader'; 
import { ActivityParticipants } from '@/components/activities/ActivityParticipants'; 

import ActivityContent from './ActivityContent';

  

interface ActivityCardProps {
  activity: Activity;
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity?: (activityId: string) => void;
  canEdit: boolean;
  canDelete: boolean;
  isActive?: boolean;
  onSelect?: (activityId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currentUser,
  canEdit,
  canDelete,
  isActive,
  onToggleOptIn,
  onDeleteActivity,
  onEditActivity,
  onSelect,
}) => {
  const isOptedIn = activity.optedInUsers.includes(currentUser.id);
    const containerClass = isActive
    ? 'border-4 border-purple-600 rounded-xl p-8 transition bg-gray-100'
    : 'border-4 border-gray-200 rounded-xl p-8 hover:border-purple-400 transition bg-white';

    
    
    return (
    <div className={containerClass} onClick={() => onSelect?.(activity.id)}>
      <div className="flex gap-4">
        <ActivityHeader
          name={activity.name}
          location={activity.location}
          dateTime={activity.dateTime}
          thumbnailUrl={activity.thumbnailUrl}
          mapsLink={activity.mapsLink}
          currentUser={currentUser}
           
        />
        
      </div>
        
      <div className="flex gap-4 pt-8">
       <ActivityContent description={activity.description} tags={activity.tags} />
      </div>
      <div className="flex flex-col justify-between ml-auto">
        <ActivityParticipants
          participants={activity.optedInUsers}
          onToggleOptIn={() => onToggleOptIn(activity.id, !isOptedIn)}
        />
      </div>
       
        
      <div className="flex gap-2 flex-shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onToggleOptIn(activity.id, !isOptedIn); }}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            isOptedIn ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-purple-500 text-white hover:bg-purple-600'
          }`}
        >
          {isOptedIn ? (
            <>
              <Check size={18} />
              Joined
            </>
          ) : (
            <>
              <Users size={18} />
              Join
            </>
          )}
        </button>
        {canEdit && (
                <button
                  onClick={(e) => { e.stopPropagation(); onEditActivity?.(activity.id);  }}
                  className="p-2 text-emerald-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit activity"
                >
                  <FilePen size={18} />
                </button>
         )}
         { (
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this activity?')) { onDeleteActivity(activity.id); } }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Delete activity"
                >
                  <Trash2 size={18} />
                </button>
         )}

        
      </div>      
    </div>
    
  );
};

export default ActivityCard;
