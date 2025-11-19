import React from 'react';
import type { Activity, User } from '../../types';
import ActivityCard from './ActivityCard';
import { ActivityFilters}  from './ActivityFilters';
import { Search, Bug } from 'lucide-react';


interface ActivityDebuggBrowserProps {
  activities: Activity[];
  currentUser: User;
  members: User[];
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onDeleteActivity: (activityId: string) => void;
  isOwner: boolean;
  filterDate: string;
  filterMember: string;
  filterTags: string[];
  onFilterDateChange: (date: string) => void;
  onFilterMemberChange: (memberId: string) => void;
  onFilterTagsChange: (tags: string[]) => void;
}

export const ActivityDebuggBrowser: React.FC<ActivityDebuggBrowserProps> = ({
  activities,
  currentUser,
  members,
  onToggleOptIn,
  onDeleteActivity,
  isOwner,
  filterDate,
  filterMember,
  filterTags,
  onFilterDateChange,
  onFilterMemberChange,
  onFilterTagsChange,
}) => {
  const [selectedActivityId, setSelectedActivityId] = React.useState<string | null>(null);
  const filteredActivities = activities.filter(act => {
    if (filterDate && !act.dateTime.startsWith(filterDate)) return false;
    if (filterMember && act.creatorId !== filterMember) return false;
    if (filterTags.length > 0 && !filterTags.some(tag => act.tags.includes(tag))) return false;
    return true;
  });

  return (
    <div className="flex gap-2 flex-nowrap items-center max-w-7xl mx-auto px-4 pb-8">
      <div className="bg-white/95 backdrop-blur rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
            <Bug className="text-white" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Browse Activities</h2>
            {/* make the count area its own scrollable pane in case content expands */}
            <div className="max-h-52 overflow-auto">
              <p className="text-sm text-gray-600">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'} found
              </p>
            </div>
          </div>
        </div>

        <ActivityFilters
          filterDate={filterDate}
          filterMember={filterMember}
          filterTags={filterTags}
          members={members}
          onFilterDateChange={onFilterDateChange}
          onFilterMemberChange={onFilterMemberChange}
          onFilterTagsChange={onFilterTagsChange}
        />

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
    </div>
  );
};