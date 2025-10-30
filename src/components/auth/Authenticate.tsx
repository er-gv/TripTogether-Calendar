
import React, { useState } from 'react';
import { Loader, LogIn, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AuthenticateProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

const Authenticate: React.FC<AuthenticateProps> = ({ onSuccess, onCancel, className = '' }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);

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



  const handleEmail = async () => {
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Email auth failed', err);
      setError('Email authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isSignup) {
        await signUpWithEmail(email, password);
      } else {
        await signInWithEmail(email, password);
      }
      onSuccess?.();
    } catch (err: any) {
      console.error('Email auth failed', err);
      setError('Email authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center p-4 '
      style={{ backgroundImage: `url("https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
          }}
    >
      <div className="w-full max-w-md bg-white/95 backdrop-blur rounded-2xl shadow p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Sign in with Google</h2>
        <p className="text-sm text-gray-600 mb-6">Choose a sign-in method to continue.</p>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <div className="space-y-3">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-white ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? <Loader className="animate-spin" size={18} /> : <LogIn size={18} />}
            <span>{loading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

          

          

          <button
            onClick={() => { setShowEmailForm(s => !s); setError(null); }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/90 text-gray-800 hover:bg-white"
          >
            <Mail size={18} />
            <span>{showEmailForm ? 'Hide email form' : 'Sign in with Email'}</span>
          </button>

          {showEmailForm && (
            <form onSubmit={handleEmailSubmit} className="space-y-2">
              <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 rounded border" required />
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border" required />
              <div className="flex items-center justify-between">
                <label className="text-sm">
                  <input type="checkbox" checked={isSignup} onChange={e => setIsSignup(e.target.checked)} /> <span className="ml-2">Create account</span>
                </label>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
                  {isSignup ? 'Create account' : 'Sign in'}
                </button>
              </div>
            </form>
          )}
        </div>

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
