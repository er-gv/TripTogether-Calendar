import React from 'react';
import { Calendar, MapPin, Users, ExternalLink, Trash2, Edit2, Edit } from 'lucide-react';
import type { Activity, User } from '../../types';
import { formatDateTime } from '../../utils/helpers';
import RichTextViewer from '../common/RichTextViewer';

interface MyActivityCardProps {
  activity: Activity;
  currentUser: User;
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity: (activityId: string) => void;
  canEdit: boolean;
  isActive?: boolean;
  onSelect?: (activityId: string) => void;
}

export const MyActivityCard: React.FC<MyActivityCardProps> = ({
  activity,
  currentUser,
  onToggleOptIn,
  onDeleteActivity,
  onEditActivity,
  canEdit,
  isActive,
  onSelect,
}) => {
  const isOptedIn = activity.optedInUsers.includes(currentUser.id);
  const containerClass = isActive
    ? 'border-4 border-purple-600 rounded-xl p-4 transition bg-gray-100'
    : 'border-4 border-gray-200 rounded-xl p-4 hover:border-purple-400 transition bg-white';

  return (
    <div className={containerClass} onClick={() => onSelect?.(activity.id)}>
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="flex-shrink-0">
          <img
            src={activity.thumbnailUrl}
            alt={activity.name}
            className="w-32 h-32 object-cover rounded-lg shadow-md"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://p7.hiclipart.com/preview/871/125/261/world-travel-attractions-landmark-vector-material.jpg';
            }}
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h5 className="text-xl font-bold text-gray-800 mb-1">
                {activity.name}
              </h5>
              <div className="text-md text-black-600 mb-3">
                <RichTextViewer html={activity.description ?? ''} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              {canEdit && (
                <button
                  onClick={() => {
                    onEditActivity(activity.id);
                  }}
                  className="p-2 text-orange-900 hover:bg-red-50 rounded-lg transition"
                  title="Edit activity"
                >
                  <Edit size={18} />
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this activity?')) {
                      onDeleteActivity(activity.id);
                    }
                  }}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  title="Delete activity"
                >
                  <Trash2 size={18} />
                </button>
                
              )}
              
                
              
            </div>
          </div>

          {/* Info Row */}
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

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {activity.tags.map(tag => (
              <span
                key={tag}
                className="px-3 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Links */}
          {activity.mapsLink && (
            
              <a href={activity.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-extra-large"
                          ><MapPin size={14} />
                           View on Google Maps 
                            <ExternalLink size={12} /></a>
          )}
        </div>
      </div>
    </div>
  );
};