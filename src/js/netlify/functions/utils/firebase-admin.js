/**
 * Firebase Admin SDK Configuration
 * Provides Firebase admin instance and Firestore access
 */

const admin = require('firebase-admin');

let app;

/**
 * Get Firebase Admin app instance (singleton)
 */
const getFirebaseAdmin = () => {
    if (!app) {
        try {
            // Check if we have all required environment variables
            const requiredEnvVars = [
                'FIREBASE_PROJECT_ID',
                'FIREBASE_CLIENT_EMAIL',
                'FIREBASE_PRIVATE_KEY'
            ];

            const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
            
            if (missingVars.length > 0) {
                throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
            }

            // Parse the private key (handle escaped newlines from environment variable)
            const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

            const config = {
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: privateKey
                }),
                databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}-default-rtdb.firebaseio.com/`,
                projectId: process.env.FIREBASE_PROJECT_ID
            };

            // Initialize Firebase Admin
            app = admin.initializeApp(config);

            console.log(`Firebase Admin initialized for project: ${process.env.FIREBASE_PROJECT_ID}`);

        } catch (error) {
            console.error('Failed to initialize Firebase Admin:', error);
            throw new Error('Firebase Admin initialization failed');
        }
    }

    return app;
};

/**
 * Get Firestore database instance
 */
const getFirestore = () => {
    try {
        const app = getFirebaseAdmin();
        const db = admin.firestore(app);

        // Configure Firestore settings
        db.settings({
            timestampsInSnapshots: true
        });

        return db;
    } catch (error) {
        console.error('Failed to get Firestore instance:', error);
        throw new Error('Firestore initialization failed');
    }
};

/**
 * Get Firebase Storage instance
 */
const getStorage = () => {
    try {
        const app = getFirebaseAdmin();
        return admin.storage(app);
    } catch (error) {
        console.error('Failed to get Storage instance:', error);
        throw new Error('Storage initialization failed');
    }
};

/**
 * Get Firebase Auth instance
 */
const getAuth = () => {
    try {
        const app = getFirebaseAdmin();
        return admin.auth(app);
    } catch (error) {
        console.error('Failed to get Auth instance:', error);
        throw new Error('Auth initialization failed');
    }
};

/**
 * Verify Firebase connection and permissions
 */
const verifyConnection = async () => {
    try {
        const db = getFirestore();
        
        // Try to read from a test collection to verify connection
        const testRef = db.collection('_health_check').doc('test');
        await testRef.get();
        
        console.log('Firebase connection verified successfully');
        return true;
    } catch (error) {
        console.error('Firebase connection verification failed:', error);
        return false;
    }
};

/**
 * Create a batch write instance
 */
const getBatch = () => {
    try {
        const db = getFirestore();
        return db.batch();
    } catch (error) {
        console.error('Failed to create batch instance:', error);
        throw new Error('Batch creation failed');
    }
};

/**
 * Get server timestamp
 */
const getServerTimestamp = () => {
    return admin.firestore.FieldValue.serverTimestamp();
};

/**
 * Get array union helper
 */
const arrayUnion = (...elements) => {
    return admin.firestore.FieldValue.arrayUnion(...elements);
};

/**
 * Get array remove helper
 */
const arrayRemove = (...elements) => {
    return admin.firestore.FieldValue.arrayRemove(...elements);
};

/**
 * Get increment helper
 */
const increment = (value) => {
    return admin.firestore.FieldValue.increment(value);
};

/**
 * Get delete field helper
 */
const deleteField = () => {
    return admin.firestore.FieldValue.delete();
};

/**
 * Utility function to convert Firestore timestamp to ISO string
 */
const timestampToISO = (timestamp) => {
    if (!timestamp) return null;
    
    if (timestamp._seconds !== undefined) {
        // Firestore timestamp object
        return new Date(timestamp._seconds * 1000).toISOString();
    }
    
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        // Firestore timestamp with toDate method
        return timestamp.toDate().toISOString();
    }
    
    if (timestamp instanceof Date) {
        return timestamp.toISOString();
    }
    
    // Assume it's already a string or handle gracefully
    return timestamp.toString();
};

/**
 * Utility function to safely get document data with error handling
 */
const safeGetDoc = async (docRef) => {
    try {
        const doc = await docRef.get();
        
        if (!doc.exists) {
            return { exists: false, data: null };
        }
        
        return { 
            exists: true, 
            data: doc.data(),
            id: doc.id,
            ref: doc.ref
        };
    } catch (error) {
        console.error('Error getting document:', error);
        throw error;
    }
};

/**
 * Utility function to safely execute a transaction
 */
const safeTransaction = async (callback) => {
    const db = getFirestore();
    
    try {
        return await db.runTransaction(callback);
    } catch (error) {
        console.error('Transaction failed:', error);
        throw error;
    }
};

/**
 * Health check function for monitoring
 */
const healthCheck = async () => {
    try {
        const isConnected = await verifyConnection();
        
        return {
            status: isConnected ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            services: {
                firestore: isConnected,
                admin: !!app
            },
            project: process.env.FIREBASE_PROJECT_ID
        };
    } catch (error) {
        return {
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: error.message,
            services: {
                firestore: false,
                admin: !!app
            }
        };
    }
};

/**
 * Graceful shutdown function
 */
const shutdown = async () => {
    try {
        if (app) {
            await app.delete();
            app = null;
            console.log('Firebase Admin app shut down gracefully');
        }
    } catch (error) {
        console.error('Error during Firebase shutdown:', error);
    }
};

// Handle process termination
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = {
    // Core functions
    getFirebaseAdmin,
    getFirestore,
    getStorage,
    getAuth,
    
    // Utility functions
    verifyConnection,
    getBatch,
    safeGetDoc,
    safeTransaction,
    healthCheck,
    shutdown,
    
    // Firestore helpers
    getServerTimestamp,
    arrayUnion,
    arrayRemove,
    increment,
    deleteField,
    timestampToISO
};
