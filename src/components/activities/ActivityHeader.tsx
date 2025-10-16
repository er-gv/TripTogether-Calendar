import React from 'react';
import { MapPin, Compass } from 'lucide-react';
import { ActivityTags } from './ActivityTags';
import type {Activity, User } from '@/types';
import { formatDateTime } from '@/utils/datetime';
import  ActivityButtons  from './ActivityButtons';    

interface ActivityHeaderProps {
    name: string;
    location: string;
    mapsLink: string;
    dateTime: string;
    thumbnailUrl: string;
    currentUser: User;
    
}


export const ActivityHeader: React.FC<ActivityHeaderProps> = ({
    name,
    location,
    mapsLink,
    dateTime,
    thumbnailUrl,
    
    
}) => {
  return (
    
    <div className="flex items-start gap-6">
      <img
        src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
        alt={name}
        className="w-40 h-40 object-cover rounded-lg shadow-md"
        
      />

      <div className="flex-1 min-w-0">
        
        <h1 className="text-xl font-bold text-gray-800  mt-2 truncate">{name}</h1>
        <h2 className="text-xl xl:text-gray-700 mt-1 ">{formatDateTime(dateTime)}</h2>
        <div className="flex items-bottom   ">
            
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
        <div className="flex items-center mt-2">
        </div>
        
        

      </div>
    </div>

  );
};
