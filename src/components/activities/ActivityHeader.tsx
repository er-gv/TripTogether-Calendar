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
    // use a horizontal flex layout where thumbnail is fixed 48x48 and the
    // content pane to the right matches that height (h-12)
    <div className="flex items-center gap-4">
      {/* Left: thumbnail (180x180) */}
      <div className="flex-none w-[180px] h-[180px]">
        <img
          src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
          alt={name}
          className="w-full h-full object-cover rounded-md shadow-md"
        />
      </div>

      {/* Right: content pane matching thumbnail height (180px) */}
      <div className="flex-1 min-w-0 h-[180px] flex items-center justify-between">
        <div className="min-w-0 overflow-hidden">
          <h1 className="text-base font-bold text-gray-800 truncate">{name}</h1>

          <div className="flex items-center text-xs text-gray-700 truncate">
            {mapsLink ? (
              <>
                <MapPin className="inline-block w-3 h-3 text-blue-600 mr-1 flex-shrink-0" />
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate">
                  {location}
                </a>
              </>
            ) : (
              <>
                <MapPin className="inline-block w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                <span className="truncate">{location}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center ml-4">
          {buttons ?? (
            <ActivityButtons
              activityId={''}
              canEdit={false}
              canDelete={false}
              isActive={false}
              isOptedIn={false}
              onToggleOptIn={() => {}}
              onDeleteActivity={() => {}}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityHeader;

