// Client helper to call the Cloud Function that creates an invited user and adds them to a trip.
export async function inviteUserToTrip(functionBaseUrl: string, email: string, password: string, displayName: string, tripId: string) {
  // functionBaseUrl should be the HTTPS function base (e.g. https://us-central1-<proj>.cloudfunctions.net/api)
  const url = `${functionBaseUrl.replace(/\/$/, '')}/createInviteUser`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, displayName, tripId }),
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || `Invite failed: ${resp.status}`);
  }
  return resp.json();
}
