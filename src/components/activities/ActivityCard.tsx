import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Trash2, Check } from 'lucide-react';
import type { Activity, User, Trip } from '@/types';

import {formatDateTime} from '@/utils/datetime';
import { getTripLocation } from '@/services/firestore';
import { ActivityHeader} from '@/components/activities/ActivityHeader'; 
import { ActivityParticipants } from '@/components/activities/ActivityParticipants'; 
import { ActivityTags } from '@/components/activities/ActivityTags'; 
import RichTextViewer from '@/components/common/RichTextViewer';

interface ActivityCardProps {
  activity: Activity;
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  canEdit: boolean;
  isActive?: boolean;
  onSelect?: (activityId: string) => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  currentUser,
  onToggleOptIn,
  onDeleteActivity,
  canEdit,
  isActive,
  onSelect,
}) => {
  const isOptedIn = activity.optedInUsers.includes(currentUser.id);

  const containerClass = isActive
    ? 'border-4 border-purple-600 rounded-xl p-4 transition bg-gray-100'
    : 'border-4 border-gray-200 rounded-xl p-4 hover:border-purple-400 transition bg-white';

    const tripLocation = "Canada"
    const locationName = activity.location || tripLocation;
    return (
    <div className={containerClass} onClick={() => onSelect?.(activity.id)}>
      <div className="flex gap-4">
      <ActivityHeader
        name={activity.name}
        location={locationName}
        dateTime={activity.dateTime}
        thumbnailUrl={activity.thumbnailUrl}
        mapsLink={activity.mapsLink}

      />
      </div>
        
      <div className="flex gap-4">
        {/* image */}
        <div className="flex-shrink-0">
          <img
            src={activity.thumbnailUrl}
            alt={activity.name}
            className="w-40 h-40 object-cover rounded-lg shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400';
            }}
          />
        </div>

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
            
          {activity.mapsLink ?(
            <a
              href={activity.mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              onClick={(e) => e.stopPropagation()}
            >
              <MapPin size={14} />
              {activity.location}
              <ExternalLink size={12} />
            </a>
          ) : (
            <div className="text-sm text-gray-600">
              <MapPin size={14} className="inline-block mr-1" />
              {locationName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
