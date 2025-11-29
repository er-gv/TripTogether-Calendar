 
import React from 'react';
import { MapPin, CalendarDays } from 'lucide-react';
import ActivityButtons from './ActivityButtons';
import { formatDateTime } from '@/utils/datetime';
import ActivityTags from './ActivityTags';
import compass from '@/assets/compass.png';

interface ActivityHeaderProps {
  name: string;
  location: string;
  mapsLink?: string;
  dateTime: string;
  thumbnailUrl?: string;
  // Optionally allow parent to supply a custom buttons node (with proper handlers)
  buttons?: React.ReactNode;
  tags: string[];
}

const ActivityHeader: React.FC<ActivityHeaderProps> = ({ name, location, mapsLink, dateTime, thumbnailUrl = '', buttons, tags = [] }) => {
  return (
  // use a horizontal flex layout where thumbnail is fixed 60x60 and the
  // content pane to the right matches that height (h-[60px])
  <div className="flex items-center gap-10 ">
      {/* Left: thumbnail (180x180) */}
      <div className="flex-none w-[130px] h-[170px]">
        <img
          src={thumbnailUrl === '' ? compass : thumbnailUrl}
          alt={name}
          className="w-full h-full object-cover rounded-md shadow-md"
        />
      </div>

      {/* Right: content pane matching thumbnail height (170px) */}
      <div className="flex-1 min-w-0 h-[170px] flex items-top">
        <div className="min-w-0 overflow-hidden flex-1 flex flex-col justify-between">
          <div className="flex flex-col h-full justify-between items-start">
            <div className="items-start w-full">
              <h1 className="mb-2 font-bold text-xl text-gray-800 text-left truncate">{name}</h1>
              <h2 className="mb-2 font-bold text-md text-gray-600 text-left truncate">{formatDateTime(dateTime)}</h2>

              <div className="flex items-start justify-start text-sm text-gray-700 truncate">
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
            
            {tags && tags.length > 0 && (
              <div className="self-end w-full flex justify-start mt-2">
                <ActivityTags tags={tags} />
              </div>
            )}
          </div>


        </div>
      </div>
    </div>
  );
};

export default ActivityHeader;

