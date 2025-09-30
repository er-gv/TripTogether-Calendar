import React from 'react';
import { User } from '../../types';
import { Users, Crown } from 'lucide-react';

interface MembersListProps {
  members: User[];
  ownerId: string;
  currentUserId: string;
}

export const MembersList: React.FC<MembersListProps> = ({ members, ownerId, currentUserId }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <Users size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-800">Trip Members</h3>
        <span className="ml-auto text-sm text-gray-500">{members.length} members</span>
      </div>

      <div className="space-y-3">
        {members.map(member => (
          <div
            key={member.id}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}`}
              alt={member.displayName}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-800">{member.displayName}</p>
                {member.id === ownerId && (
                  <Crown size={16} className="text-yellow-500" title="Trip Owner" />
                )}
                {member.id === currentUserId && (
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    You
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{member.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};