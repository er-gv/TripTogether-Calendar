import React from 'react';
import { Filter, X } from 'lucide-react';
import type { User } from '../../types';
import {AVAILABLE_TAGS } from '../../types';

interface ActivityFiltersProps {
  filterDate: string;
  filterCreator: string;
  filterOptInMembers: string[];
  filterTags: string[];
  members: User[];
  onFilterDateChange: (date: string) => void;
  onFilterCreatorChange: (creatorId: string) => void;
  onFilterOptInChange: (memberIds: string[]) => void;
  onFilterTagsChange: (tags: string[]) => void;
}

export const ActivityFilters: React.FC<ActivityFiltersProps> = ({
  filterDate,
  filterTags,
  filterCreator,
  filterOptInMembers,
  members,
  onFilterDateChange,
  onFilterOptInChange,
  onFilterCreatorChange,
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
    onFilterOptInChange([]);
    onFilterCreatorChange('');
    onFilterTagsChange([]);
  };

  const hasActiveFilters = filterDate || filterCreator || filterOptInMembers.length > 0 || filterTags.length > 0;
  
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

      <div className="grid md:grid-cols-1 gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
            Filter by Date
          </label>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => onFilterDateChange(e.target.value)}
            className="input"
          />
        </div>

        
          {/* Creator Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Filter by Creator
            </label>
            <select
              value={filterCreator}
              onChange={(e) => onFilterCreatorChange(e.target.value)}
              className="input"
            >
              <option value="">All members</option>
              {members.map(member => (
                <option key={member.id} value={member.displayName}>
                  {member.displayName}
                </option>
              ))}
            </select>
          </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Joiner Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Filter by Joiners
            </label>
            <div className="flex flex-col gap-2">
              {members.map(member => (
                <label key={member.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterOptInMembers.includes(member.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onFilterOptInChange([...filterOptInMembers, member.id]);
                      } else {
                        onFilterOptInChange(filterOptInMembers.filter(id => id !== member.id));
                      }
                    }}
                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700">{member.displayName}</span>
                </label>
              ))}
            </div>
          </div>
        

          {/* Active Filters Display */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2">
              Active Filters:
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
              {filterCreator && (
                <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {members.find(m => m.id === filterCreator)?. displayName}
                </span>
              )}
              {filterOptInMembers.length > 0 && (
                <div className='overflow-y h-[200px]'>
                <ul className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                  {filterOptInMembers.map(id => members.find(m => m.id === id)?<li>{members.find(m => m.id === id)?.displayName}</li>:null)}
                </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tags Filter */}
      <div className="mt-10">
        <label className="flex items-start text-sm font-medium text-gray-700 mb-2">
          Filter by Tags
        </label>
        <div className="flex flex-wrap gap-2 overflow-y-auto h-[300px]">
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