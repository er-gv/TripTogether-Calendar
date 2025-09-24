/**
 * TripTogether Calendar - API Client
 * Handles all communication with Netlify serverless functions
 */

class ApiClient {
    constructor() {
        this.baseUrl = '/src/js/netlify/functions'; // Netlify functions endpoint
        console.log('API Client initialized with base URL:', this.baseUrl);
        this.token = localStorage.getItem('auth_token');
    }

    /**
     * Make an authenticated API request
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        // Add auth token if available
        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        // Stringify body if it's an object
        if (config.body && typeof config.body !== 'string') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            
            // Handle different response types
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                // Try to get error message from response
                const errorMessage = data?.error || data?.message || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            return data;
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            
            // Handle network errors
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                throw new Error('Network error. Please check your internet connection.');
            }
            
            throw error;
        }
    }

    /**
     * Set the authentication token
     */
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('auth_token', token);
        } else {
            localStorage.removeItem('auth_token');
        }
    }

    /**
     * Validate the current session token
     */
    async validateToken() {
        if (!this.token) {
            throw new Error('No authentication token');
        }

        return await this.request('/auth', {
            method: 'POST',
            body: { action: 'validate_token' }
        });
    }

    // =============================================================================
    // Authentication Methods
    // =============================================================================

    /**
     * Join an existing trip with PIN
     */
    async joinTrip(data) {
        const response = await this.request('/auth', {
            method: 'POST',
            body: {
                action: 'join_trip',
                ...data
            }
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    /**
     * Create a new trip
     */
    async createTrip(data) {
        const response = await this.request('/auth', {
            method: 'POST',
            body: {
                action: 'create_trip',
                ...data
            }
        });

        if (response.token) {
            this.setToken(response.token);
        }

        return response;
    }

    // =============================================================================
    // Trip Management Methods
    // =============================================================================

    /**
     * Get trip details
     */
    async getTrip(tripId) {
        return await this.request(`/trips/${tripId}`);
    }

    /**
     * Update trip details (admin only)
     */
    async updateTrip(tripId, data) {
        return await this.request(`/trips/${tripId}`, {
            method: 'PUT',
            body: data
        });
    }

    /**
     * Get trip members
     */
    async getTripMembers(tripId) {
        return await this.request(`/trips/${tripId}/members`);
    }

    /**
     * Remove a member from trip (admin only)
     */
    async removeMember(tripId, memberId) {
        return await this.request(`/trips/${tripId}/members/${memberId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Update member role (admin only)
     */
    async updateMemberRole(tripId, memberId, role) {
        return await this.request(`/trips/${tripId}/members/${memberId}`, {
            method: 'PUT',
            body: { role }
        });
    }

    /**
     * Rotate trip PIN (admin only)
     */
    async rotatePIN(tripId) {
        return await this.request(`/trips/${tripId}/pin`, {
            method: 'POST',
            body: { action: 'rotate' }
        });
    }

    /**
     * Get current PIN (admin only)
     */
    async getCurrentPIN(tripId) {
        return await this.request(`/trips/${tripId}/pin`);
    }

    // =============================================================================
    // Activity Methods
    // =============================================================================

    /**
     * Get all activities for a trip
     */
    async getActivities(tripId, filters = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const url = queryString ? `/activities?tripId=${tripId}&${queryString}` : `/activities?tripId=${tripId}`;
        
        return await this.request(url);
    }

    /**
     * Get a specific activity
     */
    async getActivity(activityId) {
        return await this.request(`/activities/${activityId}`);
    }

    /**
     * Create a new activity
     */
    async createActivity(tripId, activityData) {
        return await this.request('/activities', {
            method: 'POST',
            body: {
                tripId,
                ...activityData
            }
        });
    }

    /**
     * Update an activity
     */
    async updateActivity(activityId, activityData) {
        return await this.request(`/activities/${activityId}`, {
            method: 'PUT',
            body: activityData
        });
    }

    /**
     * Delete an activity
     */
    async deleteActivity(activityId) {
        return await this.request(`/activities/${activityId}`, {
            method: 'DELETE'
        });
    }

    /**
     * Update activity attendees
     */
    async updateActivityAttendees(activityId, attendeeIds) {
        return await this.request(`/activities/${activityId}/attendees`, {
            method: 'PUT',
            body: { attendees: attendeeIds }
        });
    }

    // =============================================================================
    // Notification Methods
    // =============================================================================

    /**
     * Get notifications for current user
     */
    async getNotifications(tripId, options = {}) {
        const queryParams = new URLSearchParams();
        
        if (options.limit) queryParams.append('limit', options.limit);
        if (options.offset) queryParams.append('offset', options.offset);
        if (options.unreadOnly) queryParams.append('unread_only', 'true');

        const queryString = queryParams.toString();
        const url = queryString ? `/notifications?tripId=${tripId}&${queryString}` : `/notifications?tripId=${tripId}`;
        
        return await this.request(url);
    }

    /**
     * Mark notification as read
     */
    async markNotificationRead(notificationId) {
        return await this.request(`/notifications/${notificationId}/read`, {
            method: 'POST'
        });
    }

    /**
     * Mark all notifications as read for current user
     */
    async markAllNotificationsRead(tripId) {
        return await this.request(`/notifications/read-all`, {
            method: 'POST',
            body: { tripId }
        });
    }

    /**
     * Get unread notification count
     */
    async getUnreadCount(tripId) {
        const response = await this.request(`/notifications/unread-count?tripId=${tripId}`);
        return response.count || 0;
    }

    // =============================================================================
    // File Upload Methods (for future use)
    // =============================================================================

    /**
     * Upload an image (placeholder for future Firebase Storage integration)
     */
    async uploadImage(file, tripId) {
        // For MVP, we're using URL inputs instead of file uploads
        // This method is a placeholder for future implementation
        throw new Error('File upload not implemented in MVP. Please use image URLs.');
    }

    // =============================================================================
    // Utility Methods
    // =============================================================================

    /**
     * Check API health
     */
    async healthCheck() {
        try {
            await this.request('/health', { method: 'GET' });
            return true;
        } catch (error) {
            console.warn('API health check failed:', error);
            return false;
        }
    }

    /**
     * Get timezone suggestions
     */
    getTimezoneOptions() {
        return [
            { value: 'America/New_York', label: 'Eastern Time (EST/EDT)' },
            { value: 'America/Chicago', label: 'Central Time (CST/CDT)' },
            { value: 'America/Denver', label: 'Mountain Time (MST/MDT)' },
            { value: 'America/Los_Angeles', label: 'Pacific Time (PST/PDT)' },
            { value: 'America/Vancouver', label: 'Pacific Time (Vancouver)' },
            { value: 'Europe/London', label: 'GMT (London)' },
            { value: 'Europe/Paris', label: 'CET (Paris/Berlin)' },
            { value: 'Europe/Rome', label: 'CET (Rome)' },
            { value: 'Asia/Tokyo', label: 'JST (Tokyo)' },
            { value: 'Asia/Shanghai', label: 'CST (Shanghai)' },
            { value: 'Australia/Sydney', label: 'AEST (Sydney)' }
        ];
    }

    /**
     * Format date for API (ISO string)
     */
    formatDateForAPI(date) {
        if (!date) return null;
        
        if (typeof date === 'string') {
            return new Date(date).toISOString();
        }
        
        if (date instanceof Date) {
            return date.toISOString();
        }
        
        return null;
    }

    /**
     * Parse date from API
     */
    parseDateFromAPI(dateString) {
        if (!dateString) return null;
        return new Date(dateString);
    }

    /**
     * Validate email format
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate URL format
     */
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Handle API errors with user-friendly messages
     */
    getErrorMessage(error) {
        if (error.message) {
            return error.message;
        }
        
        if (typeof error === 'string') {
            return error;
        }
        
        return 'An unexpected error occurred. Please try again.';
    }

    // =============================================================================
    // Real-time Updates (placeholder for future WebSocket implementation)
    // =============================================================================

    /**
     * Subscribe to real-time updates (placeholder)
     */
    subscribeToUpdates(tripId, callback) {
        // For MVP, we'll use periodic polling instead of WebSockets
        // This can be enhanced later with Firebase real-time database or WebSockets
        console.log(`Real-time subscription for trip ${tripId} - using polling fallback`);
        
        // Poll for updates every 30 seconds
        const pollInterval = setInterval(async () => {
            try {
                const notifications = await this.getNotifications(tripId, { unreadOnly: true });
                const activities = await this.getActivities(tripId);
                
                callback({
                    type: 'update',
                    data: {
                        notifications: notifications.notifications || [],
                        activities: activities.activities || []
                    }
                });
            } catch (error) {
                console.error('Polling update failed:', error);
            }
        }, 30000);

        // Return unsubscribe function
        return () => {
            clearInterval(pollInterval);
        };
    }
}
