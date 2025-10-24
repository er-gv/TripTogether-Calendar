import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface LogoutButtonProps {
  onLogout: () => void;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ onLogout }) => {
  return (

    <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
      >
        <LogOut size={18} />
        <span className="hidden sm:inline">Logout</span>
      </button>

  );
};