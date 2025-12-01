import React from 'react';
import { MapPin, LogOut, Users } from 'lucide-react';
import type {User, Trip}  from '@/types';
import { exportUserItineraryToICS } from '@/utils/helpers';
import { CalendarPlus } from 'lucide-react';

interface HeaderProps {
  trip: Trip;
  user: User;
  memberCount: number;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ trip, user, memberCount, onLogout }) => {
  const formatDateRange = () => {
    const start = new Date(trip.startDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    const end = new Date(trip.endDate).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    return `${start} - ${end}`;
  };

  return (
    
      <div className=" px-5 pb-3 mx-auto ">
        <div className="flex items-center justify-between">

            <div className="flex-1 text-left">
              {/* Trip Title*/}
              <h1 className="text-2xl md:text-3xl font-bold text-zinc-50">
                {trip.name}
              </h1>
              <h2 className="flex flex-wrap items-center gap-3 mt-1 text-md text-zinc-50">
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{trip.destination}</span>
                </div>
                <span className="hidden sm:inline">•</span>
                <span>{formatDateRange()}</span>
                <span className="hidden sm:inline">•</span>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{memberCount} members</span>
                </div>
              </h2>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="hidden md:flex flex-col items-stretch gap-2 px-3 py-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
                    alt={user.displayName}
                    className="w-8 h-8 rounded-full"
                  />
                  <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
                
                  <button className="inline-flex items-center bg-blue-200 hover:bg-blue-100 text-emerald-600 px-3 py-1 rounded ml-2"
                    onClick={() => exportUserItineraryToICS(user.id, user.displayName)}>
                    <CalendarPlus size={18} className="mr-1" /> 
                    <span className='text-xs font-bold'>
                      Export itinerary
                    </span>
                  </button>
                </div>
              </div>
            </div>
            </div>
            
      </div>
    
  );
};
