/**
 * Request Validation Utilities for Netlify Functions
 * Common validation functions and response helpers
 */

/**
 * Generate standardized HTTP response
 */
const generateResponse = (statusCode, body = null, headers = {}) => {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    };

    return {
        statusCode,
        headers: { ...defaultHeaders, ...headers },
        body: body ? JSON.stringify(body) : ''
    };
};

/**
 * Validate request method
 */
const validateMethod = (event, allowedMethods = []) => {
    if (!allowedMethods.includes(event.httpMethod)) {
        return {
            isValid: false,
            error: `Method ${event.httpMethod} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
            response: generateResponse(405, { error: 'Method not allowed' })
        };
    }
    
    return { isValid: true };
};

/**
 * Validate request body exists and is valid JSON
 */
const validateRequestBody = (event, requiredFields = []) => {
    if (!event.body) {
        return {
            isValid: false,
            error: 'Request body is required',
            response: generateResponse(400, { error: 'Request body is required' })
        };
    }

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        return {
            isValid: false,
            error: 'Invalid JSON in request body',
            response: generateResponse(400, { error: 'Invalid JSON in request body' })
        };
    }

    // Check required fields
    const missingFields = requiredFields.filter(field => {
        return body[field] === undefined || body[field] === null || body[field] === '';
    });

    if (missingFields.length > 0) {
        return {
            isValid: false,
            error: `Missing required fields: ${missingFields.join(', ')}`,
            response: generateResponse(400, { 
                error: `Missing required fields: ${missingFields.join(', ')}`,
                missingFields
            })
        };
    }

    return { 
        isValid: true, 
        body 
    };
};

/**
 * Validate query parameters
 */
const validateQueryParams = (event, requiredParams = [], optionalParams = []) => {
    const params = event.queryStringParameters || {};
    const allAllowedParams = [...requiredParams, ...optionalParams];
    
    // Check required parameters
    const missingParams = requiredParams.filter(param => !params[param]);
    
    if (missingParams.length > 0) {
        return {
            isValid: false,
            error: `Missing required query parameters: ${missingParams.join(', ')}`,
            response: generateResponse(400, { 
                error: `Missing required query parameters: ${missingParams.join(', ')}`,
                missingParams
            })
        };
    }

    // Filter out unknown parameters (optional security measure)
    const validParams = {};
    Object.keys(params).forEach(key => {
        if (allAllowedParams.includes(key)) {
            validParams[key] = params[key];
        }
    });

    return { 
        isValid: true, 
        params: validParams 
    };
};

/**
 * Validate string field
 */
const validateString = (value, fieldName, options = {}) => {
    const {
        required = false,
        minLength = 0,
        maxLength = Infinity,
        pattern = null,
        trim = true
    } = options;

    if (required && (value === undefined || value === null)) {
        return {
            isValid: false,
            error: `${fieldName} is required`
        };
    }

    if (value === undefined || value === null) {
        return { isValid: true, value: null };
    }

    if (typeof value !== 'string') {
        return {
            isValid: false,
            error: `${fieldName} must be a string`
        };
    }

    const processedValue = trim ? value.trim() : value;

    if (required && processedValue.length === 0) {
        return {
            isValid: false,
            error: `${fieldName} cannot be empty`
        };
    }

    if (processedValue.length < minLength) {
        return {
            isValid: false,
            error: `${fieldName} must be at least ${minLength} characters long`
        };
    }

    if (processedValue.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} cannot exceed ${maxLength} characters`
        };
    }

    if (pattern && !pattern.test(processedValue)) {
        return {
            isValid: false,
            error: `${fieldName} format is invalid`
        };
    }

    return { 
        isValid: true, 
        value: processedValue 
    };
};

/**
 * Validate email format
 */
const validateEmail = (email, required = false) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return validateString(email, 'Email', {
        required,
        maxLength: 254,
        pattern: emailPattern
    });
};

/**
 * Validate URL format
 */
const validateURL = (url, required = false) => {
    if (!required && (!url || url.trim() === '')) {
        return { isValid: true, value: null };
    }

    if (required && (!url || url.trim() === '')) {
        return {
            isValid: false,
            error: 'URL is required'
        };
    }

    try {
        new URL(url);
        return { isValid: true, value: url.trim() };
    } catch {
        return {
            isValid: false,
            error: 'Invalid URL format'
        };
    }
};

/**
 * Validate date format (YYYY-MM-DD)
 */
const validateDate = (dateString, fieldName = 'Date', required = false) => {
    if (!required && (!dateString || dateString.trim() === '')) {
        return { isValid: true, value: null };
    }

    if (required && (!dateString || dateString.trim() === '')) {
        return {
            isValid: false,
            error: `${fieldName} is required`
        };
    }

    // Check format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return {
            isValid: false,
            error: `${fieldName} must be in YYYY-MM-DD format`
        };
    }

    // Check if it's a valid date
    const date = new Date(dateString);
    if (isNaN(date.getTime()) || date.toISOString().split('T')[0] !== dateString) {
        return {
            isValid: false,
            error: `${fieldName} is not a valid date`
        };
    }

    return { isValid: true, value: dateString };
};

/**
 * Validate time format (HH:MM in 24-hour format)
 */
const validateTime = (timeString, fieldName = 'Time', required = false) => {
    if (!required && (!timeString || timeString.trim() === '')) {
        return { isValid: true, value: null };
    }

    if (required && (!timeString || timeString.trim() === '')) {
        return {
            isValid: false,
            error: `${fieldName} is required`
        };
    }

    // Check format (HH:MM)
    if (!/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
        return {
            isValid: false,
            error: `${fieldName} must be in HH:MM format (24-hour)`
        };
    }

    return { isValid: true, value: timeString };
};

/**
 * Validate date range
 */
const validateDateRange = (startDate, endDate, options = {}) => {
    const { 
        maxDurationDays = 365,
        allowSameDay = true 
    } = options;

    // Validate individual dates first
    const startValidation = validateDate(startDate, 'Start date', true);
    if (!startValidation.isValid) {
        return startValidation;
    }

    const endValidation = validateDate(endDate, 'End date', true);
    if (!endValidation.isValid) {
        return endValidation;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if end date is after start date
    if (end < start) {
        return {
            isValid: false,
            error: 'End date must be after start date'
        };
    }

    // Check if same day is allowed
    if (!allowSameDay && end.getTime() === start.getTime()) {
        return {
            isValid: false,
            error: 'End date must be different from start date'
        };
    }

    // Check maximum duration
    const durationMs = end.getTime() - start.getTime();
    const durationDays = durationMs / (1000 * 60 * 60 * 24);
    
    if (durationDays > maxDurationDays) {
        return {
            isValid: false,
            error: `Date range cannot exceed ${maxDurationDays} days`
        };
    }

    return { 
        isValid: true, 
        startDate, 
        endDate,
        durationDays: Math.ceil(durationDays)
    };
};

/**
 * Validate time range
 */
const validateTimeRange = (startTime, endTime) => {
    // Allow empty time range
    if (!startTime && !endTime) {
        return { isValid: true, startTime: null, endTime: null };
    }

    // If one is provided, both should be provided
    if ((startTime && !endTime) || (!startTime && endTime)) {
        return {
            isValid: false,
            error: 'Both start time and end time must be provided'
        };
    }

    // Validate individual times
    const startValidation = validateTime(startTime, 'Start time', true);
    if (!startValidation.isValid) {
        return startValidation;
    }

    const endValidation = validateTime(endTime, 'End time', true);
    if (!endValidation.isValid) {
        return endValidation;
    }

    // Check if end time is after start time
    if (startTime >= endTime) {
        return {
            isValid: false,
            error: 'End time must be after start time'
        };
    }

    return { 
        isValid: true, 
        startTime, 
        endTime 
    };
};

/**
 * Validate array of IDs
 */
const validateIdArray = (array, fieldName = 'IDs', options = {}) => {
    const {
        required = false,
        maxLength = 100,
        allowEmpty = true
    } = options;

    if (!required && (!array || array.length === 0)) {
        return { isValid: true, value: [] };
    }

    if (required && (!array || array.length === 0)) {
        return {
            isValid: false,
            error: `${fieldName} array is required`
        };
    }

    if (!Array.isArray(array)) {
        return {
            isValid: false,
            error: `${fieldName} must be an array`
        };
    }

    if (!allowEmpty && array.length === 0) {
        return {
            isValid: false,
            error: `${fieldName} array cannot be empty`
        };
    }

    if (array.length > maxLength) {
        return {
            isValid: false,
            error: `${fieldName} array cannot exceed ${maxLength} items`
        };
    }

    // Validate each ID is a string
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'string' || array[i].trim() === '') {
            return {
                isValid: false,
                error: `${fieldName} array item ${i + 1} must be a non-empty string`
            };
        }
    }

    return { 
        isValid: true, 
        value: array.map(id => id.trim()) 
    };
};

/**
 * Validate pagination parameters
 */
const validatePagination = (queryParams) => {
    const { limit = '50', offset = '0' } = queryParams;

    const limitNum = parseInt(limit, 10);
    const offsetNum = parseInt(offset, 10);

    if (isNaN(limitNum) || limitNum < 1) {
        return {
            isValid: false,
            error: 'Limit must be a positive integer'
        };
    }

    if (limitNum > 500) {
        return {
            isValid: false,
            error: 'Limit cannot exceed 500'
        };
    }

    if (isNaN(offsetNum) || offsetNum < 0) {
        return {
            isValid: false,
            error: 'Offset must be a non-negative integer'
        };
    }

    return {
        isValid: true,
        limit: limitNum,
        offset: offsetNum
    };
};

/**
 * Sanitize HTML content (basic implementation)
 */
const sanitizeHtml = (html) => {
    if (typeof html !== 'string') return '';
    
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
};

/**
 * Validate and sanitize user input
 */
const sanitizeUserInput = (input, maxLength = 1000) => {
    if (typeof input !== 'string') return '';
    
    return input
        .trim()
        .substring(0, maxLength)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ''); // Remove control characters
};

module.exports = {
    // Response helpers
    generateResponse,
    
    // Request validation
    validateMethod,
    validateRequestBody,
    validateQueryParams,
    
    // Field validation
    validateString,
    validateEmail,
    validateURL,
    validateDate,
    validateTime,
    validateDateRange,
    validateTimeRange,
    validateIdArray,
    validatePagination,
    
    // Content sanitization
    sanitizeHtml,
    sanitizeUserInput
};