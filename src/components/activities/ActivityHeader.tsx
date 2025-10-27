import React from 'react';
import { MapPin, CalendarDays } from 'lucide-react';
import ActivityButtons from './ActivityButtons';
import { formatDateTime } from '@/utils/datetime';

interface ActivityHeaderProps {
  name: string;
  location: string;
  mapsLink?: string;
  dateTime: string;
  thumbnailUrl?: string;
  // Optionally allow parent to supply a custom buttons node (with proper handlers)
  buttons?: React.ReactNode;
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({ name, location, mapsLink, dateTime, thumbnailUrl = '', buttons }) => {
  return (
  // use a horizontal flex layout where thumbnail is fixed 60x60 and the
  // content pane to the right matches that height (h-[60px])
  <div className="flex items-center gap-10">
      {/* Left: thumbnail (180x180) */}
      <div className="flex-none w-[180px] h-[180px]">
        <img
          src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
          alt={name}
          className="w-full h-full object-cover rounded-md shadow-md"
        />
      </div>

      {/* Right: content pane matching thumbnail height (180px) */}
      <div className="flex-1 min-w-0 h-[180px] flex items-top justify-between">
        <div className="min-w-0 overflow-hidden">
          <div className="flex flex-col ">
          <h1 className="font-bold text-xl text-gray-800 truncate">{name}</h1>
          <h2 className="font-bold text-md text-gray-600 truncate">{formatDateTime(dateTime)}</h2>

          <div className="flex items-center text-xs text-gray-700 truncate">
            {mapsLink ? (
              <>
                <MapPin className="inline-block w-3 h-3 text-blue-600 font-bold mr-1 flex-shrink-0" />
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate">
                  {location}
                </a>
              </>
            ) : (
              <>
                <MapPin className="inline-block w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                <span font-bold className="truncate">{location}</span>
              </>
            )}
          </div>
          
          
        </div>


        </div>
      </div>
    </div>
  );
};

export default ActivityHeader;

