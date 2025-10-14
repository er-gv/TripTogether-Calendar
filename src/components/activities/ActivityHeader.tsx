import React from 'react';
import { MapPin } from 'lucide-react';
import type {Activity, User } from '@/types';
import { formatDateTime } from '@/utils/datetime';

interface ActivityHeaderProps {
    name: string;
    location: string;
    mapsLink: string;
    dateTime: string;
    thumbnailUrl: string;
}


export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
    name,
    location,
    mapsLink,
    dateTime,
    thumbnailUrl,
}) => {
  return (
    
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <img
        src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
        alt={name}
        className="w-full sm:w-40 sm:h-40 h-auto object-cover rounded-lg shadow-md"
      />

      <div className="flex-1 min-w-0 sm:flex sm:flex-col sm:justify-between sm:h-40">
        <div>
          <h1 className="text-xl font-bold text-gray-800 mt-2 truncate">{name}</h1>
          <div className="text-sm text-gray-600 mt-1">{formatDateTime(dateTime)}</div>
          {/* tags removed from header - rendered elsewhere */}
        </div>

        <div className="flex items-center gap-1 mt-2 sm:mt-1">
            
          {mapsLink ? (
            <>
              <MapPin className="inline-block w-4 h-4 text-blue-600" />
              <a
                href={mapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-blue-600 hover:underline truncate"
              >
                {location}
              </a>
              
            </>
          ) : (
            <>
              <MapPin className="inline-block w-4 h-4 text-gray-400" />
              <span className="truncate">{location}</span>
            </>
          )}
          
        </div>
        
        

      </div>
    </div>

  );
};
