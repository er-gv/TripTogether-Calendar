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
    <div className="grid grid-cols-[40%_60%] items-start gap-4">
      {/* Left: thumbnail */}
      <div className="flex items-start">
        <img
          src={thumbnailUrl === '' ? '/default_thumbnail.jpg' : thumbnailUrl}
          alt={name}
          className="w-60 h-60 object-cover rounded-lg shadow-md"
        />
      </div>

      {/* Right: text area with buttons row at bottom-right */}
      <div className="min-w-0 flex flex-col justify-between h-60">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{name}</h1>

          <div className="flex items-center mt-2 text-sm text-gray-700">
            {mapsLink ? (
              <>
                <MapPin className="inline-block w-4 h-4 text-blue-600 mr-1" />
                <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-md text-blue-600 hover:underline">
                  {location}
                </a>
              </>
            ) : (
              <>
                <MapPin className="inline-block w-4 h-4 text-gray-400 mr-1" />
                <span>{location}</span>
              </>
            )}
          </div>

          <div className="flex items-center mt-2 text-sm text-gray-600">
            <CalendarDays className="inline-block w-4 h-4 text-gray-400 mr-1" />
            <div>{formatDateTime(dateTime)}</div>
          </div>
        </div>

        <div className="self-start mt-3 bg-green-100">
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

