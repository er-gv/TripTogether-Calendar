import React from 'react';
import { Users, Trash2, FilePen, Check } from 'lucide-react';
import type { Activity, User, Trip } from '@/types';




interface ActivityCardProps {
  
  activityId: string;
  canEdit: boolean;
  canDelete: boolean;
  isActive: boolean;
  isOptedIn: boolean;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity?: (activityId: string) => void;
  
}


const ActivityButtons: React.FC<ActivityCardProps> = ({
  activityId,
  canEdit,
  canDelete,
  isActive,
  isOptedIn,
  onToggleOptIn,
  onDeleteActivity,
  onEditActivity,
  
}) => {
  const containerClass = isActive
    ? 'border-4 border-purple-600 rounded-xl p-8 transition bg-gray-100'
    : 'border-4 border-gray-200 rounded-xl p-8 hover:border-purple-400 transition bg-white';

       
  return (

    <div className="flex gap-2 flex-shrink-0">
      <button
        onClick={(e) => { 
          e.stopPropagation(); onToggleOptIn(activityId, !isOptedIn); }}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
          isOptedIn ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}>
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
                  onClick={(e) => { e.stopPropagation(); onEditActivity?.(activityId); }}
                  className="p-2 text-emerald-600 hover:bg-blue-50 rounded-lg transition"
                  title="Edit activity"
                >
                  <FilePen size={18} />
                </button>
      )}
      {(
                <button
                  onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this activity?')) { onDeleteActivity(activityId); } }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Delete activity"
                >
                  <Trash2 size={18} />
                </button>
      )}
        
    </div>      
  )};


export default ActivityButtons;
