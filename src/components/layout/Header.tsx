import React from 'react';
import { MapPin, LogOut, Users } from 'lucide-react';
import type {User, Trip}  from '../../types';
import { LogoutButton } from '../common/LogoutButton';

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
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {/* Trip Title*/}
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {trip.name}
              </h1>
              <h2 className="flex flex-wrap items-center gap-3 mt-1 text-md text-gray-600">
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
      </div>
      {/* spacer to keep content from being hidden behind the fixed header */}
      <div className="h-20 md:h-24" aria-hidden="true" />
    </>
  );
};