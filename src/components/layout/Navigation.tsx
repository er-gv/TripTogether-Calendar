import React, { useState } from 'react';
import { LayoutDashboard, Search, Plus, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import { DaysList }from '@/components/layout/DaysList';
import type { Trip, Activity } from '@/types';

type NavView = 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  trip?: Trip | null;
  activities?: Activity[];
  onDayClick?: (iso: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, trip, activities = [], onDayClick }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard' as const, label: 'My Activities', icon: LayoutDashboard },
    { id: 'browse' as const, label: 'Browse Activities', icon: Search },
    { id: 'members' as const, label: 'Members', icon: Users },
  ];
  // days list handled by DaysList component
  return (
    <>
      
        <div className="max-w-7xl mx-auto ">
          
          <div className="flex gap-2 flex-nowrap items-center overflow-x-auto md:overflow-visible md:flex-wrap md:gap-2 pb-3 md:pb-3 ">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-4 py-2 md:px-6 rounded-lg font-medium transition flex items-center gap-2 ${
                    currentView === item.id
                      ? 'bg-gray-300 text-purple-600 bold shadow-lg'
                      : 'bg-gray-300 text-gray-700 hover:bg-white'
                  }`}
                >
                  {item.id === 'dashboard' && user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Me'} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <Icon size={18} />
                  )}
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={() => onViewChange('create')}
              className="ml-auto px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Activity</span>
            </button>
          </div>
          {/* Days list component */}
          <DaysList trip={trip} activities={activities} onDayClick={onDayClick} />
        </div>
      

  {/* spacer so content starts below the fixed navigation (increased to match new nav position) */}
  <div className="h-48 md:h-56" aria-hidden="true" />
  <div className="h-6" aria-hidden="true" />
  {/* No modal — clicking emits scrollToDay events */}
    </>
  );
};