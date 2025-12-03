const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

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

// POST /sendTripInvitation
// body: { inviteeEmail, inviteeName, tripId, inviterName, inviterEmail }
app.post('/sendTripInvitation', async (req, res) => {
  try {
    const { inviteeEmail, inviteeName, tripId, inviterName, inviterEmail } = req.body || {};
    
    if (!inviteeEmail || !tripId || !inviterName) {
      return res.status(400).json({ error: 'Missing required fields: inviteeEmail, tripId, inviterName' });
    }

    // Get trip details
    const tripDoc = await admin.firestore().doc(`trips/${tripId}`).get();
    if (!tripDoc.exists) {
      return res.status(404).json({ error: 'Trip not found' });
    }
    
    const trip = tripDoc.data();
    const tripName = trip.name || 'a trip';
    const destination = trip.destination || 'an exciting destination';

    // Create email transport (configure with your email service)
    // For Gmail, you need to enable "Less secure app access" or use OAuth2
    // For production, use SendGrid, Mailgun, or similar service
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: functions.config().email?.user || process.env.EMAIL_USER,
        pass: functions.config().email?.pass || process.env.EMAIL_PASS
      }
    });

    const invitationLink = `${functions.config().app?.url || 'http://localhost:5173'}?tripId=${tripId}`;
    
    const mailOptions = {
      from: inviterEmail || functions.config().email?.user,
      to: inviteeEmail,
      subject: `${inviterName} invited you to join ${tripName}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0;">🎉 Trip Invitation!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hi ${inviteeName || 'there'},
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              <strong>${inviterName}</strong> has invited you to join their trip: <strong>${tripName}</strong> to <strong>${destination}</strong>!
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              Click the button below to accept the invitation and start planning together:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                        color: white; 
                        padding: 15px 40px; 
                        text-decoration: none; 
                        border-radius: 25px; 
                        font-size: 18px; 
                        font-weight: bold;
                        display: inline-block;">
                Join ${tripName}
              </a>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Or copy and paste this link into your browser:<br>
              <a href="${invitationLink}" style="color: #667eea; word-break: break-all;">${invitationLink}</a>
            </p>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            <p>This is an automated email from TripTogether Calendar</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    
    return res.json({ success: true, message: 'Invitation sent successfully' });
  } catch (err) {
    console.error('sendTripInvitation error', err);
    return res.status(500).json({ error: String(err) });
  }
});

exports.api = functions.https.onRequest(app);
