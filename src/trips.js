/**
 * Netlify Function: Trip Management
 * Handles trip details, members, and settings
 */

const bcrypt = require('bcryptjs');
const { authMiddleware } = require('/netlify/functions/utils/auth-middleware');
const { getFirestore } = require('/netlify/functions/utils/firebase-admin');
const { generateResponse } = require('/netlify/functions/utils/validation');

const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return generateResponse(200, null, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
        });
    }

    try {
        const db = getFirestore();
        const { tripId, memberId, role } = event.user;

        const path = event.path;

        // Route to specific handlers based on path
        if (path.includes('/members')) {
            return await handleMembers(db, event, tripId, memberId, role);
        } else if (path.includes('/pin')) {
            return await handlePIN(db, event, tripId, memberId, role);
        } else {
            // Trip details operations
            return await handleTripDetails(db, event, tripId, memberId, role);
        }

    } catch (error) {
        console.error('Trips function error:', error);
        return generateResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Handle trip details operations
 */
async function handleTripDetails(db, event, tripId, memberId, role) {
    switch (event.httpMethod) {
        case 'GET':
            return await getTripDetails(db, tripId, memberId);
        case 'PUT':
            return await updateTripDetails(db, event, tripId, memberId, role);
        default:
            return generateResponse(405, { error: 'Method not allowed' });
    }
}

/**
 * Handle member operations
 */
async function handleMembers(db, event, tripId, memberId, role) {
    const memberIdFromPath = extractMemberIdFromPath(event.path);

    switch (event.httpMethod) {
        case 'GET':
            return await getTripMembers(db, tripId);
        case 'PUT':
            if (!memberIdFromPath) {
                return generateResponse(400, { error: 'Member ID required in path' });
            }
            return await updateMember(db, event, tripId, memberId, role, memberIdFromPath);
        case 'DELETE':
            if (!memberIdFromPath) {
                return generateResponse(400, { error: 'Member ID required in path' });
            }
            return await removeMember(db, tripId, memberId, role, memberIdFromPath);
        default:
            return generateResponse(405, { error: 'Method not allowed' });
    }
}

/**
 * Handle PIN operations
 */
async function handlePIN(db, event, tripId, memberId, role) {
    if (role !== 'admin') {
        return generateResponse(403, { error: 'Only administrators can manage PIN' });
    }

    switch (event.httpMethod) {
        case 'GET':
            return await getCurrentPIN(db, tripId);
        case 'POST':
            return await rotatePIN(db, tripId, memberId);
        default:
            return generateResponse(405, { error: 'Method not allowed' });
    }
}

/**
 * Get trip details
 */
async function getTripDetails(db, tripId, memberId) {
    try {
        const tripDoc = await db.collection('trips').doc(tripId).get();
        
        if (!tripDoc.exists) {
            return generateResponse(404, { error: 'Trip not found' });
        }

        const tripData = tripDoc.data();
        
        // Remove sensitive data
        const { pinHash, ...safeTripData } = tripData;
        
        return generateResponse(200, {
            id: tripId,
            ...safeTripData
        });

    } catch (error) {
        console.error('Get trip details error:', error);
        return generateResponse(500, { error: 'Failed to get trip details' });
    }
}

/**
 * Update trip details (admin only)
 */
async function updateTripDetails(db, event, tripId, memberId, role) {
    if (role !== 'admin') {
        return generateResponse(403, { error: 'Only administrators can update trip details' });
    }

    try {
        const updateData = JSON.parse(event.body);
        const { name, startDate, endDate, timezone, description } = updateData;

        // Validate required fields
        if (name !== undefined && !name?.trim()) {
            return generateResponse(400, { error: 'Trip name cannot be empty' });
        }

        // Validate dates if provided
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (start >= end) {
                return generateResponse(400, { error: 'End date must be after start date' });
            }

            // Validate trip duration (max 1 year)
            const maxDuration = 365 * 24 * 60 * 60 * 1000;
            if (end - start > maxDuration) {
                return generateResponse(400, { error: 'Trip duration cannot exceed 1 year' });
            }
        }

        // Build update object
        const updates = {
            updatedAt: new Date().toISOString(),
            updatedBy: memberId
        };

        if (name !== undefined) updates.name = name.trim();
        if (startDate !== undefined) updates.startDate = startDate;
        if (endDate !== undefined) updates.endDate = endDate;
        if (timezone !== undefined) updates.timezone = timezone;
        if (description !== undefined) updates.description = description?.trim() || '';

        // Update trip
        await db.collection('trips').doc(tripId).update(updates);

        // Get updated trip data
        const updatedDoc = await db.collection('trips').doc(tripId).get();
        const { pinHash, ...updatedTripData } = updatedDoc.data();

        // Create notification for trip update
        await createTripUpdateNotification(db, tripId, memberId, updates);

        return generateResponse(200, {
            id: tripId,
            ...updatedTripData
        });

    } catch (error) {
        console.error('Update trip details error:', error);
        return generateResponse(500, { error: 'Failed to update trip details' });
    }
}

/**
 * Get trip members
 */
async function getTripMembers(db, tripId) {
    try {
        const membersSnapshot = await db
            .collection('trips')
            .doc(tripId)
            .collection('members')
            .where('isActive', '==', true)
            .orderBy('joinedAt')
            .get();

        const members = [];
        membersSnapshot.docs.forEach(doc => {
            const memberData = doc.data();
            members.push({
                id: doc.id,
                ...memberData
            });
        });

        return generateResponse(200, { members });

    } catch (error) {
        console.error('Get trip members error:', error);
        return generateResponse(500, { error: 'Failed to get trip members' });
    }
}

/**
 * Update member (role changes, etc.)
 */
async function updateMember(db, event, tripId, memberId, role, targetMemberId) {
    if (role !== 'admin') {
        return generateResponse(403, { error: 'Only administrators can update members' });
    }

    try {
        const updateData = JSON.parse(event.body);
        const { role: newRole } = updateData;

        // Get target member
        const memberDoc = await db.collection('trips').doc(tripId).collection('members').doc(targetMemberId).get();
        
        if (!memberDoc.exists) {
            return generateResponse(404, { error: 'Member not found' });
        }

        const memberData = memberDoc.data();

        // Prevent changing creator role
        if (memberData.isCreator) {
            return generateResponse(403, { error: 'Cannot modify the trip creator' });
        }

        // Validate new role
        if (newRole && !['admin', 'member'].includes(newRole)) {
            return generateResponse(400, { error: 'Invalid role. Must be "admin" or "member"' });
        }

        const updates = {
            updatedAt: new Date().toISOString(),
            updatedBy: memberId
        };

        if (newRole) {
            updates.role = newRole;
            
            // Update trip roles
            const tripRef = db.collection('trips').doc(tripId);
            const tripDoc = await tripRef.get();
            const tripData = tripDoc.data();
            const roles = { ...tripData.roles };
            roles[targetMemberId] = newRole;
            
            await tripRef.update({ roles });
        }

        // Update member
        await db.collection('trips').doc(tripId).collection('members').doc(targetMemberId).update(updates);

        // Get updated member data
        const updatedDoc = await db.collection('trips').doc(tripId).collection('members').doc(targetMemberId).get();
        const updatedMemberData = updatedDoc.data();

        return generateResponse(200, {
            id: targetMemberId,
            ...updatedMemberData
        });

    } catch (error) {
        console.error('Update member error:', error);
        return generateResponse(500, { error: 'Failed to update member' });
    }
}

/**
 * Remove member from trip (admin only)
 */
async function removeMember(db, tripId, memberId, role, targetMemberId) {
    if (role !== 'admin') {
        return generateResponse(403, { error: 'Only administrators can remove members' });
    }

    // Prevent self-removal
    if (memberId === targetMemberId) {
        return generateResponse(400, { error: 'Cannot remove yourself from the trip' });
    }

    try {
        // Get target member
        const memberDoc = await db.collection('trips').doc(tripId).collection('members').doc(targetMemberId).get();
        
        if (!memberDoc.exists) {
            return generateResponse(404, { error: 'Member not found' });
        }

        const memberData = memberDoc.data();

        // Prevent removing creator
        if (memberData.isCreator) {
            return generateResponse(403, { error: 'Cannot remove the trip creator' });
        }

        // Soft delete - mark as inactive
        await db.collection('trips').doc(tripId).collection('members').doc(targetMemberId).update({
            isActive: false,
            removedAt: new Date().toISOString(),
            removedBy: memberId
        });

        // Remove from trip roles
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();
        const tripData = tripDoc.data();
        const roles = { ...tripData.roles };
        delete roles[targetMemberId];
        
        await tripRef.update({ 
            roles,
            memberCount: Math.max(0, (tripData.memberCount || 1) - 1)
        });

        // Create notification
        await createMemberRemovedNotification(db, tripId, memberId, memberData);

        return generateResponse(200, {
            success: true,
            message: 'Member removed successfully'
        });

    } catch (error) {
        console.error('Remove member error:', error);
        return generateResponse(500, { error: 'Failed to remove member' });
    }
}

/**
 * Get current PIN (admin only)
 */
async function getCurrentPIN(db, tripId) {
    try {
        const tripDoc = await db.collection('trips').doc(tripId).get();
        
        if (!tripDoc.exists) {
            return generateResponse(404, { error: 'Trip not found' });
        }

        // For security, we don't actually return the PIN in a real implementation
        // This is just a placeholder for the frontend to show the PIN to admins
        return generateResponse(200, {
            message: 'PIN retrieved successfully',
            // In a real implementation, you might want to:
            // 1. Generate a temporary token that allows viewing the PIN
            // 2. Log this access for security purposes
            // 3. Rate limit PIN viewing requests
            pin: '••••••' // Placeholder - frontend will handle actual PIN display
        });

    } catch (error) {
        console.error('Get current PIN error:', error);
        return generateResponse(500, { error: 'Failed to get PIN' });
    }
}

/**
 * Rotate PIN (generate new PIN)
 */
async function rotatePIN(db, tripId, memberId) {
    try {
        // Generate new PIN
        const newPIN = generatePIN();
        const pinHash = await bcrypt.hash(newPIN, 10);

        // Update trip with new PIN
        await db.collection('trips').doc(tripId).update({
            pinHash,
            pinRotatedAt: new Date().toISOString(),
            pinRotatedBy: memberId
        });

        // Create notification
        await createPINRotatedNotification(db, tripId, memberId);

        return generateResponse(200, {
            success: true,
            message: 'PIN rotated successfully',
            pin: newPIN // Only return the new PIN immediately after rotation
        });

    } catch (error) {
        console.error('Rotate PIN error:', error);
        return generateResponse(500, { error: 'Failed to rotate PIN' });
    }
}

/**
 * Create notification for trip update
 */
async function createTripUpdateNotification(db, tripId, memberId, updates) {
    try {
        const changedFields = Object.keys(updates).filter(key => !['updatedAt', 'updatedBy'].includes(key));
        
        if (changedFields.length === 0) return;

        const message = `Trip details updated: ${changedFields.join(', ')}`;

        await db.collection('trips').doc(tripId).collection('notifications').add({
            type: 'trip_updated',
            message,
            tripId,
            createdBy: memberId,
            createdAt: new Date().toISOString(),
            readBy: [memberId],
            metadata: {
                updatedFields: changedFields
            }
        });
    } catch (error) {
        console.error('Error creating trip update notification:', error);
        // Don't throw - notification failure shouldn't block the main operation
    }
}

/**
 * Create notification for member removal
 */
async function createMemberRemovedNotification(db, tripId, removedByMemberId, removedMemberData) {
    try {
        const message = `${removedMemberData.displayName} was removed from the trip`;

        await db.collection('trips').doc(tripId).collection('notifications').add({
            type: 'member_left',
            message,
            tripId,
            createdBy: removedByMemberId,
            createdAt: new Date().toISOString(),
            readBy: [removedByMemberId],
            metadata: {
                removedMember: {
                    id: removedMemberData.id,
                    displayName: removedMemberData.displayName
                }
            }
        });
    } catch (error) {
        console.error('Error creating member removed notification:', error);
        // Don't throw - notification failure shouldn't block the main operation
    }
}

/**
 * Create notification for PIN rotation
 */
async function createPINRotatedNotification(db, tripId, memberId) {
    try {
        const message = 'Trip PIN was updated. Please share the new PIN with family members.';

        await db.collection('trips').doc(tripId).collection('notifications').add({
            type: 'trip_updated',
            message,
            tripId,
            createdBy: memberId,
            createdAt: new Date().toISOString(),
            readBy: [memberId],
            metadata: {
                action: 'pin_rotated'
            }
        });
    } catch (error) {
        console.error('Error creating PIN rotated notification:', error);
        // Don't throw - notification failure shouldn't block the main operation
    }
}

/**
 * Extract member ID from URL path
 */
function extractMemberIdFromPath(path) {
    // Path format: /.netlify/functions/trips/{tripId}/members/{memberId}
    const matches = path.match(/\/members\/([^\/]+)$/);
    return matches ? matches[1] : null;
}

/**
 * Generate 6-digit PIN
 */
function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Export with auth middleware
exports.handler = authMiddleware(handler);
