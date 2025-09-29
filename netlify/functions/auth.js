/**
 * Netlify Function: Authentication
 * Handles trip creation, PIN validation, and user authentication
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getFirestore } = require('./utils/firebase-admin');
const { validateRequest, generateResponse } = require('./utils/validation');

exports.handler = async (event, context) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return generateResponse(200, null, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        });
    }

    if (event.httpMethod !== 'POST') {
        return generateResponse(405, { error: 'Method not allowed' });
    }

    try {
        const body = JSON.parse(event.body);
        const { action } = body;

        switch (action) {
            case 'create_trip':
                return await createTrip(body);
            case 'join_trip':
                return await joinTrip(body);
            case 'validate_token':
                return await validateToken(event.headers);
            default:
                return generateResponse(400, { error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Auth function error:', error);
        return generateResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Create a new trip
 */
async function createTrip(data) {
    const { name, startDate, endDate, timezone, displayName, isChild } = data;

    // Validate required fields
    if (!name || !startDate || !endDate || !timezone || !displayName) {
        return generateResponse(400, { error: 'Missing required fields' });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start >= end) {
        return generateResponse(400, { error: 'End date must be after start date' });
    }

    // Validate trip duration (max 1 year)
    const maxDuration = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds
    if (end - start > maxDuration) {
        return generateResponse(400, { error: 'Trip duration cannot exceed 1 year' });
    }

    try {
        const db = getFirestore();
        
        // Generate IDs and PIN
        const tripId = generateTripId();
        const adminId = generateMemberId();
        const pin = generatePIN();
        const pinHash = await bcrypt.hash(pin, 10);

        // Create trip document
        const tripData = {
            id: tripId,
            name: name.trim(),
            startDate,
            endDate,
            timezone,
            pinHash,
            createdAt: new Date().toISOString(),
            createdBy: adminId,
            roles: {
                [adminId]: 'admin'
            },
            memberCount: 1,
            activityCount: 0
        };

        // Create admin member document
        const memberData = {
            id: adminId,
            displayName: displayName.trim(),
            role: 'admin',
            isChild: Boolean(isChild),
            joinedAt: new Date().toISOString(),
            isActive: true,
            isCreator: true
        };

        // Write to Firestore
        const batch = db.batch();
        
        const tripRef = db.collection('trips').doc(tripId);
        const memberRef = db.collection('trips').doc(tripId).collection('members').doc(adminId);
        
        batch.set(tripRef, tripData);
        batch.set(memberRef, memberData);
        
        await batch.commit();

        // Generate JWT token
        const token = jwt.sign(
            { 
                tripId, 
                memberId: adminId, 
                role: 'admin',
                displayName: displayName.trim()
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        // Return success response
        return generateResponse(200, {
            success: true,
            token,
            trip: {
                id: tripId,
                name: tripData.name,
                startDate,
                endDate,
                timezone,
                pin, // Only return PIN on creation
                inviteLink: `${process.env.SITE_URL}?trip=${tripId}`
            },
            member: {
                id: adminId,
                displayName: memberData.displayName,
                role: 'admin',
                isCreator: true
            }
        });

    } catch (error) {
        console.error('Create trip error:', error);
        return generateResponse(500, { error: 'Failed to create trip' });
    }
}

/**
 * Join an existing trip with PIN
 */
async function joinTrip(data) {
    const { pin, tripId, displayName, isChild } = data;

    // Validate required fields
    if (!pin || !displayName) {
        return generateResponse(400, { error: 'PIN and display name are required' });
    }

    if (pin.length !== 6 || !/^\d{6}$/.test(pin)) {
        return generateResponse(400, { error: 'PIN must be 6 digits' });
    }

    try {
        const db = getFirestore();
        let targetTripId = tripId;

        // If no tripId provided, we need to find the trip by PIN
        // This is a simplified approach - in production you might want to optimize this
        if (!targetTripId) {
            const tripsSnapshot = await db.collection('trips').get();
            let foundTrip = null;

            for (const doc of tripsSnapshot.docs) {
                const tripData = doc.data();
                const isValidPin = await bcrypt.compare(pin, tripData.pinHash);
                if (isValidPin) {
                    foundTrip = { id: doc.id, ...tripData };
                    break;
                }
            }

            if (!foundTrip) {
                return generateResponse(401, { error: 'Invalid PIN' });
            }

            targetTripId = foundTrip.id;
        } else {
            // Validate PIN for specific trip
            const tripDoc = await db.collection('trips').doc(targetTripId).get();
            
            if (!tripDoc.exists) {
                return generateResponse(404, { error: 'Trip not found' });
            }

            const tripData = tripDoc.data();
            const isValidPin = await bcrypt.compare(pin, tripData.pinHash);

            if (!isValidPin) {
                return generateResponse(401, { error: 'Invalid PIN' });
            }
        }

        // Get trip details
        const tripDoc = await db.collection('trips').doc(targetTripId).get();
        const tripData = tripDoc.data();

        // Check if user already exists (by display name - simplified approach)
        const existingMembersSnapshot = await db
            .collection('trips')
            .doc(targetTripId)
            .collection('members')
            .where('displayName', '==', displayName.trim())
            .where('isActive', '==', true)
            .get();

        if (!existingMembersSnapshot.empty) {
            return generateResponse(400, { error: 'A member with this name already exists in the trip' });
        }

        // Create new member
        const memberId = generateMemberId();
        const memberData = {
            id: memberId,
            displayName: displayName.trim(),
            role: 'member',
            isChild: Boolean(isChild),
            joinedAt: new Date().toISOString(),
            isActive: true,
            isCreator: false
        };

        // Add member to trip
        await db.collection('trips').doc(targetTripId).collection('members').doc(memberId).set(memberData);

        // Update trip member count
        await db.collection('trips').doc(targetTripId).update({
            memberCount: (tripData.memberCount || 0) + 1
        });

        // Create notification for other members
        await createMemberJoinedNotification(db, targetTripId, memberData);

        // Generate JWT token
        const token = jwt.sign(
            { 
                tripId: targetTripId, 
                memberId, 
                role: 'member',
                displayName: displayName.trim()
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        return generateResponse(200, {
            success: true,
            token,
            member: memberData,
            trip: {
                id: targetTripId,
                name: tripData.name,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                timezone: tripData.timezone
            }
        });

    } catch (error) {
        console.error('Join trip error:', error);
        return generateResponse(500, { error: 'Failed to join trip' });
    }
}

/**
 * Validate JWT token and return user/trip info
 */
async function validateToken(headers) {
    const token = headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return generateResponse(401, { error: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { tripId, memberId } = decoded;

        const db = getFirestore();

        // Get trip and member data
        const [tripDoc, memberDoc] = await Promise.all([
            db.collection('trips').doc(tripId).get(),
            db.collection('trips').doc(tripId).collection('members').doc(memberId).get()
        ]);

        if (!tripDoc.exists || !memberDoc.exists) {
            return generateResponse(401, { error: 'Invalid token - trip or member not found' });
        }

        const tripData = tripDoc.data();
        const memberData = memberDoc.data();

        // Check if member is still active
        if (!memberData.isActive) {
            return generateResponse(401, { error: 'Member account is deactivated' });
        }

        return generateResponse(200, {
            valid: true,
            user: memberData,
            trip: {
                id: tripId,
                name: tripData.name,
                startDate: tripData.startDate,
                endDate: tripData.endDate,
                timezone: tripData.timezone,
                memberCount: tripData.memberCount,
                activityCount: tripData.activityCount
            }
        });

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return generateResponse(401, { error: 'Invalid or expired token' });
        }

        console.error('Token validation error:', error);
        return generateResponse(500, { error: 'Token validation failed' });
    }
}

/**
 * Create notification when member joins
 */
async function createMemberJoinedNotification(db, tripId, memberData) {
    try {
        const notificationData = {
            type: 'member_joined',
            message: `${memberData.displayName} joined the trip`,
            tripId,
            createdBy: memberData.id,
            createdAt: new Date().toISOString(),
            readBy: [memberData.id] // Member who joined has already "seen" this
        };

        await db.collection('trips').doc(tripId).collection('notifications').add(notificationData);
    } catch (error) {
        console.error('Failed to create member joined notification:', error);
        // Don't throw - notification failure shouldn't block member joining
    }
}

/**
 * Generate random trip ID
 */
function generateTripId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

/**
 * Generate random member ID
 */
function generateMemberId() {
    return 'member_' + Math.random().toString(36).substring(2, 15);
}

/**
 * Generate 6-digit PIN
 */
function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}