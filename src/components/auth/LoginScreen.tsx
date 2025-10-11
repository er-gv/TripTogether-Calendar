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
          type="button"
          
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-white hover:text-white/80 transition"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl p-8">
          <div className="text-center mb-8">
          
            
            <div style={{textAlign:'center', fontSize:'38px', marginLeft:'20px', marginBottom: '10px'}}>Welcome Back!</div>
           
          <form onSubmit={handleSubmit} className="space-y-6">
            <span>
              <label htmlFor="tripId" className="block text-sm font-large text-gray-700 mb-1">
                Enter your Trip ID
              </label>
              
              <input
                type="text"
                id="tripId"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., trip123"
                required
              />
              <LogIn className="mx-auto mb-4 text-purple-600" size={48} />
            </span>
            <Button type="submit" className="w-full flex items-center justify-center gap-2">
              <LogIn size={16} />
              Log In
            </Button>
          </form>
          </div>
        </div>
      </div>
        
          
        
          
          
        
      
     </div>
)};

/*
  This is a login screen component that allows users to log in to their trip.
  It includes a background image, a welcome message, and a form for entering the trip ID.


  
*/