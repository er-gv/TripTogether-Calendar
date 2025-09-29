/**
 * TripTogether Calendar - Main Application Logic
 * Handles routing, authentication, and core app functionality
 */

class TripTogetherApp {
    constructor() {
        this.currentUser = null;
        this.currentTrip = null;
        this.apiClient = new ApiClient();
        this.calendar = null;
        this.activities = null;
        this.notifications = null;
        
        this.initialize();
    }

    async initialize() {
        this.setupEventListeners();
        this.setupRouter();
        this.showLoading(true);
        
        // Check for existing session
        const token = localStorage.getItem('auth_token');
        if (token) {
            try {
                await this.validateSession();
                this.showApp();
            } catch (error) {
                console.error('Session validation failed:', error);
                this.logout();
            }
        } else {
            // Check for invite link in URL
            this.handleInviteLink();
        }
        
        this.showLoading(false);
    }

    setupEventListeners() {
        // Landing page events
        document.getElementById('show-create')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showCreateTrip();
        });
        
        document.getElementById('show-join')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showJoinTrip();
        });
        
        document.getElementById('join-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleJoinTrip();
        });
        
        document.getElementById('create-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateTrip();
        });
        
        document.getElementById('copy-invite')?.addEventListener('click', () => {
            this.copyToClipboard(document.getElementById('invite-url').value);
        });
        
        document.getElementById('enter-trip')?.addEventListener('click', () => {
            this.showApp();
        });

        // App header events
        document.getElementById('add-activity-btn')?.addEventListener('click', () => {
            window.openActivityFormModal();
        });
        
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.notifications?.togglePanel();
        });
        
        document.getElementById('settings-btn')?.addEventListener('click', () => {
            this.showSettings();
        });
        
        document.getElementById('user-btn')?.addEventListener('click', () => {
            this.showUserMenu();
        });

        // View switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                this.switchCalendarView(view);
            });
        });

        // Calendar navigation
        document.getElementById('prev-period')?.addEventListener('click', () => {
            this.calendar?.navigatePrevious();
        });
        
        document.getElementById('next-period')?.addEventListener('click', () => {
            this.calendar?.navigateNext();
        });
        
        document.getElementById('today-btn')?.addEventListener('click', () => {
            this.calendar?.goToToday();
        });

        // Modal events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Keyboard events
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    setupRouter() {
        // Simple hash-based routing
        window.addEventListener('hashchange', () => {
            this.handleRouteChange();
        });
        
        // Handle initial route
        this.handleRouteChange();
    }

    handleRouteChange() {
        const hash = window.location.hash.slice(1);
        const [route, ...params] = hash.split('/');
        
        switch (route) {
            case 'trip':
                if (params[0] && this.currentUser) {
                    this.loadTrip(params[0]);
                }
                break;
            case 'activity':
                if (params[0] === 'new') {
                    window.openActivityFormModal();
                } else if (params[0] === 'edit' && params[1]) {
                    window.openActivityFormModal(params[1]);
                }
                break;
            default:
                if (!this.currentUser) {
                    this.showLanding();
                }
                break;
        }
    }

    handleInviteLink() {
        const urlParams = new URLSearchParams(window.location.search);
        const tripId = urlParams.get('trip');
        
        if (tripId) {
            // Pre-fill join form with trip reference
            const joinSection = document.getElementById('join-section');
            const createSection = document.getElementById('create-section');
            
            if (joinSection && createSection) {
                joinSection.classList.remove('hidden');
                createSection.classList.add('hidden');
                
                // Store trip ID for later use
                this.pendingTripId = tripId;
            }
        }
        
        this.showLanding();
    }

    async validateSession() {
        try {
            const response = await this.apiClient.validateToken();
            this.currentUser = response.user;
            this.currentTrip = response.trip;
            
            if (this.currentTrip) {
                await this.loadTripData();
            }
            
            return response;
        } catch (error) {
            localStorage.removeItem('auth_token');
            throw error;
        }
    }

    async handleJoinTrip() {
        const form = document.getElementById('join-form');
        const formData = new FormData(form);
        
        const pin = formData.get('join-pin') || document.getElementById('join-pin').value;
        const displayName = formData.get('join-name') || document.getElementById('join-name').value;
        const isChild = document.getElementById('join-is-child').checked;
        
        if (!pin || !displayName) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        this.showLoading(true, 'Joining trip...');
        
        try {
            const response = await this.apiClient.joinTrip({
                pin: pin.trim(),
                tripId: this.pendingTripId, // May be undefined, server will handle
                displayName: displayName.trim(),
                isChild
            });
            
            this.currentUser = response.member;
            this.currentTrip = response.trip;
            
            // Store auth token
            localStorage.setItem('auth_token', response.token);
            
            this.showToast('Successfully joined trip!', 'success');
            
            // Clear URL parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            
            await this.loadTripData();
            this.showApp();
            
        } catch (error) {
            console.error('Join trip error:', error);
            this.showToast(error.message || 'Failed to join trip. Please check your PIN.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async handleCreateTrip() {
        const form = document.getElementById('create-form');
        const formData = new FormData(form);
        
        const name = formData.get('trip-name') || document.getElementById('trip-name').value;
        const startDate = formData.get('start-date') || document.getElementById('start-date').value;
        const endDate = formData.get('end-date') || document.getElementById('end-date').value;
        const timezone = formData.get('timezone') || document.getElementById('timezone').value;
        const displayName = formData.get('creator-name') || document.getElementById('creator-name').value;
        const isChild = document.getElementById('creator-is-child').checked;
        
        if (!name || !startDate || !endDate || !timezone || !displayName) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
            this.showToast('End date must be after start date', 'error');
            return;
        }
        
        this.showLoading(true, 'Creating trip...');
        
        try {
            const response = await this.apiClient.createTrip({
                name: name.trim(),
                startDate,
                endDate,
                timezone,
                displayName: displayName.trim(),
                isChild
            });
            
            this.currentUser = response.member;
            this.currentTrip = response.trip;
            
            // Store auth token
            localStorage.setItem('auth_token', response.token);
            
            // Show success with PIN and invite link
            this.showTripCreated(response.trip);
            
        } catch (error) {
            console.error('Create trip error:', error);
            this.showToast(error.message || 'Failed to create trip. Please try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    showTripCreated(trip) {
        // Hide other sections
        document.getElementById('join-section').classList.add('hidden');
        document.getElementById('create-section').classList.add('hidden');
        
        // Show success section
        const successSection = document.getElementById('trip-created');
        successSection.classList.remove('hidden');
        
        // Populate data
        document.getElementById('created-trip-name').textContent = trip.name;
        document.getElementById('created-pin').textContent = trip.pin;
        
        const inviteUrl = `${window.location.origin}${window.location.pathname}?trip=${trip.id}`;
        document.getElementById('invite-url').value = inviteUrl;
    }

    async loadTripData() {
        if (!this.currentTrip) return;
        
        try {
            // Initialize components
            this.calendar = new Calendar(this.currentTrip);
            this.activities = new Activities(this.currentTrip, this.currentUser);
            this.notifications = new Notifications(this.currentTrip, this.currentUser);
            
            // Load initial data
            await Promise.all([
                this.activities.loadActivities(),
                this.notifications.loadNotifications()
            ]);
            
            this.updateAppHeader();
            this.calendar.render();
            
        } catch (error) {
            console.error('Failed to load trip data:', error);
            this.showToast('Failed to load trip data', 'error');
        }
    }

    updateAppHeader() {
        if (!this.currentTrip || !this.currentUser) return;
        
        // Trip title and dates
        document.getElementById('trip-title').textContent = this.currentTrip.name;
        
        const startDate = new Date(this.currentTrip.startDate).toLocaleDateString();
        const endDate = new Date(this.currentTrip.endDate).toLocaleDateString();
        document.getElementById('trip-dates').textContent = `${startDate} - ${endDate}`;
        
        // User info
        document.getElementById('user-name').textContent = this.currentUser.displayName;
        
        // Show admin-only elements
        const isAdmin = this.currentUser.role === 'admin';
        document.querySelectorAll('.admin-only').forEach(element => {
            element.classList.toggle('hidden', !isAdmin);
        });
    }

    switchCalendarView(view) {
        // Update view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update calendar views
        document.querySelectorAll('.calendar-view').forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.id === `${view}-view`);
        });
        
        // Update calendar component
        if (this.calendar) {
            this.calendar.switchView(view);
        }
    }

    showSettings() {
        if (this.currentUser?.role !== 'admin') {
            this.showToast('Only administrators can access settings', 'error');
            return;
        }
        
        // Populate settings modal with current data
        this.populateSettingsModal();
        
        // Show modal
        document.getElementById('settings-modal').classList.remove('hidden');
    }

    populateSettingsModal() {
        if (!this.currentTrip) return;
        
        // Trip details
        document.getElementById('settings-trip-name').value = this.currentTrip.name;
        document.getElementById('settings-start-date').value = this.currentTrip.startDate;
        document.getElementById('settings-end-date').value = this.currentTrip.endDate;
        document.getElementById('settings-timezone').value = this.currentTrip.timezone;
        
        // Current PIN and invite link
        const currentPin = this.currentTrip.currentPin || '••••••';
        document.getElementById('current-pin-display').textContent = currentPin;
        
        const inviteUrl = `${window.location.origin}${window.location.pathname}?trip=${this.currentTrip.id}`;
        document.getElementById('current-invite-url').value = inviteUrl;
        
        // Members list (if available)
        this.populateMembersList();
    }

    populateMembersList() {
        const membersList = document.getElementById('members-list');
        if (!membersList || !this.currentTrip.members) return;
        
        membersList.innerHTML = '';
        
        this.currentTrip.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            
            const avatar = member.displayName.charAt(0).toUpperCase();
            const roleColor = member.role === 'admin' ? 'var(--primary-color)' : 'var(--secondary-color)';
            
            memberItem.innerHTML = `
                <div class="member-info">
                    <div class="member-avatar" style="background-color: ${roleColor}">
                        ${avatar}
                    </div>
                    <div class="member-details">
                        <h4>${escapeHtml(member.displayName)}</h4>
                        <span class="member-role-badge">${member.role || 'Member'}</span>
                    </div>
                </div>
                <div class="member-actions">
                    ${member.role !== 'admin' ? `
                        <select class="role-select" data-member-id="${member.id}">
                            <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                            <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                        <button class="btn btn-danger btn-icon" onclick="app.removeMember('${member.id}')">
                            <span class="icon">🗑️</span>
                        </button>
                    ` : '<span class="member-role-badge">Creator</span>'}
                </div>
            `;
            
            membersList.appendChild(memberItem);
        });
    }

    showUserMenu() {
        // Simple implementation - could be expanded to dropdown
        const confirmLogout = confirm('Do you want to log out?');
        if (confirmLogout) {
            this.logout();
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.currentTrip = null;
        this.calendar = null;
        this.activities = null;
        this.notifications = null;
        
        // Clear URL
        window.location.hash = '';
        
        this.showLanding();
        this.showToast('Logged out successfully', 'success');
    }

    showLanding() {
        document.getElementById('landing-page').classList.remove('hidden');
        document.getElementById('main-app').classList.add('hidden');
        
        // Reset forms
        document.querySelectorAll('form').forEach(form => form.reset());
        
        // Show join section by default
        this.showJoinTrip();
    }

    showApp() {
        document.getElementById('landing-page').classList.add('hidden');
        document.getElementById('main-app').classList.remove('hidden');
        
        // Set default view
        this.switchCalendarView('month');
        
        // Set hash for proper routing
        if (this.currentTrip) {
            window.location.hash = `trip/${this.currentTrip.id}`;
        }
    }

    showJoinTrip() {
        document.getElementById('join-section').classList.remove('hidden');
        document.getElementById('create-section').classList.add('hidden');
        document.getElementById('trip-created').classList.add('hidden');
    }

    showCreateTrip() {
        document.getElementById('join-section').classList.add('hidden');
        document.getElementById('create-section').classList.remove('hidden');
        document.getElementById('trip-created').classList.add('hidden');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        
        document.getElementById('notifications-panel')?.classList.add('hidden');
    }

    showLoading(show, message = 'Loading...') {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
            
            if (show && message) {
                // Could add loading message if needed
                console.log(message);
            }
        }
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${escapeHtml(message)}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        container.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            console.error('Failed to copy text:', err);
            this.showToast('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textarea);
    }

    // Public method for removing members (called from settings)
    async removeMember(memberId) {
        if (!confirm('Are you sure you want to remove this member?')) {
            return;
        }
        
        try {
            await this.apiClient.removeMember(this.currentTrip.id, memberId);
            this.showToast('Member removed successfully', 'success');
            this.populateMembersList(); // Refresh the list
        } catch (error) {
            console.error('Failed to remove member:', error);
            this.showToast('Failed to remove member', 'error');
        }
    }
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    app = new TripTogetherApp();
});

// Modal close functions (global for onclick handlers)
window.closeActivityModal = () => {
    document.getElementById('activity-modal')?.classList.add('hidden');
};

window.closeActivityFormModal = () => {
    document.getElementById('activity-form-modal')?.classList.add('hidden');
    // Clear hash if we were editing
    if (window.location.hash.includes('activity/')) {
        window.location.hash = `trip/${app.currentTrip?.id || ''}`;
    }
};

window.closeSettingsModal = () => {
    document.getElementById('settings-modal')?.classList.add('hidden');
};

window.openActivityFormModal = (activityId = null) => {
    if (app.activities) {
        app.activities.openForm(activityId);
    }
};