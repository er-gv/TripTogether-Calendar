import React, { useState } from 'react';
import { LayoutDashboard, Search, Plus, Users } from 'lucide-react';
import { getDatesBetween } from '../../utils/helpers';
import type { Trip, Activity } from '@/types';

type NavView = 'dashboard' | 'browse' | 'members' | 'create' | 'edit';

interface NavigationProps {
  currentView: NavView;
  onViewChange: (view: NavView) => void;
  trip?: Trip | null;
  activities?: Activity[];
}

export const Navigation: React.FC<NavigationProps> = ({ currentView, onViewChange, trip, activities = [] }) => {
  const navItems = [
    { id: 'dashboard' as const, label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'browse' as const, label: 'Browse Activities', icon: Search },
    { id: 'members' as const, label: 'Members', icon: Users },
  ];
  // Build day objects with label + iso so clicks can target an ISO date for scrolling
  const buildDayObjects = (start?: string, end?: string) => {
    if (!start || !end) return [] as { label: string; iso: string }[];
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return [] as { label: string; iso: string }[];

    let startDate = new Date(s);
    let endDate = new Date(e);
    if (startDate.getTime() > endDate.getTime()) {
      const tmp = startDate;
      startDate = endDate;
      endDate = tmp;
    }

    const includeYear = startDate.getFullYear() !== endDate.getFullYear();
    const out: { label: string; iso: string }[] = [];
    const cur = new Date(startDate);
    while (cur.getTime() <= endDate.getTime()) {
      const weekday = cur.toLocaleDateString('en-US', { weekday: 'long' });
      const dd = String(cur.getDate()).padStart(2, '0');
      const mm = String(cur.getMonth() + 1).padStart(2, '0');
      const label = includeYear ? `${weekday}, ${dd}/${mm}/${String(cur.getFullYear())}` : `${weekday}, ${dd}/${mm}`;
      out.push({ label, iso: new Date(cur).toISOString() });
      cur.setDate(cur.getDate() + 1);
    }
    return out;
  };

  const days = buildDayObjects(trip?.startDate, trip?.endDate);

  // Compute set of day keys (YYYY-MM-DD) that have activities
  const activeDayKeys = new Set<string>();
  activities.forEach((act) => {
    if (!act.dateTime) return;
    const key = new Date(act.dateTime).toISOString().slice(0, 10);
    activeDayKeys.add(key);
  });
  return (
    <>
  <div className="fixed left-0 right-0 top-40 md:top-48 z-40">
        <div className="max-w-7xl mx-auto bg-white/95 p-6 rounded-2xl shadow-sm">
          
          <div className="flex gap-2 flex-wrap items-center">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
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
          {/* New green panel with yellow label */}
          <div className="m-4 p-3 bg-green-500 rounded-md">
            <span className="text-yellow-300 font-bold text-[18px]">list of days in the trip</span>
            {days.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {days.map((dayObj, idx) => {
                  const dayKey = new Date(dayObj.iso).toISOString().slice(0, 10);
                  const hasEvents = activeDayKeys.has(dayKey);
                  return (
                    <li key={dayObj.iso + idx}>
                      {hasEvents ? (
                        <button
                          type="button"
                          onClick={() => {
                            // emit a custom event with the ISO date so lists can scroll
                            window.dispatchEvent(new CustomEvent('scrollToDay', { detail: { iso: dayObj.iso } }));
                          }}
                          className={`px-3 py-1 font-bold text-[18px] rounded-md transition focus:outline-none focus:ring-2 focus:ring-yellow-300 bg-orange-500 hover:bg-orange-600 text-white`}
                        >
                          {dayObj.label}
                        </button>
                      ) : (
                        <span className="inline-block" title="no events scheduled for this day">
                          <button
                            type="button"
                            disabled
                            aria-disabled
                            className="px-3 py-1 font-bold text-[18px] rounded-md transition bg-gray-200 text-gray-500 cursor-not-allowed opacity-70"
                          >
                            {dayObj.label}
                          </button>
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

  {/* spacer so content starts below the fixed navigation (increased to match new nav position) */}
  <div className="h-48 md:h-56" aria-hidden="true" />
  <div className="h-6" aria-hidden="true" />
  {/* No modal — clicking emits scrollToDay events */}
    </>
  );
};