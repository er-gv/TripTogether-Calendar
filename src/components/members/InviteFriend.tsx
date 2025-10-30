import React, { useState } from 'react';

interface InviteFriendProps {
  tripId: string;
  tripName: string;
  destination?: string;
  startDate?: string;
  endDate?: string;
  onSent?: () => void;
}

const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

export const InviteFriend: React.FC<InviteFriendProps> = ({ tripId, tripName, destination, startDate, endDate, onSent }) => {
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState(() => {
    const dates = startDate ? (endDate ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` : `${new Date(startDate).toLocaleDateString()}`) : '';
    return `Hi! I'd like to invite you to join my trip \n\n${tripName}${destination ? ` — ${destination}` : ''}${dates ? `\n${dates}` : ''}\n\nClick the link to join or reply for details.`;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);

    if (!validateEmail(recipient)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // Basic POST to an endpoint; adapt to your backend/email provider
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: recipient,
          subject: `Join my trip: ${tripName}`,
          body: message,
          tripId,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to send invitation');
      }

      setSuccess(true);
      onSent?.();
    } catch (err: any) {
      console.error('Invite send failed', err);
      setError(err?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl w-full bg-white/95 p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Invite a friend</h3>
      {success ? (
        <div className="text-green-600">Invitation sent!</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            <div className="text-sm mb-1">Recipient email</div>
            <input value={recipient} onChange={e => setRecipient(e.target.value)} className="w-full px-3 py-2 border rounded" placeholder="friend@example.com" />
          </label>

          <label className="block">
            <div className="text-sm mb-1">Message</div>
            <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full px-3 py-2 border rounded" rows={6} />
          </label>

          {error && <div className="text-red-500">{error}</div>}

          <div className="flex items-center gap-3">
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
            <button type="button" onClick={() => { setRecipient(''); setMessage(''); }} className="px-3 py-2 border rounded text-sm">Reset</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default InviteFriend;
