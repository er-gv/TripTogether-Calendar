import '/css/trip_style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from '/vite.svg'


    

document.querySelector('#app').innerHTML = `
  <!-- Landing Page -->
    <div id="landing-page" class="page">
        <div class="landing-container">
            <div class="landing-header">
                <h1>TripTogether Calendar</h1>
                <p>Plan your family trip together</p>
            </div>

            <!-- Join Trip Section -->
            <div class="landing-section" id="join-section">
                <h2>Join a Trip</h2>
                <form id="join-form">
                    <div class="form-group">
                        <label for="join-pin">Trip PIN</label>
                        <input type="text" id="join-pin" placeholder="Enter 6-digit PIN" maxlength="6" required>
                    </div>
                    <div class="form-group">
                        <label for="join-name">Your Name</label>
                        <input type="text" id="join-name" placeholder="Enter your name" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="join-is-child">
                            <span class="checkbox-custom"></span>
                            I'm under 18
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary">Join Trip</button>
                </form>
                <p class="form-switch">Don't have a PIN? <a href="#" id="show-create">Create a new trip</a></p>
            </div>

            <!-- Create Trip Section -->
            <div class="landing-section hidden" id="create-section">
                <h2>Create New Trip</h2>
                <form id="create-form">
                    <div class="form-group">
                        <label for="trip-name">Trip Name</label>
                        <input type="text" id="trip-name" placeholder="e.g., Family Vacation 2025" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="start-date">Start Date</label>
                            <input type="date" id="start-date" required>
                        </div>
                        <div class="form-group">
                            <label for="end-date">End Date</label>
                            <input type="date" id="end-date" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <select id="timezone" required>
                            <option value="">Select timezone...</option>
                            <option value="America/New_York">Eastern Time (EST/EDT)</option>
                            <option value="America/Chicago">Central Time (CST/CDT)</option>
                            <option value="America/Denver">Mountain Time (MST/MDT)</option>
                            <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                            <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                            <option value="Europe/London">GMT (London)</option>
                            <option value="Europe/Paris">CET (Paris/Berlin)</option>
                            <option value="Asia/Tokyo">JST (Tokyo)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="creator-name">Your Name</label>
                        <input type="text" id="creator-name" placeholder="Enter your name" required>
                    </div>
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="creator-is-child">
                            <span class="checkbox-custom"></span>
                            I'm under 18
                        </label>
                    </div>
                    <button type="submit" class="btn btn-primary">Create Trip</button>
                </form>
                <p class="form-switch">Already have a PIN? <a href="#" id="show-join">Join existing trip</a></p>
            </div>

            <!-- Trip Created Success -->
            <div class="landing-section hidden" id="trip-created">
                <div class="success-message">
                    <h2>🎉 Trip Created Successfully!</h2>
                    <div class="trip-details">
                        <h3 id="created-trip-name"></h3>
                        <div class="invite-info">
                            <p><strong>Share this PIN with your family:</strong></p>
                            <div class="pin-display" id="created-pin"></div>
                            <p><strong>Invite Link:</strong></p>
                            <div class="invite-link">
                                <input type="text" id="invite-url" readonly>
                                <button type="button" id="copy-invite" class="btn btn-secondary">Copy</button>
                            </div>
                        </div>
                    </div>
                    <button id="enter-trip" class="btn btn-primary">Enter Trip</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Main App -->
    <div id="main-app" class="page hidden">
        <!-- App Header -->
        <header class="app-header">
            <div class="header-left">
                <h1 id="trip-title">Trip Name</h1>
                <div class="trip-dates" id="trip-dates"></div>
            </div>
            <div class="header-center">
                <div class="view-switcher">
                    <button class="view-btn active" data-view="month">Month</button>
                    <button class="view-btn" data-view="week">Week</button>
                    <button class="view-btn" data-view="day">Day</button>
                </div>
            </div>
            <div class="header-right">
                <button id="add-activity-btn" class="btn btn-primary">
                    <span class="icon">+</span>
                    Add Activity
                </button>
                <button id="notifications-btn" class="btn btn-icon">
                    <span class="icon">🔔</span>
                    <span id="notification-badge" class="badge hidden">0</span>
                </button>
                <button id="settings-btn" class="btn btn-icon admin-only hidden">
                    <span class="icon">⚙️</span>
                </button>
                <div class="user-menu">
                    <button id="user-btn" class="btn btn-icon">
                        <span class="icon">👤</span>
                        <span id="user-name">User</span>
                    </button>
                </div>
            </div>
        </header>

        <!-- Calendar Navigation -->
        <div class="calendar-nav">
            <button id="prev-period" class="btn btn-icon">‹</button>
            <h2 id="current-period">Month Year</h2>
            <button id="next-period" class="btn btn-icon">›</button>
            <button id="today-btn" class="btn btn-secondary">Today</button>
        </div>

        <!-- Calendar Views -->
        <main class="calendar-container">
            <!-- Month View -->
            <div id="month-view" class="calendar-view active">
                <div class="month-header">
                    <div class="day-name">Sun</div>
                    <div class="day-name">Mon</div>
                    <div class="day-name">Tue</div>
                    <div class="day-name">Wed</div>
                    <div class="day-name">Thu</div>
                    <div class="day-name">Fri</div>
                    <div class="day-name">Sat</div>
                </div>
                <div id="month-grid" class="month-grid"></div>
            </div>

            <!-- Week View -->
            <div id="week-view" class="calendar-view">
                <div class="week-header">
                    <div class="time-gutter">Time</div>
                    <div class="week-days" id="week-days"></div>
                </div>
                <div class="week-content">
                    <div class="time-column" id="time-column"></div>
                    <div class="week-grid" id="week-grid"></div>
                </div>
            </div>

            <!-- Day View -->
            <div id="day-view" class="calendar-view">
                <div class="day-header">
                    <h3 id="day-title">Today</h3>
                    <span id="day-date">Date</span>
                </div>
                <div id="day-activities" class="day-activities"></div>
                <div class="day-empty hidden" id="day-empty">
                    <p>No activities planned for this day</p>
                    <button class="btn btn-primary" onclick="openActivityModal()">Add First Activity</button>
                </div>
            </div>
        </main>
    </div>

    <!-- Activity Detail Modal -->
    <div id="activity-modal" class="modal hidden">
        <div class="modal-content">
            <div class="modal-header">
                <h2 id="activity-modal-title">Activity Details</h2>
                <button class="modal-close" onclick="closeActivityModal()">&times;</button>
            </div>
            <div class="modal-body" id="activity-details"></div>
        </div>
    </div>

    <!-- Activity Form Modal -->
    <div id="activity-form-modal" class="modal hidden">
        <div class="modal-content large">
            <div class="modal-header">
                <h2 id="form-modal-title">Add Activity</h2>
                <button class="modal-close" onclick="closeActivityFormModal()">&times;</button>
            </div>
            <div class="modal-body">
                <form id="activity-form">
                    <div class="form-section">
                        <h3>Basic Information</h3>
                        <div class="form-group">
                            <label for="activity-title">Activity Title *</label>
                            <input type="text" id="activity-title" required>
                        </div>
                        <div class="form-group">
                            <label for="activity-caption">Description</label>
                            <textarea id="activity-caption" rows="3" placeholder="Tell us more about this activity..."></textarea>
                        </div>
                        <div class="form-group">
                            <label for="activity-image">Image URL</label>
                            <input type="url" id="activity-image" placeholder="https://example.com/image.jpg">
                            <small>Paste a link to an image for this activity</small>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>When</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="activity-date">Date *</label>
                                <input type="date" id="activity-date" required>
                            </div>
                            <div class="form-group">
                                <label for="activity-start-time">Start Time</label>
                                <input type="time" id="activity-start-time">
                            </div>
                            <div class="form-group">
                                <label for="activity-end-time">End Time</label>
                                <input type="time" id="activity-end-time">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Where & Details</h3>
                        <div class="form-group">
                            <label for="activity-address">Location/Address</label>
                            <input type="text" id="activity-address" placeholder="Enter address or location">
                        </div>
                        <div class="form-group">
                            <label for="activity-url">Website</label>
                            <input type="url" id="activity-url" placeholder="https://example.com">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="activity-price">Price</label>
                                <input type="text" id="activity-price" placeholder="$50 per person">
                            </div>
                            <div class="form-group">
                                <label for="activity-hours">Opening Hours</label>
                                <input type="text" id="activity-hours" placeholder="9 AM - 6 PM">
                            </div>
                        </div>
                    </div>

                    <div class="form-section">
                        <h3>Who's Coming?</h3>
                        <div id="attendees-list" class="attendees-list">
                            <!-- Populated dynamically -->
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeActivityFormModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Save Activity</button>
                        <button type="button" id="delete-activity-btn" class="btn btn-danger hidden">Delete Activity</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- Notifications Panel -->
    <div id="notifications-panel" class="notifications-panel hidden">
        <div class="notifications-header">
            <h3>Notifications</h3>
            <button id="mark-all-read" class="btn btn-link">Mark all read</button>
            <button id="close-notifications" class="btn btn-icon">&times;</button>
        </div>
        <div id="notifications-list" class="notifications-list">
            <div class="no-notifications">
                <p>No notifications yet</p>
            </div>
        </div>
    </div>

    <!-- Trip Settings Modal -->
    <div id="settings-modal" class="modal hidden">
        <div class="modal-content large">
            <div class="modal-header">
                <h2>Trip Settings</h2>
                <button class="modal-close" onclick="closeSettingsModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="settings-tabs">
                    <button class="tab-btn active" data-tab="details">Trip Details</button>
                    <button class="tab-btn" data-tab="members">Members</button>
                    <button class="tab-btn" data-tab="security">Security</button>
                </div>

                <!-- Trip Details Tab -->
                <div id="details-tab" class="tab-content active">
                    <form id="trip-details-form">
                        <div class="form-group">
                            <label for="settings-trip-name">Trip Name</label>
                            <input type="text" id="settings-trip-name" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="settings-start-date">Start Date</label>
                                <input type="date" id="settings-start-date" required>
                            </div>
                            <div class="form-group">
                                <label for="settings-end-date">End Date</label>
                                <input type="date" id="settings-end-date" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="settings-timezone">Timezone</label>
                            <select id="settings-timezone" required>
                                <option value="America/New_York">Eastern Time (EST/EDT)</option>
                                <option value="America/Chicago">Central Time (CST/CDT)</option>
                                <option value="America/Denver">Mountain Time (MST/MDT)</option>
                                <option value="America/Los_Angeles">Pacific Time (PST/PDT)</option>
                                <option value="America/Vancouver">Pacific Time (Vancouver)</option>
                                <option value="Europe/London">GMT (London)</option>
                                <option value="Europe/Paris">CET (Paris/Berlin)</option>
                                <option value="Asia/Tokyo">JST (Tokyo)</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </form>
                </div>

                <!-- Members Tab -->
                <div id="members-tab" class="tab-content">
                    <div id="members-list" class="members-list">
                        <!-- Populated dynamically -->
                    </div>
                </div>

                <!-- Security Tab -->
                <div id="security-tab" class="tab-content">
                    <div class="security-section">
                        <h4>Current PIN</h4>
                        <div class="pin-display current-pin" id="current-pin-display">••••••</div>
                        <button id="show-pin-btn" class="btn btn-secondary">Show PIN</button>
                        <button id="rotate-pin-btn" class="btn btn-warning">Generate New PIN</button>
                    </div>
                    <div class="security-section">
                        <h4>Invite Link</h4>
                        <div class="invite-link">
                            <input type="text" id="current-invite-url" readonly>
                            <button id="copy-current-invite" class="btn btn-secondary">Copy</button>
                        </div>
                        <button id="regenerate-link-btn" class="btn btn-warning">Generate New Link</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Toast Notifications -->
    <div id="toast-container" class="toast-container"></div>
`


