import React from 'react';
import { LayoutDashboard, Search, Plus } from 'lucide-react';

interface NavigationProps {
  currentView: 'dashboard' | 'browse' | 'create';
  onViewChange: (view: 'dashboard' | 'browse' | 'create') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'browse' as const, label: 'Browse Activities', icon: Search },
  ];

  return (
    <div className="relative max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-2 flex-wrap">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                currentView === item.id
                  ? 'bg-white text-purple-600 shadow-lg'
                  : 'bg-white/80 text-gray-700 hover:bg-white'
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
    </div>
  );
};