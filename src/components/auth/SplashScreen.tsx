import React, { useState } from 'react';
import { Plane, LogIn, PlusCircle } from 'lucide-react';
import { LoginScreen } from './LoginScreen';
import { CreateTripForm } from '../activities/CreateTripForm'

interface SplashScreenProps {
  onLogin: (tripId: string) => void;
  onCreateTrip: (tripData: any) => Promise<string>;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onLogin, onCreateTrip }) => {
  const [mode, setMode] = useState<'splash' | 'login' | 'create'>('splash');

  if (mode === 'login') {
    return <LoginScreen onLogin={onLogin} onBack={() => setMode('splash')} />;
  }

  if (mode === 'create') {
    return (
      <CreateTripForm 
        onCreateTrip={onCreateTrip}
        onBack={() => setMode('splash')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-gradient-xy"></div>
      
      {/* Background Image Overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      ></div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl w-full">
        {/* Logo & Title */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-white rounded-full shadow-2xl mb-6 transform hover:scale-110 transition duration-300">
            <img src="/compass.jpg" alt="TripTogether Logo"  />
            
          </div>
          <h1 className="text-6xl font-bold text-white mb-4 drop-shadow-lg">
            TripTogether
          </h1>
          <p className="text-2xl text-white/90 drop-shadow">
            Plan adventures with friends & family
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Join Existing Trip */}
          <button
            onClick={() => setMode('login')}
            className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition duration-300">
                <LogIn size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Join a Trip
              </h3>
              <p className="text-gray-600">
                Already have a trip ID? Sign in with Google to join your friends!
              </p>
            </div>
          </button>

          {/* Create New Trip */}
          <button
            onClick={() => setMode('create')}
            className="group bg-white/95 backdrop-blur rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 transition duration-300"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition duration-300">
                <PlusCircle size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Create a Trip
              </h3>
              <p className="text-gray-600">
                Start planning a new adventure and invite others to join!
              </p>
            </div>
          </button>
        </div>

        {/* Features */}
        <div className="mt-12 bg-white/10 backdrop-blur rounded-2xl p-6">
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