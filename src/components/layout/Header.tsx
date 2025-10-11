import React from 'react';
import { MapPin, LogOut, Users } from 'lucide-react';
import type {User, Trip}  from '../../types';

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
    <div className="relative bg-white/95 backdrop-blur shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {trip.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
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
            </div>
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
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};