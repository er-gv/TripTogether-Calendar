import React, { useState } from 'react';
import { ArrowLeft, LogIn } from 'lucide-react';
import { Button } from '../common/Button';

interface LoginScreenProps {
  onLogin: (tripId: string) => void;
  onBack: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onBack }) => {
  const [tripId, setTripId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tripId.trim()) {
      onLogin(tripId.trim());
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400"></div>
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-white hover:text-white/80 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Join a Trip
            </h2>
            <p className="text-gray-600">
              Enter your trip ID and sign in with Google
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trip ID
              </label>
              <input
                type="text"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                placeholder="Enter your trip ID"
                className="input"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                The trip creator should have shared this ID with you
              </p>
            </div>

            <Button type="submit" variant="primary" icon={LogIn} className="w-full">
              Continue with Google
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              🔒 We use Google authentication to keep your trip secure
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};