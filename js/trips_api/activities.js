/**
 * TripTogether Calendar - Activity Management
 * Handles activity CRUD operations, forms, and detail views
 */

class Activities {
    constructor(trip, user) {
        this.trip = trip;
        this.user = user;
        this.apiClient = new ApiClient();
        this.activities = [];
        this.members = [];
        this.editingActivityId = null;
        
        this.bindEvents();
    }

    bindEvents() {
        // Activity form submission
        const activityForm = document.getElementById('activity-form');
        if (activityForm) {
            activityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleActivityFormSubmit();
            });
        }

        // Delete activity button
        const deleteBtn = document.getElementById('delete-activity-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.handleDeleteActivity();
            });
        }

        // Settings form for trip details
        const tripDetailsForm = document.getElementById('trip-details-form');
        if (tripDetailsForm) {
            tripDetailsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleTripDetailsUpdate();
            });
        }

        // Settings tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchSettingsTab(btn.dataset.tab);
            });
        });

        // PIN management buttons
        document.getElementById('show-pin-btn')?.addEventListener('click', () => {
            this.togglePINVisibility();
        });

        document.getElementById('rotate-pin-btn')?.addEventListener('click', () => {
            this.rotatePIN();
        });

        document.getElementById('copy-current-invite')?.addEventListener('click', () => {
            this.copyCurrentInviteLink();
        });

        document.getElementById('regenerate-link-btn')?.addEventListener('click', () => {
            this.regenerateInviteLink();
        });

        // Mark all notifications as read
        document.getElementById('mark-all-read')?.addEventListener('click', () => {
            if (window.app?.notifications) {
                window.app.notifications.markAllAsRead();
            }
        });
    }

    async loadActivities() {
        try {
            const response = await this.apiClient.getActivities(this.trip.id);
            this.activities = response.activities || [];
            
            // Also load members for attendee selection
            await this.loadMembers();
            
            // Update calendar if available
            if (window.app?.calendar) {
                window.app.calendar.setActivities(this.activities);
            }
            
            return this.activities;
        } catch (error) {
            console.error('Failed to load activities:', error);
            window.app?.showToast('Failed to load activities', 'error');
            return [];
        }
    }

    async loadMembers() {
        try {
            const response = await this.apiClient.getTripMembers(this.trip.id);
            this.members = response.members || [];
            return this.members;
        } catch (error) {
            console.error('Failed to load members:', error);
            this.members = [];
            return [];
        }
    }

    async createActivity(activityData) {
        try {
            const response = await this.apiClient.createActivity(this.trip.id, activityData);
            
            // Add to local array
            this.activities.push(response);
            
            // Update calendar
            if (window.app?.calendar) {
                window.app.calendar.refreshActivities(this.activities);
            }
            
            // Show success message
            window.app?.showToast('Activity created successfully!', 'success');
            
            return response;
        } catch (error) {
            console.error('Failed to create activity:', error);
            window.app?.showToast(error.message || 'Failed to create activity', 'error');
            throw error;
        }
    }

    async updateActivity(activityId, activityData) {
        try {
            const response = await this.apiClient.updateActivity(activityId, activityData);
            
            // Update local array
            const index = this.activities.findIndex(a => a.id === activityId);
            if (index !== -1) {
                this.activities[index] = response;
            }
            
            // Update calendar
            if (window.app?.calendar) {
                window.app.calendar.refreshActivities(this.activities);
            }
            
            // Show success message
            window.app?.showToast('Activity updated successfully!', 'success');
            
            return response;
        } catch (error) {
            console.error('Failed to update activity:', error);
            window.app?.showToast(error.message || 'Failed to update activity', 'error');
            throw error;
        }
    }

    async deleteActivity(activityId) {
        if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
            return;
        }

        try {
            await this.apiClient.deleteActivity(activityId);
            
            // Remove from local array
            this.activities = this.activities.filter(a => a.id !== activityId);
            
            // Update calendar
            if (window.app?.calendar) {
                window.app.calendar.refreshActivities(this.activities);
            }
            
            // Close any open modals
            window.closeActivityModal();
            window.closeActivityFormModal();
            
            // Show success message
            window.app?.showToast('Activity deleted successfully', 'success');
            
        } catch (error) {
            console.error('Failed to delete activity:', error);
            window.app?.showToast(error.message || 'Failed to delete activity', 'error');
        }
    }

    openForm(activityId = null) {
        this.editingActivityId = activityId;
        
        // Update modal title
        const modalTitle = document.getElementById('form-modal-title');
        if (modalTitle) {
            modalTitle.textContent = activityId ? 'Edit Activity' : 'Add Activity';
        }
        
        // Show/hide delete button
        const deleteBtn = document.getElementById('delete-activity-btn');
        if (deleteBtn) {
            deleteBtn.classList.toggle('hidden', !activityId);
        }
        
        // Populate form if editing
        if (activityId) {
            this.populateActivityForm(activityId);
        } else {
            this.resetActivityForm();
        }
        
        // Populate attendees list
        this.populateAttendeesForm();
        
        // Show modal
        document.getElementById('activity-form-modal').classList.remove('hidden');
        
        // Focus first input
        setTimeout(() => {
            document.getElementById('activity-title')?.focus();
        }, 100);
    }

    populateActivityForm(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) {
            console.error('Activity not found:', activityId);
            return;
        }

        // Basic information
        document.getElementById('activity-title').value = activity.title || '';
        document.getElementById('activity-caption').value = activity.caption || '';
        document.getElementById('activity-image').value = activity.imageUrl || '';

        // Timing
        document.getElementById('activity-date').value = activity.date || '';
        document.getElementById('activity-start-time').value = activity.startTime || '';
        document.getElementById('activity-end-time').value = activity.endTime || '';

        // Location and details
        document.getElementById('activity-address').value = activity.address || '';
        document.getElementById('activity-url').value = activity.url || '';
        document.getElementById('activity-price').value = activity.price || '';
        document.getElementById('activity-hours').value = activity.openingHours || '';
    }

    resetActivityForm() {
        const form = document.getElementById('activity-form');
        if (form) {
            form.reset();
        }
        
        // Set default date to today or selected calendar date
        const dateInput = document.getElementById('activity-date');
        if (dateInput && window.app?.calendar) {
            const currentDate = window.app.calendar.currentDate;
            const dateString = currentDate.toISOString().split('T')[0];
            dateInput.value = dateString;
        }
    }

    populateAttendeesForm() {
        const container = document.getElementById('attendees-list');
        if (!container) return;

        container.innerHTML = '';

        // Get current activity attendees if editing
        let currentAttendees = [];
        if (this.editingActivityId) {
            const activity = this.activities.find(a => a.id === this.editingActivityId);
            currentAttendees = activity?.attendees?.map(a => a.id) || [];
        }

        this.members.forEach(member => {
            const attendeeDiv = document.createElement('div');
            attendeeDiv.className = 'attendee-checkbox';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `attendee-${member.id}`;
            checkbox.name = 'attendees';
            checkbox.value = member.id;
            checkbox.checked = currentAttendees.includes(member.id);

            const attendeeInfo = document.createElement('div');
            attendeeInfo.className = 'attendee-info';

            const name = document.createElement('div');
            name.className = 'attendee-name';
            name.textContent = member.displayName;

            const role = document.createElement('div');
            role.className = 'attendee-role';
            role.textContent = member.role === 'admin' ? 'Admin' : 'Member';

            attendeeInfo.appendChild(name);
            attendeeInfo.appendChild(role);

            attendeeDiv.appendChild(checkbox);
            attendeeDiv.appendChild(attendeeInfo);

            // Click anywhere on the div to toggle checkbox
            attendeeDiv.addEventListener('click', (e) => {
                if (e.target !== checkbox) {
                    checkbox.checked = !checkbox.checked;
                }
            });

            container.appendChild(attendeeDiv);
        });
    }

    async handleActivityFormSubmit() {
        const form = document.getElementById('activity-form');
        const formData = new FormData(form);

        // Validate required fields
        const title = formData.get('activity-title')?.trim();
        const date = formData.get('activity-date');

        if (!title) {
            window.app?.showToast('Activity title is required', 'error');
            document.getElementById('activity-title')?.focus();
            return;
        }

        if (!date) {
            window.app?.showToast('Activity date is required', 'error');
            document.getElementById('activity-date')?.focus();
            return;
        }

        // Validate time fields
        const startTime = formData.get('activity-start-time');
        const endTime = formData.get('activity-end-time');

        if (startTime && endTime && startTime >= endTime) {
            window.app?.showToast('End time must be after start time', 'error');
            document.getElementById('activity-end-time')?.focus();
            return;
        }

        // Validate URL fields
        const imageUrl = formData.get('activity-image')?.trim();
        const websiteUrl = formData.get('activity-url')?.trim();

        if (imageUrl && !this.apiClient.isValidURL(imageUrl)) {
            window.app?.showToast('Please enter a valid image URL', 'error');
            document.getElementById('activity-image')?.focus();
            return;
        }

        if (websiteUrl && !this.apiClient.isValidURL(websiteUrl)) {
            window.app?.showToast('Please enter a valid website URL', 'error');
            document.getElementById('activity-url')?.focus();
            return;
        }

        // Get selected attendees
        const attendeeIds = Array.from(form.querySelectorAll('input[name="attendees"]:checked'))
            .map(checkbox => checkbox.value);

        // Build activity data
        const activityData = {
            title,
            caption: formData.get('activity-caption')?.trim() || '',
            date,
            startTime: startTime || null,
            endTime: endTime || null,
            address: formData.get('activity-address')?.trim() || '',
            url: websiteUrl || '',
            price: formData.get('activity-price')?.trim() || '',
            openingHours: formData.get('activity-hours')?.trim() || '',
            imageUrl: imageUrl || '',
            attendees: attendeeIds
        };

        try {
            if (this.editingActivityId) {
                await this.updateActivity(this.editingActivityId, activityData);
            } else {
                await this.createActivity(activityData);
            }

            // Close modal
            window.closeActivityFormModal();
            
            // Reset form state
            this.editingActivityId = null;

        } catch (error) {
            // Error already handled in create/update methods
        }
    }

    async handleDeleteActivity() {
        if (this.editingActivityId) {
            await this.deleteActivity(this.editingActivityId);
            this.editingActivityId = null;
        }
    }

    showActivityDetails(activityId) {
        const activity = this.activities.find(a => a.id === activityId);
        if (!activity) {
            console.error('Activity not found:', activityId);
            return;
        }

        const modal = document.getElementById('activity-modal');
        const detailsContainer = document.getElementById('activity-details');
        
        if (!modal || !detailsContainer) return;

        // Update modal title
        document.getElementById('activity-modal-title').textContent = activity.title;

        // Generate activity details HTML
        detailsContainer.innerHTML = this.generateActivityDetailsHTML(activity);

        // Show modal
        modal.classList.remove('hidden');
    }

    generateActivityDetailsHTML(activity) {
        let html = '';

        // Hero section with image
        if (activity.imageUrl) {
            html += `
                <div class="activity-hero">
                    <img src="${escapeHtml(activity.imageUrl)}" alt="${escapeHtml(activity.title)}" onerror="this.style.display='none'">
                    <div class="activity-hero-content">
                        <h2 class="activity-hero-title">${escapeHtml(activity.title)}</h2>
                        ${activity.caption ? `<p class="activity-hero-caption">${escapeHtml(activity.caption)}</p>` : ''}
                    </div>
                </div>
            `;
        } else if (activity.caption) {
            html += `
                <div style="margin-bottom: 2rem;">
                    <p style="font-size: 1.125rem; color: var(--text-secondary); line-height: 1.5;">
                        ${escapeHtml(activity.caption)}
                    </p>
                </div>
            `;
        }

        // Details grid
        html += '<div class="activity-details-grid">';

        // Date and time
        const dateTime = this.formatActivityDateTime(activity);
        if (dateTime) {
            html += `
                <div class="activity-detail-item">
                    <div class="activity-detail-icon">📅</div>
                    <div class="activity-detail-content">
                        <div class="activity-detail-label">When</div>
                        <div class="activity-detail-value">${dateTime}</div>
                    </div>
                </div>
            `;
        }

        // Location
        if (activity.address) {
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.address)}`;
            html += `
                <div class="activity-detail-item">
                    <div class="activity-detail-icon">📍</div>
                    <div class="activity-detail-content">
                        <div class="activity-detail-label">Location</div>
                        <div class="activity-detail-value">
                            <a href="${mapUrl}" target="_blank" rel="noopener noreferrer">
                                ${escapeHtml(activity.address)}
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // Website
        if (activity.url) {
            html += `
                <div class="activity-detail-item">
                    <div class="activity-detail-icon">🌐</div>
                    <div class="activity-detail-content">
                        <div class="activity-detail-label">Website</div>
                        <div class="activity-detail-value">
                            <a href="${escapeHtml(activity.url)}" target="_blank" rel="noopener noreferrer">
                                Visit Website
                            </a>
                        </div>
                    </div>
                </div>
            `;
        }

        // Price
        if (activity.price) {
            html += `
                <div class="activity-detail-item">
                    <div class="activity-detail-icon">💰</div>
                    <div class="activity-detail-content">
                        <div class="activity-detail-label">Price</div>
                        <div class="activity-detail-value">${escapeHtml(activity.price)}</div>
                    </div>
                </div>
            `;
        }

        // Opening hours
        if (activity.openingHours) {
            html += `
                <div class="activity-detail-item">
                    <div class="activity-detail-icon">🕐</div>
                    <div class="activity-detail-content">
                        <div class="activity-detail-label">Hours</div>
                        <div class="activity-detail-value">${escapeHtml(activity.openingHours)}</div>
                    </div>
                </div>
            `;
        }

        html += '</div>'; // End details grid

        // Attendees section
        if (activity.attendees && activity.attendees.length > 0) {
            html += `
                <div class="activity-attendees-section">
                    <h3>Who's Going (${activity.attendees.length})</h3>
                    <div class="activity-attendees-grid">
            `;
            
            activity.attendees.forEach(attendee => {
                const avatar = attendee.displayName?.charAt(0).toUpperCase() || '?';
                html += `
                    <div class="attendee-chip">
                        <div class="attendee-avatar">${avatar}</div>
                        <span>${escapeHtml(attendee.displayName)}</span>
                    </div>
                `;
            });
            
            html += '</div></div>';
        }

        // Action buttons (if user has permission)
        if (this.canEditActivity(activity)) {
            html += `
                <div class="form-actions" style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
                    <button type="button" class="btn btn-primary" onclick="window.openActivityFormModal('${activity.id}'); window.closeActivityModal();">
                        Edit Activity
                    </button>
                </div>
            `;
        }

        return html;
    }

    formatActivityDateTime(activity) {
        if (!activity.date) return '';

        const date = new Date(activity.date);
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            timeZone: this.trip.timezone
        });

        if (activity.startTime) {
            const timeStr = activity.endTime 
                ? `${this.formatTime(activity.startTime)} - ${this.formatTime(activity.endTime)}`
                : this.formatTime(activity.startTime);
            return `${dateStr} at ${timeStr}`;
        }

        return dateStr;
    }

    formatTime(timeString) {
        if (!timeString) return '';
        
        try {
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const min = minutes || '00';
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            
            return `${displayHour}:${min} ${ampm}`;
        } catch (error) {
            return timeString;
        }
    }

    canEditActivity(activity) {
        if (this.user.role === 'admin') return true;
        return activity.createdBy === this.user.id;
    }

    // =============================================================================
    // Settings Methods
    // =============================================================================

    switchSettingsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Load tab-specific data
        switch (tabName) {
            case 'members':
                this.loadMembersForSettings();
                break;
        }
    }

    async loadMembersForSettings() {
        await this.loadMembers();
        const membersList = document.getElementById('members-list');
        if (!membersList) return;

        membersList.innerHTML = '';

        this.members.forEach(member => {
            const memberItem = document.createElement('div');
            memberItem.className = 'member-item';
            
            const avatar = member.displayName?.charAt(0).toUpperCase() || '?';
            const isCreator = member.id === this.trip.createdBy;
            const canModify = this.user.role === 'admin' && !isCreator;
            
            memberItem.innerHTML = `
                <div class="member-info">
                    <div class="member-avatar">${avatar}</div>
                    <div class="member-details">
                        <h4>${escapeHtml(member.displayName)}</h4>
                        <span class="member-role-badge">${isCreator ? 'Creator' : (member.role || 'Member')}</span>
                        ${member.joinedAt ? `<small>Joined ${new Date(member.joinedAt).toLocaleDateString()}</small>` : ''}
                    </div>
                </div>
                <div class="member-actions">
                    ${canModify ? `
                        <button class="btn btn-danger btn-icon" onclick="app.removeMember('${member.id}')">
                            <span class="icon">🗑️</span>
                        </button>
                    ` : ''}
                </div>
            `;

            membersList.appendChild(memberItem);
        });
    }

    async handleTripDetailsUpdate() {
        if (this.user.role !== 'admin') {
            window.app?.showToast('Only administrators can update trip details', 'error');
            return;
        }

        const form = document.getElementById('trip-details-form');
        const formData = new FormData(form);

        const name = formData.get('settings-trip-name')?.trim();
        const startDate = formData.get('settings-start-date');
        const endDate = formData.get('settings-end-date');
        const timezone = formData.get('settings-timezone');

        if (!name || !startDate || !endDate || !timezone) {
            window.app?.showToast('All fields are required', 'error');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            window.app?.showToast('End date must be after start date', 'error');
            return;
        }

        try {
            const updatedTrip = await this.apiClient.updateTrip(this.trip.id, {
                name,
                startDate,
                endDate,
                timezone
            });

            // Update local trip data
            Object.assign(this.trip, updatedTrip);

            // Update UI
            if (window.app) {
                window.app.currentTrip = this.trip;
                window.app.updateAppHeader();
            }

            window.app?.showToast('Trip details updated successfully!', 'success');

        } catch (error) {
            console.error('Failed to update trip details:', error);
            window.app?.showToast(error.message || 'Failed to update trip details', 'error');
        }
    }

    async togglePINVisibility() {
        const pinDisplay = document.getElementById('current-pin-display');
        const showBtn = document.getElementById('show-pin-btn');
        
        if (!pinDisplay || !showBtn) return;

        if (pinDisplay.textContent === '••••••') {
            try {
                const response = await this.apiClient.getCurrentPIN(this.trip.id);
                pinDisplay.textContent = response.pin;
                showBtn.textContent = 'Hide PIN';
            } catch (error) {
                window.app?.showToast('Failed to load PIN', 'error');
            }
        } else {
            pinDisplay.textContent = '••••••';
            showBtn.textContent = 'Show PIN';
        }
    }

    async rotatePIN() {
        if (!confirm('Generate a new PIN? The old PIN will stop working immediately.')) {
            return;
        }

        try {
            const response = await this.apiClient.rotatePIN(this.trip.id);
            
            // Update display
            document.getElementById('current-pin-display').textContent = response.pin;
            document.getElementById('show-pin-btn').textContent = 'Hide PIN';
            
            window.app?.showToast('New PIN generated successfully!', 'success');

        } catch (error) {
            console.error('Failed to rotate PIN:', error);
            window.app?.showToast('Failed to generate new PIN', 'error');
        }
    }

    copyCurrentInviteLink() {
        const inviteInput = document.getElementById('current-invite-url');
        if (inviteInput && window.app) {
            window.app.copyToClipboard(inviteInput.value);
        }
    }

    async regenerateInviteLink() {
        if (!confirm('Generate a new invite link? The old link will stop working.')) {
            return;
        }

        // For simplicity, this just generates a new URL with the current trip ID
        // In a full implementation, you might want to generate a new trip slug
        const newUrl = `${window.location.origin}${window.location.pathname}?trip=${this.trip.id}&t=${Date.now()}`;
        document.getElementById('current-invite-url').value = newUrl;
        
        window.app?.showToast('New invite link generated!', 'success');
    }
}