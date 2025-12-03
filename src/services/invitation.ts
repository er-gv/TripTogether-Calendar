import { getFunctions, httpsCallable } from 'firebase/functions';

interface SendInvitationParams {
  inviteeEmail: string;
  inviteeName?: string;
  tripId: string;
  inviterName: string;
  inviterEmail?: string;
}

/**
 * Send a trip invitation email to a user
 * @param params - Invitation parameters
 * @returns Promise that resolves when email is sent
 */
export async function sendTripInvitation(params: SendInvitationParams): Promise<void> {
  try {
    const functions = getFunctions();
    const sendInvite = httpsCallable(functions, 'sendTripInvitation');
    
    const result = await sendInvite(params);
    console.log('Invitation sent successfully:', result.data);
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw new Error('Failed to send invitation. Please try again.');
  }
}

/**
 * Alternative: Call the Cloud Function via HTTP endpoint
 * Use this if you're using the express endpoint setup
 */
export async function sendTripInvitationHTTP(params: SendInvitationParams): Promise<void> {
  try {
    // Update this URL with your actual Cloud Function URL
    const functionUrl = 'https://YOUR_REGION-YOUR_PROJECT_ID.cloudfunctions.net/api/sendTripInvitation';
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invitation');
    }

    const result = await response.json();
    console.log('Invitation sent successfully:', result);
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
}
