import React from 'react';
import { MapIcon, Compass } from 'lucide-react';
import { ActivityTags } from './ActivityTags';
import type {Activity, User } from '@/types';
import { formatDateTime } from '@/utils/datetime';

interface ActivityHeaderProps {
    name: string;
    location: string;
    mapsLink: string;
    dateTime: string;
    thumbnailUrl: string;
    tags: string[];
    currentUser: User;
}


export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
    name,
    location,
    mapsLink,
    dateTime,
    thumbnailUrl,
    tags,
}) => {
  return (
    
    <div className="flex items-start gap-4">
      <img
        src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
        alt={name}
        className="w-40 h-40 object-cover rounded-lg shadow-md"
        
      />

      <div className="flex-1 min-w-0">
        <h1 className="text-xl font-bold text-gray-800 truncate">{name}</h1>
        <div className="text-sm text-gray-500 mt-1">{formatDateTime(dateTime)}</div>
        <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            
          {mapsLink ? (
            <>
              <MapIcon className="inline-block w-4 h-4 text-gray-400" />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline truncate"
              >
                {location}
              </a>
              
            </>
          ) : (
            <>
              <Compass className="inline-block w-4 h-4 text-gray-400" />
              <span className="truncate">{location}</span>
            </>
          )}
          
        </div>
        <ActivityTags tags={tags} />
        
      </div>
    </div>

  );
};
