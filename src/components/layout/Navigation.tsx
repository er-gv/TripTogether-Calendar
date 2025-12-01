import React, { useState } from 'react';
import { LayoutDashboard, Search, Plus, Users, Bug } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

import type { Trip, Activity } from '@/types';
import type { ViewMode } from '@/types';
import { LogoutButton } from '../common/LogoutButton';



//type NavView = 'debug' | 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

interface NavigationProps {
  currentView: ViewMode;
  isCurrentUserOnly: boolean;
  onSetCurrentUserFilter: (isCurrentUserOnly: boolean) => void;
  onSetFilterMember: (memberId: string) => void;
  onViewChange: (view: ViewMode) => void;
  onSetPrevView: (view: ViewMode) => void;
  onLogout: () => void;

}

export const Navigation: React.FC<NavigationProps> = ({ 
  currentView, 
  isCurrentUserOnly,
  onSetCurrentUserFilter, 
  onSetFilterMember,
  onViewChange,
  onSetPrevView,
  onLogout 
}) => {
  
  const { user} = useAuth();
  // days list handled by DaysList component
  return (
    <div className="">
      
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 gap-2 p-2">
            <button key='currentUserActivities'
                  className={`px-4 py-2 md:px-6 rounded-lg font-medium transition flex items-center gap-2 
                    ${currentView === 'activitiesView' && isCurrentUserOnly
                      ? 'bg-gray-300 text-purple-600 bold shadow-lg'
                      : 'bg-gray-300 text-gray-700 hover:bg-white'
                    }`
                  }
                  onClick={() => {
                    onSetCurrentUserFilter(true)
                    onSetFilterMember('');
                    onViewChange('activitiesView');
                  }}
                  
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || 'Me'} className="w-5 h-5 rounded-full object-cover" />
                  ) : ( <LayoutDashboard size={18} />)}
                  <span className="hidden sm:inline">My Activities</span>
            </button>

            <button key='allActivities'
              className={`px-4 py-2 md:px-6 rounded-lg font-medium transition flex items-center gap-2 
                ${currentView === 'activitiesView' && !isCurrentUserOnly
                  ? 'bg-gray-300 text-purple-600 bold shadow-lg'
                  : 'bg-gray-300 text-gray-700 hover:bg-white'
                }`
              }
              onClick={() => {
                onSetCurrentUserFilter(false)
                onSetFilterMember('');
                onViewChange('activitiesView');
              }}
              
            >
              <span className="hidden sm:inline">Browse Activities</span>
            </button>

            <button key='membersList'
              className={`px-4 py-2 md:px-6 rounded-lg font-medium transition flex items-center gap-2 
                ${currentView === 'membersView'
                  ? 'bg-gray-300 text-purple-600 bold shadow-lg'
                  : 'bg-gray-300 text-gray-700 hover:bg-white'
                }`
              }
              onClick={() => {
                onViewChange('membersView');
              }}
              
            >
              <span className="hidden sm:inline">Trip Members</span>
            </button>
            <button
              onClick={() => {
                onSetPrevView(currentView);
                onViewChange('create');
              }}
              className="px-4 py-2 md:px-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transform hover:scale-105 transition flex items-center gap-2"
          >
              <Plus size={18} />
              <span className="hidden sm:inline">Create Activity</span>
            </button>
            <LogoutButton onLogout={onLogout} />
          </div>
          
        </div>
      

    </div>
  );
};