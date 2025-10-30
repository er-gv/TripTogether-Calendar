const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// POST /createInviteUser
// body: { email, password, displayName, tripId }
app.post('/createInviteUser', async (req, res) => {
  try {
    const { email, password, displayName, tripId } = req.body || {};
    if (!email || !password || !displayName || !tripId) {
      return res.status(400).json({ error: 'Missing required fields: email, password, displayName, tripId' });
    }

    // Check whether a user already exists with that email
    try {
      const existing = await admin.auth().getUserByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already in use' });
    } catch (e) {
      // getUserByEmail throws if not found — that's okay, continue to create
    }

    // Create the user
    const created = await admin.auth().createUser({
      email,
      password,
      displayName,
    });

    // Create minimal user doc in Firestore
    const userDoc = {
      id: created.uid,
      email: created.email || '',
      displayName: created.displayName || '',
      photoURL: created.photoURL || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await admin.firestore().doc(`users/${created.uid}`).set(userDoc, { merge: true });

    // Add user to trip.memberIds
    const tripRef = admin.firestore().doc(`trips/${tripId}`);
    await tripRef.update({ memberIds: admin.firestore.FieldValue.arrayUnion(created.uid) });

    return res.json({ uid: created.uid });
  } catch (err) {
    console.error('createInviteUser error', err);
    return res.status(500).json({ error: String(err) });
  }
});

exports.api = functions.https.onRequest(app);
