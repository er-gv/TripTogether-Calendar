import React from 'react';
import type { User } from '../../types';
import { Users, Crown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../common/Button';

interface MembersListProps {
  members: User[];
  ownerId: string;
  currentUserId: string;
  //onShowCreatedActivities?: (memberId: string) => void;
  onShowOptInActivities: (memberId: string) => void;
};

export const MembersList: React.FC<MembersListProps> = ({ members, ownerId, currentUserId, onShowOptInActivities }) => {
  const [showInvite, setShowInvite] = React.useState(false);

  // Place the current user at the top of the list if present
  const meIndex = members.findIndex(m => m.id === currentUserId);
  const ordered = meIndex >= 0 ? [members[meIndex], ...members.slice(0, meIndex), ...members.slice(meIndex + 1)] : members;

  // Pad members to 9 cells for a 3x3 grid
  const cells = [...ordered];
  // Add a typed placeholder member to the right of the first row
  
  // Insert placeholder after the first row (position 3) or at the end if fewer members
  
  return (
  <div className="mx-auto max-w-3xl bg-white rounded-xl shadow-md pt-10 px-8 pb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Trip Members</h3>
          <span className="ml-2 text-sm text-gray-500">{members.length} members</span>
        </div>
        
      </div>

  <div className="grid grid-cols-3 gap-y-3 gap-x-[17px] justify-center">
        {cells.slice(0, 9).map((member) => {
          const isEmpty = member.displayName === '';
          const isMe = member.id === currentUserId;
          return (
            <div
              key={member.id}
              className={`flex items-start justify-between gap-3 p-4 pt-6 rounded-lg transition ${isEmpty ? 'bg-transparent' : 'bg-violet-100 border-4 border-black hover:border-purple-400'}`}
            >
              {!isEmpty ? (
                <>
                  <div className="flex flex-col gap-2 flex-1">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.displayName)}`}
                        alt={member.displayName}
                        className="w-12 h-12 rounded-full border-2 border-purple-200 shadow-sm"
                      />
                      <div className="flex flex-col gap-1 items-start">
                        <p className="text-sm font-semibold text-gray-800 text-left">{member.displayName}</p>
                        <p className="text-xs text-gray-500 text-left truncate max-w-[120px]">{member.email}</p>  
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); onShowOptInActivities(member.id); }}
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>See schedule events</span>
                          <ChevronRight size={14} />
                        </a>
                    </div>
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
      
          <div className="grid grid-rows gap-3 py-3 mt-5 text-md font-medium items-start">
            <div className="flex items-center">
            <Plus size={20} className="text-purple-600"  />
            <span className="text-left">Invite new member: </span>
          </div>
          <div className="grid grid-cols-2 items-center">
          
            <label className='pr-5 text-left' htmlFor="invite-email" >Email address:</label>
            <input
            type="text"
            
            id="invite-email"
            name="invite-email"
            className="border border-gray-300 rounded-l-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter email address" 
            >
            </input>
          </div>
          <div className="grid grid-cols-2 items-center">
          <label className='pr-5 text-left' htmlFor="invite-message" >Invite message:</label>
          <textarea
            id="invite-message"
            name="invite-message"
            className="border border-gray-300 rounded-r-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter invite message"
          />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={() => alert(`Invitation sent!`)} className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2">
              
              Send invitation!
            </Button>
          </div>
        </div>
    </div>
  );}
  
