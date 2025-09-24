/**
 * TripTogether Calendar - Calendar Views Management
 * Handles month, week, and day calendar views with activity rendering
 */

class Calendar {
    constructor(trip) {
        this.trip = trip;
        this.currentDate = new Date();
        this.currentView = 'month';
        this.activities = [];
        this.timezone = trip.timezone || 'America/New_York';
        
        this.bindEvents();
    }

    bindEvents() {
        // Month view day clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('month-day') || e.target.closest('.month-day')) {
                const dayElement = e.target.classList.contains('month-day') ? e.target : e.target.closest('.month-day');
                const dateStr = dayElement.dataset.date;
                if (dateStr) {
                    this.selectDate(new Date(dateStr));
                }
            }
        });

        // Activity preview clicks
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('activity-preview')) {
                e.stopPropagation();
                const activityId = e.target.dataset.activityId;
                if (activityId && window.app?.activities) {
                    window.app.activities.showActivityDetails(activityId);
                }
            }
        });

        // Activity block clicks in week view
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('activity-block') || e.target.closest('.activity-block')) {
                e.stopPropagation();
                const blockElement = e.target.classList.contains('activity-block') ? e.target : e.target.closest('.activity-block');
                const activityId = blockElement.dataset.activityId;
                if (activityId && window.app?.activities) {
                    window.app.activities.showActivityDetails(activityId);
                }
            }
        });

        // Activity card clicks in day view
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('activity-card') || e.target.closest('.activity-card')) {
                const cardElement = e.target.classList.contains('activity-card') ? e.target : e.target.closest('.activity-card');
                const activityId = cardElement.dataset.activityId;
                if (activityId && window.app?.activities) {
                    window.app.activities.showActivityDetails(activityId);
                }
            }
        });
    }

    setActivities(activities) {
        this.activities = activities || [];
        this.render();
    }

    switchView(view) {
        this.currentView = view;
        this.updatePeriodTitle();
        this.render();
    }

    navigatePrevious() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() - 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() - 1);
                break;
        }
        this.updatePeriodTitle();
        this.render();
    }

    navigateNext() {
        switch (this.currentView) {
            case 'month':
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                break;
            case 'week':
                this.currentDate.setDate(this.currentDate.getDate() + 7);
                break;
            case 'day':
                this.currentDate.setDate(this.currentDate.getDate() + 1);
                break;
        }
        this.updatePeriodTitle();
        this.render();
    }

    goToToday() {
        this.currentDate = new Date();
        this.updatePeriodTitle();
        this.render();
    }

    selectDate(date) {
        this.currentDate = new Date(date);
        this.switchView('day');
        
        // Update view switcher
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === 'day');
        });
        
        // Update calendar views
        document.querySelectorAll('.calendar-view').forEach(viewEl => {
            viewEl.classList.toggle('active', viewEl.id === 'day-view');
        });
    }

    updatePeriodTitle() {
        const titleElement = document.getElementById('current-period');
        if (!titleElement) return;

        const options = { timeZone: this.timezone };

        switch (this.currentView) {
            case 'month':
                titleElement.textContent = this.currentDate.toLocaleDateString('en-US', {
                    ...options,
                    month: 'long',
                    year: 'numeric'
                });
                break;
            case 'week':
                const startOfWeek = this.getStartOfWeek(this.currentDate);
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(endOfWeek.getDate() + 6);
                
                titleElement.textContent = `${startOfWeek.toLocaleDateString('en-US', {
                    ...options,
                    month: 'short',
                    day: 'numeric'
                })} - ${endOfWeek.toLocaleDateString('en-US', {
                    ...options,
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })}`;
                break;
            case 'day':
                titleElement.textContent = this.currentDate.toLocaleDateString('en-US', {
                    ...options,
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                break;
        }
    }

    render() {
        switch (this.currentView) {
            case 'month':
                this.renderMonthView();
                break;
            case 'week':
                this.renderWeekView();
                break;
            case 'day':
                this.renderDayView();
                break;
        }
    }

    renderMonthView() {
        const grid = document.getElementById('month-grid');
        if (!grid) return;

        grid.innerHTML = '';

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = new Date();
        
        // Get first day of month and calculate start of calendar grid
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = this.getStartOfWeek(firstDay);
        
        // Generate 42 days (6 weeks) for consistent grid
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = this.createMonthDayElement(date, month, today);
            grid.appendChild(dayElement);
        }
    }

    createMonthDayElement(date, currentMonth, today) {
        const dayElement = document.createElement('div');
        dayElement.className = 'month-day';
        dayElement.dataset.date = date.toISOString().split('T')[0];
        
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = this.isSameDay(date, today);
        const isInTripRange = this.isDateInTripRange(date);
        
        if (!isCurrentMonth) {
            dayElement.classList.add('other-month');
        }
        if (isToday) {
            dayElement.classList.add('today');
        }
        
        // Day number
        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = date.getDate();
        dayElement.appendChild(dayNumber);
        
        if (isInTripRange) {
            // Activities for this day
            const dayActivities = this.getActivitiesForDate(date);
            const activitiesContainer = document.createElement('div');
            activitiesContainer.className = 'day-activities';
            
            // Show up to 3 activities, then count
            const maxVisible = 3;
            const visibleActivities = dayActivities.slice(0, maxVisible);
            const hiddenCount = Math.max(0, dayActivities.length - maxVisible);
            
            visibleActivities.forEach(activity => {
                const preview = document.createElement('div');
                preview.className = 'activity-preview';
                preview.dataset.activityId = activity.id;
                preview.textContent = activity.title;
                preview.title = `${activity.title}${activity.startTime ? ` - ${this.formatTime(activity.startTime)}` : ''}`;
                activitiesContainer.appendChild(preview);
            });
            
            if (hiddenCount > 0) {
                const countElement = document.createElement('div');
                countElement.className = 'activity-count';
                countElement.textContent = `+${hiddenCount} more`;
                dayElement.appendChild(countElement);
            }
            
            dayElement.appendChild(activitiesContainer);
        }
        
        return dayElement;
    }

    renderWeekView() {
        this.renderWeekHeader();
        this.renderWeekGrid();
    }

    renderWeekHeader() {
        const weekDaysContainer = document.getElementById('week-days');
        if (!weekDaysContainer) return;

        weekDaysContainer.innerHTML = '';
        
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        const today = new Date();
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'week-day';
            
            if (this.isSameDay(date, today)) {
                dayElement.classList.add('today');
            }
            
            const dayName = document.createElement('div');
            dayName.className = 'week-day-name';
            dayName.textContent = date.toLocaleDateString('en-US', { 
                weekday: 'short',
                timeZone: this.timezone 
            });
            
            const dayNumber = document.createElement('div');
            dayNumber.className = 'week-day-number';
            dayNumber.textContent = date.getDate();
            
            dayElement.appendChild(dayName);
            dayElement.appendChild(dayNumber);
            weekDaysContainer.appendChild(dayElement);
        }
    }

    renderWeekGrid() {
        const timeColumn = document.getElementById('time-column');
        const weekGrid = document.getElementById('week-grid');
        
        if (!timeColumn || !weekGrid) return;

        // Clear existing content
        timeColumn.innerHTML = '';
        weekGrid.innerHTML = '';

        // Generate time slots (6 AM to 11 PM)
        for (let hour = 6; hour <= 23; hour++) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';
            timeSlot.textContent = this.formatHour(hour);
            timeColumn.appendChild(timeSlot);
        }

        // Generate week columns
        const startOfWeek = this.getStartOfWeek(this.currentDate);
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            
            const column = document.createElement('div');
            column.className = 'week-column';
            
            // Generate hour slots
            for (let hour = 6; hour <= 23; hour++) {
                const hourSlot = document.createElement('div');
                hourSlot.className = 'week-hour';
                hourSlot.dataset.hour = hour;
                hourSlot.dataset.date = date.toISOString().split('T')[0];
                column.appendChild(hourSlot);
            }
            
            // Add activities for this day
            if (this.isDateInTripRange(date)) {
                this.renderDayActivitiesInWeekView(column, date);
            }
            
            weekGrid.appendChild(column);
        }
    }

    renderDayActivitiesInWeekView(column, date) {
        const activities = this.getActivitiesForDate(date);
        
        activities.forEach(activity => {
            if (activity.startTime) {
                const activityBlock = this.createActivityBlock(activity);
                column.appendChild(activityBlock);
            }
        });
    }

    createActivityBlock(activity) {
        const block = document.createElement('div');
        block.className = 'activity-block';
        block.dataset.activityId = activity.id;
        
        // Calculate position based on time
        const startHour = this.parseTimeToHour(activity.startTime);
        const endHour = activity.endTime ? this.parseTimeToHour(activity.endTime) : startHour + 1;
        
        // Position relative to 6 AM start
        const topOffset = Math.max(0, (startHour - 6) * 60); // 60px per hour
        const height = Math.max(30, (endHour - startHour) * 60); // Minimum 30px height
        
        block.style.top = `${topOffset}px`;
        block.style.height = `${height}px`;
        
        // Content
        const title = document.createElement('div');
        title.className = 'activity-block-title';
        title.textContent = activity.title;
        
        const time = document.createElement('div');
        time.className = 'activity-block-time';
        time.textContent = activity.endTime 
            ? `${this.formatTime(activity.startTime)} - ${this.formatTime(activity.endTime)}`
            : this.formatTime(activity.startTime);
        
        block.appendChild(title);
        block.appendChild(time);
        
        return block;
    }

    renderDayView() {
        const dayTitle = document.getElementById('day-title');
        const dayDate = document.getElementById('day-date');
        const dayActivities = document.getElementById('day-activities');
        const dayEmpty = document.getElementById('day-empty');
        
        if (!dayActivities) return;

        // Update header
        if (dayTitle) {
            dayTitle.textContent = this.currentDate.toLocaleDateString('en-US', {
                weekday: 'long',
                timeZone: this.timezone
            });
        }
        
        if (dayDate) {
            dayDate.textContent = this.currentDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
                timeZone: this.timezone
            });
        }

        // Get activities for this day
        const activities = this.getActivitiesForDate(this.currentDate);
        
        if (activities.length === 0) {
            dayActivities.innerHTML = '';
            dayEmpty?.classList.remove('hidden');
            return;
        }

        dayEmpty?.classList.add('hidden');
        
        // Sort activities by time
        activities.sort((a, b) => {
            if (!a.startTime && !b.startTime) return 0;
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
        });

        // Render activity cards
        dayActivities.innerHTML = '';
        
        activities.forEach(activity => {
            const card = this.createActivityCard(activity);
            dayActivities.appendChild(card);
        });
    }

    createActivityCard(activity) {
        const card = document.createElement('div');
        card.className = 'activity-card';
        card.dataset.activityId = activity.id;
        
        const header = document.createElement('div');
        header.className = 'activity-card-header';
        
        const title = document.createElement('h4');
        title.className = 'activity-card-title';
        title.textContent = activity.title;
        
        const time = document.createElement('div');
        time.className = 'activity-card-time';
        if (activity.startTime) {
            time.textContent = activity.endTime 
                ? `${this.formatTime(activity.startTime)} - ${this.formatTime(activity.endTime)}`
                : this.formatTime(activity.startTime);
        } else {
            time.textContent = 'All day';
        }
        
        header.appendChild(title);
        header.appendChild(time);
        card.appendChild(header);
        
        if (activity.caption) {
            const caption = document.createElement('div');
            caption.className = 'activity-card-caption';
            caption.textContent = activity.caption;
            card.appendChild(caption);
        }
        
        // Meta information
        const meta = document.createElement('div');
        meta.className = 'activity-card-meta';
        
        if (activity.address) {
            const location = document.createElement('span');
            location.textContent = `📍 ${activity.address}`;
            meta.appendChild(location);
        }
        
        if (activity.price) {
            const price = document.createElement('span');
            price.textContent = `💰 ${activity.price}`;
            meta.appendChild(price);
        }
        
        // Attendees
        if (activity.attendees && activity.attendees.length > 0) {
            const attendees = document.createElement('div');
            attendees.className = 'activity-card-attendees';
            
            const label = document.createElement('span');
            label.textContent = 'Going: ';
            attendees.appendChild(label);
            
            activity.attendees.slice(0, 5).forEach(attendee => {
                const avatar = document.createElement('div');
                avatar.className = 'attendee-avatar';
                avatar.textContent = attendee.displayName?.charAt(0).toUpperCase() || '?';
                avatar.title = attendee.displayName;
                attendees.appendChild(avatar);
            });
            
            if (activity.attendees.length > 5) {
                const more = document.createElement('span');
                more.textContent = ` +${activity.attendees.length - 5} more`;
                attendees.appendChild(more);
            }
            
            meta.appendChild(attendees);
        }
        
        if (meta.hasChildNodes()) {
            card.appendChild(meta);
        }
        
        return card;
    }

    // =============================================================================
    // Utility Methods
    // =============================================================================

    getStartOfWeek(date) {
        const result = new Date(date);
        const day = result.getDay();
        const diff = result.getDate() - day;
        result.setDate(diff);
        result.setHours(0, 0, 0, 0);
        return result;
    }

    isSameDay(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }

    isDateInTripRange(date) {
        if (!this.trip.startDate || !this.trip.endDate) return true;
        
        const tripStart = new Date(this.trip.startDate);
        const tripEnd = new Date(this.trip.endDate);
        
        return date >= tripStart && date <= tripEnd;
    }

    getActivitiesForDate(date) {
        if (!this.activities) return [];
        
        const dateString = date.toISOString().split('T')[0];
        return this.activities.filter(activity => {
            return activity.date === dateString;
        });
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

    formatHour(hour) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour} ${ampm}`;
    }

    parseTimeToHour(timeString) {
        if (!timeString) return 0;
        
        try {
            const [hours, minutes] = timeString.split(':');
            return parseInt(hours, 10) + (parseInt(minutes, 10) / 60);
        } catch (error) {
            return 0;
        }
    }

    // Public method to refresh activities
    refreshActivities(activities) {
        this.setActivities(activities);
    }
}
