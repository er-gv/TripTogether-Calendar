/**
 * Netlify Function: Notifications Management
 * Handles notification retrieval and status updates
 */

const { authMiddleware } = require('./utils/auth-middleware');
const { getFirestore } = require('./utils/firebase-admin');
const { generateResponse } = require('./utils/validation');

const handler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return generateResponse(200, null, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
        });
    }

    try {
        const db = getFirestore();
        const { tripId, memberId } = event.user;

        switch (event.httpMethod) {
            case 'GET':
                return await getNotifications(db, event, tripId, memberId);
            case 'POST':
                return await handleNotificationAction(db, event, tripId, memberId);
            default:
                return generateResponse(405, { error: 'Method not allowed' });
        }
    } catch (error) {
        console.error('Notifications function error:', error);
        return generateResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get notifications for a trip/user
 */
async function getNotifications(db, event, tripId, memberId) {
    try {
        const queryParams = event.queryStringParameters || {};
        const { 
            limit = '50', 
            offset = '0', 
            unread_only = 'false',
            type
        } = queryParams;

        let query = db.collection('trips').doc(tripId).collection('notifications');

        // Filter by type if specified
        if (type) {
            query = query.where('type', '==', type);
        }

        // Order by creation date (newest first)
        query = query.orderBy('createdAt', 'desc');

        // Apply pagination
        const limitNum = Math.min(parseInt(limit, 10) || 50, 100); // Max 100
        const offsetNum = parseInt(offset, 10) || 0;
        
        if (offsetNum > 0) {
            query = query.offset(offsetNum);
        }
        query = query.limit(limitNum);

        const snapshot = await query.get();
        let notifications = [];

        snapshot.docs.forEach(doc => {
            const notificationData = doc.data();
            
            // Skip if unread_only is true and this notification is read by user
            if (unread_only === 'true' && notificationData.readBy && notificationData.readBy.includes(memberId)) {
                return;
            }

            notifications.push({
                id: doc.id,
                ...notificationData,
                isRead: notificationData.readBy && notificationData.readBy.includes(memberId)
            });
        });

        return generateResponse(200, { 
            notifications,
            total: notifications.length,
            hasMore: notifications.length === limitNum
        });

    } catch (error) {
        console.error('Get notifications error:', error);
        return generateResponse(500, { error: 'Failed to load notifications' });
    }
}

/**
 * Handle notification actions (mark as read, mark all as read, etc.)
 */
async function handleNotificationAction(db, event, tripId, memberId) {
    try {
        const body = JSON.parse(event.body);
        const { action, notificationId } = body;

        switch (action) {
            case 'mark_read':
                return await markNotificationAsRead(db, tripId, notificationId, memberId);
            case 'mark_all_read':
                return await markAllNotificationsAsRead(db, tripId, memberId);
            case 'get_unread_count':
                return await getUnreadCount(db, tripId, memberId);
            default:
                return generateResponse(400, { error: 'Invalid action' });
        }
    } catch (error) {
        console.error('Notification action error:', error);
        return generateResponse(500, { error: 'Failed to process notification action' });
    }
}

/**
 * Mark a single notification as read
 */
async function markNotificationAsRead(db, tripId, notificationId, memberId) {
    try {
        if (!notificationId) {
            return generateResponse(400, { error: 'Notification ID is required' });
        }

        const notificationRef = db.collection('trips').doc(tripId).collection('notifications').doc(notificationId);
        const notificationDoc = await notificationRef.get();

        if (!notificationDoc.exists) {
            return generateResponse(404, { error: 'Notification not found' });
        }

        const notificationData = notificationDoc.data();
        const readBy = notificationData.readBy || [];

        // Check if already read by this user
        if (readBy.includes(memberId)) {
            return generateResponse(200, { 
                success: true, 
                message: 'Notification already marked as read' 
            });
        }

        // Add user to readBy array
        await notificationRef.update({
            readBy: [...readBy, memberId],
            lastReadAt: new Date().toISOString()
        });

        return generateResponse(200, { 
            success: true,
            message: 'Notification marked as read' 
        });

    } catch (error) {
        console.error('Mark notification as read error:', error);
        return generateResponse(500, { error: 'Failed to mark notification as read' });
    }
}

/**
 * Mark all notifications as read for a user
 */
async function markAllNotificationsAsRead(db, tripId, memberId) {
    try {
        const notificationsRef = db.collection('trips').doc(tripId).collection('notifications');
        const snapshot = await notificationsRef.get();

        const batch = db.batch();
        let updateCount = 0;

        snapshot.docs.forEach(doc => {
            const notificationData = doc.data();
            const readBy = notificationData.readBy || [];

            // Skip if already read by this user
            if (!readBy.includes(memberId)) {
                batch.update(doc.ref, {
                    readBy: [...readBy, memberId],
                    lastReadAt: new Date().toISOString()
                });
                updateCount++;
            }
        });

        if (updateCount > 0) {
            await batch.commit();
        }

        return generateResponse(200, { 
            success: true,
            updatedCount: updateCount,
            message: `Marked ${updateCount} notifications as read`
        });

    } catch (error) {
        console.error('Mark all notifications as read error:', error);
        return generateResponse(500, { error: 'Failed to mark all notifications as read' });
    }
}

/**
 * Get unread notification count for a user
 */
async function getUnreadCount(db, tripId, memberId) {
    try {
        const notificationsRef = db.collection('trips').doc(tripId).collection('notifications');
        const snapshot = await notificationsRef.get();

        let unreadCount = 0;

        snapshot.docs.forEach(doc => {
            const notificationData = doc.data();
            const readBy = notificationData.readBy || [];

            if (!readBy.includes(memberId)) {
                unreadCount++;
            }
        });

        return generateResponse(200, { count: unreadCount });

    } catch (error) {
        console.error('Get unread count error:', error);
        return generateResponse(500, { error: 'Failed to get unread count' });
    }
}

// Alternative endpoint handlers for different URL patterns
const alternativeHandler = async (event, context) => {
    if (event.httpMethod === 'OPTIONS') {
        return generateResponse(200, null, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
        });
    }

    try {
        const db = getFirestore();
        const { tripId, memberId } = event.user;

        // Handle different endpoints
        const path = event.path;

        if (path.includes('/unread-count')) {
            return await getUnreadCount(db, tripId, memberId);
        }

        if (path.includes('/read-all')) {
            return await markAllNotificationsAsRead(db, tripId, memberId);
        }

        if (path.includes('/read/')) {
            const notificationId = extractNotificationIdFromPath(path);
            return await markNotificationAsRead(db, tripId, notificationId, memberId);
        }

        return generateResponse(404, { error: 'Endpoint not found' });

    } catch (error) {
        console.error('Alternative notifications handler error:', error);
        return generateResponse(500, { 
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Extract notification ID from URL path
 */
function extractNotificationIdFromPath(path) {
    // Path format: /.netlify/functions/notifications/{notificationId}/read
    const matches = path.match(/\/notifications\/([^\/]+)\/read$/);
    return matches ? matches[1] : null;
}

/**
 * Create a new notification (utility function for other services)
 */
async function createNotification(db, tripId, notificationData) {
    try {
        const notification = {
            ...notificationData,
            tripId,
            createdAt: new Date().toISOString(),
            readBy: notificationData.readBy || []
        };

        const docRef = await db.collection('trips').doc(tripId).collection('notifications').add(notification);
        
        return {
            id: docRef.id,
            ...notification
        };
    } catch (error) {
        console.error('Create notification error:', error);
        throw error;
    }
}

/**
 * Clean up old notifications (utility function)
 */
async function cleanupOldNotifications(db, tripId, daysToKeep = 90) {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
        const cutoffISO = cutoffDate.toISOString();

        const notificationsRef = db.collection('trips').doc(tripId).collection('notifications');
        const oldNotifications = await notificationsRef
            .where('createdAt', '<', cutoffISO)
            .get();

        if (oldNotifications.empty) {
            return 0;
        }

        const batch = db.batch();
        let deleteCount = 0;

        oldNotifications.docs.forEach(doc => {
            batch.delete(doc.ref);
            deleteCount++;
        });

        await batch.commit();
        
        console.log(`Cleaned up ${deleteCount} old notifications for trip ${tripId}`);
        return deleteCount;

    } catch (error) {
        console.error('Cleanup old notifications error:', error);
        return 0;
    }
}

/**
 * Get notification statistics (utility function)
 */
async function getNotificationStats(db, tripId) {
    try {
        const notificationsRef = db.collection('trips').doc(tripId).collection('notifications');
        const snapshot = await notificationsRef.get();

        const stats = {
            total: 0,
            byType: {},
            last24Hours: 0,
            last7Days: 0
        };

        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        snapshot.docs.forEach(doc => {
            const notification = doc.data();
            const createdAt = new Date(notification.createdAt);

            stats.total++;

            // Count by type
            const type = notification.type || 'unknown';
            stats.byType[type] = (stats.byType[type] || 0) + 1;

            // Count recent notifications
            if (createdAt >= oneDayAgo) {
                stats.last24Hours++;
            }
            if (createdAt >= sevenDaysAgo) {
                stats.last7Days++;
            }
        });

        return stats;

    } catch (error) {
        console.error('Get notification stats error:', error);
        return null;
    }
}

// Export with auth middleware
exports.handler = authMiddleware(handler);

// Export utility functions for use in other modules
module.exports = {
    handler: authMiddleware(handler),
    alternativeHandler: authMiddleware(alternativeHandler),
    createNotification,
    cleanupOldNotifications,
    getNotificationStats
};
