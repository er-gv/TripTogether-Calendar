import React, { useEffect, useState } from 'react';
import type { User } from '@/types';
import { getUsersByIds } from '@/services/firestore';

interface ActivityParticipantsProps {
  participants: string[]; // user IDs
  onToggleOptIn: (activityId: string, optIn: boolean) => void;
}

export const ActivityParticipants: React.FC<ActivityParticipantsProps> = ({
  participants,
  onToggleOptIn,
}) => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!participants || participants.length === 0) {
        setUsers([]);
        return;
      }
      try {
        const fetched = await getUsersByIds(participants);
        if (mounted) setUsers(fetched);
      } catch (err) {
        console.error('Failed to load participant users', err);
        if (mounted) setUsers([]);
      }
    };
    load();
    return () => { mounted = false; };
  }, [participants]);

  const avatarFallback = (name: string) => {
    return name
      .split(' ')
      .map(s => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="p-2">
      <div className="flex flex-col sm:flex-row sm:items-stretch sm:gap-4">
        <div className="flex items-center sm:items-center">
          <h4 className="text-base font-semibold text-gray-800 sm:whitespace-nowrap">Participants</h4>
        </div>

        <div className="flex-1">
          <ul className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {users.map((user) => (
            <li key={user.id} className="flex items-center gap-2 p-1 bg-gray-50 rounded-md shadow-sm">
                {user.photoURL ? (
                <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '' }}
                />
                ) : (
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 font-semibold">
                    {avatarFallback(user.displayName || user.email || 'U')}
                </div>
                )}

                <div className="text-gray-700 truncate">{user.displayName || user.email}</div>
            </li>
            ))}

            {/* If there are IDs with no user records yet, show them as placeholders */}
            {users.length < participants.length && participants.map(pid => {
              if (users.find(u => u.id === pid)) return null;
              return (
                <li key={pid} className="flex items-center gap-2 p-1 bg-gray-50 rounded-md shadow-sm">
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-semibold">?</div>
                  <div className="text-gray-700 truncate">{pid}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
