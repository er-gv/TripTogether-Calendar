// =============================================================================
// DOM Utilities
// =============================================================================

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text: string) {
    if (typeof text !== 'string') {
        return text;
    }
    
    const map: Map<string, string>([

        ["&", '&amp;'],
        ['<', '&lt;'],
        ['>', '&gt;'],
        ['"', '&quot;'],
        ["'", '&#039;']
    ]);
    
    return text.replace(/[&<>"']/g, m => map.get(m)||m);
}

/**
 * Create a DOM element with attributes and children
 */
function createElement(tag: string, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'innerHTML') {
            element.innerHTML = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else {
            element.setAttribute(key, value);
        }
    });
    
    // Append children
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Element) {
            element.appendChild(child);
        }
    });
    
    return element;
}

/**
 * Add event listener with automatic cleanup
 */
function addEventListenerWithCleanup(element, event, handler, options = {}) {
    element.addEventListener(event, handler, options);
    
    // Return cleanup function
    return () => {
        element.removeEventListener(event, handler, options);
    };
}

/**
 * Wait for element to appear in DOM
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Timeout fallback
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// =============================================================================
// Date and Time Utilities
// =============================================================================

/**
 * Format date for display
 */
function formatDate(date, options = {}) {
    if (!date) return '';
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', { ...defaultOptions, ...options });
}

/**
 * Format time for display (24h to 12h)
 */
function formatTime(timeString, use24Hour = false) {
    if (!timeString) return '';
    
    try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const min = minutes || '00';
        
        if (use24Hour) {
            return `${hours.padStart(2, '0')}:${min}`;
        }
        
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        
        return `${displayHour}:${min} ${ampm}`;
    } catch (error) {
        return timeString;
    }
}

/**
 * Get date range as string
 */
function formatDateRange(startDate, endDate, options = {}) {
    if (!startDate || !endDate) return '';
    
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    const defaultOptions = {
        month: 'short',
        day: 'numeric'
    };
    
    const isSameYear = start.getFullYear() === end.getFullYear();
    const isSameMonth = isSameYear && start.getMonth() === end.getMonth();
    
    if (isSameMonth && start.getDate() === end.getDate()) {
        // Same day
        return start.toLocaleDateString('en-US', {
            ...defaultOptions,
            year: 'numeric',
            ...options
        });
    } else if (isSameMonth) {
        // Same month, different days
        return `${start.toLocaleDateString('en-US', { day: 'numeric' })} - ${end.toLocaleDateString('en-US', {
            ...defaultOptions,
            year: 'numeric',
            ...options
        })}`;
    } else if (isSameYear) {
        // Same year, different months
        return `${start.toLocaleDateString('en-US', defaultOptions)} - ${end.toLocaleDateString('en-US', {
            ...defaultOptions,
            year: 'numeric',
            ...options
        })}`;
    } else {
        // Different years
        return `${start.toLocaleDateString('en-US', {
            ...defaultOptions,
            year: 'numeric'
        })} - ${end.toLocaleDateString('en-US', {
            ...defaultOptions,
            year: 'numeric',
            ...options
        })}`;
    }
}

/**
 * Check if date is today
 */
function isToday(date) {
    const today = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return dateObj.toDateString() === today.toDateString();
}

/**
 * Get relative time string (e.g., "2 hours ago")
 */
function getRelativeTime(date) {
    const now = new Date();
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const diffInSeconds = Math.floor((now - dateObj) / 1000);

    if (diffInSeconds < 60) {
        return diffInSeconds <= 5 ? 'Just now' : `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`;
    }
    
    return formatDate(dateObj, { month: 'short', day: 'numeric', year: 'numeric' });
}

// =============================================================================
// String Utilities
// =============================================================================

/**
 * Generate a random ID
 */
function generateId(prefix = '', length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return prefix ? `${prefix}_${result}` : result;
}

/**
 * Generate a random 6-digit PIN
 */
function generatePIN() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Truncate string with ellipsis
 */
function truncate(str, length = 50, suffix = '...') {
    if (typeof str !== 'string') return str;
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
}

/**
 * Convert string to URL-friendly slug
 */
function slugify(str) {
    return str
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

// =============================================================================
// Array and Object Utilities
// =============================================================================

/**
 * Group array of objects by a property
 */
function groupBy(array, key) {
    return array.reduce((result, item) => {
        const group = typeof key === 'function' ? key(item) : item[key];
        (result[group] = result[group] || []).push(item);
        return result;
    }, {});
}

/**
 * Sort array by multiple fields
 */
function sortBy(array, ...fields) {
    return [...array].sort((a, b) => {
        for (const field of fields) {
            let aVal, bVal;
            let direction = 1; // ascending by default
            
            if (typeof field === 'string') {
                if (field.startsWith('-')) {
                    direction = -1;
                    const fieldName = field.substring(1);
                    aVal = a[fieldName];
                    bVal = b[fieldName];
                } else {
                    aVal = a[field];
                    bVal = b[field];
                }
            } else if (typeof field === 'function') {
                aVal = field(a);
                bVal = field(b);
            }
            
            if (aVal < bVal) return -1 * direction;
            if (aVal > bVal) return 1 * direction;
        }
        return 0;
    });
}

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    
    const cloned = {};
    Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
    });
    
    return cloned;
}

/**
 * Check if two objects are deeply equal
 */
function deepEqual(obj1, obj2) {
    if (obj1 === obj2) return true;
    
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => 
        keys2.includes(key) && deepEqual(obj1[key], obj2[key])
    );
}

// =============================================================================
// Validation Utilities
// =============================================================================

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL format
 */
function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate date is within range
 */
function isDateInRange(date, startDate, endDate) {
    const checkDate = typeof date === 'string' ? new Date(date) : date;
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
    
    return checkDate >= start && checkDate <= end;
}

/**
 * Validate time format (HH:MM)
 */
function isValidTime(time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

// =============================================================================
// Local Storage Utilities
// =============================================================================

/**
 * Safe localStorage access with fallback
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('localStorage get failed:', error);
            return defaultValue;
        }
    },
    
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('localStorage set failed:', error);
            return false;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('localStorage remove failed:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('localStorage clear failed:', error);
            return false;
        }
    }
};

// =============================================================================
// Debounce and Throttle
// =============================================================================

/**
 * Debounce function calls
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// =============================================================================
// Error Handling
// =============================================================================

/**
 * Safe function execution with error handling
 */
function safeExecute(func, fallback = null, context = null) {
    try {
        return context ? func.call(context) : func();
    } catch (error) {
        console.error('Safe execution failed:', error);
        return typeof fallback === 'function' ? fallback(error) : fallback;
    }
}

/**
 * Async safe function execution
 */
async function safeExecuteAsync(func, fallback = null, context = null) {
    try {
        return context ? await func.call(context) : await func();
    } catch (error) {
        console.error('Async safe execution failed:', error);
        return typeof fallback === 'function' ? await fallback(error) : fallback;
    }
}

// =============================================================================
// Performance Utilities
// =============================================================================

/**
 * Measure execution time
 */
function measureTime(func, label = 'Operation') {
    const start = performance.now();
    const result = func();
    const end = performance.now();
    
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
}

/**
 * Async measure execution time
 */
async function measureTimeAsync(func, label = 'Operation') {
    const start = performance.now();
    const result = await func();
    const end = performance.now();
    
    console.log(`${label} took ${(end - start).toFixed(2)}ms`);
    return result;
}

// =============================================================================
// Mobile Detection
// =============================================================================

/**
 * Detect if user is on mobile device
 */
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Detect touch support
 */
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// =============================================================================
// Export utilities (if using modules)
// =============================================================================

// For environments that support modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // DOM
        escapeHtml,
        createElement,
        addEventListenerWithCleanup,
        waitForElement,
        
        // Date/Time
        formatDate,
        formatTime,
        formatDateRange,
        isToday,
        getRelativeTime,
        
        // String
        generateId,
        generatePIN,
        capitalize,
        truncate,
        slugify,
        
        // Array/Object
        groupBy,
        sortBy,
        deepClone,
        deepEqual,
        
        // Validation
        isValidEmail,
        isValidURL,
        isDateInRange,
        isValidTime,
        
        // Storage
        storage,
        
        // Performance
        debounce,
        throttle,
        safeExecute,
        safeExecuteAsync,
        measureTime,
        measureTimeAsync,
        
        // Device
        isMobile,
        isTouchDevice
    };
}