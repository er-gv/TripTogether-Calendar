import React from 'react';
import { Filter, X } from 'lucide-react';
import type { User } from '../../types';
import {AVAILABLE_TAGS } from '../../types';

interface ActivityFiltersProps {
  filterDate: string;
  filterMember: string;
  filterTags: string[];
  members: User[];
  onFilterDateChange: (date: string) => void;
  onFilterMemberChange: (memberId: string) => void;
  onFilterTagsChange: (tags: string[]) => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filterDate,
  filterMember,
  filterTags,
  members,
  onFilterDateChange,
  onFilterMemberChange,
  onFilterTagsChange,
}) => {
  const toggleTag = (tag: string) => {
    if (filterTags.includes(tag)) {
      onFilterTagsChange(filterTags.filter(t => t !== tag));
    } else {
      onFilterTagsChange([...filterTags, tag]);
    }
  };

  const clearAllFilters = () => {
    onFilterDateChange('');
    onFilterMemberChange('');
    onFilterTagsChange([]);
  };

  const hasActiveFilters = filterDate || filterMember || filterTags.length > 0;

  return (
    <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-800">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
          >
            <X size={16} />
            Clear all
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Date Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
            className="input"
          />
        </div>

        {/* Member Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Creator
          </label>
          <select
            value={filterMember}
            onChange={(e) => onFilterMemberChange(e.target.value)}
            className="input"
          >
            <option value="">All members</option>
            {members.map(member => (
              <option key={member.id} value={member.id}>
                {member.displayName}
              </option>
            ))}
          </select>
        </div>

        {/* Active Filters Display */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Active Filters
          </label>
          <div className="flex flex-wrap gap-2">
            {!hasActiveFilters && (
              <span className="text-sm text-gray-500 italic">No filters applied</span>
            )}
            {filterDate && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                Date: {new Date(filterDate).toLocaleDateString()}
              </span>
            )}
            {filterMember && (
              <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                {members.find(m => m.id === filterMember)?.displayName}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filterTags.includes(tag)
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};