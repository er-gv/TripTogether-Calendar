import React from 'react';
import type { Activity, User } from '../../types';
import ActivityCard from '@/components/activities/ActivityCard';
import { ActivityFilters}  from '@/components/activities/ActivityFilters';
import { Search } from 'lucide-react';

interface ActivityBrowserProps {
  activities: Activity[];
  currentUser: User;
  members: User[];
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
  onEditActivity: (activityId: string) => void;
  onDeleteActivity: (activityId: string) => void;
  isOwner: boolean;
  filterDate: string;
  filterMember: string;
  filterTags: string[];
  onFilterDateChange: (date: string) => void;
  onFilterMemberChange: (memberId: string) => void;
  onFilterTagsChange: (tags: string[]) => void;
}

export const ActivityBrowser: React.FC<ActivityBrowserProps> = ({
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
/*
  return (
    <div className="flex gap-2 flex-nowrap items-center max-w-7xl mx-auto px-4 pb-8">
      
        <ActivityFilters
          filterDate={filterDate}
          filterMember={filterMember}
          filterTags={filterTags}
          members={members}
          onFilterDateChange={setFilterDate}
          onFilterMemberChange={setFilterMember}
          onFilterTagsChange={setFilterTags}
        />

        
    </div>
  );*/
};