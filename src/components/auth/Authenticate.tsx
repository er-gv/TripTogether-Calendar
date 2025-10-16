import React, { useState } from 'react';
import { Loader, LogIn } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthenticateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const Authenticate: React.FC<AuthenticateProps> = ({ onSuccess, onCancel, className = '' }) => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (err: any) {
      console.error('Google sign in failed', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${className}`}>
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in with Google</h2>
        <p className="text-sm text-gray-600 mb-6">Sign in with your Google account to continue.</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <button
          onClick={handleSignIn}
          disabled={loading}
          className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {loading ? <Loader className="animate-spin" size={18} /> : <LogIn size={18} />}
          <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
        </button>

        {onCancel && (
          <button onClick={onCancel} className="mt-4 text-sm text-gray-600">
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default Authenticate;
