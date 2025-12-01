import React from 'react';
import { useState } from 'react';
import type { Activity, Trip, User } from '../../types';
import ActivityCard from '../activities/ActivityCard';
import { ActivityFilters}  from '../activities/ActivityFilters';
import { Search, Bug, Calendar, CalendarPlus } from 'lucide-react';
import { FiltersPane } from './FiltersPane';
import { DaysList } from './DaysList';
import { generateTripId } from '@/utils/helpers';
import type { ViewMode } from '@/types';
import { exportEventToICS, exportUserItineraryToICS } from '@/utils/helpers';




interface ActivityDebuggBrowserProps {
  /*trip: Trip;
  activities: Activity[];
  currentUser: User;
  filterMember: string;
  members: User[];
  filterDate: string;
  filterTags: string[];
  filterOptInMembers: string[];
  filterCreatorMember: string;

  
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  
  onSetFilterDate: (date: string) => void;
  onSetFilterMember: (member: string) => void;
  onSetFilterTags: (tags: string[]) => void;
  onDeleteActivity: (activityId: string) => void;
  onEditActivity: (activityId: string) => void;
  isOwner: boolean;
  view: ViewMode;*/
}


export const ActivitiesBrowser: React.FC<ActivityDebuggBrowserProps> = ({
  /*trip,
  activities,
  currentUser,
  filterMember,
  members,
  onToggleOptIn,
  filterDate,
  filterTags,
  filterOptInMembers,
  filterCreatorMember,
  
  onSetFilterDate,
  onSetFilterMember,
  onSetFilterTags,
    
  onDeleteActivity,
  isOwner,
  view*/
}) => {
  

  
  /*
  const caption = view === 'allActivities' ? 
    (filterMember ? `Browse Activities created by ${filterMember}` : `Browse All Activities `)
    : `${currentUser.displayName} selected Activities`;
 
  const filteredActivities = activities.filter(act => {  
    if (filterDate && !act.dateTime.startsWith(filterDate)) return false;
    if (filterMember && act.creatorId !== filterMember) return false;
    if (filterTags.length > 0 && !filterTags.some(tag => act.tags.includes(tag))) return false;
    return true;
  });

  const scrollToDay = (iso: string) => {
    try {
      const targetDate = new Date(iso);
      const targetDayKey = targetDate.toISOString().slice(0, 10);

      // Find the DOM element that Dashboard attaches with data-day
      const el = document.querySelector(`[data-day="${targetDayKey}"]`);
      if (el) {
        // Compute header/nav offset dynamically if possible
        const headerEl = document.querySelector('header');
        const navEl = document.querySelector('[data-nav]');
        let offset = 120;
        if (headerEl) offset = offset - 0 + (headerEl as HTMLElement).offsetHeight;
        if (navEl) offset += (navEl as HTMLElement).offsetHeight;

        const rect = (el as HTMLElement).getBoundingClientRect();
        const top = window.scrollY + rect.top - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        try {
          const node = el as HTMLElement;
          node.classList.remove('flash-highlight');
          // Force reflow to restart animation
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          node.offsetWidth;
          node.classList.add('flash-highlight');
          const handle = () => {
            node.classList.remove('flash-highlight');
            node.removeEventListener('animationend', handle);
          };
          node.addEventListener('animationend', handle);
        } catch (err) {
          // ignore
        }
      }
    } catch (err) {
      // ignore
    }
  };
  
  */
  return (
    <div>TODO: Activities Browser</div>
    /*<div className="flex gap-2 flex-nowrap items-center max-w-7xl mx-auto px-4 pb-8">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            {view === 'memberActivities' 
            ? (<Calendar className="text-white" size={24} />)
            : (<Search className="text-white" size={24} />) 
            
            }
            {view === 'memberActivities' &&(
              <button onClick={() => {exportOptInEventsToICS(currentUser.id, currentUser.displayName);}}>Export your schedule
                <CalendarPlus className="text-white" size={24} /> 
              </button>
            )
            }
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{caption}</h2>
            {/* make the count area its own scrollable pane in case content expands *
            <div className="max-h-52 overflow-auto">
              <DaysList trip={trip} activities={activities} onDayClick={setFilterDate} />
              
              <FiltersPane
                filterDate={filterDate}
                filterMember={filterMember}
                filterTags={filterTags}
                members={members}
                onFilterDateChange={setFilterDate}
                onFilterMemberChange={setFilterMember}
                onFilterTagsChange={setFilterTags}
              />
              <p className="text-sm text-gray-600">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
              </p>
            </div>
          </div>
        </div>

        

        {filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search size={40} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No activities found
            </h3>
            <p className="text-gray-500">
              Try adjusting your filters or create a new activity!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 mt-6">
            {filteredActivities.map(activity => (
              <ActivityCard
                key={activity.id}
                activity={activity}
                currentUser={currentUser}
                onToggleOptIn={onToggleOptIn}
                onExportToCalendar={exportEventToICS}
                onDeleteActivity={onDeleteActivity}
                canDelete ={activity.creatorId === currentUser.id || isOwner}
                canEdit={activity.creatorId === currentUser.id || isOwner}
                isActive={selectedActivityId === activity.id}
                onSelect={(id) => setSelectedActivityId(id === selectedActivityId ? null : id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>*/
  );
};