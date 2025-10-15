/*import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Trash2, Space, FilePen } from 'lucide-react';
import type { Activity, User } from '@/types';
import {ActivityHeader } from '@/components/activities/ActivityHeader';
import {ActivityParticipants   } from '@/components/activities/ActivityParticipants';
import ActivityContent from '@/components/activities/ActivityContent';
import { Check } from 'lucide-react';
import { formatDateTime } from '@/utils/datetime';
// ActivityTags now rendered inside ActivityContent

interface MyActivityCardProps {
  activity: Activity;
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  canEdit: boolean;
  onEditActivity?: (activityId: string) => void;
}

export const MyActivityCard: React.FC<MyActivityCardProps> = ({
  activity,
  currentUser,
  onToggleOptIn,
  onDeleteActivity,
  canEdit,
  onEditActivity,
}) => {
  const isOptedIn = activity.optedInUsers.includes(currentUser.id);

 
  return (
  <div className="p-5 border-2 border-red-600 rounded-lg shadow-sm hover:shadow-md transition mb-2">
      
      
      
      
      <ActivityHeader
        name={activity.name}
        location={activity.location}
        dateTime={activity.dateTime}
        thumbnailUrl={activity.thumbnailUrl}
        mapsLink={activity.mapsLink}
      />
  <div className="my-4 border-b border-gray-300" />
  <ActivityContent description={activity.description} tags={activity.tags} />
  <div className="my-4 border-b border-gray-300" />
     
      <ActivityParticipants
        participants={activity.optedInUsers}
        onToggleOptIn={() => onToggleOptIn(activity.id, !isOptedIn)}
      />
      </div>
      


     
      
      
    /*  <div className="flex gap-4">
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-800 mb-1">{activity.name}</h3>
              <p className="text-sm text-gray-500 mb-2">Created by {activity.creatorName}</p>
              <RichTextViewer html={activity.description ?? ''} />
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditActivity && onEditActivity(activity.id); }}
                    className="p-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    title="Edit activity"
                  >
                    <FilePen size={18} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (confirm('Are you sure you want to delete this activity?')) { onDeleteActivity(activity.id); } }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Delete activity"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Calendar size={16} />
              <span>{formatDateTime(activity.dateTime)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={16} />
              <span className="truncate">{activity.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={16} />
              <span>{activity.optedInUsers.length} joined</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {activity.tags.map((tag) => (
              <span key={tag} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>

          {activity.mapsLink && (
            <a
              href={activity.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={14} />
              View on Google Maps
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
    
  );
};

   */