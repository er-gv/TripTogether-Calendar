import React, { useEffect, useState } from 'react';
import { Loader } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { auth } from '@/services/firebase';
import { getAllTrips } from '@/services/firestore_api/trip';
import type { Trip } from '@/types';
import compass from '@/assets/compass.jpg';

interface JoinTripScreenProps {
  onSelectTrip: (tripId: string) => void;
  onBack: () => void;
}

export const JoinTripScreen: React.FC<JoinTripScreenProps> = ({ onSelectTrip, onBack }) => {
  const { user, loading: authLoading, signInWithGoogle, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ensureSignedInAndLoad = async () => {
      try {
        // Don't trigger a popup here — if the user came from the Authenticate flow they should already be signed in.
        const uid = user?.id || auth.currentUser?.uid;
        if (!uid) {
          setError('Please sign in first to view trips.');
          setLoading(false);
          return;
        }

        // after sign-in, fetch trips and filter by membership
        const all = await getAllTrips();
        const myTrips = all.filter(t => (t.memberIds || []).includes(uid));
        setTrips(myTrips);
      } catch (err: any) {
        console.error('Error loading trips for user:', err);
        setError('Failed to load trips. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    ensureSignedInAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={40} />
          <p>Loading trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 flex items-center justify-center"
    style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
      <div className="w-full max-w-2xl rounded-2xl shadow p-6
      " >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold">Select a Trip</h2>
          <div className="flex items-center gap-2">
            <button onClick={onBack} className="text-sm text-gray-600">Back</button>
            <button
              onClick={async () => { try { await signOut(); onBack(); } catch { onBack(); } }}
              className="text-sm text-red-600"
            >Sign out</button>
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        {trips.length === 0 ? (
          <div className="text-center py-12 text-gray-700">
            <p className="mb-4">You don't appear to be a member of any trips yet.</p>
            <p className="text-sm">Ask the trip owner to add you, or create a new trip from the home screen.</p>
            {error === 'Please sign in first to view trips.' && (
              <div className="mt-4">
                <button
                  onClick={async () => {
                    setLoading(true);
                    setError(null);
                    try {
                      await signInWithGoogle();
                      // reload trips after sign-in
                      const all = await getAllTrips();
                      const uid = auth.currentUser?.uid || user?.id;
                      const myTrips = all.filter(t => (t.memberIds || []).includes(uid || ''));
                      setTrips(myTrips);
                    } catch (err: any) {
                      console.error('Sign in failed:', err);
                      setError('Sign in failed. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Sign in with Google
                </button>
              </div>
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {trips.map(trip => (
              <li key={trip.id} className="border rounded-lg bg-gradient-to-br from-orange-500 to-pink-500 mb-4 group-hover:rotate-12 transition duration-300">
                
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onSelectTrip(trip.id); }}
                  className="block"
                >
                  <div className="flex items-center gap-4">
                    <img src={compass} alt="Compass" className="w-16 h-16 flex-shrink-0" />
                    <div>
                      <div className="text-lg font-bold mb-1">{trip.name}</div>
                      <div className="text-sm text-gray-600">{trip.destination} · {new Date(trip.startDate).toLocaleDateString()}</div>
                    </div>
                  </div>
                </a>
                
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default JoinTripScreen;
