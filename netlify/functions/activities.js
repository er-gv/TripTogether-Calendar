/**
 * Netlify Function: Activities Management
 * Handles CRUD operations for trip activities
 */

const { authMiddleware } = require('./utils/auth-middleware');
const { getFirestore } = require('./utils/firebase-admin');
const { validateRequest, generateResponse } = require('./utils/validation');

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

        switch (event.httpMethod) {
            case 'GET':
                return await getActivities(db, event, tripId);
            case 'POST':
                return await createActivity(db, event, tripId, memberId);
            case 'PUT':
                return await updateActivity(db, event, tripId, memberId, role);
            case 'DELETE':
                return await deleteActivity(db, event, tripId, memberId, role);
            default:
                return generateResponse(405, { error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Activities function error:', error);
        return generateResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get activities for a trip
 */
async function getActivities(db, event, tripId) {
    try {
        const queryParams = event.queryStringParameters || {};
        const { 
            startDate, 
            endDate, 
            attendeeId, 
            limit = '100',
            offset = '0' 
        } = queryParams;

        let query = db.collection('trips').doc(tripId).collection('activities');

        // Apply filters
        if (startDate) {
            query = query.where('date', '>=', startDate);
        }
        if (endDate) {
            query = query.where('date', '<=', endDate);
        }

        // Order by date and time
        query = query.orderBy('date').orderBy('startTime');

        // Apply pagination
        const limitNum = Math.min(parseInt(limit, 10) || 100, 500); // Max 500
        const offsetNum = parseInt(offset, 10) || 0;
        
        if (offsetNum > 0) {
            query = query.offset(offsetNum);
        }
        query = query.limit(limitNum);

        const snapshot = await query.get();
        let activities = [];

        for (const doc of snapshot.docs) {
            const activityData = doc.data();
            
            // Get attendee details
            const attendees = await getAttendeeDetails(db, tripId, activityData.attendees || []);
            
            activities.push({
                id: doc.id,
                ...activityData,
                attendees
            });
        }

        // Filter by attendee if specified
        if (attendeeId) {
            activities = activities.filter(activity => 
                activity.attendees.some(attendee => attendee.id === attendeeId)
            );
        }

        return generateResponse(200, { 
            activities,
            total: activities.length,
            hasMore: activities.length === limitNum
        });

    } catch (error) {
        console.error('Get activities error:', error);
        return generateResponse(500, { error: 'Failed to load activities' });
    }
}

/**
 * Create a new activity
 */
async function createActivity(db, event, tripId, memberId) {
    try {
        const activityData = JSON.parse(event.body);
        
        // Validate required fields
        const { title, date } = activityData;
        if (!title?.trim() || !date) {
            return generateResponse(400, { error: 'Title and date are required' });
        }

        // Validate date format
        if (!isValidDate(date)) {
            return generateResponse(400, { error: 'Invalid date format' });
        }

        // Validate time fields if provided
        if (activityData.startTime && !isValidTime(activityData.startTime)) {
            return generateResponse(400, { error: 'Invalid start time format' });
        }
        if (activityData.endTime && !isValidTime(activityData.endTime)) {
            return generateResponse(400, { error: 'Invalid end time format' });
        }

        // Validate time range
        if (activityData.startTime && activityData.endTime && 
            activityData.startTime >= activityData.endTime) {
            return generateResponse(400, { error: 'End time must be after start time' });
        }

        // Validate URLs if provided
        if (activityData.url && !isValidURL(activityData.url)) {
            return generateResponse(400, { error: 'Invalid website URL' });
        }
        if (activityData.imageUrl && !isValidURL(activityData.imageUrl)) {
            return generateResponse(400, { error: 'Invalid image URL' });
        }

        // Validate attendees exist
        const attendees = activityData.attendees || [];
        if (attendees.length > 0) {
            const validAttendees = await validateAttendees(db, tripId, attendees);
            if (validAttendees.length !== attendees.length) {
                return generateResponse(400, { error: 'Invalid attendee IDs' });
            }
        }

        // Check trip date range
        const isInTripRange = await validateActivityDateInTripRange(db, tripId, date);
        if (!isInTripRange) {
            console.warn(`Activity date ${date} is outside trip range, but allowing it`);
        }

        const activity = {
            title: title.trim(),
            caption: activityData.caption?.trim() || '',
            date,
            startTime: activityData.startTime || null,
            endTime: activityData.endTime || null,
            address: activityData.address?.trim() || '',
            url: activityData.url?.trim() || '',
            price: activityData.price?.trim() || '',
            openingHours: activityData.openingHours?.trim() || '',
            imageUrl: activityData.imageUrl?.trim() || '',
            attendees: attendees,
            createdBy: memberId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            updatedBy: memberId
        };

        // Create activity
        const docRef = await db.collection('trips').doc(tripId).collection('activities').add(activity);
        
        // Update trip activity count
        await updateTripActivityCount(db, tripId, 1);

        // Get attendee details for response
        const attendeeDetails = await getAttendeeDetails(db, tripId, attendees);

        // Create notification
        await createActivityNotification(db, tripId, {
            type: 'activity_created',
            activityId: docRef.id,
            message: `New activity: ${activity.title}`,
            createdBy: memberId,
            activityData: activity
        });

        const responseActivity = {
            id: docRef.id,
            ...activity,
            attendees: attendeeDetails
        };

        return generateResponse(201, responseActivity);

    } catch (error) {
        console.error('Create activity error:', error);
        return generateResponse(500, { error: 'Failed to create activity' });
    }
}

/**
 * Update an activity
 */
async function updateActivity(db, event, tripId, memberId, role) {
    try {
        const activityId = extractActivityIdFromPath(event.path);
        if (!activityId) {
            return generateResponse(400, { error: 'Activity ID is required' });
        }

        // Get existing activity
        const activityDoc = await db.collection('trips').doc(tripId).collection('activities').doc(activityId).get();
        if (!activityDoc.exists) {
            return generateResponse(404, { error: 'Activity not found' });
        }

        const existingActivity = activityDoc.data();

        // Check permissions
        if (role !== 'admin' && existingActivity.createdBy !== memberId) {
            return generateResponse(403, { error: 'Permission denied. You can only edit activities you created.' });
        }

        const updateData = JSON.parse(event.body);
        
        // Validate fields if they're being updated
        if (updateData.title !== undefined) {
            if (!updateData.title?.trim()) {
                return generateResponse(400, { error: 'Title cannot be empty' });
            }
        }

        if (updateData.date !== undefined) {
            if (!isValidDate(updateData.date)) {
                return generateResponse(400, { error: 'Invalid date format' });
            }
        }

        if (updateData.startTime !== undefined && updateData.startTime && !isValidTime(updateData.startTime)) {
            return generateResponse(400, { error: 'Invalid start time format' });
        }

        if (updateData.endTime !== undefined && updateData.endTime && !isValidTime(updateData.endTime)) {
            return generateResponse(400, { error: 'Invalid end time format' });
        }

        // Validate time range
        const startTime = updateData.startTime !== undefined ? updateData.startTime : existingActivity.startTime;
        const endTime = updateData.endTime !== undefined ? updateData.endTime : existingActivity.endTime;
        
        if (startTime && endTime && startTime >= endTime) {
            return generateResponse(400, { error: 'End time must be after start time' });
        }

        // Validate URLs if provided
        if (updateData.url !== undefined && updateData.url && !isValidURL(updateData.url)) {
            return generateResponse(400, { error: 'Invalid website URL' });
        }
        if (updateData.imageUrl !== undefined && updateData.imageUrl && !isValidURL(updateData.imageUrl)) {
            return generateResponse(400, { error: 'Invalid image URL' });
        }

        // Validate attendees if being updated
        if (updateData.attendees !== undefined) {
            const attendees = updateData.attendees || [];
            if (attendees.length > 0) {
                const validAttendees = await validateAttendees(db, tripId, attendees);
                if (validAttendees.length !== attendees.length) {
                    return generateResponse(400, { error: 'Invalid attendee IDs' });
                }
            }
        }

        // Build update object
        const updates = {
            updatedAt: new Date().toISOString(),
            updatedBy: memberId
        };

        // Only update provided fields
        const allowedFields = [
            'title', 'caption', 'date', 'startTime', 'endTime', 
            'address', 'url', 'price', 'openingHours', 'imageUrl', 'attendees'
        ];

        allowedFields.forEach(field => {
            if (updateData[field] !== undefined) {
                if (typeof updateData[field] === 'string') {
                    updates[field] = updateData[field].trim();
                } else {
                    updates[field] = updateData[field];
                }
            }
        });

        // Update activity
        await db.collection('trips').doc(tripId).collection('activities').doc(activityId).update(updates);

        // Get updated activity with attendee details
        const updatedDoc = await db.collection('trips').doc(tripId).collection('activities').doc(activityId).get();
        const updatedActivity = updatedDoc.data();
        const attendeeDetails = await getAttendeeDetails(db, tripId, updatedActivity.attendees || []);

        // Create notification
        await createActivityNotification(db, tripId, {
            type: 'activity_updated',
            activityId,
            message: `Activity updated: ${updatedActivity.title}`,
            createdBy: memberId,
            activityData: updatedActivity
        });

        const responseActivity = {
            id: activityId,
            ...updatedActivity,
            attendees: attendeeDetails
        };

        return generateResponse(200, responseActivity);

    } catch (error) {
        console.error('Update activity error:', error);
        return generateResponse(500, { error: 'Failed to update activity' });
    }
}

/**
 * Delete an activity
 */
async function deleteActivity(db, event, tripId, memberId, role) {
    try {
        const activityId = extractActivityIdFromPath(event.path);
        if (!activityId) {
            return generateResponse(400, { error: 'Activity ID is required' });
        }

        // Get existing activity
        const activityDoc = await db.collection('trips').doc(tripId).collection('activities').doc(activityId).get();
        if (!activityDoc.exists) {
            return generateResponse(404, { error: 'Activity not found' });
        }

        const activity = activityDoc.data();

        // Check permissions
        if (role !== 'admin' && activity.createdBy !== memberId) {
            return generateResponse(403, { error: 'Permission denied. You can only delete activities you created.' });
        }

        // Delete activity
        await db.collection('trips').doc(tripId).collection('activities').doc(activityId).delete();
        
        // Update trip activity count
        await updateTripActivityCount(db, tripId, -1);

        // Create notification
        await createActivityNotification(db, tripId, {
            type: 'activity_deleted',
            activityId,
            message: `Activity deleted: ${activity.title}`,
            createdBy: memberId,
            activityData: activity
        });

        return generateResponse(200, { 
            success: true,
            message: 'Activity deleted successfully' 
        });

    } catch (error) {
        console.error('Delete activity error:', error);
        return generateResponse(500, { error: 'Failed to delete activity' });
    }
}

/**
 * Get attendee details from member IDs
 */
async function getAttendeeDetails(db, tripId, attendeeIds) {
    if (!attendeeIds || attendeeIds.length === 0) return [];

    try {
        const attendeeDetails = [];
        
        for (const attendeeId of attendeeIds) {
            const memberDoc = await db.collection('trips').doc(tripId).collection('members').doc(attendeeId).get();
            if (memberDoc.exists) {
                const memberData = memberDoc.data();
                attendeeDetails.push({
                    id: attendeeId,
                    displayName: memberData.displayName,
                    role: memberData.role,
                    isChild: memberData.isChild || false
                });
            }
        }

        return attendeeDetails;
    } catch (error) {
        console.error('Error getting attendee details:', error);
        return [];
    }
}

/**
 * Validate that attendee IDs exist as trip members
 */
async function validateAttendees(db, tripId, attendeeIds) {
    if (!attendeeIds || attendeeIds.length === 0) return [];

    try {
        const validAttendees = [];
        
        for (const attendeeId of attendeeIds) {
            const memberDoc = await db.collection('trips').doc(tripId).collection('members').doc(attendeeId).get();
            if (memberDoc.exists && memberDoc.data().isActive) {
                validAttendees.push(attendeeId);
            }
        }

        return validAttendees;
    } catch (error) {
        console.error('Error validating attendees:', error);
        return [];
    }
}

/**
 * Check if activity date is within trip date range
 */
async function validateActivityDateInTripRange(db, tripId, activityDate) {
    try {
        const tripDoc = await db.collection('trips').doc(tripId).get();
        if (!tripDoc.exists) return false;

        const tripData = tripDoc.data();
        const activityDateObj = new Date(activityDate);
        const startDate = new Date(tripData.startDate);
        const endDate = new Date(tripData.endDate);

        return activityDateObj >= startDate && activityDateObj <= endDate;
    } catch (error) {
        console.error('Error validating activity date range:', error);
        return true; // Allow if we can't validate
    }
}

/**
 * Update trip activity count
 */
async function updateTripActivityCount(db, tripId, increment) {
    try {
        const tripRef = db.collection('trips').doc(tripId);
        const tripDoc = await tripRef.get();
        
        if (tripDoc.exists) {
            const currentCount = tripDoc.data().activityCount || 0;
            await tripRef.update({
                activityCount: Math.max(0, currentCount + increment)
            });
        }
    } catch (error) {
        console.error('Error updating activity count:', error);
        // Don't throw - this is not critical
    }
}

/**
 * Create activity-related notification
 */
async function createActivityNotification(db, tripId, notificationData) {
    try {
        const notification = {
            ...notificationData,
            tripId,
            createdAt: new Date().toISOString(),
            readBy: [notificationData.createdBy] // Creator has implicitly "read" their own action
        };

        await db.collection('trips').doc(tripId).collection('notifications').add(notification);
    } catch (error) {
        console.error('Error creating activity notification:', error);
        // Don't throw - notification failure shouldn't block the main operation
    }
}

/**
 * Extract activity ID from URL path
 */
function extractActivityIdFromPath(path) {
    // Path format: /.netlify/functions/activities/{activityId}
    const matches = path.match(/\/activities\/([^\/]+)$/);
    return matches ? matches[1] : null;
}

/**
 * Validate date string (YYYY-MM-DD)
 */
function isValidDate(dateString) {
    if (typeof dateString !== 'string') return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}$/);
}

/**
 * Validate time string (HH:MM)
 */
function isValidTime(timeString) {
    if (typeof timeString !== 'string') return false;
    return /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString);
}

/**
 * Validate URL format
 */
function isValidURL(urlString) {
    try {
        new URL(urlString);
        return true;
    } catch {
        return false;
    }
}

// Export with auth middleware
exports.handler = authMiddleware(handler);