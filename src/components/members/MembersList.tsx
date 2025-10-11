import React from 'react';
import type { User } from '../../types';
import { Users, Crown, ChevronRight, Plus } from 'lucide-react';

interface MembersListProps {
  members: User[];
  ownerId: string;
  currentUserId: string;
  onShowCreatedActivities?: (memberId: string) => void;
}

export const MembersList: React.FC<MembersListProps> = ({ members, ownerId, currentUserId, onShowCreatedActivities }) => {
  const [showInvite, setShowInvite] = React.useState(false);

  // Place the current user at the top of the list if present
  const meIndex = members.findIndex(m => m.id === currentUserId);
  const ordered = meIndex >= 0 ? [members[meIndex], ...members.slice(0, meIndex), ...members.slice(meIndex + 1)] : members;

  // Pad members to 9 cells for a 3x3 grid
  const cells = [...ordered];
  // Add a typed placeholder member to the right of the first row
  const placeholder: User = {
    id: 'placeholder-member',
    displayName: 'Trip Member',
    email: 'someone@somewhere',
    photoURL: 'https://ui-avatars.com/api/?name=Trip+Member&background=cccccc&color=666666'
  } as User;
  // Insert placeholder after the first row (position 3) or at the end if fewer members
  const insertIndex = Math.min(3, cells.length);
  cells.splice(insertIndex, 0, placeholder);
  while (cells.length < 9) cells.push({ id: `empty-${cells.length}`, displayName: '', email: '', photoURL: '' } as User);

  return (
  <div className="mx-auto max-w-3xl bg-white rounded-xl shadow-md pt-10 px-8 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Trip Members</h3>
          <span className="ml-2 text-sm text-gray-500">{members.length} members</span>
        </div>
        <div />
      </div>

  <div className="grid grid-cols-3 gap-y-3 gap-x-[17px] justify-center">
        {cells.slice(0, 9).map((member) => {
          const isEmpty = member.displayName === '';
          const isMe = member.id === currentUserId;
          return (
            <div
              key={member.id}
              className={`h-24 flex items-start justify-between gap-3 p-4 pt-6 rounded-lg transition ${isEmpty ? 'bg-transparent' : 'bg-violet-100 border-4 border-black hover:border-purple-400'}`}
            >
              {!isEmpty ? (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}`}
                        alt={member.displayName}
                        className="w-10 h-10 rounded-full"
                      />
                      <p className="text-sm font-medium text-gray-800 whitespace-nowrap">{member.displayName}</p>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-4">
                    {member.id === 'placeholder-member' ? (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowInvite(true); }}
                        className="inline-flex items-center gap-3 px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-50 transition"
                      >
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-600 text-white">
                          <Plus size={14} />
                        </span>
                        <span className="whitespace-nowrap">Invite new Member</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onShowCreatedActivities?.(member.id); }}
                        className="inline-flex items-center gap-2 px-2 py-1 bg-transparent text-sm text-gray-700 hover:bg-gray-100 rounded transition"
                      >
                        <span className="hidden sm:inline">Created</span>
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {showInvite && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowInvite(false)} />
          <div className="z-10 bg-white rounded-lg p-6 shadow-lg">
            <h4 className="text-lg font-semibold mb-2">Invite friends</h4>
            <p className="mb-4">Join my trip!</p>
            <div className="text-right">
              <button onClick={() => setShowInvite(false)} className="px-3 py-2 bg-gray-200 rounded">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};