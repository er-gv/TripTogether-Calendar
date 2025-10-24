import React, { useState } from 'react';
import { LayoutDashboard, Search, Plus, Users } from 'lucide-react';
import { wipDaysList } from './wipDaysList';
import type { Trip, Activity } from '@/types';

type NavView = 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  trip: Trip;
  activities: Activity[];
  onDayClick?: (iso: string) => void;
}

export const wipNavigation: React.FC<NavigationProps> = ({ currentView, onViewChange, trip, activities = [], onDayClick }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'browse' as const, label: 'Browse Activities', icon: Search },
    { id: 'members' as const, label: 'Members', icon: Users },
  ];
  // days list handled by DaysList component
  return (
    <>
      <div className="fixed left-0 right-0 top-20 md:top-48 z-40">
        <div className="max-w-7xl mx-auto bg-white/95 p-4 md:p-6 rounded-2xl shadow-sm">
          
          <div className="flex gap-2 flex-nowrap items-center overflow-x-auto md:overflow-visible md:flex-wrap md:gap-2 pb-2 md:pb-0">
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
                  <Icon size={18} />
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
          <wipDaysList trip={trip} activities={activities} onDayClick={onDayClick} />
        </div>
      </div>

  {/* spacer so content starts below the fixed navigation (increased to match new nav position) */}
  <div className="h-48 md:h-56" aria-hidden="true" />
  <div className="h-6" aria-hidden="true" />
  {/* No modal — clicking emits scrollToDay events */}
    </>
  );
};