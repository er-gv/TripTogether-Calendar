/**
 * TripTogether Calendar - Notifications Management
 * Handles in-app notifications, notification panel, and real-time updates
 */

class Notifications {
    constructor(trip, user) {
        this.trip = trip;
        this.user = user;
        this.apiClient = new ApiClient();
        this.notifications = [];
        this.unreadCount = 0;
        this.isPolling = false;
        this.pollInterval = null;
        
        this.bindEvents();
        this.startPolling();
    }

    bindEvents() {
        // Close notifications panel
        document.getElementById('close-notifications')?.addEventListener('click', () => {
            this.hidePanel();
        });

        // Mark all as read button
        document.getElementById('mark-all-read')?.addEventListener('click', () => {
            this.markAllAsRead();
        });

        // Click outside to close panel
        document.addEventListener('click', (e) => {
            const panel = document.getElementById('notifications-panel');
            const btn = document.getElementById('notifications-btn');
            
            if (panel && !panel.classList.contains('hidden')) {
                if (!panel.contains(e.target) && !btn.contains(e.target)) {
                    this.hidePanel();
                }
            }
        });

        // Escape key to close panel
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hidePanel();
            }
        });
    }

    async loadNotifications(options = {}) {
        try {
            const response = await this.apiClient.getNotifications(this.trip.id, {
                limit: options.limit || 50,
                ...options
            });
            
            this.notifications = response.notifications || [];
            await this.updateUnreadCount();
            this.renderNotifications();
            
            return this.notifications;
        } catch (error) {
            console.error('Failed to load notifications:', error);
            return [];
        }
    }

    async updateUnreadCount() {
        try {
            this.unreadCount = await this.apiClient.getUnreadCount(this.trip.id);
            this.updateBadge();
        } catch (error) {
            console.error('Failed to update unread count:', error);
            this.unreadCount = 0;
            this.updateBadge();
        }
    }

    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            if (this.unreadCount > 0) {
                badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount.toString();
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }

    renderNotifications() {
        const list = document.getElementById('notifications-list');
        if (!list) return;

        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="no-notifications">
                    <p>No notifications yet</p>
                    <small>You'll receive notifications when activities are added or updated</small>
                </div>
            `;
            return;
        }

        list.innerHTML = '';
        
        this.notifications.forEach(notification => {
            const item = this.createNotificationItem(notification);
            list.appendChild(item);
        });
    }

    createNotificationItem(notification) {
        const item = document.createElement('div');
        item.className = 'notification-item';
        item.dataset.notificationId = notification.id;
        
        const isUnread = !notification.readBy.includes(this.user.id);
        if (isUnread) {
            item.classList.add('unread');
        }

        const timeAgo = this.getTimeAgo(notification.createdAt);
        const icon = this.getNotificationIcon(notification.type);
        const typeLabel = this.getNotificationTypeLabel(notification.type);

        item.innerHTML = `
            <div class="notification-header">
                <span class="notification-type">${icon} ${typeLabel}</span>
                <span class="notification-time">${timeAgo}</span>
            </div>
            <div class="notification-message">
                ${escapeHtml(notification.message)}
            </div>
        `;

        // Click to mark as read and potentially navigate
        item.addEventListener('click', () => {
            this.handleNotificationClick(notification);
        });

        return item;
    }

    getNotificationIcon(type) {
        const icons = {
            activity_created: '📅',
            activity_updated: '✏️',
            activity_cancelled: '❌',
            activity_deleted: '🗑️',
            attendees_changed: '👥',
            trip_updated: '🏠',
            member_joined: '👋',
            member_left: '👋'
        };
        
        return icons[type] || '📢';
    }

    getNotificationTypeLabel(type) {
        const labels = {
            activity_created: 'New Activity',
            activity_updated: 'Activity Updated',
            activity_cancelled: 'Activity Cancelled',
            activity_deleted: 'Activity Deleted',
            attendees_changed: 'Attendees Updated',
            trip_updated: 'Trip Updated',
            member_joined: 'Member Joined',
            member_left: 'Member Left'
        };
        
        return labels[type] || 'Notification';
    }

    getTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}h ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays}d ago`;
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: this.trip.timezone
        });
    }

    async handleNotificationClick(notification) {
        // Mark as read if unread
        if (!notification.readBy.includes(this.user.id)) {
            await this.markAsRead(notification.id);
        }

        // Navigate to relevant content
        if (notification.activityId && window.app?.activities) {
            this.hidePanel();
            
            // Small delay to allow panel to close
            setTimeout(() => {
                window.app.activities.showActivityDetails(notification.activityId);
            }, 200);
        }
    }

    async markAsRead(notificationId) {
        try {
            await this.apiClient.markNotificationRead(notificationId);
            
            // Update local state
            const notification = this.notifications.find(n => n.id === notificationId);
            if (notification && !notification.readBy.includes(this.user.id)) {
                notification.readBy.push(this.user.id);
                this.unreadCount = Math.max(0, this.unreadCount - 1);
                this.updateBadge();
                
                // Update UI
                const item = document.querySelector(`[data-notification-id="${notificationId}"]`);
                if (item) {
                    item.classList.remove('unread');
                }
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }

    async markAllAsRead() {
        if (this.unreadCount === 0) return;

        try {
            await this.apiClient.markAllNotificationsRead(this.trip.id);
            
            // Update local state
            this.notifications.forEach(notification => {
                if (!notification.readBy.includes(this.user.id)) {
                    notification.readBy.push(this.user.id);
                }
            });
            
            this.unreadCount = 0;
            this.updateBadge();
            this.renderNotifications();
            
            window.app?.showToast('All notifications marked as read', 'success');
            
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
            window.app?.showToast('Failed to mark notifications as read', 'error');
        }
    }

    togglePanel() {
        const panel = document.getElementById('notifications-panel');
        if (!panel) return;

        const isVisible = !panel.classList.contains('hidden');
        
        if (isVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    }

    async showPanel() {
        const panel = document.getElementById('notifications-panel');
        if (!panel) return;

        // Load latest notifications
        await this.loadNotifications({ limit: 50 });
        
        panel.classList.remove('hidden');
        
        // Focus management for accessibility
        const firstFocusable = panel.querySelector('button, [tabindex="0"]');
        if (firstFocusable) {
            setTimeout(() => firstFocusable.focus(), 100);
        }
    }

    hidePanel() {
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
    }

    // =============================================================================
    // Real-time Updates via Polling
    // =============================================================================

    startPolling() {
        if (this.isPolling) return;
        
        this.isPolling = true;
        
        // Initial load
        this.loadNotifications();
        
        // Poll every 30 seconds for new notifications
        this.pollInterval = setInterval(async () => {
            await this.pollForUpdates();
        }, 30000);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
        }
        this.isPolling = false;
    }

    async pollForUpdates() {
        try {
            // Get latest notifications
            const response = await this.apiClient.getNotifications(this.trip.id, {
                limit: 20
            });
            
            const latestNotifications = response.notifications || [];
            
            // Check for new notifications
            const newNotifications = latestNotifications.filter(latest => 
                !this.notifications.some(existing => existing.id === latest.id)
            );
            
            if (newNotifications.length > 0) {
                // Add new notifications to the beginning
                this.notifications = [...newNotifications, ...this.notifications];
                
                // Show toast for new notifications (limit to avoid spam)
                if (newNotifications.length === 1) {
                    this.showNewNotificationToast(newNotifications[0]);
                } else if (newNotifications.length <= 3) {
                    this.showNewNotificationToast({
                        message: `${newNotifications.length} new notifications`
                    });
                }
                
                // Update unread count and UI
                await this.updateUnreadCount();
                this.renderNotifications();
                
                // Refresh activities if there are activity-related notifications
                const hasActivityUpdates = newNotifications.some(n => 
                    n.type.startsWith('activity_') || n.type === 'attendees_changed'
                );
                
                if (hasActivityUpdates && window.app?.activities) {
                    await window.app.activities.loadActivities();
                }
            } else {
                // Just update unread count in case something was read elsewhere
                await this.updateUnreadCount();
            }
            
        } catch (error) {
            // Silently handle polling errors to avoid disrupting user experience
            console.warn('Notification polling failed:', error);
        }
    }

    showNewNotificationToast(notification) {
        if (!window.app?.showToast) return;
        
        const message = notification.message || 'New notification received';
        window.app.showToast(message, 'info');
    }

    // =============================================================================
    // Notification Creation (for local updates)
    // =============================================================================

    addLocalNotification(type, message, activityId = null) {
        // Create a local notification object
        const notification = {
            id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            message,
            activityId,
            createdAt: new Date().toISOString(),
            readBy: [], // Will be unread initially
            isLocal: true // Flag to indicate this is a local notification
        };

        // Add to beginning of notifications array
        this.notifications.unshift(notification);
        this.unreadCount++;
        
        // Update UI
        this.updateBadge();
        this.renderNotifications();
        
        // Show toast
        this.showNewNotificationToast(notification);
        
        return notification;
    }

    // =============================================================================
    // Lifecycle Methods
    // =============================================================================

    destroy() {
        this.stopPolling();
        
        // Remove event listeners if needed
        const panel = document.getElementById('notifications-panel');
        if (panel) {
            panel.classList.add('hidden');
        }
        
        // Clear state
        this.notifications = [];
        this.unreadCount = 0;
        this.updateBadge();
    }

    // =============================================================================
    // Utility Methods
    // =============================================================================

    getNotificationById(id) {
        return this.notifications.find(n => n.id === id);
    }

    getUnreadNotifications() {
        return this.notifications.filter(n => !n.readBy.includes(this.user.id));
    }

    getNotificationsByType(type) {
        return this.notifications.filter(n => n.type === type);
    }

    getNotificationsByActivity(activityId) {
        return this.notifications.filter(n => n.activityId === activityId);
    }

    // Export notifications data (for debugging or future features)
    exportNotifications() {
        return {
            notifications: this.notifications,
            unreadCount: this.unreadCount,
            lastUpdate: new Date().toISOString(),
            tripId: this.trip.id,
            userId: this.user.id
        };
    }
}
