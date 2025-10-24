import React, { useState } from 'react';
import { Plane, LogIn, PlusCircle } from 'lucide-react';
import { LoginScreen } from './LoginScreen';
import JoinTripScreen from './JoinTripScreen';
import Authenticate from './Authenticate';
import { CreateTripForm } from '../activities/CreateTripForm'

import type { User } from '@/types';

interface SplashScreenProps {
  onLogin: (tripId: string) => void;
  onCreateTrip: (tripData: any) => Promise<string>;
  currentUser?: User | null;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLogin, onCreateTrip, currentUser }) => {
  const [mode, setMode] = useState<'splash' | 'login' | 'create' | 'join' | 'auth-create' | 'auth-join'>('splash');

  if (mode === 'login') {
    return <LoginScreen onLogin={onLogin} onBack={() => setMode('splash')} />;
  }

  if (mode === 'auth-join') {
    return (
      <Authenticate
        onSuccess={() => setMode('join')}
        onCancel={() => setMode('splash')}
      />
    );
  }

  if (mode === 'join') {
    return <JoinTripScreen onSelectTrip={onLogin} onBack={() => setMode('splash')} />;
  }

  if (mode === 'auth-create') {
    return (
      <Authenticate
        onSuccess={() => setMode('create')}
        onCancel={() => setMode('splash')}
      />
    );
  }

  if (mode === 'create') {
    return (
      <CreateTripForm 
        currentUser={currentUser}
        onCreateTrip={onCreateTrip}
        onBack={() => setMode('splash')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 "></div>
      
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 "
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12 group bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-3xl p-8 shadow-2xl   ">
          <div className="inline-flex items-center justify-center w-20 h-20  rounded-full ">
            <img src="/compass.png" alt="TripTogether Logo"  />
            
          
          <h1 className="text-6xl font-bold text-white drop-shadow-lg mb-2">
            TripTogether
          </h1>
          </div>
          <div className="text-2xl text-white/90 drop-shadow">
            Plan adventures with friends & family
          </div>

            <div className="grid md:grid-cols-2 gap-2 pt-10">
          {/* Join Existing Trip */}
          <button
            onClick={() => setMode('auth-join')}
            
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 hover:rotate-[65deg] transition duration-[500ms] ">
                <Plane size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Join a Trip
              </h3>
              <p className="text-white/90">
                Already have a trip ID? Sign in with Google to join your friends!
              </p>
            </div>
          </button>

          {/* Create New Trip */}
          <button
            
          
            onClick={() => setMode('auth-create')}
            
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 hover:rotate-[65deg] transition duration-[500ms]">
                <PlusCircle size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Create a Trip
              </h3>
              <p className="text-white/90">
                Start planning a new adventure and invite others to join!
              </p>
            </div>
          </button>
        </div>
         {/* Features */}
        <div className="mt-12 bg-white/20 backdrop-blur rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center text-white">
            <div>
              <div className="text-3xl font-bold mb-1">✨</div>
              <div className="text-sm">Collaborative Planning</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">📍</div>
              <div className="text-sm">Activity Management</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-1">🎉</div>
              <div className="text-sm">Fun & Exciting</div>
            </div>
          </div>
        </div>
      </div>
      </div>

      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};