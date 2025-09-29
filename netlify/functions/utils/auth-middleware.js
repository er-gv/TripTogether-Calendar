/**
 * Authentication Middleware for Netlify Functions
 * Validates JWT tokens and provides user context
 */

const jwt = require('jsonwebtoken');
const { getFirestore } = require('./firebase-admin');
const { generateResponse } = require('./validation');

/**
 * Authentication middleware wrapper
 * Validates JWT token and provides user context to the handler
 */
const authMiddleware = (handler) => {
    return async (event, context) => {
        // Handle CORS preflight requests
        if (event.httpMethod === 'OPTIONS') {
            return generateResponse(200, null, {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            });
        }

        try {
            // Extract token from Authorization header
            const authHeader = event.headers.authorization || event.headers.Authorization;
            
            if (!authHeader) {
                return generateResponse(401, { 
                    error: 'No authorization header provided' 
                });
            }

            const token = authHeader.replace(/^Bearer\s+/i, '');
            
            if (!token) {
                return generateResponse(401, { 
                    error: 'No token provided in authorization header' 
                });
            }

            // Verify JWT token
            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (jwtError) {
                if (jwtError.name === 'TokenExpiredError') {
                    return generateResponse(401, { 
                        error: 'Token expired',
                        code: 'TOKEN_EXPIRED'
                    });
                }
                
                if (jwtError.name === 'JsonWebTokenError') {
                    return generateResponse(401, { 
                        error: 'Invalid token',
                        code: 'TOKEN_INVALID'
                    });
                }
                
                throw jwtError;
            }

            // Validate token payload
            const { tripId, memberId, role } = decoded;
            
            if (!tripId || !memberId || !role) {
                return generateResponse(401, { 
                    error: 'Invalid token payload - missing required fields' 
                });
            }

            // Verify user still exists and is active in the trip
            const userValidation = await validateUserInTrip(tripId, memberId, role);
            
            if (!userValidation.isValid) {
                return generateResponse(401, { 
                    error: userValidation.error || 'User validation failed',
                    code: userValidation.code
                });
            }

            // Add user context to event
            event.user = {
                tripId,
                memberId,
                role,
                displayName: decoded.displayName,
                ...userValidation.userData
            };

            // Call the original handler with authenticated user context
            return await handler(event, context);

        } catch (error) {
            console.error('Auth middleware error:', error);
            
            // Don't expose internal errors in production
            const isDevelopment = process.env.NODE_ENV === 'development';
            
            return generateResponse(500, { 
                error: 'Authentication failed',
                message: isDevelopment ? error.message : undefined,
                code: 'AUTH_ERROR'
            });
        }
    };
};

/**
 * Validate that user still exists and is active in the trip
 */
const validateUserInTrip = async (tripId, memberId, role) => {
    try {
        const db = getFirestore();

        // Check if trip exists
        const tripDoc = await db.collection('trips').doc(tripId).get();
        
        if (!tripDoc.exists) {
            return {
                isValid: false,
                error: 'Trip not found',
                code: 'TRIP_NOT_FOUND'
            };
        }

        const tripData = tripDoc.data();

        // Check if user is still in trip roles
        if (!tripData.roles || tripData.roles[memberId] !== role) {
            return {
                isValid: false,
                error: 'User role mismatch or user no longer in trip',
                code: 'ROLE_MISMATCH'
            };
        }

        // Check if member document exists and is active
        const memberDoc = await db.collection('trips').doc(tripId).collection('members').doc(memberId).get();
        
        if (!memberDoc.exists) {
            return {
                isValid: false,
                error: 'Member document not found',
                code: 'MEMBER_NOT_FOUND'
            };
        }

        const memberData = memberDoc.data();

        if (!memberData.isActive) {
            return {
                isValid: false,
                error: 'Member account is deactivated',
                code: 'MEMBER_INACTIVE'
            };
        }

        return {
            isValid: true,
            userData: {
                displayName: memberData.displayName,
                isCreator: memberData.isCreator || false,
                isChild: memberData.isChild || false,
                joinedAt: memberData.joinedAt
            }
        };

    } catch (error) {
        console.error('User validation error:', error);
        return {
            isValid: false,
            error: 'User validation failed',
            code: 'VALIDATION_ERROR'
        };
    }
};

/**
 * Optional middleware for admin-only operations
 * Use this after authMiddleware for admin-only endpoints
 */
const adminOnlyMiddleware = (handler) => {
    return async (event, context) => {
        if (!event.user || event.user.role !== 'admin') {
            return generateResponse(403, { 
                error: 'Administrator access required',
                code: 'ADMIN_REQUIRED'
            });
        }

        return await handler(event, context);
    };
};

/**
 * Rate limiting middleware (simple implementation)
 * Limits requests per user per minute
 */
const rateLimitMiddleware = (maxRequests = 60, windowMinutes = 1) => {
    // In-memory store (in production, use Redis or similar)
    const requestCounts = new Map();
    
    return (handler) => {
        return async (event, context) => {
            if (!event.user) {
                // Apply rate limiting before auth
                return generateResponse(401, { error: 'Authentication required' });
            }

            const userId = `${event.user.tripId}:${event.user.memberId}`;
            const now = Date.now();
            const windowStart = now - (windowMinutes * 60 * 1000);

            // Clean up old entries
            for (const [key, data] of requestCounts.entries()) {
                if (data.windowStart < windowStart) {
                    requestCounts.delete(key);
                }
            }

            // Check current user's request count
            const userRequests = requestCounts.get(userId) || { count: 0, windowStart: now };
            
            if (userRequests.windowStart < windowStart) {
                // New window
                userRequests.count = 1;
                userRequests.windowStart = now;
            } else {
                userRequests.count++;
            }

            if (userRequests.count > maxRequests) {
                return generateResponse(429, { 
                    error: 'Too many requests',
                    retryAfter: Math.ceil((userRequests.windowStart + (windowMinutes * 60 * 1000) - now) / 1000),
                    code: 'RATE_LIMITED'
                });
            }

            requestCounts.set(userId, userRequests);

            return await handler(event, context);
        };
    };
};

/**
 * Request logging middleware
 */
const loggingMiddleware = (handler) => {
    return async (event, context) => {
        const startTime = Date.now();
        const requestId = generateRequestId();
        
        // Log request
        console.log(`[${requestId}] ${event.httpMethod} ${event.path}`, {
            user: event.user ? {
                tripId: event.user.tripId,
                memberId: event.user.memberId,
                role: event.user.role
            } : 'anonymous',
            userAgent: event.headers['user-agent'],
            ip: event.headers['x-forwarded-for'] || 'unknown'
        });

        try {
            const response = await handler(event, context);
            const duration = Date.now() - startTime;
            
            // Log response
            console.log(`[${requestId}] Response ${response.statusCode} (${duration}ms)`);
            
            return response;
        } catch (error) {
            const duration = Date.now() - startTime;
            
            // Log error
            console.error(`[${requestId}] Error after ${duration}ms:`, error);
            
            throw error;
        }
    };
};

/**
 * CORS middleware
 */
const corsMiddleware = (allowedOrigins = ['*']) => {
    return (handler) => {
        return async (event, context) => {
            const origin = event.headers.origin || event.headers.Origin;
            
            let allowOrigin = '*';
            if (allowedOrigins.length > 0 && !allowedOrigins.includes('*')) {
                allowOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
            }

            const response = await handler(event, context);
            
            // Add CORS headers to response
            return {
                ...response,
                headers: {
                    ...response.headers,
                    'Access-Control-Allow-Origin': allowOrigin,
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Max-Age': '86400'
                }
            };
        };
    };
};

/**
 * Combine multiple middlewares
 */
const combineMiddleware = (...middlewares) => {
    return (handler) => {
        return middlewares.reduceRight((wrapped, middleware) => {
            return middleware(wrapped);
        }, handler);
    };
};

/**
 * Generate a unique request ID for logging
 */
const generateRequestId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

/**
 * Extract user info from event (for use in handlers)
 */
const getUserInfo = (event) => {
    return event.user || null;
};

/**
 * Check if user is admin
 */
const isAdmin = (event) => {
    return event.user && event.user.role === 'admin';
};

/**
 * Check if user is trip creator
 */
const isCreator = (event) => {
    return event.user && event.user.isCreator === true;
};

module.exports = {
    // Core middleware
    authMiddleware,
    adminOnlyMiddleware,
    rateLimitMiddleware,
    loggingMiddleware,
    corsMiddleware,
    
    // Utility functions
    combineMiddleware,
    validateUserInTrip,
    getUserInfo,
    isAdmin,
    isCreator,
    generateRequestId
};