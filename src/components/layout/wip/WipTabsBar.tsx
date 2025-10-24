import React, { useState } from 'react';
import { LayoutDashboard, Search, Plus, Users } from 'lucide-react';
import type { Trip, Activity } from '@/types';

const navItems = [
    { id: 'dashboard' as const, label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'browse' as const, label: 'Browse Activities', icon: Search },
    { id: 'members' as const, label: 'Members', icon: Users },
  ];
type NavView = 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

interface WipTabsBarProps {
  currentView: NavView;
  user: string;
  onViewChange:
   (view: NavView) => void;
  trip?: Trip | null;
  
}

export const WipTabsBar: React.FC<WipTabsBarProps> = ({ currentView, onViewChange, trip, user }) => {

return (
    <div className="fixed left-0 right-0 top-20 md:top-24 z-40 flex gap-2 flex-nowrap items-center overflow-x-auto md:overflow-visible md:flex-wrap md:gap-2 pb-5 md:pb-5 bg-gray-800/25 p-5 shadow-sm">
        {navItems.map(item => {
            const Icon = item.icon;
            return (
                <button className={`px-4 py-2 md:px-6 rounded-lg font-medium transition flex items-center gap-2 ${
                    currentView === item.id
                    ? 'bg-gray-500 text-green-600 bold shadow-lg'
                    : 'bg-gray-500 text-red-700 hover:bg-white'
                }`}
                    key={item.id}
                    onClick={() => onViewChange(item.id)}
                >
                    <Icon size={18} />
                    <span className="md:inline">{item.label}</span>
                </button>

            );
        })}
    </div>
);};