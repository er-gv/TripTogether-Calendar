import React from 'react';
import type { User, Trip } from '../../types';
import { Users, Crown, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../common/Button';
import { sendTripInvitationHTTP } from '@/services/invitation';

interface MembersListProps {
  members: User[];
  ownerId: string;
  currentUserId: string;
  currentTrip: Trip;
  currentUser: User;
  onSetFilterCreator: (creatorName: string) => void;
  onSetFilterOptInMembers: (optInMembers: string[]) => void;
};

export const MembersList: React.FC<MembersListProps> = ({ 
  members,
  ownerId, 
  currentUserId,
  currentTrip,
  currentUser,
  onSetFilterCreator, 
  onSetFilterOptInMembers 
}) => {
  const [showInvite, setShowInvite] = React.useState(false);
  const [inviteeEmail, setInviteeEmail] = React.useState('');
  const [inviteeName, setInviteeName] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSendInvitation = async () => {
    if (!inviteeEmail) {
      setError('Please enter an email address');
      return;
    }

    setSending(true);
    setError(null);
    setSuccess(false);

    try {
      await sendTripInvitationHTTP({
        inviteeEmail,
        inviteeName: inviteeName || undefined,
        tripId: currentTrip.id,
        inviterName: currentUser.displayName,
        inviterEmail: currentUser.email,
      });

      setSuccess(true);
      setInviteeEmail('');
      setInviteeName('');
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  // Place the current user at the top of the list if present
  const meIndex = members.findIndex(m => m.id === currentUserId);
  const ordered = meIndex >= 0 ? [members[meIndex], ...members.slice(0, meIndex), ...members.slice(meIndex + 1)] : members;

  // Pad members to 9 cells for a 3x3 grid
  const cells = [...ordered];
  // Add a typed placeholder member to the right of the first row
  
  // Insert placeholder after the first row (position 3) or at the end if fewer members
  
  return (
  <div className=" w-full bg-white rounded-xl shadow-md pt-10 px-8 pb-8">
  
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-800">Trip Members</h3>
          <span className="ml-2 text-sm text-gray-500">{members.length} members</span>
        </div>
        
      </div>

  <div className='overflow-y-auto  h-[300px]'>
  <div className="grid grid-cols-2 gap-y-3 gap-x-[17px] justify-center">
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
                  <div className="flex flex-col gap-0 flex-1">
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
                    <div className="flex items-start mt-2" id="itinerary-link">
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); onSetFilterOptInMembers([member.displayName]); }}
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>See their itinerary</span>
                          <ChevronRight size={14} />
                        </a>
                    </div>
                    <div className="flex items-start" id="created activities-link">
                        <a
                          href="#"
                          onClick={(e) => { e.preventDefault(); onSetFilterCreator(member.displayName); }}
                          className="text-sm text-purple-600 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
                        >
                          <span>See activities they createed</span>
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
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm">
              Invitation sent successfully!
            </div>
          )}
          
          <div className="grid grid-cols-2 items-center">
          
            <label className='pr-5 text-left' htmlFor="invite-email" >Email address:</label>
            <input
            type="email"
            value={inviteeEmail}
            onChange={(e) => setInviteeEmail(e.target.value)}
            id="invite-email"
            name="invite-email"
            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter email address" 
            />
          </div>
          <div className="grid grid-cols-2 items-center">
          <label className='pr-5 text-left' htmlFor="invite-name" >Name (optional):</label>
          <input
            type="text"
            value={inviteeName}
            onChange={(e) => setInviteeName(e.target.value)}
            id="invite-name"
            name="invite-name"
            className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter name"
          />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={handleSendInvitation} 
              disabled={sending || !inviteeEmail}
              className="bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {sending ? 'Sending...' : 'Send invitation!'}
            </Button>
          </div>
        </div>
    </div>
  );}
  
