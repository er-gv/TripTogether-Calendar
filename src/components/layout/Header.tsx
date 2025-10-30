import React from 'react';
import { MapPin, LogOut, Users } from 'lucide-react';
import type {User, Trip}  from '@/types';
import { LogoutButton } from '@/components/common/LogoutButton';

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
    <header className="w-full backdrop-blur bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-lg">
      <div className="max-w-7xl py-3 px-2 mx-auto shadow-2xl">
        <div className="flex items-center justify-between">

            <div className="flex-1">
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

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg">
                <img
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName)}`}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-sm font-medium text-gray-700">{user.displayName}</span>
              </div>
              <LogoutButton onLogout={onLogout} />
              
            </div>
            
          </div>
            
            
      </div>
    </header>
  );
};